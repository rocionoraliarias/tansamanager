# Features a sumar

Ideas acordadas que todavía no están en el prototipo.

## Modo edición

Un botón con ícono de lápiz, en la barra del tablero, entra y sale del modo edición.

Dentro de ese modo se puede cambiar el orden de los gráficos del segmento que está en pantalla, arrastrando las tarjetas. El orden es independiente para cada segmento y para cada organización:

- **Telephony:** llamadas concurrentes, desajustes de QoS, salud de edges, tráfico de trunks, métrica personalizada.
- **Analytics:** colas en vivo, nivel de servicio, agentes, conversaciones por canal.
- **Usage:** solicitudes a la API, por cliente OAuth, por método.

Al salir del modo edición las tarjetas vuelven a usarse como ahora y el orden nuevo se conserva en el navegador. Volver a entrar muestra el último orden guardado. Si no hay un orden guardado, se usa el de la lista de arriba.

En edición, el arrastre es la acción principal: los controles de cada tarjeta (la métrica personalizada, por ejemplo) no compiten con el movimiento. Simular actualización y configurar alertas siguen disponibles fuera de ese modo.
