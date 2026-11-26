import { useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

function LoginView({ onIniciarSesion }) {
  const navigate = useNavigate()
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function enviar(event) {
    event.preventDefault()
    setCargando(true)
    setError('')

    try {
      const resultado = await onIniciarSesion(correo, contrasena)
      if (resultado === true || resultado?.success) {
        navigate('/perfil')
      } else {
        setError(resultado?.error || 'Correo o contraseña incorrectos.')
      }
    } catch (errorInicio) {
      setError(errorInicio.message || 'No fue posible iniciar sesión.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <section data-bs-theme="dark" style={{ maxWidth: 480 }}>
      <h1 className="mb-3">Iniciar sesión</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form noValidate onSubmit={enviar}>
        <Form.Group className="mb-3" controlId="loginCorreo">
          <Form.Label>Correo</Form.Label>
          <Form.Control
            type="email"
            autoComplete="username"
            required
            value={correo}
            onChange={(event) => setCorreo(event.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="loginContrasena">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            autoComplete="current-password"
            required
            value={contrasena}
            onChange={(event) => setContrasena(event.target.value)}
          />
        </Form.Group>

        <Button type="submit" className="btn-gamer" disabled={cargando}>
          {cargando ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </Form>
    </section>
  )
}

export default LoginView
