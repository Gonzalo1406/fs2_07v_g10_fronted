# Level-Up Gamer

Tienda online desarrollada con React y Bootstrap para **Desarrollo Fullstack II (DSY1104)**.
Este proyecto conserva el trabajo del equipo y conecta sus pantallas principales con la API Spring Boot.

## Integración con el backend

El frontend utiliza el túnel local `127.0.0.1:8080` para comunicarse con Spring Boot:

- Catálogo y categorías: consulta y operaciones de creación, edición y eliminación.
- Registro e inicio de sesión: API real, contraseña enviada por HTTPS dentro del túnel local y token JWT en las solicitudes protegidas.
- Usuarios del panel: consulta, cambio de rol y desactivación; las acciones administrativas requieren una sesión de administrador.
- La sesión JWT se conserva al recargar la página; si el backend entrega refresh token, el frontend lo usa al recibir 401 y renueva la sesión. Si no lo entrega o venció, cierra la sesión.

La conexión al túnel está configurada en `vite.config.js`. Vite reenvía las rutas `/api/*` a `http://127.0.0.1:8080` por defecto. Para una prueba local con el backend H2 en el puerto 8081, `VITE_API_TARGET` permite cambiar temporalmente ese destino.
No se incluyen claves, contraseñas ni datos de AWS en el proyecto.

El nuevo backend que acompaña esta entrega publica `/api/v1/auth/refresh`. Si se usa otro backend que no entregue refresh token en el inicio de sesión, la sesión termina al expirar el access token.
Por defecto, el checkout y las boletas conservan el flujo local que ya tenía el proyecto. Para guardar las compras en el backend nuevo durante una prueba local, hay que activar `VITE_API_ENABLE_BOLETAS=true`. El pago sigue siendo una simulación. Reseñas, referidos y cambios de perfil continúan locales.

## Abrir y ejecutar en VS Code

1. En VS Code, elige **Archivo → Abrir carpeta** y abre la carpeta `Level-Up-Gamer` (la que contiene `package.json`, `src` y `vite.config.js`).
2. Mantén activa la terminal del túnel SSH que reenvía el puerto remoto al `127.0.0.1:8080` de tu computador.
3. En otra terminal integrada, ejecuta `npm.cmd install` (solo la primera vez).
4. Ejecuta `npm.cmd run dev` y abre `http://127.0.0.1:5173`.

Para probar con la API local en lugar del túnel, inicia el backend con el perfil `local-test` siguiendo su README y, en otra terminal, ejecuta:

```powershell
$env:VITE_API_TARGET = 'http://127.0.0.1:8081'
$env:VITE_API_ENABLE_BOLETAS = 'true'
npm.cmd run dev -- --port 5174
```

Abre `http://127.0.0.1:5174`. Al terminar, detén Vite con **Ctrl+C** y elimina las variables temporales con `$env:VITE_API_TARGET = $null` y `$env:VITE_API_ENABLE_BOLETAS = $null` antes de volver a iniciar la tienda con el túnel.

Si el túnel o el backend no están activos, la tienda usa el catálogo de demostración guardado en el proyecto. El inicio de sesión y las acciones protegidas necesitan que el backend responda.

## Funciones que conserva el proyecto

- Inicio con carrusel, catálogo con búsqueda y filtros, detalle, categorías y ofertas.
- Carrito, flujo de checkout de demostración y pantallas de resultado.
- Registro, inicio de sesión, perfil y reseñas.
- Blog, eventos, información de la tienda y contacto.
- Panel de administración con productos, categorías, usuarios, órdenes y reportes.

## Tecnologías

| Uso | Herramienta |
|---|---|
| Interfaz | React 19 y Bootstrap 5 |
| Servidor de desarrollo y proxy | Vite 7 |
| Navegación | React Router 7 |
| Validación del proyecto | Vitest y Testing Library |

## Documentación

- `docs/MANUAL_USUARIO.md`: uso de la tienda y del panel.
- `docs/INTEGRACION_BACKEND.md`: rutas conectadas, sesión JWT y alcance de la integración.

## Estructura

```text
src/
  api/          Solicitudes HTTP, autenticación, productos y usuarios
  components/   Componentes reutilizables
  data/         Contenido local de demostración
  utils/        Reglas de negocio, estado local y sesión
  views/        Páginas públicas y panel de administración
  tests/        Pruebas existentes del proyecto
public/         Recursos estáticos
```
