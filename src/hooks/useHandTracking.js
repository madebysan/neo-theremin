import { useEffect, useRef, useState, useCallback } from 'react'
import { HandLandmarker, FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

// Hand landmark indices
const THUMB_TIP = 4
const THUMB_MCP = 2
const INDEX_TIP = 8
const INDEX_PIP = 6
const MIDDLE_TIP = 12
const MIDDLE_PIP = 10
const RING_TIP = 16
const RING_PIP = 14
const PINKY_TIP = 20
const PINKY_PIP = 18
const WRIST = 0

// Face landmark indices for mouth
const UPPER_LIP = 13
const LOWER_LIP = 14

function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function isRightHand(handedness) {
  return handedness[0]?.categoryName === 'Right'
}

function getFingerStates(landmarks) {
  const palmCenter = {
    x: (landmarks[0].x + landmarks[5].x + landmarks[17].x) / 3,
    y: (landmarks[0].y + landmarks[5].y + landmarks[17].y) / 3,
  }
  const thumbExtended = distance(landmarks[THUMB_TIP], palmCenter) >
                         distance(landmarks[THUMB_MCP], palmCenter) * 1.1

  // Finger is extended if tip is above (lower y) its PIP joint
  const indexExtended = landmarks[INDEX_TIP].y < landmarks[INDEX_PIP].y
  const middleExtended = landmarks[MIDDLE_TIP].y < landmarks[MIDDLE_PIP].y
  const ringExtended = landmarks[RING_TIP].y < landmarks[RING_PIP].y
  const pinkyExtended = landmarks[PINKY_TIP].y < landmarks[PINKY_PIP].y

  return {
    thumb: thumbExtended,
    index: indexExtended,
    middle: middleExtended,
    ring: ringExtended,
    pinky: pinkyExtended,
    count: [thumbExtended, indexExtended, middleExtended, ringExtended, pinkyExtended]
      .filter(Boolean).length,
  }
}

// Fist detection based on compactness: all fingertips close to palm center
// This is much more robust than counting fingers — an open hand has spread tips,
// a fist has all tips tucked near the palm regardless of detection noise
function detectFist(landmarks) {
  // If thumb and index are spread apart, it's definitely not a fist
  // (user is controlling volume with thumb-index distance)
  const thumbIndexDist = distance(landmarks[THUMB_TIP], landmarks[INDEX_TIP])
  if (thumbIndexDist > 0.08) return false

  const palmCenter = {
    x: (landmarks[0].x + landmarks[5].x + landmarks[17].x) / 3,
    y: (landmarks[0].y + landmarks[5].y + landmarks[17].y) / 3,
  }
  const tips = [INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP]
  const avgDist = tips.reduce((sum, i) => sum + distance(landmarks[i], palmCenter), 0) / tips.length
  // Open hand: avgDist ~0.15-0.25, fist: avgDist ~0.05-0.10
  return avgDist < 0.12
}

export function useHandTracking(videoRef) {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)
  const handLandmarkerRef = useRef(null)
  const faceLandmarkerRef = useRef(null)
  const animFrameRef = useRef(null)
  const lastTimestampRef = useRef(-1)

  const handDataRef = useRef({
    leftHand: null,
    rightHand: null,
    handsDetected: 0,
    mouthOpen: false,
    mouthOpenness: 0,
  })

  const [handsDetected, setHandsDetected] = useState(0)

  const initTracking = useCallback(async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      )

      // Init hand tracking
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      // Init face tracking for mouth detection
      const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      handLandmarkerRef.current = handLandmarker
      faceLandmarkerRef.current = faceLandmarker
      setIsReady(true)
    } catch (err) {
      console.error('Tracking init failed:', err)
      setError(err.message)
    }
  }, [])

  const detect = useCallback(() => {
    const video = videoRef.current
    const handLandmarker = handLandmarkerRef.current
    const faceLandmarker = faceLandmarkerRef.current

    if (!video || !handLandmarker || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detect)
      return
    }

    const timestamp = performance.now()
    if (timestamp === lastTimestampRef.current) {
      animFrameRef.current = requestAnimationFrame(detect)
      return
    }
    lastTimestampRef.current = timestamp

    // Hand detection
    const handResults = handLandmarker.detectForVideo(video, timestamp)

    let leftHand = null
    let rightHand = null

    if (handResults.landmarks && handResults.landmarks.length > 0) {
      for (let i = 0; i < handResults.landmarks.length; i++) {
        const landmarks = handResults.landmarks[i]
        const handedness = handResults.handednesses[i]
        const fingers = getFingerStates(landmarks)

        // Gesture detection
        const isFist = detectFist(landmarks)
        // Horns 🤘 = index + pinky up, middle + ring down (sustain)
        const isHorns = fingers.index && !fingers.middle && !fingers.ring && fingers.pinky
        // Point = only index extended
        const isPointing = !isFist && !isHorns && fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky
        // Peace = index + middle extended, ring + pinky closed
        const isPeace = !isFist && !isHorns && fingers.index && fingers.middle && !fingers.ring && !fingers.pinky

        const handInfo = {
          landmarks,
          fingers,
          isFist,
          isHorns,
          isPointing,
          isPeace,
          pinchDistance: distance(landmarks[THUMB_TIP], landmarks[INDEX_TIP]),
          x: landmarks[WRIST].x,
          y: landmarks[WRIST].y,
          palmX: (landmarks[0].x + landmarks[5].x + landmarks[17].x) / 3,
          palmY: (landmarks[0].y + landmarks[5].y + landmarks[17].y) / 3,
          indexTipY: landmarks[INDEX_TIP].y,
        }

        if (isRightHand(handedness)) {
          rightHand = handInfo
        } else {
          leftHand = handInfo
        }
      }
    }

    // Face/mouth detection
    let mouthOpen = false
    let mouthOpenness = 0
    let mouthX = 0.5
    let mouthY = 0.5

    if (faceLandmarker) {
      const faceResults = faceLandmarker.detectForVideo(video, timestamp)
      if (faceResults.faceLandmarks && faceResults.faceLandmarks.length > 0) {
        const faceLm = faceResults.faceLandmarks[0]
        const lipDist = Math.abs(faceLm[UPPER_LIP].y - faceLm[LOWER_LIP].y)
        mouthOpenness = Math.min(1, Math.max(0, (lipDist - 0.015) / 0.04))
        mouthOpen = mouthOpenness > 0.2
        mouthX = (faceLm[UPPER_LIP].x + faceLm[LOWER_LIP].x) / 2
        mouthY = (faceLm[UPPER_LIP].y + faceLm[LOWER_LIP].y) / 2
      }
    }

    const count = (leftHand ? 1 : 0) + (rightHand ? 1 : 0)
    handDataRef.current = { leftHand, rightHand, handsDetected: count, mouthOpen, mouthOpenness, mouthX, mouthY }

    setHandsDetected(prev => prev !== count ? count : prev)

    animFrameRef.current = requestAnimationFrame(detect)
  }, [videoRef])

  useEffect(() => {
    initTracking()
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (handLandmarkerRef.current) handLandmarkerRef.current.close()
      if (faceLandmarkerRef.current) faceLandmarkerRef.current.close()
    }
  }, [initTracking])

  const startDetection = useCallback(() => {
    if (handLandmarkerRef.current) detect()
  }, [detect])

  return { isReady, error, startDetection, handDataRef, handsDetected }
}
