"use strict";

const DEFAULT_COVER = "/static/default-cover.svg";
const state = {
  currentTrackId: null,
  loading: false,
  timer: null,
  toastTimer: null,
};

const elements = {
  albumCover: document.querySelector("#album-cover"),
  trackName: document.querySelector("#track-name"),
  artistName: document.querySelector("#artist-name"),
  albumName: document.querySelector("#album-name"),
  heardAt: document.querySelector("#heard-at"),
  liveBadge: document.querySelector("#live-badge"),
  liveLabel: document.querySelector("#live-label"),
  spotifyLink: document.querySelector("#spotify-link"),
  lastfmLink: document.querySelector("#lastfm-link"),
  lyrics: document.querySelector("#lyrics"),
  lyricsSource: document.querySelector("#lyrics-source"),
  artistInfo: document.querySelector("#artist-info"),
  topTracks: document.querySelector("#top-tracks"),
  recentTracks: document.querySelector("#recent-tracks"),
  connection: document.querySelector("#connection"),
  connectionText: document.querySelector("#connection-text"),
  refreshButton: document.querySelector("#refresh-button"),
  lastUpdate: document.querySelector("#last-update"),
  toast: document.querySelector("#toast"),
  equalizer: document.querySelector("#equalizer"),
};

function textElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

