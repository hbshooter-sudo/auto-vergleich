import React, { useState, useEffect } from 'react';
import Head from 'next/head';
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

  // Instant-Suche beim Tippen
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userQuery.trim()) {
        executeSearch(userQuery);
      } else {
        setRecommendations([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [userQuery, cars]);

  const runAiSearch = (queryText) => {
    setUserQuery(queryText);
    executeSearch(queryText);
  };

  const handleAiSearch = () => {
    executeSearch(userQuery);
  };

  const executeSearch = (searchText) => {
    if (!searchText.trim() || cars.length === 0) return;

    const query = searchText.toLowerCase();

    const scoredCars = cars.map(car => {
      let score = 0;
      let reasons = [];

      const budgetMatch = query.match(/(\d+[\d\.]*)\s*(euro|€|k)?/);
      if (budgetMatch) {
        let maxBudget = parseFloat(budgetMatch[1].replace('.', ''));
        if (budgetMatch[2] === 'k') maxBudget *= 1000;
        
        const price = car.used_price || car.new_price || 0;
        if (price > 0 && price <= maxBudget) {
          score += 5;
          reasons.push(`Passt ins Budget (${price.toLocaleString()} €)`);
        } else if (price > maxBudget) {
          score = -1;
        }
      }

      if (query.includes('elektro') || query.includes('strom')) {
        if (car.fuel_type?.toLowerCase().includes('elektro')) { score += 4; reasons.push('Elektroantrieb'); }
      }
      if (query.includes('diesel')) {
        if (car.fuel_type?.toLowerCase().includes('diesel')) { score += 4; reasons.push('Sparsamer Diesel'); }
      }
      if (query.includes('benzin')) {
        if (car.fuel_type?.toLowerCase().includes('benzin')) { score += 4; reasons.push('Benziner'); }
      }

      if (query.includes('familie') || query.includes('groß') || query.includes('kofferraum') || query.includes('platz') || query.includes('kombi')) {
        if ((car.boot_capacity_liters || 0) > 450) { score += 3; reasons.push('Großer Kofferraum'); }
      }

      if (query.includes('günstig') || query.includes('sparen') || query.includes('niedrig')) {
        if ((car.insurance_per_year || 0) < 700) { score += 2; reasons.push('Günstige Versicherung'); }
        if ((car.maintenance_per_year || 0) < 400) { score += 2; reasons.push('Niedrige Servicekosten'); }
      }

      return { car, score, reasons };
    });

    const sorted = scoredCars
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    setRecommendations(sorted.length > 0 ? sorted : [{ car: cars[0], score: 1, reasons: ['Standard-Empfehlungs-Match'] }]);
  };

  const getCostStyle = (valA, valB) => {
    if (!valA || !valB || valA === valB) return { color: '#e2e8f0' };
    return valA < valB 
      ? { color: '#34d399', fontWeight: 'bold', background: 'rgba(52, 211, 153, 0.1)', padding: '4px 8px', borderRadius: '6px' } 
      : { color: '#f87171', background: 'rgba(248, 113, 113, 0.1)', padding: '4px 8px', borderRadius: '6px' };
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', backgroundColor: '#090d16', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', color: '#38bdf8', marginBottom: '20px', fontWeight: '600', letterSpacing: '1px' }}>
            ⚡ LADE HIGH-TECH FAHRZEUGDATEN...
          </div>
          <div style={{ height: '8px', width: '100%', backgroundColor: '#1e293b', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '60%', backgroundColor: '#38bdf8', borderRadius: '10px', animation: 'pulse 1.5s infinite' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!carA || !carB) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'system-ui, sans-serif', color: '#f8fafc', backgroundColor: '#090d16', minHeight: '100vh' }}>
        <h2>Keine Autos in der Datenbank gefunden.</h2>
      </div>
    );
  }

  const getWidthPercent = (lengthMm) => ((lengthMm || 4000) / 5200) * 100;
  const getBootPercent = (bootLiters) => Math.min(((bootLiters || 0) / 800) * 100, 100);

  const cardStyle = {
    background: 'rgba(26, 34, 52, 0.65)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '28px',
    marginBottom: '32px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)'
  };

  const chipStyle = {
    background: 'rgba(15, 23, 42, 0.8)',
    color: '#cbd5e1',
    border: '1px solid rgba(56, 189, 248, 0.2)',
    padding: '8px 16px',
    borderRadius: '30px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(8px)'
  };

  return (
    <div style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#090d16', color: '#f8fafc', minHeight: '100vh', padding: '40px 20px 100px 20px', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.12) 0%, transparent 50%)' }}>
      
      {/* 1. VERSTECKTER ENTWICKLER-NACHWEIS IM HTML-CODE */}
      {/* 
        ====================================================
        DEVELOPED AND ARCHITECTED BY RENE BERLIPS (2026)
        ALL RIGHTS RESERVED - AUTOBERATER PLATFORM
        ====================================================
      */}

      <Head>
        <title>CarSized Pro | AI Vehicle Analytics & Comparison</title>
        <meta name="author" content="Rene Berlips" />
        <meta name="description" content="Nächste Generation des Fahrzeugvergleichs – entwickelt von Rene Berlips." />
        <meta property="og:title" content="CarSized Pro | KI-Autoberater" />
        <meta property="og:description" content="Next-Gen Vergleichsplattform für Fahrzeugdimensionen und Unterhaltskosten." />
      </Head>

      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        
        {/* Modern Header */}
        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '20px', color: '#38bdf8', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px' }}>
            AI-POWERED PLATFORM 2026
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px', background: 'linear-gradient(135deg, #ffffff 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 12px 0' }}>
            CARSIZED PRO
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
            Präzise Fahrzeug-Analytik, intelligenter Dimensionenvergleich & automatisierte Unterhaltskosten-Kalkulation.
          </p>
        </header>

        {/* 1. SEKTION: KI-BERATER */}
        <section style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#38bdf8', boxShadow: '0 0 12px #38bdf8' }} />
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', margin: 0, color: '#fff' }}>Smart Search Engine</h2>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <button onClick={() => runAiSearch('Sparsamer Diesel unter 20000 €')} style={chipStyle}>⛽ Diesel (&lt; 20k €)</button>
            <button onClick={() => runAiSearch('Familienkombi mit großem Kofferraum')} style={chipStyle}>👨‍👩‍👧‍👦 Familienkombi (&gt; 450L)</button>
            <button onClick={() => runAiSearch('Elektroauto für die Stadt')} style={chipStyle}>⚡ Elektro-Stadtauto</button>
            <button onClick={() => runAiSearch('Günstige Versicherung und niedrige Servicekosten')} style={chipStyle}>⭐ Günstiger Unterhalt</button>
          </div>

          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <input 
              type="text" 
              placeholder="Suchen Sie z. B. nach 'Elektro 30000 €' oder 'Sparsamer Kombi'..." 
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              style={{ width: '100%', padding: '18px 20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.12)', background: 'rgba(15, 23, 42, 0.6)', color: '#fff', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {recommendations.length > 0 && (
            <div style={{ display: 'grid', gap: '12px' }}>
              {recommendations.map(({ car, reasons }, idx) => (
                <div key={car.id || idx} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px 20px', borderRadius: '14px', borderLeft: '4px solid #34d399', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: '#34d399', fontSize: '1.05rem', fontWeight: '700' }}>#{idx + 1} Top Match: {car.brand} {car.model}</h3>
                    <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: '600' }}>~{(car.used_price || car.new_price || 0).toLocaleString()} €</span>
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '0.88rem', color: '#cbd5e1' }}>
                    <strong>Kriterien:</strong> {reasons.join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2. SEKTION: VISUELLER VERGLEICH */}
        <section style={cardStyle}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', margin: '0 0 20px 0', color: '#fff' }}>Dimensionen & Volumen</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.5px' }}>FAHRZEUG 1</label>
              <select 
                value={carA.id} 
                onChange={(e) => setCarA(cars.find(c => c.id === e.target.value))}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.8)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.12)', marginTop: '6px', outline: 'none' }}
              >
                {cars.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.year})</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.5px' }}>FAHRZEUG 2</label>
              <select 
                value={carB.id} 
                onChange={(e) => setCarB(cars.find(c => c.id === e.target.value))}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.8)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.12)', marginTop: '6px', outline: 'none' }}
              >
                {cars.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.year})</option>)}
              </select>
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '20px', borderRadius: '16px', marginBottom: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Gesamtlänge (mm)</h4>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.85rem', marginBottom: '6px', color: '#e2e8f0' }}>{carA.brand} {carA.model}: {carA.length_mm || 0} mm</div>
              <div style={{ width: `${getWidthPercent(carA.length_mm)}%`, height: '28px', background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)', borderRadius: '8px', transition: 'width 0.4s ease' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', marginBottom: '6px', color: '#e2e8f0' }}>{carB.brand} {carB.model}: {carB.length_mm || 0} mm</div>
              <div style={{ width: `${getWidthPercent(carB.length_mm)}%`, height: '28px', background: 'linear-gradient(90deg, #e11d48 0%, #fb7185 100%)', borderRadius: '8px', transition: 'width 0.4s ease' }} />
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Kofferraumvolumen (L)</h4>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.85rem', marginBottom: '6px', color: '#e2e8f0' }}>{carA.brand} {carA.model}: {carA.boot_capacity_liters || 0} L</div>
              <div style={{ width: `${getBootPercent(carA.boot_capacity_liters)}%`, height: '28px', background: 'linear-gradient(90deg, #059669 0%, #34d399 100%)', borderRadius: '8px', transition: 'width 0.4s ease' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', marginBottom: '6px', color: '#e2e8f0' }}>{carB.brand} {carB.model}: {carB.boot_capacity_liters || 0} L</div>
              <div style={{ width: `${getBootPercent(carB.boot_capacity_liters)}%`, height: '28px', background: 'linear-gradient(90deg, #d97706 0%, #fbbf24 100%)', borderRadius: '8px', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </section>

        {/* 3. SEKTION: KOSTENVERGLEICH */}
        <section style={cardStyle}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', margin: '0 0 20px 0', color: '#fff' }}>Betriebskosten & Kennzahlen</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px' }}>KRITERIUM</th>
                  <th style={{ padding: '12px', color: '#38bdf8' }}>{carA.brand} {carA.model}</th>
                  <th style={{ padding: '12px', color: '#fb7185' }}>{carB.brand} {carB.model}</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.9rem' }}>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '14px 12px', color: '#94a3b8' }}>Antriebsart</td>
                  <td style={{ padding: '14px 12px' }}>{carA.fuel_type || 'k. A.'}</td>
                  <td style={{ padding: '14px 12px' }}>{carB.fuel_type || 'k. A.'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '14px 12px', color: '#94a3b8' }}>Gebrauchtwagenpreis</td>
                  <td style={{ padding: '14px 12px' }}>{carA.used_price ? `${carA.used_price.toLocaleString()} €` : '-'}</td>
                  <td style={{ padding: '14px 12px' }}>{carB.used_price ? `${carB.used_price.toLocaleString()} €` : '-'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '14px 12px', color: '#94a3b8' }}>Versicherung / Jahr</td>
                  <td style={{ padding: '14px 12px' }}><span style={getCostStyle(carA.insurance_per_year, carB.insurance_per_year)}>~{carA.insurance_per_year || 0} €</span></td>
                  <td style={{ padding: '14px 12px' }}><span style={getCostStyle(carB.insurance_per_year, carA.insurance_per_year)}>~{carB.insurance_per_year || 0} €</span></td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '14px 12px', color: '#94a3b8' }}>Service & Wartung / Jahr</td>
                  <td style={{ padding: '14px 12px' }}><span style={getCostStyle(carA.maintenance_per_year, carB.maintenance_per_year)}>~{carA.maintenance_per_year || 0} €</span></td>
                  <td style={{ padding: '14px 12px' }}><span style={getCostStyle(carB.maintenance_per_year, carA.maintenance_per_year)}>~{carB.maintenance_per_year || 0} €</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FOOTER MIT URHEBER-NACHWEIS */}
        <footer style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', marginTop: '40px' }}>
          <p>© 2026 CarSized Pro • Designed & Developed by <strong style={{ color: '#38bdf8' }}>Rene Berlips</strong></p>
        </footer>

      </div>

      {/* STICKY BOTTOM BAR */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(9, 13, 22, 0.9)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', zIndex: 100 }}>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Vergleich:</span>
        <span style={{ fontWeight: '700', color: '#38bdf8', fontSize: '0.9rem' }}>{carA.brand} {carA.model}</span>
        <span style={{ color: '#475569', fontSize: '0.8rem' }}>VS</span>
        <span style={{ fontWeight: '700', color: '#fb7185', fontSize: '0.9rem' }}>{carB.brand} {carB.model}</span>
      </div>

    </div>
  );
}
