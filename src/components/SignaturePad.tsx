import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Undo, Trash2, Check } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  onCancel?: () => void;
  width?: number;
  height?: number;
}

export function SignaturePad({ onSave, onCancel, width = 500, height = 200 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [strokes, setStrokes] = useState<ImageData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save current state for undo
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setStrokes(prev => [...prev, currentState]);

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.closePath();
      }
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
        setStrokes([]);
      }
    }
  };

  const undo = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previousState = strokes[strokes.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setStrokes(prev => prev.slice(0, -1));
    
    if (strokes.length === 1) {
      setHasSignature(false);
    }
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const signatureData = canvas.toDataURL('image/png');
    onSave(signatureData);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair touch-none"
          style={{ width: '100%', height: 'auto' }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={strokes.length === 0}
          >
            <Undo className="w-4 h-4 mr-1" />
            Kumoa
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clear}
            disabled={!hasSignature}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Tyhjennä
          </Button>
        </div>
        
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Peruuta
            </Button>
          )}
          <Button
            size="sm"
            onClick={save}
            disabled={!hasSignature}
            className="bg-gradient-to-r from-[#0066b3] to-[#00a8b3]"
          >
            <Check className="w-4 h-4 mr-1" />
            Käytä allekirjoitusta
          </Button>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 text-center">
        Piirrä allekirjoitus hiirellä tai kosketusnäytöllä
      </p>
    </div>
  );
}
