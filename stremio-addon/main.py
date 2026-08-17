import base64
import json
import urllib.parse
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import yt_dlp

app = FastAPI(title="Stremio YT-DLP Addon")

# 1. Habilitar CORS para que Stremio (Web y Desktop) pueda comunicarse sin bloqueos
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Manifest de Stremio
MANIFEST = {
    "id": "org.stremio.ytdlp.addon",
    "version": "1.0.0",
    "name": "YT-DLP Direct Streamer",
    "description": "Extrae enlaces directos de video (mp4, m3u8) desde páginas web usando yt-dlp.",
    "types": ["movie", "series", "other"],
    "resources": ["stream"],
    "idPrefixes": ["http", "https", "tt", "yt"],
    "catalogs": []
}

@app.get("/manifest.json")
def get_manifest():
    return JSONResponse(content=MANIFEST)

# 3. Endpoint de Streams
@app.get("/stream/{type_}/{id_full:path}")
def get_stream(type_: str, id_full: str):
    # Remover la extensión .json que añade Stremio
    if id_full.endswith(".json"):
        id_ = id_full[:-5]
    else:
        id_ = id_full

    url_to_extract = None

    # Intentar decodificar si está en Base64 URL-safe (evita problemas con slashes)
    try:
        # Corregir padding si falta
        padded_id = id_ + '=' * (-len(id_) % 4)
        decoded = base64.urlsafe_b64decode(padded_id).decode('utf-8')
        if decoded.startswith("http://") or decoded.startswith("https://"):
            url_to_extract = decoded
    except Exception:
        pass

    # Si no era base64, usar directamente el ID decodificando la URL
    if not url_to_extract:
        decoded_url = urllib.parse.unquote(id_)
        if decoded_url.startswith("http://") or decoded_url.startswith("https://"):
            url_to_extract = decoded_url
        else:
            url_to_extract = id_ # Permitir búsquedas genéricas de yt-dlp

    if not url_to_extract:
        return JSONResponse(content={"streams": []})

    # Opciones de yt-dlp (optimizado para rapidez)
    ydl_opts = {
        'format': 'best',
        'quiet': True,
        'no_warnings': True,
        'simulate': True, # Solo resolver, no descargar
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url_to_extract, download=False)
            
            if 'entries' in info: # Si es una playlist, tomar el primero
                info = info['entries'][0]

            video_url = info.get('url') or info.get('manifest_url')
            title = info.get('title', 'Stream Encontrado')
            ext = info.get('ext', 'mp4')
            resolution = info.get('format_note', 'HD')

            if not video_url:
                return JSONResponse(content={"streams": []})

            return JSONResponse(content={
                "streams": [
                    {
                        "title": f"YT-DLP | {resolution}\\n{title}",
                        "url": video_url,
                        "behaviorHints": {
                            "notWebReady": ext not in ['mp4', 'm3u8']
                        }
                    }
                ]
            })
    except Exception as e:
        print(f"Error yt-dlp: {e}")
        return JSONResponse(content={"streams": []})

# 4. Interfaz Web de Instalación
@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    html_content = """
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>YT-DLP Stremio Addon</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-900 text-gray-200 min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-6 space-y-8 border border-gray-700">
            <div class="text-center space-y-2">
                <h1 class="text-3xl font-bold text-indigo-400">YT-DLP Addon</h1>
                <p class="text-sm text-gray-400">Resuelve enlaces directos de video para Stremio usando yt-dlp.</p>
            </div>
            
            <div class="space-y-4">
                <button onclick="installAddon()" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg transition shadow-lg flex justify-center items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    Instalar en Stremio
                </button>
            </div>

            <div class="pt-6 border-t border-gray-700 space-y-4">
                <h2 class="text-lg font-medium text-gray-300">Generar Test Link</h2>
                <div class="space-y-3">
                    <input type="url" id="videoUrl" placeholder="https://..." class="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition">
                    <button onclick="generateLink()" class="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2.5 px-4 rounded-lg transition">
                        Probar URL
                    </button>
                </div>
                <div id="result" class="hidden mt-4 p-4 bg-gray-900 rounded-lg border border-gray-600 break-all text-sm font-mono text-indigo-300"></div>
            </div>
        </div>

        <script>
            function getHost() { return window.location.host; }
            function getProtocol() { return window.location.protocol; }
            
            function installAddon() {
                const url = "stremio://" + getHost() + "/manifest.json";
                window.location.href = url;
            }

            function generateLink() {
                const input = document.getElementById('videoUrl').value.trim();
                if (!input) return alert('Ingresa una URL de video');
                
                // Base64 URL Safe encoding
                const b64 = btoa(input).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '');
                const resultDiv = document.getElementById('result');
                const streamUrl = getProtocol() + "//" + getHost() + "/stream/other/" + b64 + ".json";
                
                resultDiv.innerHTML = `<p class="text-gray-400 mb-1 text-xs">JSON Endpoint:</p><a href="${streamUrl}" target="_blank" class="hover:text-indigo-400 underline">${streamUrl}</a>`;
                resultDiv.classList.remove('hidden');
            }
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)
