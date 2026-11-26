import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { Routes, Route } from 'react-router-dom'
import AppNavbar from './components/AppNavbar'
import WhatsAppButton from './components/WhatsAppButton'
import HomeView from './views/HomeView'
import ProductsView from './views/ProductsView'
import ProductDetailView from './views/ProductDetailView'
import CartView from './views/CartView'
import CategoriasView from './views/CategoriasView'
import OfertasView from './views/OfertasView'
import CheckoutView from './views/CheckoutView'
import CompraExitosaView from './views/CompraExitosaView'
import PagoErrorView from './views/PagoErrorView'
import BlogView from './views/BlogView'
import BlogDetailView from './views/BlogDetailView'
import NosotrosView from './views/NosotrosView'
import ContactoView from './views/ContactoView'
import EventsView from './views/EventsView'
import RegisterView from './views/RegisterView'
import LoginView from './views/LoginView'
import ProfileView from './views/ProfileView'
import AdminLayout from './views/admin/AdminLayout'
import AdminDashboardView from './views/admin/AdminDashboardView'
import AdminProductosView from './views/admin/AdminProductosView'
import AdminProductoFormView from './views/admin/AdminProductoFormView'
import AdminCategoriasView from './views/admin/AdminCategoriasView'
import AdminOrdenesView from './views/admin/AdminOrdenesView'
import AdminOrdenDetalleView from './views/admin/AdminOrdenDetalleView'
import AdminUsuariosView from './views/admin/AdminUsuariosView'
import AdminUsuarioFormView from './views/admin/AdminUsuarioFormView'
import AdminUsuarioComprasView from './views/admin/AdminUsuarioComprasView'
import AdminCriticosView from './views/admin/AdminCriticosView'
import AdminReportesView from './views/admin/AdminReportesView'
import AdminReporteProductosView from './views/admin/AdminReporteProductosView'
import AdminPerfilView from './views/admin/AdminPerfilView'
import {
  agregarAlCarrito,
  aplicarDescuento,
  calcularTotal,
  cambiarCantidad,
  contarItems,
  quitarDelCarrito,
} from './utils/carrito'
import { categorias as categoriasBase } from './data/categorias'
import { productos as productosBase } from './data/productos'
import {
  guardarCarrito,
  guardarOrdenes,
  guardarResenas,
  guardarUsuarios,
  leerCarrito,
  leerCategorias,
  leerOrdenes,
  leerProductos,
  leerResenas,
  leerUsuarios,
} from './utils/almacenamiento'
import { crearOrden, procesarPago } from './utils/checkout'
import { aplicarOferta } from './utils/ofertas'
import { agregarResena } from './utils/resenas'
import { actualizarNombre } from './utils/usuarios'
import {
  adaptarUsuarioApi,
  cambiarRolUsuarioApi,
  desactivarUsuarioApi,
  listarUsuariosApi,
} from './api/usuarios'
import {
  actualizarProductoApi,
  crearCategoriaApi,
  crearProductoApi,
  eliminarCategoriaApi,
  eliminarProductoApi,
  obtenerCategoriasApi,
  obtenerProductos,
  renombrarCategoriaApi,
} from './api/productos'
import { iniciarSesionApi, registrarUsuarioApi } from './api/auth'
import { crearBoletaApi, obtenerBoletasApi } from './api/boletas'
import {
  crearSesionDesdeRespuesta,
  guardarSesionAutenticada,
  limpiarSesionAutenticada,
  leerSesionAutenticada,
} from './utils/sesion'

const usarBoletasApi = import.meta.env.VITE_API_ENABLE_BOLETAS === 'true'

