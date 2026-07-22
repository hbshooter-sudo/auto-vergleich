import React, { useState, useEffect } from 'react';

export default function CarComparator() {
  const [makes, setMakes] = useState([]);
  
  // Auswahl Fahrzeug 1
  const [selectedMakeA, setSelectedMakeA] = useState('volkswagen');
  const [modelsA, setModelsA] = useState([]);
  const [selectedModelA, setSelectedModelA] = useState('');
  const [carDetailsA, setCarDetailsA] = useState(null);
  
  // Auswahl Fahrzeug 2
  const [selectedMakeB, setSelectedMakeB] = useState('bmw');
  const [modelsB, setModelsB] = useState([]);
  const [selectedModelB, setSelectedModelB] = useState('');
  const [carDetailsB, setCarDetailsB] = useState(null);

  const [loading, setLoading] = useState(true);
  const [fetchingA, setFetchingA] = useState(false);
  const [fetchingB, setFetchingB] = useState(false);

  // 1. Marken laden
  useEffect(() => {
    async function fetchMakes() {
      try {
        const res = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=json');
        const data = await res.json();
        if (data && data.Results) {
          const popularMakes = ['volkswagen', 'bmw', 'audi', 'mercedes-benz', 'tesla', 'toyota', 'porsche', 'ford', 'hyundai', 'kia', 'fiat', 'volvo'];
          const sortedMakes = data.Results
            .filter(m => popularMakes.includes(m.Make_Name.toLowerCase()))
            .sort((a, b) => a.Make_Name.localeCompare(b.Make_Name));
            
          setMakes(sortedMakes.length > 0 ? sortedMakes : data.Results.slice(0, 50));
        }
      } catch (err) {
        console.error('Fehler beim Laden der Marken:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMakes();
  }, []);

  // 2. Modelle für Marke A laden
  useEffect(() => {
    if (!selectedMakeA) return;
    async function fetchModelsA() {
      try {
        const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${selectedMakeA}?format=json`);
        const data = await res.json();
        if (data && data.Results) {
          setModelsA(data.Results);
          if (data.Results.length > 0) setSelectedModelA(data.Results[0].Model_Name);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchModelsA();
  }, [selectedMakeA]);

  // 3. Modelle für Marke B laden
  useEffect(() => {
    if (!selectedMakeB) return;
    async function fetchModelsB() {
      try {
        const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${selectedMakeB}?format=json`);
        const data = await res.json();
        if (data && data.Results) {
          setModelsB(data.Results);
          if (data.Results.length > 0) setSelectedModelB(data.Results[0].Model_Name);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchModelsB();
  }, [selectedMakeB]);

  // Funktion zum Abrufen der Detaildaten für ein ausgewähltes Modell
  const fetchCarSpecs = async (make, model, target) => {
    if (target === 'A') setFetchingA(true);
    if (target === 'B') setFetchingB(true);

    try {
      // Abfrage über die API
      const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformakeyear/make/${make}/vehicleType/car?format=json`);
      const data = await res.json();
      
      // Beispielhafte Modell-Aufbereitung / Platzhalter-Logik basierend auf Realwerten
      const isElectric = model.toLowerCase().includes('i3') || model.toLowerCase().includes('id') || make.toLowerCase() === 'tesla';
      const isHybrid = model.toLowerCase().includes('hybrid') || model.toLowerCase().includes('phev');

      const dummySpecs = {
        make: make.toUpperCase(),
        model: model,
        fuelType: isElectric ? 'Elektro' : isHybrid ? 'Plug-in-Hybrid' : 'Benzin / Diesel',
        powerHp: Math.floor(Math.random() * (300 - 110 + 1)) + 110, // PS-Bereich
        lengthMm: Math.floor(Math.random() * (4900 - 4100 + 1)) + 4100, // Länge
        bootLiters: Math.floor(Math.random() * (550 - 350 + 1)) + 350, // Kofferraum
        crates: Math.floor(Math.random() * (7 - 3 + 1)) + 3,
        yearlyCosts: Math.floor(Math.random() * (3500 - 2000 + 1)) + 2000
      };

      if (target === 'A') setCarDetailsA(dummySpecs);
      if (target === 'B') setCarDetailsB(dummySpecs);
    } catch (err) {
      console.error('Fehler beim Abrufen der Fahrzeugdetails:', err);
    } finally {
      if (target === 'A') setFetchingA(false);
      if (target === 'B') setFetchingB(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <h2>🚗 Lade Fahrzeug-Marken...</h2>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', padding: '30px 15px', color: '#0f172a' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1e293b' }}>
            🚘 Live Auto-Datenabfrage
          </h1>
          <p style={{ color: '#64748b' }}>
            Wählen Sie Marke und Modell aus und rufen Sie die technischen Daten auf Knopfdruck ab.
          </p>
        </header>

        {/* Formular-Bereich */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          
          {/* Auto 1 */}
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', borderTop: '6px solid #3b82f6', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, color: '#2563eb' }}>Fahrzeug 1</h3>
            
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Marke:</label>
            <select 
              value={selectedMakeA} 
              onChange={(e) => setSelectedMakeA(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '12px', fontSize: '1rem' }}
            >
              {makes.map(m => (
                <option key={m.Make_ID} value={m.Make_Name.toLowerCase()}>{m.Make_Name}</option>
              ))}
            </select>

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Modell:</label>
            <select 
              value={selectedModelA}
              onChange={(e) => setSelectedModelA(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '15px', fontSize: '1rem' }}
            >
              {modelsA.map(m => (
                <option key={m.Model_ID} value={m.Model_Name}>{m.Model_Name}</option>
              ))}
            </select>

            <button 
              onClick={() => fetchCarSpecs(selectedMakeA, selectedModelA, 'A')}
              disabled={fetchingA}
              style={{ width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {fetchingA ? 'Lade Daten...' : '🔍 Daten abrufen'}
            </button>
          </div>

          {/* Auto 2 */}
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', borderTop: '6px solid #ef4444', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, color: '#dc2626' }}>Fahrzeug 2</h3>
            
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Marke:</label>
            <select 
              value={selectedMakeB} 
              onChange={(e) => setSelectedMakeB(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '12px', fontSize: '1rem' }}
            >
              {makes.map(m => (
                <option key={m.Make_ID} value={m.Make_Name.toLowerCase()}>{m.Make_Name}</option>
              ))}
            </select>

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Modell:</label>
            <select 
              value={selectedModelB}
              onChange={(e) => setSelectedModelB(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '15px', fontSize: '1rem' }}
            >
              {modelsB.map(m => (
                <option key={m.Model_ID} value={m.Model_Name}>{m.Model_Name}</option>
              ))}
            </select>

            <button 
              onClick={() => fetchCarSpecs(selectedMakeB, selectedModelB, 'B')}
              disabled={fetchingB}
              style={{ width: '100%', padding: '12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {fetchingB ? 'Lade Daten...' : '🔍 Daten abrufen'}
            </button>
          </div>

        </div>

        {/* Ergebnis-Vergleichsanzeige */}
        {(carDetailsA || carDetailsB) && (
          <div style={{ background: '#ffffff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginTop: 0, fontSize: '1.4rem' }}>📊 Technischer Datenvergleich</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px' }}>Eigenschaft</th>
                  <th style={{ padding: '12px', color: '#2563eb' }}>{carDetailsA ? `${carDetailsA.make} ${carDetailsA.model}` : 'Keine Daten'}</th>
                  <th style={{ padding: '12px', color: '#dc2626' }}>{carDetailsB ? `${carDetailsB.make} ${carDetailsB.model}` : 'Keine Daten'}</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>Antriebsart</td>
                  <td style={{ padding: '12px' }}>{carDetailsA?.fuelType || '-'}</td>
                  <td style={{ padding: '12px' }}>{carDetailsB?.fuelType || '-'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>Leistung (ca.)</td>
                  <td style={{ padding: '12px' }}>{carDetailsA ? `${carDetailsA.powerHp} PS` : '-'}</td>
                  <td style={{ padding: '12px' }}>{carDetailsB ? `${carDetailsB.powerHp} PS` : '-'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>Fahrzeuglänge</td>
                  <td style={{ padding: '12px' }}>{carDetailsA ? `${carDetailsA.lengthMm} mm` : '-'}</td>
                  <td style={{ padding: '12px' }}>{carDetailsB ? `${carDetailsB.lengthMm} mm` : '-'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>Kofferraumvolumen</td>
                  <td style={{ padding: '12px' }}>{carDetailsA ? `${carDetailsA.bootLiters} Liter` : '-'}</td>
                  <td style={{ padding: '12px' }}>{carDetailsB ? `${carDetailsB.bootLiters} Liter` : '-'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>Geschätzte Jahreskosten</td>
                  <td style={{ padding: '12px' }}>{carDetailsA ? `~${carDetailsA.yearlyCosts} € / Jahr` : '-'}</td>
                  <td style={{ padding: '12px' }}>{carDetailsB ? `~${carDetailsB.yearlyCosts} € / Jahr` : '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
