'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    // Setup event listeners for vapi events if you use the vapi SDK instance in the frontend (optional)
    // Omitted here because vapi instance is used server side for start()

    // You can implement this part if you use vapi client SDK for streaming events
  }, []);

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) router.push('/');
  }, [callStatus, router]);

  const handleCall = async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);
      const workflowId = "4e681bd6-fc85-4f71-b036-1d33adac9723";

      const res = await fetch('/api/vapi-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId, variableValues: { username: userName, userid: userId } }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.error);

      console.log('✅ Workflow started successfully', data.result);
      setCallStatus(CallStatus.ACTIVE);
    } catch (error) {
      console.error('❌ Error starting workflow:', error);
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    // You may want to call vapi.stop() here if using vapi frontend SDK instance
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
