import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function TablaGoleo() {
  const [goleadores, setGoleadores] = useState([]);

  useEffect(() => {
    async function fetchGoleo() {
      const { data } = await supabase.from('vista_goleo').select('*');
      if (data) setGoleadores(data);
    }
    fetchGoleo();
  }, []);

  return (
    <div className="card">
      <h2>⚽ Goleo Ind.</h2>
      <table className="sports-table">
        <thead>
          <tr>
            <th>Jugador</th><th>Equipo</th><th>G</th>
          </tr>
        </thead>
        <tbody>
          {goleadores.map((jugador) => (
            <tr key={jugador.id_jugador}>
              <td><strong>{jugador.nombre_completo}</strong></td>
              <td style={{ color: 'var(--text-muted)' }}>{jugador.nombre_equipo}</td>
              <td className="highlight-pts">{jugador.goles}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}