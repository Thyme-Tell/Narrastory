
import ImageCropper from "@/components/ImageCropper";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageCropperDialogProps {
  imageUrl: string | null;
  open: boolean;
  onComplete: (blob: Blob) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ImageCropperDialog = ({
  imageUrl,
  open,
  onComplete,
  onCancel,
  isLoading = false,
}: ImageCropperDialogProps) => {
  if (isLoading) {
    return <Skeleton className="w-full h-[400px]" />;
  }
  
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
