import React, { useState, useEffect, useMemo, useCallback, useId } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';

// Referenzwerte für die Balkendiagramme (Maximalwerte der Skala).
const MAX_LENGTH_MM = 5200;
const MAX_BOOT_LITERS = 800;

const SEARCH_PRESETS = [
  { label: '⛽ Diesel (< 20k €)', query: 'Sparsamer Diesel unter 20000 €' },
  { label: '👨‍👩‍👧‍👦 Familienkombi (> 450L)', query: 'Familienkombi mit großem Kofferraum' },
  { label: '⚡ Elektro-Stadtauto', query: 'Elektroauto für die Stadt' },
  { label: '⭐ Günstiger Unterhalt', query: 'Günstige Versicherung und niedrige Servicekosten' },
];

const COST_ESTIMATES_BY_CLASS = {
  kleinwagen: { insurance: [250, 450], maintenance: [300, 500] },
  kompaktklasse: { insurance: [350, 600], maintenance: [400, 700] },
  mittelklasse: { insurance: [500, 900], maintenance: [600, 1000] },
  suv_oberklasse: { insurance: [600, 1250], maintenance: [800, 1300] },
};

const ELEKTRO_MAINTENANCE_DISCOUNT = 0.35;

function getCostEstimate(car) {
  const key = (car.vehicle_class || '').toLowerCase();
  const base = COST_ESTIMATES_BY_CLASS[key];
  if (!base) return null;

  const isElectric = (car.fuel_type || '').toLowerCase().includes('elektro');
  const maintenance = isElectric
    ? base.maintenance.map((v) => Math.round(v * (1 - ELEKTRO_MAINTENANCE_DISCOUNT)))
    : base.maintenance;

  return { insurance: base.insurance, maintenance };
}

function formatRange([min, max]) {
  return `${min.toLocaleString('de-DE')}–${max.toLocaleString('de-DE')} €`;
}

function parseBudgetFromQuery(query) {
  const match = query.match(/(\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d+)?|\d+(?:[.,]\d+)?)\s*(k|tsd|euro|€)?/i);
  if (!match) return null;

  let numStr = match[1];
  const suffix = match[2]?.toLowerCase();

  numStr = numStr.replace(/[.,\s](?=\d{3}(\D|$))/g, '');
  numStr = numStr.replace(',', '.');

  let value = parseFloat(numStr);
  if (isNaN(value)) return null;

  if (suffix === 'k' || suffix === 'tsd') value *= 1000;

  return value;
}

function scoreCarAgainstQuery(car, query) {
  const q = query.toLowerCase();
  let score = 0;
  const reasons = [];
  let excluded = false;

  const maxBudget = parseBudgetFromQuery(q);
  if (maxBudget !== null) {
    const price = car.used_price || car.new_price || 0;
    if (price > 0 && price <= maxBudget) {
      score += 5;
      reasons.push(`Passt ins Budget (${price.toLocaleString('de-DE')} €)`);
    } else if (price > maxBudget) {
      excluded = true;
    }
  }

  const fuel = car.fuel_type?.toLowerCase() || '';
  if ((q.includes('elektro') || q.includes('strom')) && fuel.includes('elektro')) {
    score += 4;
    reasons.push('Elektroantrieb');
  }
  if (q.includes('diesel') && fuel.includes('diesel')) {
    score += 4;
    reasons.push('Sparsamer Diesel');
  }
  if (q.includes('benzin') && fuel.includes('benzin')) {
    score += 4;
    reasons.push('Benziner');
  }

  const wantsSpace =
    q.includes('familie') || q.includes('groß') || q.includes('kofferraum') ||
    q.includes('platz') || q.includes('kombi');
  if (wantsSpace && (car.boot_capacity_liters || 0) > 450) {
    score += 3;
    reasons.push('Großer Kofferraum');
  }

  const wantsCheap = q.includes('günstig') || q.includes('sparen') || q.includes('niedrig');
  if (wantsCheap) {
    const estimate = getCostEstimate(car);
    const insurance = car.insurance_per_year || (estimate ? (estimate.insurance[0] + estimate.insurance[1]) / 2 : null);
    const maintenance = car.maintenance_per_year || (estimate ? (estimate.maintenance[0] + estimate.maintenance[1]) / 2 : null);

    if (insurance !== null && insurance < 700) {
      score += 2;
      reasons.push('Günstige Versicherung');
    }
    if (maintenance !== null && maintenance < 400) {
      score += 2;
      reasons.push('Niedrige Servicekosten');
    }
  }

  return { score, reasons, excluded };
}

function getWidthPercent(lengthMm) {
  return Math.min(((lengthMm || 0) / MAX_LENGTH_MM) * 100, 100);
}

