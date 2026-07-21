import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase Verbindung aufbauen (mit Fallback-URLs zur Sicherheit)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gcqcmqcptwvzhuivfbvi.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_-Ptr0K_5RmXee4XxrZb4CA_FEQ1E';
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

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Lade Fahrzeugdaten aus der Datenbank...</div>;
  if (!carA || !carB) return <div style={{ padding: '40px', textAlign: 'center' }}>Keine Autos in der Datenbank gefunden.</div>;

  const scale = 300 / 5000; // Maßstabsberechnung (5000mm max)

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>🚗 Einfacher Auto-Vergleich für Jeden</h1>

      {/* Auto-Auswahl */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div>
          <label><strong>Auto 1:</strong> </label>
          <select value={carA.id} onChange={(e) => setCarA(cars.find(c => c.id === e.target.value))}>
            {cars.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.year})</option>)}
          </select>
        </div>
        <div>
          <label><strong>Auto 2:</strong> </label>
          <select value={carB.id} onChange={(e) => setCarB(cars.find(c => c.id === e.target.value))}>
            {cars.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.year})</option>)}
          </select>
        </div>
      </div>

      {/* Visueller Längenvergleich */}
      <h2>📏 Visueller Größenvergleich (Länge)</h2>
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <div style={{ marginBottom: '15px' }}>
          <strong>{carA.brand} {carA.model} ({carA.length_mm} mm):</strong>
          <div style={{
            width: `${carA.length_mm * scale}px`,
            height: '40px',
            backgroundColor: '#3b82f6',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            marginTop: '5px',
            fontSize: '12px'
          }}>
            {carA.brand} {carA.model}
          </div>
        </div>

        <div>
          <strong>{carB.brand} {carB.model} ({carB.length_mm} mm):</strong>
          <div style={{
            width: `${carB.length_mm * scale}px`,
            height: '40px',
            backgroundColor: '#ef4444',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            marginTop: '5px',
            fontSize: '12px'
          }}>
            {carB.brand} {carB.model}
          </div>
        </div>
      </div>

      {/* Alltagstauglichkeit */}
      <h2>🛒 Kofferraum & Alltag</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
        <thead>
          <tr style={{ background: '#e5e7eb', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>Eigenschaft</th>
            <th style={{ padding: '10px', color: '#2563eb' }}>{carA.brand} {carA.model}</th>
            <th style={{ padding: '10px', color: '#dc2626' }}>{carB.brand} {carB.model}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Kofferraum-Volumen</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{carA.boot_capacity_liters} Liter</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{carB.boot_capacity_liters} Liter</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Getränkekisten (ca.)</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>📦 {carA.boot_crates_count} Kisten</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>📦 {carB.boot_crates_count} Kisten</td>
          </tr>
          <tr>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Zusammenfassung</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{carA.layman_summary}</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{carB.layman_summary}</td>
          </tr>
        </tbody>
      </table>

      {/* Kosten pro Jahr */}
      <h2>💰 Laufende Kosten pro Jahr (Schätzung)</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '8px' }}>
          <h3>{carA.brand} {carA.model}</h3>
          <p>Wertverlust: ~{carA.depreciation_per_year} € / Jahr</p>
          <p>Wartung: ~{carA.maintenance_per_year} € / Jahr</p>
          <p>Versicherung: ~{carA.insurance_per_year} € / Jahr</p>
          <hr />
          <p><strong>Gesamt-Laufkosten: ~{(carA.depreciation_per_year || 0) + (carA.maintenance_per_year || 0) + (carA.insurance_per_year || 0)} € / Jahr</strong></p>
        </div>

        <div style={{ background: '#fef2f2', padding: '15px', borderRadius: '8px' }}>
          <h3>{carB.brand} {carB.model}</h3>
          <p>Wertverlust: ~{carB.depreciation_per_year} € / Jahr</p>
          <p>Wartung: ~{carB.maintenance_per_year} € / Jahr</p>
          <p>Versicherung: ~{carB.insurance_per_year} € / Jahr</p>
          <hr />
          <p><strong>Gesamt-Laufkosten: ~{(carB.depreciation_per_year || 0) + (carB.maintenance_per_year || 0) + (carB.insurance_per_year || 0)} € / Jahr</strong></p>
        </div>
      </div>
    </div>
  );
}
