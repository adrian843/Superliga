// src/CarruselGaleria.jsx
import { useState, useEffect } from 'react';

export default function CarruselGaleria() {
  // 📸 Aquí pones las URLs de tus mejores fotos
  const imagenes = [
    "https://images.unsplash.com/photo-1574629810360-7efbbcb27a59?q=80&w=1000&auto=format&fit=crop", // Jugador pateando
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000&auto=format&fit=crop", // Celebración/Trofeo
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1000&auto=format&fit=crop"  // Estadio iluminado
  ];

  const [indiceActual, setIndiceActual] = useState(0);

  // ⏱️ Efecto para que el carrusel se mueva solo cada 4 segundos
  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndiceActual((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
    }, 4000); // 4000 milisegundos = 4 segundos

    return () => clearInterval(intervalo); // Limpieza cuando cambias de pantalla
  }, [imagenes.length]);

  // Funciones para los botones manuales
  const irAnterior = () => {
    setIndiceActual(indiceActual === 0 ? imagenes.length - 1 : indiceActual - 1);
  };

  const irSiguiente = () => {
    setIndiceActual(indiceActual === imagenes.length - 1 ? 0 : indiceActual + 1);
  };

  return (
    <div className="card" style={{ marginBottom: '40px', padding: '0', overflow: 'hidden', position: 'relative' }}>
      <h2 style={{ textAlign: 'center', padding: '20px 0 10px 0', margin: '0', color: 'var(--accent-color)' }}>
        📸 GALERÍA DE LA LIGA
      </h2>
      
      {/* Contenedor de la imagen */}
      <div style={{ position: 'relative', width: '100%', height: '400px', backgroundColor: '#000' }}>
        <img 
          src={imagenes[indiceActual]} 
          alt={`Galería ${indiceActual + 1}`} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.5s ease-in-out' }} 
        />
        
        {/* Capa oscura (Overlay) opcional para que se vea más cinematográfico */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.8), transparent)' }}></div>
      </div>

      {/* ⬅️ Botón Anterior */}
      <button 
        onClick={irAnterior}
        style={{ position: 'absolute', top: '55%', left: '15px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}
      >
        ❮
      </button>

      {/* ➡️ Botón Siguiente */}
      <button 
        onClick={irSiguiente}
        style={{ position: 'absolute', top: '55%', right: '15px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}
      >
        ❯
      </button>

      {/* 🔵 Puntos indicadores (Dots) */}
      <div style={{ position: 'absolute', bottom: '15px', width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
        {imagenes.map((_, index) => (
          <span 
            key={index} 
            onClick={() => setIndiceActual(index)}
            style={{ 
              height: '10px', 
              width: '10px', 
              backgroundColor: indiceActual === index ? 'var(--accent-color)' : 'rgba(255,255,255,0.4)', 
              borderRadius: '50%', 
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
          ></span>
        ))}
      </div>
    </div>
  );
}