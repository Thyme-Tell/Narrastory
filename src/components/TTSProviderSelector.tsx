
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TTSProviderType } from "@/services/tts/TTSFactory";
import { TTSVoice } from "@/services/tts/TTSProvider";

interface TTSProviderSelectorProps {
  currentProvider: TTSProviderType | null;
  providers: TTSProviderType[];
  voices: TTSVoice[];
  currentVoiceId: string | null;
  isLoading: boolean;
  onProviderChange: (provider: TTSProviderType) => void;
  onVoiceChange: (voiceId: string) => void;
}

const TTSProviderSelector: React.FC<TTSProviderSelectorProps> = ({
  currentProvider,
  providers,
  voices,
  currentVoiceId,
  isLoading,
  onProviderChange,
  onVoiceChange,
}) => {
  const handleProviderChange = (value: string) => {
    onProviderChange(value as TTSProviderType);
  };

  const handleVoiceChange = (value: string) => {
    onVoiceChange(value);
  };

  const formatProviderName = (provider: string) => {
    return provider
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/2">
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

        <div className="w-full sm:w-1/2">
          <label className="text-sm font-medium mb-2 block">Voice</label>
          <Select
            value={currentVoiceId || undefined}
            onValueChange={handleVoiceChange}
            disabled={isLoading || !currentProvider || voices.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name} ({voice.language})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default TTSProviderSelector;
