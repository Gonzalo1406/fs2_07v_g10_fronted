import { useState } from 'react'
import { Alert, Button, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function AdminUsuariosView({ usuarios = [], onEliminar }) {
  const [aviso, setAviso] = useState(null)

  async function eliminar(usuario) {
    if (!window.confirm(`¿Eliminar a "${usuario.nombre}"?`)) {
      return
    }

    const resultado = await onEliminar(usuario.correo)

    setAviso(
      resultado.error
        ? { tipo: 'danger', texto: resultado.error }
        : { tipo: 'success', texto: `Usuario ${usuario.correo} eliminado.` }
    )
  }

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-0">Usuarios</h1>
        <Button as={Link} to="/admin/usuarios/nuevo" className="btn-gamer">
          Nuevo usuario
        </Button>
      </div>

      {aviso && <Alert variant={aviso.tipo}>{aviso.texto}</Alert>}

      <p>{usuarios.length} usuario(s)</p>

      <Table responsive variant="dark" className="align-middle">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.correo}>
              <td>{usuario.nombre}</td>
              <td>{usuario.correo}</td>
              <td>{{ admin: 'Administrador', seller: 'Vendedor', client: 'Cliente' }[usuario.rol] || 'Cliente'}</td>
              <td>{usuario.activo === false ? 'Inactivo' : 'Activo'}</td>
              <td className="text-end">
                <div className="d-flex flex-wrap gap-2 justify-content-end">
                  <Button
                    as={Link}
                    to={`/admin/usuarios/${usuario.correo}`}
                    size="sm"
                    variant="outline-light"
                    aria-label={`Cambiar rol de ${usuario.nombre}`}
                  >
                    Cambiar rol
                  </Button>
                  <Button
                    as={Link}
                    to={`/admin/usuarios/${usuario.correo}/compras`}
                    size="sm"
                    variant="outline-light"
                    aria-label={`Historial de ${usuario.nombre}`}
                  >
                    Historial
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    aria-label={`Eliminar ${usuario.nombre}`}
                    onClick={() => eliminar(usuario)}
                  >
                    Eliminar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {usuarios.length === 0 && <p>Aún no hay usuarios registrados.</p>}
    </section>
  )
}

export default AdminUsuariosView