function getBootPercent(bootLiters) {
  return Math.min(((bootLiters || 0) / MAX_BOOT_LITERS) * 100, 100);
}

function formatEuro(value) {
  return typeof value === 'number' ? `${value.toLocaleString('de-DE')} €` : '–';
}

const styles = {
  page: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#090d16',
    color: '#f8fafc',
    minHeight: '100vh',
    padding: '40px 20px 100px 20px',
    backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.12) 0%, transparent 50%)',
  },
  container: { maxWidth: '1080px', margin: '0 auto' },
  card: {
    background: 'rgba(26, 34, 52, 0.65)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '28px',
    marginBottom: '32px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
  },
  chip: {
    background: 'rgba(15, 23, 42, 0.8)',
    color: '#cbd5e1',
    border: '1px solid rgba(56, 189, 248, 0.2)',
    padding: '8px 16px',
    borderRadius: '30px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(8px)',
  },
  label: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    background: 'rgba(15, 23, 42, 0.8)',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    marginTop: '6px',
    outline: 'none',
  },
  metricBox: {
    background: 'rgba(15, 23, 42, 0.5)',
    padding: '20px',
    borderRadius: '16px',
    marginBottom: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
};

function getCostStyle(valA, valB) {
  if (!valA || !valB || valA === valB) return { color: '#e2e8f0' };
  return valA < valB
    ? { color: '#34d399', fontWeight: 'bold', background: 'rgba(52, 211, 153, 0.1)', padding: '4px 8px', borderRadius: '6px' }
    : { color: '#f87171', background: 'rgba(248, 113, 113, 0.1)', padding: '4px 8px', borderRadius: '6px' };
}

function CarSelect({ id, labelText, value, cars, onChange }) {
  return (
    <div>
      <label htmlFor={id} style={styles.label}>{labelText}</label>
      <select id={id} value={value} onChange={onChange} style={styles.select}>
        {cars.map((c) => (
          <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.year})</option>
        ))}
      </select>
    </div>
  );
}

function ComparisonBar({ title, carA, carB, valueKey, unit, getPercent }) {
  return (
    <div style={styles.metricBox}>
      <h4 style={{ margin: '0 0 12px 0', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {title}
      </h4>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '0.85rem', marginBottom: '6px', color: '#e2e8f0' }}>
          {carA.brand} {carA.model}: {carA[valueKey] || 0} {unit}
        </div>
        <div
          role="img"
          aria-label={`${carA.brand} ${carA.model}: ${carA[valueKey] || 0} ${unit}`}
          style={{ width: `${getPercent(carA[valueKey])}%`, height: '28px', background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)', borderRadius: '8px', transition: 'width 0.4s ease' }}
        />
      </div>
      <div>
        <div style={{ fontSize: '0.85rem', marginBottom: '6px', color: '#e2e8f0' }}>
          {carB.brand} {carB.model}: {carB[valueKey] || 0} {unit}
        </div>
        <div
          role="img"
          aria-label={`${carB.brand} ${carB.model}: ${carB[valueKey] || 0} ${unit}`}
          style={{ width: `${getPercent(carB[valueKey])}%`, height: '28px', background: 'linear-gradient(90deg, #e11d48 0%, #fb7185 100%)', borderRadius: '8px', transition: 'width 0.4s ease' }}
        />
      </div>
    </div>
  );
}

function CostRow({ label, carA, carB, field, formatter, highlightCheaper }) {
  const valA = carA[field];
  const valB = carB[field];
  const styleA = highlightCheaper ? getCostStyle(valA, valB) : {};
  const styleB = highlightCheaper ? getCostStyle(valB, valA) : {};
  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <td style={{ padding: '14px 12px', color: '#94a3b8' }}>{label}</td>
      <td style={{ padding: '14px 12px' }}><span style={styleA}>{formatter ? formatter(valA) : (valA || 'k. A.')}</span></td>
      <td style={{ padding: '14px 12px' }}><span style={styleB}>{formatter ? formatter(valB) : (valB || 'k. A.')}</span></td>
    </tr>
  );
}

