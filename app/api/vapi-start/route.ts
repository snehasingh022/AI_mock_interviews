import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { workflowId, variableValues } = await req.json();

    if (!workflowId) {
      return NextResponse.json({ success: false, error: 'Missing workflowId' }, { status: 400 });
    }

    const res = await fetch('https://api.vapi.ai/call/web', {
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

    const result = await res.json();

    if (!res.ok) {
      return NextResponse.json({ success: false, error: result.message || 'Unknown error' }, { status: res.status });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
