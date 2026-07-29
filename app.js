:root {
  color-scheme: dark;
  --bg: #05070f;
  --panel: rgba(12, 17, 30, 0.82);
  --panel-strong: rgba(14, 21, 38, 0.96);
  --line: rgba(133, 171, 255, 0.14);
  --cyan: #34e8ff;
  --cyan-soft: #7ceeff;
  --blue: #5187ff;
  --purple: #a066ff;
  --spotify: #1ed760;
  --text: #f5f7ff;
  --muted: #8f9bb6;
  --danger: #ff628c;
  --radius-xl: 28px;
  --radius-lg: 20px;
  --shadow: 0 28px 80px rgba(0, 0, 0, 0.42);
}

* {
  box-sizing: border-box;
}

html {
  min-width: 320px;
  background: var(--bg);
}

body {
  min-height: 100vh;
  margin: 0;
  overflow-x: hidden;
  color: var(--text);
  background:
    linear-gradient(rgba(5, 7, 15, 0.45), rgba(5, 7, 15, 0.95)),
    radial-gradient(circle at 48% -20%, #122858 0, var(--bg) 48%);
  font-family: "Inter", sans-serif;
  -webkit-font-smoothing: antialiased;
}

button,
a {
  font: inherit;
}

a {
  color: inherit;
}

.ambient {
  position: fixed;
  z-index: -2;
  width: 34rem;
  height: 34rem;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.15;
  pointer-events: none;
}

.ambient-one {
  top: 8%;
  left: -12rem;
  background: var(--cyan);
}

.ambient-two {
  right: -13rem;
  bottom: 4%;
  background: var(--purple);
}

.equalizer {
  position: fixed;
  z-index: -1;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  height: 26vh;
  align-items: flex-end;
  gap: 4px;
  padding: 0 1.5vw;
  opacity: 0.08;
  pointer-events: none;
  mask-image: linear-gradient(to bottom, transparent, black);
}

.equalizer span {
  flex: 1;
  min-width: 2px;
  height: var(--bar-height);
  border-radius: 999px 999px 0 0;
  background: linear-gradient(to top, var(--purple), var(--cyan));
  animation: equalize var(--bar-speed) ease-in-out infinite alternate;
  transform-origin: bottom;
}

@keyframes equalize {
  to {
    transform: scaleY(0.28);
    opacity: 0.45;
  }
}

.app-shell {
  width: min(1520px, calc(100% - 48px));
  margin: 0 auto;
  padding: 34px 0 28px;
}

.site-header,
.card-heading,
.panel-heading,
footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.site-header {
  margin-bottom: 26px;
}

.eyebrow,
.section-label {
  margin: 0 0 7px;
  color: var(--cyan-soft);
  font-family: "Orbitron", sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.2em;
}

.site-header h1 {
  margin: 0;
  font-family: "Orbitron", sans-serif;
  font-size: clamp(1.55rem, 2.4vw, 2.65rem);
  letter-spacing: -0.035em;
}

.site-header h1 span {
  color: var(--cyan);
  text-shadow: 0 0 24px rgba(52, 232, 255, 0.48);
}

.connection {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 38px;
  padding: 0 15px;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--muted);
  background: rgba(11, 16, 29, 0.72);
  font-size: 0.78rem;
  font-weight: 600;
}

.connection-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f4b942;
  box-shadow: 0 0 12px currentColor;
}

.connection.online .connection-dot {
  color: var(--spotify);
  background: var(--spotify);
}

.connection.error .connection-dot {
  color: var(--danger);
  background: var(--danger);
}

.dashboard {
  display: grid;
  grid-template-columns: minmax(0, 1.82fr) minmax(340px, 0.88fr);
  gap: 22px;
  align-items: start;
}

.glass {
  border: 1px solid var(--line);
  background: linear-gradient(145deg, rgba(17, 25, 44, 0.9), var(--panel));
  box-shadow: var(--shadow);
  backdrop-filter: blur(24px);
}

.now-card {
  display: grid;
  grid-template-columns: minmax(260px, 0.83fr) minmax(300px, 1.17fr);
  gap: clamp(24px, 3.6vw, 54px);
  padding: clamp(22px, 3vw, 42px);
  border-radius: var(--radius-xl);
}

