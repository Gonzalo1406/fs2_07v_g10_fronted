import { apiRequest } from './http'

const RUTA = '/api/v1/boletas'

export function crearBoletaApi(orden) {
  return apiRequest(RUTA, {
    method: 'POST',
    body: {
      estado: orden.estado,
      motivo: orden.motivo,
      cliente: orden.cliente,
      direccion: orden.direccion,
      items: orden.items.map(({ codigo, nombre, precio, cantidad }) => ({
        codigo,
        nombre,
        precio,
        cantidad,
      })),
    },
  })
}

export function obtenerBoletasApi({ signal } = {}) {
  return apiRequest(RUTA, { signal })
}
