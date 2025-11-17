// Google Cloud Speech-to-Text service
// Uses the REST API for browser-based speech recognition

const GOOGLE_SPEECH_API_KEY = import.meta.env.VITE_GOOGLE_SPEECH_API_KEY;
const GOOGLE_SPEECH_API_URL = 'https://speech.googleapis.com/v1/speech:recognize';

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

export const recognizeSpeech = async (
  audioBlob: Blob,
  languageCode: string = 'en-US'
): Promise<SpeechRecognitionResult> => {
  if (!GOOGLE_SPEECH_API_KEY) {
    throw new Error('Google Speech API key not configured. Please set VITE_GOOGLE_SPEECH_API_KEY in .env file');
  }

  // Convert blob to base64
  const base64Audio = await blobToBase64(audioBlob);

  const requestBody = {
    config: {
      encoding: 'WEBM_OPUS', // or 'WEBM_OPUS' for web audio
      sampleRateHertz: 48000,
      languageCode: languageCode,
      alternativeLanguageCodes: ['it-IT', 'en-US'], // Support both Italian and English
    },
    audio: {
      content: base64Audio,
    },
  };

  try {
    const response = await fetch(
      `${GOOGLE_SPEECH_API_URL}?key=${GOOGLE_SPEECH_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Speech recognition failed');
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error('No speech detected');
    }

    const result = data.results[0];
    const alternative = result.alternatives[0];

    return {
      transcript: alternative.transcript,
      confidence: alternative.confidence || 0,
    };
  } catch (error: any) {
    throw new Error(`Speech recognition error: ${error.message}`);
  }
};

// Helper: Convert Blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Browser-native Web Speech API (fallback if Google API fails)
export const recognizeSpeechNative = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      reject(new Error('Speech recognition not supported in this browser'));
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };

    recognition.onerror = (event: any) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.onend = () => {
      // Recognition ended without result
      reject(new Error('No speech detected'));
    };

    recognition.start();
  });
};

// Parse expense from speech transcript
// Examples:
// "Spent 25 euros on groceries"
// "25 euros groceries"
// "Spent 25 on groceries"
export const parseExpenseFromSpeech = (
  transcript: string
): { amount: number; category: string; description: string } | null => {
  const lowerTranscript = transcript.toLowerCase().trim();

  // Extract amount (look for numbers followed by "euro" or "eur" or just numbers)
  const amountMatch = lowerTranscript.match(/(\d+(?:[.,]\d{2})?)\s*(?:euro|eur|€|euros)?/i);
  if (!amountMatch) {
    return null;
  }

  const amount = parseFloat(amountMatch[1].replace(',', '.'));

  // Extract category keywords
  const categoryKeywords: { [key: string]: string } = {
    groceries: 'groceries',
    grocery: 'groceries',
    food: 'groceries',
    supermarket: 'groceries',
    bills: 'bills',
    bill: 'bills',
    utility: 'bills',
    transport: 'transport',
    transportation: 'transport',
    taxi: 'transport',
    uber: 'transport',
    home: 'home',
    house: 'home',
    extra: 'extra',
    other: 'extra',
  };

  let category = 'extra';
  for (const [keyword, cat] of Object.entries(categoryKeywords)) {
    if (lowerTranscript.includes(keyword)) {
      category = cat;
      break;
    }
  }

  // Extract description (everything after amount)
  const descriptionMatch = lowerTranscript.match(/(?:spent|paid|for|on)\s+(.+)/i);
  const description = descriptionMatch
    ? descriptionMatch[1].trim()
    : lowerTranscript.replace(amountMatch[0], '').trim() || 'Expense';

  return {
    amount,
    category: category as any,
    description: description.charAt(0).toUpperCase() + description.slice(1),
  };
};

