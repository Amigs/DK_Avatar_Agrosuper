#!/bin/bash

# Nombre de la imagen
IMAGE_NAME="frontend_agrosuper_avatar:latest"

echo "🔨 Construyendo la imagen Docker..."
docker build -t $IMAGE_NAME .

if [ $? -ne 0 ]; then
  echo "❌ Error al construir la imagen. Abortando."
  exit 1
fi

echo "🚀 Ejecutando el contenedor..."
docker run --rm -it -p 8080:80 $IMAGE_NAME

echo "✅ El contenedor está corriendo en: http://localhost:$PORT"
