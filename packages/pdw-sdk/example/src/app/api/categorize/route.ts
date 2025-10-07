import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { text, categories } = await request.json();

    if (!text || !categories) {
      return NextResponse.json(
        { error: 'Missing required fields: text, categories' },
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

    // Use Gemini to categorize the content
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Analyze the following text and categorize it into ONE of these categories: ${categories.join(', ')}.

Text: "${text}"

Respond with ONLY the category name, nothing else. Choose the most appropriate category.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const categoryText = response.text().trim().toLowerCase();

    // Validate that the returned category is in the list
    const validCategory = categories.find((cat: string) =>
      categoryText.includes(cat.toLowerCase())
    );

    return NextResponse.json({
      category: validCategory || 'personal', // fallback to personal
      originalResponse: categoryText,
    });
  } catch (error: any) {
    console.error('Categorization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to categorize content' },
      { status: 500 }
    );
  }
}
