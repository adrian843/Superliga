import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function TablaPosiciones() {
  const [posiciones, setPosiciones] = useState([]);

  useEffect(() => {
    async function fetchPosiciones() {
      const { data } = await supabase.from('vista_posiciones').select('*');
      if (data) setPosiciones(data);
    }
    fetchPosiciones();
  }, []);

  return (
    <div className="card">
      <h2>🏆 Tabla General</h2>
      <table className="sports-table">
        <thead>
          <tr>
            <th>Pos</th><th>Equipo</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>DIF</th><th>PTS</th>
          </tr>
        </thead>
        <tbody>
          {posiciones.map((equipo, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td><strong>{equipo.nombre_equipo}</strong></td>
              <td>{equipo.pj}</td><td>{equipo.pg}</td><td>{equipo.pe}</td><td>{equipo.pp}</td>
              <td>{equipo.dif}</td>
              <td className="highlight-pts">{equipo.puntos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}