function CostEstimateRow({ label, carA, carB, field }) {
  const estA = getCostEstimate(carA);
  const estB = getCostEstimate(carB);

  const rawA = carA[field];
  const rawB = carB[field];

  const renderCell = (rawVal, estimate) => {
    if (typeof rawVal === 'number' && rawVal > 0) {
      return <span>~{formatEuro(rawVal)}</span>;
    }
    if (estimate) {
      return (
        <span title="Bundesweiter Richtwert nach Fahrzeugklasse, keine modellspezifische Angabe">
          {formatRange(estimate[field === 'insurance_per_year' ? 'insurance' : 'maintenance'])}{' '}
          <em style={{ color: '#64748b', fontStyle: 'normal', fontSize: '0.75rem' }}>(Ø Richtwert)</em>
        </span>
      );
    }
    return <span>k. A.</span>;
  };

  const canHighlight = typeof rawA === 'number' && rawA > 0 && typeof rawB === 'number' && rawB > 0;
  const styleA = canHighlight ? getCostStyle(rawA, rawB) : {};
  const styleB = canHighlight ? getCostStyle(rawB, rawA) : {};

  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <td style={{ padding: '14px 12px', color: '#94a3b8' }}>{label}</td>
      <td style={{ padding: '14px 12px' }}><span style={styleA}>{renderCell(rawA, estA)}</span></td>
      <td style={{ padding: '14px 12px' }}><span style={styleB}>{renderCell(rawB, estB)}</span></td>
    </tr>
  );
}

