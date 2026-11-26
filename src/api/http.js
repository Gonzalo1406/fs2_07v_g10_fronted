import {
  actualizarTokensSesion,
  limpiarSesionAutenticada,
  obtenerRefreshTokenSesion,
  obtenerTokenSesion,
} from '../utils/sesion'

let renovacionEnCurso = null

async function renovarAccessToken() {
  if (!renovacionEnCurso) {
    renovacionEnCurso = (async () => {
      const refreshToken = obtenerRefreshTokenSesion()
      if (!refreshToken) return null

      try {
        const respuesta = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
        if (!respuesta.ok) return null
        return actualizarTokensSesion(await respuesta.json())?.token || null
      } catch {
        return null
      } finally {
        renovacionEnCurso = null
      }
    })()
  }
  return renovacionEnCurso
}

function opcionesFetch(opciones, token) {
  const { headers: cabecerasIniciales, body, sinAutenticacion, ...resto } = opciones
  const cabeceras = new Headers(cabecerasIniciales)
  if (body !== undefined && !cabeceras.has('Content-Type')) cabeceras.set('Content-Type', 'application/json')
  if (token && sinAutenticacion !== true) cabeceras.set('Authorization', `Bearer ${token}`)
  return {
    ...resto,
    body: body === undefined || typeof body === 'string' ? body : JSON.stringify(body),
    headers: cabeceras,
  }
}

function emitirSesionExpirada() {
  limpiarSesionAutenticada()
  window.dispatchEvent(new Event('levelup:sesion-expirada'))
}

export async function apiRequest(ruta, opciones = {}) {
  const { token: tokenOpcional, sinAutenticacion } = opciones
  const token = sinAutenticacion === true ? null : tokenOpcional ?? obtenerTokenSesion()
  let respuesta = await fetch(ruta, opcionesFetch(opciones, token))

  if (respuesta.status === 401 && token && !ruta.includes('/auth/refresh')) {
    const tokenRenovado = await renovarAccessToken()
    if (tokenRenovado) respuesta = await fetch(ruta, opcionesFetch(opciones, tokenRenovado))
    if (respuesta.status === 401) emitirSesionExpirada()
  }

  if (respuesta.status === 204) return null

  const resultado = await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    throw new Error(
      resultado?.mensaje || resultado?.message || resultado?.error ||
      `La solicitud falló (HTTP ${respuesta.status}).`
    )
  }

  return resultado
}
