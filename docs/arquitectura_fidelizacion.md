# Arquitectura del Sistema de Fidelización

Este documento describe la arquitectura, flujo de datos y componentes del sistema de fidelización de **Alfajores Mandrola**.

## Componentes Principales

1. **Frontend (Vercel)**
   - **Framework:** Next.js (App Router).
   - **Estilos:** Tailwind CSS.
   - **Dominio:** `fidelidad.gtdata.com.ar` (Subdominio en DonWeb apuntando vía CNAME a Vercel).
   - **Funcionalidad:** Escaneo/Recepción de QR, Autenticación (Magic Link / OAuth), Feedback en tiempo real al usuario (Puntos ganados).

2. **Backend / Base de Datos (Supabase)**
   - **Base de Datos:** PostgreSQL.
   - **Autenticación:** Supabase Auth gestionando sesiones a través de cookies (SSR compatible).
   - **Lógica Transaccional:** Función RPC (Remote Procedure Call) segura en PostgreSQL que maneja la validación de tokens y actualización de saldo de manera atómica (evita vulnerabilidades de concurrencia).

## Flujo de Escaneo de QR

```mermaid
sequenceDiagram
    participant U as Usuario
    participant N as Next.js (fidelidad.gtdata.com.ar)
    participant S as Supabase (Auth / RPC)

    U->>N: Escanea QR (URL con ?token=uuid)
    N->>N: Lee Cookie de Sesión
    alt No tiene sesión
        N-->>U: Redirige a /login (Retiene token)
        U->>N: Se loguea
        N->>S: Autentica
        S-->>N: Emite Cookie
    end
    
    N->>S: RPC claim_qr_points(token)
    S->>S: Inicia Transacción
    S->>S: Valida Token (SELECT FOR UPDATE)
    alt Token Inválido o Usado
        S-->>N: Retorna Error (404/409/410)
        N-->>U: Muestra UI de Error
    else Token Válido
        S->>S: Actualiza saldo de usuario
        S->>S: Marca Token como USADO
        S->>S: Inserta en points_ledger
        S-->>N: Retorna Éxito (Puntos Actuales)
        N-->>U: Muestra UI de Éxito (¡Puntos Acreditados!)
    end
```

## Prevención de Colisiones de Dominio

Al utilizar `fidelidad.gtdata.com.ar`:
- Las **cookies** de Supabase Auth se emitirán con alcance para este subdominio (`domain: 'fidelidad.gtdata.com.ar'`).
- El CORS en las rutas API de Next.js restringirá operaciones cruzadas no autorizadas desde otros orígenes.
- La variable de entorno `NEXT_PUBLIC_SITE_URL` será explícitamente configurada a `https://fidelidad.gtdata.com.ar` para el correcto flujo de redirección post-login.