export default function CarSizedPro() {
  const [cars, setCars] = useState([]);
  const [carAId, setCarAId] = useState(null);
  const [carBId, setCarBId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [userQuery, setUserQuery] = useState('');

  const selectAId = useId();
  const selectBId = useId();

  useEffect(() => {
    let isMounted = true;

    async function fetchCars() {
      try {
        const { data, error } = await supabase.from('cars').select('*');

        if (!isMounted) return;

        if (error) {
          console.error('Supabase-Fehler beim Laden der Fahrzeuge:', error);
          setLoadError('Die Fahrzeugdaten konnten nicht geladen werden. Bitte später erneut versuchen.');
        } else if (data && data.length > 0) {
          setCars(data);
          setCarAId(data[0].id);
          setCarBId(data.length > 1 ? data[1].id : data[0].id);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Unerwarteter Fehler beim Laden der Fahrzeuge:', err);
        setLoadError('Die Fahrzeugdaten konnten nicht geladen werden. Bitte später erneut versuchen.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCars();
    return () => { isMounted = false; };
  }, []);

  const carA = useMemo(() => cars.find((c) => c.id === carAId) || null, [cars, carAId]);
  const carB = useMemo(() => cars.find((c) => c.id === carBId) || null, [cars, carBId]);

  const recommendations = useMemo(() => {
    const trimmed = userQuery.trim();
    if (!trimmed || cars.length === 0) return [];

    const scored = cars
      .map((car) => ({ car, ...scoreCarAgainstQuery(car, trimmed) }))
      .filter((item) => !item.excluded && item.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length > 0) return scored;

    return [{ car: cars[0], score: 0, reasons: ['Keine exakte Übereinstimmung – Standardvorschlag'] }];
  }, [userQuery, cars]);

  const runPresetSearch = useCallback((queryText) => {
    setUserQuery(queryText);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', backgroundColor: '#090d16', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', color: '#38bdf8', marginBottom: '20px', fontWeight: '600', letterSpacing: '1px' }}>
            ⚡ LADE FAHRZEUGDATEN...
          </div>
          <div style={{ height: '8px', width: '100%', backgroundColor: '#1e293b', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '60%', backgroundColor: '#38bdf8', borderRadius: '10px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'system-ui, sans-serif', color: '#f8fafc', backgroundColor: '#090d16', minHeight: '100vh' }}>
        <h2>{loadError}</h2>
      </div>
    );
  }

  if (!carA || !carB) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'system-ui, sans-serif', color: '#f8fafc', backgroundColor: '#090d16', minHeight: '100vh' }}>
        <h2>Keine Autos in der Datenbank gefunden.</h2>
        <p style={{ color: '#94a3b8' }}>Füge Fahrzeuge zur Supabase-Tabelle „cars" hinzu, um den Vergleich zu starten.</p>
      </div>
    );
  }

  const sameCarSelected = carA.id === carB.id && cars.length === 1;

  return (
    <div style={styles.page}>
      <Head>
        <title>CarSized Pro | AI Vehicle Analytics & Comparison</title>
        <meta name="author" content="Rene Berlips" />
        <meta name="description" content="Nächste Generation des Fahrzeugvergleichs – entwickelt von Rene Berlips." />
        <meta property="og:title" content="CarSized Pro | KI-Autoberater" />
        <meta property="og:description" content="Next-Gen Vergleichsplattform für Fahrzeugdimensionen und Unterhaltskosten." />
      </Head>

      <span style={styles.visuallyHidden}>
        Developed and architected by Rene Berlips (2026) – AutoBerater Platform. All rights reserved.
      </span>

      <div style={styles.container}>
        <header style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '20px', color: '#38bdf8', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px' }}>
            PLATTFORM 2026
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px', background: 'linear-gradient(135deg, #ffffff 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 12px 0' }}>
            CARSIZED PRO
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
            Präzise Fahrzeug-Analytik, intelligenter Dimensionenvergleich & automatisierte Unterhaltskosten-Kalkulation.
          </p>
        </header>

        {/* SUCHE */}
        <section style={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#38bdf8', boxShadow: '0 0 12px #38bdf8' }} />
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', margin: 0, color: '#fff' }}>Smart Search</h2>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {SEARCH_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => runPresetSearch(preset.query)}
                style={styles.chip}
                aria-label={`Suche starten: ${preset.query}`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <label htmlFor="car-search-input" style={styles.visuallyHidden}>Fahrzeugsuche</label>
            <input
              id="car-search-input"
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
                <div key={car.id ?? idx} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px 20px', borderRadius: '14px', borderLeft: '4px solid #34d399', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ margin: 0, color: '#34d399', fontSize: '1.05rem', fontWeight: '700' }}>
                      #{idx + 1} {car.brand} {car.model}
                    </h3>
                    <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: '600' }}>
                      ~{formatEuro(car.used_price || car.new_price || 0)}
                    </span>
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '0.88rem', color: '#cbd5e1' }}>
                    <strong>Kriterien:</strong> {reasons.join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* DIMENSIONEN */}
        <section style={styles.card}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', margin: '0 0 20px 0', color: '#fff' }}>Dimensionen & Volumen</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <CarSelect
              id={selectAId}
              labelText="FAHRZEUG 1"
              value={carA.id}
              cars={cars}
              onChange={(e) => setCarAId(e.target.value)}
            />
            <CarSelect
              id={selectBId}
              labelText="FAHRZEUG 2"
              value={carB.id}
              cars={cars}
              onChange={(e) => setCarBId(e.target.value)}
            />
          </div>

          {sameCarSelected && (
            <p style={{ color: '#fbbf24', fontSize: '0.85rem', marginTop: '-12px', marginBottom: '20px' }}>
              Es befindet sich nur ein Fahrzeug in der Datenbank – der Vergleich zeigt daher zweimal dasselbe Auto.
            </p>
          )}

          <ComparisonBar
            title="Gesamtlänge (mm)"
            carA={carA}
            carB={carB}
            valueKey="length_mm"
            unit="mm"
            getPercent={getWidthPercent}
          />
          <ComparisonBar
            title="Kofferraumvolumen (L)"
            carA={carA}
            carB={carB}
            valueKey="boot_capacity_liters"
            unit="L"
            getPercent={getBootPercent}
          />
        </section>

        {/* KOSTEN */}
        <section style={styles.card}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', margin: '0 0 20px 0', color: '#fff' }}>Betriebskosten & Kennzahlen</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px' }} scope="col">KRITERIUM</th>
                  <th style={{ padding: '12px', color: '#38bdf8' }} scope="col">{carA.brand} {carA.model}</th>
                  <th style={{ padding: '12px', color: '#fb7185' }} scope="col">{carB.brand} {carB.model}</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.9rem' }}>
                <CostRow label="Antriebsart" carA={carA} carB={carB} field="fuel_type" />
                <CostRow label="Gebrauchtwagenpreis" carA={carA} carB={carB} field="used_price" formatter={formatEuro} />
                <CostEstimateRow label="Versicherung / Jahr" carA={carA} carB={carB} field="insurance_per_year" />
                <CostEstimateRow label="Service & Wartung / Jahr" carA={carA} carB={carB} field="maintenance_per_year" />
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '14px', lineHeight: 1.5 }}>
            <strong>Ø Richtwert</strong> = bundesweite Schätzung nach Fahrzeugklasse (ADAC/Fachquellen 2026),
            keine modellspezifische Angabe. Trage echte Werte in die Supabase-Tabelle ein
            (Feld <code>vehicle_class</code>: „kleinwagen", „kompaktklasse", „mittelklasse" oder „suv_oberklasse"),
            damit hier zuverlässige, für dein Fahrzeug spezifische Zahlen statt Richtwerte erscheinen.
          </p>
        </section>

        <footer style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', marginTop: '40px' }}>
          <p>© 2026 CarSized Pro • Designed & Developed by <strong style={{ color: '#38bdf8' }}>Rene Berlips</strong></p>
        </footer>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(9, 13, 22, 0.9)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', zIndex: 100, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Vergleich:</span>
        <span style={{ fontWeight: '700', color: '#38bdf8', fontSize: '0.9rem' }}>{carA.brand} {carA.model}</span>
        <span style={{ color: '#475569', fontSize: '0.8rem' }}>VS</span>
        <span style={{ fontWeight: '700', color: '#fb7185', fontSize: '0.9rem' }}>{carB.brand} {carB.model}</span>
      </div>
    </div>
  );
}
