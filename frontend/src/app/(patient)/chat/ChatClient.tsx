'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Send, Sparkles, Plus, AlertTriangle, ShieldCheck, Stethoscope, Clock, HeartPulse, PhoneCall, Bot, User, RotateCcw } from 'lucide-react';
import { sendChatMessage, startNewChat } from '@/lib/chatActions';

interface Message {
  message_id?: number;
  role: 'user' | 'bot';
  content: string;
  created_at?: string;
}

interface ChatClientProps {
  initialSession?: any;
}

/** Lightweight inline markdown → HTML renderer (no external deps) */
function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^---$/gm, '<hr />')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Wrap consecutive <li> items in <ul>
  html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  // Wrap paragraphs
  const lines = html.split('\n');
  const result: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<hr')) {
      result.push(trimmed);
    } else {
      result.push(`<p>${trimmed}</p>`);
    }
  }
  return result.join('');
}

export default function ChatClient({ initialSession }: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>(
    initialSession?.messages || [
      {
        role: 'bot',
        content: "Hello! I am the **UNN Health Education & Management Chatbot (HEMC)**.\n\nI can answer questions on **Malaria** and **Typhoid Fever** based on WHO/NCDC guidelines, assess symptom urgency (triage), or guide you to book an appointment with our Medical Centre doctors.\n\nWhat would you like to know or check today?",
      }
    ]
  );
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPending]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isPending) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    inputRef.current?.focus();

    startTransition(async () => {
      const res = await sendChatMessage(text.trim());
      if (res.data?.messages) {
        setMessages(res.data.messages);
      } else if (res.error) {
        setMessages((prev) => [
          ...prev,
          { role: 'bot', content: `**Error:** ${res.error}. Please make sure the backend is reachable.` }
        ]);
      }
    });
  };

  const handleStartNewChat = () => {
    startTransition(async () => {
      await startNewChat();
      setMessages([
        {
          role: 'bot',
          content: "Fresh session started. How can I help you today with **Malaria**, **Typhoid**, or Medical Centre services?"
        }
      ]);
    });
  };

  const quickPrompts = [
    { label: 'Malaria symptoms', text: 'What are malaria symptoms?' },
    { label: 'Typhoid prevention', text: 'How is typhoid prevented?' },
    { label: 'Fever for 3 days', text: 'I have fever for 3 days' },
    { label: 'Book appointment', text: 'Book appointment with doctor' },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden">

      {/* Left Sidebar — Desktop */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 h-screen overflow-y-auto scrollbar-thin bg-white dark:bg-bg-dark-alt border-r border-slate-200/60 dark:border-white/[0.06] p-5 gap-4">

        <button
          onClick={handleStartNewChat}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-sm transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          New Consultation
        </button>

        <div className="rounded-2xl bg-slate-50 dark:bg-bg-card-dark border border-slate-200/60 dark:border-white/[0.06] p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-800 dark:text-white font-semibold text-xs">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            Verified Medical Sources
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            All responses are sourced from official <span className="font-semibold">WHO</span> and <span className="font-semibold">NCDC</span> guidance.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 dark:bg-bg-card-dark border border-slate-200/60 dark:border-white/[0.06] p-4 flex flex-col gap-1">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
            Quick Topics
          </h3>
          {[
            { icon: Stethoscope, color: 'text-primary', label: 'Malaria Symptoms (WHO)', msg: 'What are the symptoms of malaria according to WHO?' },
            { icon: HeartPulse, color: 'text-emerald-500', label: 'Malaria Prevention', msg: 'What are the causes and prevention of malaria?' },
            { icon: AlertTriangle, color: 'text-amber-500', label: 'Typhoid & Water Safety', msg: 'What are the symptoms and causes of typhoid fever?' },
            { icon: Clock, color: 'text-orange-500', label: 'Typhoid Treatment (NCDC)', msg: 'What is the NCDC recommended treatment for typhoid fever?' },
          ].map(({ icon: Icon, color, label, msg }) => (
            <button
              key={label}
              onClick={() => handleSend(msg)}
              disabled={isPending}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/5 transition-colors flex items-center gap-2.5 disabled:opacity-50"
            >
              <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
              {label}
            </button>
          ))}
          <div className="my-1.5 border-t border-slate-200/60 dark:border-white/[0.06]" />
          <button
            onClick={() => handleSend('I have high fever for 4 days and persistent vomiting')}
            disabled={isPending}
            className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-2.5 disabled:opacity-50"
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Test Urgent Red-Flag Triage
          </button>
        </div>

        <div className="mt-auto rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 p-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-red-700 dark:text-red-300">
            <PhoneCall className="w-3.5 h-3.5 shrink-0" />
            UNN Medical Centre Hotline
          </div>
          <p className="text-[11px] text-red-600/80 dark:text-red-400/80 leading-relaxed">
            For critical emergencies, walk in or call the Nsukka Campus triage desk.
          </p>
          <p className="text-xs font-bold text-red-700 dark:text-red-300 mt-0.5">+234 (0) 42 771 911</p>
        </div>
      </aside>

      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-bg-light-alt dark:bg-bg-dark">

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between shrink-0 bg-white dark:bg-bg-dark-alt">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">HEMC AI Assistant</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Online · WHO &amp; NCDC Knowledge Base</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleStartNewChat}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 md:p-6 flex flex-col gap-5">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div key={idx} className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mb-0.5">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] md:max-w-[68%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-primary text-white rounded-br-sm shadow-sm'
                      : 'bg-white dark:bg-bg-card-dark text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-white/[0.06] rounded-bl-sm shadow-sm bot-message'
                  }`}
                >
                  {isUser ? (
                    <span>{msg.content}</span>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                  )}
                </div>
                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center shrink-0 mb-0.5">
                    <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </div>
                )}
              </div>
            );
          })}

          {isPending && (
            <div className="flex items-end gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mb-0.5">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-white dark:bg-bg-card-dark rounded-2xl rounded-bl-sm px-4 py-3.5 border border-slate-200/60 dark:border-white/[0.06] shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="shrink-0 border-t border-slate-200/60 dark:border-white/[0.06] bg-white dark:bg-bg-dark-alt p-4 flex flex-col gap-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {quickPrompts.map(({ label, text }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleSend(text)}
                disabled={isPending}
                className="whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/[0.06] text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors disabled:opacity-40"
              >
                <Sparkles className="w-3 h-3 text-primary shrink-0" />
                {label}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2 bg-slate-50 dark:bg-bg-card-dark rounded-2xl px-4 py-2 border border-slate-200/80 dark:border-white/[0.08] focus-within:border-primary/60 transition-colors"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about malaria, typhoid, or check symptom urgency..."
              disabled={isPending}
              className="flex-1 bg-transparent py-1.5 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isPending}
              className="w-9 h-9 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center shrink-0 transition-colors disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
