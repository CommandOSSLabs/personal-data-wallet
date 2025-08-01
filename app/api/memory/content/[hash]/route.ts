import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { hash: string } }
) {
  const hash = params.hash;
  
  try {
    // Get the backend URL from environment variables
    const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    // Forward the request to the backend
    const response = await fetch(`${baseURL}/memory/content/${hash}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch memory content',
          status: response.status
        }),
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const data = await response.json();
    
    return new Response(
      JSON.stringify(data),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching memory content:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}