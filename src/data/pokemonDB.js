

const KEYS = {
  PRODUCTOS: 'cp_productos',
  CATEGORIAS: 'cp_categorias',
  USUARIOS: 'cp_usuarios',
  ORDENES: 'cp_ordenes',
  CARRITO: 'cp_carrito',
  SESION: 'cp_sesion_activa',
};

export const productosIniciales = [
  { id: 1, nombre: 'Curación Total PS/PP', categoria: 'salud', precio: 0, oferta: false, stock: 50, critico: 5, img: '/png/Curación Total PS-PP.png', descripcion: 'Restauración completa de PS y PP para todo tu equipo Pokémon con la tecnología de la Enfermera Joy.' },
  { id: 2, nombre: 'Tratamiento Estado Alterado', categoria: 'salud', precio: 200, oferta: true, precioOferta: 150, stock: 25, critico: 5, img: null, descripcion: 'Cura parálisis, quemaduras, congelamiento, veneno y sueño profundo de forma inmediata.' },
  { id: 3, nombre: 'Poción de Máxima Salud', categoria: 'items', precio: 700, oferta: true, precioOferta: 550, stock: 3, critico: 5, img: '/png/pocion maxima.webp', descripcion: 'Restaura todos los PS de un Pokémon debilitado en combate.' },
  { id: 4, nombre: 'Guardería y Cuidados Diarios', categoria: 'cuidado', precio: 500, oferta: false, stock: 15, critico: 3, img: null, descripcion: 'Cuidado diario, alimentación con bayas selectas y entrenamiento pasivo de experiencia.' },
  { id: 5, nombre: 'Ultra Ball (Pack x5)', categoria: 'items', precio: 1200, oferta: true, precioOferta: 990, stock: 40, critico: 10, img: '/png/Ultra Ball.webp', descripcion: 'Poké Ball de alto rendimiento con ratio de captura superior para especies salvajes difíciles.' },
  { id: 6, nombre: 'Revivir Máximo', categoria: 'items', precio: 1500, oferta: false, stock: 2, critico: 5, img: '/png/Revivir_m%3Fximo_GO.webp', descripcion: 'Reanima a un Pokémon debilitado y restaura el 100% de sus puntos de salud.' },
  { id: 7, nombre: 'MT24 - Rayo', categoria: 'items', precio: 3000, oferta: true, precioOferta: 2490, stock: 8, critico: 3, img: '/png/MT24 - Rayo.webp', descripcion: 'Máquina Técnica de ataque eléctrico de alta potencia con probabilidad de paralizar.' },
  { id: 8, nombre: 'Masaje Relajante Pokémon', categoria: 'cuidado', precio: 350, oferta: false, stock: 20, critico: 4, img: null, descripcion: 'Incrementa el nivel de felicidad y amistad de tu compañero Pokémon.' },
];

export const categoriasIniciales = [
  { id: 'salud', nombre: 'Salud y Clínico', descripcion: 'Atención médica y curación en Centro Pokémon' },
  { id: 'items', nombre: 'Ítems y Suministros', descripcion: 'Pociones, Poké Balls, Revivir y Máquinas Técnicas' },
  { id: 'cuidado', nombre: 'Guardería y Cuidados', descripcion: 'Estadía, crianza y bienestar para tu equipo' },
];

export const usuariosIniciales = [
  { id: 1, nombre: 'Enfermera', apellidos: 'Joy', correo: 'admin@centropokemon.cl', pass: 'admin123', rol: 'admin', calle: 'Av. Meseta Añil 100', depto: 'Oficina Central', region: 'Región Metropolitana de Santiago', comuna: 'Santiago' },
  { id: 2, nombre: 'Ash', apellidos: 'Ketchum', correo: 'ash@pueblopaleta.cl', pass: 'pikachu123', rol: 'cliente', calle: 'Ruta 1 Km 5', depto: 'Casa 1', region: 'Región Metropolitana de Santiago', comuna: 'La Florida' },
];

