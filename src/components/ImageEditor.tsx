import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas as FabricCanvas, FabricImage } from 'fabric';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCw, RotateCcw, Crop, Check, X, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

const ImageEditor = ({ imageUrl, onSave, onCancel }: ImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [fabricImage, setFabricImage] = useState<FabricImage | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const [cropRect, setCropRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const canvasSize = Math.min(containerWidth, 400);

    const canvas = new FabricCanvas(canvasRef.current, {
      width: canvasSize,
      height: canvasSize,
      backgroundColor: '#f3f4f6',
      selection: false,
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Load image
  useEffect(() => {
    if (!fabricCanvas) return;

    FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
      const canvasWidth = fabricCanvas.width!;
      const canvasHeight = fabricCanvas.height!;

      // Scale image to fit canvas
      const scale = Math.min(
        (canvasWidth * 0.9) / img.width!,
        (canvasHeight * 0.9) / img.height!
      );

      img.scale(scale);
      img.set({
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      });

      fabricCanvas.clear();
      fabricCanvas.add(img);
      fabricCanvas.renderAll();
      setFabricImage(img);
    });
  }, [fabricCanvas, imageUrl]);

  // Rotate image
  const handleRotate = useCallback((degrees: number) => {
    if (!fabricImage || !fabricCanvas) return;
    
    const newRotation = rotation + degrees;
    setRotation(newRotation);
    fabricImage.rotate(newRotation);
    fabricCanvas.renderAll();
  }, [fabricCanvas, fabricImage, rotation]);

  // Flip image
  const handleFlipHorizontal = useCallback(() => {
    if (!fabricImage || !fabricCanvas) return;
    fabricImage.set('flipX', !fabricImage.flipX);
    fabricCanvas.renderAll();
  }, [fabricCanvas, fabricImage]);

  const handleFlipVertical = useCallback(() => {
    if (!fabricImage || !fabricCanvas) return;
    fabricImage.set('flipY', !fabricImage.flipY);
    fabricCanvas.renderAll();
  }, [fabricCanvas, fabricImage]);

  // Zoom
  const handleZoom = useCallback((factor: number) => {
    if (!fabricImage || !fabricCanvas) return;
    const currentScale = fabricImage.scaleX || 1;
    const newScale = Math.max(0.1, Math.min(3, currentScale * factor));
    fabricImage.scale(newScale);
    fabricCanvas.renderAll();
  }, [fabricCanvas, fabricImage]);

  // Toggle crop mode
  const toggleCropMode = useCallback(() => {
    if (!fabricCanvas || !fabricImage) return;

    if (isCropping) {
      // Exit crop mode
      setIsCropping(false);
      setCropRect(null);
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
    } else {
      // Enter crop mode - create crop overlay
      setIsCropping(true);
      
      // Create a rectangle for crop selection
      const { Rect } = require('fabric');
      const canvasWidth = fabricCanvas.width!;
      const canvasHeight = fabricCanvas.height!;
      
      const cropSelection = new Rect({
        left: canvasWidth * 0.15,
        top: canvasHeight * 0.15,
        width: canvasWidth * 0.7,
        height: canvasHeight * 0.7,
        fill: 'transparent',
        stroke: '#3b82f6',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        cornerColor: '#3b82f6',
        cornerStrokeColor: '#fff',
        cornerSize: 12,
        transparentCorners: false,
        hasRotatingPoint: false,
        lockRotation: true,
      });

      fabricCanvas.add(cropSelection);
      fabricCanvas.setActiveObject(cropSelection);
      fabricCanvas.renderAll();

      cropSelection.on('modified', () => {
        setCropRect({
          left: cropSelection.left!,
          top: cropSelection.top!,
          width: cropSelection.width! * cropSelection.scaleX!,
          height: cropSelection.height! * cropSelection.scaleY!,
        });
      });

      setCropRect({
        left: cropSelection.left!,
        top: cropSelection.top!,
        width: cropSelection.width!,
        height: cropSelection.height!,
      });
    }
  }, [fabricCanvas, fabricImage, isCropping]);

  // Apply crop
  const applyCrop = useCallback(() => {
    if (!fabricCanvas || !cropRect) return;

    // Get the cropped area as data URL
    const dataUrl = fabricCanvas.toDataURL({
      left: cropRect.left,
      top: cropRect.top,
      width: cropRect.width,
      height: cropRect.height,
      format: 'jpeg',
      quality: 0.9,
      multiplier: 1,
    });

    // Load cropped image back
    FabricImage.fromURL(dataUrl, { crossOrigin: 'anonymous' }).then((img) => {
      const canvasWidth = fabricCanvas.width!;
      const canvasHeight = fabricCanvas.height!;

      const scale = Math.min(
        (canvasWidth * 0.9) / img.width!,
        (canvasHeight * 0.9) / img.height!
      );

      img.scale(scale);
      img.set({
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      });

      fabricCanvas.clear();
      fabricCanvas.add(img);
      fabricCanvas.renderAll();
      setFabricImage(img);
      setIsCropping(false);
      setCropRect(null);
      setRotation(0);
    });
  }, [fabricCanvas, cropRect]);

  // Save edited image
  const handleSave = useCallback(() => {
    if (!fabricCanvas) return;

    // Remove crop selection if present
    const objects = fabricCanvas.getObjects();
    const cropSelection = objects.find(obj => obj.stroke === '#3b82f6');
    if (cropSelection) {
      fabricCanvas.remove(cropSelection);
    }

    const dataUrl = fabricCanvas.toDataURL({
      format: 'jpeg',
      quality: 0.9,
      multiplier: 1,
    });

    onSave(dataUrl);
  }, [fabricCanvas, onSave]);

  return (
    <div className="space-y-4">
      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="flex items-center justify-center bg-muted rounded-lg overflow-hidden"
      >
        <canvas ref={canvasRef} />
      </div>

      {/* Rotation Slider */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Rotation: {rotation}°</Label>
        <Slider
          value={[rotation]}
          onValueChange={([value]) => {
            if (!fabricImage || !fabricCanvas) return;
            setRotation(value);
            fabricImage.rotate(value);
            fabricCanvas.renderAll();
          }}
          min={-180}
          max={180}
          step={1}
          className="w-full"
        />
      </div>

      {/* Tool Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleRotate(-90)}
          title="Rotate Left"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleRotate(90)}
          title="Rotate Right"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleFlipHorizontal}
          title="Flip Horizontal"
        >
          <FlipHorizontal className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleFlipVertical}
          title="Flip Vertical"
        >
          <FlipVertical className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleZoom(1.2)}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleZoom(0.8)}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={isCropping ? "default" : "outline"}
          size="sm"
          onClick={toggleCropMode}
          title="Crop"
        >
          <Crop className="h-4 w-4" />
        </Button>
      </div>

      {/* Crop Apply Button */}
      {isCropping && cropRect && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-full gap-2"
          onClick={applyCrop}
        >
          <Crop className="h-4 w-4" />
          Apply Crop
        </Button>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t">
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-2"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button
          type="button"
          className="flex-1 gap-2"
          onClick={handleSave}
        >
          <Check className="h-4 w-4" />
          Done
        </Button>
      </div>
    </div>
  );
};

export default ImageEditor;
