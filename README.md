import app as spotify_app


def sample_recent_payload():
    return {
        "recenttracks": {
            "track": [
                {
                    "name": "Golden",
                    "artist": {"#text": "HUNTR/X"},
                    "album": {"#text": "KPop Demon Hunters"},
                    "mbid": "",
                    "url": "https://www.last.fm/music/HUNTR%2FX/_/Golden",
                    "image": [{"#text": ""}],
                    "@attr": {"nowplaying": "true"},
                },
                {
                    "name": "Ordinary",
                    "artist": {"#text": "Alex Warren"},
                    "album": {"#text": "You'll Be Alright, Kid"},
                    "url": "https://www.last.fm/music/Alex+Warren/_/Ordinary",
                    "date": {"uts": "1700000000"},
                    "image": [{"#text": "https://example.com/cover.jpg"}],
                },
            ]
        }
    }


def sample_top_payload():
    return {
        "toptracks": {
            "track": [
                {
                    "name": "Golden",
                    "artist": {"name": "HUNTR/X"},
                    "playcount": "12",
                    "url": "https://www.last.fm/music/HUNTR%2FX/_/Golden",
                }
            ]
        }
    }


def test_dashboard_normalises_lastfm_data(monkeypatch):
    spotify_app._cache.clear()

    def fake_lastfm(method, **_params):
        if method == "user.getrecenttracks":
            return sample_recent_payload()
        if method == "user.gettoptracks":
            return sample_top_payload()
        raise AssertionError(method)

    monkeypatch.setattr(spotify_app, "_lastfm", fake_lastfm)
    monkeypatch.setattr(
        spotify_app,
        "_itunes_cover",
        lambda _artist, _track: "https://example.com/itunes.jpg",
    )

    client = spotify_app.app.test_client()
    response = client.get("/api/dashboard")

    assert response.status_code == 200
    data = response.get_json()
    assert data["current"]["name"] == "Golden"
    assert data["current"]["now_playing"] is True
    assert data["current"]["cover"] == "https://example.com/itunes.jpg"
    assert data["recent"][1]["timestamp"] == 1700000000
    assert data["top"][0]["playcount"] == 12


def test_artist_rejects_missing_query():
    client = spotify_app.app.test_client()
    response = client.get("/api/artist")
    assert response.status_code == 400
    assert "error" in response.get_json()


def test_lyrics_rejects_oversized_query():
    client = spotify_app.app.test_client()
    response = client.get(f"/api/lyrics?artist={'a' * 161}&track=Music")
    assert response.status_code == 400


def test_synced_lyrics_are_converted_to_plain_lines():
    synced = "[00:01.00]Primeira linha\n[00:05.25]Segunda linha"
    assert spotify_app._plain_synced_lyrics(synced) == [
        "Primeira linha",
        "Segunda linha",
    ]


def test_security_headers_are_present():
    client = spotify_app.app.test_client()
    response = client.get("/")
    assert response.status_code == 200
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert "default-src 'self'" in response.headers["Content-Security-Policy"]


def test_health_does_not_expose_api_key():
    client = spotify_app.app.test_client()
    response = client.get("/api/health")
    data = response.get_json()
    assert data["ok"] is True
    assert "api_key" not in data
