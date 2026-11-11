# voidgate-frontend

Interface web da **VoidGate**, a camada de segurança entre aplicações e modelos de IA.

Backend: [VoidGates/voidgate-backend](https://github.com/VoidGates/voidgate-backend)

## Stack

React 19 + TypeScript + Vite

## Rodando

Requer Node 20+.

```bash
npm install
npm run dev     # http://localhost:5173
```

Em dev, chamadas para `/api/*` são repassadas para o backend em `http://localhost:8000`
(mude com a variável `VITE_API_URL`).

## Scripts

| Comando         | O que faz              |
|-----------------|------------------------|
| `npm run dev`   | servidor de desenvolvimento |
| `npm run build` | build de produção em `dist/` |
| `npm run lint`  | lint com oxlint        |
