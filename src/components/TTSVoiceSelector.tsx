
import React, { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TTSProviderSelector from "@/components/TTSProviderSelector";
import { TTSProviderType } from "@/services/tts/TTSFactory";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { PlayCircle, Save } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TTSVoice } from "@/services/tts/TTSProvider";

interface TTSVoiceSelectorProps {
  currentProvider: TTSProviderType;
  currentVoiceId: string | null;
  providers: TTSProviderType[];
  isLoading: boolean;
  onProviderChange: (provider: TTSProviderType) => void;
  onVoiceChange: (voiceId: string) => void;
  onPreviewVoice?: (text: string, voiceId: string) => Promise<void>;
  onSavePreference?: () => Promise<void>;
}

const PREVIEW_TEXT = "Hello, this is a preview of how my voice sounds. I hope you like it!";

const TTSVoiceSelector: React.FC<TTSVoiceSelectorProps> = ({
  currentProvider,
  currentVoiceId,
  providers,
  isLoading,
  onProviderChange,
  onVoiceChange,
  onPreviewVoice,
  onSavePreference
}) => {
  const [voices, setVoices] = useState<TTSVoice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [savingPreference, setSavingPreference] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setLoadingVoices(true);
        
        let providerVoices: TTSVoice[] = [];
        
        if (currentProvider === 'amazon-polly') {
          providerVoices = [
            { id: "Joanna", name: "Joanna", language: "en-US", gender: "female", provider: "amazon-polly" },
            { id: "Matthew", name: "Matthew", language: "en-US", gender: "male", provider: "amazon-polly" },
            { id: "Amy", name: "Amy", language: "en-GB", gender: "female", provider: "amazon-polly" },
            { id: "Brian", name: "Brian", language: "en-GB", gender: "male", provider: "amazon-polly" },
            { id: "Kimberly", name: "Kimberly", language: "en-US", gender: "female", provider: "amazon-polly" },
            { id: "Justin", name: "Justin", language: "en-US", gender: "male", provider: "amazon-polly" },
            { id: "Ruth", name: "Ruth", language: "en-US", gender: "female", provider: "amazon-polly" },
            { id: "Kevin", name: "Kevin", language: "en-US", gender: "male", provider: "amazon-polly" }
          ];
        } else if (currentProvider === 'elevenlabs') {
          providerVoices = [
            { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", language: "en-US", gender: "female", provider: "elevenlabs" },
            { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi", language: "en-US", gender: "female", provider: "elevenlabs" },
            { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", language: "en-US", gender: "female", provider: "elevenlabs" },
            { id: "ErXwobaYiN019PkySvjV", name: "Antoni", language: "en-US", gender: "male", provider: "elevenlabs" }
          ];
        }
        
        setVoices(providerVoices);
        
        // Set a default voice if none is selected
        if (!currentVoiceId && providerVoices.length > 0) {
          onVoiceChange(providerVoices[0].id);
        }
      } catch (error) {
        console.error("Error fetching voices:", error);
        toast({
          title: "Error",
          description: "Failed to load available voices",
          variant: "destructive",
        });
      } finally {
        setLoadingVoices(false);
      }
    };

    fetchVoices();
  }, [currentProvider, currentVoiceId, onVoiceChange, toast]);

  const handleVoiceChange = (voiceId: string) => {
    onVoiceChange(voiceId);
  };

  const handlePreviewVoice = async () => {
    if (!currentVoiceId || !onPreviewVoice) return;
    
    try {
      setPreviewingVoice(currentVoiceId);
      await onPreviewVoice(PREVIEW_TEXT, currentVoiceId);
    } catch (error) {
      console.error("Error previewing voice:", error);
      toast({
        title: "Error",
        description: "Failed to preview voice",
        variant: "destructive",
      });
    } finally {
      setPreviewingVoice(null);
    }
  };

  const handleSavePreference = async () => {
    if (!onSavePreference) return;
    
    try {
      setSavingPreference(true);
      await onSavePreference();
      toast({
        title: "Success",
        description: "Voice preference saved successfully",
      });
    } catch (error) {
      console.error("Error saving preference:", error);
      toast({
        title: "Error",
        description: "Failed to save voice preference",
        variant: "destructive",
      });
    } finally {
      setSavingPreference(false);
    }
  };

  return (
    <div className="space-y-6">
      <TTSProviderSelector
        currentProvider={currentProvider}
        providers={providers}
        isLoading={isLoading || loadingVoices}
        onProviderChange={onProviderChange}
      />
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Select Voice</h3>
          {loadingVoices ? (
            <div className="flex items-center justify-center h-20">
              <LoadingSpinner className="h-6 w-6" />
            </div>
          ) : (
            <RadioGroup
              value={currentVoiceId || ""}
              onValueChange={handleVoiceChange}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {voices.map((voice) => (
                <div key={voice.id} className="flex items-center space-x-2 border p-3 rounded-md">
                  <RadioGroupItem
                    value={voice.id}
                    id={voice.id}
                    disabled={isLoading}
                  />
                  <Label htmlFor={voice.id} className="flex-1 cursor-pointer">
                    <div className="font-medium">{voice.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {voice.language} • {voice.gender === 'male' ? 'Male' : 'Female'}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
        
        <div className="flex space-x-3">
          {onPreviewVoice && (
            <Button
              variant="outline"
              onClick={handlePreviewVoice}
              disabled={!currentVoiceId || isLoading || previewingVoice !== null}
              className="flex-1"
            >
              {previewingVoice ? (
                <LoadingSpinner className="mr-2 h-4 w-4" />
              ) : (
                <PlayCircle className="mr-2 h-4 w-4" />
              )}
              Preview Voice
            </Button>
          )}
          
          {onSavePreference && (
            <Button
              onClick={handleSavePreference}
              disabled={!currentVoiceId || isLoading || savingPreference}
              className="flex-1"
            >
              {savingPreference ? (
                <LoadingSpinner className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Preference
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TTSVoiceSelector;
