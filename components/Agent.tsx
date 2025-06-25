'use client';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Vapi from '@vapi-ai/web';

enum CallStatus {
  INACTIVE = 'INACTIVE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

interface SavedMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

interface AgentProps {
  userName: string;
  userId: string;
  type: string;
}

const Agent = ({ userName, userId, type }: AgentProps) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const vapiRef = useRef<any>(null);

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) router.push('/');
  }, [callStatus, router]);

  const handleCall = async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);

      // Call your backend to start workflow (optional if using assistant directly)
      await fetch('/api/vapi-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!,
          variableValues: {
            userid: userId,
            username: userName,
          },
        }),
      });

      // Start Vapi assistant voice call
      const vapi = new Vapi({
        apiKey: process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!,
      });
      vapiRef.current = vapi;

      vapi.start({
        agentId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!,
        customer: {
          name: userName,
        },
        variables: {
          userid: userId,
          username: userName,
        },
      });

      // Listen for function calls from assistant
      vapi.on('function-call', async (fnCall: { name: string; args: { userid: string } }) => {
        if (fnCall.name === 'getInterviewQuestions') {
          const res = await fetch(`/api/get-questions?userid=${fnCall.args.userid}`);
          const data = await res.json();
          vapiRef.current.functionCallResult(fnCall.name, data);
        }
      });

      // Listen for assistant messages
      vapi.on('message', (message: { content: string }) => {
        setMessages((prev) => [...prev, { role: 'assistant', content: message.content }]);
        setIsSpeaking(true);
        setTimeout(() => setIsSpeaking(false), 1500);
      });

      setCallStatus(CallStatus.ACTIVE);
    } catch (error) {
      console.error('❌ Error starting voice call:', error);
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
    setCallStatus(CallStatus.FINISHED);
  };

  const latestMessage = messages[messages.length - 1]?.content;
  const isCallInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image src="/ai-avatar.png" alt="vapi" width={65} height={54} className="object-cover" />
            {isSpeaking && <span className="animate-speak"></span>}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="user avatar"
              width={120}
              height={120}
              className="rounded-full object-cover"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={latestMessage}
              className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}
            >
              {latestMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== CallStatus.ACTIVE ? (
          <button className="relative btn-call" onClick={handleCall}>
            <span
              className={cn(
                'absolute animate-ping rounded-full opacity-75',
                callStatus !== CallStatus.CONNECTING && 'hidden'
              )}
            />
            <span>{isCallInactiveOrFinished ? 'Call' : '...'}</span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
