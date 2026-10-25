# Genesys Metrics

Prototipo en React Router para visualizar la capacidad de llamadas concurrentes.

## Requisitos

- Node.js compatible con Vite 8 (20.19+ o 22.12+).

## Desarrollo

```bash
npm install
npm run dev
```

Al abrir la app hay que ingresar. La pantalla de login muestra la cuenta de
demostración y la sesión queda en una cookie del navegador. Después, la
pantalla principal muestra a Banca privada S.R.L. Arriba se cambia la
organización entre Development, Staging y Producción, y se puede cerrar la
sesión. Cada organización tiene tres segmentos de demostración: Telephony,
Analytics y Usage. El botón **Simular actualización (Mock)** genera valores
aleatorios para probar los estados visuales; todavía no consulta un endpoint.

Las features que faltan construir están en [docs/features.md](docs/features.md).

## Validación y producción

```bash
npm run typecheck
npm run build
npm run start
```
