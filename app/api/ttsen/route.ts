// /app/api/tts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// --- (MODIFIED) Decode credentials from a single Base64 environment variable ---
const encodedCredentials = process.env.GOOGLE_CREDENTIALS_BASE64;

if (!encodedCredentials) {
  throw new Error('GOOGLE_CREDENTIALS_BASE64 environment variable not set.');
}

const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
const credentials = JSON.parse(decodedCredentials);

const client = new TextToSpeechClient({ credentials });
// --- End of modification ---

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: {
  languageCode: 'en-US',
  name: 'en-US-Wavenet-F',
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    });

    if (!response.audioContent) {
      return NextResponse.json({ error: 'No audio content returned' }, { status: 500 });
    }

    const buffer = Buffer.from(response.audioContent as Uint8Array);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (err) {
    console.error('Google TTS error:', err);
    // Provide a more specific error message back to the client if needed
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}