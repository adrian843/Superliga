// src/App.jsx
import { configLiga } from './config';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './Login';
import DashboardDT from './DashboardDT';
import TablaPosiciones from './TablaPosiciones';
import TablaGoleo from './TablaGoleo';
import PanelAdmin from './PanelAdmin';
import Premios from './Premios'; // Asegúrate de tenerlo importado si lo agregaste en el paso anterior
import PartidosPublicos from './PartidosPublicos';
import TransmisionEnVivo from './TransmisionEnVivo';
import CarruselGaleria from './CarruselGaleria';
import Patrocinadores from './Patrocinadores';

export default function App() {
  const [sesion, setSesion] = useState(null);
  const [mostrarPantallaLogin, setMostrarPantallaLogin] = useState(false);
  
  // 👇 NUEVO ESTADO PARA EL MENÚ MÓVIL
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session);
      if (session) setMostrarPantallaLogin(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
  };

  // 1. SI ESTÁ LOGUEADO: Mostrar el Dashboard Privado según su Rol
  if (sesion) {
    // 🔍 AQUÍ ESTÁ LA MAGIA: Leemos el correo del usuario actual
    const correoUsuario = sesion.user.email;
    
    // Definimos quién es el administrador (¡Cambia este correo si usaste otro en Supabase!)
    const esAdmin = correoUsuario === 'admin@labandera.com';

    return (
      <div className="app-container">
        {/* Encabezado Dinámico */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <h1 className="logo-nav">Panel <span>{esAdmin ? 'Directivo (Admin)' : 'Técnico (DT)'}</span></h1>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {/* Mostramos el correo para que sepa con qué cuenta entró */}
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{correoUsuario}</span>
            
            <button 
              onClick={cerrarSesion} 
              style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

       {/* 🚦 CONTROL DE ACCESO AUTOMÁTICO */}
        {esAdmin ? (
          <>
            <PanelAdmin />
            {/* Las tablas generales solo las ve el Admin en su panel */}
            <div className="grid-bottom" style={{ marginTop: '20px' }}>
              <TablaPosiciones />
              <TablaGoleo />
            </div>
          </>
        ) : (
          <DashboardDT /> // El DT ya trae sus propias tablas por dentro
        )}
      </div>
    );
  }

  // 2. SI DIO CLIC EN INICIAR SESIÓN: Mostrar el formulario
  if (mostrarPantallaLogin) {
    return (
      <div>
        <button 
          onClick={() => setMostrarPantallaLogin(false)} 
          style={{ position: 'absolute', top: '20px', left: '20px', background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1.2rem', zIndex: 1000 }}
        >
          ⬅ Volver
        </button>
        <Login />
      </div>
    );
  }

  // 3. VISTA POR DEFECTO: Landing Page (Pública)
  return (
    <>
      {/* Barra de Navegación Pública */}
      <nav className="navbar">
        <div className="navbar-container">
          <h1 className="logo-nav">Liga <span>La Bandera</span></h1>

          {/* Botón de Hamburguesa (Solo visible en móviles) */}
          <button className="menu-toggle" onClick={() => setMenuAbierto(!menuAbierto)}>
            {menuAbierto ? '✖' : '☰'}
          </button>
        </div>

        {/* Enlaces (Se ocultan/muestran en móvil según el estado menuAbierto) */}
        <ul className={`nav-links ${menuAbierto ? 'active' : ''}`}>
          <li><a href="#inicio" onClick={() => setMenuAbierto(false)}>Inicio</a></li>
          <li><a href="#jornada" onClick={() => setMenuAbierto(false)}>Próxima Jornada</a></li>
          <li><a href="#tablas" onClick={() => setMenuAbierto(false)}>Estadísticas</a></li>

          {/* Botón de Login para móviles (dentro del menú desplegable) */}
          <li className="mobile-login">
            <button className="btn-login" onClick={() => { setMostrarPantallaLogin(true); setMenuAbierto(false); } } style={{ width: '100%' }}>
              Iniciar Sesión
            </button>
          </li>
        </ul>

        {/* Botón de Login para computadoras (a la derecha) */}
        <button className="btn-login desktop-login" onClick={() => setMostrarPantallaLogin(true)}>
          Iniciar Sesión
        </button>
      </nav>
      <div className="hero-section" id="inicio">
        <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>FÚTBOL AMATEUR DE ALTO NIVEL</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>La liga donde la pasión y el deporte se encuentran. ¡Disfruta cada partido!</p>
      </div>

      {/* 👇 NUEVO: Galería de Imágenes 👇 */}
      <div className="app-container" style={{ marginTop: '40px' }}>
        <CarruselGaleria />
      </div>
      {/* 👇 NUEVA SECCIÓN: Calendario y En Vivo 👇 */}
      <div className="app-container" id="jornada" style={{ marginTop: '40px' }}>
        <div className="grid-top">
          <PartidosPublicos />
          <TransmisionEnVivo />
        </div>
      </div>

      {/* Sección de Tablas Públicas */}
      <div className="app-container" id="tablas">
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>ESTADÍSTICAS OFICIALES</h2>
        <div className="grid-bottom">
          <TablaPosiciones />
          <TablaGoleo />
        </div>
      </div>

      {/* Premios */}
      <div className="app-container">
        <Premios />
      </div>

      {/* 👇 NUEVA SECCIÓN DE PATROCINADORES 👇 */}
      <Patrocinadores />

      <footer style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--card-bg)', marginTop: '40px', borderTop: `2px solid ${configLiga.colorPrincipal}` }}>
        <h2>CONTACTO</h2>
        <p>📍 {configLiga.sede}</p>
        <p>📞 {configLiga.telefonoContacto}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '20px' }}>
          © {new Date().getFullYear()} {configLiga.nombreOficial}. Desarrollado por [Adrian Ramirez/5olutions].
        </p>
      </footer>
    </>
  );
}


