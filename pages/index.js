import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function CarComparator() {
  const [cars, setCars] = useState([]);
  const [carA, setCarA] = useState(null);
  const [carB, setCarB] = useState(null);
  const [loading, setLoading] = useState(true);

  // Autos aus Supabase laden
  useEffect(() => {
    async function fetchCars() {
      // Basis-URL ohne Slash am Ende für saubere API-Aufrufe
      const url = 'https://gcqcmqcptwvzhuivfbvi.supabase.co';
      const key = 'sb_publishable_-PtrOK_5RmXee4XxrZb4CA_FEQ1E1Ak';

      if (!url || !key) {
        console.error('Supabase URL oder Key fehlt!');
        setLoading(false);
        return;
      }

      const supabase = createClient(url, key);
      const { data, error } = await supabase.from('cars').select('*').order('brand', { ascending: true });
      
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

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'system-ui, sans-serif', color: '#4b5563' }}>
        <h2>🚗 Lade Fahrzeugdaten aus der Datenbank...</h2>
      </div>
    );
  }

  if (!carA || !carB) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <h2>Keine Autos in der Datenbank gefunden.</h2>
      </div>
    );
  }

  const scale = 100 / 5000; // Prozentuale Skalierung (5000 mm Basis)
  const costA = (carA.depreciation_per_year || 0) + (carA.maintenance_per_year || 0) + (carA.insurance_per_year || 0);
  const costB = (carB.depreciation_per_year || 0) + (carB.maintenance_per_year || 0) + (carB.insurance_per_year || 0);

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', padding: '30px 15px', color: '#0f172a' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
            🚘 Auto-Vergleichsportal
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
            Vergleichen Sie Abmessungen, Alltagstauglichkeit und Unterhaltskosten auf einen Blick.
          </p>
        </header>

        {/* Fahrzeug-Auswahl & Vorschau-Karten */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          
          {/* Auto A Card */}
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderTop: '6px solid #3b82f6' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>
              FAHRZEUG 1
            </label>
            <select 
              value={carA.id} 
              onChange={(e) => setCarA(cars.find(c => c.id === e.target.value))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontWeight: 'bold', marginBottom: '15px', outline: 'none' }}
            >
              {cars.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.year})</option>)}
            </select>

            {carA.image_url && (
              <div style={{ overflow: 'hidden', borderRadius: '12px', height: '180px', marginBottom: '12px', backgroundColor: '#e2e8f0' }}>
                <img src={carA.image_url} alt={`${carA.brand} ${carA.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            
            {(carA.fuel_type || carA.power_hp) && (
              <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                ⚡ {carA.fuel_type || 'N/A'} {carA.power_hp ? `• ${carA.power_hp} PS` : ''}
              </span>
            )}
          </div>

          {/* Auto B Card */}
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderTop: '6px solid #ef4444' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>
              FAHRZEUG 2
            </label>
            <select 
              value={carB.id} 
              onChange={(e) => setCarB(cars.find(c => c.id === e.target.value))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontWeight: 'bold', marginBottom: '15px', outline: 'none' }}
            >
              {cars.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.year})</option>)}
            </select>

            {carB.image_url && (
              <div style={{ overflow: 'hidden', borderRadius: '12px', height: '180px', marginBottom: '12px', backgroundColor: '#e2e8f0' }}>
                <img src={carB.image_url} alt={`${carB.brand} ${carB.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            
            {(carB.fuel_type || carB.power_hp) && (
              <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                ⚡ {carB.fuel_type || 'N/A'} {carB.power_hp ? `• ${carB.power_hp} PS` : ''}
              </span>
            )}
          </div>

        </div>

        {/* Visueller Längenvergleich */}
        <section style={{ background: '#ffffff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', color: '#1e293b' }}>📏 Visueller Größenvergleich (Länge)</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '6px' }}>
              <span>{carA.brand} {carA.model}</span>
              <span>{carA.length_mm} mm</span>
            </div>
            <div style={{ background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', height: '28px' }}>
              <div style={{ width: `${carA.length_mm * scale}%`, height: '100%', backgroundColor: '#3b82f6', borderRadius: '8px', transition: 'width 0.4s ease' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '6px' }}>
              <span>{carB.brand} {carB.model}</span>
              <span>{carB.length_mm} mm</span>
            </div>
            <div style={{ background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', height: '28px' }}>
              <div style={{ width: `${carB.length_mm * scale}%`, height: '100%', backgroundColor: '#ef4444', borderRadius: '8px', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </section>

        {/* Vergleichstabelle */}
        <section style={{ background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '30px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '16px 20px', color: '#475569' }}>Eigenschaft</th>
                <th style={{ padding: '16px 20px', color: '#2563eb', width: '38%' }}>{carA.brand} {carA.model}</th>
                <th style={{ padding: '16px 20px', color: '#dc2626', width: '38%' }}>{carB.brand} {carB.model}</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '0.95rem' }}>
              {carA.fuel_type && (
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: '600' }}>Antrieb & Verbrauch</td>
                  <td style={{ padding: '14px 20px' }}>{carA.fuel_type} {carA.consumption ? `(${carA.consumption})` : ''}</td>
                  <td style={{ padding: '14px 20px' }}>{carB.fuel_type} {carB.consumption ? `(${carB.consumption})` : ''}</td>
                </tr>
              )}
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 20px', fontWeight: '600' }}>Kofferraum-Volumen</td>
                <td style={{ padding: '14px 20px' }}><strong>{carA.boot_capacity_liters} Liter</strong></td>
                <td style={{ padding: '14px 20px' }}><strong>{carB.boot_capacity_liters} Liter</strong></td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 20px', fontWeight: '600' }}>Getränkekisten (ca.)</td>
                <td style={{ padding: '14px 20px' }}>📦 {carA.boot_crates_count} Kisten</td>
                <td style={{ padding: '14px 20px' }}>📦 {carB.boot_crates_count} Kisten</td>
              </tr>
              <tr>
                <td style={{ padding: '14px 20px', fontWeight: '600' }}>Zusammenfassung</td>
                <td style={{ padding: '14px 20px', color: '#475569', lineHeight: '1.4' }}>{carA.layman_summary}</td>
                <td style={{ padding: '14px 20px', color: '#475569', lineHeight: '1.4' }}>{carB.layman_summary}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Unterhaltskosten */}
        <h2 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '15px' }}>💰 Geschätzte Unterhaltskosten / Jahr</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', borderLeft: '4px solid #3b82f6', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '1.1rem' }}>{carA.brand} {carA.model}</h3>
            <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.8' }}>
              <div>• Wertverlust: ~{carA.depreciation_per_year || 0} € / Jahr</div>
              <div>• Wartung: ~{carA.maintenance_per_year || 0} € / Jahr</div>
              <div>• Versicherung: ~{carA.insurance_per_year || 0} € / Jahr</div>
            </div>
            <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontWeight: 'bold', fontSize: '1.05rem', color: '#2563eb' }}>
              Gesamt-Laufkosten: ~{costA} € / Jahr
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', borderLeft: '4px solid #ef4444', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '1.1rem' }}>{carB.brand} {carB.model}</h3>
            <div style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.8' }}>
              <div>• Wertverlust: ~{carB.depreciation_per_year || 0} € / Jahr</div>
              <div>• Wartung: ~{carB.maintenance_per_year || 0} € / Jahr</div>
              <div>• Versicherung: ~{carB.insurance_per_year || 0} € / Jahr</div>
            </div>
            <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontWeight: 'bold', fontSize: '1.05rem', color: '#dc2626' }}>
              Gesamt-Laufkosten: ~{costB} € / Jahr
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
