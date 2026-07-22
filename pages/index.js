import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function CarSizedPro() {
  const [cars, setCars] = useState([]);
  const [carA, setCarA] = useState(null);
  const [carB, setCarB] = useState(null);
  const [loading, setLoading] = useState(true);

  // KI-Kaufberater States
  const [userQuery, setUserQuery] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  // Supabase-Datenbank beim Start laden
  useEffect(() => {
    async function fetchCars() {
      const url = 'https://gcqcmqcptwvzhuivfbvi.supabase.co';
      const key = 'sb_publishable_-PtrOK_5RmXee4XxrZb4CA_FEQ1E1Ak';

      if (!url || !key) {
        setLoading(false);
        return;
      }

      const supabase = createClient(url, key);
      const { data, error } = await supabase.from('cars').select('*');

      if (!error && data && data.length > 0) {
        setCars(data);
        setCarA(data[0]);
        setCarB(data[1] || data[0]);
      }
      setLoading(false);
    }
    fetchCars();
  }, []);

  // KI-Kaufberater Logik: Analysiert den Freitext auf Kriterien
  const handleAiSearch = () => {
    if (!userQuery.trim() || cars.length === 0) return;

    const query = userQuery.toLowerCase();

    // Scoring-System für die Autos
    const scoredCars = cars.map(car => {
      let score = 0;
      let reasons = [];

      // 1. Budget-Erkennung (z.B. "unter 30000", "30.000 €")
      const budgetMatch = query.match(/(\d+[\d\.]*)\s*(euro|€|k)?/);
      if (budgetMatch) {
        let maxBudget = parseFloat(budgetMatch[1].replace('.', ''));
        if (budgetMatch[2] === 'k') maxBudget *= 1000;
        
        const price = car.used_price || car.new_price || 0;
        if (price > 0 && price <= maxBudget) {
          score += 5;
          reasons.push(`Passt ins Budget (${price.toLocaleString()} €)`);
        }
      }

      // 2. Antriebsarten
      if (query.includes('elektro') || query.includes('strom')) {
        if (car.fuel_type?.toLowerCase().includes('elektro')) { score += 4; reasons.push('Elektroantrieb'); }
      }
      if (query.includes('diesel')) {
        if (car.fuel_type?.toLowerCase().includes('diesel')) { score += 4; reasons.push('Sparsamer Diesel'); }
      }
      if (query.includes('benzin')) {
        if (car.fuel_type?.toLowerCase().includes('benzin')) { score += 4; reasons.push('Benziner'); }
      }

      // 3. Alltag & Platz
      if (query.includes('familie') || query.includes('groß') || query.includes('kofferraum') || query.includes('platz')) {
        if ((car.boot_capacity_liters || 0) > 450) { score += 3; reasons.push('Großer Kofferraum'); }
      }

      // 4. Kosten & Sparsamkeit
      if (query.includes('günstig') || query.includes('sparen') || query.includes('niedrig')) {
        if ((car.insurance_per_year || 0) < 700) { score += 2; reasons.push('Günstige Versicherung'); }
        if ((car.maintenance_per_year || 0) < 400) { score += 2; reasons.push('Niedrige Servicekosten'); }
      }

      return { car, score, reasons };
    });

    // Nach Punktzahl sortieren und Top-Ergebnisse filtern
    const sorted = scoredCars
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    setRecommendations(sorted.length > 0 ? sorted : [{ car: cars[0], score: 1, reasons: ['Standard-Empfehlungs-Match'] }]);
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'system-ui, sans-serif', color: '#94a3b8', backgroundColor: '#0f172a', minHeight: '100vh' }}>
        <h2>🚗 Lade Fahrzeug-Datenbank...</h2>
      </div>
    );
  }

  if (!carA || !carB) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'system-ui, sans-serif', color: '#f8fafc', backgroundColor: '#0f172a', minHeight: '100vh' }}>
        <h2>Keine Autos in der Datenbank gefunden. Bitte Autos in Supabase anlegen.</h2>
      </div>
    );
  }

  const getWidthPercent = (lengthMm) => ((lengthMm || 4000) / 5200) * 100;

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '30px 15px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#38bdf8' }}>
            📐 CARSIZED + KI-BERATER
          </h1>
          <p style={{ color: '#94a3b8' }}>Visueller Größenvergleich, Unterhaltskosten & KI-Kaufberatung</p>
        </header>

        {/* 1. SEKTION: KI-FREITEXT KAUFBERATER */}
        <section style={{ background: '#1e293b', padding: '25px', borderRadius: '16px', marginBottom: '40px', border: '1px solid #3b82f6' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#60a5fa', marginBottom: '10px' }}>🤖 Smartes KI-Kaufberater-System</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '15px' }}>
            Beschreiben Sie Ihre Wünsche in eigenen Worten (z. B. <i>"Ich suche einen Familien-Kombi mit Diesel unter 30000 Euro und günstiger Versicherung"</i>):
          </p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input 
              type="text" 
              placeholder="z. B. Elektroauto mit großem Kofferraum für unter 40.000 €..." 
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
              style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '1rem', outline: 'none' }}
            />
            <button 
              onClick={handleAiSearch}
              style={{ padding: '0 24px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Empfehlung finden
            </button>
          </div>

          {/* KI Empfehlungsergebnis */}
          {recommendations.length > 0 && (
            <div style={{ display: 'grid', gap: '15px' }}>
              {recommendations.map(({ car, reasons }, idx) => (
                <div key={car.id || idx} style={{ background: '#0f172a', padding: '15px 20px', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: '#34d399' }}>#{idx + 1} Empfehlung: {car.brand} {car.model}</h3>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>~{(car.used_price || car.new_price || 0).toLocaleString()} €</span>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                    <strong>Gründe für Match:</strong> {reasons.join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2. SEKTION: VISUELLER GRÖSSENVERGLEICH */}
        <section style={{ background: '#1e293b', padding: '25px', borderRadius: '16px', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', color: '#38bdf8' }}>📏 Visueller Maßstabs-Vergleich</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>FAHRZEUG 1</label>
              <select 
                value={carA.id} 
                onChange={(e) => setCarA(cars.find(c => c.id === e.target.value))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }}
              >
                {cars.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.year})</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>FAHRZEUG 2</label>
              <select 
                value={carB.id} 
                onChange={(e) => setCarB(cars.find(c => c.id === e.target.value))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }}
              >
                {cars.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.year})</option>)}
              </select>
            </div>
          </div>

          {/* Balken-Längenvergleich */}
          <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '5px' }}>{carA.brand} {carA.model} ({carA.length_mm} mm)</div>
              <div style={{ width: `${getWidthPercent(carA.length_mm)}%`, height: '45px', backgroundColor: '#38bdf8', borderRadius: '6px', transition: 'width 0.3s ease' }} />
            </div>

            <div>
              <div style={{ fontSize: '0.9rem', marginBottom: '5px' }}>{carB.brand} {carB.model} ({carB.length_mm} mm)</div>
              <div style={{ width: `${getWidthPercent(carB.length_mm)}%`, height: '45px', backgroundColor: '#f43f5e', borderRadius: '6px', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        </section>

        {/* 3. SEKTION: KOSTENVERGLEICH */}
        <section style={{ background: '#1e293b', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 25px', background: '#334155' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>💰 Detaillierter Kosten- & Zuverlässigkeitsvergleich</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '15px 20px' }}>Kriterium</th>
                <th style={{ padding: '15px 20px', color: '#38bdf8' }}>{carA.brand} {carA.model}</th>
                <th style={{ padding: '15px 20px', color: '#f43f5e' }}>{carB.brand} {carB.model}</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '12px 20px' }}>Antriebsart</td>
                <td style={{ padding: '12px 20px' }}>{carA.fuel_type || 'k. A.'}</td>
                <td style={{ padding: '12px 20px' }}>{carB.fuel_type || 'k. A.'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '12px 20px' }}>Neupreis / Gebrauchtwagenpreis</td>
                <td style={{ padding: '12px 20px' }}>{carA.new_price ? `${carA.new_price.toLocaleString()} €` : '-'} / {carA.used_price ? `${carA.used_price.toLocaleString()} €` : '-'}</td>
                <td style={{ padding: '12px 20px' }}>{carB.new_price ? `${carB.new_price.toLocaleString()} €` : '-'} / {carB.used_price ? `${carB.used_price.toLocaleString()} €` : '-'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '12px 20px' }}>Versicherung / Jahr</td>
                <td style={{ padding: '12px 20px' }}>~{carA.insurance_per_year || 0} €</td>
                <td style={{ padding: '12px 20px' }}>~{carB.insurance_per_year || 0} €</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '12px 20px' }}>Service- & Wartungskosten / Jahr</td>
                <td style={{ padding: '12px 20px' }}>~{carA.maintenance_per_year || 0} €</td>
                <td style={{ padding: '12px 20px' }}>~{carB.maintenance_per_year || 0} €</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '12px 20px' }}>Reparaturanfälligkeit</td>
                <td style={{ padding: '12px 20px' }}>{carA.reliability_index || 'Normal'}</td>
                <td style={{ padding: '12px 20px' }}>{carB.reliability_index || 'Normal'}</td>
              </tr>
            </tbody>
          </table>
        </section>

      </div>
    </div>
  );
}
