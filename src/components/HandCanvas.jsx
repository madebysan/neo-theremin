import { useRef, useEffect, useCallback } from 'react'

const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
]

const FINGERTIPS = [4, 8, 12, 16, 20]

const EVA = {
  orange: '#ff6a00',
  orangeDim: 'rgba(255, 106, 0, 0.3)',
  orangeFaint: 'rgba(255, 106, 0, 0.08)',
  red: '#cc0000',
  redDim: 'rgba(204, 0, 0, 0.4)',
  amber: '#ff9500',
  green: '#00ff88',
  greenDim: 'rgba(0, 255, 136, 0.3)',
  blue: '#00aaff',
  blueDim: 'rgba(0, 170, 255, 0.3)',
  purple: '#9933ff',
  text: 'rgba(255, 106, 0, 0.7)',
  textDim: 'rgba(255, 106, 0, 0.35)',
  textFaint: 'rgba(255, 106, 0, 0.15)',
  gridLine: 'rgba(255, 106, 0, 0.08)',
}

let frameCount = 0

export default function HandCanvas({ handDataRef, soundStateRef, videoWidth, videoHeight, containerWidth, containerHeight }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const trailRef = useRef([])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width
    const h = canvas.height
    frameCount++

    ctx.clearRect(0, 0, w, h)

    // Compute object-cover transform so landmarks align with the video
    // The video is displayed with object-cover: it scales to fill, then crops the overflow
    const videoAspect = videoWidth / videoHeight
    const containerAspect = w / h
    let scaleX, scaleY, offsetX, offsetY

    if (containerAspect > videoAspect) {
      // Container is wider — scale to width, crop top/bottom
      const displayScale = w / videoWidth
      scaleX = w
      scaleY = videoHeight * displayScale
      offsetX = 0
      offsetY = (h - scaleY) / 2
    } else {
      // Container is taller — scale to height, crop left/right
      const displayScale = h / videoHeight
      scaleX = videoWidth * displayScale
      scaleY = h
      offsetX = (w - scaleX) / 2
      offsetY = 0
    }

    // Convert normalized landmark coords (0-1) to canvas pixel coords (mirrored X for selfie)
    function lx(normX) { return offsetX + (1 - normX) * scaleX }
    function ly(normY) { return offsetY + normY * scaleY }

    const { leftHand, rightHand } = handDataRef.current
    const stL = soundStateRef.current.left
    const stR = soundStateRef.current.right
    const bass = soundStateRef.current.bass

    // === BACKGROUND GRID ===
    ctx.strokeStyle = EVA.gridLine
    ctx.lineWidth = 0.5
    const gridSize = 60
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
    }

    // === CORNER BRACKETS ===
    const bS = 40, bW = 2
    ctx.strokeStyle = EVA.orangeDim
    ctx.lineWidth = bW
    ctx.beginPath(); ctx.moveTo(12, 12 + bS); ctx.lineTo(12, 12); ctx.lineTo(12 + bS, 12); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(w - 12 - bS, 12); ctx.lineTo(w - 12, 12); ctx.lineTo(w - 12, 12 + bS); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(12, h - 12 - bS); ctx.lineTo(12, h - 12); ctx.lineTo(12 + bS, h - 12); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(w - 12 - bS, h - 12); ctx.lineTo(w - 12, h - 12); ctx.lineTo(w - 12, h - 12 - bS); ctx.stroke()

    // === TOP-LEFT: System label ===
    ctx.font = '10px "Share Tech Mono", monospace'
    ctx.fillStyle = EVA.textDim
    ctx.textAlign = 'left'
    ctx.fillText('NERV AUDIO INTERFACE v2.6', 20, 30)
    ctx.fillText(`SYNTH: ${soundStateRef.current.packLabel || 'ETHEREAL'}`, 20, 44)

    // === TOP-RIGHT: Status ===
    ctx.textAlign = 'right'
    const handCount = (leftHand ? 1 : 0) + (rightHand ? 1 : 0)
    ctx.fillStyle = handCount > 0 ? EVA.green : EVA.textDim
    ctx.fillText(`TARGETS: ${handCount}`, w - 20, 30)
    ctx.fillStyle = EVA.textDim
    const time = new Date()
    ctx.fillText(`${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`, w - 20, 44)

    // Distortion indicator + mouth pulse effect
    const { mouthOpen: mOpen, mouthOpenness: mOpenness, mouthX: mX, mouthY: mY } = handDataRef.current
    if (bass && bass.active && mOpen) {
      const blinkOn = Math.floor(frameCount / 12) % 2 === 0
      ctx.fillStyle = blinkOn ? EVA.red : EVA.redDim
      ctx.textAlign = 'right'
      ctx.fillText('NOISE // ノイズ', w - 20, 58)
      // Mouth openness bar
      const barW = 80, barH = 3
      const barX = w - 20 - barW, barY = 63
      ctx.fillStyle = 'rgba(204, 0, 0, 0.15)'
      ctx.fillRect(barX, barY, barW, barH)
      ctx.fillStyle = EVA.red
      ctx.fillRect(barX, barY, barW * bass.mouthOpenness, barH)

      // Pulsating rings around mouth position
      const mx = lx(mX)
      const my = ly(mY)
      const pulse = Math.sin(frameCount * 0.15) * 0.5 + 0.5
      const openAmt = mOpenness || 0

      // Outer expanding ring
      const outerR = 30 + openAmt * 40 + pulse * 15
      ctx.beginPath()
      ctx.arc(mx, my, outerR, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(204, 0, 0, ${0.15 + pulse * 0.25})`
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Middle ring
      const midR = 18 + openAmt * 25 + pulse * 8
      ctx.beginPath()
      ctx.arc(mx, my, midR, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(204, 0, 0, ${0.3 + pulse * 0.3})`
      ctx.lineWidth = 2
      ctx.stroke()

      // Inner glow fill
      const innerR = 8 + openAmt * 15
      const grad = ctx.createRadialGradient(mx, my, 0, mx, my, innerR)
      grad.addColorStop(0, `rgba(204, 0, 0, ${0.3 + openAmt * 0.3})`)
      grad.addColorStop(1, 'rgba(204, 0, 0, 0)')
      ctx.beginPath()
      ctx.arc(mx, my, innerR, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()

      // Crosshair lines through mouth
      const chLen = 12 + openAmt * 10
      ctx.strokeStyle = `rgba(204, 0, 0, ${0.3 + pulse * 0.2})`
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(mx - chLen, my); ctx.lineTo(mx + chLen, my)
      ctx.moveTo(mx, my - chLen); ctx.lineTo(mx, my + chLen)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // === VOLUME RULER (right side, vertical) ===
    const volRulerX = w - 45
    const volRulerTop = h * 0.1
    const volRulerBot = h * 0.75
    const volRulerH = volRulerBot - volRulerTop

    ctx.strokeStyle = EVA.orangeDim
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(volRulerX - 1, volRulerTop); ctx.lineTo(volRulerX - 1, volRulerBot); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(volRulerX + 1, volRulerTop); ctx.lineTo(volRulerX + 1, volRulerBot); ctx.stroke()

    for (let i = 0; i <= 10; i++) {
      const y = volRulerBot - (i / 10) * volRulerH
      const major = i % 5 === 0
      ctx.strokeStyle = major ? EVA.orangeDim : EVA.textFaint
      ctx.beginPath()
      ctx.moveTo(volRulerX - (major ? 8 : 4), y)
      ctx.lineTo(volRulerX + (major ? 8 : 4), y)
      ctx.stroke()
      if (major) {
        ctx.font = '8px "Share Tech Mono", monospace'
        ctx.fillStyle = EVA.textDim
        ctx.textAlign = 'left'
        ctx.fillText(`${i * 10}%`, volRulerX + 12, y + 3)
      }
    }

    ctx.save()
    ctx.translate(volRulerX + 28, (volRulerTop + volRulerBot) / 2)
    ctx.rotate(Math.PI / 2)
    ctx.font = '9px "Share Tech Mono", monospace'
    ctx.fillStyle = EVA.textFaint
    ctx.textAlign = 'center'
    ctx.fillText('VOLUME // 音量', 0, 0)
    ctx.restore()

    // === PITCH LEGEND (left) ===
    const volX = 45
    const volTop = h * 0.35
    ctx.save()
    ctx.translate(volX - 20, volTop)
    ctx.rotate(-Math.PI / 2)
    ctx.font = '9px "Share Tech Mono", monospace'
    ctx.fillStyle = EVA.textFaint
    ctx.textAlign = 'center'
    ctx.fillText('PITCH = THUMB↔INDEX // 音程', 0, 0)
    ctx.restore()

    // === DRAW EACH VOICE ===
    const voices = [
      { hand: leftHand, state: stL, label: '\u5DE6', tag: 'L-VOICE', color: EVA.green, colorDim: EVA.greenDim },
      { hand: rightHand, state: stR, label: '\u53F3', tag: 'R-VOICE', color: EVA.blue, colorDim: EVA.blueDim },
    ]

    for (const { hand, state, label, tag, color, colorDim } of voices) {
      if (!hand) continue
      const lm = hand.landmarks
      const palmPx = lx(hand.palmX)
      const palmPy = ly(hand.palmY)
      const freq = state.frequency
      const vol = state.volume

      // Hand skeleton
      ctx.strokeStyle = colorDim
      ctx.lineWidth = 1.5
      for (const [a, b] of CONNECTIONS) {
        ctx.beginPath()
        ctx.moveTo(lx(lm[a].x), ly(lm[a].y))
        ctx.lineTo(lx(lm[b].x), ly(lm[b].y))
        ctx.stroke()
      }

      for (let i = 0; i < lm.length; i++) {
        const isTip = FINGERTIPS.includes(i)
        ctx.beginPath()
        ctx.arc(lx(lm[i].x), ly(lm[i].y), isTip ? 4 : 2, 0, Math.PI * 2)
        ctx.fillStyle = isTip ? color : colorDim
        ctx.fill()
      }

      // Crosshair
      const chSize = 18
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(palmPx - chSize, palmPy); ctx.lineTo(palmPx + chSize, palmPy)
      ctx.moveTo(palmPx, palmPy - chSize); ctx.lineTo(palmPx, palmPy + chSize)
      ctx.stroke()
      ctx.setLineDash([])

      // Diamond target
      const dSize = 25 + (state.sustain ? Math.sin(frameCount * 0.1) * 5 : 0)
      ctx.strokeStyle = state.sustain ? EVA.amber : color
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(palmPx, palmPy - dSize)
      ctx.lineTo(palmPx + dSize, palmPy)
      ctx.lineTo(palmPx, palmPy + dSize)
      ctx.lineTo(palmPx - dSize, palmPy)
      ctx.closePath()
      ctx.stroke()

      // Voice label
      ctx.font = '10px "Share Tech Mono", monospace'
      ctx.fillStyle = color
      ctx.textAlign = 'left'
      ctx.fillText(`${tag} [${label}]`, palmPx + dSize + 8, palmPy - 12)

      // Gesture indicator
      if (state.gesture === 'sustain') {
        const blinkOn = Math.floor(frameCount / 15) % 2 === 0
        if (blinkOn) {
          ctx.font = 'bold 10px "Share Tech Mono", monospace'
          ctx.fillStyle = EVA.amber
          ctx.textAlign = 'left'
          ctx.fillText('SUSTAIN 🤘', palmPx + dSize + 8, palmPy + 2)
        }
      } else if (state.gesture === 'mute') {
        ctx.font = 'bold 10px "Share Tech Mono", monospace'
        ctx.fillStyle = EVA.redDim
        ctx.textAlign = 'left'
        ctx.fillText('MUTE ✊', palmPx + dSize + 8, palmPy + 2)
      } else if (state.gesture === 'vibrato') {
        ctx.font = 'bold 10px "Share Tech Mono", monospace'
        ctx.fillStyle = EVA.purple
        ctx.textAlign = 'left'
        ctx.fillText('VIBRATO ☝', palmPx + dSize + 8, palmPy + 2)
      } else if (state.gesture === 'filter') {
        ctx.font = 'bold 10px "Share Tech Mono", monospace'
        ctx.fillStyle = '#ff00ff'
        ctx.textAlign = 'left'
        ctx.fillText('FILTER ✌', palmPx + dSize + 8, palmPy + 2)
      }

      // Note + frequency
      if (freq && (vol > 0.02 || state.sustain)) {
        ctx.font = 'bold 22px "Share Tech Mono", monospace'
        ctx.fillStyle = color
        ctx.textAlign = 'center'
        ctx.fillText(state.noteName, palmPx, palmPy - dSize - 18)
        ctx.font = '10px "Share Tech Mono", monospace'
        ctx.fillStyle = colorDim
        ctx.fillText(`${Math.round(freq)} Hz`, palmPx, palmPy - dSize - 4)
      }

      // Volume readout
      if (vol > 0.02 || state.sustain) {
        ctx.font = '10px "Share Tech Mono", monospace'
        ctx.fillStyle = colorDim
        ctx.textAlign = 'left'
        ctx.fillText(`VOL ${Math.round(vol * 100)}%`, palmPx + dSize + 8, palmPy + 16)
      }

      // Volume marker on vertical ruler (Y position = volume)
      if (vol > 0.02 || state.sustain) {
        const volY = volRulerBot - vol * volRulerH

        ctx.strokeStyle = colorDim
        ctx.lineWidth = 1
        ctx.setLineDash([2, 4])
        ctx.beginPath()
        ctx.moveTo(palmPx + dSize, palmPy)
        ctx.lineTo(volRulerX - 8, volY)
        ctx.stroke()
        ctx.setLineDash([])

        ctx.fillStyle = color
        ctx.beginPath()
        ctx.moveTo(volRulerX - 10, volY)
        ctx.lineTo(volRulerX - 16, volY - 3)
        ctx.lineTo(volRulerX - 16, volY + 3)
        ctx.closePath()
        ctx.fill()
      }

      // Pinch distance pitch indicator (line between thumb and index)
      if (freq) {
        const thumbPx = lx(lm[4].x), thumbPy = ly(lm[4].y)
        const indexPx = lx(lm[8].x), indexPy = ly(lm[8].y)
        const midX = (thumbPx + indexPx) / 2, midY = (thumbPy + indexPy) / 2

        // Line between thumb and index tip
        ctx.strokeStyle = color
        ctx.lineWidth = 1.5
        ctx.globalAlpha = 0.6
        ctx.beginPath()
        ctx.moveTo(thumbPx, thumbPy)
        ctx.lineTo(indexPx, indexPy)
        ctx.stroke()

        // Pitch circle at midpoint — radius scales with pitch
        const pitchNorm = Math.max(0, Math.min(1, (hand.pinchDistance - 0.03) / 0.20))
        const circR = 6 + pitchNorm * 14
        ctx.beginPath()
        ctx.arc(midX, midY, circR, 0, Math.PI * 2)
        ctx.strokeStyle = color
        ctx.lineWidth = 1.5
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(midX, midY, circR, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.globalAlpha = pitchNorm * 0.2
        ctx.fill()

        ctx.globalAlpha = 1
      }


      // Particles
      if ((vol > 0.05 || state.sustain) && state.frequency) {
        const trail = trailRef.current
        for (const tip of FINGERTIPS) {
          if (Math.random() > 0.4) continue
          trail.push({
            x: lx(lm[tip].x), y: ly(lm[tip].y),
            vx: (Math.random() - 0.5) * 1, vy: -Math.random() * 1.5,
            radius: 1.5 + Math.random() * 2 * vol,
            life: 0.4 + Math.random() * 0.3,
            color,
          })
        }
      }
    }

    // === PARTICLE TRAIL ===
    const trail = trailRef.current
    for (let i = trail.length - 1; i >= 0; i--) {
      const p = trail[i]
      p.life -= 0.025
      p.x += p.vx; p.y += p.vy; p.radius *= 0.96
      if (p.life <= 0) { trail.splice(i, 1); continue }
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fillStyle = p.color + Math.round(p.life * 60).toString(16).padStart(2, '0')
      ctx.fill()
    }
    if (trail.length > 200) trail.splice(0, trail.length - 200)


    // === BOTTOM-LEFT: Data readout ===
    ctx.font = '9px "Share Tech Mono", monospace'
    ctx.fillStyle = EVA.textFaint
    ctx.textAlign = 'left'
    const activeVoices = [stL, stR].filter(s => s.frequency > 0).length
    ctx.fillText(`ACTIVE VOICES: ${activeVoices}/2${bass?.active ? ' + NOISE' : ''}`, 20, h - 28)
    ctx.fillText(`FRAME: ${frameCount}`, 20, h - 16)

    animRef.current = requestAnimationFrame(draw)
  }, [handDataRef, soundStateRef, videoWidth, videoHeight, containerWidth, containerHeight])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      // Set canvas pixel dimensions to match the container (not the video)
      canvas.width = containerWidth
      canvas.height = containerHeight
    }
    animRef.current = requestAnimationFrame(draw)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [draw, containerWidth, containerHeight])

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    />
  )
}
