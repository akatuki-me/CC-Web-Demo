import './style.css'
import jsQR from 'jsqr'

// DOM Elements
const video = document.getElementById('video') as HTMLVideoElement
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const startButton = document.getElementById('startButton') as HTMLButtonElement
const stopButton = document.getElementById('stopButton') as HTMLButtonElement
const resultDiv = document.getElementById('result') as HTMLDivElement
const resultContent = document.getElementById('resultContent') as HTMLDivElement
const copyButton = document.getElementById('copyButton') as HTMLButtonElement
const errorDiv = document.getElementById('error') as HTMLDivElement

// State
let stream: MediaStream | null = null
let animationFrameId: number | null = null
let canvasContext: CanvasRenderingContext2D | null = null

/**
 * Initialize camera with rear-facing preference (for iPhone)
 */
async function startCamera(): Promise<void> {
  try {
    hideError()

    // Stop existing stream if any
    if (stream) {
      stopCamera()
    }

    // Request camera with constraints optimized for iPhone Safari
    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: { ideal: 'environment' }, // Rear camera
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    }

    // Get media stream
    stream = await navigator.mediaDevices.getUserMedia(constraints)

    // Set video source
    video.srcObject = stream

    // Wait for video metadata to load
    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => {
        video.play()
        resolve()
      }
    })

    // Update UI
    startButton.classList.add('hidden')
    stopButton.classList.remove('hidden')

    // Start scanning
    requestAnimationFrame(scanQRCode)

  } catch (error) {
    handleCameraError(error)
  }
}

/**
 * Stop camera and cleanup
 */
function stopCamera(): void {
  // Stop animation frame
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  // Stop media stream
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
  }

  // Clear video
  video.srcObject = null

  // Update UI
  stopButton.classList.add('hidden')
  startButton.classList.remove('hidden')
}

/**
 * Scan QR code from video frame
 */
function scanQRCode(): void {
  // Check if video is ready
  if (video.readyState !== video.HAVE_ENOUGH_DATA) {
    animationFrameId = requestAnimationFrame(scanQRCode)
    return
  }

  // Set canvas size to match video
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvasContext = canvas.getContext('2d', { willReadFrequently: true })
  }

  if (!canvasContext) {
    animationFrameId = requestAnimationFrame(scanQRCode)
    return
  }

  // Draw video frame to canvas
  canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height)

  // Get image data
  const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height)

  // Scan for QR code
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'dontInvert',
  })

  if (code) {
    // QR code detected
    handleQRCodeDetected(code.data)
    return // Stop scanning after successful detection
  }

  // Continue scanning
  animationFrameId = requestAnimationFrame(scanQRCode)
}

/**
 * Handle detected QR code
 */
function handleQRCodeDetected(data: string): void {
  // Display result
  resultContent.textContent = data
  resultDiv.classList.remove('hidden')

  // Visual feedback - flash the scanner frame
  const scannerFrame = document.querySelector('.scanner-frame') as HTMLElement
  if (scannerFrame) {
    scannerFrame.style.borderColor = '#00ff00'
    scannerFrame.style.boxShadow = '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 60px rgba(0, 255, 0, 0.8)'

    setTimeout(() => {
      scannerFrame.style.borderColor = ''
      scannerFrame.style.boxShadow = ''
    }, 500)
  }

  // Play success sound (if available)
  playSuccessSound()

  // Continue scanning (don't stop camera)
  animationFrameId = requestAnimationFrame(scanQRCode)
}

/**
 * Play success sound
 */
function playSuccessSound(): void {
  // Create a simple beep sound using Web Audio API
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  } catch (error) {
    // Audio not supported or failed, ignore
    console.log('Audio not available:', error)
  }
}

/**
 * Handle camera errors with detailed messages
 */
function handleCameraError(error: any): void {
  let errorMessage = 'An error occurred while accessing the camera.'

  if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
    errorMessage = '🚫 Camera permission denied. Please allow camera access in your browser settings.'
  } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
    errorMessage = '📷 No camera found on this device.'
  } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
    errorMessage = '⚠️ Camera is already in use by another application.'
  } else if (error.name === 'OverconstrainedError') {
    errorMessage = '⚙️ Camera does not support the required settings. Trying alternative settings...'

    // Fallback: Try with simpler constraints
    fallbackCamera()
    return
  } else if (error.name === 'SecurityError') {
    errorMessage = '🔒 Camera access is blocked due to security settings. Please use HTTPS.'
  } else if (error.name === 'TypeError') {
    errorMessage = '❌ Camera API is not supported in this browser.'
  }

  showError(errorMessage)
  console.error('Camera error:', error)
}

/**
 * Fallback camera with simpler constraints
 */
async function fallbackCamera(): Promise<void> {
  try {
    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: 'environment'
      },
      audio: false
    }

    stream = await navigator.mediaDevices.getUserMedia(constraints)
    video.srcObject = stream

    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => {
        video.play()
        resolve()
      }
    })

    startButton.classList.add('hidden')
    stopButton.classList.remove('hidden')
    requestAnimationFrame(scanQRCode)

  } catch (error) {
    showError('❌ Unable to access camera with any settings.')
    console.error('Fallback camera error:', error)
  }
}

/**
 * Show error message
 */
function showError(message: string): void {
  errorDiv.textContent = message
  errorDiv.classList.remove('hidden')
}

/**
 * Hide error message
 */
function hideError(): void {
  errorDiv.classList.add('hidden')
}

/**
 * Copy result to clipboard
 */
async function copyToClipboard(): Promise<void> {
  const text = resultContent.textContent || ''

  try {
    await navigator.clipboard.writeText(text)

    // Visual feedback
    const originalText = copyButton.textContent
    copyButton.textContent = '✓ Copied!'
    copyButton.style.backgroundColor = '#218838'

    setTimeout(() => {
      copyButton.textContent = originalText
      copyButton.style.backgroundColor = ''
    }, 2000)
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()

    try {
      document.execCommand('copy')
      copyButton.textContent = '✓ Copied!'
      setTimeout(() => {
        copyButton.textContent = 'Copy'
      }, 2000)
    } catch (err) {
      showError('Failed to copy to clipboard.')
    }

    document.body.removeChild(textArea)
  }
}

/**
 * Check browser support
 */
function checkBrowserSupport(): void {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showError('❌ Your browser does not support camera access. Please use a modern browser like Chrome, Safari, or Firefox.')
    startButton.disabled = true
    return
  }

  // Check for HTTPS (required on most browsers except localhost)
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    showError('🔒 Camera access requires HTTPS. Please use a secure connection.')
  }
}

// Event Listeners
startButton.addEventListener('click', startCamera)
stopButton.addEventListener('click', stopCamera)
copyButton.addEventListener('click', copyToClipboard)

// Initialize
checkBrowserSupport()

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  stopCamera()
})
