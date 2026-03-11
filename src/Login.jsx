// src/Login.jsx
import { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  // 👇 ¡ESTA ES LA URL DE TU LOGO! Cámbiala luego por tu archivo (ej. '/logo.png')
  const urlDelLogo  = '/' ; // Placeholder de Marvin

  const manejarLogin = async (e) => {
    e.preventDefault();
    setCargando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert("Error: Correo o contraseña incorrectos");
      console.error(error);
    }
    
    setCargando(false);
  };

  return (
    <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '0' }}>
      
      {/* Tarjeta de Login Centrada */}
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', border: 'none', background: 'var(--card-bg)' }}>
        
        {/* 👇 AQUÍ VA EL LOGO NUEVO */}
        <img 
          src={urlDelLogo} 
          alt="{configLiga.logoUrl})" 
          style={{ width: '100px', height: '100px', marginBottom: '20px', borderRadius: '50%', objectFit: 'contain' }}
        />

        <h2 style={{ borderBottom: 'none', marginBottom: '10px', fontSize: '2rem' }}>Liga <span style={{ color: 'var(--accent-color)' }}>La Bandera</span></h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Inicia sesión como DT o Admin</p>
        
        <form onSubmit={manejarLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            placeholder="Correo electrónico (admin@labandera.com)" 
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ backgroundColor: '#0f172a' }}
          />
          <input 
            type="password" 
            placeholder="Contraseña (Liga123456)" 
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ backgroundColor: '#0f172a' }}
          />
          <button type="submit" className="btn-primary" disabled={cargando} style={{ marginTop: '10px' }}>
            {cargando ? 'Validando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}