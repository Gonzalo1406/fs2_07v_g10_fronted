import { apiRequest } from './http'

const API_PRODUCTOS = '/api/v1/productos'
const API_CATEGORIAS = '/api/v1/categorias'

function adaptarProducto(producto) {
  return {
    codigo: String(producto.idProducto),
    fabricante: '',
    categoria: producto.categoria?.nombre || 'Sin categoría',
    nombre: producto.nombre || 'Producto sin nombre',
    precio: Number(producto.precio) || 0,
    descripcion: producto.descripcion || '',
    stock: Number.isInteger(Number(producto.stock)) ? Number(producto.stock) : null,
    imagenUrl: producto.imagenUrl || '',
  }
}

export async function obtenerProductos({ signal } = {}) {
  const productos = await apiRequest(API_PRODUCTOS, { signal })
  if (!Array.isArray(productos)) {
    throw new Error('La API devolvió un catálogo con formato inesperado.')
  }

  return productos
    .filter((producto) => producto && producto.idProducto != null)
    .map(adaptarProducto)
}

export async function obtenerCategoriasApi({ signal } = {}) {
  const categorias = await apiRequest(API_CATEGORIAS, { signal })
  if (!Array.isArray(categorias)) {
    throw new Error('La API devolvió categorías con un formato inesperado.')
  }
  return categorias
}

async function buscarCategoriaApi(nombre) {
  const categorias = await obtenerCategoriasApi()
  const categoria = categorias.find((item) => item.nombre === nombre)
  if (!categoria) throw new Error(`No encontramos la categoría "${nombre}" en el backend.`)
  return categoria
}

function productoParaApi(datos, categoria, idProducto) {
  const producto = {
    nombre: String(datos.nombre || '').trim(),
    descripcion: String(datos.descripcion || '').trim(),
    precio: Number(datos.precio),
    stock: Number(datos.stock),
    imagenUrl: String(datos.imagenUrl || '').trim(),
    categoria,
  }
  if (idProducto !== undefined) producto.idProducto = Number(idProducto)
  return producto
}

export async function crearProductoApi(datos) {
  const categoria = await buscarCategoriaApi(datos.categoria)
  const resultado = await apiRequest(API_PRODUCTOS, {
    method: 'POST',
    body: productoParaApi(datos, categoria),
  })
  return adaptarProducto(resultado)
}

export async function actualizarProductoApi(idProducto, datos) {
  const categoria = await buscarCategoriaApi(datos.categoria)
  const resultado = await apiRequest(`${API_PRODUCTOS}/${encodeURIComponent(idProducto)}`, {
    method: 'PUT',
    body: productoParaApi(datos, categoria, idProducto),
  })
  return adaptarProducto(resultado)
}

export function eliminarProductoApi(idProducto) {
  return apiRequest(`${API_PRODUCTOS}/${encodeURIComponent(idProducto)}`, { method: 'DELETE' })
}

export async function crearCategoriaApi(nombre) {
  return apiRequest(API_CATEGORIAS, {
    method: 'POST',
    body: { nombre: nombre.trim(), descripcion: `Productos de ${nombre.trim()}` },
  })
}

export async function renombrarCategoriaApi(nombreActual, nombreNuevo) {
  const categoria = await buscarCategoriaApi(nombreActual)
  return apiRequest(`${API_CATEGORIAS}/${encodeURIComponent(categoria.idCategoria)}`, {
    method: 'PUT',
    body: { ...categoria, nombre: nombreNuevo.trim() },
  })
}

export async function eliminarCategoriaApi(nombre) {
  const categoria = await buscarCategoriaApi(nombre)
  return apiRequest(`${API_CATEGORIAS}/${encodeURIComponent(categoria.idCategoria)}`, {
    method: 'DELETE',
  })
}
