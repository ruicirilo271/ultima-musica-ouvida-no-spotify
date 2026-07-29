"""Painel da última música ouvida no Spotify através dos scrobbles do Last.fm."""

from __future__ import annotations

import os
import re
import time
from threading import Lock
from typing import Any, Callable
from urllib.parse import quote

import requests
from bs4 import BeautifulSoup
from flask import Flask, jsonify, render_template, request


app = Flask(__name__)

LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/"
LRCLIB_API_URL = "https://lrclib.net/api/search"
LYRICS_OVH_API_URL = "https://api.lyrics.ovh/v1"
ITUNES_API_URL = "https://itunes.apple.com/search"

# A variável de ambiente tem prioridade. O valor existente mantém os deploys
# antigos funcionais; pode ser substituído sem alterar o código.
LASTFM_API_KEY = os.getenv("LASTFM_API_KEY", "6e7c0a29cd508f42a6737e5fd3d6110b")
LASTFM_USERNAME = os.getenv("LASTFM_USERNAME", "ruicirilo")
REQUEST_TIMEOUT = float(os.getenv("REQUEST_TIMEOUT", "8"))
DEFAULT_COVER = "/static/default-cover.svg"

http = requests.Session()
http.headers.update(
    {
        "User-Agent": os.getenv(
            "APP_USER_AGENT",
            "Spotify-Now-Playing/2.0 (https://github.com/ruicirilo271/"
            "ultima-musica-ouvida-no-spotify)",
        )
    }
)

_cache: dict[str, tuple[float, Any]] = {}
_cache_lock = Lock()


class UpstreamError(RuntimeError):
    """Erro controlado ao consultar um serviço externo."""


def _cached(key: str, ttl: int, loader: Callable[[], Any]) -> Any:
    now = time.monotonic()
    with _cache_lock:
        cached = _cache.get(key)
        if cached and cached[0] > now:
            return cached[1]

    value = loader()
    with _cache_lock:
        _cache[key] = (now + ttl, value)
    return value


