import { useRef, useState, useEffect, useCallback } from 'react'
import { useHandTracking } from './hooks/useHandTracking'
import { useTheremin } from './hooks/useTheremin'
import HandCanvas from './components/HandCanvas'
import Controls from './components/Controls'
import Onboarding from './components/Onboarding'
import HelpModal from './components/HelpModal'

function App() {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 })
  const [containerDimensions, setContainerDimensions] = useState({ width: 640, height: 480 })
  const [step, setStep] = useState('start')
  const [showHelp, setShowHelp] = useState(false)

  const {
    isReady: trackingReady,
    error: trackingError,
    startDetection,
    handDataRef,
    handsDetected,
  } = useHandTracking(videoRef)

  const {
    startAudio, updateSound, isAudioStarted, soundStateRef,
    scale, setScale, SCALES,
    synthPack, setSynthPack, SYNTH_PACKS, SYNTH_PACK_LABELS,
    quantize, setQuantize,
    reverb, setReverb,
  } = useTheremin()

  const soundLoopRef = useRef(null)
  useEffect(() => {
    if (!isAudioStarted) return
    function loop() {
      updateSound(handDataRef.current)
      soundLoopRef.current = requestAnimationFrame(loop)
    }
    soundLoopRef.current = requestAnimationFrame(loop)
    return () => { if (soundLoopRef.current) cancelAnimationFrame(soundLoopRef.current) }
  }, [isAudioStarted, updateSound, handDataRef])

  const handleStart = useCallback(async () => {
    setStep('loading')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      const video = videoRef.current
      video.srcObject = stream
      await video.play()
      setVideoDimensions({ width: video.videoWidth, height: video.videoHeight })

      // Measure container
      if (containerRef.current) {
        setContainerDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }

      await startAudio()
    } catch (err) {
      console.error('Camera/audio start failed:', err)
      setStep('start')
    }
  }, [startAudio])

  useEffect(() => {
    if (trackingReady && step === 'loading') {
      startDetection()
      setStep('ready')
    }
  }, [trackingReady, step, startDetection])

  // Resize: update both video and container dimensions
  useEffect(() => {
    function handleResize() {
      if (videoRef.current) {
        setVideoDimensions({
          width: videoRef.current.videoWidth || 640,
          height: videoRef.current.videoHeight || 480,
        })
      }
      if (containerRef.current) {
        setContainerDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div ref={containerRef} className="crt-screen relative w-full h-full overflow-hidden" style={{ background: '#0a0a0f' }}>
      {/* Video layer + vignette (dark gradient only on video, not UI) */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)', filter: 'grayscale(1) brightness(0.4) contrast(1.1)', opacity: 0.35 }}
          playsInline
          muted
        />
        <div className="absolute inset-0" style={{ background: 'rgba(255, 80, 0, 0.02)' }} />
        <div className="vignette" />
      </div>

      {/* Canvas overlay — uses container dimensions for pixel-perfect alignment */}
      {step !== 'start' && (
        <HandCanvas
          handDataRef={handDataRef}
          soundStateRef={soundStateRef}
          videoWidth={videoDimensions.width}
          videoHeight={videoDimensions.height}
          containerWidth={containerDimensions.width}
          containerHeight={containerDimensions.height}
        />
      )}

      {/* Controls */}
      {step === 'ready' && (
        <Controls
          scale={scale} setScale={setScale} scales={SCALES}
          synthPack={synthPack} setSynthPack={setSynthPack}
          synthPacks={SYNTH_PACKS} synthPackLabels={SYNTH_PACK_LABELS}
          quantize={quantize} setQuantize={setQuantize}
          reverb={reverb} setReverb={setReverb}
        />
      )}

      <Onboarding step={step} onStart={handleStart} />

      {/* Help button */}
      {step === 'ready' && (
        <button
          onClick={() => setShowHelp(true)}
          className="absolute bottom-5 right-5 z-[55] text-xs px-4 py-2 tracking-wider cursor-pointer transition-colors"
          style={{
            color: '#ff6a00',
            background: 'rgba(255,106,0,0.1)',
            border: '1px solid rgba(255,106,0,0.5)',
          }}
        >
          ? HELP
        </button>
      )}

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* Scanlines on top of everything for CRT texture */}
      <div className="scanlines" />

      {trackingError && (
        <div className="absolute bottom-4 left-4 right-4 z-50 text-center">
          <p className="text-[10px] tracking-wider inline-block px-4 py-2"
             style={{ color: '#cc0000', background: 'rgba(204,0,0,0.1)', border: '1px solid rgba(204,0,0,0.3)' }}>
            ERROR: {trackingError}
          </p>
        </div>
      )}
    </div>
  )
}

export default App
