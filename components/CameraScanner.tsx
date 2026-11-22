'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Camera, RefreshCw, Loader2, CheckCircle2, AlertCircle, Barcode } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  onCode: (code: string) => void;
  onClose: () => void;
};

interface CameraDevice {
  id: string;
  label: string;
}

// Crisp, high-frequency POS register scanner beep (Web Audio API)
function playBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1850, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // AudioContext blocked or not supported, ignore silently
  }
}

// The reader lives in its own component so it starts only after the dialog is mounted.
function Reader({ onCode }: Pick<Props, 'onCode'>) {
  const [err, setErr] = useState('');
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [activeCamIndex, setActiveCamIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  const scannerRef = useRef<any>(null);
  const scannedRef = useRef(false);
  const containerId = 'stockify-single-camera-viewport';

  const stopAndCleanScanner = async () => {
    if (scannerRef.current) {
      const s = scannerRef.current;
      scannerRef.current = null;
      try {
        if (s.isScanning) {
          await s.stop();
        }
      } catch {
        // ignore errors during stop
      }
      try {
        s.clear();
      } catch {
        // ignore errors during clear
      }
    }
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }
  };

  const startSingleCamera = async (
    camIdOrConfig: string | { facingMode: string },
    isMounted: () => boolean
  ) => {
    try {
      setLoading(true);
      setErr('');

      // Clean any existing scanner stream first to guarantee exactly 1 active camera
      await stopAndCleanScanner();

      if (!isMounted()) return;

      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');
      if (!isMounted()) return;

      const scanner = new Html5Qrcode(containerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
        verbose: false,
      });
      scannerRef.current = scanner;

      await scanner.start(
        camIdOrConfig,
        {
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            return {
              width: Math.min(320, Math.max(220, Math.floor(minEdge * 0.85))),
              height: Math.min(180, Math.max(120, Math.floor(minEdge * 0.55))),
            };
          },
          aspectRatio: 1.333333,
        },
        (decodedText: string) => {
          if (!scannedRef.current) {
            scannedRef.current = true;
            playBeep();
            setScannedCode(decodedText);
            setTimeout(() => {
              onCode(decodedText);
            }, 300);
          }
        },
        () => {} // silent on frames without a barcode
      );

      if (isMounted()) {
        setLoading(false);
      }
    } catch (e: any) {
      if (isMounted()) {
        setLoading(false);
        const msg = e?.message || String(e);
        if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
          setErr('Camera permission denied. Please allow camera access in browser site settings.');
        } else if (msg.includes('NotFound') || msg.includes('Overconstrained')) {
          setErr('Camera not found or unavailable. Ensure your webcam is connected.');
        } else {
          setErr('Could not open camera stream. Please check camera connection or permissions.');
        }
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;

    (async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!mounted) return;

        // Query available camera devices on the system
        let deviceList: CameraDevice[] = [];
        try {
          deviceList = await Html5Qrcode.getCameras();
        } catch {
          deviceList = [];
        }

        if (!mounted) return;

        // If no camera was enumerated, fallback directly to environment or standard webcam
        if (!deviceList || deviceList.length === 0) {
          await startSingleCamera({ facingMode: 'environment' }, isMounted);
          return;
        }

        setCameras(deviceList);

        // Pick STRICTLY 1 camera: prefer rear/back camera on phones/tablets, or camera 0 on desktop/laptop
        const preferredIndex = deviceList.findIndex((c) =>
          /back|rear|environment|world/i.test(c.label)
        );
        const targetIndex = preferredIndex >= 0 ? preferredIndex : 0;
        setActiveCamIndex(targetIndex);

        // Start only that single chosen camera
        await startSingleCamera(deviceList[targetIndex].id, isMounted);
      } catch (err: any) {
        if (mounted) {
          setLoading(false);
          setErr('Camera initialization error: ' + (err?.message || err));
        }
      }
    })();

    return () => {
      mounted = false;
      stopAndCleanScanner();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSwitchCamera = async () => {
    if (cameras.length <= 1) return;
    const nextIndex = (activeCamIndex + 1) % cameras.length;
    setActiveCamIndex(nextIndex);
    await startSingleCamera(cameras[nextIndex].id, () => true);
  };

  const currentCam = cameras[activeCamIndex];

  return (
    <div className="space-y-3.5">
      {/* Single Camera Video Box */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-950 border border-border/80 min-h-[240px] aspect-4/3 flex items-center justify-center shadow-inner">
        {/* The single container html5-qrcode attaches to */}
        <div id={containerId} className="w-full h-full flex items-center justify-center [&_video]:rounded-xl [&_video]:object-cover" />

        {/* Reticle Guide & Animated Laser Line */}
        {!loading && !err && !scannedCode && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
            <div className="w-[78%] h-[55%] rounded-xl border-2 border-primary/50 relative shadow-2xs">
              {/* Corner markers */}
              <div className="absolute -top-1 -left-1 size-3 border-t-2 border-l-2 border-primary" />
              <div className="absolute -top-1 -right-1 size-3 border-t-2 border-r-2 border-primary" />
              <div className="absolute -bottom-1 -left-1 size-3 border-b-2 border-l-2 border-primary" />
              <div className="absolute -bottom-1 -right-1 size-3 border-b-2 border-r-2 border-primary" />

              {/* Red laser scanning animation */}
              <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-0.5 bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-pulse" />
            </div>
          </div>
        )}

        {/* Loading Spinner Overlay */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 z-20 text-white gap-2.5">
            <Loader2 className="size-6 animate-spin text-primary" />
            <span className="text-xs font-semibold text-zinc-300">Starting single camera feed...</span>
          </div>
        )}

        {/* Scanned Success Confirmation Overlay */}
        {scannedCode && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/85 backdrop-blur-xs z-30 text-white gap-2 animate-fade-quick">
            <CheckCircle2 className="size-10 text-emerald-400 animate-bounce" />
            <span className="text-sm font-bold text-white">Barcode Recognized!</span>
            <span className="text-xs font-mono bg-black/40 px-3 py-1 rounded-full text-emerald-300 border border-emerald-500/40">
              {scannedCode}
            </span>
          </div>
        )}

        {/* Error Overlay */}
        {err && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/95 p-5 text-center z-20 text-destructive gap-2">
            <AlertCircle className="size-8 text-destructive" />
            <p className="text-xs font-semibold leading-relaxed max-w-xs">{err}</p>
          </div>
        )}
      </div>

      {/* Single Camera Status Bar */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
          <Camera className="size-3.5 text-primary shrink-0" />
          <span className="truncate text-[11px] font-medium">
            {cameras.length > 0
              ? currentCam?.label || `Camera ${activeCamIndex + 1}`
              : 'Single Active Camera Stream'}
          </span>
        </div>

        {/* Camera Switcher (Only visible when device has 2 or more cameras) */}
        {cameras.length > 1 && (
          <button
            type="button"
            onClick={handleSwitchCamera}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-[11px] transition-colors cursor-pointer shrink-0 border border-border/60"
          >
            <RefreshCw className={cn('size-3', loading && 'animate-spin')} />
            <span>Switch Camera ({activeCamIndex + 1}/{cameras.length})</span>
          </button>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground text-center">
        Align the barcode inside the guide box. The POS will automatically beep and add the item.
      </p>

      {/* Quick Test Barcodes for Instant Verification */}
      <div className="pt-2.5 border-t border-border/60 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Barcode className="size-3 text-primary" />
            <span>Quick Test Barcodes</span>
          </span>
          <span className="text-[10px] text-muted-foreground">Click to simulate scan</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {[
            { name: 'Pancit Canton', code: '4800016644818', price: '₱18.00' },
            { name: 'Nescafé 3-in-1', code: '4800361280017', price: '₱12.00' },
            { name: 'Coke Sakto', code: '4800049720015', price: '₱15.00' },
            { name: 'Cooking Oil', code: '4807770270014', price: '₱35.00' },
          ].map((sample) => (
            <button
              key={sample.code}
              type="button"
              onClick={() => {
                playBeep();
                setScannedCode(sample.code);
                setTimeout(() => onCode(sample.code), 250);
              }}
              className="p-2 rounded-xl bg-muted/40 hover:bg-primary/10 hover:border-primary/40 border border-border/60 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground group-hover:text-primary truncate">
                  {sample.name}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono shrink-0 ml-1">
                  {sample.price}
                </span>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground truncate">
                {sample.code}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CameraScanner({ onCode, onClose }: Props) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-5 sm:p-6">
        <DialogHeader className="space-y-1 pb-1">
          <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
            <Camera className="size-4 text-primary" />
            <span>POS Barcode Scanner</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Using your device camera to scan barcodes and QR codes.
          </DialogDescription>
        </DialogHeader>
        <Reader onCode={onCode} />
      </DialogContent>
    </Dialog>
  );
}