function App() {
  const [carrito, setCarrito] = useState(leerCarrito)
  const [usuarios, setUsuarios] = useState(leerUsuarios)
  const [sesion, setSesion] = useState(leerSesionAutenticada)
  const [resenas, setResenas] = useState(leerResenas)
  const [ordenes, setOrdenes] = useState(leerOrdenes)
  // El catálogo sale de lo guardado y, si no hay nada, de los datos base de src/data.
  const [productos, setProductos] = useState(() => leerProductos() || productosBase)
  const [categorias, setCategorias] = useState(() => leerCategorias() || categoriasBase)

  useEffect(() => {
    const controlador = new AbortController()

    Promise.all([
      obtenerProductos({ signal: controlador.signal }),
      obtenerCategoriasApi({ signal: controlador.signal }),
    ])
      .then(([productosApi, categoriasApi]) => {
        setProductos(productosApi)
        setCategorias(categoriasApi.map((categoria) => categoria.nombre))
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.warn('Se mantiene el catálogo local porque la API no está disponible.', error)
        }
      })

    return () => controlador.abort()
  }, [])

  useEffect(() => {
    if (sesion?.usuario?.rol !== 'admin') {
      setUsuarios([])
      return undefined
    }

    const controlador = new AbortController()
    listarUsuariosApi({ signal: controlador.signal })
      .then(setUsuarios)
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.warn('No se pudo cargar la lista de usuarios desde el backend.', error)
        }
      })

    return () => controlador.abort()
  }, [sesion?.usuario?.rol])

  useEffect(() => {
    if (!usarBoletasApi || sesion?.usuario?.rol !== 'admin') return undefined

    const controlador = new AbortController()
    obtenerBoletasApi({ signal: controlador.signal })
      .then(setOrdenes)
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.warn('No se pudieron cargar las boletas del backend.', error)
        }
      })

    return () => controlador.abort()
  }, [sesion?.usuario?.rol])

  useEffect(() => {
    function limpiarSesionVencida() {
      limpiarSesionAutenticada()
      setSesion(null)
    }

    window.addEventListener('levelup:sesion-expirada', limpiarSesionVencida)
    return () => window.removeEventListener('levelup:sesion-expirada', limpiarSesionVencida)
  }, [])

  const usuario = sesion?.usuario || null
  const descuento = usuario ? usuario.descuento : 0
  const totalCarrito = aplicarDescuento(calcularTotal(carrito), descuento || 0).totalFinal

  function actualizarCarrito(nuevoCarrito) {
    setCarrito(nuevoCarrito)
    guardarCarrito(nuevoCarrito)
  }

  // Si el producto tiene oferta, entra al carrito con el precio rebajado, se agregue desde donde se agregue.
  function agregar(producto) {
    actualizarCarrito(agregarAlCarrito(carrito, aplicarOferta(producto)))
  }

  function quitar(codigo) {
    actualizarCarrito(quitarDelCarrito(carrito, codigo))
  }

  function modificarCantidad(codigo, cantidad) {
    actualizarCarrito(cambiarCantidad(carrito, codigo, cantidad))
  }

  // Registra la orden (pagada o rechazada). El carrito solo se vacía si el pago salió bien.
  async function pagar(datos) {
    const ordenLocal = crearOrden({
      carrito,
      datos,
      descuento,
      ordenes,
      resultadoPago: procesarPago(),
    })
    let orden = ordenLocal

    if (usarBoletasApi) {
      try {
        orden = await crearBoletaApi(ordenLocal)
      } catch (error) {
        return { error: error.message || 'No se pudo guardar la boleta en el backend.' }
      }
    }

    const lista = [...ordenes, orden]

    setOrdenes(lista)
    guardarOrdenes(lista)

    if (orden.estado === 'pagada') {
      actualizarCarrito([])
    }

    return orden
  }

  async function recargarCatalogo() {
    const [productosApi, categoriasApi] = await Promise.all([
      obtenerProductos(),
      obtenerCategoriasApi(),
    ])
    setProductos(productosApi)
    setCategorias(categoriasApi.map((categoria) => categoria.nombre))
  }

  async function altaProducto(datos) {
    try {
      await crearProductoApi(datos)
      await recargarCatalogo()
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  }

  async function modificarProducto(codigo, cambios) {
    try {
      await actualizarProductoApi(codigo, cambios)
      await recargarCatalogo()
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  }

  async function bajaProducto(codigo) {
    try {
      await eliminarProductoApi(codigo)
      await recargarCatalogo()
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  }

  async function altaCategoria(nombre) {
    try {
      await crearCategoriaApi(nombre)
      await recargarCatalogo()
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  }

  async function cambiarNombreCategoria(actual, nuevo) {
    try {
      await renombrarCategoriaApi(actual, nuevo)
      await recargarCatalogo()
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  }

  async function bajaCategoria(nombre) {
    try {
      await eliminarCategoriaApi(nombre)
      await recargarCatalogo()
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  }

  async function registrar(datos) {
    try {
      const respuesta = await registrarUsuarioApi(datos)
      const usuarioNuevo = adaptarUsuarioApi(respuesta)
      return { usuario: usuarioNuevo }
    } catch (errorRegistro) {
      return { error: errorRegistro.message }
    }
  }

  // Edición y baja de usuarios desde el panel de administrador.
  async function modificarUsuario(correo, cambios) {
    const existente = usuarios.find((item) => item.correo === correo)
    if (!existente?.idUsuario) return { error: 'No encontramos el usuario en el backend.' }

    try {
      const usuarioActualizado = await cambiarRolUsuarioApi(existente.idUsuario, cambios.rol)
      setUsuarios((lista) => lista.map((item) =>
        item.idUsuario === existente.idUsuario ? usuarioActualizado : item
      ))
      return { usuario: usuarioActualizado }
    } catch (error) {
      return { error: error.message }
    }
  }

  async function bajaUsuario(correo) {
    const existente = usuarios.find((item) => item.correo === correo)
    if (!existente?.idUsuario) return { error: 'No encontramos el usuario en el backend.' }

    try {
      await desactivarUsuarioApi(existente.idUsuario)
      setUsuarios((lista) => lista.filter((item) => item.idUsuario !== existente.idUsuario))
      return { usuario: existente }
    } catch (error) {
      return { error: error.message }
    }
  }

  async function iniciarSesion(correo, contrasena) {
    try {
      const respuesta = await iniciarSesionApi(correo, contrasena)
      const nuevaSesion = crearSesionDesdeRespuesta(respuesta)
      guardarSesionAutenticada(nuevaSesion)
      setSesion(nuevaSesion)
      return { success: true }
    } catch (errorInicio) {
      return { error: errorInicio.message }
    }
  }

  function dejarResena(codigo, datos) {
    if (!usuario) {
      return { error: 'Inicia sesión para dejar una reseña.' }
    }

    const nueva = {
      codigo,
      correo: usuario.correo,
      autor: usuario.nombre,
      puntuacion: datos.puntuacion,
      comentario: datos.comentario.trim(),
      fecha: new Date().toISOString().slice(0, 10),
    }
    const resultado = agregarResena(resenas, nueva)

    if (!resultado.error) {
      setResenas(resultado.resenas)
      guardarResenas(resultado.resenas)
    }

    return resultado
  }

  function actualizarPerfil(nombre) {
    const lista = actualizarNombre(usuarios, usuario.correo, nombre)
    setUsuarios(lista)
    guardarUsuarios(lista)

    const nuevaSesion = { ...sesion, usuario: { ...usuario, nombre: nombre.trim() } }
    guardarSesionAutenticada(nuevaSesion)
    setSesion(nuevaSesion)
  }

  function cerrarSesion() {
    limpiarSesionAutenticada()
    setSesion(null)
  }

  return (
    <div className="app-shell">
      <AppNavbar
        cantidadCarrito={contarItems(carrito)}
        totalCarrito={totalCarrito}
        usuario={usuario}
      />

      <Container className="py-4">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route
            path="/productos"
            element={
              <ProductsView productos={productos} categorias={categorias} onAgregar={agregar} />
            }
          />
          <Route
            path="/producto/:codigo"
            element={
              <ProductDetailView
                productos={productos}
                onAgregar={agregar}
                usuario={usuario}
                resenas={resenas}
                onAgregarResena={dejarResena}
              />
            }
          />
          <Route
            path="/categorias/:nombre?"
            element={
              <CategoriasView productos={productos} categorias={categorias} onAgregar={agregar} />
            }
          />
          <Route path="/ofertas" element={<OfertasView productos={productos} onAgregar={agregar} />} />
          <Route path="/blog" element={<BlogView />} />
          <Route path="/blog/:id" element={<BlogDetailView />} />
          <Route path="/nosotros" element={<NosotrosView />} />
          <Route path="/contacto" element={<ContactoView />} />
          <Route path="/eventos" element={<EventsView />} />
          <Route path="/registro" element={<RegisterView onRegistrar={registrar} />} />
          <Route path="/login" element={<LoginView onIniciarSesion={iniciarSesion} />} />
          <Route
            path="/perfil"
            element={
              <ProfileView
                usuario={usuario}
                onCerrarSesion={cerrarSesion}
                onActualizarNombre={actualizarPerfil}
              />
            }
          />
          <Route
            path="/carrito"
            element={
              <CartView
                carrito={carrito}
                descuento={descuento}
                onQuitar={quitar}
                onCambiarCantidad={modificarCantidad}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <CheckoutView
                carrito={carrito}
                descuento={descuento}
                usuario={usuario}
                onPagar={pagar}
              />
            }
          />
          <Route
            path="/compra-exitosa/:numero"
            element={<CompraExitosaView ordenes={ordenes} />}
          />
          <Route path="/pago-error/:numero" element={<PagoErrorView ordenes={ordenes} />} />
          <Route
            path="/admin"
            element={<AdminLayout usuario={usuario} onCerrarSesion={cerrarSesion} />}
          >
            <Route
              index
              element={
                <AdminDashboardView productos={productos} usuarios={usuarios} ordenes={ordenes} />
              }
            />
            <Route
              path="productos"
              element={<AdminProductosView productos={productos} onEliminar={bajaProducto} />}
            />
            <Route
              path="productos/nuevo"
              element={
                <AdminProductoFormView
                  productos={productos}
                  categorias={categorias}
                  onCrear={altaProducto}
                />
              }
            />
            <Route
              path="productos/:codigo"
              element={
                <AdminProductoFormView
                  productos={productos}
                  categorias={categorias}
                  onEditar={modificarProducto}
                />
              }
            />
            <Route
              path="categorias"
              element={
                <AdminCategoriasView
                  categorias={categorias}
                  productos={productos}
                  onCrear={altaCategoria}
                  onRenombrar={cambiarNombreCategoria}
                  onEliminar={bajaCategoria}
                />
              }
            />
            <Route path="ordenes" element={<AdminOrdenesView ordenes={ordenes} />} />
            <Route path="ordenes/:numero" element={<AdminOrdenDetalleView ordenes={ordenes} />} />
            <Route path="productos/criticos" element={<AdminCriticosView productos={productos} />} />
            <Route
              path="usuarios"
              element={<AdminUsuariosView usuarios={usuarios} onEliminar={bajaUsuario} />}
            />
            <Route
              path="usuarios/nuevo"
              element={<AdminUsuarioFormView usuarios={usuarios} onCrear={registrar} />}
            />
            <Route
              path="usuarios/:correo"
              element={<AdminUsuarioFormView usuarios={usuarios} onEditar={modificarUsuario} />}
            />
            <Route
              path="usuarios/:correo/compras"
              element={<AdminUsuarioComprasView usuarios={usuarios} ordenes={ordenes} />}
            />
            <Route
              path="productos/reportes"
              element={<AdminReporteProductosView ordenes={ordenes} productos={productos} />}
            />
            <Route
              path="reportes"
              element={<AdminReportesView ordenes={ordenes} productos={productos} />}
            />
            <Route path="perfil" element={<AdminPerfilView usuario={usuario} />} />
          </Route>
        </Routes>
      </Container>

      <WhatsAppButton />
    </div>
  )
}

export default App
