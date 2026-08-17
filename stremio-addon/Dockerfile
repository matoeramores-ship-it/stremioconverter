FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema, notablemente ffmpeg para yt-dlp
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

# Servicios como Render proveen el puerto a través de $PORT
ENV PORT=8000

# Usamos sh -c para expandir la variable de entorno
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port $PORT"]