async function fetchJSON(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Pedido recusado (${response.status})`);
  }
  return payload;
}

function setConnection(mode, label) {
  elements.connection.classList.remove("online", "error");
  if (mode) elements.connection.classList.add(mode);
  elements.connectionText.textContent = label;
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(
    () => elements.toast.classList.remove("visible"),
    4500,
  );
}

function setLink(link, url) {
  if (url) {
    link.href = url;
    link.classList.remove("disabled");
    link.setAttribute("aria-disabled", "false");
  } else {
    link.href = "#";
    link.classList.add("disabled");
    link.setAttribute("aria-disabled", "true");
  }
}

function relativeTime(timestamp) {
  if (!timestamp) return "";
  const seconds = timestamp - Math.floor(Date.now() / 1000);
  const formatter = new Intl.RelativeTimeFormat("pt-PT", { numeric: "auto" });
  if (Math.abs(seconds) < 60) return formatter.format(seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");
  return formatter.format(Math.round(hours / 24), "day");
}

function compactNumber(value) {
  return new Intl.NumberFormat("pt-PT", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function renderCurrent(track) {
  if (!track) {
    elements.trackName.textContent = "Ainda não existem músicas no histórico";
    elements.artistName.textContent = "Liga o Spotify ao Last.fm para começar";
    elements.albumName.textContent = "";
    elements.heardAt.textContent = "";
    elements.liveLabel.textContent = "SEM DADOS";
    elements.liveBadge.classList.remove("is-live");
    elements.albumCover.src = DEFAULT_COVER;
    setLink(elements.spotifyLink, "");
    setLink(elements.lastfmLink, "");
    return;
  }

  const changed = state.currentTrackId !== track.id;
  state.currentTrackId = track.id;

  elements.trackName.textContent = track.name || "Título desconhecido";
  elements.artistName.textContent = track.artist || "Artista desconhecido";
  elements.albumName.textContent = track.album ? `Álbum · ${track.album}` : "";
  elements.heardAt.textContent = track.now_playing
    ? "O Spotify está a reproduzir esta faixa"
    : `Ouvida ${relativeTime(track.timestamp)}`;
  elements.liveLabel.textContent = track.now_playing
    ? "A OUVIR AGORA"
    : "ÚLTIMA OUVIDA";
  elements.liveBadge.classList.toggle("is-live", track.now_playing);
  setLink(elements.spotifyLink, track.spotify_url);
  setLink(elements.lastfmLink, track.lastfm_url);

  if (changed) {
    elements.albumCover.classList.add("changing");
    const nextCover = new Image();
    nextCover.onload = () => {
      elements.albumCover.src = nextCover.src;
      elements.albumCover.alt = `Capa de ${track.name}, de ${track.artist}`;
      elements.albumCover.classList.remove("changing");
    };
    nextCover.onerror = () => {
      elements.albumCover.src = DEFAULT_COVER;
      elements.albumCover.classList.remove("changing");
    };
    nextCover.src = track.cover || DEFAULT_COVER;
    loadDetails(track);
  }
}

function trackAnchor(url, name, artist) {
  const wrapper = url ? document.createElement("a") : document.createElement("div");
  if (url) {
    wrapper.href = url;
    wrapper.target = "_blank";
    wrapper.rel = "noopener noreferrer";
    wrapper.className = "track-link";
  }
  const copy = textElement("div", "track-copy", "");
  copy.append(
    textElement("strong", "", name || "Título desconhecido"),
    textElement("span", "", artist || "Artista desconhecido"),
  );
  wrapper.append(copy);
  return wrapper;
}

function renderTop(tracks) {
  elements.topTracks.replaceChildren();
  if (!tracks.length) {
    elements.topTracks.append(
      textElement("li", "empty-row", "Ainda não há um top semanal."),
    );
    return;
  }

  for (const track of tracks) {
    const row = textElement("li", "track-row", "");
    row.append(
      textElement("span", "track-position", String(track.position).padStart(2, "0")),
      trackAnchor(track.url, track.name, track.artist),
      textElement("span", "play-count", `${compactNumber(track.playcount)}×`),
    );
    elements.topTracks.append(row);
  }
}

function renderRecent(tracks) {
  elements.recentTracks.replaceChildren();
  if (!tracks.length) {
    elements.recentTracks.append(
      textElement("li", "empty-row", "Ainda não há músicas no histórico."),
    );
    return;
  }

  for (const [index, track] of tracks.entries()) {
    const row = textElement("li", "track-row", "");
    const marker = track.now_playing ? "LIVE" : String(index + 1).padStart(2, "0");
    const time = track.now_playing ? "agora" : relativeTime(track.timestamp);
    row.append(
      textElement("span", "track-position", marker),
      trackAnchor(track.lastfm_url, track.name, track.artist),
      textElement("time", "track-time", time),
    );
    elements.recentTracks.append(row);
  }
}

function renderLyrics(data) {
  elements.lyrics.replaceChildren();
  elements.lyricsSource.textContent = data.source ? `Fonte: ${data.source}` : "";
  const lines = Array.isArray(data.lines) ? data.lines : [];
  if (!lines.length) {
    elements.lyrics.append(
      textElement("p", "muted", "Letra não encontrada para esta música."),
    );
    return;
  }
  for (const line of lines) {
    elements.lyrics.append(textElement("p", "", line));
  }
  elements.lyrics.scrollTop = 0;
}

function renderArtist(data) {
  elements.artistInfo.replaceChildren();
  const summary = textElement("div", "artist-summary", "");
  const title = textElement("div", "artist-title", "");

  if (data.image) {
    const image = document.createElement("img");
    image.src = data.image;
    image.alt = `Fotografia de ${data.name}`;
    image.loading = "lazy";
    title.append(image);
  }

  const titleCopy = document.createElement("div");
  titleCopy.append(textElement("strong", "", data.name || "Artista"));
  if (data.url) {
    const link = textElement("a", "", "Perfil no Last.fm ↗");
    link.href = data.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    titleCopy.append(link);
  }
  title.append(titleCopy);
  summary.append(title);

  if (Array.isArray(data.tags) && data.tags.length) {
    const tagList = textElement("div", "tag-list", "");
    for (const tag of data.tags) {
      tagList.append(textElement("span", "tag", tag));
    }
    summary.append(tagList);
  }

  summary.append(
    textElement(
      "p",
      data.bio ? "artist-bio" : "artist-bio muted",
      data.bio || "Não há uma biografia disponível para este artista.",
    ),
  );
  elements.artistInfo.append(summary);
}

async function loadDetails(track) {
  const artist = encodeURIComponent(track.artist);
  const name = encodeURIComponent(track.name);
  elements.lyrics.replaceChildren(
    textElement("p", "muted", "A procurar a letra…"),
  );
  elements.artistInfo.replaceChildren(
    textElement("p", "muted", "A procurar informação do artista…"),
  );
  elements.lyricsSource.textContent = "";

  const [lyricsResult, artistResult] = await Promise.allSettled([
    fetchJSON(`/api/lyrics?artist=${artist}&track=${name}`),
    fetchJSON(`/api/artist?artist=${artist}`),
  ]);

  if (lyricsResult.status === "fulfilled") {
    renderLyrics(lyricsResult.value);
  } else {
    renderLyrics({ lines: ["Não foi possível carregar a letra."], source: null });
  }

  if (artistResult.status === "fulfilled") {
    renderArtist(artistResult.value);
  } else {
    renderArtist({
      name: track.artist,
      bio: "Não foi possível carregar a informação do artista.",
      tags: [],
      image: "",
      url: "",
    });
  }
}

async function refreshDashboard({ manual = false } = {}) {
  if (state.loading || (document.hidden && !manual)) return;
  state.loading = true;
  elements.refreshButton.classList.add("loading");
  setConnection("", "A atualizar…");

  try {
    const data = await fetchJSON("/api/dashboard");
    renderCurrent(data.current);
    renderTop(Array.isArray(data.top) ? data.top : []);
    renderRecent(Array.isArray(data.recent) ? data.recent : []);
    const updated = new Date((data.updated_at || Date.now() / 1000) * 1000);
    elements.lastUpdate.textContent = `Atualizado às ${updated.toLocaleTimeString(
      "pt-PT",
      { hour: "2-digit", minute: "2-digit", second: "2-digit" },
    )}`;
    setConnection("online", data.current?.now_playing ? "Spotify ativo" : "Ligação ativa");
  } catch (error) {
    setConnection("error", "Falha na atualização");
    showToast(error.message || "Não foi possível atualizar a aplicação.");
  } finally {
    state.loading = false;
    elements.refreshButton.classList.remove("loading");
  }
}

function createEqualizer() {
  const count = Math.min(110, Math.max(40, Math.floor(window.innerWidth / 14)));
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < count; index += 1) {
    const bar = document.createElement("span");
    bar.style.setProperty("--bar-height", `${20 + Math.random() * 80}%`);
    bar.style.setProperty("--bar-speed", `${0.7 + Math.random() * 1.4}s`);
    fragment.append(bar);
  }
  elements.equalizer.replaceChildren(fragment);
}

let resizeTimer;
window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(createEqualizer, 180);
});

elements.albumCover.addEventListener("error", () => {
  if (!elements.albumCover.src.endsWith(DEFAULT_COVER)) {
    elements.albumCover.src = DEFAULT_COVER;
  }
});
elements.refreshButton.addEventListener("click", () =>
  refreshDashboard({ manual: true }),
);
window.addEventListener("online", () => refreshDashboard({ manual: true }));
window.addEventListener("offline", () => setConnection("error", "Sem internet"));
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) refreshDashboard({ manual: true });
});

createEqualizer();
refreshDashboard({ manual: true });
state.timer = window.setInterval(refreshDashboard, 20_000);
