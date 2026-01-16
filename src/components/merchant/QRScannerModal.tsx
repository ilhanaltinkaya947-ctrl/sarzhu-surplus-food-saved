import { useEffect, useRef, useState } from "react";
import { X, Camera, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

export function QRScannerModal({ isOpen, onClose, onScan }: QRScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Start scanning once video is playing
        videoRef.current.onloadedmetadata = () => {
          scanFrame();
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      setHasCamera(false);
      setError("Camera access denied. Please enable camera permissions.");
    }
  };

  const stopCamera = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const scanFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isOpen) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Use BarcodeDetector if available (modern browsers)
      if ("BarcodeDetector" in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ["qr_code"]
        });
        
        const barcodes = await barcodeDetector.detect(canvas);
        
        if (barcodes.length > 0) {
          const result = barcodes[0].rawValue;
          if (result && isValidUUID(result)) {
            onScan(result);
            return;
          }
        }
      }
    } catch (err) {
      // BarcodeDetector not supported, continue scanning
    }

    animationRef.current = requestAnimationFrame(scanFrame);
  };

  const isValidUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Manual entry fallback
  const handleManualEntry = () => {
    const orderId = prompt("Enter Order ID:");
    if (orderId && isValidUUID(orderId.trim())) {
      onScan(orderId.trim());
    } else if (orderId) {
      setError("Invalid Order ID format");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            <X className="h-6 w-6 text-white" />
          </button>

          {/* Camera View */}
          {hasCamera ? (
            <div className="relative h-full w-full">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                playsInline
                autoPlay
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scan Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Darkened areas */}
                <div className="absolute inset-0 bg-black/50" />
                
                {/* Scan window */}
                <div className="relative z-10 w-72 h-72">
                  {/* Clear center */}
                  <div className="absolute inset-0 bg-transparent" style={{
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)"
                  }} />
                  
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-l-4 border-t-4 border-white rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-12 h-12 border-r-4 border-t-4 border-white rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-l-4 border-b-4 border-white rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-r-4 border-b-4 border-white rounded-br-xl" />
                  
                  {/* Scanning line animation */}
                  <motion.div
                    className="absolute left-4 right-4 h-0.5 bg-emerald-400"
                    initial={{ top: "10%" }}
                    animate={{ top: "90%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </div>
              
              {/* Instructions */}
              <div className="absolute bottom-32 left-0 right-0 text-center">
                <p className="text-white text-lg font-medium">
                  Point camera at QR code
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center px-6">
              <AlertCircle className="h-16 w-16 text-white/70 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">
                Camera Not Available
              </h2>
              <p className="text-white/70 text-center mb-6">
                {error || "Enable camera access in your browser settings"}
              </p>
              <button
                onClick={handleManualEntry}
                className="rounded-xl bg-white px-6 py-3 font-semibold text-black"
              >
                Enter Order ID Manually
              </button>
            </div>
          )}

          {/* Manual Entry Button */}
          <div className="absolute bottom-0 left-0 right-0 p-6 pb-safe">
            <button
              onClick={handleManualEntry}
              className="w-full h-14 rounded-xl bg-white/20 backdrop-blur-sm font-semibold text-white transition-all active:scale-[0.98]"
            >
              Enter ID Manually
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
