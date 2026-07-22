import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function CarComparator() {
  // Lokale Supabase-Daten
  const [supabaseCars, setSupabaseCars] = useState([]);
  
  // Dynamische API-Daten (CarQuery)
  const [makes, setMakes] = useState([]);
  const [selectedMakeA, setSelectedMakeA] = useState('');
  const [selectedMakeB, setSelectedMakeB] = useState('');
  
  const [modelsA, setModelsA] = useState([]);
  const [modelsB, setModelsB] = useState([]);
  
  const [carA, setCarA] = useState(null);
  const [carB, setCarB] = useState(null);
  
  const [loading, setLoading] = useState(true);

  // 1. Supabase-Daten & Marken-Liste der API beim Start laden
  useEffect(() => {
    async function initData() {
      // Supabase initialisieren
      const url = 'https://gcqcmqcptwvzhuivfbvi.supabase.co';
      const key = 'sb_publishable_-PtrOK_5RmXee4XxrZb4CA_FEQ1E1Ak';
      
      if (url && key) {
        const supabase = createClient(url, key);
        const { data } = await supabase.from('cars').select('*');
        if (data) setSupabaseCars(data);
      }

      // Freie Marken von der CarQuery API abrufen
      try {
        const res = await fetch('https://www.carqueryapi.com/api/0.3/?cmd=getMakes');
        const text = await res.text();
        // JSONP-Fix für CarQuery API
        const cleanedText = text.replace('? (', '').replace(');', '').replace('?', '');
        const parsed = JSON.parse(cleanedText);
        
        if (parsed && parsed.Makes) {
          setMakes(parsed.Makes);
          // Standard-Auswahl setzen (z. B. Volkswagen & BMW)
          setSelectedMakeA('volkswagen');
          setSelectedMakeB('bmw');
        }
      } catch (err) {
        console.error('Fehler beim Laden der Fahrzeugmarken:', err);
      }
      
      setLoading(false);
    }

    initData();
  }, []);

  // 2. Modelle für Marke A laden
  useEffect(() => {
    if (!selectedMakeA) return;
    async function fetchModelsA() {
      try {
        const res = await fetch(`https://www.carqueryapi.com/api/0.3/?cmd=getModels&make=${selectedMakeA}`);
        const text = await res.text();
        const cleanedText = text.replace('? (', '').replace(');', '').replace('?', '');
        const parsed = JSON.parse(cleanedText);
        if (parsed && parsed.Models) {
          setModelsA(parsed.Models);
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
        const res = await fetch(`https://www.carqueryapi.com/api/0.3/?cmd=getModels&make=${selectedMakeB}`);
        const text = await res.text();
        const cleanedText = text.replace('? (', '').replace(');', '').replace('?', '');
        const parsed = JSON.parse(cleanedText);
        if (parsed && parsed.Models) {
          setModelsB(parsed.Models);
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
        <h2>🚗 Verbinde mit weltweiter Fahrzeug-API...</h2>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', padding: '30px 15px', color: '#0f172a' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1e293b' }}>
            🚘 Live-Auto-Vergleichsportal (API)
          </h1>
          <p style={{ color: '#64748b' }}>
            Wählen Sie aus allen weltweit verfügbaren Marken, Modellen und Antriebsarten.
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
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '12px' }}
            >
              {makes.map(m => (
                <option key={m.make_id} value={m.make_id}>{m.make_display}</option>
              ))}
            </select>

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Modell:</label>
            <select 
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              {modelsA.map(m => (
                <option key={m.model_name} value={m.model_name}>{m.model_name}</option>
              ))}
            </select>
          </div>

          {/* Auto 2 Picker */}
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', borderTop: '6px solid #ef4444', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, color: '#dc2626' }}>Fahrzeug 2</h3>
            
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Marke:</label>
            <select 
              value={selectedMakeB} 
              onChange={(e) => setSelectedMakeB(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '12px' }}
            >
              {makes.map(m => (
                <option key={m.make_id} value={m.make_id}>{m.make_display}</option>
              ))}
            </select>

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Modell:</label>
            <select 
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              {modelsB.map(m => (
                <option key={m.model_name} value={m.model_name}>{m.model_name}</option>
              ))}
            </select>
          </div>

        </div>

      </div>
    </div>
  );
}
