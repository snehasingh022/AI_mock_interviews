import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { workflowId, variableValues } = await req.json();

    console.log('🔄 Proxying Vapi request with:', {
      workflowId,
      variableValues,
    });

    const vapiResponse = await fetch('https://api.vapi.ai/call/web', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.VAPI_SECRET_KEY}`,
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        variable_values: variableValues,
      }),
    });

    const result = await vapiResponse.json();

    console.log('✅ Vapi API responded with:', result);

    const response = NextResponse.json(
      vapiResponse.ok
        ? { success: true, result }
        : { success: false, error: result.error || 'Unknown error' },
      { status: vapiResponse.status }
    );

    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  } catch (error: any) {
    console.error('❌ Proxy error calling Vapi:', error);

    const response = NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });

    // CORS headers on error too
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  }
}

// Optional: Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