export const blogsIniciales = [
  { id: 1, titulo: 'Consejos para Cuidar Pokémones Tipo Fuego', fecha: '03 de Septiembre, 2026', resumen: 'Descubre las mejores prácticas para mantener la llama de Charmander en temporada de lluvia.', contenido: 'Los Pokémon de tipo Fuego como Charmander requieren mantener su temperatura corporal estable. Evita exponer su cola a lluvias intensas, utiliza paraguas térmicos durante tus rutas y complementa su dieta con Bayas Zreza para fortalecer su energía ígnea.', autor: 'Enfermera Joy' },
  { id: 2, titulo: 'Importancia de la Nutrición Equilibrada', fecha: '28 de Agosto, 2026', resumen: 'Análisis sobre cómo las bayas influyen en las estadísticas base y combate.', contenido: 'Una alimentación balanceada con Bayas Aranja, Zidra y Meloc permite acelerar la recuperación tras los combates de gimnasio y mejora el rendimiento en ligas regionales.', autor: 'Profesor Oak' },
  { id: 3, titulo: 'Tecnologías en la Curación de Estados', fecha: '15 de Agosto, 2026', resumen: 'Entrevista con la Enfermera Joy sobre la automatización del Centro.', contenido: 'Las nuevas cápsulas de transferencia de energía permiten restaurar PS y PP en menos de 5 segundos, integrando diagnóstico preventivo de Pokerus y fatiga muscular.', autor: 'Enfermera Joy' },
];

export const regionesComunas = {
  'Región Metropolitana de Santiago': ['Santiago', 'La Florida', 'Providencia', 'Maipú', 'Cerrillos', 'Puente Alto', 'Ñuñoa'],
  'Región de Valparaíso': ['Valparaíso', 'Viña del Mar', 'San Antonio', 'Quilpué', 'Concón'],
  'Región del Biobío': ['Concepción', 'Talcahuano', 'San Pedro de la Paz', 'Chiguayante'],
};

// Inicializador de LocalStorage
export function inicializarDB() {
  if (!localStorage.getItem(KEYS.PRODUCTOS)) {
    localStorage.setItem(KEYS.PRODUCTOS, JSON.stringify(productosIniciales));
  }
  if (!localStorage.getItem(KEYS.CATEGORIAS)) {
    localStorage.setItem(KEYS.CATEGORIAS, JSON.stringify(categoriasIniciales));
  }
  if (!localStorage.getItem(KEYS.USUARIOS)) {
    localStorage.setItem(KEYS.USUARIOS, JSON.stringify(usuariosIniciales));
  }
  if (!localStorage.getItem(KEYS.ORDENES)) {
    localStorage.setItem(KEYS.ORDENES, JSON.stringify([]));
  }
}

// ================= CRUD  =================
export function obtenerProductos() {
  inicializarDB();
  return JSON.parse(localStorage.getItem(KEYS.PRODUCTOS)) || productosIniciales;
}

export function crearProducto(nuevoProd) {
  const productos = obtenerProductos();
  const id = productos.length > 0 ? Math.max(...productos.map((p) => p.id)) + 1 : 1;
  const prodConId = {
    ...nuevoProd,
    id,
    precio: Number(nuevoProd.precio),
    stock: Number(nuevoProd.stock ?? 10),
    critico: Number(nuevoProd.critico ?? 5),
    oferta: Boolean(nuevoProd.oferta),
    precioOferta: nuevoProd.oferta ? Number(nuevoProd.precioOferta || nuevoProd.precio * 0.8) : Number(nuevoProd.precio),
  };
  const actualizados = [...productos, prodConId];
  localStorage.setItem(KEYS.PRODUCTOS, JSON.stringify(actualizados));
  return actualizados;
}

