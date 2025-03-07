
import { useState, useRef, useEffect } from "react";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (croppedBlob: Blob) => Promise<void>;
  onCancel: () => void;
  open: boolean;
}

const ImageCropper = ({ imageUrl, onCropComplete, onCancel, open }: ImageCropperProps) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [imgLoaded, setImgLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset state when a new image is loaded
  useEffect(() => {
    if (open) {
      setImgLoaded(false);
    }
  }, [open, imageUrl]);

  const getCroppedImg = async () => {
    try {
      if (!imageRef.current) return null;
      if (!crop.width || !crop.height) return null;

      const image = imageRef.current;
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      canvas.width = crop.width * scaleX;
      canvas.height = crop.height * scaleY;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      );

      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/jpeg',
          1
        );
      });
    } catch (error) {
      console.error('Error creating cropped image:', error);
      return null;
    }
  };

  const handleCropComplete = async () => {
    try {
      const croppedBlob = await getCroppedImg();
      if (croppedBlob) {
        await onCropComplete(croppedBlob);
      }
    } catch (error) {
      console.error('Error in crop completion:', error);
    }
  };

  const handleImageLoad = () => {
    if (imageRef.current) {
      imageRef.current.crossOrigin = "anonymous";
      setImgLoaded(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-[90vw] w-fit p-6 [&>button]:hidden">
        <DialogTitle className="sr-only">Crop Image</DialogTitle>
        <div className="space-y-4">
          {imageUrl && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
            >
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Crop preview"
                className="max-h-[70vh] object-contain"
                crossOrigin="anonymous"
                onLoad={handleImageLoad}
              />
            </ReactCrop>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleCropComplete}
              disabled={!imgLoaded}
            >
              Apply Crop
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;
