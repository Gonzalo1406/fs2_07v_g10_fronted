# Integración frontend y backend

## Conexión local

El proyecto se ejecuta en `http://127.0.0.1:5173`. El proxy de Vite reenvía `/api/*` a `http://127.0.0.1:8080`, que debe ser el extremo local del túnel SSH existente. Para pruebas locales aisladas se puede configurar `VITE_API_TARGET=http://127.0.0.1:8081` y usar el perfil `local-test` del backend. No se cambió configuración ni infraestructura de AWS.

Los módulos de `src/api/` centralizan las llamadas HTTP y convierten los objetos del backend al formato usado por las vistas existentes. Las solicitudes con sesión agregan `Authorization: Bearer <token>`.

## Rutas conectadas

| Función | Ruta | Operaciones desde el frontend |
|---|---|---|
| Productos | `/api/v1/productos` | Listar, crear, editar y eliminar |
| Categorías | `/api/v1/categorias` | Listar, crear, renombrar y eliminar |
| Registro | `/api/v1/usuarios/registro` | Crear cuenta |
| Inicio de sesión | `/api/v1/auth/login` | Autenticar y recibir JWT |
| Renovación | `/api/v1/auth/refresh` | Renovar access token cuando vence |
| Boletas | `/api/v1/boletas` | Crear compra; listar y consultar desde administración |
| Usuarios | `/api/v1/usuarios` | Listar en panel, cambiar rol y desactivar |

El panel permite CRUD de productos y categorías. El alta pública de usuarios usa el rol asignado por el servidor. Desde el panel se cambia el rol con `PATCH /api/v1/usuarios/{id}/rol?rol=...`.

## Sesión y acceso

- El JWT, el refresh token y los datos mínimos de usuario se guardan en `sessionStorage`, de modo que sobreviven a una recarga de la pestaña.
- El token se adjunta automáticamente en las llamadas HTTP protegidas.
- Si el backend responde 401, el frontend intenta una vez renovar el access token y repetir la solicitud; si no hay refresh token o la renovación falla, cierra la sesión.
- Cerrar sesión elimina el JWT del navegador.
- El frontend oculta el panel administrativo para otros roles; el backend debe seguir validando cada permiso en el servidor.
- El backend incluido en la entrega rota el refresh token y solo acepta el último emitido para la cuenta.

## Funciones que permanecen locales

El carrito continúa en el navegador. Las boletas se pueden persistir cuando el frontend se inicia con `VITE_API_ENABLE_BOLETAS=true`; apagado, conserva el flujo local. El backend calcula precios y descuento a partir de sus datos y valida stock. La simulación de pago no reemplaza una pasarela real. Reseñas, referidos, puntos y cambios de nombre del perfil siguen locales.

Las imágenes dependen del campo `imagenUrl` devuelto por la API. Si el campo está vacío, la tarjeta conserva su estado “Sin imagen”.

## Verificación manual

1. Iniciar el túnel local y el backend.
2. Iniciar Vite desde la carpeta del proyecto.
3. Abrir `http://127.0.0.1:5173/productos`; el catálogo debe mostrar los productos de la API.
4. Iniciar sesión con una cuenta existente y revisar las funciones disponibles según su rol.
5. Con rol administrador, revisar las pantallas de productos, categorías y usuarios. El backend debe autorizar las operaciones.

La especificación del backend se consulta en `http://127.0.0.1:8080/swagger-ui/index.html` mientras el túnel esté activo.
