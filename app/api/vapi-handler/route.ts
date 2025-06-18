// app/api/vapi-handler/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  console.log('✅ Vapi Webhook Event:', body);

  // Optional: Handle events
  switch (body.type) {
    case 'call-start':
      console.log('📞 Call Started:', body.callId);
      break;
    case 'call-end':
      console.log('🛑 Call Ended:', body.callId);
      break;
    default:
      console.log('ℹ️ Other Event:', body.type);
  }

  return NextResponse.json({ received: true });
}

export function GET() {
  return NextResponse.json({ message: 'Vapi handler is live!' });
}
