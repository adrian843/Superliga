// src/PartidosPublicos.jsx
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function PartidosPublicos() {
  const [proximosPartidos, setProximosPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function fetchPartidos() {
      // Traemos todos los partidos PROGRAMADOS, ordenados por fecha y hora
      const { data, error } = await supabase
        .from('partidos')
        .select(`
          id_partido, 
          jornada, 
          fecha, 
          hora, 
          equipos!partidos_id_local_fkey(nombre_equipo), 
          visitante:equipos!partidos_id_visitante_fkey(nombre_equipo)
        `)
        .eq('estado', 'PROGRAMADO')
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true });

      if (error) {
        console.error('Error cargando partidos:', error);
      } else {
        setProximosPartidos(data);
      }
      setCargando(false);
    }

    fetchPartidos();
  }, []);

  return (
    <div className="card" style={{ marginBottom: '40px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--accent-color)' }}>
        📅 PRÓXIMA JORNADA
      </h2>
      
      {cargando ? (
        <p style={{ textAlign: 'center' }}>Cargando calendario...</p>
      ) : proximosPartidos.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Mostramos la Jornada del primer partido en la lista */}
          <h3 style={{ textAlign: 'center', margin: '0 0 10px 0', color: 'white' }}>
            JORNADA {proximosPartidos[0].jornada} - APERTURA 2026
          </h3>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '0 0 20px 0' }}>
            📍 Campo La Bandera
          </p>

          {proximosPartidos.map((partido) => (
            <div 
              key={partido.id_partido} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: 'rgba(255,255,255,0.05)', 
                padding: '15px', 
                borderRadius: '8px',
                borderLeft: '4px solid var(--accent-color)'
              }}
            >
              {/* Hora y Fecha */}
              <div style={{ width: '120px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <strong>{partido.hora.substring(0, 5)}</strong><br/>
                {partido.fecha}
              </div>
              
              {/* Equipos (El "VS") */}
              <div style={{ flex: '1', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                {partido.equipos.nombre_equipo} 
                <span style={{ color: 'var(--accent-color)', margin: '0 15px', fontSize: '1rem' }}>VS</span> 
                {partido.visitante.nombre_equipo}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: 'center', padding: '20px' }}>No hay partidos programados por el momento.</p>
      )}
    </div>
  );
}