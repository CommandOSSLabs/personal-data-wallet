import { NextRequest, NextResponse } from 'next/server';
import { EmbeddingService } from 'personal-data-wallet-sdk/dist/services/EmbeddingService';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Missing required field: text' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Use SDK's EmbeddingService (same as test)
    const embeddingService = new EmbeddingService({
      apiKey: apiKey,
      model: 'text-embedding-004'
    });

    // Generate embedding
    const result = await embeddingService.embedText({
      text,
      type: 'content'
    });

    return NextResponse.json({
      embedding: result.vector,
      dimensions: result.dimension,
      model: result.model,
      processingTime: result.processingTime,
    });
  } catch (error: any) {
    console.error('Embedding error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate embedding' },
      { status: 500 }
    );
  }
}
