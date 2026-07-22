import React, { useState, useEffect } from 'react';

export default function CarComparator() {
  const [makes, setMakes] = useState([]);
  const [selectedMakeA, setSelectedMakeA] = useState('volkswagen');
  const [selectedMakeB, setSelectedMakeB] = useState('bmw');
  
  const [modelsA, setModelsA] = useState([]);
  const [modelsB, setModelsB] = useState([]);
  
  const [loading, setLoading] = useState(true);

  // 1. Top-Marken laden (sicher über HTTPS)
  useEffect(() => {
    async function fetchMakes() {
      try {
        const res = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=json');
        const data = await res.json();
        if (data && data.Results) {
          // Sortieren und filtern
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
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchModelsB();
  }, [selectedMakeB]);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <h2>🚗 Verbinde mit globaler Fahrzeug-API (HTTPS)...</h2>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', padding: '30px 15px', color: '#0f172a' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1e293b' }}>
            🚘 Live-Auto-Vergleichsportal
          </h1>
          <p style={{ color: '#64748b' }}>
            Wählen Sie aus den global verfügbaren Herstellern und Modellen.
          </p>
        </header>

        {/* Auswahl-Karten */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          
          {/* Auto 1 Picker */}
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', borderTop: '6px solid #3b82f6', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, color: '#2563eb' }}>Fahrzeug 1</h3>
            
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Marke:</label>
            <select 
              value={selectedMakeA} 
              onChange={(e) => setSelectedMakeA(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '15px', fontSize: '1rem' }}
            >
              {makes.map(m => (
                <option key={m.Make_ID} value={m.Make_Name.toLowerCase()}>{m.Make_Name}</option>
              ))}
            </select>

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Modell:</label>
            <select 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
            >
              {modelsA.length > 0 ? (
                modelsA.map(m => (
                  <option key={m.Model_ID} value={m.Model_Name}>{m.Model_Name}</option>
                ))
              ) : (
                <option>Lade Modelle...</option>
              )}
            </select>
          </div>

          {/* Auto 2 Picker */}
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', borderTop: '6px solid #ef4444', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, color: '#dc2626' }}>Fahrzeug 2</h3>
            
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Marke:</label>
            <select 
              value={selectedMakeB} 
              onChange={(e) => setSelectedMakeB(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '15px', fontSize: '1rem' }}
            >
              {makes.map(m => (
                <option key={m.Make_ID} value={m.Make_Name.toLowerCase()}>{m.Make_Name}</option>
              ))}
            </select>

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Modell:</label>
            <select 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
            >
              {modelsB.length > 0 ? (
                modelsB.map(m => (
                  <option key={m.Model_ID} value={m.Model_Name}>{m.Model_Name}</option>
                ))
              ) : (
                <option>Lade Modelle...</option>
              )}
            </select>
          </div>

        </div>

      </div>
    </div>
  );
}