def _json_get(url: str, *, params: dict[str, Any] | None = None) -> Any:
    try:
        response = http.get(url, params=params, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        return response.json()
    except (requests.RequestException, ValueError) as exc:
        raise UpstreamError("Um serviço de música não respondeu corretamente.") from exc


def _lastfm(method: str, **params: Any) -> dict[str, Any]:
    payload = _json_get(
        LASTFM_API_URL,
        params={
            "method": method,
            "api_key": LASTFM_API_KEY,
            "format": "json",
            **params,
        },
    )
    if not isinstance(payload, dict):
        raise UpstreamError("O Last.fm devolveu uma resposta inválida.")
    if payload.get("error"):
        raise UpstreamError(str(payload.get("message") or "Erro devolvido pelo Last.fm."))
    return payload


def _as_list(value: Any) -> list[Any]:
    if isinstance(value, list):
        return value
    if isinstance(value, dict):
        return [value]
    return []


def _text(value: Any) -> str:
    return str(value or "").strip()


def _largest_image(images: Any) -> str:
    for image in reversed(_as_list(images)):
        if isinstance(image, dict) and _text(image.get("#text")):
            return _text(image["#text"])
    return ""


def _normalise_artist(track: dict[str, Any]) -> str:
    artist = track.get("artist")
    if isinstance(artist, dict):
        return _text(artist.get("#text") or artist.get("name"))
    return _text(artist)


def _normalise_track(track: dict[str, Any]) -> dict[str, Any]:
    artist = _normalise_artist(track)
    name = _text(track.get("name"))
    album_data = track.get("album")
    album = (
        _text(album_data.get("#text"))
        if isinstance(album_data, dict)
        else _text(album_data)
    )
    date_data = track.get("date")
    timestamp = None
    if isinstance(date_data, dict) and _text(date_data.get("uts")).isdigit():
        timestamp = int(date_data["uts"])

    now_playing = (
        isinstance(track.get("@attr"), dict)
        and track["@attr"].get("nowplaying") == "true"
    )
    search = quote(f"{artist} {name}", safe="")

    return {
        "id": _text(track.get("mbid")) or f"{artist}::{name}",
        "name": name,
        "artist": artist,
        "album": album,
        "cover": _largest_image(track.get("image")) or DEFAULT_COVER,
        "now_playing": now_playing,
        "timestamp": timestamp,
        "lastfm_url": _text(track.get("url")),
        "spotify_url": f"https://open.spotify.com/search/{search}",
    }


def _itunes_cover(artist: str, track: str) -> str:
    if not artist or not track:
        return ""

    cache_key = f"itunes:{artist.casefold()}:{track.casefold()}"

    def load() -> str:
        try:
            data = _json_get(
                ITUNES_API_URL,
                params={
                    "term": f"{artist} {track}",
                    "entity": "song",
                    "limit": 5,
                    "country": "PT",
                },
            )
        except UpstreamError:
            return ""

        for result in _as_list(data.get("results") if isinstance(data, dict) else None):
            if not isinstance(result, dict):
                continue
            artwork = _text(result.get("artworkUrl100"))
            if artwork:
                return artwork.replace("100x100bb", "600x600bb")
        return ""

    return _cached(cache_key, 21_600, load)


def _dashboard_data() -> dict[str, Any]:
    recent_payload = _cached(
        "lastfm:recent",
        12,
        lambda: _lastfm(
            "user.getrecenttracks",
            user=LASTFM_USERNAME,
            limit=10,
            extended=1,
        ),
    )
    top_payload = _cached(
        "lastfm:top:7day",
        300,
        lambda: _lastfm(
            "user.gettoptracks",
            user=LASTFM_USERNAME,
            period="7day",
            limit=10,
        ),
    )

    recent_raw = _as_list(
        recent_payload.get("recenttracks", {}).get("track")
        if isinstance(recent_payload.get("recenttracks"), dict)
        else None
    )
    recent = [
        _normalise_track(track) for track in recent_raw if isinstance(track, dict)
    ]

    current = recent[0] if recent else None
    if current and current["cover"] == DEFAULT_COVER:
        current["cover"] = (
            _itunes_cover(current["artist"], current["name"]) or DEFAULT_COVER
        )

    top_raw = _as_list(
        top_payload.get("toptracks", {}).get("track")
        if isinstance(top_payload.get("toptracks"), dict)
        else None
    )
    top = []
    for position, track in enumerate(top_raw, start=1):
        if not isinstance(track, dict):
            continue
        top.append(
            {
                "position": position,
                "name": _text(track.get("name")),
                "artist": _normalise_artist(track),
                "playcount": int(_text(track.get("playcount")) or 0),
                "url": _text(track.get("url")),
            }
        )

    return {
        "username": LASTFM_USERNAME,
        "current": current,
        "recent": recent,
        "top": top,
        "updated_at": int(time.time()),
        "refresh_after": 20,
    }


def _clean_summary(summary: str) -> str:
    clean = BeautifulSoup(summary or "", "html.parser").get_text(" ", strip=True)
    clean = re.sub(r"\s*Read more on Last\.fm\s*$", "", clean, flags=re.IGNORECASE)
    return clean[:1200]


def _artist_data(artist: str) -> dict[str, Any]:
    cache_key = f"artist:{artist.casefold()}"

    def load() -> dict[str, Any]:
        payload = _lastfm(
            "artist.getinfo",
            artist=artist,
            username=LASTFM_USERNAME,
            autocorrect=1,
        )
        info = payload.get("artist")
        if not isinstance(info, dict):
            return {"name": artist, "bio": "", "tags": [], "image": "", "url": ""}

        tags_data = info.get("tags")
        tags = []
        if isinstance(tags_data, dict):
            for tag in _as_list(tags_data.get("tag"))[:6]:
                if isinstance(tag, dict) and _text(tag.get("name")):
                    tags.append(_text(tag["name"]))

        bio_data = info.get("bio")
        summary = (
            _text(bio_data.get("summary")) if isinstance(bio_data, dict) else ""
        )
        return {
            "name": _text(info.get("name")) or artist,
            "bio": _clean_summary(summary),
            "tags": tags,
            "image": _largest_image(info.get("image")),
            "url": _text(info.get("url")),
        }

    return _cached(cache_key, 3600, load)


def _plain_synced_lyrics(synced: str) -> list[str]:
    lines = []
    for raw_line in synced.splitlines():
        line = re.sub(r"(?:\[\d{1,3}:\d{2}(?:\.\d{1,3})?\])+", "", raw_line)
        line = line.strip()
        if line:
            lines.append(line)
    return lines


def _lyrics_data(artist: str, track: str) -> dict[str, Any]:
    cache_key = f"lyrics:{artist.casefold()}:{track.casefold()}"

    def load() -> dict[str, Any]:
        try:
            matches = _json_get(
                LRCLIB_API_URL,
                params={"artist_name": artist, "track_name": track},
            )
            for match in _as_list(matches):
                if not isinstance(match, dict):
                    continue
                plain = _text(match.get("plainLyrics"))
                synced = _text(match.get("syncedLyrics"))
                lines = (
                    [line.strip() for line in plain.splitlines() if line.strip()]
                    if plain
                    else _plain_synced_lyrics(synced)
                )
                if lines:
                    return {
                        "lines": lines[:300],
                        "source": "LRCLIB",
                        "instrumental": False,
                    }
                if match.get("instrumental") is True:
                    return {
                        "lines": ["Esta faixa é instrumental."],
                        "source": "LRCLIB",
                        "instrumental": True,
                    }
        except UpstreamError:
            pass

        try:
            payload = _json_get(
                f"{LYRICS_OVH_API_URL}/{quote(artist, safe='')}/{quote(track, safe='')}"
            )
            lyrics = _text(payload.get("lyrics") if isinstance(payload, dict) else "")
            lines = [line.strip() for line in lyrics.splitlines() if line.strip()]
            if lines:
                return {
                    "lines": lines[:300],
                    "source": "Lyrics.ovh",
                    "instrumental": False,
                }
        except UpstreamError:
            pass

        return {
            "lines": ["Letra não encontrada para esta música."],
            "source": None,
            "instrumental": False,
        }

    return _cached(cache_key, 86_400, load)


def _query_value(name: str) -> str:
    value = _text(request.args.get(name))
    if not value or len(value) > 160:
        raise ValueError(f"Parâmetro '{name}' inválido.")
    return value


@app.get("/")
def index():
    return render_template("index.html", username=LASTFM_USERNAME)


@app.get("/api/dashboard")
def dashboard():
    return jsonify(_dashboard_data())


@app.get("/api/artist")
@app.get("/artist")
def artist_info():
    try:
        artist = _query_value("artist")
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify(_artist_data(artist))


@app.get("/api/lyrics")
@app.get("/lyrics")
def lyrics():
    try:
        artist = _query_value("artist")
        track = _query_value("track")
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify(_lyrics_data(artist, track))


@app.get("/api/health")
def health():
    return jsonify(
        {
            "ok": True,
            "lastfm_configured": bool(LASTFM_API_KEY and LASTFM_USERNAME),
            "username": LASTFM_USERNAME,
        }
    )


@app.errorhandler(UpstreamError)
def upstream_error(error: UpstreamError):
    return jsonify({"error": str(error)}), 502


@app.after_request
def add_security_headers(response):
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault(
        "Permissions-Policy", "camera=(), microphone=(), geolocation=()"
    )
    response.headers.setdefault(
        "Content-Security-Policy",
        "default-src 'self'; "
        "img-src 'self' data: https:; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "script-src 'self'; "
        "connect-src 'self'; "
        "frame-ancestors 'none';",
    )
    if request.path.startswith("/api/"):
        response.headers.setdefault("Cache-Control", "no-store")
    return response


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=os.getenv("FLASK_DEBUG") == "1")
