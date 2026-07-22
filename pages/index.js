import React, { useState } from 'react';

// Beispiel-Datenstruktur im Carsized-Stil
const INITIAL_CARS = [
  {
    id: 'vw-golf-8',
    brand: 'Volkswagen',
    model: 'Golf 8',
    type: 'Kompaktklasse',
    fuel: 'Benzin',
    lengthMm: 4284,
    heightMm: 1456,
    newPrice: 28200,
    usedPrice: 19500,
    insurancePerYear: 650,
    servicePerYear: 350,
    consumption: '5.4 l/100km',
    reliabilityIndex: 'Gut (8/10)',
    imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'tesla-model-y',
    brand: 'Tesla',
    model: 'Model Y',
    type: 'SUV',
    fuel: 'Elektro',
    lengthMm: 4751,
    heightMm: 1624,
    newPrice: 44990,
    usedPrice: 34000,
    insurancePerYear: 890,
    servicePerYear: 200,
    consumption: '15.7 kWh/100km',
    reliabilityIndex: 'Mittel (6/10)',
    imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'bmw-320d',
    brand: 'BMW',
    model: '3er Touring (Diesel)',
    type: 'Kombi',
    fuel: 'Diesel',
    lengthMm: 4713,
    heightMm: 1440,
    newPrice: 52000,
    usedPrice: 28000,
    insurancePerYear: 920,
    servicePerYear: 500,
    consumption: '5.0 l/100km',
    reliabilityIndex: 'Sehr Gut (9/10)',
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80'
  }
];

export default function CarSizedPro() {
  const [cars] = useState(INITIAL_CARS);
  const [carA, setCarA] = useState(INITIAL_CARS[0]);
  const [carB, setCarB] = useState(INITIAL_CARS[1]);

  // Filter für den Bedarfs-Rechner
  const [maxBudget, setMaxBudget] = useState(40000);
  const [selectedFuel, setSelectedFuel] = useState('Alle');
  const [recommendedCar, setRecommendedCar] = useState(null);

  // Bedarfs-Rechner Logik
  const findMatchingCar = () => {
    const match = cars.find(c => 
      c.usedPrice <= maxBudget && 
      (selectedFuel === 'Alle' || c.fuel === selectedFuel)
    );
    setRecommendedCar(match || null);
  };

  // Maßstabsskalierung basierend auf der größten Fahrzeuglänge (z.B. 5000 mm max)
  const getWidthPercent = (lengthMm) => (lengthMm / 5000) * 100;

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '30px 15px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#38bdf8' }}>
            📐 CARSIZED + KOSTEN-VERGLEICH
          </h1>
          <p style={{ color: '#94a3b8' }}>Visueller Größenvergleich, Kostenanalyse & intelligenter Kaufberater</p>
        </header>

        {/* 1. SEKTION: VISUELLER GRÖSSENVERGLEICH */}
        <section style={{ background: '#1e293b', padding: '25px', borderRadius: '16px', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', color: '#38bdf8' }}>📏 Visueller Maßstabs-Vergleich</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>FAHRZEUG 1</label>
              <select 
                value={carA.id} 
                onChange={(e) => setCarA(cars.find(c => c.id === e.target.value))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }}
              >
                {cars.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>FAHRZEUG 2</label>
              <select 
                value={carB.id} 
                onChange={(e) => setCarB(cars.find(c => c.id === e.target.value))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }}
              >
                {cars.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model}</option>)}
              </select>
            </div>
          </div>

          {/* Grafischer Längenvergleich im Maßstab */}
          <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '5px' }}>{carA.brand} {carA.model} ({carA.lengthMm} mm)</div>
              <div style={{ width: `${getWidthPercent(carA.lengthMm)}%`, height: '50px', backgroundColor: '#38bdf8', borderRadius: '6px', transition: 'width 0.3s ease' }} />
            </div>

            <div>
              <div style={{ fontSize: '0.9rem', marginBottom: '5px' }}>{carB.brand} {carB.model} ({carB.lengthMm} mm)</div>
              <div style={{ width: `${getWidthPercent(carB.lengthMm)}%`, height: '50px', backgroundColor: '#f43f5e', borderRadius: '6px', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        </section>

        {/* 2. SEKTION: DETAILLIERTER KOSTENVERGLEICH */}
        <section style={{ background: '#1e293b', borderRadius: '16px', overflow: 'hidden', marginBottom: '40px' }}>
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
                <td style={{ padding: '12px 20px' }}>Neupreis (UVP)</td>
                <td style={{ padding: '12px 20px' }}>{carA.newPrice.toLocaleString()} €</td>
                <td style={{ padding: '12px 20px' }}>{carB.newPrice.toLocaleString()} €</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '12px 20px' }}>Gebrauchtwagenpreis (ca.)</td>
                <td style={{ padding: '12px 20px' }}>{carA.usedPrice.toLocaleString()} €</td>
                <td style={{ padding: '12px 20px' }}>{carB.usedPrice.toLocaleString()} €</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '12px 20px' }}>Versicherung kosten / Jahr</td>
                <td style={{ padding: '12px 20px' }}>~{carA.insurancePerYear} €</td>
                <td style={{ padding: '12px 20px' }}>~{carB.insurancePerYear} €</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '12px 20px' }}>Service- & Wartungskosten / Jahr</td>
                <td style={{ padding: '12px 20px' }}>~{carA.servicePerYear} €</td>
                <td style={{ padding: '12px 20px' }}>~{carB.servicePerYear} €</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '12px 20px' }}>Durchschnittsverbrauch</td>
                <td style={{ padding: '12px 20px' }}>{carA.consumption}</td>
                <td style={{ padding: '12px 20px' }}>{carB.consumption}</td>
              </tr>
              <tr>
                <td style={{ padding: '12px 20px' }}>Reparaturanfälligkeit</td>
                <td style={{ padding: '12px 20px' }}>{carA.reliabilityIndex}</td>
                <td style={{ padding: '12px 20px' }}>{carB.reliabilityIndex}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 3. SEKTION: BEDARFS-RECHNER (KAUFBERATER) */}
        <section style={{ background: '#1e293b', padding: '25px', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#10b981', marginBottom: '15px' }}>🎯 Intelligenter Kaufberater</h2>
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Geben Sie Ihre Präferenzen ein, um das passende Fahrzeug vorgeschlagen zu bekommen.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px' }}>Maximales Budget (Gebraucht): {maxBudget.toLocaleString()} €</label>
              <input 
                type="range" 
                min="10000" 
                max="60000" 
                step="2500" 
                value={maxBudget} 
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px' }}>Bevorzugter Antrieb:</label>
              <select 
                value={selectedFuel} 
                onChange={(e) => setSelectedFuel(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }}
              >
                <option value="Alle">Alle Antriebe</option>
                <option value="Benzin">Benzin</option>
                <option value="Diesel">Diesel</option>
                <option value="Elektro">Elektro</option>
              </select>
            </div>
          </div>

          <button 
            onClick={findMatchingCar}
            style={{ padding: '12px 24px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
          >
            Passendes Auto finden
          </button>

          {recommendedCar && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#064e3b', borderRadius: '8px', border: '1px solid #10b981' }}>
              <h3 style={{ margin: '0 0 5px 0' }}>Empfehlung: {recommendedCar.brand} {recommendedCar.model}</h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                Preis: ca. {recommendedCar.usedPrice.toLocaleString()} € | Antrieb: {recommendedCar.fuel} | Verbrauch: {recommendedCar.consumption}
              </p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
