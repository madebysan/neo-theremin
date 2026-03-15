import { useEffect, useRef, useCallback, useState } from 'react'

const SCALES = {
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
  blues: [0, 3, 5, 6, 7, 10],
}

// Synth packs — each defines how to configure the oscillators and filter
const SYNTH_PACKS = {
  // --- Original ---
  ethereal: {
    label: 'ETHEREAL',
    osc1: 'sine',
    osc2: 'triangle',
    osc2Detune: 7,
    osc2Gain: 0.3,
    filterFreq: 2000,
    filterQ: 1,
    filterType: 'lowpass',
  },
  analog: {
    label: 'ANALOG',
    osc1: 'sawtooth',
    osc2: 'sawtooth',
    osc2Detune: -12,
    osc2Gain: 0.25,
    filterFreq: 1200,
    filterQ: 3,
    filterType: 'lowpass',
  },
  digital: {
    label: 'DIGITAL',
    osc1: 'square',
    osc2: 'square',
    osc2Detune: 0,
    osc2Gain: 0,
    filterFreq: 3000,
    filterQ: 0.5,
    filterType: 'lowpass',
  },
  warm: {
    label: 'WARM',
    osc1: 'triangle',
    osc2: 'sine',
    osc2Detune: 5,
    osc2Gain: 0.4,
    filterFreq: 1500,
    filterQ: 0.7,
    filterType: 'lowpass',
  },
  harsh: {
    label: 'HARSH',
    osc1: 'sawtooth',
    osc2: 'square',
    osc2Detune: -5,
    osc2Gain: 0.35,
    filterFreq: 4000,
    filterQ: 2,
    filterType: 'lowpass',
  },
  glass: {
    label: 'GLASS',
    osc1: 'sine',
    osc2: 'triangle',
    osc2Detune: 1200,
    osc2Gain: 0.25,
    filterFreq: 3000,
    filterQ: 2,
    filterType: 'bandpass',
  },
  // --- Melodic ---
  choir: {
    label: 'CHOIR',
    osc1: 'sawtooth',
    osc2: 'sawtooth',
    osc2Detune: 3,
    osc2Gain: 0.5,
    filterFreq: 900,
    filterQ: 5,
    filterType: 'bandpass',
  },
  strings: {
    label: 'STRINGS',
    osc1: 'sawtooth',
    osc2: 'sawtooth',
    osc2Detune: 8,
    osc2Gain: 0.45,
    filterFreq: 1800,
    filterQ: 0.8,
    filterType: 'lowpass',
  },
  flute: {
    label: 'FLUTE',
    osc1: 'sine',
    osc2: 'sine',
    osc2Detune: 1200,
    osc2Gain: 0.08,
    filterFreq: 2500,
    filterQ: 0.5,
    filterType: 'lowpass',
  },
  organ: {
    label: 'ORGAN',
    osc1: 'sine',
    osc2: 'sine',
    osc2Detune: 1200,
    osc2Gain: 0.35,
    filterFreq: 4000,
    filterQ: 0.3,
    filterType: 'lowpass',
  },
  cello: {
    label: 'CELLO',
    osc1: 'sawtooth',
    osc2: 'triangle',
    osc2Detune: -1200,
    osc2Gain: 0.3,
    filterFreq: 800,
    filterQ: 1.5,
    filterType: 'lowpass',
  },
  // --- Bass & Low ---
  bass: {
    label: 'BASS',
    osc1: 'sawtooth',
    osc2: 'sine',
    osc2Detune: -1200,
    osc2Gain: 0.5,
    filterFreq: 600,
    filterQ: 4,
    filterType: 'lowpass',
  },
  subbass: {
    label: 'SUB BASS',
    osc1: 'sine',
    osc2: 'sine',
    osc2Detune: -1200,
    osc2Gain: 0.6,
    filterFreq: 300,
    filterQ: 1,
    filterType: 'lowpass',
  },
  // --- Electronic ---
  chiptune: {
    label: '8-BIT',
    osc1: 'square',
    osc2: 'square',
    osc2Detune: 1200,
    osc2Gain: 0.2,
    filterFreq: 6000,
    filterQ: 0.3,
    filterType: 'lowpass',
  },
  lead: {
    label: 'LEAD',
    osc1: 'sawtooth',
    osc2: 'square',
    osc2Detune: 7,
    osc2Gain: 0.3,
    filterFreq: 2500,
    filterQ: 4,
    filterType: 'lowpass',
  },
  pad: {
    label: 'PAD',
    osc1: 'triangle',
    osc2: 'triangle',
    osc2Detune: 15,
    osc2Gain: 0.5,
    filterFreq: 1200,
    filterQ: 0.5,
    filterType: 'lowpass',
  },
  acid: {
    label: 'ACID',
    osc1: 'sawtooth',
    osc2: 'sawtooth',
    osc2Detune: 0,
    osc2Gain: 0,
    filterFreq: 800,
    filterQ: 12,
    filterType: 'lowpass',
  },
  wobble: {
    label: 'WOBBLE',
    osc1: 'sawtooth',
    osc2: 'square',
    osc2Detune: -1200,
    osc2Gain: 0.4,
    filterFreq: 600,
    filterQ: 8,
    filterType: 'lowpass',
  },
  // --- Experimental ---
  scifi: {
    label: 'SCI-FI',
    osc1: 'sawtooth',
    osc2: 'square',
    osc2Detune: 500,
    osc2Gain: 0.3,
    filterFreq: 3500,
    filterQ: 6,
    filterType: 'bandpass',
  },
  metallic: {
    label: 'METALLIC',
    osc1: 'square',
    osc2: 'sawtooth',
    osc2Detune: 710,
    osc2Gain: 0.4,
    filterFreq: 2000,
    filterQ: 8,
    filterType: 'bandpass',
  },
  ghost: {
    label: 'GHOST',
    osc1: 'sine',
    osc2: 'sine',
    osc2Detune: 3,
    osc2Gain: 0.8,
    filterFreq: 600,
    filterQ: 2,
    filterType: 'lowpass',
  },
  siren: {
    label: 'SIREN',
    osc1: 'sawtooth',
    osc2: 'triangle',
    osc2Detune: 1207,
    osc2Gain: 0.35,
    filterFreq: 3000,
    filterQ: 5,
    filterType: 'bandpass',
  },
  drone: {
    label: 'DRONE',
    osc1: 'sawtooth',
    osc2: 'sawtooth',
    osc2Detune: 2,
    osc2Gain: 0.5,
    filterFreq: 500,
    filterQ: 1,
    filterType: 'lowpass',
  },
}

