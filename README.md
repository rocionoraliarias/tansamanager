# Genesys Metrics

Prototipo en React Router para visualizar la capacidad de llamadas concurrentes.

## Requisitos

- Node.js compatible con Vite 8 (20.19+ o 22.12+).

## Desarrollo

```bash
npm install
npm run dev
```

La pantalla principal muestra una métrica de ejemplo: 42 llamadas activas de
250 disponibles. El botón **Simular actualización (Mock)** genera valores
aleatorios para probar los estados visuales; todavía no consulta un endpoint.

## Validación y producción

```bash
npm run typecheck
npm run build
npm run start
```
