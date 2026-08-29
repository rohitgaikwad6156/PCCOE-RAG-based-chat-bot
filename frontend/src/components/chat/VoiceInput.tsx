import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useVoice } from '../../hooks/useVoice';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript }) => {
  const { isListening, isSupported, startListening, stopListening } = useVoice((finalText) => {
    if (finalText.trim()) {
      onTranscript(finalText);
    }
  });

  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={isListening ? stopListening : startListening}
      title={isListening ? 'Stop listening' : 'Speak your question'}
      className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
        isListening
          ? 'bg-rose-600 text-white animate-pulse-voice shadow-lg shadow-rose-600/40 ring-2 ring-rose-400'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  );
};
