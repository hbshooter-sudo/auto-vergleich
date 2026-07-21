import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase Verbindung aufbauen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CarComparator() {
  const [cars, setCars] = useState([]);
  const [carA, setCarA] = useState(null);
  const [carB, setCarB] = useState(null);
  const [loading, setLoading] = useState(true);

  // Autos aus Supabase laden
  useEffect(() => {
    async function fetchCars() {
      const { data, error } = await supabase.from('cars').select('*');
      if (error) {
        console.error('Fehler beim Laden:', error);
      } else if (data && data.length > 0) {
        setCars(data);
        setCarA(data[0]);
        setCarB(data[1] || data[0]);
      }
      setLoading(false);
    }
    fetchCars();
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>🔄 Lade Fahrzeugdaten aus der Datenbank...</div>;
  if (!carA || !carB) return <div style={{ padding: '40px' }}>Keine Autos in der Datenbank gefunden.</div>;

  const scale = 300 / 5000; // Maßstabsberechnung (5000mm max)

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>🚗 Einfacher Auto-Vergleich für Jeden</h1>
      
      {/* Auto-Auswahl */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div>
          <label><strong>Auto 1: </strong></label>
          <select value={carA.id} onChange={(e) => setCarA(cars.find(c => c.id === e.target.value))}>
            {cars.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.year})</option>)}
          </select>
        </div>
        <div>
          <label><strong>Auto 2: </strong></label>
          <select value={carB.id} onChange={(e) => setCarB(cars.find(c => c.id === e.target.value))}>
            {cars.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.year})</option>)}
          </select>
        </div>
      </div>

      {/* VISUELLER GRÖSSENVERGLEICH */}
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e9ecef' }}>
        <h3>📐 Visueller Größenvergleich (Länge & Höhe)</h3>
        <svg width="100%" height="160" viewBox="0 0 350 160">
          <line x1="10" y1="140" x2="340" y2="140" stroke="#adb5bd" strokeWidth="2" />
          
          {/* Auto 1 (Blau) */}
          <rect 
            x="20" 
            y={140 - (carA.height_mm * scale)} 
            width={carA.length_mm * scale} 
            height={carA.height_mm * scale} 
            fill="rgba(0, 122, 255, 0.35)" 
            stroke="#007AFF" 
            strokeWidth="2.5"
            rx="8"
          />
          
          {/* Auto 2 (Orange) */}
          <rect 
            x="20" 
            y={140 - (carB.height_mm * scale)} 
            width={carB.length_mm * scale} 
            height={carB.height_mm * scale} 
            fill="rgba(255, 149, 0, 0.35)" 
            stroke="#FF9500" 
            strokeWidth="2.5"
            rx="8"
          />
        </svg>
        <p style={{ fontSize: '0.9em', color: '#495057' }}>
          🔵 <strong style={{color: '#007AFF'}}>{carA.brand} {carA.model}</strong> ({carA.length_mm}mm lang) vs. 
          🟠 <strong style={{color: '#FF9500'}}>{carB.brand} {carB.model}</strong> ({carB.length_mm}mm lang)
        </p>
      </div>

      {/* KOFFERRAUM & ALLTAGSTAUGLICHKEIT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div style={{ border: '1px solid #dee2e6', padding: '15px', borderRadius: '8px', background: '#fff' }}>
          <h4>🧳 Kofferraum: {carA.brand} {carA.model}</h4>
          <p><strong>Volumen:</strong> {carA.boot_capacity_liters} Liter</p>
          <p><strong>Platz für ca.:</strong> {'🧃 '.repeat(carA.boot_crates_count || 1)} ({carA.boot_crates_count} Getränkekisten)</p>
          <p style={{ fontSize: '0.85em', color: '#6c757d' }}><em>"{carA.layman_summary}"</em></p>
        </div>
        <div style={{ border: '1px solid #dee2e6', padding: '15px', borderRadius: '8px', background: '#fff' }}>
          <h4>🧳 Kofferraum: {carB.brand} {carB.model}</h4>
          <p><strong>Volumen:</strong> {carB.boot_capacity_liters} Liter</p>
          <p><strong>Platz für ca.:</strong> {'🧃 '.repeat(carB.boot_crates_count || 1)} ({carB.boot_crates_count} Getränkekisten)</p>
          <p style={{ fontSize: '0.85em', color: '#6c757d' }}><em>"{carB.layman_summary}"</em></p>
        </div>
      </div>

      {/* KOSTEN & REPARATUR-RISIKO */}
      <h3>💰 Echte Gesamtkosten & Zuverlässigkeit</h3>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', borderColor: '#dee2e6' }}>
        <thead>
          <tr style={{ background: '#f1f3f5' }}>
            <th>Kriterium</th>
            <th>{carA.brand} {carA.model}</th>
            <th>{carB.brand} {carB.model}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Durchschnittlicher Gebrauchtwagenpreis</strong></td>
            <td>ca. {carA.price_used_avg ? carA.price_used_avg + ' €' : 'k.A.'}</td>
            <td>ca. {carB.price_used_avg ? carB.price_used_avg + ' €' : 'k.A.'}</td>
          </tr>
          <tr>
            <td><strong>Verbrauch</strong></td>
            <td>{carA.fuel_consumption_100km} L / 100km</td>
            <td>{carB.fuel_consumption_100km} L / 100km</td>
          </tr>
          <tr>
            <td><strong>Zuverlässigkeit</strong></td>
            <td>{carA.reliability_score} / 10 ⭐</td>
            <td>{carB.reliability_score} / 10 ⭐</td>
          </tr>
          <tr>
            <td><strong>Laien-Tipp / Mängel</strong></td>
            <td style={{ fontSize: '0.85em' }}>{carA.reliability_notes}</td>
            <td style={{ fontSize: '0.85em' }}>{carB.reliability_notes}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
} 
