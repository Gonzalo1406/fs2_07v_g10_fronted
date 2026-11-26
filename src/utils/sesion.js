import { calcularDescuento } from './validaciones'

const CLAVE_SESION_JWT = 'levelup_auth_session'

function tokenVencido(token) {
  try {
    const segmento = token.split('.')[1]
    const base64 = segmento.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')))
    return Number.isFinite(payload.exp) && payload.exp * 1000 <= Date.now()
  } catch {
    return false
  }
}

function usuarioDesdeRespuesta(respuesta) {
  const rolServidor = String(respuesta.rol || '').toUpperCase()
  const roles = {
    ADMINISTRADOR: 'admin',
    VENDEDOR: 'seller',
    CLIENTE: 'client',
  }
  const correo = String(respuesta.email || '').trim().toLowerCase()

  return {
    idUsuario: respuesta.idUsuario,
    nombre: [respuesta.nombre, respuesta.apellido].filter(Boolean).join(' '),
    correo,
    rol: roles[rolServidor] || 'client',
    descuento: calcularDescuento(correo),
    puntos: 0,
    codigoPropio: '',
  }
}

export function crearSesionDesdeRespuesta(respuesta) {
  if (!respuesta?.token || !respuesta?.email || !respuesta?.rol) {
    throw new Error('El backend devolvió una respuesta de inicio de sesión incompleta.')
  }

  return {
    token: respuesta.token,
    refreshToken: respuesta.refreshToken || null,
    tipo: respuesta.tipo || 'Bearer',
    usuario: usuarioDesdeRespuesta(respuesta),
  }
}

export function leerSesionAutenticada() {
  try {
    const sesion = JSON.parse(sessionStorage.getItem(CLAVE_SESION_JWT))
    if (!sesion?.token || !sesion?.usuario || (tokenVencido(sesion.token) && !sesion.refreshToken)) {
      sessionStorage.removeItem(CLAVE_SESION_JWT)
      return null
    }
    return sesion
  } catch {
    sessionStorage.removeItem(CLAVE_SESION_JWT)
    return null
  }
}

export function guardarSesionAutenticada(sesion) {
  sessionStorage.setItem(CLAVE_SESION_JWT, JSON.stringify(sesion))
}

export function limpiarSesionAutenticada() {
  sessionStorage.removeItem(CLAVE_SESION_JWT)
}

export function obtenerTokenSesion() {
  return leerSesionAutenticada()?.token || null
}

export function obtenerRefreshTokenSesion() {
  return leerSesionAutenticada()?.refreshToken || null
}

export function actualizarTokensSesion(respuesta) {
  const sesion = leerSesionAutenticada()
  if (!sesion || !respuesta?.token) return null
  const renovada = {
    ...sesion,
    token: respuesta.token,
    refreshToken: respuesta.refreshToken || sesion.refreshToken,
    tipo: respuesta.tipo || sesion.tipo || 'Bearer',
  }
  guardarSesionAutenticada(renovada)
  return renovada
}
