// c_english/react-native-voice.d.ts
// Only create this file if official types are insufficient or missing.
// Refer to the @react-native-voice/voice documentation for accurate event types.

declare module '@react-native-voice/voice' {
  export interface SpeechStartEvent {
    error?: boolean;
  }
  export interface SpeechRecognizedEvent {
    isFinal?: boolean;
  }
  export interface SpeechEndEvent {
    error?: boolean;
  }
  export interface SpeechErrorEvent {
    error?: {
      code?: string; // Or number, check library docs
      message?: string;
    };
  }
  export interface SpeechResultsEvent {
    value?: string[];
  }
  export interface SpeechVolumeChangeEvent {
    value?: number; // Usually a float representing volume
  }

  type SpeechEventName =
    | 'onSpeechStart'
    | 'onSpeechRecognized'
    | 'onSpeechEnd'
    | 'onSpeechError'
    | 'onSpeechResults'
    | 'onSpeechPartialResults'
    | 'onSpeechVolumeChanged';

  interface Voice {
    onSpeechStart: (event: SpeechStartEvent) => void;
    onSpeechRecognized: (event: SpeechRecognizedEvent) => void;
    onSpeechEnd: (event: SpeechEndEvent) => void;
    onSpeechError: (event: SpeechErrorEvent) => void;
    onSpeechResults: (event: SpeechResultsEvent) => void;
    onSpeechPartialResults: (event: SpeechResultsEvent) => void;
    onSpeechVolumeChanged: (event: SpeechVolumeChangeEvent) => void;

    isAvailable(): Promise<boolean>;
    start(locale?: string, options?: Record<string, any>): Promise<void>;
    stop(): Promise<void>;
    cancel(): Promise<void>;
    destroy(): Promise<void>;
    removeAllListeners(eventName?: SpeechEventName): void;
    isRecognizing(): Promise<boolean>;
    getSpeechRecognitionServices?(): Promise<string[]>; // Android only
  }

  const Voice: Voice;
  export default Voice;
}
