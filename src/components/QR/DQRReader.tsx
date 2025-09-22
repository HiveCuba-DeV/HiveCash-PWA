import React, {
  useEffect,
  useRef,
  useState,
  useCallback
} from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '../UI/Button';
import { URDecoder } from '@gandlaf21/bc-ur';
import { useTranslation } from 'react-i18next';
import { useCamera } from '../../hooks/useCamera';
import { detectQRCodeFromCanvas } from '../../hooks/detectQR';

const SCAN_AREA_SIZE = 250;
const BORDER_WIDTH = 2;

interface DQRReaderProps {
  isOpen: boolean;
  onScan: (data: string) => void;
  onClose: () => void;
  videoClassName?: string;
}

export const DQRReader: React.FC<DQRReaderProps> = ({
  isOpen,
  onScan,
  onClose,
  videoClassName
}) => {
  const [scanning, setScanning] = useState(false);
  const scanningRef = useRef(false);

  const { t } = useTranslation();
  const { videoRef, getFrame, startCamera, stopCamera, isActive } = useCamera();
  const decoderRef = useRef<URDecoder>()

  //Handler Payload
  const decodePayLoad = useCallback((payload: string) => {
    setScanning(false);
    scanningRef.current = false;
    decoderRef.current = undefined;
    stopCamera();
    onScan(payload);
  }, [stopCamera, onScan]);

  //Handler Stop
  const stopScaning = useCallback(() => {
    setScanning(false);
    scanningRef.current = false;
    stopCamera();
    decoderRef.current = undefined;
    onClose();
  }, [stopCamera, onClose]);

  useEffect(() => { //Camera
    if (!isOpen) return;

    (async () => {
      await startCamera();
      setScanning(true);
      scanningRef.current = true;
    })();

    decoderRef.current = new URDecoder(undefined, 'bytes');

    // Cleanup on unmount
    return () => {
      scanningRef.current = false;
      setScanning(false);
      stopCamera();
      decoderRef.current = undefined;
    };

  }, [isOpen, startCamera, stopCamera]);

  useEffect(() => {// Read Scanner
    if (!isOpen) return;
    if (!scanning) return;

    let animationFrameId: number;
    let lastScanTime = 0;
    const scanInterval = 200;

    const scanLoop = async () => {
      if (!scanningRef.current) return;
      const now = Date.now();
      if (now - lastScanTime < scanInterval) {
        animationFrameId = requestAnimationFrame(scanLoop);
        return;
      }
      lastScanTime = now;

      if (!decoderRef.current) decoderRef.current = new URDecoder(undefined, 'bytes');

      // Obtener frame desde video
      const canvas = getFrame();
      if (canvas) {
        try {
          const qrcodes = detectQRCodeFromCanvas(canvas);
          if (qrcodes) {
            const value = qrcodes.trim();
            if (value.startsWith('ur:')) {
              decoderRef.current!.receivePart(value);
              if (decoderRef.current!.isComplete()) {
                const ur = decoderRef.current!.resultUR();
                const decoded = ur.decodeCBOR();
                //For json 
                //const originalMessage = JSON.parse(decoded.toString())
                //decodePayLoad(originalMessage);
                // For string
                decodePayLoad(decoded.toString());
              }
            }
          }

        } catch (err) {
          // Podríamos loggear o ignorar errores en detección
          console.error('Error scanning QR', err);
        }
      }

      // Loop: llama de nuevo usando requestAnimationFrame para rendimiento
      animationFrameId = requestAnimationFrame(scanLoop);
    };

    animationFrameId = requestAnimationFrame(scanLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [scanning, getFrame, onScan, stopCamera]);


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 text-white p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">{t('scanQR')}</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={stopScaning}
          className="text-white hover:bg-white hover:bg-opacity-20"
        >
          <X size={20} />
        </Button>
      </div>


      <video
        ref={videoRef}
        playsInline
        muted
        className={videoClassName || `w-full h-full object-cover ${isActive === false ? 'hidden' : ''}`}
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

      {isActive === false && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
          <Camera size={48} className="opacity-50 mb-2" />
          <span>{t('permDenied')}</span>
          <Button onClick={onClose} variant="primary" className="mt-4">
            {t('close')}
          </Button>
        </div>
      )}

      <div className="absolute bottom-4 w-full flex justify-center space-x-2">
        {isActive ? (
          <Button onClick={stopScaning} variant="secondary">
            {t('qrstop')}
          </Button>
        ) : ''}

      </div>
    </div>
  )
}
