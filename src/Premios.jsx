// src/Premios.jsx
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function Premios() {
  const [premios, setPremios] = useState({ goleador: '', portero: '' });

  useEffect(() => {
    async function fetchPremios() {
      const { data, error } = await supabase.from('premios_temporada').select('*');
      
      if (data) {
        // Separamos los datos para usarlos fácilmente
        const goleadorData = data.find(p => p.categoria === 'GOLEADOR');
        const porteroData = data.find(p => p.categoria === 'PORTERO');
        
        setPremios({
          goleador: goleadorData ? goleadorData.nombre_jugador : 'Por definir',
          portero: porteroData ? porteroData.nombre_jugador : 'Por definir'
        });
      }
    }
    fetchPremios();
  }, []);

  // Estilos base para las tarjetas para que parezcan pósters
  const tarjetaStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: '500px',
    height: '300px',
    borderRadius: '15px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    border: '3px solid #d4af37', // Borde dorado
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  const tituloStyle = {
    color: 'white',
    textTransform: 'uppercase',
    textShadow: '2px 2px 4px #000, -2px -2px 4px #000, 2px -2px 4px #000, -2px 2px 4px #000',
    margin: '0',
    fontSize: '2rem',
    fontWeight: '900',
    textAlign: 'center'
  };

  const nombreStyle = {
    color: 'white',
    fontSize: '3rem',
    fontWeight: 'bold',
    textShadow: '0px 4px 10px rgba(0,0,0,0.8)',
    margin: '10px 0',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: '0 20px',
    borderRadius: '10px'
  };

  return (
    <div style={{ marginTop: '50px', marginBottom: '50px' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '30px' }}>⭐ CUADRO DE HONOR ⭐</h2>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
        
        {/* Tarjeta Goleador */}
        {/* Nota: Reemplaza la URL del backgroundImage con tu imagen real en public/ */}
        <div style={{ ...tarjetaStyle, backgroundImage: `url('/fondo_goleador.jpg')`, backgroundColor: '#0f5132' }}>
          <div style={{ position: 'absolute', top: '10px', left: '10px' }}>🏆</div>
          <h3 style={tituloStyle}>CAMPEÓN<br/>GOLEADOR</h3>
          <h2 style={nombreStyle}>{premios.goleador}</h2>
          <p style={{ color: 'white', fontWeight: 'bold', position: 'absolute', bottom: '10px' }}>configLiga.nombreOficial</p>
        </div>

        {/* Tarjeta Portero */}
        <div style={{ ...tarjetaStyle, backgroundImage: `url('/fondo_portero.jpg')`, backgroundColor: '#333' }}>
           <div style={{ position: 'absolute', top: '10px', right: '10px' }}>🧤</div>
          <h3 style={{ ...tituloStyle, color: '#f1c40f' }}>PREMIO AL MEJOR PORTERO</h3>
          <h2 style={nombreStyle}>{premios.portero}</h2>
          <p style={{ color: 'white', fontWeight: 'bold', position: 'absolute', bottom: '10px' }}> configLiga.nombreOficial</p>
        </div>

      </div>
    </div>
  );
}