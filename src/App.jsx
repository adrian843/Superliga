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

export default function App() {
  const [sesion, setSesion] = useState(null);
  const [mostrarPantallaLogin, setMostrarPantallaLogin] = useState(false);

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
        {esAdmin ? <PanelAdmin /> : <DashboardDT />}

        <div className="grid-bottom" style={{ marginTop: '20px' }}>
          <TablaPosiciones />
          <TablaGoleo />
        </div>
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
    <div>
     <nav className="navbar" style={{ borderBottom: `2px solid ${configLiga.colorPrincipal}` }}>
        <h1 className="logo-nav">
          {configLiga.nombreOficial}
        </h1>
        <ul className="nav-links">
          <li><a href="#inicio">Inicio</a></li>
          <li><a href="#jornada">Próxima Jornada</a></li>
          <li><a href="#tablas">Estadísticas</a></li>
        </ul>
        <button className="btn-login" onClick={() => setMostrarPantallaLogin(true)}>
          Iniciar Sesión
        </button>
      </nav>

      <div className="hero-section" id="inicio">
        <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>{configLiga.textoHero}</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>{configLiga.slogan}</p>
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

      <footer style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--card-bg)', marginTop: '40px', borderTop: `2px solid ${configLiga.colorPrincipal}` }}>
        <h2>CONTACTO</h2>
        <p>📍 {configLiga.sede}</p>
        <p>📞 {configLiga.telefonoContacto}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '20px' }}>
          © {new Date().getFullYear()} {configLiga.nombreOficial}. Desarrollado por [Tu Nombre/Agencia].
        </p>
      </footer>
    </div>
  );
}

