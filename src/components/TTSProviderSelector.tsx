
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TTSProviderType } from "@/services/tts/TTSFactory";

interface TTSProviderSelectorProps {
  currentProvider: TTSProviderType | null;
  providers: TTSProviderType[];
  isLoading: boolean;
  onProviderChange: (provider: TTSProviderType) => void;
}

const TTSProviderSelector: React.FC<TTSProviderSelectorProps> = ({
  currentProvider,
  providers,
  isLoading,
  onProviderChange,
}) => {
  const handleProviderChange = (value: string) => {
    onProviderChange(value as TTSProviderType);
  };

  const formatProviderName = (provider: string) => {
    return provider
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-4">
      <div className="w-full">
        <label className="text-sm font-medium mb-2 block">TTS Provider</label>
        <Select
          value={currentProvider || undefined}
          onValueChange={handleProviderChange}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select TTS provider" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((provider) => (
              <SelectItem key={provider} value={provider}>
                {formatProviderName(provider)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TTSProviderSelector;
