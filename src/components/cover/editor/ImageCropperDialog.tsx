
import ImageCropper from "@/components/ImageCropper";

interface ImageCropperDialogProps {
  imageUrl: string | null;
  open: boolean;
  onComplete: (blob: Blob) => Promise<void>;
  onCancel: () => void;
}

const ImageCropperDialog = ({
  imageUrl,
  open,
  onComplete,
  onCancel,
}: ImageCropperDialogProps) => {
  if (!imageUrl) return null;
  
  return (
    <ImageCropper
      imageUrl={imageUrl}
      onCropComplete={onComplete}
      onCancel={onCancel}
      open={open}
    />
  );
};

export default ImageCropperDialog;
