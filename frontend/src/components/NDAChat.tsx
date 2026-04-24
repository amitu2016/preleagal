'use client';

import { useEffect, useRef, useState } from 'react';
import { NDAFormData } from '@/types/nda';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  onFieldsUpdate: (fields: Partial<NDAFormData>) => void;
}

export default function NDAChat({ onFieldsUpdate }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    callAI([]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function callAI(msgs: Message[]) {
    setLoading(true);
    try {
      const res = await fetch('/api/chat/nda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgs }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
      onFieldsUpdate(data.fields);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    await callAI(next);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[#753991] text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-900 rounded-bl-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2 text-sm text-gray-400">
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-200 px-4 py-3">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#209dd7] focus:outline-none focus:ring-1 focus:ring-[#209dd7]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message…"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="rounded-lg bg-[#753991] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#5e2d75] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