function mapToFrequency(value, scale, octaves = 3) {
  const baseNote = 48
  const intervals = SCALES[scale]
  const totalNotes = intervals.length * octaves
  const clamped = Math.max(0, Math.min(1, value))
  const noteIndex = Math.round(clamped * (totalNotes - 1))
  const octave = Math.floor(noteIndex / intervals.length)
  const degree = noteIndex % intervals.length
  const midiNote = baseNote + octave * 12 + intervals[degree]
  return 440 * Math.pow(2, (midiNote - 69) / 12)
}

function mapToFrequencyFree(value, octaves = 3) {
  const minFreq = 130.81
  const maxFreq = minFreq * Math.pow(2, octaves)
  const clamped = Math.max(0, Math.min(1, value))
  return minFreq * Math.pow(maxFreq / minFreq, clamped)
}

function frequencyToNoteName(freq) {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const midi = 12 * Math.log2(freq / 440) + 69
  const rounded = Math.round(midi)
  const name = noteNames[rounded % 12]
  const octave = Math.floor(rounded / 12) - 1
  return `${name}${octave}`
}

function createVoice(audioCtx, destination, reverbNode, pack) {
  const p = SYNTH_PACKS[pack]

  const osc1 = audioCtx.createOscillator()
  osc1.type = p.osc1
  osc1.frequency.value = 440

  const osc2 = audioCtx.createOscillator()
  osc2.type = p.osc2
  osc2.frequency.value = 440
  osc2.detune.value = p.osc2Detune

  const osc2Gain = audioCtx.createGain()
  osc2Gain.gain.value = p.osc2Gain

  const filter = audioCtx.createBiquadFilter()
  filter.type = p.filterType
  filter.frequency.value = p.filterFreq
  filter.Q.value = p.filterQ

  const gain = audioCtx.createGain()
  gain.gain.value = 0

  const vibratoOsc = audioCtx.createOscillator()
  vibratoOsc.type = 'sine'
  vibratoOsc.frequency.value = 5
  const vibratoGain = audioCtx.createGain()
  vibratoGain.gain.value = 0

  vibratoOsc.connect(vibratoGain)
  vibratoGain.connect(osc1.frequency)
  vibratoGain.connect(osc2.frequency)

  // Routing: osc1 + osc2 -> filter -> gain -> destination + reverb
  osc1.connect(filter)
  osc2.connect(osc2Gain)
  osc2Gain.connect(filter)
  filter.connect(gain)
  gain.connect(destination)
  if (reverbNode) gain.connect(reverbNode)

  osc1.start()
  osc2.start()
  vibratoOsc.start()

  return { osc1, osc2, osc2Gain, filter, gain, vibratoOsc, vibratoGain }
}