export function actualizarProducto(id, datosActualizados) {
  const productos = obtenerProductos();
  const actualizados = productos.map((p) =>
    p.id === Number(id)
      ? {
          ...p,
          ...datosActualizados,
          precio: Number(datosActualizados.precio ?? p.precio),
          stock: Number(datosActualizados.stock ?? p.stock),
        }
      : p
  );
  localStorage.setItem(KEYS.PRODUCTOS, JSON.stringify(actualizados));
  return actualizados;
}

export function eliminarProducto(id) {
  const productos = obtenerProductos();
  const actualizados = productos.filter((p) => p.id !== Number(id));
  localStorage.setItem(KEYS.PRODUCTOS, JSON.stringify(actualizados));
  return actualizados;
}

// ================= CRUD CATEGORÍAS =================
export function obtenerCategorias() {
  inicializarDB();
  return JSON.parse(localStorage.getItem(KEYS.CATEGORIAS)) || categoriasIniciales;
}

export function crearCategoria(nuevaCat) {
  const categorias = obtenerCategorias();
  const actualizadas = [...categorias, nuevaCat];
  localStorage.setItem(KEYS.CATEGORIAS, JSON.stringify(actualizadas));
  return actualizadas;
}

export function eliminarCategoria(id) {
  const categorias = obtenerCategorias();
  const actualizadas = categorias.filter((c) => c.id !== id);
  localStorage.setItem(KEYS.CATEGORIAS, JSON.stringify(actualizadas));
  return actualizadas;
}

// ================= CRUD USUARIOS Y SESIÓN =================
export function obtenerUsuarios() {
  inicializarDB();
  return JSON.parse(localStorage.getItem(KEYS.USUARIOS)) || usuariosIniciales;
}

export function registrarUsuario(nuevoUsuario) {
  const usuarios = obtenerUsuarios();
  const id = usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1;
  const usuarioConId = { rol: 'cliente', ...nuevoUsuario, id };
  const actualizados = [...usuarios, usuarioConId];
  localStorage.setItem(KEYS.USUARIOS, JSON.stringify(actualizados));
  return usuarioConId;
}

export function actualizarUsuario(id, datos) {
  const usuarios = obtenerUsuarios();
  const actualizados = usuarios.map((u) => (u.id === Number(id) ? { ...u, ...datos } : u));
  localStorage.setItem(KEYS.USUARIOS, JSON.stringify(actualizados));
  return actualizados;
}

export function eliminarUsuario(id) {
  const usuarios = obtenerUsuarios();
  const actualizados = usuarios.filter((u) => u.id !== Number(id));
  localStorage.setItem(KEYS.USUARIOS, JSON.stringify(actualizados));
  return actualizados;
}

export function obtenerSesion() {
  const sesion = localStorage.getItem(KEYS.SESION);
  return sesion ? JSON.parse(sesion) : null;
}

export function guardarSesion(usuario) {
  if (usuario) {
    localStorage.setItem(KEYS.SESION, JSON.stringify(usuario));
  } else {
    localStorage.removeItem(KEYS.SESION);
  }
}

// ================= CARRITO Y ÓRDENES =================
export function obtenerCarritoLS() {
  const data = localStorage.getItem(KEYS.CARRITO);
  return data ? JSON.parse(data) : [];
}

export function guardarCarritoLS(carrito) {
  localStorage.setItem(KEYS.CARRITO, JSON.stringify(carrito));
}

export function obtenerOrdenes() {
  inicializarDB();
  return JSON.parse(localStorage.getItem(KEYS.ORDENES)) || [];
}

export function crearOrden(orden) {
  const ordenes = obtenerOrdenes();
  const nuevaOrden = {
    ...orden,
    id: ordenes.length + 1,
    nroOrden: orden.nroOrden || `#20260${ordenes.length + 101}`,
    codigo: orden.codigo || `ORDER${1000 + ordenes.length + 1}`,
    fecha: new Date().toLocaleDateString('es-CL'),
  };
  const actualizadas = [nuevaOrden, ...ordenes];
  localStorage.setItem(KEYS.ORDENES, JSON.stringify(actualizadas));
  return nuevaOrden;
}