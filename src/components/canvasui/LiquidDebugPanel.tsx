import { useState } from 'react'
import type { FluidDistortionOptions } from './FluidDistortion'

/* ============================================================================
 * TEMPORAIRE — panneau de réglage du liquide, à retirer une fois les valeurs
 * choisies. Ne pas laisser ça en prod : c'est juste pour trouver les bons
 * chiffres, puis les recopier en dur dans App.tsx (bouton "Copier" plus bas)
 * et supprimer <LiquidDebugPanel> + ce fichier.
 * ========================================================================== */

interface SliderDef {
  key: keyof FluidDistortionOptions
  label: string
  min: number
  max: number
  step: number
}

const SLIDERS: SliderDef[] = [
  { key: 'distortion', label: 'Distortion (intensité)', min: 0, max: 200, step: 1 },
  { key: 'force', label: 'Force (réaction au mouvement)', min: 0, max: 5, step: 0.05 },
  { key: 'radius', label: 'Radius (taille de la tache)', min: 0.1, max: 5, step: 0.05 },
  { key: 'curl', label: 'Curl (tourbillon)', min: 0, max: 6, step: 0.05 },
  { key: 'pressure', label: 'Pressure', min: 0, max: 1, step: 0.01 },
  { key: 'pressureIterations', label: 'Pressure iterations', min: 1, max: 20, step: 1 },
  { key: 'densityDissipation', label: 'Persistance de la traînée', min: 0.5, max: 1, step: 0.005 },
  { key: 'velocityDissipation', label: 'Persistance du mouvement', min: 0.9, max: 1, step: 0.005 },
  { key: 'updateEveryNFrames', label: 'Rafraîchissement (1=plus fluide, plus lourd)', min: 1, max: 6, step: 1 },
]

const RESOLUTIONS = [64, 128, 256, 512]

interface LiquidDebugPanelProps {
  value: Required<FluidDistortionOptions>
  onChange: (next: Required<FluidDistortionOptions>) => void
}

export function LiquidDebugPanel({ value, onChange }: LiquidDebugPanelProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [copied, setCopied] = useState(false)

  function set<K extends keyof FluidDistortionOptions>(key: K, v: FluidDistortionOptions[K]) {
    onChange({ ...value, [key]: v })
  }

  async function copyValues() {
    const snippet = `<FluidDistortion\n${Object.entries(value)
      .map(([k, v]) => `  ${k}={${v}}`)
      .join('\n')}\n>`
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard denied — the values are still visible on screen to copy by hand.
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        width: collapsed ? 'auto' : 300,
        maxHeight: '80vh',
        overflowY: 'auto',
        background: 'rgba(20, 20, 22, 0.92)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 12,
        padding: collapsed ? '10px 14px' : 16,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        fontSize: 12,
        color: '#fff',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <strong style={{ fontSize: 12, letterSpacing: '0.03em' }}>🧪 Réglages liquide (temp.)</strong>
        <button
          onClick={() => setCollapsed((c) => !c)}
          style={{
            background: 'transparent',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 6,
            padding: '2px 8px',
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          {collapsed ? 'ouvrir' : 'réduire'}
        </button>
      </div>

      {!collapsed && (
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SLIDERS.map(({ key, label, min, max, step }) => (
            <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.85 }}>
                <span>{label}</span>
                <span>{value[key]}</span>
              </span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value[key] as number}
                onChange={(e) => set(key, Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </label>
          ))}

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ opacity: 0.85 }}>Résolution simulation</span>
            <select
              value={value.simResolution}
              onChange={(e) => set('simResolution', Number(e.target.value))}
              style={{ background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, padding: '4px 6px' }}
            >
              {RESOLUTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ opacity: 0.85 }}>Résolution texture (qualité du liquide)</span>
            <select
              value={value.dyeResolution}
              onChange={(e) => set('dyeResolution', Number(e.target.value))}
              style={{ background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, padding: '4px 6px' }}
            >
              {RESOLUTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={copyValues}
            style={{
              marginTop: 4,
              background: copied ? '#2f7a3d' : '#fff',
              color: copied ? '#fff' : '#111',
              border: 'none',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease, color 0.2s ease',
            }}
          >
            {copied ? '✓ Copié dans le presse-papiers' : 'Copier les valeurs (JSX)'}
          </button>
        </div>
      )}
    </div>
  )
}

export default LiquidDebugPanel
