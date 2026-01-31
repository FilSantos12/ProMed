#!/bin/bash

echo "🧹 Limpando instalação anterior..."
rm -rf node_modules package-lock.json

echo "📦 Instalando dependências..."
npm install

echo "🏗️ Fazendo build..."
npm run build

echo "✅ Build concluído!"