export function useTheremin() {
  const audioCtxRef = useRef(null)
  const voiceLeftRef = useRef(null)
  const voiceRightRef = useRef(null)
  const mouthOscRef = useRef(null)
  const mouthGainRef = useRef(null)
  const mouthFilterRef = useRef(null)
  const dryGainRef = useRef(null)
  const wetGainRef = useRef(null)
  const reverbNodeRef = useRef(null)

  const [scale, setScale] = useState('major')
  const [synthPack, setSynthPack] = useState('ethereal')
  const [quantize, setQuantize] = useState(true)
  const [reverb, setReverb] = useState(true)
  const [isAudioStarted, setIsAudioStarted] = useState(false)

  const soundStateRef = useRef({
    left: { frequency: 0, volume: 0, noteName: '', sustain: false, active: false, gesture: '' },
    right: { frequency: 0, volume: 0, noteName: '', sustain: false, active: false, gesture: '' },
    bass: { active: false, mouthOpenness: 0 },
    packLabel: 'ETHEREAL',
  })

  const createReverb = useCallback(async (audioCtx) => {
    const convolver = audioCtx.createConvolver()
    const rate = audioCtx.sampleRate
    const length = rate * 2.5
    const impulse = audioCtx.createBuffer(2, length, rate)
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel)
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2)
      }
    }
    convolver.buffer = impulse
    return convolver
  }, [])

  const startAudio = useCallback(async () => {
    if (audioCtxRef.current) return
    const audioCtx = new AudioContext()
    audioCtxRef.current = audioCtx

    const dryGain = audioCtx.createGain()
    dryGain.gain.value = 0.7
    const wetGain = audioCtx.createGain()
    wetGain.gain.value = 0.3
    const reverbNode = await createReverb(audioCtx)

    reverbNode.connect(wetGain)
    dryGain.connect(audioCtx.destination)
    wetGain.connect(audioCtx.destination)

    dryGainRef.current = dryGain
    wetGainRef.current = wetGain
    reverbNodeRef.current = reverbNode

    // Mouth-controlled siren — sawtooth that sweeps up with openness
    const mouthOsc = audioCtx.createOscillator()
    mouthOsc.type = 'sawtooth'
    mouthOsc.frequency.value = 200

    const mouthFilter = audioCtx.createBiquadFilter()
    mouthFilter.type = 'lowpass'
    mouthFilter.frequency.value = 800
    mouthFilter.Q.value = 8 // resonant for that siren edge

    const mouthGain = audioCtx.createGain()
    mouthGain.gain.value = 0

    mouthOsc.connect(mouthFilter)
    mouthFilter.connect(mouthGain)
    mouthGain.connect(dryGain)
    mouthGain.connect(reverbNode)

    mouthOsc.start()
    mouthOscRef.current = mouthOsc
    mouthGainRef.current = mouthGain
    mouthFilterRef.current = mouthFilter

    voiceLeftRef.current = createVoice(audioCtx, dryGain, reverbNode, synthPack)
    voiceRightRef.current = createVoice(audioCtx, dryGain, reverbNode, synthPack)

    setIsAudioStarted(true)
  }, [createReverb, synthPack])

  // Rebuild voices when synth pack changes
  useEffect(() => {
    const audioCtx = audioCtxRef.current
    if (!audioCtx || !dryGainRef.current) return

    const rebuildVoice = (voiceRef) => {
      const old = voiceRef.current
      if (old) {
        old.osc1.stop()
        old.osc2.stop()
        old.vibratoOsc.stop()
      }
      voiceRef.current = createVoice(audioCtx, dryGainRef.current, reverbNodeRef.current, synthPack)
    }

    rebuildVoice(voiceLeftRef)
    rebuildVoice(voiceRightRef)
    soundStateRef.current.packLabel = SYNTH_PACKS[synthPack].label
  }, [synthPack])

  useEffect(() => {
    if (dryGainRef.current && wetGainRef.current) {
      const now = audioCtxRef.current?.currentTime || 0
      dryGainRef.current.gain.setTargetAtTime(reverb ? 0.7 : 1, now, 0.1)
      wetGainRef.current.gain.setTargetAtTime(reverb ? 0.3 : 0, now, 0.1)
    }
  }, [reverb])

  const updateVoice = useCallback((voice, hand, state, now) => {
    if (!voice) return

    if (!hand) {
      voice.gain.gain.setTargetAtTime(0, now, 0.15)
      state.sustain = false
      state.active = false
      state.frequency = 0
      state.volume = 0
      state.noteName = ''
      state.gesture = ''
      return
    }

    // Pitch = thumb-to-index distance (close = high, spread = low)
    const pitchValue = 1 - Math.max(0, Math.min(1, (hand.pinchDistance - 0.03) / 0.20))
    let freq
    if (quantize) {
      freq = mapToFrequency(pitchValue, scale)
    } else {
      freq = mapToFrequencyFree(pitchValue)
    }

    voice.osc1.frequency.setTargetAtTime(freq, now, 0.03)
    voice.osc2.frequency.setTargetAtTime(freq, now, 0.03)

    // Volume = vertical position (high = loud, low = quiet)
    const vol = Math.max(0, Math.min(1, 1 - hand.palmY))

    // HORNS 🤘 = SUSTAIN (index + pinky up, middle + ring down)
    // Pitch still updates via thumb-index distance, but volume holds
    if (hand.isHorns) {
      if (!state.sustain && state.active) {
        state.sustain = true
        voice.vibratoGain.gain.setTargetAtTime(3, now, 0.1)
      }
      // Keep updating pitch while sustaining
      state.frequency = freq
      state.noteName = frequencyToNoteName(freq)
      state.gesture = 'sustain'
      return
    }

    // Exit sustain
    if (state.sustain) {
      state.sustain = false
      voice.vibratoGain.gain.setTargetAtTime(0, now, 0.05)
    }

    voice.gain.gain.setTargetAtTime(vol * 0.35, now, 0.05)

    // FIST = MUTE
    if (hand.isFist) {
      voice.gain.gain.setTargetAtTime(0, now, 0.1)
      state.gesture = 'mute'
      state.active = false
      state.frequency = 0
      state.volume = 0
      state.noteName = ''
      return
    }

    // POINTING (index only) = vibrato / pitch wobble
    if (hand.isPointing) {
      voice.vibratoGain.gain.setTargetAtTime(8, now, 0.05)
      voice.vibratoOsc.frequency.setTargetAtTime(6, now, 0.05)
      state.gesture = 'vibrato'
    }
    // PEACE (index + middle) = filter sweep — index tip Y controls filter cutoff
    else if (hand.isPeace) {
      const filterVal = Math.max(0, Math.min(1, 1 - hand.indexTipY))
      const filterFreq = 200 + filterVal * 4800 // 200Hz to 5000Hz
      voice.filter.frequency.setTargetAtTime(filterFreq, now, 0.03)
      voice.vibratoGain.gain.setTargetAtTime(0, now, 0.05)
      state.gesture = 'filter'
    }
    // Normal open hand
    else {
      voice.vibratoGain.gain.setTargetAtTime(0, now, 0.05)
      // Reset filter to pack default
      const p = SYNTH_PACKS[synthPack]
      voice.filter.frequency.setTargetAtTime(p.filterFreq, now, 0.1)
      state.gesture = ''
    }

    state.frequency = freq
    state.volume = vol
    state.noteName = frequencyToNoteName(freq)
    state.sustain = false
    state.active = true
  }, [scale, quantize, synthPack])

  const updateSound = useCallback((handData) => {
    const audioCtx = audioCtxRef.current
    if (!audioCtx) return
    const now = audioCtx.currentTime

    updateVoice(voiceLeftRef.current, handData.leftHand, soundStateRef.current.left, now)
    updateVoice(voiceRightRef.current, handData.rightHand, soundStateRef.current.right, now)

    // Siren from mouth — pitch and filter sweep with openness
    const mouthGain = mouthGainRef.current
    const mouthOsc = mouthOscRef.current
    const mouthFilter = mouthFilterRef.current
    if (mouthGain && mouthOsc && mouthFilter) {
      const mouthOpen = handData.mouthOpen
      const mouthOpenness = handData.mouthOpenness || 0

      if (mouthOpen) {
        // Pitch rises with openness: 150Hz → 900Hz
        mouthOsc.frequency.setTargetAtTime(150 + mouthOpenness * 750, now, 0.04)
        // Filter opens: resonant sweep 400Hz → 3000Hz
        mouthFilter.frequency.setTargetAtTime(400 + mouthOpenness * 2600, now, 0.03)
        mouthGain.gain.setTargetAtTime(mouthOpenness * 0.25, now, 0.04)
      } else {
        mouthGain.gain.setTargetAtTime(0, now, 0.1)
      }

      soundStateRef.current.bass.active = mouthOpen
      soundStateRef.current.bass.mouthOpenness = mouthOpenness
    }
  }, [updateVoice])

  useEffect(() => {
    return () => {
      const stop = (v) => {
        if (!v) return
        v.osc1.stop(); v.osc2.stop(); v.vibratoOsc.stop()
      }
      stop(voiceLeftRef.current)
      stop(voiceRightRef.current)
      if (mouthOscRef.current) mouthOscRef.current.stop()
      if (audioCtxRef.current) audioCtxRef.current.close()
    }
  }, [])

  return {
    startAudio, updateSound, isAudioStarted, soundStateRef,
    scale, setScale,
    synthPack, setSynthPack,
    quantize, setQuantize,
    reverb, setReverb,
    SCALES: Object.keys(SCALES),
    SYNTH_PACKS: Object.keys(SYNTH_PACKS),
    SYNTH_PACK_LABELS: Object.fromEntries(Object.entries(SYNTH_PACKS).map(([k, v]) => [k, v.label])),
  }
}
