import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { blobId: string } }
) {
  const blobId = params.blobId;
  
  try {
    // Get the backend URL from environment variables
    const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    // Forward the request to the backend storage endpoint
    const response = await fetch(`${baseURL}/api/storage/retrieve/${blobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          content: '',
          success: false,
          error: 'Failed to fetch storage content',
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
    console.error('Error fetching storage content:', error);
    
    return new Response(
      JSON.stringify({ 
        content: '',
        success: false,
        error: 'Internal server error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
