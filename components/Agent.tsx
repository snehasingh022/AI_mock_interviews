'use client';
import React, { useEffect, useState } from 'react';
import VapiClient from '@vapi-ai/web';
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
  role: string;
  text: string;
}

interface AgentProps {
  userName: string;
  userId: string;
}

const Agent = ({ userName, userId }: AgentProps) => {
  const router = useRouter();
  const [vapi, setVapi] = useState<any | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);

  const publicKey = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN || '';
  const assistantId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID || '';

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) router.push('/');
  }, [callStatus, router]);

  useEffect(() => {
    const vapiInstance = new VapiClient(publicKey);
    setVapi(vapiInstance);

    vapiInstance.on('call-start', () => {
      setCallStatus(CallStatus.ACTIVE);
    });

    vapiInstance.on('call-end', () => {
      setCallStatus(CallStatus.FINISHED);
      setIsSpeaking(false);
    });

    vapiInstance.on('speech-start', () => {
      setIsSpeaking(true);
    });

    vapiInstance.on('speech-end', () => {
      setIsSpeaking(false);
    });

    vapiInstance.on('message', (message: any) => {
      if (message.type === 'transcript') {
        setMessages(prev => [...prev, { role: message.role, text: message.transcript }]);
      }
    });

    vapiInstance.on('error', (err: any) => {
      setMessages(prev => [...prev, { role: 'system', text: 'Vapi error: ' + err.message }]);
    });

    return () => {
      vapiInstance.stop();
    };
  }, [publicKey]);

  const startCall = () => {
    if (vapi) {
      vapi.start(assistantId);
    }
  };

  const endCall = () => {
    if (vapi) {
      vapi.stop();
    }
  };

  const latestMessage = messages[messages.length - 1]?.text;
  const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

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
            <p className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}>
              {latestMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {!callStatus || callStatus !== CallStatus.ACTIVE ? (
          <button className="relative btn-call" onClick={startCall}>
            <span className={cn('absolute animate-ping rounded-full opacity-75', callStatus !== CallStatus.CONNECTING && 'hidden')} />
            <span>{isCallInactiveOrFinished ? 'Call' : '...'}</span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={endCall}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
