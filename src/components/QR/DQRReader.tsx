import React, {
  useEffect,
  useRef,
  useState,
  useCallback
} from 'react';
import QrScanner from 'qr-scanner'
import { Camera, X } from 'lucide-react'
import { Button } from '../UI/Button'
import { URDecoder } from '@gandlaf21/bc-ur'
import { useTranslation } from 'react-i18next'

const SCAN_AREA_SIZE = 250;
const BORDER_WIDTH = 2;

interface DQRReaderProps {
  isOpen: boolean
  onScan: (data: string) => void
  onClose: () => void
  videoClassName?: string
}

export const DQRReader: React.FC<DQRReaderProps> = ({
  isOpen,
  onScan,
  onClose,
  videoClassName
}) => {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<QrScanner>()
  const decoderRef = useRef<URDecoder>()
  const streamRef = useRef<MediaStream>()
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [received, setReceived] = useState(0)
  const [expected, setExpected] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Initialize and cleanup camera when modal opens/closes
  useEffect(() => {
    if (!isOpen) return

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setHasPermission(true)
      } catch {
        setHasPermission(false)
      }
    }

    initCamera()

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = undefined
      setHasPermission(null)
      setIsScanning(false)
      setReceived(0)
      setExpected(null)
      setErrorMsg(null)

    }
  }, [isOpen])

  // Initialize scanner when camera ready and user starts scanning
  useEffect(() => {
    if (
      !isOpen ||
      !hasPermission ||
      !isScanning ||
      !videoRef.current
    ) {
      return
    }

    const video = videoRef.current

    const onDecode = (result: QrScanner.ScanResult) => {
      try {
        console.log(result.data)
        decoderRef.current?.receivePart(result.data)
        const got = decoderRef.current!.receivedPartIndexes().length
        const exp = decoderRef.current!.expectedPartCount()
        setReceived(got)
        setExpected(exp)
        if (decoderRef.current!.isComplete() && decoderRef.current!.isSuccess()) {
          const ur = decoderRef.current!.resultUR()
          const decoded = ur?.cbor
          const text = new TextDecoder().decode(decoded)
          stopScanning()
          onScan(text)
        }
      } catch (err: any) {
        setErrorMsg(err.message)
      }
    }

    const onReady = () => {
      scannerRef.current = new QrScanner(
        video,
        onDecode,
        {
          returnDetailedScanResult: true,
          preferredCamera: 'environment',
          highlightScanRegion: true,
          highlightCodeOutline: true,
          calculateScanRegion: (video) => ({
            x: video.videoWidth / 2 - SCAN_AREA_SIZE / 2,
            y: video.videoHeight / 2 - SCAN_AREA_SIZE / 2,
            width: SCAN_AREA_SIZE,
            height: SCAN_AREA_SIZE
          })
        }
      )
      scannerRef.current.start()
    }
    if (video.readyState >= 1) {
      onReady()
    } else {
      video.addEventListener('loadedmetadata', onReady)
    }
    return () => {
      video.removeEventListener('loadedmetadata', onReady)
      scannerRef.current?.stop()
      scannerRef.current = undefined
      decoderRef.current = undefined
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, hasPermission, isScanning, onScan])

  // Handlers
  const startScanning = useCallback(() => {
    setErrorMsg(null)
    setReceived(0)
    setExpected(null)
    decoderRef.current = new URDecoder()
    setIsScanning(true)
  }, [])


  const stopScanning = useCallback(() => {
    scannerRef.current?.stop()
    setIsScanning(false)
    onClose()
  }, [onClose])

  const clearData = useCallback(() => {
    decoderRef.current = new URDecoder()
    setReceived(0)
    setExpected(null)
    setErrorMsg(null)
  }, [])

  const reset = useCallback(() => {
    stopScanning()
  }, [stopScanning])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 text-white p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">{t('scanQR')}</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={stopScanning}
          className="text-white hover:bg-white hover:bg-opacity-20"
        >
          <X size={20} />
        </Button>
      </div>


      <video
        ref={videoRef}
        playsInline
        muted
        className={videoClassName || `w-full h-full object-cover ${hasPermission === false ? 'hidden' : ''}`}
      />


      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: SCAN_AREA_SIZE,
          height: SCAN_AREA_SIZE,
          border: `${BORDER_WIDTH}px solid rgba(0,255,0,0.5)`,
          borderRadius: 12,
          boxShadow: '0 0 20px rgba(0,255,0,0.3)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {hasPermission === false && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
          <Camera size={48} className="opacity-50 mb-2" />
          <span>{t('permDenied')}</span>
          <Button onClick={onClose} variant="primary" className="mt-4">
            {t('close')}
          </Button>
        </div>
      )}

      {hasPermission === null && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <Camera size={48} className="opacity-50" />
          <span className="ml-2">{t('loading')}</span>
        </div>
      )}

      <div className="absolute bottom-24 w-full text-center text-sm text-gray-200">
        {expected !== null
          ? `${t('qrfrac')} ${received} / ${expected}`
          : received > 0
            ? `${t('qrfracrec')} ${received}`
            : t('qrnone')}
      </div>

      {errorMsg && (
        <div className="absolute bottom-20 w-full text-center text-red-600 text-sm">
          {errorMsg}
        </div>
      )}

      <div className="absolute bottom-4 w-full flex justify-center space-x-2">
        {!isScanning ? (
          <Button onClick={startScanning} variant="primary">
            {t('qrstart')}
          </Button>
        ) : (
          <Button onClick={stopScanning} variant="secondary">
            {t('qrstop')}
          </Button>
        )}
        <Button onClick={clearData} variant="secondary">
          {t('qrclear')}
        </Button>
        {" "}
        <Button onClick={reset} variant="secondary">
          {t('qrreset')}
        </Button>
      </div>
    </div>
  )
}
