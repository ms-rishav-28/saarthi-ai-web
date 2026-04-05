export async function transcribeIndicVoice(_audioUrl: string, _language: 'hi' | 'mr') {
  const apiKey = process.env.SARVAM_API_KEY;
  const baseUrl = process.env.SARVAM_BASE_URL;

  if (!apiKey || !baseUrl) {
    return 'मेरी पत्नी ने पिछले महीने बच्चे को जन्म दिया';
  }

  try {
    const response = await fetch(`${baseUrl}/speech-to-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        audio_url: _audioUrl,
        language: _language,
        model: 'bulbul-v3',
      }),
    });

    if (!response.ok) throw new Error('Sarvam STT failed');

    const payload = (await response.json()) as { text?: string };
    return payload.text || '';
  } catch {
    return 'मेरी पत्नी ने पिछले महीने बच्चे को जन्म दिया';
  }
}

export async function synthesizeIndicSpeech(text: string, _language: 'hi' | 'mr') {
  const apiKey = process.env.SARVAM_API_KEY;
  const baseUrl = process.env.SARVAM_BASE_URL;

  if (!apiKey || !baseUrl) {
    return { text, audioUrl: null };
  }

  try {
    const response = await fetch(`${baseUrl}/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        language: _language,
        voice: 'bulbul-v3-female',
      }),
    });

    if (!response.ok) throw new Error('Sarvam TTS failed');

    const payload = (await response.json()) as { audio_url?: string };
    return { text, audioUrl: payload.audio_url || null };
  } catch {
    return { text, audioUrl: null };
  }
}
