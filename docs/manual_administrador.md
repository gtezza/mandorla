#Manual de reclamo de puntos
acceder a https://fidelidad.gtdata.com.ar se va a abrir la pantalla de login de prueba
Elegir "Ir a Simulador de Cajas (Prueba)"
Con el celu apuntar al qr
Si no estas logeado te va a pedir que te registres usando un mail (ahora no se verifica)
abre el form y pide los datos que se ven en pantanlla:
El mail es el que el usuario coloco sin validar en esta etapa de MVP
para el caso del celular tener en cuenta que la carga es manual
  Si logramos detectar el teléfono del cliente automáticamente al iniciar sesión (por ejemplo si inicia sesión vía SMS o WhatsApp), se pondrá ese número exacto.
  Si el cliente inicia sesión por email o Google, el campo ya vendrá precargado por defecto con el prefijo +54 9  (el estándar internacional para celulares en Argentina). De esta forma el cliente solo tiene que escribir su código de área (como 11) y el resto de su celular.
Una vez registrado debe indicar los puntos ganados






# Manual Rápido: Acceso y Uso del Panel de Administrador

Este manual está diseñado para guiarte en tu primera prueba del sistema de fidelización CRM Mandorla, desde el inicio de sesión hasta la gestión en el panel de control.

---

## 1. Inicio de Sesión (Login de Administrador)

Para acceder a las funciones administrativas y poder gestionar los puntos, presupuestos y clientes, debes iniciar sesión con una cuenta autorizada.

1. **Ingresa a la URL de acceso:** Dirígete a la ruta `/admin/login` en tu navegador (por ejemplo: `https://fidelidad.gtdata.com.ar/admin/login`).
2. **Inicia sesión:** Puedes utilizar tu cuenta de Google o bien ingresar un Correo Electrónico.
   > **Nota de Seguridad:** Actualmente, el sistema está configurado en modo *MVP* (Producto Mínimo Viable) y solo permite el acceso al panel a una lista específica de correos electrónicos autorizados:
   Correo: gerardo@gtdata.com.ar
  Contraseña: Mandorla2026Test!.
3. **Redirección automática:** Una vez validados tus datos, el sistema te redirigirá automáticamente al **Dashboard**.

---

## 2. Navegación por el Dashboard (Panel de Control)

El menú lateral izquierdo, resaltado dinámicamente según la sección activa, te permitirá moverte por las diferentes áreas del sistema:

### 📊 Métricas (Resumen General)
- **URL:** `/dashboard`
- **¿Qué encontrarás aquí?**
  - **KPIs (Indicadores clave):** Tarjetas con el total de puntos entregados, límite de presupuesto (si aplica), puntos del día y total de clientes registrados.
  - **Resumen rápido de clientes:** Una tabla consolidada con el listado de todos los clientes, los puntos que han obtenido, los que han canjeado y su saldo actual. Además, contiene accesos directos para ver el detalle exacto de la obtención y canje de cada cliente.

### 👥 Clientes
- **URL:** `/dashboard/clientes`
- **¿Qué encontrarás aquí?**
  - Un gestor completo de tu base de datos de usuarios.
  - **Buscador interactivo:** Puedes filtrar rápidamente por nombre, celular o correo.
  - **Herramientas de acción (Iconos):**
    - 📥 *Flecha hacia abajo:* Ver el historial detallado de puntos adquiridos (dónde y cuándo).
    - 🕒 *Reloj:* Ver el historial detallado de puntos canjeados.
    - 💬 *Globo de chat:* Acceso directo para enviar un WhatsApp (Próximamente).
    - 🎁 *Regalo:* Botón para **descontar / canje manual** de puntos si el cliente desea reclamar un premio presencialmente.

### 🏪 Puntos de Promoción (PP)
- **URL:** `/dashboard/puntos`
- **¿Qué encontrarás aquí?**
  - Es el lugar para dar de alta y gestionar los comercios, sucursales o lugares físicos que entregan puntos.
  - Podrás crear nuevos "Puntos de Promoción" y el sistema generará automáticamente un **Código QR Único** e imprimible por cada uno.
  - Cuando un cliente escanee ese QR, el sistema registrará automáticamente de qué "Punto de Promoción" provienen los puntos.

### 💰 Presupuesto de Puntos
- **URL:** `/dashboard/presupuesto`
- **¿Qué encontrarás aquí?**
  - La herramienta de control de riesgos. Te permite poner topes máximos a la entrega de puntos para no pasarte de tu presupuesto.
  - Puedes crear presupuestos por:
    - **Cantidad máxima (Bolsa fija):** Ej. "Solo entregaremos 10,000 puntos en total".
    - **Rango de fechas:** Ej. "Esta promoción solo es válida del 1 al 15 del mes".
    - **Ambas condiciones combinadas.**
  - Si un cliente intenta escanear un QR y el presupuesto se ha agotado o está fuera de fecha, el sistema le enviará un mensaje amigable informando que la promoción ha finalizado.

---

## 3. Flujo Sugerido de Prueba

Para probar el sistema por completo de extremo a extremo, te sugerimos estos pasos:

1. Ingresa a `/dashboard/puntos` y crea un Punto de Promoción. Guarda o imprime el código QR generado.
2. Ingresa a `/dashboard/presupuesto` y configura una bolsa límite de 100 puntos.
3. Toma un celular (o abre una ventana de incógnito), escanea el QR o ingresa a la URL que genera, e inicia sesión como un cliente normal. Si es la primera vez, el sistema te pedirá que **Completes tu Perfil** (donde verás que el número telefónico sugiere el formato internacional `+54 9 `).
4. Vuelve al panel de Administrador y revisa cómo suben las métricas en el Dashboard y cómo se registra el historial de ese cliente en la pestaña **Clientes**.
5. Finalmente, en la pestaña **Clientes**, pulsa el icono de "Regalo" para descontarle los puntos al cliente como si hubiese canjeado un alfajor.

---
*Fin del manual. Si surge alguna duda durante la prueba, revisa los modales de ayuda o contacta a soporte técnico.*
