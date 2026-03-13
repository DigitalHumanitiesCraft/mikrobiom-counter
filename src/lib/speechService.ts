export interface SpeechCallbacks {
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

export function isSpeechAvailable(): boolean {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export function createRecognition(callbacks: SpeechCallbacks): SpeechRecognition | null {
  const SpeechRecognitionClass =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognitionClass) return null;

  const recognition = new SpeechRecognitionClass();
  recognition.lang = 'de-AT';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 3;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += result[0].transcript;
      } else {
        interimTranscript += result[0].transcript;
      }
    }

    if (finalTranscript) {
      callbacks.onFinal(finalTranscript);
    } else if (interimTranscript) {
      callbacks.onInterim(interimTranscript);
    }
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    switch (event.error) {
      case 'not-allowed':
        callbacks.onError('Mikrofon-Zugriff verweigert. Bitte erlaube den Zugriff in den Browser-Einstellungen.');
        break;
      case 'network':
        callbacks.onError('Keine Internetverbindung. Spracheingabe benötigt Internet. Bitte nutze die manuelle Eingabe.');
        break;
      case 'no-speech':
        callbacks.onError('Nichts erkannt. Bitte nochmal versuchen.');
        break;
      case 'aborted':
        // User cancelled, no error message needed
        break;
      default:
        callbacks.onError(`Spracherkennungsfehler: ${event.error}`);
    }
  };

  recognition.onend = () => {
    callbacks.onEnd();
  };

  return recognition;
}

