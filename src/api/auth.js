import { apiRequest } from './http'

export function iniciarSesionApi(correo, contrasena) {
  return apiRequest('/api/v1/auth/login', {
    method: 'POST',
    sinAutenticacion: true,
    body: { email: correo.trim().toLowerCase(), password: contrasena },
  })
}

export function registrarUsuarioApi(datos) {
  return apiRequest('/api/v1/usuarios/registro', {
    method: 'POST',
    sinAutenticacion: true,
    body: {
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      email: datos.correo.trim().toLowerCase(),
      password: datos.contrasena,
    },
  })
}
