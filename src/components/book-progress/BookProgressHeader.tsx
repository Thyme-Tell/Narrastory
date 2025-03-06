
import { X } from "lucide-react";

interface BookProgressHeaderProps {
  setIsHidden: (isHidden: boolean) => void;
}

const BookProgressHeader = ({ setIsHidden }: BookProgressHeaderProps) => {
  return (
    <div className="mb-6 rounded-lg bg-white/50 shadow-sm relative overflow-hidden">
      <button 
        onClick={() => setIsHidden(true)}
        className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-white/50 text-atlantic/70 hover:text-atlantic z-10"
      >
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </button>
      <div className="flex flex-col">
        <img
          src="https://pohnhzxqorelllbfnqyj.supabase.co/storage/v1/object/public/assets/book-image.png?t=2025-01-27T11%3A42%3A27.791Z"
          alt="Book illustration"
          className="w-full h-32 object-cover"
        />
        <div className="p-6">
          <h2 className="text-xl font-semibold text-atlantic mb-2 text-left">Share your first story</h2>
          <p className="text-atlantic mb-4 text-left">
            Call <a href="tel:+15072003303" className="text-[#A33D29] hover:underline">+1 (507) 200-3303</a><br />
            One phone call, one memory at a time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookProgressHeader;
