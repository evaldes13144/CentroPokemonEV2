import { useState, useEffect } from 'react';
import './App.css';
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerCategorias,
  crearCategoria,
  obtenerUsuarios,
  registrarUsuario,
  eliminarUsuario,
  obtenerSesion,
  guardarSesion,
  obtenerCarritoLS,
  guardarCarritoLS,
  obtenerOrdenes,
  crearOrden,
  blogsIniciales,
  regionesComunas,
} from './data/pokemonDB';
import {
  ListaProductos,
  FormularioContacto,
  BotonAccion,
} from './components/ComponentesTienda';

export default function App() {
  const [pagina, setPagina] = useState('inicio');
  const [productos, setProductos] = useState(() => obtenerProductos());
  const [categorias, setCategorias] = useState(() => obtenerCategorias());
  const [usuarios, setUsuarios] = useState(() => obtenerUsuarios());
  const [ordenes, setOrdenes] = useState(() => obtenerOrdenes());
  const [carrito, setCarrito] = useState(() => obtenerCarritoLS());
  const [usuarioActivo, setUsuarioActivo] = useState(() => obtenerSesion());

  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [blogDetalle, setBlogDetalle] = useState(null);
  const [ultimaOrden, setUltimaOrden] = useState(null);
  const [adminTab, setAdminTab] = useState('dashboard');

  const [loginForm, setLoginForm] = useState({ correo: '', pass: '', error: '' });
  const [registroForm, setRegistroForm] = useState({
    nombre: '', apellidos: '', correo: '', pass: '', calle: '', region: 'Región Metropolitana de Santiago', comuna: 'La Florida', error: ''
  });
  const [checkoutForm, setCheckoutForm] = useState({
    nombre: '', apellidos: '', correo: '', calle: '', depto: '', region: 'Región Metropolitana de Santiago', comuna: 'Cerrillos', indicaciones: '', error: ''
  });
  const [nuevoProdForm, setNuevoProdForm] = useState({
    nombre: '', categoria: 'items', precio: '', stock: 10, critico: 5, oferta: false, precioOferta: '', descripcion: ''
  });
  const [editandoProd, setEditandoProd] = useState(null);
  const [nuevaCatForm, setNuevaCatForm] = useState({ id: '', nombre: '', descripcion: '' });

  useEffect(() => {
    guardarCarritoLS(carrito);
  }, [carrito]);

  // Autocompletar Checkout si el usuario ha iniciado sesión
  useEffect(() => {
    if (usuarioActivo) {
      setCheckoutForm((prev) => ({
        ...prev,
        nombre: usuarioActivo.nombre || '',
        apellidos: usuarioActivo.apellidos || '',
        correo: usuarioActivo.correo || '',
        calle: usuarioActivo.calle || '',
        depto: usuarioActivo.depto || '',
        region: usuarioActivo.region || 'Región Metropolitana de Santiago',
        comuna: usuarioActivo.comuna || 'Santiago',
      }));
    }
  }, [usuarioActivo]);

  // Funciones del Carrito con soporte de cantidades
  const agregarAlCarrito = (item) => {
    const precioAplicado = item.oferta && item.precioOferta !== undefined ? item.precioOferta : item.precio;
    setCarrito((prev) => {
      const existe = prev.find((p) => p.id === item.id);
      if (existe) {
        return prev.map((p) => (p.id === item.id ? { ...p, cantidad: (p.cantidad || 1) + 1 } : p));
      }
      return [...prev, { ...item, precio: precioAplicado, cantidad: 1 }];
    });
  };

  const cambiarCantidadCarrito = (id, delta) => {
    setCarrito((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, cantidad: (p.cantidad || 1) + delta } : p))
        .filter((p) => p.cantidad > 0)
    );
  };

  const eliminarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((p) => p.id !== id));
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const totalItemsCarrito = carrito.reduce((acc, item) => acc + (item.cantidad || 1), 0);
  const totalCarrito = carrito.reduce((acc, item) => acc + item.precio * (item.cantidad || 1), 0);

  // Filtrado de productos por categoría y búsqueda
  const serviciosFiltrados = productos.filter((s) => {
    const coincideCat = filtroCategoria === 'todos' || s.categoria === filtroCategoria;
    const coincideTexto = s.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCat && coincideTexto;
  });

  const productosEnOferta = productos.filter((p) => p.oferta);
  const productosCriticos = productos.filter((p) => (p.stock ?? 10) <= (p.critico ?? 5));

  // Manejo de Login y Registro
  const manejarLogin = (e) => {
    e.preventDefault();
    const user = usuarios.find((u) => u.correo === loginForm.correo && u.pass === loginForm.pass);
    if (!user) {
      setLoginForm({ ...loginForm, error: 'Correo o contraseña incorrectos.' });
      return;
    }
    setUsuarioActivo(user);
    guardarSesion(user);
    setLoginForm({ correo: '', pass: '', error: '' });
    setPagina(user.rol === 'admin' ? 'admin' : 'inicio');
  };

  const manejarRegistro = (e) => {
    e.preventDefault();
    if (!registroForm.nombre || !registroForm.correo || !registroForm.pass) {
      setRegistroForm({ ...registroForm, error: 'Completa todos los campos obligatorios.' });
      return;
    }
    const creado = registrarUsuario(registroForm);
    setUsuarios(obtenerUsuarios());
    setUsuarioActivo(creado);
    guardarSesion(creado);
    setPagina('inicio');
  };

  const cerrarSesion = () => {
    setUsuarioActivo(null);
    guardarSesion(null);
    setPagina('inicio');
  };

  // Procesar Pago en Checkout
  const procesarPago = (simularError = false) => {
    if (!checkoutForm.nombre.trim() || !checkoutForm.correo.trim() || !checkoutForm.calle.trim()) {
      setCheckoutForm({ ...checkoutForm, error: 'Por favor completa Nombre, Correo y Calle de entrega.' });
      return;
    }

    const datosOrden = {
      cliente: { ...checkoutForm },
      items: [...carrito],
      total: totalCarrito,
      estado: simularError ? 'Fallido' : 'Pagado',
    };

    const ordenRegistrada = crearOrden(datosOrden);
    setOrdenes(obtenerOrdenes());
    setUltimaOrden(ordenRegistrada);

    if (simularError) {
      setPagina('pago-error');
    } else {
      vaciarCarrito();
      setPagina('pago-correcto');
    }
  };

  // Funciones CRUD Administrador
  const guardarProductoAdmin = (e) => {
    e.preventDefault();
    if (!nuevoProdForm.nombre || nuevoProdForm.precio === '') return;
    if (editandoProd) {
      setProductos(actualizarProducto(editandoProd.id, nuevoProdForm));
      setEditandoProd(null);
    } else {
      setProductos(crearProducto(nuevoProdForm));
    }
    setNuevoProdForm({ nombre: '', categoria: 'items', precio: '', stock: 10, critico: 5, oferta: false, precioOferta: '', descripcion: '' });
  };

  return (
    <div className="app-container">
      {/* Barra superior con el menú y controles de sesión / carrito */}
      <header className="header">
        <div className="header-top">
          <div className="logo" onClick={() => setPagina('inicio')} style={{ cursor: 'pointer' }}>
            <h1>Centro Pokémon</h1>
          </div>

          <div className="buscador-header">
            <input
              type="text"
              placeholder="Buscar servicio o ítem..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar producto"
            />
            <button className="btn-secondary" onClick={() => setPagina('servicios')}>Buscar</button>
          </div>

          <div className="auth-buttons">
            {usuarioActivo ? (
              <>
                <span className="user-badge">Hola, {usuarioActivo.nombre}</span>
                {usuarioActivo.rol === 'admin' && (
                  <button className="btn-admin" onClick={() => setPagina('admin')}>Panel Admin</button>
                )}
                <button className="btn-secondary" onClick={cerrarSesion}>Cerrar Sesión</button>
              </>
            ) : (
              <>
                <button className="btn-secondary" onClick={() => setPagina('login')}>Iniciar Sesión</button>
                <button className="btn" onClick={() => setPagina('registro')}>Crear Cuenta</button>
              </>
            )}
          </div>
        </div>

        <nav className="navbar">
          <button className={pagina === 'inicio' ? 'active' : ''} onClick={() => setPagina('inicio')}>Inicio</button>
          <button className={pagina === 'servicios' ? 'active' : ''} onClick={() => setPagina('servicios')}>Servicios</button>
          <button className={pagina === 'categorias' ? 'active' : ''} onClick={() => setPagina('categorias')}>Categorías</button>
          <button className={pagina === 'ofertas' ? 'active' : ''} onClick={() => setPagina('ofertas')}>Ofertas</button>
          <button className={pagina === 'pokedex' ? 'active' : ''} onClick={() => setPagina('pokedex')}>Pokédex</button>
          <button className={pagina === 'blogs' ? 'active' : ''} onClick={() => setPagina('blogs')}>Blogs</button>
          <button className={pagina === 'nosotros' ? 'active' : ''} onClick={() => setPagina('nosotros')}>Nosotros</button>
          <button className={pagina === 'contacto' ? 'active' : ''} onClick={() => setPagina('contacto')}>Contacto</button>
          
          {/* Botones dinámicos de Autenticación en el menú */}
          {usuarioActivo ? (
            <>
              {usuarioActivo.rol === 'admin' && (
                <button className={pagina === 'admin' ? 'active' : ''} onClick={() => setPagina('admin')}>Panel Admin</button>
              )}
              <button onClick={cerrarSesion} style={{ background: '#d32f2f', color: 'white' }}>Cerrar Sesión ({usuarioActivo.nombre})</button>
            </>
          ) : (
            <>
              <button className={pagina === 'login' ? 'active' : ''} onClick={() => setPagina('login')}>Iniciar Sesión</button>
              <button className={pagina === 'registro' ? 'active' : ''} onClick={() => setPagina('registro')}>Registrarse</button>
            </>
          )}

          <button className="btn-carrito-nav" onClick={() => setPagina('carrito')}>
            🛒 Carrito ({totalItemsCarrito}) - ${totalCarrito}
          </button>
        </nav>
      </header>

      {/* Vistas principales */}
      <main className="main-content">
        {/* 1. INICIO */}
        {pagina === 'inicio' && (
          <section>
            <div className="hero">
              <h2>Bienvenido al Centro Pokémon</h2>
              <p>Salud, bienestar y entrenamiento especializado para tus compañeros de aventura.</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <BotonAccion label="Ver Servicios" onClick={() => setPagina('servicios')} />
                <BotonAccion label="Ver Ofertas Especiales" className="btn-secondary" onClick={() => setPagina('ofertas')} />
              </div>
            </div>

            <div className="servicios-destacados">
              <h2>Nuestros Servicios Destacados</h2>
              <div className="grid">
                <div className="card">
                  <h3>Centro de Curación</h3>
                  <p>Restauración completa de PS y PP en tiempo récord con la tecnología de la Enfermera Joy.</p>
                  <button className="btn-secondary" onClick={() => setPagina('pokedex')}>Ir a la Pokédex</button>
                </div>
                <div className="card">
                  <h3>Categorías de Suministros</h3>
                  <p>Explora nuestros ítems organizados por Salud, Ítems de Combate y Guardería.</p>
                  <button className="btn-secondary" onClick={() => setPagina('categorias')}>Explorar Categorías</button>
                </div>
                <div className="card">
                  <h3>Consejos y Noticias</h3>
                  <p>Mantente informado con las últimas noticias y consejos para ser un mejor Entrenador.</p>
                  <button className="btn-secondary" onClick={() => setPagina('blogs')}>Leer Artículos</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 2. CATÁLOGO DE SERVICIOS Y PRODUCTOS */}
        {pagina === 'servicios' && (
          <section>
            <h2>Catálogo de Servicios y Suministros</h2>
            <div className="filtros">
              <label htmlFor="cat">Filtrar por categoría: </label>
              <select id="cat" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                <option value="todos">Todos los servicios</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <ListaProductos
              productos={serviciosFiltrados}
              onAgregar={agregarAlCarrito}
              onVerDetalle={(item) => {
                setProductoDetalle(item);
                setPagina('detalle-producto');
              }}
            />

            {/* Ventana flotante del carrito */}
            <button className="btn-carrito-flotante" onClick={() => setMostrarCarrito(!mostrarCarrito)}>
              Carrito ({totalItemsCarrito})
            </button>

            {mostrarCarrito && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>Carrito de Compras</h3>
                  {carrito.length === 0 ? (
                    <p>Tu carrito está vacío.</p>
                  ) : (
                    <ul>
                      {carrito.map((prod) => (
                        <li key={prod.id}>
                          {prod.nombre} (x{prod.cantidad || 1}) - ${prod.precio * (prod.cantidad || 1)}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p><strong>Total: ${totalCarrito} Pokédolares</strong></p>
                  <div className="modal-actions">
                    <button onClick={vaciarCarrito}>Vaciar</button>
                    <button onClick={() => { setMostrarCarrito(false); setPagina('checkout'); }}>Ir a Pagar</button>
                    <button onClick={() => setMostrarCarrito(false)}>Cerrar</button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 3. DETALLE DE PRODUCTO */}
        {pagina === 'detalle-producto' && productoDetalle && (
          <section className="detalle-container">
            <button className="btn-secondary" onClick={() => setPagina('servicios')}>← Volver al Catálogo</button>
            <div className="card detalle-card">
              {productoDetalle.img && (
                <img src={productoDetalle.img} alt={productoDetalle.nombre} className="poke-img-large" />
              )}
              <h2>{productoDetalle.nombre}</h2>
              <p><strong>Categoría:</strong> {productoDetalle.categoria.toUpperCase()}</p>
              <p>{productoDetalle.descripcion || 'Suministro oficial certificado por la Liga Pokémon.'}</p>
              <p><strong>Stock disponible:</strong> {productoDetalle.stock ?? 10} unidades</p>
              <h3>Precio: ${productoDetalle.oferta ? productoDetalle.precioOferta : productoDetalle.precio} Pokédolares</h3>
              <button className="btn-add" onClick={() => agregarAlCarrito(productoDetalle)}>
                Añadir a la Mochila
              </button>
            </div>
          </section>
        )}

        {/* 4. VISTA CATEGORÍAS (Figura 4 PDF) */}
        {pagina === 'categorias' && (
          <section>
            <h2>Explorar por Categorías</h2>
            <div className="grid">
              {categorias.map((cat) => (
                <div
                  key={cat.id}
                  className={`card ${filtroCategoria === cat.id ? 'categoria-activa' : ''}`}
                  onClick={() => setFiltroCategoria(cat.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <h3>{cat.nombre}</h3>
                  <p>{cat.descripcion}</p>
                  <button className="btn-secondary" onClick={() => setFiltroCategoria(cat.id)}>
                    Ver {cat.nombre}
                  </button>
                </div>
              ))}
            </div>

            <h3 style={{ marginTop: '2rem' }}>
              Productos en: {filtroCategoria === 'todos' ? 'Todas las Categorías' : filtroCategoria.toUpperCase()}
            </h3>
            <ListaProductos
              productos={serviciosFiltrados}
              onAgregar={agregarAlCarrito}
              onVerDetalle={(item) => {
                setProductoDetalle(item);
                setPagina('detalle-producto');
              }}
            />
          </section>
        )}

        {/* 5. VISTA OFERTAS (Figura 8 PDF) */}
        {pagina === 'ofertas' && (
          <section>
            <h2>Ofertas Especiales del Centro Pokémon</h2>
            <p>Aprovecha descuentos exclusivos en suministros médicos y equipamiento para entrenadores.</p>
            <ListaProductos
              productos={productosEnOferta}
              onAgregar={agregarAlCarrito}
              onVerDetalle={(item) => {
                setProductoDetalle(item);
                setPagina('detalle-producto');
              }}
            />
          </section>
        )}

        {/* 6. VISTA CARRITO DE COMPRAS COMPLETO (Figura 5 PDF) */}
        {pagina === 'carrito' && (
          <section>
            <h2>Carrito de Compras</h2>
            {carrito.length === 0 ? (
              <div className="card">
                <p>Tu mochila está vacía. ¡Explora nuestros suministros para equiparte!</p>
                <button className="btn" onClick={() => setPagina('servicios')}>Ver Productos</button>
              </div>
            ) : (
              <div className="card">
                <div className="tabla-responsive">
                  <table className="tabla-carrito">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carrito.map((item) => (
                        <tr key={item.id}>
                          <td>{item.nombre}</td>
                          <td>${item.precio}</td>
                          <td>
                            <button className="btn-qty" onClick={() => cambiarCantidadCarrito(item.id, -1)}>-</button>
                            <span style={{ margin: '0 10px' }}>{item.cantidad || 1}</span>
                            <button className="btn-qty" onClick={() => cambiarCantidadCarrito(item.id, 1)}>+</button>
                          </td>
                          <td>${item.precio * (item.cantidad || 1)}</td>
                          <td>
                            <button className="btn-danger" onClick={() => eliminarDelCarrito(item.id)}>Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="carrito-resumen">
                  <h3>Total a Pagar: ${totalCarrito} Pokédolares</h3>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button className="btn-secondary" onClick={vaciarCarrito}>Limpiar Carrito</button>
                    <button className="btn" onClick={() => setPagina('checkout')}>Comprar Ahora</button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 7. VISTA CHECKOUT / PASO DE PAGO (Figura 6 PDF) */}
        {pagina === 'checkout' && (
          <section>
            <h2>Checkout - Finalizar Compra</h2>
            {usuarioActivo && (
              <p className="mensaje-exito">
                Sesión activa como <strong>{usuarioActivo.nombre} {usuarioActivo.apellidos}</strong>. Tus datos de envío se han autocompletado.
              </p>
            )}
            {checkoutForm.error && <p className="mensaje-error" role="alert">{checkoutForm.error}</p>}

            <div className="card">
              <h3>Resumen del Pedido (Total: ${totalCarrito} Pokédolares)</h3>
              <ul>
                {carrito.map((item) => (
                  <li key={item.id}>
                    {item.nombre} x {item.cantidad || 1} = ${item.precio * (item.cantidad || 1)}
                  </li>
                ))}
              </ul>

              <hr style={{ margin: '1.5rem 0' }} />

              <h3>Información del Cliente</h3>
              <div className="grid-form">
                <div className="campo">
                  <label>Nombre*</label>
                  <input
                    type="text"
                    value={checkoutForm.nombre}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, nombre: e.target.value })}
                    placeholder="Nombre"
                  />
                </div>
                <div className="campo">
                  <label>Apellidos*</label>
                  <input
                    type="text"
                    value={checkoutForm.apellidos}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, apellidos: e.target.value })}
                    placeholder="Apellidos"
                  />
                </div>
                <div className="campo">
                  <label>Correo*</label>
                  <input
                    type="email"
                    value={checkoutForm.correo}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, correo: e.target.value })}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <h3>Dirección de entrega de los productos</h3>
              <div className="grid-form">
                <div className="campo">
                  <label>Calle*</label>
                  <input
                    type="text"
                    value={checkoutForm.calle}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, calle: e.target.value })}
                    placeholder="Av. Principal 123"
                  />
                </div>
                <div className="campo">
                  <label>Departamento (opcional)</label>
                  <input
                    type="text"
                    value={checkoutForm.depto}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, depto: e.target.value })}
                    placeholder="Ej: Depto 603"
                  />
                </div>
                <div className="campo">
                  <label>Región*</label>
                  <select
                    value={checkoutForm.region}
                    onChange={(e) => {
                      const nuevaRegion = e.target.value;
                      setCheckoutForm({
                        ...checkoutForm,
                        region: nuevaRegion,
                        comuna: regionesComunas[nuevaRegion][0],
                      });
                    }}
                  >
                    {Object.keys(regionesComunas).map((reg) => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>
                <div className="campo">
                  <label>Comuna*</label>
                  <select
                    value={checkoutForm.comuna}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, comuna: e.target.value })}
                  >
                    {(regionesComunas[checkoutForm.region] || []).map((com) => (
                      <option key={com} value={com}>{com}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="campo">
                <label>Indicaciones para la entrega (opcional)</label>
                <textarea
                  rows="2"
                  value={checkoutForm.indicaciones}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, indicaciones: e.target.value })}
                  placeholder="Ej: Entre calles, color del edificio, dejar en conserjería."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '1rem', flexWrap: 'wrap' }}>
                <button className="btn" onClick={() => procesarPago(false)}>
                  Pagar ahora ${totalCarrito}
                </button>
                <button className="btn-danger" onClick={() => procesarPago(true)}>
                  Simular Pago con Error
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 8. VISTA COMPRA EXITOSA (Figura 7 PDF) */}
        {pagina === 'pago-correcto' && ultimaOrden && (
          <section>
            <div className="card">
              <p style={{ textAlign: 'right' }}><small>Código orden: {ultimaOrden.codigo}</small></p>
              <h2 style={{ color: '#2e7d32' }}>✅ Se ha realizado la compra. nro {ultimaOrden.nroOrden}</h2>
              <p><strong>Cliente:</strong> {ultimaOrden.cliente.nombre} {ultimaOrden.cliente.apellidos} ({ultimaOrden.cliente.correo})</p>
              <p><strong>Dirección de entrega:</strong> {ultimaOrden.cliente.calle} {ultimaOrden.cliente.depto}, {ultimaOrden.cliente.comuna}, {ultimaOrden.cliente.region}</p>
              {ultimaOrden.cliente.indicaciones && (
                <p><strong>Indicaciones:</strong> {ultimaOrden.cliente.indicaciones}</p>
              )}

              <h4>Detalle de Productos Pagados:</h4>
              <ul>
                {ultimaOrden.items.map((it) => (
                  <li key={it.id}>{it.nombre} x {it.cantidad || 1} — ${it.precio * (it.cantidad || 1)}</li>
                ))}
              </ul>
              <h3>Total pagado: ${ultimaOrden.total} Pokédolares</h3>
              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button className="btn" onClick={() => window.print()}>Imprimir boleta en PDF</button>
                <button className="btn-secondary" onClick={() => setPagina('inicio')}>Volver al Inicio</button>
              </div>
            </div>
          </section>
        )}

        {/* 9. VISTA PAGO CON ERROR (Figura 8 PDF) */}
        {pagina === 'pago-error' && (
          <section>
            <div className="card">
              <h2 style={{ color: '#c62828' }}>❌ No se pudo realizar el pago. nro {ultimaOrden?.nroOrden || '#2026000'}</h2>
              <p>Hubo un inconveniente al procesar la transacción con el Banco Pokémon.</p>
              <button className="btn" onClick={() => setPagina('checkout')}>
                VOLVER A REALIZAR EL PAGO
              </button>
            </div>
          </section>
        )}

        {/* 10. LOGIN E INICIO DE SESIÓN */}
        {pagina === 'login' && (
          <section>
            <h2>Iniciar Sesión</h2>
            <form className="form-contacto" onSubmit={manejarLogin}>
              {loginForm.error && <p className="mensaje-error" role="alert">{loginForm.error}</p>}
              <p><small>Demo Admin: <strong>admin@centropokemon.cl</strong> / Pass: <strong>admin123</strong></small></p>
              <p><small>Demo Cliente: <strong>ash@pueblopaleta.cl</strong> / Pass: <strong>pikachu123</strong></small></p>
              <div className="campo">
                <label>Correo Electrónico:</label>
                <input
                  type="email"
                  required
                  value={loginForm.correo}
                  onChange={(e) => setLoginForm({ ...loginForm, correo: e.target.value })}
                />
              </div>
              <div className="campo">
                <label>Contraseña:</label>
                <input
                  type="password"
                  required
                  value={loginForm.pass}
                  onChange={(e) => setLoginForm({ ...loginForm, pass: e.target.value })}
                />
              </div>
              <button type="submit" className="btn">Ingresar</button>
            </form>
          </section>
        )}

        {/* 11. REGISTRO DE USUARIO */}
        {pagina === 'registro' && (
          <section>
            <h2>Registro de Nuevo Entrenador</h2>
            <form className="form-contacto" onSubmit={manejarRegistro}>
              {registroForm.error && <p className="mensaje-error">{registroForm.error}</p>}
              <div className="campo">
                <label>Nombre:</label>
                <input type="text" required value={registroForm.nombre} onChange={(e) => setRegistroForm({ ...registroForm, nombre: e.target.value })} />
              </div>
              <div className="campo">
                <label>Apellidos:</label>
                <input type="text" required value={registroForm.apellidos} onChange={(e) => setRegistroForm({ ...registroForm, apellidos: e.target.value })} />
              </div>
              <div className="campo">
                <label>Correo:</label>
                <input type="email" required value={registroForm.correo} onChange={(e) => setRegistroForm({ ...registroForm, correo: e.target.value })} />
              </div>
              <div className="campo">
                <label>Contraseña:</label>
                <input type="password" required value={registroForm.pass} onChange={(e) => setRegistroForm({ ...registroForm, pass: e.target.value })} />
              </div>
              <div className="campo">
                <label>Dirección (Calle y número):</label>
                <input type="text" required value={registroForm.calle} onChange={(e) => setRegistroForm({ ...registroForm, calle: e.target.value })} />
              </div>
              <button type="submit" className="btn">Crear Cuenta</button>
            </form>
          </section>
        )}

        {/* 12. POKÉDEX */}
        {pagina === 'pokedex' && (
          <section>
            <h2>Pokédex Regional</h2>
            <p>Consulta la información básica de las especies Pokémon atendidas en nuestro centro.</p>
            <div className="grid">
              <div className="card">
                <img src="/png/bulbasaur.png" alt="Bulbasaur" className="poke-img" />
                <h3>Bulbasaur #001</h3>
                <p><strong>Tipo:</strong> Planta / Veneno</p>
                <p>Nace con una semilla en el lomo que va creciendo con él.</p>
              </div>
              <div className="card">
                <img src="/png/charmander.png" alt="Charmander" className="poke-img" />
                <h3>Charmander #004</h3>
                <p><strong>Tipo:</strong> Fuego</p>
                <p>La llama de su cola indica la salud y fuerza vital que posee.</p>
              </div>
              <div className="card">
                <img src="/png/squirtle.png" alt="Squirtle" className="poke-img" />
                <h3>Squirtle #007</h3>
                <p><strong>Tipo:</strong> Agua</p>
                <p>Su caparazón reduce la resistencia al agua al nadar.</p>
              </div>
            </div>
          </section>
        )}

        {/* 13. BLOGS Y DETALLE DE BLOG (Figura 3 PDF) */}
        {pagina === 'blogs' && (
          <section>
            <h2>Noticias y Artículos de Interés</h2>
            {blogDetalle ? (
              <div className="card">
                <button className="btn-secondary" onClick={() => setBlogDetalle(null)}>← Volver a Noticias</button>
                <h3>{blogDetalle.titulo}</h3>
                <p><small>{blogDetalle.fecha} | Por {blogDetalle.autor}</small></p>
                <p>{blogDetalle.contenido}</p>
              </div>
            ) : (
              <div className="grid">
                {blogsIniciales.map((b) => (
                  <article key={b.id} className="card">
                    <h3>{b.titulo}</h3>
                    <p><small>{b.fecha}</small></p>
                    <p>{b.resumen}</p>
                    <button className="btn-secondary" onClick={() => setBlogDetalle(b)}>Leer Artículo Completo</button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 14. NOSOTROS */}
        {pagina === 'nosotros' && (
          <section>
            <h2>Sobre Nosotros</h2>
            <div className="grid">
              <div className="card">
                <h3>Misión</h3>
                <p>Brindar atención médica, curativa y preventiva de la más alta calidad.</p>
              </div>
              <div className="card">
                <h3>Visión</h3>
                <p>Ser la red asistencial líder en innovación médica e investigación Pokémon.</p>
              </div>
            </div>
          </section>
        )}

        {/* 15. CONTACTO */}
        {pagina === 'contacto' && (
          <section>
            <h2>Formulario de Contacto</h2>
            <FormularioContacto />
          </section>
        )}

        {/* 16. PANEL DE ADMINISTRADOR (Figuras 9 y 10 PDF) */}
        {pagina === 'admin' && (
          <section className="admin-panel">
            <h2>Panel Administrativo - Centro Pokémon</h2>
            <div className="admin-nav" style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={() => setAdminTab('dashboard')}>Dashboard</button>
              <button className="btn-secondary" onClick={() => setAdminTab('productos')}>Productos ({productos.length})</button>
              <button className="btn-secondary" onClick={() => setAdminTab('criticos')}>Stock Crítico ({productosCriticos.length})</button>
              <button className="btn-secondary" onClick={() => setAdminTab('ordenes')}>Órdenes / Boletas ({ordenes.length})</button>
              <button className="btn-secondary" onClick={() => setAdminTab('categorias')}>Categorías ({categorias.length})</button>
              <button className="btn-secondary" onClick={() => setAdminTab('usuarios')}>Usuarios ({usuarios.length})</button>
            </div>

            {adminTab === 'dashboard' && (
              <div className="grid">
                <div className="card" style={{ borderTop: '4px solid #1976d2' }}>
                  <h3>🛒 Compras / Órdenes</h3>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{ordenes.length}</p>
                  <p>Órdenes registradas en el sistema</p>
                </div>
                <div className="card" style={{ borderTop: '4px solid #2e7d32' }}>
                  <h3>📦 Productos</h3>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{productos.length}</p>
                  <p>Críticos de stock: {productosCriticos.length}</p>
                </div>
                <div className="card" style={{ borderTop: '4px solid #f9a825' }}>
                  <h3>👥 Usuarios</h3>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{usuarios.length}</p>
                  <p>Entrenadores y administradores</p>
                </div>
              </div>
            )}

            {adminTab === 'productos' && (
              <div className="card">
                <h3>{editandoProd ? `Editando: ${editandoProd.nombre}` : 'Nuevo Producto / Servicio'}</h3>
                <form onSubmit={guardarProductoAdmin} className="grid-form" style={{ marginBottom: '1.5rem' }}>
                  <input
                    type="text"
                    placeholder="Nombre del producto"
                    required
                    value={nuevoProdForm.nombre}
                    onChange={(e) => setNuevoProdForm({ ...nuevoProdForm, nombre: e.target.value })}
                  />
                  <select
                    value={nuevoProdForm.categoria}
                    onChange={(e) => setNuevoProdForm({ ...nuevoProdForm, categoria: e.target.value })}
                  >
                    {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                  <input
                    type="number"
                    placeholder="Precio"
                    required
                    value={nuevoProdForm.precio}
                    onChange={(e) => setNuevoProdForm({ ...nuevoProdForm, precio: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={nuevoProdForm.stock}
                    onChange={(e) => setNuevoProdForm({ ...nuevoProdForm, stock: e.target.value })}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="checkbox"
                      checked={nuevoProdForm.oferta}
                      onChange={(e) => setNuevoProdForm({ ...nuevoProdForm, oferta: e.target.checked })}
                    />
                    ¿En Oferta?
                  </label>
                  <button type="submit" className="btn">{editandoProd ? 'Guardar Cambios' : 'Crear Producto'}</button>
                </form>

                <table className="tabla-carrito">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.nombre}</td>
                        <td>{p.categoria}</td>
                        <td>${p.precio}</td>
                        <td>{p.stock ?? 10}</td>
                        <td>
                          <button
                            className="btn-secondary"
                            onClick={() => {
                              setEditandoProd(p);
                              setNuevoProdForm({
                                nombre: p.nombre,
                                categoria: p.categoria,
                                precio: p.precio,
                                stock: p.stock ?? 10,
                                critico: p.critico ?? 5,
                                oferta: Boolean(p.oferta),
                                precioOferta: p.precioOferta || '',
                                descripcion: p.descripcion || '',
                              });
                            }}
                          >
                            Editar
                          </button>{' '}
                          <button className="btn-danger" onClick={() => setProductos(eliminarProducto(p.id))}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {adminTab === 'criticos' && (
              <div className="card">
                <h3>Listado de Productos con Stock Crítico</h3>
                {productosCriticos.length === 0 ? (
                  <p>Todo el inventario se encuentra en niveles óptimos.</p>
                ) : (
                  <ul>
                    {productosCriticos.map((p) => (
                      <li key={p.id}>
                        <strong>{p.nombre}</strong> — Stock actual: {p.stock} (Mínimo requerido: {p.critico})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {adminTab === 'ordenes' && (
              <div className="card">
                <h3>Historial de Órdenes y Boletas</h3>
                {ordenes.length === 0 ? (
                  <p>Aún no hay órdenes registradas.</p>
                ) : (
                  <ul>
                    {ordenes.map((o) => (
                      <li key={o.id}>
                        <strong>{o.nroOrden} ({o.codigo})</strong> - Cliente: {o.cliente.nombre} {o.cliente.apellidos} - Total: ${o.total} - Estado: {o.estado}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {adminTab === 'categorias' && (
              <div className="card">
                <h3>Gestión de Categorías</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!nuevaCatForm.id || !nuevaCatForm.nombre) return;
                    setCategorias(crearCategoria(nuevaCatForm));
                    setNuevaCatForm({ id: '', nombre: '', descripcion: '' });
                  }}
                  style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}
                >
                  <input
                    type="text"
                    placeholder="ID (ej: bayas)"
                    value={nuevaCatForm.id}
                    onChange={(e) => setNuevaCatForm({ ...nuevaCatForm, id: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Nombre categoría"
                    value={nuevaCatForm.nombre}
                    onChange={(e) => setNuevaCatForm({ ...nuevaCatForm, nombre: e.target.value })}
                  />
                  <button type="submit" className="btn">Añadir Categoría</button>
                </form>
                <ul>
                  {categorias.map((c) => (
                    <li key={c.id}><strong>{c.nombre}</strong> ({c.id}) — {c.descripcion}</li>
                  ))}
                </ul>
              </div>
            )}

            {adminTab === 'usuarios' && (
              <div className="card">
                <h3>Gestión de Usuarios</h3>
                <table className="tabla-carrito">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Comuna</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u.id}>
                        <td>{u.nombre} {u.apellidos}</td>
                        <td>{u.correo}</td>
                        <td>{u.rol}</td>
                        <td>{u.comuna}</td>
                        <td>
                          <button className="btn-danger" onClick={() => setUsuarios(eliminarUsuario(u.id))}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Pie de página */}
      <footer className="footer">
        <p>© 2026 Centro Pokémon - Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}