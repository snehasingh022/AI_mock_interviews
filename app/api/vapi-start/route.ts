import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { workflowId, variableValues } = await request.json();

    if (!workflowId) {
      return NextResponse.json(
        { success: false, error: 'Missing workflowId' },
        { status: 400 }
      );
    }

    console.log('📞 Starting workflow:', workflowId);
    console.log('📦 Variable values:', variableValues);

    const vapiResponse = await fetch('https://api.vapi.ai/call/web', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.VAPI_SECRET_KEY}`, // must be secret key
      },
      body: JSON.stringify({
        workflow: {
          id: workflowId,
          variables: variableValues,
        },
      }),
    });

    const data = await vapiResponse.json();

    if (!vapiResponse.ok) {
      console.error('❌ Vapi API Error:', data);
      return NextResponse.json(
        { success: false, error: data?.error || 'Vapi API call failed' },
        { status: vapiResponse.status }
      );
    }

    return NextResponse.json({ success: true, result: data }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Internal Server Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}
