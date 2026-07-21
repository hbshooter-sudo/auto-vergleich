import React, { useState } from 'react';

// Beispiel-Datenbankstruktur (wird später live aus Supabase geladen)
const SAMPLE_CARS = [
  { id: '1', brand: 'VW', model: 'Golf VIII', length: 4284, height: 1456, boot: 381, crates: 4, tco: 3850, reliability: 7 },
  { id: '2', brand: 'Tesla', model: 'Model Y', length: 4751, height: 1624, boot: 854, crates: 9, tco: 4150, reliability: 8 }
];

export default function CarComparator() {
  const [carA, setCarA] = useState(SAMPLE_CARS[0]);
  const [carB, setCarB] = useState(SAMPLE_CARS[1]);

  // Maßstabs-Berechnung für den visuellen Vergleich (Max. Länge = 5000mm)
  const scale = 300 / 5000; 

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>🚗 Einfacher Auto-Vergleich für Jeden</h1>
      
      {/* Auto-Auswahl */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div>
          <label>Auto 1: </label>
          <select onChange={(e) => setCarA(SAMPLE_CARS.find(c => c.id === e.target.value))}>
            {SAMPLE_CARS.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model}</option>)}
          </select>
        </div>
        <div>
          <label>Auto 2: </label>
          <select onChange={(e) => setCarB(SAMPLE_CARS.find(c => c.id === e.target.value))} defaultValue="2">
            {SAMPLE_CARS.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model}</option>)}
          </select>
        </div>
      </div>

      {/* VISUELLER GRÖSSENVERGLEICH */}
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>📐 Visueller Größenvergleich (Länge & Höhe)</h3>
        <svg width="100%" height="150" viewBox="0 0 350 150">
          {/* Bodenlinie */}
          <line x1="10" y1="130" x2="340" y2="130" stroke="#ccc" strokeWidth="2" />
          
          {/* Auto 1 (Blau) */}
          <rect 
            x="20" 
            y={130 - (carA.height * scale)} 
            width={carA.length * scale} 
            height={carA.height * scale} 
            fill="rgba(0, 122, 255, 0.4)" 
            stroke="#007AFF" 
            strokeWidth="2"
            rx="10"
          />
          
          {/* Auto 2 (Rot/Orange) */}
          <rect 
            x="20" 
            y={130 - (carB.height * scale)} 
            width={carB.length * scale} 
            height={carB.height * scale} 
            fill="rgba(255, 149, 0, 0.4)" 
            stroke="#FF9500" 
            strokeWidth="2"
            rx="10"
          />
        </svg>
        <p style={{ fontSize: '0.85em', color: '#666' }}>
          🔵 <strong style={{color: '#007AFF'}}>{carA.brand} {carA.model}</strong> ({carA.length}mm lang) vs. 
          🟠 <strong style={{color: '#FF9500'}}>{carB.brand} {carB.model}</strong> ({carB.length}mm lang)
        </p>
      </div>

      {/* KOFFERRAUM & ALLTAGSTAUGLICHKEIT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
          <h4>🧳 Kofferraum: {carA.brand} {carA.model}</h4>
          <p><strong>Volumen:</strong> {carA.boot} Liter</p>
          <p><strong>Platz für ca.:</strong> {'🧃 '.repeat(carA.crates)} ({carA.crates} Getränkekisten)</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
          <h4>🧳 Kofferraum: {carB.brand} {carB.model}</h4>
          <p><strong>Volumen:</strong> {carB.boot} Liter</p>
          <p><strong>Platz für ca.:</strong> {'🧃 '.repeat(carB.crates)} ({carB.crates} Getränkekisten)</p>
        </div>
      </div>

      {/* KOSTEN & REPARATUR-RISIKO */}
      <h3>💰 Echte Gesamtkosten & Zuverlässigkeit</h3>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', borderColor: '#eee' }}>
        <thead>
          <tr style={{ background: '#fafafa' }}>
            <th>Kriterium</th>
            <th>{carA.brand} {carA.model}</th>
            <th>{carB.brand} {carB.model}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Gesamtkosten / Jahr (inkl. Wertverlust)</strong></td>
            <td>ca. {carA.tco} € / Jahr</td>
            <td>ca. {carB.tco} € / Jahr</td>
          </tr>
          <tr>
            <td><strong>Zuverlässigkeit (1-10)</strong></td>
            <td>{carA.reliability} / 10 ⭐</td>
            <td>{carB.reliability} / 10 ⭐</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
