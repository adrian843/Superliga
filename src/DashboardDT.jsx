// src/DashboardDT.jsx
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function DashboardDT() {
  const [proximoPartido, setProximoPartido] = useState(null);
  const [plantilla, setPlantilla] = useState([]);
  const [ultimosPartidos, setUltimosPartidos] = useState([]);
  const [goleadores, setGoleadores] = useState([]);
  const [pestañaActiva, setPestañaActiva] = useState('partido');

  const equipoId = 5; // Cuervos
  const nombreEquipo = 'Cuervos';
  const fotoEquipoUrl = "https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=1000&auto=format&fit=crop"; 

  useEffect(() => {
    async function cargarDatosDT() {
      // 1. Próximo Partido
      const { data: dataProx } = await supabase.from('partidos').select('*')
        .or(`id_local.eq.${equipoId},id_visitante.eq.${equipoId}`)
        .eq('estado', 'PROGRAMADO').order('fecha', { ascending: true }).limit(1).single();
      if (dataProx) setProximoPartido(dataProx);

      // 2. Plantilla
      const { data: dataPlan } = await supabase.from('jugadores').select('*')
        .eq('id_equipo', equipoId).order('numero_dorsal', { ascending: true });
      if (dataPlan) setPlantilla(dataPlan);

      // 3. Últimos 5 Partidos ¡AHORA CON TARJETAS INCLUIDAS! 🔍
      const { data: dataUltimos } = await supabase.from('partidos')
        .select(`
          id_partido, 
          fecha, 
          goles_local, 
          goles_visitante, 
          equipos!partidos_id_local_fkey(nombre_equipo), 
          visitante:equipos!partidos_id_visitante_fkey(nombre_equipo),
          registro_tarjetas(tipo_tarjeta, jugadores(nombre_completo, id_equipo))
        `)
        .or(`id_local.eq.${equipoId},id_visitante.eq.${equipoId}`)
        .eq('estado', 'FINALIZADO')
        .order('fecha', { ascending: false })
        .limit(5);
      
      if (dataUltimos) setUltimosPartidos(dataUltimos);

      // 4. Goleadores
      const { data: dataGoles } = await supabase.from('vista_goleo')
        .select('*').eq('nombre_equipo', nombreEquipo);
      if (dataGoles) setGoleadores(dataGoles);
    }

    cargarDatosDT();
  }, []);

  const tabStyle = (tabName) => ({
    padding: '10px 15px', background: pestañaActiva === tabName ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
    color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', flex: '1', minWidth: '120px'
  });

  return (
    <div className="card" style={{ borderTop: '4px solid #3b82f6', marginBottom: '20px' }}>
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button style={tabStyle('partido')} onClick={() => setPestañaActiva('partido')}>🏟️ Resumen del Equipo</button>
        <button style={tabStyle('plantilla')} onClick={() => setPestañaActiva('plantilla')}>👕 Mi Plantilla</button>
      </div>

      {pestañaActiva === 'partido' && (
        <>
          <div className="grid-top" style={{ marginBottom: '20px' }}>
            <div className="card" style={{ background: 'rgba(0,0,0,0.2)', border: 'none' }}>
              <h3 style={{ marginTop: 0 }}>Siguiente Encuentro</h3>
              {proximoPartido ? (
                <div>
                  <p style={{ fontSize: '1.2rem', color: 'var(--accent-color)' }}><strong>Jornada {proximoPartido.jornada}</strong></p>
                  <p style={{ color: 'var(--text-muted)' }}>{proximoPartido.fecha} | {proximoPartido.hora}</p>
                  <p><strong>Cancha:</strong> La Bandera</p>
                </div>
              ) : <p>No hay partidos programados para tu equipo.</p>}
            </div>
            <div className="card" style={{ background: 'rgba(0,0,0,0.2)', border: 'none', padding: 0, overflow: 'hidden' }}>
              <h3 style={{ margin: '15px' }}>📸 Foto Oficial</h3>
              <img src={fotoEquipoUrl} alt="Foto del equipo" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            </div>
          </div>

          <div className="grid-bottom">
            <div className="card" style={{ background: 'rgba(0,0,0,0.2)', border: 'none' }}>
              <h3 style={{ marginTop: 0 }}>📊 Últimos 5 Resultados</h3>
              <table className="sports-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Local</th>
                    <th style={{ textAlign: 'center' }}>Marcador</th>
                    <th>Visita</th>
                    <th>Avisos (Mi Equipo)</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimosPartidos.map(p => {
                    // Filtramos para que el DT solo vea las tarjetas de SUS jugadores
                    const misTarjetas = p.registro_tarjetas?.filter(t => t.jugadores.id_equipo === equipoId) || [];

                    return (
                      <tr key={p.id_partido}>
                        <td style={{ fontSize: '0.85rem' }}>{p.fecha}</td>
                        <td style={{ fontWeight: p.equipos.nombre_equipo === nombreEquipo ? 'bold' : 'normal' }}>{p.equipos.nombre_equipo}</td>
                        <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--accent-color)' }}>
                          {p.goles_local} - {p.goles_visitante}
                        </td>
                        <td style={{ fontWeight: p.visitante.nombre_equipo === nombreEquipo ? 'bold' : 'normal' }}>{p.visitante.nombre_equipo}</td>
                        
                        {/* 👇 LA MAGIA DE LAS TARJETAS 👇 */}
                        <td>
                          {misTarjetas.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              {misTarjetas.map((tarjeta, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                  <span style={{ 
                                    display: 'inline-block', 
                                    width: '12px', height: '16px', 
                                    background: tarjeta.tipo_tarjeta === 'ROJA' ? '#ef4444' : '#facc15', 
                                    borderRadius: '3px',
                                    boxShadow: '1px 1px 3px rgba(0,0,0,0.5)'
                                  }}></span>
                                  {tarjeta.jugadores.nombre_completo}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.85rem', color: '#10b981' }}>Sin tarjetas ✅</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {ultimosPartidos.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No hay partidos jugados.</td></tr>}
                </tbody>
              </table>
            </div>

            <div className="card" style={{ background: 'rgba(0,0,0,0.2)', border: 'none' }}>
              <h3 style={{ marginTop: 0 }}>⚽ Goleadores Internos</h3>
              <table className="sports-table">
                <thead>
                  <tr>
                    <th>Jugador</th>
                    <th style={{ textAlign: 'center' }}>Goles</th>
                  </tr>
                </thead>
                <tbody>
                  {goleadores.map(g => (
                    <tr key={g.id_jugador}>
                      <td><strong>{g.nombre_completo}</strong></td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--accent-color)' }}>{g.goles}</td>
                    </tr>
                  ))}
                  {goleadores.length === 0 && <tr><td colSpan="2" style={{ textAlign: 'center' }}>Ningún jugador ha anotado.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* PESTAÑA: MI PLANTILLA */}
      {pestañaActiva === 'plantilla' && (
        <div>
          <h3 style={{ borderBottom: '2px solid var(--accent-color)', paddingBottom: '10px', textTransform: 'uppercase' }}>Jugadores Registrados</h3>
          
          <table className="sports-table" style={{ marginTop: '15px' }}>
            <thead>
              <tr>
                <th style={{ width: '80px', textAlign: 'center' }}>Dorsal</th>
                <th>Nombre del Jugador</th>
                <th style={{ textAlign: 'center' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {plantilla.length > 0 ? (
                plantilla.map((jugador) => (
                  <tr key={jugador.id_jugador}>
                    <td style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--accent-color)' }}>
                      <strong>#{jugador.numero_dorsal}</strong>
                    </td>
                    <td style={{ fontSize: '1.1rem' }}>{jugador.nombre_completo}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>Activo</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                    No tienes jugadores registrados en tu equipo aún. Pide al Administrador que los registre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}