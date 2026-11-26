import { apiRequest } from './http'
import { calcularDescuento } from '../utils/validaciones'

const RUTA = '/api/v1/usuarios'
const rolDesdeApi = {
  ADMINISTRADOR: 'admin',
  VENDEDOR: 'seller',
  CLIENTE: 'client',
}
const rolHaciaApi = {
  admin: 'ADMINISTRADOR',
  seller: 'VENDEDOR',
  client: 'CLIENTE',
}

export function adaptarUsuarioApi(usuario) {
  const correo = String(usuario.email || '').trim().toLowerCase()
  return {
    idUsuario: usuario.idUsuario,
    nombre: [usuario.nombre, usuario.apellido].filter(Boolean).join(' '),
    correo,
    rol: rolDesdeApi[String(usuario.rol || '').toUpperCase()] || 'client',
    activo: usuario.activo !== false,
    fechaRegistro: usuario.fechaRegistro,
    puntos: 0,
    descuento: calcularDescuento(correo),
    codigoPropio: '',
  }
}

export async function listarUsuariosApi({ signal } = {}) {
  const usuarios = await apiRequest(RUTA, { signal })
  if (!Array.isArray(usuarios)) throw new Error('La API devolvió usuarios con formato inesperado.')
  return usuarios.map(adaptarUsuarioApi)
}

export async function cambiarRolUsuarioApi(idUsuario, rol) {
  const rolApi = rolHaciaApi[rol]
  if (!rolApi) throw new Error('Selecciona un rol válido.')
  const respuesta = await apiRequest(
    `${RUTA}/${encodeURIComponent(idUsuario)}/rol?rol=${encodeURIComponent(rolApi)}`,
    { method: 'PATCH' }
  )
  return adaptarUsuarioApi(respuesta)
}

export function desactivarUsuarioApi(idUsuario) {
  return apiRequest(`${RUTA}/${encodeURIComponent(idUsuario)}`, { method: 'DELETE' })
}
