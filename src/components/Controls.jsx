export default function Controls({
  scale, setScale, scales,
  synthPack, setSynthPack, synthPacks, synthPackLabels,
  quantize, setQuantize,
  reverb, setReverb,
}) {
  return (
    <div className="absolute top-0 left-0 right-0 z-[55] px-5 py-3"
         style={{ background: 'linear-gradient(180deg, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.7) 100%)', borderBottom: '1px solid rgba(255,106,0,0.2)' }}>

      {/* Top row: scale, toggles, status */}
      <div className="flex items-center gap-4 mb-2.5">
        <span className="text-xs text-[var(--color-eva-orange)] opacity-70 tracking-widest">MAGI//</span>

        <label className="flex items-center gap-2 text-xs text-[var(--color-eva-orange)] opacity-80">
          SCALE
          <select
            value={scale}
            onChange={(e) => setScale(e.target.value)}
            className="bg-[rgba(255,106,0,0.08)] text-[var(--color-eva-orange)] text-xs uppercase tracking-wider px-3 py-1.5 border border-[rgba(255,106,0,0.2)] outline-none cursor-pointer"
            style={{ appearance: 'none', borderRadius: 0 }}
          >
            {scales.map((s) => (
              <option key={s} value={s} className="bg-[#0a0a0f] text-[var(--color-eva-orange)]">{s}</option>
            ))}
          </select>
        </label>

        <div className="w-px h-5" style={{ background: 'rgba(255,106,0,0.2)' }} />

        <button
          onClick={() => setQuantize(!quantize)}
          className="text-xs px-4 py-1.5 tracking-wider cursor-pointer transition-colors"
          style={{
            color: quantize ? '#00ff88' : 'rgba(255,106,0,0.3)',
            background: quantize ? 'rgba(0,255,136,0.08)' : 'transparent',
            border: `1px solid ${quantize ? 'rgba(0,255,136,0.3)' : 'rgba(255,106,0,0.1)'}`,
          }}
        >
          SNAP
        </button>

        <button
          onClick={() => setReverb(!reverb)}
          className="text-xs px-4 py-1.5 tracking-wider cursor-pointer transition-colors"
          style={{
            color: reverb ? '#00aaff' : 'rgba(255,106,0,0.3)',
            background: reverb ? 'rgba(0,170,255,0.08)' : 'transparent',
            border: `1px solid ${reverb ? 'rgba(0,170,255,0.3)' : 'rgba(255,106,0,0.1)'}`,
          }}
        >
          REVERB
        </button>

        <div className="flex-1" />

        <span className="text-[10px] text-[var(--color-eva-orange)] opacity-40 tracking-[0.2em]">AUDIO SYS ACTIVE</span>
      </div>

      {/* Bottom row: synth packs */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-[10px] text-[var(--color-eva-orange)] opacity-70 mr-1.5 tracking-wider">SYNTH</span>
        {synthPacks.map((p) => (
          <button
            key={p}
            onClick={() => setSynthPack(p)}
            className="text-[10px] px-2 py-0.5 tracking-wider transition-colors cursor-pointer"
            style={{
              color: synthPack === p ? '#ff6a00' : 'rgba(255,106,0,0.6)',
              background: synthPack === p ? 'rgba(255,106,0,0.15)' : 'rgba(255,106,0,0.04)',
              border: `1px solid ${synthPack === p ? 'rgba(255,106,0,0.5)' : 'rgba(255,106,0,0.2)'}`,
            }}
          >
            {synthPackLabels[p]}
          </button>
        ))}
      </div>
    </div>
  )
}
