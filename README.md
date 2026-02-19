# Mentoría Premium Bilingüe (ES/EN)

Web pública de mentoría premium con rutas por idioma, editor visual in-place para administración y persistencia local en database.json.

## Stack

- Node.js + Express
- EJS
- Tailwind CSS vía CDN
- Google Fonts: Playfair Display + Lato
- Persistencia local en JSON (database.json)

## Características

- Rutas bilingües: /es y /en
- Idioma por defecto: redirección a /es
- Modo admin con ?admin=true
- Edición in-place con contenteditable (sin panel separado)
- Guardado automático al perder foco (onblur)
- Evita guardados innecesarios cuando no hay cambios
- Endpoint de actualización con validaciones y sanitización básica anti-XSS

## Estructura

- server.js
- database.json
- views/index.ejs
- package.json
- README.md

## Instalación

1. Instalar dependencias:

   npm i

2. Ejecutar en desarrollo:

   npm run dev

   O en modo normal:

   npm start

## URLs de prueba

- Público ES: http://localhost:3000/es
- Público EN: http://localhost:3000/en
- Admin ES: http://localhost:3000/es?admin=true
- Admin EN: http://localhost:3000/en?admin=true

## API

### POST /api/update

Actualiza una clave de traducción para un idioma específico.

Body JSON:

{
  "key": "hero_title",
  "lang": "es",
  "value": "Nuevo texto"
}

Respuestas:

- 200 -> { "success": true }
- 400/404/500 -> { "success": false, "error": "..." }

## Seguridad mínima aplicada

- Validación de idioma permitido (es, en)
- Validación de key con patrón seguro
- Sanitización de value a texto plano (elimina etiquetas HTML)

## Nota

Este proyecto usa database.json como almacenamiento local para facilitar pruebas y despliegue simple sin base de datos externa.
