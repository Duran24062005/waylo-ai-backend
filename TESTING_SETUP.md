# Guía de Levantamiento para Testeo Local (Waylo.ai)

Guía paso a paso para levantar y verificar todos los servicios de Waylo (backend, base de datos y frontend) para pruebas locales en el navegador.

---

## 1. Servicios y Puertos

| Servicio | Tecnología | URL / Puerto | Función |
|---|---|---|---|
| **Base de Datos** | Docker (`pgvector/pgvector:pg16`) | `127.0.0.1:5434` | PostgreSQL con extensión pgvector |
| **Backend API** | Fastify + Node 24 (Docker o local) | `http://localhost:3001` | API canónica, auth, IPS y orquestación |
| **Swagger UI** | `@fastify/swagger-ui` | `http://localhost:3001/docs` | Consola interactiva del API OpenAPI |
| **Frontend Web** | Next.js 15 (Turbopack) | `http://localhost:3000` | UI de usuario (landing, chat, voz, login) |

---

## 2. Variables de Entorno Requeridas

### A. Backend (`waylo.ai-backend/.env`)
```bash
NODE_ENV=development
PORT=3001

# Postgres
DATABASE_URL="postgresql://thom@127.0.0.1:5433/waylo_dev"
POSTGRES_PASSWORD=20a3b0a40a4f4fdb1fe59855a2a801b8ed0b

# Secretos (64 caracteres hex)
APP_SECRET=f7c3e53f1ca3eed6aa712995ca57bbdeee3b1d5f9bc7816b84c44fb7ce84e008
IPS_TOKEN_KEY=7bac76ce1e69ebda84519d7ec355718d1266526fd5c7e61794b323d7a5c97f42

# Sesión
SESSION_TTL_DAYS=30

# IPS Confianza (remota en Vercel)
CONFIANZA_BASE_URL="https://confianza-ips-backend.vercel.app"
CONFIANZA_AGENT_KEY=

# Grok / xAI
XAI_API_KEY=pk_6Vk8EuEwOkdHBsDIm63oPasM7yPQXp0mGSy3m3ns
LLM_BASE_URL=https://api.reto.pltk.mx/v1

# Números de emergencia
EMERGENCY_PHONE=123
MENTAL_HEALTH_PHONE=106
VOICE_BUDGET_MONTHLY_USD=10
```

### B. Frontend (`waylo.ai-frontend/.env`)
```bash
RETO_KEY=pk_306LPZvy49YE15Gj9B3V52Teg1QlLt4cYMAJJ3kA
RETO_BASE_URL=https://api.reto.pltk.mx/v1
RETO_MODEL=grok-4.6
AUTH_SECRET=f7c3e53f1ca3eed6aa712995ca57bbdeee3b1d5f9bc7816b84c44fb7ce84e008
DATABASE_URL="postgresql://waylo:20a3b0a40a4f4fdb1fe59855a2a801b8ed0b@127.0.0.1:5434/waylo"
```

---

## 3. Pasos de Levantamiento

### Paso 1: Base de datos y Backend (Docker Compose)
En la carpeta `waylo.ai-backend`:
```bash
cd /home/thom/Documents/Github/waylo.ai-backend

# Levanta Postgres (db) y Backend Fastify (api)
docker compose up -d

# Inicializa el catálogo de IPS (primera vez o tras recrear volumen)
docker compose exec api node dist/seed/ips.js
```

### Paso 2: Frontend (Next.js)
En la carpeta `waylo.ai-frontend`:
```bash
cd /home/thom/Documents/Github/waylo.ai-frontend

# Aplica migraciones locales si es la primera vez
node --env-file=.env scripts/migrate.mjs

# Inicia el servidor de desarrollo
npm run dev
```

---

## 4. Verificación Rápida

Ejecutar estos comandos para validar que todo responde:

```bash
# 1. Backend activo
curl -i http://localhost:3001/health
# Debe responder: HTTP/1.1 200 OK -> {"status":"ok"}

# 2. Swagger UI activo
curl -i http://localhost:3001/docs
# Debe responder: HTTP/1.1 200 OK

# 3. Frontend activo
curl -i http://localhost:3000/inicio
# Debe responder: HTTP/1.1 200 OK

# 4. Triage con Grok respondiendo
curl -s -X POST http://localhost:3000/api/triage \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Tengo dolor de cabeza leve"}]}'
# Debe devolver JSON con orientacion a "Medicina General"
```

---

## 5. URLs para Navegador

- **Waylo App**: [http://localhost:3000](http://localhost:3000)
- **Chat Directo**: [http://localhost:3000/chat](http://localhost:3000/chat)
- **Documentación API**: [http://localhost:3001/docs](http://localhost:3001/docs)

---

## 6. Comandos de Diagnóstico y Mantenimiento

```bash
# Ver estado de los contenedores backend
docker compose ps

# Ver logs en vivo del backend
docker compose logs -f api

# Recrear backend si cambias variables en .env
docker compose up -d --no-deps api

# Correr tests del backend
npm test

# Correr tests del frontend
npm --prefix ../waylo.ai-frontend test
```
