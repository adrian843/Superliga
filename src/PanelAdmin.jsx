// src/PanelAdmin.jsx
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function PanelAdmin() {
  const [pestañaActiva, setPestañaActiva] = useState('resultados');

  // Estados Globales
  const [equipos, setEquipos] = useState([]);
  const [partidosPendientes, setPartidosPendientes] = useState([]);
  const [partidosJugados, setPartidosJugados] = useState([]); // Para las tarjetas

  // Estados para Formularios
  const [formResultado, setFormResultado] = useState({ id: '', local: 0, visita: 0 });
  const [formEquipo, setFormEquipo] = useState({ nombre: '' });
  const [formJugador, setFormJugador] = useState({ equipo_id: '', nombre: '', dorsal: '' });
  const [formPartido, setFormPartido] = useState({ jornada: '', fecha: '', hora: '', local_id: '', visita_id: '' });
  
  // NUEVO: Estado para Tarjetas
  const [formTarjeta, setFormTarjeta] = useState({ partido_id: '', jugador_id: '', tipo: 'AMARILLA' });
  const [jugadoresPartidoSeleccionado, setJugadoresPartidoSeleccionado] = useState([]);

  const cargarDatos = async () => {
    const { data: dataEquipos } = await supabase.from('equipos').select('*').order('nombre_equipo');
    if (dataEquipos) setEquipos(dataEquipos);

    const { data: dataPartidos } = await supabase
      .from('partidos')
      .select(`id_partido, fecha, id_local, id_visitante, estado, equipos!partidos_id_local_fkey(nombre_equipo), visitante:equipos!partidos_id_visitante_fkey(nombre_equipo)`)
      .order('fecha', { ascending: false });
    
    if (dataPartidos) {
      setPartidosPendientes(dataPartidos.filter(p => p.estado === 'PROGRAMADO'));
      // Mostramos los últimos 15 partidos jugados para asignar tarjetas
      setPartidosJugados(dataPartidos.filter(p => p.estado === 'FINALIZADO').slice(0, 15)); 
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  // Efecto inteligente: Cuando se selecciona un partido para tarjeta, buscar solo a sus jugadores
  useEffect(() => {
    async function buscarJugadores() {
      if (!formTarjeta.partido_id) {
        setJugadoresPartidoSeleccionado([]);
        return;
      }
      // Encontrar el partido seleccionado para saber quiénes jugaron
      const partido = partidosJugados.find(p => p.id_partido.toString() === formTarjeta.partido_id);
      if (partido) {
        const { data } = await supabase.from('jugadores')
          .select('id_jugador, nombre_completo, numero_dorsal, equipos(nombre_equipo)')
          .in('id_equipo', [partido.id_local, partido.id_visitante])
          .order('id_equipo');
        if (data) setJugadoresPartidoSeleccionado(data);
      }
    }
    buscarJugadores();
  }, [formTarjeta.partido_id, partidosJugados]);

  // Funciones de guardado existentes...
  const guardarResultado = async (e) => {
    e.preventDefault();
    await supabase.from('partidos').update({ goles_local: formResultado.local, goles_visitante: formResultado.visita, estado: 'FINALIZADO' }).eq('id_partido', formResultado.id);
    alert("¡Resultado guardado!"); setFormResultado({ id: '', local: 0, visita: 0 }); cargarDatos();
  };

  const agregarEquipo = async (e) => {
    e.preventDefault(); await supabase.from('equipos').insert([{ nombre_equipo: formEquipo.nombre }]);
    alert("¡Equipo agregado!"); setFormEquipo({ nombre: '' }); cargarDatos();
  };

  const agregarJugador = async (e) => {
    e.preventDefault(); 
    
    // Hacemos la petición a Supabase y guardamos el posible "error"
    const { error } = await supabase.from('jugadores').insert([{ 
      id_equipo: parseInt(formJugador.equipo_id), // Convertimos a número por si acaso
      nombre_completo: formJugador.nombre, 
      numero_dorsal: parseInt(formJugador.dorsal) // Convertimos a número por si acaso
    }]);
    
    // Si Supabase se queja, que nos muestre la queja real
    if (error) {
      console.error("Detalle del error:", error);
      alert("❌ Error de Supabase: " + error.message);
    } else {
      // Si no hay error, todo salió perfecto
      alert("✅ ¡Jugador agregado con éxito!"); 
      setFormJugador({ equipo_id: '', nombre: '', dorsal: '' });
    }
  };

  const agregarPartido = async (e) => {
    e.preventDefault(); await supabase.from('partidos').insert([{ jornada: formPartido.jornada, fecha: formPartido.fecha, hora: formPartido.hora, id_local: formPartido.local_id, id_visitante: formPartido.visita_id, estado: 'PROGRAMADO' }]);
    alert("¡Partido programado!"); setFormPartido({ jornada: '', fecha: '', hora: '', local_id: '', visita_id: '' }); cargarDatos();
  };

  // NUEVO: Función para guardar Tarjetas
  const agregarTarjeta = async (e) => {
    e.preventDefault();
    if (!formTarjeta.jugador_id) return alert("Selecciona un jugador");
    
    await supabase.from('registro_tarjetas').insert([{ 
      id_partido: formTarjeta.partido_id, 
      id_jugador: formTarjeta.jugador_id, 
      tipo_tarjeta: formTarjeta.tipo 
    }]);
    
    alert(`¡Tarjeta ${formTarjeta.tipo} registrada con éxito!`);
    // Limpiamos solo el jugador para poder meter otra tarjeta rápido en el mismo partido
    setFormTarjeta({ ...formTarjeta, jugador_id: '' }); 
  };

  const tabStyle = (tabName) => ({
    padding: '10px 15px', background: pestañaActiva === tabName ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
    color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', flex: '1', minWidth: '100px'
  });

  return (
    <div className="card" style={{ borderTop: '4px solid var(--accent-color)', marginBottom: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>⚙️ Centro de Control (Admin)</h2>
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
        <button style={tabStyle('resultados')} onClick={() => setPestañaActiva('resultados')}>🏆 Resultados</button>
        <button style={tabStyle('equipos')} onClick={() => setPestañaActiva('equipos')}>🛡️ Equipos</button>
        <button style={tabStyle('jugadores')} onClick={() => setPestañaActiva('jugadores')}>🏃‍♂️ Jugadores</button>
        <button style={tabStyle('partidos')} onClick={() => setPestañaActiva('partidos')}>📅 Partidos</button>
        {/* NUEVA PESTAÑA */}
        <button style={tabStyle('tarjetas')} onClick={() => setPestañaActiva('tarjetas')}>🟥 Sanciones</button>
      </div>

      {/* ... (El resto de las pestañas siguen igual, las omito visualmente aquí pero están en el código) ... */}
      {pestañaActiva === 'resultados' && (
        <form onSubmit={guardarResultado}>
          <h3>Cargar Resultado Final</h3>
          <select className="form-control" value={formResultado.id} onChange={(e) => setFormResultado({...formResultado, id: e.target.value})} required>
            <option value="">-- Selecciona el partido jugado --</option>
            {partidosPendientes.map(p => <option key={p.id_partido} value={p.id_partido}>{p.equipos.nombre_equipo} vs {p.visitante.nombre_equipo} ({p.fecha})</option>)}
          </select>
          <div className="score-inputs">
            <div className="score-box"><label>Local</label><input type="number" min="0" className="form-control" value={formResultado.local} onChange={(e) => setFormResultado({...formResultado, local: e.target.value})} required /></div>
            <h3 style={{ margin: 0 }}>VS</h3>
            <div className="score-box"><label>Visita</label><input type="number" min="0" className="form-control" value={formResultado.visita} onChange={(e) => setFormResultado({...formResultado, visita: e.target.value})} required /></div>
          </div>
          <button type="submit" className="btn-primary">Guardar Resultado</button>
        </form>
      )}

      {pestañaActiva === 'equipos' && (
        <form onSubmit={agregarEquipo} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3>Registrar Nuevo Equipo</h3>
          <input type="text" placeholder="Nombre del Equipo" className="form-control" value={formEquipo.nombre} onChange={(e) => setFormEquipo({nombre: e.target.value})} required />
          <button type="submit" className="btn-primary" style={{ background: '#3b82f6' }}>+ Agregar Equipo</button>
        </form>
      )}

      {pestañaActiva === 'jugadores' && (
        <form onSubmit={agregarJugador} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3>Registrar Nuevo Jugador</h3>
          <select className="form-control" value={formJugador.equipo_id} onChange={(e) => setFormJugador({...formJugador, equipo_id: e.target.value})} required>
            <option value="">-- Asignar a un Equipo --</option>
            {equipos.map(eq => <option key={eq.id_equipo} value={eq.id_equipo}>{eq.nombre_equipo}</option>)}
          </select>
          <input type="text" placeholder="Nombre Completo" className="form-control" value={formJugador.nombre} onChange={(e) => setFormJugador({...formJugador, nombre: e.target.value})} required />
          <input type="number" placeholder="Dorsal" className="form-control" value={formJugador.dorsal} onChange={(e) => setFormJugador({...formJugador, dorsal: e.target.value})} required />
          <button type="submit" className="btn-primary" style={{ background: '#10b981' }}>+ Registrar Jugador</button>
        </form>
      )}

      {pestañaActiva === 'partidos' && (
        <form onSubmit={agregarPartido} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3>Programar Partido</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="number" placeholder="Jornada" className="form-control" value={formPartido.jornada} onChange={(e) => setFormPartido({...formPartido, jornada: e.target.value})} required />
            <input type="date" className="form-control" value={formPartido.fecha} onChange={(e) => setFormPartido({...formPartido, fecha: e.target.value})} required />
            <input type="time" className="form-control" value={formPartido.hora} onChange={(e) => setFormPartido({...formPartido, hora: e.target.value})} required />
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select className="form-control" value={formPartido.local_id} onChange={(e) => setFormPartido({...formPartido, local_id: e.target.value})} required>
              <option value="">-- Local --</option>
              {equipos.map(eq => <option key={eq.id_equipo} value={eq.id_equipo}>{eq.nombre_equipo}</option>)}
            </select>
            <span>VS</span>
            <select className="form-control" value={formPartido.visita_id} onChange={(e) => setFormPartido({...formPartido, visita_id: e.target.value})} required>
              <option value="">-- Visitante --</option>
              {equipos.map(eq => <option key={eq.id_equipo} value={eq.id_equipo}>{eq.nombre_equipo}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ background: '#8b5cf6' }}>📅 Programar Partido</button>
        </form>
      )}

      {/* ---------------- NUEVA PESTAÑA: TARJETAS ---------------- */}
      {pestañaActiva === 'tarjetas' && (
        <form onSubmit={agregarTarjeta} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3>🟥 Registro de Sanciones</h3>
          
          <label style={{ color: 'var(--text-muted)' }}>1. Selecciona el partido jugado:</label>
          <select className="form-control" value={formTarjeta.partido_id} onChange={(e) => setFormTarjeta({...formTarjeta, partido_id: e.target.value})} required>
            <option value="">-- Elige un partido finalizado --</option>
            {partidosJugados.map(p => (
              <option key={p.id_partido} value={p.id_partido}>
                {p.equipos.nombre_equipo} vs {p.visitante.nombre_equipo} ({p.fecha})
              </option>
            ))}
          </select>

          {/* Solo mostramos los jugadores si ya se seleccionó un partido */}
          {formTarjeta.partido_id && (
            <>
              <label style={{ color: 'var(--text-muted)', marginTop: '10px' }}>2. Selecciona al jugador infractor:</label>
              <select className="form-control" value={formTarjeta.jugador_id} onChange={(e) => setFormTarjeta({...formTarjeta, jugador_id: e.target.value})} required>
                <option value="">-- Elige un jugador --</option>
                {jugadoresPartidoSeleccionado.map(j => (
                  <option key={j.id_jugador} value={j.id_jugador}>
                    #{j.numero_dorsal} {j.nombre_completo} ({j.equipos.nombre_equipo})
                  </option>
                ))}
              </select>

              <label style={{ color: 'var(--text-muted)', marginTop: '10px' }}>3. Tipo de Tarjeta:</label>
              <div style={{ display: 'flex', gap: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input type="radio" name="tipo" value="AMARILLA" checked={formTarjeta.tipo === 'AMARILLA'} onChange={(e) => setFormTarjeta({...formTarjeta, tipo: e.target.value})} />
                  <span style={{ display: 'inline-block', width: '15px', height: '20px', background: '#facc15', borderRadius: '3px' }}></span> Amarilla
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input type="radio" name="tipo" value="ROJA" checked={formTarjeta.tipo === 'ROJA'} onChange={(e) => setFormTarjeta({...formTarjeta, tipo: e.target.value})} />
                  <span style={{ display: 'inline-block', width: '15px', height: '20px', background: '#ef4444', borderRadius: '3px' }}></span> Roja
                </label>
              </div>

              <button type="submit" className="btn-primary" style={{ background: formTarjeta.tipo === 'ROJA' ? '#ef4444' : '#eab308', color: formTarjeta.tipo === 'AMARILLA' ? 'black' : 'white', marginTop: '15px' }}>
                Registrar Tarjeta {formTarjeta.tipo}
              </button>
            </>
          )}
        </form>
      )}

    </div>
  );
}