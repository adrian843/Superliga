// src/PanelAdmin.jsx
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function PanelAdmin() {
  // 🗂️ Estado para las pestañas
  const [pestañaActiva, setPestañaActiva] = useState('resultados');

  // 📦 Estados para los datos globales (para llenar los selectores)
  const [equipos, setEquipos] = useState([]);
  const [partidosPendientes, setPartidosPendientes] = useState([]);

  // 📝 Estados para los Formularios
  const [formResultado, setFormResultado] = useState({ id: '', local: 0, visita: 0 });
  const [formEquipo, setFormEquipo] = useState({ nombre: '' });
  const [formJugador, setFormJugador] = useState({ equipo_id: '', nombre: '', dorsal: '' });
  const [formPartido, setFormPartido] = useState({ jornada: '', fecha: '', hora: '', local_id: '', visita_id: '' });

  // 🔄 Cargar datos iniciales
  const cargarDatos = async () => {
    // Cargar equipos
    const { data: dataEquipos } = await supabase.from('equipos').select('*').order('nombre_equipo');
    if (dataEquipos) setEquipos(dataEquipos);

    // Cargar partidos programados
    const { data: dataPartidos } = await supabase
      .from('partidos')
      .select(`id_partido, fecha, equipos!partidos_id_local_fkey(nombre_equipo), visitante:equipos!partidos_id_visitante_fkey(nombre_equipo)`)
      .eq('estado', 'PROGRAMADO');
    if (dataPartidos) setPartidosPendientes(dataPartidos);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // 🚀 FUNCIONES PARA GUARDAR EN BASE DE DATOS

  const guardarResultado = async (e) => {
    e.preventDefault();
    if (!formResultado.id) return alert("Selecciona un partido");

    await supabase.from('partidos').update({
      goles_local: formResultado.local,
      goles_visitante: formResultado.visita,
      estado: 'FINALIZADO'
    }).eq('id_partido', formResultado.id);
    
    alert("¡Resultado guardado!");
    setFormResultado({ id: '', local: 0, visita: 0 });
    cargarDatos();
    window.location.reload(); // Recargar para actualizar tablas
  };

  const agregarEquipo = async (e) => {
    e.preventDefault();
    await supabase.from('equipos').insert([{ nombre_equipo: formEquipo.nombre }]);
    alert("¡Equipo agregado con éxito!");
    setFormEquipo({ nombre: '' });
    cargarDatos();
  };

  const agregarJugador = async (e) => {
    e.preventDefault();
    if (!formJugador.equipo_id) return alert("Selecciona un equipo");
    
    await supabase.from('jugadores').insert([{ 
      id_equipo: formJugador.equipo_id, 
      nombre_completo: formJugador.nombre, 
      numero_dorsal: formJugador.dorsal 
    }]);
    alert("¡Jugador agregado con éxito!");
    setFormJugador({ equipo_id: '', nombre: '', dorsal: '' });
  };

  const agregarPartido = async (e) => {
    e.preventDefault();
    if (formPartido.local_id === formPartido.visita_id) return alert("El equipo local y visitante no pueden ser el mismo");

    await supabase.from('partidos').insert([{ 
      jornada: formPartido.jornada, 
      fecha: formPartido.fecha, 
      hora: formPartido.hora,
      id_local: formPartido.local_id,
      id_visitante: formPartido.visita_id,
      estado: 'PROGRAMADO'
    }]);
    alert("¡Partido programado con éxito!");
    setFormPartido({ jornada: '', fecha: '', hora: '', local_id: '', visita_id: '' });
    cargarDatos();
  };

  // 🎨 Estilos para los botones de las pestañas
  const tabStyle = (tabName) => ({
    padding: '10px 15px',
    background: pestañaActiva === tabName ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    flex: '1',
    minWidth: '120px'
  });

  return (
    <div className="card" style={{ borderTop: '4px solid var(--accent-color)', marginBottom: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>⚙️ Centro de Control (Admin)</h2>
      
      {/* Menú de Pestañas */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
        <button style={tabStyle('resultados')} onClick={() => setPestañaActiva('resultados')}>🏆 Resultados</button>
        <button style={tabStyle('equipos')} onClick={() => setPestañaActiva('equipos')}>🛡️ Equipos</button>
        <button style={tabStyle('jugadores')} onClick={() => setPestañaActiva('jugadores')}>🏃‍♂️ Jugadores</button>
        <button style={tabStyle('partidos')} onClick={() => setPestañaActiva('partidos')}>📅 Partidos</button>
      </div>

      {/* ---------------- PESTAÑA: RESULTADOS ---------------- */}
      {pestañaActiva === 'resultados' && (
        <form onSubmit={guardarResultado}>
          <h3>Cargar Resultado Final</h3>
          <select className="form-control" value={formResultado.id} onChange={(e) => setFormResultado({...formResultado, id: e.target.value})} required>
            <option value="">-- Selecciona el partido jugado --</option>
            {partidosPendientes.map(p => (
              <option key={p.id_partido} value={p.id_partido}>{p.equipos.nombre_equipo} vs {p.visitante.nombre_equipo} ({p.fecha})</option>
            ))}
          </select>
          <div className="score-inputs">
            <div className="score-box">
              <label>Local</label>
              <input type="number" min="0" className="form-control" value={formResultado.local} onChange={(e) => setFormResultado({...formResultado, local: e.target.value})} required />
            </div>
            <h3 style={{ margin: 0 }}>VS</h3>
            <div className="score-box">
              <label>Visita</label>
              <input type="number" min="0" className="form-control" value={formResultado.visita} onChange={(e) => setFormResultado({...formResultado, visita: e.target.value})} required />
            </div>
          </div>
          <button type="submit" className="btn-primary">Guardar Resultado</button>
        </form>
      )}

      {/* ---------------- PESTAÑA: EQUIPOS ---------------- */}
      {pestañaActiva === 'equipos' && (
        <form onSubmit={agregarEquipo} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3>Registrar Nuevo Equipo</h3>
          <input type="text" placeholder="Nombre del Equipo (ej: Pumas)" className="form-control" value={formEquipo.nombre} onChange={(e) => setFormEquipo({nombre: e.target.value})} required />
          <button type="submit" className="btn-primary" style={{ background: '#3b82f6' }}>+ Agregar Equipo</button>
        </form>
      )}

      {/* ---------------- PESTAÑA: JUGADORES ---------------- */}
      {pestañaActiva === 'jugadores' && (
        <form onSubmit={agregarJugador} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3>Registrar Nuevo Jugador</h3>
          <select className="form-control" value={formJugador.equipo_id} onChange={(e) => setFormJugador({...formJugador, equipo_id: e.target.value})} required>
            <option value="">-- Asignar a un Equipo --</option>
            {equipos.map(eq => <option key={eq.id_equipo} value={eq.id_equipo}>{eq.nombre_equipo}</option>)}
          </select>
          <input type="text" placeholder="Nombre Completo" className="form-control" value={formJugador.nombre} onChange={(e) => setFormJugador({...formJugador, nombre: e.target.value})} required />
          <input type="number" placeholder="Número de Dorsal (Camiseta)" className="form-control" value={formJugador.dorsal} onChange={(e) => setFormJugador({...formJugador, dorsal: e.target.value})} required />
          <button type="submit" className="btn-primary" style={{ background: '#10b981' }}>+ Registrar Jugador</button>
        </form>
      )}

      {/* ---------------- PESTAÑA: PARTIDOS ---------------- */}
      {pestañaActiva === 'partidos' && (
        <form onSubmit={agregarPartido} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3>Programar Próximo Partido</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="number" placeholder="Jornada (ej: 5)" className="form-control" value={formPartido.jornada} onChange={(e) => setFormPartido({...formPartido, jornada: e.target.value})} required />
            <input type="date" className="form-control" value={formPartido.fecha} onChange={(e) => setFormPartido({...formPartido, fecha: e.target.value})} required />
            <input type="time" className="form-control" value={formPartido.hora} onChange={(e) => setFormPartido({...formPartido, hora: e.target.value})} required />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select className="form-control" value={formPartido.local_id} onChange={(e) => setFormPartido({...formPartido, local_id: e.target.value})} required>
              <option value="">-- Equipo Local --</option>
              {equipos.map(eq => <option key={eq.id_equipo} value={eq.id_equipo}>{eq.nombre_equipo}</option>)}
            </select>
            <span>VS</span>
            <select className="form-control" value={formPartido.visita_id} onChange={(e) => setFormPartido({...formPartido, visita_id: e.target.value})} required>
              <option value="">-- Equipo Visitante --</option>
              {equipos.map(eq => <option key={eq.id_equipo} value={eq.id_equipo}>{eq.nombre_equipo}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ background: '#8b5cf6' }}>📅 Programar Partido</button>
        </form>
      )}

    </div>
  );
}