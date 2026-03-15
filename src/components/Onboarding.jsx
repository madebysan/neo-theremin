export default function Onboarding({ step, onStart }) {
  if (step === 'ready') return null

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center"
         style={{ background: 'rgba(10, 10, 15, 0.85)' }}>
      <div className="text-center max-w-lg px-6">
        {step === 'start' && (
          <>
            <div className="mb-6">
              <div className="text-[10px] tracking-[0.3em] mb-2" style={{ color: 'rgba(255,106,0,0.4)' }}>
                NERV AUDIO DIVISION
              </div>
              <h1 className="text-4xl font-light tracking-[0.15em] mb-1" style={{ color: '#ff6a00' }}>
                THEREMIN
              </h1>
              <div className="text-xs tracking-widest" style={{ color: 'rgba(255,106,0,0.3)' }}>
                GESTURE SYNTHESIS INTERFACE
              </div>
            </div>
            <div className="text-[11px] leading-relaxed mb-8 space-y-1" style={{ color: 'rgba(255,106,0,0.45)' }}>
              <p>Each hand is an independent voice.</p>
              <p>Open hand plays. Fist sustains.</p>
              <p className="text-[10px]" style={{ color: 'rgba(255,106,0,0.25)' }}>
                2 HANDS = 2 LAYERS // THUMB↔INDEX = PITCH // HEIGHT = VOLUME
              </p>
            </div>
            <button
              onClick={onStart}
              className="px-8 py-3 text-xs tracking-[0.2em] cursor-pointer transition-all hover:brightness-125"
              style={{
                color: '#ff6a00',
                background: 'rgba(255,106,0,0.08)',
                border: '1px solid rgba(255,106,0,0.4)',
              }}
            >
              INITIALIZE
            </button>
          </>
        )}

        {step === 'loading' && (
          <>
            <div className="w-10 h-10 mx-auto mb-5 relative">
              <div className="absolute inset-0 border-2 border-t-[#ff6a00] rounded-full animate-spin"
                   style={{ borderColor: 'rgba(255,106,0,0.15)', borderTopColor: '#ff6a00' }} />
            </div>
            <p className="text-[11px] tracking-widest" style={{ color: 'rgba(255,106,0,0.5)' }}>
              LOADING DETECTION MODEL...
            </p>
            <p className="text-[9px] tracking-wider mt-2" style={{ color: 'rgba(255,106,0,0.2)' }}>
              INITIALIZING MAGI SUBSYSTEM
            </p>
          </>
        )}

      </div>
    </div>
  )
}
