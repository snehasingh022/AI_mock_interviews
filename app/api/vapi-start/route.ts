import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { workflowId, variableValues } = await req.json();

    const res = await fetch('https://api.vapi.ai/call/web', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.VAPI_SECRET_KEY}`, // server key
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        variable_values: variableValues,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      return NextResponse.json({ success: false, error: result.error || 'Unknown error' }, { status: res.status });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
