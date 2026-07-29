# Rui Cirilo · Última música ouvida no Spotify

Painel web futurista que mostra a música atual ou a última música ouvida no
Spotify, usando os scrobbles da conta Last.fm `ruicirilo`.

## O que inclui

- música em reprodução e indicação **A ouvir agora**;
- capa do iTunes em alta resolução, com fallback automático do Last.fm;
- últimas 10 músicas ouvidas;
- Top 10 dos últimos 7 dias;
- letras via LRCLIB, com fallback para Lyrics.ovh;
- biografia e géneros do artista;
- atualização automática a cada 20 segundos;
- interface responsiva para computador, telemóvel e televisão;
- API protegida com timeouts, cache e cabeçalhos de segurança.

> O Spotify deve estar ligado ao Last.fm para que as músicas sejam registadas.
> A aplicação lê esses registos; não acede à palavra-passe nem à conta Spotify.

## Executar no Windows

No PowerShell, dentro da pasta do projeto:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python app.py
```

Abrir `http://127.0.0.1:5000`.

## Configuração

As variáveis são opcionais porque o projeto mantém a configuração atual como
fallback:

```env
LASTFM_USERNAME=ruicirilo
LASTFM_API_KEY=a_tua_chave_lastfm
REQUEST_TIMEOUT=8
APP_USER_AGENT=Spotify-Now-Playing/2.0
```

Na Vercel, podem ser adicionadas em **Project Settings → Environment
Variables**. Depois é necessário fazer um novo deploy.

## Endpoints

| Endpoint | Função |
| --- | --- |
| `/api/dashboard` | música atual, histórico e Top 10 |
| `/api/lyrics?artist=...&track=...` | letra da música |
| `/api/artist?artist=...` | informação do artista |
| `/api/health` | estado da aplicação |

Os antigos endpoints `/lyrics` e `/artist` continuam disponíveis para manter
compatibilidade.

## Testes

```powershell
python -m pip install -r requirements-dev.txt
python -m pytest -q
```

## Publicar na Vercel

O projeto usa Flask em `app.py` e inclui `vercel.json`. Ao ligar este
repositório à Vercel, cada alteração em `main` cria automaticamente um novo
deploy.
