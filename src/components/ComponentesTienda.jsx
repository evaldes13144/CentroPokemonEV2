import { useState } from 'react';

// 1. Componente de Botón Reutilizable
export function BotonAccion({ label, onClick, className = 'btn', type = 'button', disabled = false }) {
  return (
    <button type={type} className={className} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

// 2. Componente de Tarjeta de Producto/Servicio
export function TarjetaServicio({ item, onAgregar, onVerDetalle }) {
  const precioFinal = item.oferta && item.precioOferta !== undefined ? item.precioOferta : item.precio;

  return (
    <div className="card" data-testid={`producto-${item.id}`}>
      {item.oferta && <span className="badge-oferta">¡OFERTA!</span>}
      {item.img && <img src={item.img} alt={item.nombre} className="poke-img" />}
      <h3>{item.nombre}</h3>
      <p><strong>Categoría:</strong> {item.categoria}</p>
      <p>
        <strong>Precio:</strong>{' '}
        {item.oferta && item.precioOferta !== undefined ? (
          <>
            <span className="precio-tachado">${item.precio}</span>{' '}
            <span className="precio-oferta">${item.precioOferta} Pokédolares</span>
          </>
        ) : (
          <span>${precioFinal} Pokédolares</span>
        )}
      </p>
      <p><small>Stock disponible: {item.stock ?? 10}</small></p>
      <div className="card-actions">
        <button className="btn-add" onClick={() => onAgregar(item)}>
          Añadir al Carrito
        </button>
        {onVerDetalle && (
          <button className="btn-secondary" onClick={() => onVerDetalle(item)}>
            Ver Detalle
          </button>
        )}
      </div>
    </div>
  );
}

// 3. Componente de Lista de Productos
export function ListaProductos({ productos, onAgregar, onVerDetalle }) {
  if (!productos || productos.length === 0) {
    return <p className="sin-resultados">No se encontraron productos disponibles.</p>;
  }

  return (
    <div className="grid">
      {productos.map((item) => (
        <TarjetaServicio
          key={item.id}
          item={item}
          onAgregar={onAgregar}
          onVerDetalle={onVerDetalle}
        />
      ))}
    </div>
  );
}

// 4. Formulario de Contacto con Validación
export function FormularioContacto({ onEnviar }) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  const manejarSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim() || !correo.trim() || !mensaje.trim()) {
      setError('Todos los campos son obligatorios');
      setExito(false);
      return;
    }
    if (!correo.includes('@')) {
      setError('Ingresa un correo electrónico válido');
      setExito(false);
      return;
    }
    setError('');
    setExito(true);
    if (onEnviar) {
      onEnviar({ nombre, correo, mensaje });
    }
    setNombre('');
    setCorreo('');
    setMensaje('');
  };

  return (
    <form className="form-contacto" onSubmit={manejarSubmit} noValidate>
      {error && <p className="mensaje-error" role="alert">{error}</p>}
      {exito && <p className="mensaje-exito">¡Mensaje enviado correctamente al Centro Pokémon!</p>}

      <div className="campo">
        <label htmlFor="contacto-nombre">Nombre Completo:</label>
        <input
          id="contacto-nombre"
          type="text"
          placeholder="Ej: Ash Ketchum"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>
      <div className="campo">
        <label htmlFor="contacto-correo">Correo Electrónico:</label>
        <input
          id="contacto-correo"
          type="email"
          placeholder="entrenador@ejemplo.com"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
      </div>
      <div className="campo">
        <label htmlFor="contacto-mensaje">Mensaje:</label>
        <textarea
          id="contacto-mensaje"
          rows="4"
          placeholder="Escribe tu mensaje..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
        ></textarea>
      </div>
      <button type="submit" className="btn">Enviar Mensaje</button>
    </form>
  );
}