.cover-wrap {
  position: relative;
  width: 100%;
  min-width: 0;
  aspect-ratio: 1 / 1;
  align-self: start;
  isolation: isolate;
}

.cover-wrap img {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 22px;
  object-fit: cover;
  object-position: center;
  background: #0b1020;
  box-shadow: 0 26px 60px rgba(0, 0, 0, 0.46);
  transition: opacity 0.28s ease, transform 0.28s ease;
}

@supports not (aspect-ratio: 1 / 1) {
  .cover-wrap {
    height: 0;
    padding-bottom: 100%;
  }

  .cover-wrap img {
    position: absolute;
    inset: 0;
  }
}

.cover-wrap img.changing {
  opacity: 0.42;
  transform: scale(0.985);
}

.cover-glow {
  position: absolute;
  z-index: -1;
  inset: 9%;
  border-radius: 30%;
  background: var(--cyan);
  filter: blur(64px);
  opacity: 0.15;
}

.live-badge {
  position: absolute;
  right: 14px;
  bottom: 14px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 11px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(5, 8, 15, 0.82);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
}

.live-badge span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--muted);
}

.live-badge.is-live span {
  background: var(--spotify);
  box-shadow: 0 0 11px var(--spotify);
  animation: pulse-dot 1.2s ease-in-out infinite;
}

.live-badge strong {
  font-family: "Orbitron", sans-serif;
  font-size: 0.58rem;
  letter-spacing: 0.13em;
}

@keyframes pulse-dot {
  50% {
    opacity: 0.45;
    transform: scale(0.72);
  }
}

.now-content {
  min-width: 0;
  align-self: center;
}

.now-content h2 {
  max-width: 16ch;
  margin: 0 0 10px;
  overflow-wrap: anywhere;
  font-family: "Orbitron", sans-serif;
  font-size: clamp(1.7rem, 3vw, 3.3rem);
  line-height: 1.08;
  letter-spacing: -0.045em;
}

.artist-name {
  margin: 0;
  color: var(--cyan);
  font-size: clamp(1rem, 1.4vw, 1.28rem);
  font-weight: 700;
}

.album-name,
.heard-at {
  margin: 9px 0 0;
  color: var(--muted);
  font-size: 0.86rem;
}

.heard-at {
  color: #b6c0d6;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 11px;
  margin-top: 28px;
}

.primary-button,
.ghost-button {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 0 17px;
  border: 1px solid transparent;
  border-radius: 13px;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
  transition: 0.2s ease;
}

.primary-button {
  color: #031008;
  background: var(--spotify);
  box-shadow: 0 12px 30px rgba(30, 215, 96, 0.2);
}

.primary-button svg,
.icon-button svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.ghost-button {
  border-color: var(--line);
  background: rgba(255, 255, 255, 0.03);
}

.primary-button:hover,
.ghost-button:hover,
.icon-button:hover {
  transform: translateY(-2px);
  filter: brightness(1.12);
}

.disabled {
  opacity: 0.45;
  pointer-events: none;
}

.detail-grid {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  padding-top: 3px;
}

.detail-panel {
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: rgba(5, 9, 18, 0.58);
}

.panel-heading {
  gap: 16px;
  margin-bottom: 15px;
}

.panel-heading h3 {
  margin: 0;
  font-size: 0.98rem;
}

.source-label {
  color: var(--muted);
  font-size: 0.66rem;
}

.scroll-area {
  overflow: auto;
  scrollbar-color: rgba(52, 232, 255, 0.36) transparent;
}

.lyrics-content {
  height: 214px;
  padding-right: 7px;
  color: #d7dced;
  font-size: 0.88rem;
  line-height: 1.72;
}

.lyrics-content p {
  margin: 0 0 0.78em;
}

.lyrics-content .muted,
.muted {
  color: var(--muted);
}

.artist-summary {
  height: 214px;
  overflow: auto;
  color: #c5ccdc;
  font-size: 0.84rem;
  line-height: 1.62;
  scrollbar-color: rgba(52, 232, 255, 0.36) transparent;
}

.artist-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.artist-title img {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  object-fit: cover;
}

.artist-title strong {
  display: block;
  margin-bottom: 4px;
  color: var(--text);
}

.artist-title a {
  color: var(--cyan);
  font-size: 0.72rem;
  text-decoration: none;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 13px;
}

