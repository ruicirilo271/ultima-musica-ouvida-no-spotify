# app.py
from flask import Flask, request, jsonify, send_file
import requests

app = Flask(__name__)

# Configurações
LASTFM_API_KEY = '6e7c0a29cd508f42a6737e5fd3d6110b'
USERNAME = 'ruicirilo'

@app.route('/')
def index():
    return send_file('index.html')

@app.route('/lyrics')
def lyrics():
    artist = request.args.get('artist')
    track = request.args.get('track')
    if not artist or not track:
        return jsonify({"lines":[{"text":"Letra não encontrada","time":0}]})
    # Usando API Lyrics.ovh
    res = requests.get(f'https://api.lyrics.ovh/v1/{artist}/{track}')
    if res.status_code != 200:
        return jsonify({"lines":[{"text":"Letra não encontrada","time":0}]})
    lyrics_text = res.json().get('lyrics', 'Letra não encontrada')
    lines = [{"text":line, "time":i*3000} for i, line in enumerate(lyrics_text.split("\n")) if line.strip()]
    if not lines:
        lines = [{"text":"Letra não encontrada","time":0}]
    return jsonify({"lines": lines})

@app.route('/artist')
def artist_info():
    artist = request.args.get('artist')
    if not artist:
        return jsonify({"bio":"Informações não disponíveis","tags":[],"image":""})
    # Last.fm artist info
    res = requests.get(f'https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist={artist}&api_key={LASTFM_API_KEY}&format=json').json()
    bio = res.get('artist', {}).get('bio', {}).get('summary', 'Informações não disponíveis')
    tags = [t['name'] for t in res.get('artist', {}).get('tags', {}).get('tag', [])]
    image = ''
    if res.get('artist', {}).get('image'):
        for img in res['artist']['image']:
            if img.get('size') == 'extralarge':
                image = img.get('#text')
    return jsonify({"bio": bio, "tags": tags, "image": image})

if __name__ == "__main__":
    app.run(port=5000, debug=True)













