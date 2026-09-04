---
name: Flujo de Trabajo Git
description: Regla para subir los cambios a Git y Vercel tras finalizar una tarea
---

# Regla General: Subida a Git al finalizar tareas

Cada vez que el usuario acepte un cambio (plan de implementación) y se haya ejecutado exitosamente la tarea:
1. Revisa y mantén actualizado el archivo `.gitignore` para asegurarte de no subir archivos temporales, scripts de prueba o carpetas locales innecesarias.
2. Ejecuta `git add .`, seguido de `git commit -m "..."` con un mensaje descriptivo y `git push`.
3. Esto garantizará que Vercel tome los cambios automáticamente y el despliegue esté siempre sincronizado con lo realizado en la sesión.
4. Notifica al usuario que los cambios ya fueron subidos a Git.
