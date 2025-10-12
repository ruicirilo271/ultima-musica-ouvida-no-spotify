from flask import Flask, request, jsonify, send_file
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

GENIUS_TOKEN = 'vXBJB0QUBQFqQ50N3ytHygmmA0PQ7p4Dvk8_B39gP0kElZ22-5j2CHThsbbgptVX'
LASTFM_API_KEY = '6e7c0a29cd508f42a6737e5fd3d6110b'
USERNAME = 'ruicirilo'

@app.route('/')
def index():
    return send_file('index.html')

# Função para buscar letra no Genius
def lyrics_genius(artist, track):
    try:
        search = requests.get(
            f'https://api.genius.com/search?q={artist}+{track}',
            headers={'Authorization': f'Bearer {GENIUS_TOKEN}'},
            timeout=10
        ).json()

        hits = search.get('response', {}).get('hits', [])
        if not hits:
            return None

        url_path = hits[0]['result']['url']
        page = requests.get(url_path, timeout=10).text
        soup = BeautifulSoup(page, 'html.parser')
        lyrics_divs = soup.find_all('div', {'data-lyrics-container':'true'})
        lines = []
        for div in lyrics_divs:
            for br in div.find_all('br'):
                br.replace_with("\n")
            text = div.get_text(separator="\n").strip()
            for idx, line in enumerate(text.split("\n")):
                if line.strip():
                    lines.append({"text": line.strip(), "time": idx*3000})
        return lines if lines else None
    except:
        return None

# Função para buscar letra no lyrics.io
def lyrics_lyricsio(artist, track):
    try:
        search_url = f'https://www.lyrics.io/search/{artist} {track}'
        headers = {"User-Agent": "Mozilla/5.0"}
        search_page = requests.get(search_url, headers=headers, timeout=10)
        soup = BeautifulSoup(search_page.text, 'html.parser')
        link = soup.find('a', {'class': 'lyrics-link'})
        if not link or not link.get('href'):
            return None
        lyrics_page = requests.get(link.get('href'), headers=headers, timeout=10)
        soup2 = BeautifulSoup(lyrics_page.text, 'html.parser')
        lyrics_div = soup2.find('div', {'class': 'lyrics-text'})
        if not lyrics_div:
            return None
        text = lyrics_div.get_text(separator="\n").strip()
        lines = [{"text": line.strip(), "time": idx*3000} for idx, line in enumerate(text.split("\n")) if line.strip()]
        return lines if lines else None
    except:
        return None

@app.route('/lyrics')
def lyrics():
    artist = request.args.get('artist')
    track = request.args.get('track')

    # Primeiro tenta Genius
    lines = lyrics_genius(artist, track)
    if not lines:
        # Se não encontrou, tenta lyrics.io
        lines = lyrics_lyricsio(artist, track)
    if not lines:
        lines = [{"text":"Letra não encontrada","time":0}]
    return jsonify({"lines": lines})

@app.route('/artist')
def artist_info():
    artist = request.args.get('artist')
    try:
        res = requests.get(f'https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist={artist}&api_key={LASTFM_API_KEY}&format=json', timeout=10).json()
        bio = res.get('artist', {}).get('bio', {}).get('summary', 'Informações não disponíveis')
        tags = [t['name'] for t in res.get('artist', {}).get('tags', {}).get('tag', [])]
        image = ''
        if res.get('artist', {}).get('image'):
            for img in res['artist']['image']:
                if img.get('size') == 'extralarge':
                    image = img.get('#text')
        return jsonify({"bio": bio, "tags": tags, "image": image})
    except:
        return jsonify({"bio": "Informações não disponíveis", "tags": [], "image": ""})

if __name__ == "__main__":
    app.run(port=5000)











