# Manual de usuario

## Iniciar la tienda

Abre la carpeta `Level-Up-Gamer` en Visual Studio Code. Mantén abierta la terminal que sostiene el túnel SSH y, en una segunda terminal de VS Code, ejecuta `npm.cmd run dev`. Entra a `http://127.0.0.1:5173`.

El catálogo carga productos y categorías desde el backend cuando el túnel está activo. Si no hay conexión, puede mostrarse el catálogo local de demostración.

## Comprar y explorar

- Usa el menú para abrir productos, categorías, ofertas, blog o eventos.
- En **Productos**, busca por nombre o descripción y usa los filtros disponibles.
- En una tarjeta, elige **Ver detalle** o **Agregar al carrito**.
- En el carrito puedes cambiar cantidades o quitar productos.
- El checkout conserva el pago simulado del proyecto. En la prueba local con `VITE_API_ENABLE_BOLETAS=true`, la boleta y el stock se guardan en la API; en el modo normal se conserva el flujo local.

## Crear cuenta e iniciar sesión

- Entra a **Registro**, completa nombre, apellido, correo, fecha de nacimiento y contraseña, y envía el formulario. El correo debe ser válido; el formulario conserva la regla del proyecto de tener 18 años o más y pide al menos 8 caracteres para la contraseña.
- Usa **Ingresar** con una cuenta que ya exista en el backend.
- La sesión se conserva al recargar la página mientras el token siga vigente.
- Usa **Cerrar sesión** desde el perfil para salir.

## Panel de administración

Inicia sesión con una cuenta cuyo rol sea administrador y abre `/admin`. El panel permite administrar productos y categorías en el backend, y gestionar usuarios, cambiar sus roles o desactivarlos. El servidor valida las operaciones protegidas.

Con la opción local `VITE_API_ENABLE_BOLETAS=true`, las boletas del panel provienen del backend. En el modo normal, órdenes e informes conservan los datos locales de demostración.

## Problemas comunes

- Si el catálogo no se actualiza, comprueba que el túnel SSH siga abierto y que `http://127.0.0.1:8080` responda.
- Si Vite indica que el puerto 5173 está ocupado, reutiliza la terminal del servidor que ya está ejecutándose.
- Si una operación administrativa devuelve 401, inicia sesión nuevamente. Si devuelve 403, la cuenta no tiene permisos para esa operación.
