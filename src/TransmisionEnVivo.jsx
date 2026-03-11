// src/TransmisionEnVivo.jsx
export default function TransmisionEnVivo() {
  return (
    <div className="card" style={{ borderTop: '4px solid #ef4444', marginBottom: '40px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        🔴 TRANSMISIÓN <span className="live-badge">EN VIVO</span>
      </h2>
      
      {/* Contenedor del video */}
      <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: '0', borderRadius: '8px', overflow: 'hidden' }}>
        {/* Usamos el de YouTube por ahora para que no te dé problemas en localhost */}
        <iframe 
          style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', border: 'none' }}
          src="https://www.youtube.com/embed/live_stream?channel=UC4R8DWoMoI7CAwX8_LjQHig" 
          title="En Vivo Liga La Bandera" 
          allowFullScreen
        ></iframe>
      </div>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '15px', fontSize: '0.9rem' }}>
        *La transmisión inicia 10 minutos antes del primer partido.
      </p>
    </div>
  );
}