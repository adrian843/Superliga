import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function DashboardDT() {
  const [proximoPartido, setProximoPartido] = useState(null);
  const equipoId = 5; 

  useEffect(() => {
    async function fetchProximoPartido() {
      const { data } = await supabase.from('partidos').select('*')
        .or(`id_local.eq.${equipoId},id_visitante.eq.${equipoId}`)
        .eq('estado', 'PROGRAMADO').order('fecha', { ascending: true }).limit(1).single();
      if (data) setProximoPartido(data);
    }
    fetchProximoPartido();
  }, []);

  return (
    <div className="grid-top">
      <div className="card">
        <h2>📅 Próximo Partido (Cuervos)</h2>
        {proximoPartido ? (
          <div>
            <p style={{ fontSize: '1.2rem' }}><strong>Jornada {proximoPartido.jornada}</strong></p>
            <p style={{ color: 'var(--text-muted)' }}>{proximoPartido.fecha} | {proximoPartido.hora}</p>
            <p><strong>Cancha:</strong> La Bandera</p>
            <button className="btn-primary">Confirmar Asistencia</button>
          </div>
        ) : (
          <p>No hay partidos programados.</p>
        )}
      </div>

      <div className="card">
        <h2>🔴 Transmisión <span className="live-badge">EN VIVO</span></h2>
        <iframe width="100%" height="250" src="https://www.youtube.com/embed/live_stream?channel=UC4R8DWoMoI7CAwX8_LjQHig" title="En Vivo" frameBorder="0" allowFullScreen style={{ borderRadius: '8px' }}></iframe>
      </div>
    </div>
  );
}