// src/Patrocinadores.jsx

export default function Patrocinadores() {
  // Lista de logos (Puedes cambiarlos por los reales de tus clientes)
  const logos = [
    "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
    "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/e/e8/Puma_Logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/4/44/Under_armour_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/7/7b/Gatorade_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/a/a7/Powerade_logo.svg"
  ];

  return (
    <div style={{ marginTop: '50px', marginBottom: '20px', textAlign: 'center' }}>
      <h3 style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', marginBottom: '20px' }}>
        Patrocinadores Oficiales
      </h3>
      
      <div className="patrocinadores-container">
        {/* Primer bloque de logos */}
        <div className="patrocinadores-track">
          {logos.map((logo, index) => (
            <img key={`logo1-${index}`} src={logo} alt={`Patrocinador ${index}`} />
          ))}
        </div>
        
        {/* Segundo bloque exacto al primero (es un truco visual para que el scroll sea infinito y no se corte) */}
        <div className="patrocinadores-track">
          {logos.map((logo, index) => (
            <img key={`logo2-${index}`} src={logo} alt={`Patrocinador ${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
}