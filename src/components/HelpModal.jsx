import { useEffect } from 'react'

const GESTURES = [
  { gesture: 'Open hand', icon: '🖐', effect: 'Play — pitch from thumb↔index, volume from height', color: '#ff6a00' },
  { gesture: 'Horns', icon: '🤘', effect: 'Sustain — holds volume, pitch still changes', color: '#ff9500' },
  { gesture: 'Fist', icon: '✊', effect: 'Mute — silences the voice', color: '#cc0000' },
  { gesture: 'Point', icon: '☝️', effect: 'Vibrato — adds pitch wobble', color: '#9933ff' },
  { gesture: 'Peace', icon: '✌️', effect: 'Filter sweep — hand height sweeps the filter', color: '#ff00ff' },
  { gesture: 'Open mouth', icon: '👄', effect: 'Siren — rising tone controlled by openness', color: '#cc0000' },
]

const CONTROLS = [
  { axis: 'Thumb ↔ Index distance', control: 'Pitch', detail: 'Close = high, spread = low' },
  { axis: 'Hand height', control: 'Volume', detail: 'High = loud, low = quiet' },
  { axis: 'Horizontal position', control: 'Free', detail: 'Move anywhere — no effect on sound' },
]

export default function HelpModal({ onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center"
         style={{ background: 'rgba(10, 10, 15, 0.92)' }}
         onClick={onClose}>
      <div className="max-w-lg w-full mx-4 p-6"
           style={{ background: 'rgba(10, 10, 15, 0.95)', border: '1px solid rgba(255, 106, 0, 0.3)' }}
           onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm tracking-[0.2em]" style={{ color: '#ff6a00' }}>
            OPERATOR MANUAL // 操作マニュアル
          </h2>
          <button onClick={onClose}
                  className="text-xs px-2 py-1 cursor-pointer tracking-wider"
                  style={{ color: 'rgba(255,106,0,0.4)', border: '1px solid rgba(255,106,0,0.15)' }}>
            ESC
          </button>
        </div>

        {/* Gestures */}
        <div className="mb-5">
          <div className="text-[10px] tracking-[0.15em] mb-3" style={{ color: 'rgba(255,106,0,0.4)' }}>
            GESTURES
          </div>
          <div className="space-y-2">
            {GESTURES.map(({ gesture, icon, effect, color }) => (
              <div key={gesture} className="flex items-start gap-3">
                <span className="text-lg w-7 text-center shrink-0">{icon}</span>
                <div>
                  <span className="text-xs tracking-wider" style={{ color }}>{gesture}</span>
                  <p className="text-[11px]" style={{ color: 'rgba(255,106,0,0.45)' }}>{effect}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls mapping */}
        <div className="mb-5">
          <div className="text-[10px] tracking-[0.15em] mb-3" style={{ color: 'rgba(255,106,0,0.4)' }}>
            AXES
          </div>
          <div className="space-y-1.5">
            {CONTROLS.map(({ axis, control, detail }) => (
              <div key={axis} className="flex items-baseline gap-2">
                <span className="text-[11px] tracking-wider" style={{ color: '#ff6a00' }}>{axis}</span>
                <span className="text-[10px]" style={{ color: 'rgba(255,106,0,0.25)' }}>→</span>
                <span className="text-[11px]" style={{ color: 'rgba(255,106,0,0.5)' }}>{control}</span>
                <span className="text-[10px]" style={{ color: 'rgba(255,106,0,0.25)' }}>({detail})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div>
          <div className="text-[10px] tracking-[0.15em] mb-2" style={{ color: 'rgba(255,106,0,0.4)' }}>
            TIPS
          </div>
          <ul className="space-y-1 text-[11px]" style={{ color: 'rgba(255,106,0,0.4)' }}>
            <li>• Two hands play two independent voices</li>
            <li>• Use SNAP to lock notes to a scale</li>
            <li>• Switch synth packs for different timbres</li>
            <li>• Sustain 🤘 lets you change pitch while holding volume</li>
          </ul>
        </div>

        <div className="mt-5 pt-3" style={{ borderTop: '1px solid rgba(255,106,0,0.1)' }}>
          <p className="text-[9px] tracking-[0.15em] text-center" style={{ color: 'rgba(255,106,0,0.2)' }}>
            NERV AUDIO DIVISION — GESTURE SYNTHESIS INTERFACE
          </p>
        </div>
      </div>
    </div>
  )
}