.tag {
  padding: 5px 8px;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: #b7c0d7;
  background: rgba(81, 135, 255, 0.07);
  font-size: 0.66rem;
}

.artist-bio {
  margin: 0;
}

.side-column {
  display: grid;
  gap: 22px;
}

.list-card {
  overflow: hidden;
  border-radius: var(--radius-xl);
}

.card-heading {
  padding: 22px 22px 18px;
  border-bottom: 1px solid var(--line);
}

.card-heading h2 {
  margin: 0;
  font-family: "Orbitron", sans-serif;
  font-size: 1.14rem;
}

.counter {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 11px;
  color: var(--cyan);
  background: rgba(52, 232, 255, 0.06);
  font-family: "Orbitron", sans-serif;
  font-size: 0.73rem;
}

.icon-button {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 12px;
  color: var(--cyan);
  background: rgba(52, 232, 255, 0.05);
  cursor: pointer;
  transition: 0.2s ease;
}

.icon-button.loading svg {
  animation: spin 0.85s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.track-list {
  max-height: 405px;
  margin: 0;
  overflow-y: auto;
  padding: 7px 14px 14px;
  list-style: none;
  scrollbar-color: rgba(52, 232, 255, 0.25) transparent;
}

.track-row {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 11px 7px;
  border-bottom: 1px solid rgba(133, 171, 255, 0.08);
}

.track-row:last-child {
  border-bottom: 0;
}

.track-position,
.track-time {
  color: var(--muted);
  font-family: "Orbitron", sans-serif;
  font-size: 0.65rem;
}

.track-position {
  color: var(--cyan);
}

.track-copy {
  min-width: 0;
}

.track-copy strong,
.track-copy span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-copy strong {
  margin-bottom: 4px;
  font-size: 0.8rem;
}

.track-copy span {
  color: var(--muted);
  font-size: 0.71rem;
}

.track-link {
  color: inherit;
  text-decoration: none;
}

.track-link:hover strong {
  color: var(--cyan);
}

.play-count {
  color: #b5bfd5;
  font-size: 0.65rem;
}

.recent-list .track-row:first-child {
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(52, 232, 255, 0.08), transparent);
}

.loading-row,
.empty-row {
  padding: 24px 8px;
  color: var(--muted);
  font-size: 0.78rem;
  text-align: center;
}

footer {
  gap: 20px;
  padding: 18px 3px 0;
  color: #65708a;
  font-size: 0.68rem;
}

footer p {
  margin: 0;
}

.toast {
  position: fixed;
  z-index: 10;
  right: 20px;
  bottom: 20px;
  max-width: min(380px, calc(100vw - 40px));
  padding: 13px 16px;
  border: 1px solid rgba(255, 98, 140, 0.28);
  border-radius: 13px;
  color: #ffd5e1;
  background: rgba(41, 12, 24, 0.94);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.42);
  font-size: 0.78rem;
  opacity: 0;
  pointer-events: none;
  transform: translateY(12px);
  transition: 0.22s ease;
}

.toast.visible {
  opacity: 1;
  transform: translateY(0);
}

:focus-visible {
  outline: 3px solid rgba(52, 232, 255, 0.62);
  outline-offset: 3px;
}

@media (max-width: 1080px) {
  .dashboard {
    grid-template-columns: 1fr;
  }

  .side-column {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 760px) {
  .app-shell {
    width: min(100% - 24px, 680px);
    padding-top: 20px;
  }

  .site-header {
    align-items: flex-start;
  }

  .connection {
    min-height: 34px;
    padding: 0 11px;
  }

  .connection #connection-text {
    display: none;
  }

  .now-card {
    grid-template-columns: 1fr;
    padding: 16px;
    border-radius: 22px;
  }

  .cover-wrap {
    width: min(100%, 440px);
    margin: 0 auto;
  }

  .now-content {
    padding: 2px 5px 4px;
  }

  .now-content h2 {
    max-width: none;
  }

  .detail-grid,
  .side-column {
    grid-template-columns: 1fr;
  }

  .lyrics-content,
  .artist-summary {
    height: auto;
    max-height: 300px;
  }
}

@media (max-width: 460px) {
  .eyebrow {
    max-width: 190px;
    line-height: 1.5;
  }

  .actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .primary-button,
  .ghost-button {
    width: 100%;
  }

  footer {
    display: block;
    line-height: 1.8;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
