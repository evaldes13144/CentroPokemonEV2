// src/App.test.jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import {
  BotonAccion,
  TarjetaServicio,
  ListaProductos,
  FormularioContacto,
} from './components/ComponentesTienda';

const mockProductos = [
  { id: 1, nombre: 'Curación Total PS/PP', categoria: 'salud', precio: 0, oferta: false, stock: 50 },
  { id: 2, nombre: 'Ultra Ball (Pack x5)', categoria: 'items', precio: 1200, oferta: true, precioOferta: 990, stock: 40 },
  { id: 3, nombre: 'MT24 - Rayo', categoria: 'items', precio: 3000, oferta: false, stock: 8 },
];

describe('Suite de 10 Pruebas Unitarias - Evaluación Parcial 2 (Centro Pokémon)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ==================== 1 y 2: PRUEBAS DE RENDERIZADO ====================
  it('1. [Renderizado Correcto] Renderiza todos los elementos de un conjunto de datos en ListaProductos', () => {
    render(<ListaProductos productos={mockProductos} onAgregar={vi.fn()} />);
    expect(screen.getByText('Curación Total PS/PP')).toBeInTheDocument();
    expect(screen.getByText('Ultra Ball (Pack x5)')).toBeInTheDocument();
    expect(screen.getByText('MT24 - Rayo')).toBeInTheDocument();
  });

  it('2. [Renderizado Correcto] Renderiza el encabezado principal y la barra de navegación en App', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Centro Pokémon/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Bienvenido al Centro Pokémon/i)).toBeInTheDocument();
  });

  // ==================== 3 y 4: PRUEBAS DE RENDERIZADO CONDICIONAL ====================
  it('3. [Renderizado Condicional] Muestra el mensaje de error en FormularioContacto solo cuando hay un error presente', () => {
    render(<FormularioContacto />);
    // Al inicio no debe existir ningún mensaje de error
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Si enviamos el formulario vacío, aparece el error condicional
    const botonEnviar = screen.getByRole('button', { name: /Enviar Mensaje/i });
    fireEvent.click(botonEnviar);

    expect(screen.getByRole('alert')).toHaveTextContent('Todos los campos son obligatorios');
  });

  it('4. [Renderizado Condicional] Muestra mensaje de sin resultados cuando la lista de productos está vacía', () => {
    render(<ListaProductos productos={[]} onAgregar={vi.fn()} />);
    expect(screen.getByText(/No se encontraron productos disponibles/i)).toBeInTheDocument();
  });

  // ==================== 5 y 6: PRUEBAS DE PROPIEDADES (PROPS) ====================
  it('5. [Props] El componente BotonAccion recibe correctamente la etiqueta (label) y ejecuta la prop onClick', () => {
    const mockOnClick = vi.fn();
    render(<BotonAccion label="Curar Equipo" onClick={mockOnClick} />);

    const boton = screen.getByRole('button', { name: 'Curar Equipo' });
    expect(boton).toBeInTheDocument();

    fireEvent.click(boton);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('6. [Props] El componente TarjetaServicio recibe y muestra correctamente las propiedades de oferta y stock', () => {
    const productoOferta = mockProductos[1];
    render(<TarjetaServicio item={productoOferta} onAgregar={vi.fn()} />);

    expect(screen.getByText('Ultra Ball (Pack x5)')).toBeInTheDocument();
    expect(screen.getByText(/¡OFERTA!/i)).toBeInTheDocument();
    expect(screen.getByText(/\$990 Pokédolares/i)).toBeInTheDocument();
    expect(screen.getByText(/Stock disponible:\s*40/i)).toBeInTheDocument();
  });

  // ==================== 7 y 8: PRUEBAS DE ESTADO (STATE) ====================
  it('7. [Estado] Verifica que el estado del FormularioContacto cambia cuando el usuario introduce texto', () => {
    render(<FormularioContacto />);

    const inputNombre = screen.getByLabelText(/Nombre Completo:/i);
    const inputCorreo = screen.getByLabelText(/Correo Electrónico:/i);

    fireEvent.change(inputNombre, { target: { value: 'Ash Ketchum' } });
    fireEvent.change(inputCorreo, { target: { value: 'ash@pokemon.com' } });

    expect(inputNombre.value).toBe('Ash Ketchum');
    expect(inputCorreo.value).toBe('ash@pokemon.com');
  });

  it('8. [Estado] Cambia el estado del filtro de categorías en el catálogo de Servicios', () => {
    render(<App />);
    // Navegar a la vista de servicios
    const btnServicios = screen.getAllByRole('button', { name: /^Servicios$/i })[0];
    fireEvent.click(btnServicios);

    const selectCategoria = screen.getByLabelText(/Filtrar por categoría/i);
    fireEvent.change(selectCategoria, { target: { value: 'salud' } });

    expect(selectCategoria.value).toBe('salud');
    expect(screen.getByText('Curación Total PS/PP')).toBeInTheDocument();
    expect(screen.queryByText('MT24 - Rayo')).not.toBeInTheDocument();
  });

  // ==================== 9 y 10: PRUEBAS DE EVENTOS Y MOCKS ====================
 it('9. [Eventos] Simula un clic en Añadir al Carrito y verifica que actualice el estado del carrito en la barra superior', () => {
    const spyStorage = vi.spyOn(Storage.prototype, 'setItem');
    render(<App />);

    // Ir a Servicios y añadir un producto
    const btnServicios = screen.getAllByRole('button', { name: /^Servicios$/i })[0];
    fireEvent.click(btnServicios);

    const botonesAgregar = screen.getAllByRole('button', { name: /Añadir al Carrito/i });
    fireEvent.click(botonesAgregar[0]);

    // Verificar que el botón de la barra de navegación muestra el contador actualizado
    const botonCarritoNav = document.querySelector('.btn-carrito-nav');
    expect(botonCarritoNav).toHaveTextContent(/Carrito \(1\)/i);
    expect(spyStorage).toHaveBeenCalled();
  });

  it('10. [Eventos y Mocks] Simula el envío completo del formulario de contacto ejecutando el callback mockeado', () => {
    const mockEnviar = vi.fn();
    render(<FormularioContacto onEnviar={mockEnviar} />);

    fireEvent.change(screen.getByLabelText(/Nombre Completo:/i), { target: { value: 'Misty' } });
    fireEvent.change(screen.getByLabelText(/Correo Electrónico:/i), { target: { value: 'misty@celeste.cl' } });
    fireEvent.change(screen.getByLabelText(/Mensaje:/i), { target: { value: 'Necesito pociones para Staryu' } });

    fireEvent.click(screen.getByRole('button', { name: /Enviar Mensaje/i }));

    expect(mockEnviar).toHaveBeenCalledTimes(1);
    expect(mockEnviar).toHaveBeenCalledWith({
      nombre: 'Misty',
      correo: 'misty@celeste.cl',
      mensaje: 'Necesito pociones para Staryu',
    });
    expect(screen.getByText(/¡Mensaje enviado correctamente al Centro Pokémon!/i)).toBeInTheDocument();
  });
});