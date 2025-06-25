import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { workflowId, variableValues } = await request.json();

    if (!workflowId) {
      return NextResponse.json({ success: false, error: 'Missing workflowId' }, { status: 400 });
    }

    console.log('📞 Starting workflow:', workflowId);
    console.log('📦 Variable values:', variableValues);

    const response = await fetch('https://api.vapi.ai/call/web', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.VAPI_SECRET_KEY}`, // Make sure this is set
      },
      body: JSON.stringify({
        workflow: {
          id: workflowId,
          variables: variableValues,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Vapi API Error:', data);
      return NextResponse.json({ success: false, error: data.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, result: data }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Internal Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

