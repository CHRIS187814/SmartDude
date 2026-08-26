import { useEffect, useRef, useState } from 'react';
import { Bot, Send, X, Sparkles, Check, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { parseIntent } from '@/lib/aiParser';
import { executeAction } from '@/lib/actionEngine';
import type { AiAction, AiMessage } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface ChatMessage extends AiMessage {
  pending?: boolean;
}

const suggestions = [
  'What should I focus on today?',
  'Create a task to finish my assignment tomorrow',
  'Remind me at 7 PM to submit my assignment',
  'Every weekday at 8 AM remind me to review my priorities',
  'Plan my next three hours',
];

export default function AiCompanion({ open, onClose }: Props) {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && user && !conversationId) {
      initConversation();
    }
    if (!open) {
      setMessages([]);
      setConversationId(null);
    }
  }, [open, user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const initConversation = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('ai_conversations')
      .insert({ user_id: user.id, title: 'New Conversation' })
      .select('*').single();
    if (error) return;
    setConversationId(data.id);
    setMessages([{
      id: 'welcome',
      conversation_id: data.id,
      user_id: user.id,
      role: 'assistant',
      content: `Hi! I'm SmartDude, your AI action companion. I can help you create tasks, set reminders, plan your day, and automate recurring work. What would you like to do?`,
      action: null,
      action_status: null,
      created_at: new Date().toISOString(),
    }]);
  };

  const send = async (text: string) => {
    if (!user || !activeWorkspace || !conversationId || !text.trim() || busy) return;
    setInput('');
    setBusy(true);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      user_id: user.id,
      role: 'user',
      content: text,
      action: null,
      action_status: null,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);

    await supabase.from('ai_messages').insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: 'user',
      content: text,
    });

    const parsed = parseIntent(text);

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      user_id: user.id,
      role: 'assistant',
      content: parsed.summary,
      action: parsed.needsTimeClarification ? null : parsed.action,
      action_status: parsed.needsTimeClarification ? null : 'pending',
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, assistantMsg]);

    await supabase.from('ai_messages').insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: 'assistant',
      content: parsed.summary,
      action: parsed.action,
      action_status: parsed.needsTimeClarification ? null : 'pending',
    });

    setBusy(false);
  };

  const confirmAction = async (message: ChatMessage) => {
    if (!message.action || !user || !activeWorkspace) return;
    setMessages((m) => m.map((msg) => msg.id === message.id ? { ...msg, action_status: 'executing' } : msg));
    const result = await executeAction(message.action, { userId: user.id, workspaceId: activeWorkspace.id });
    const status = result.success ? 'executed' : 'failed';
    setMessages((m) => m.map((msg) => msg.id === message.id ? {
      ...msg,
      action_status: status,
      content: result.success ? `${msg.content}\n\n✓ ${result.message}` : `${msg.content}\n\n✗ ${result.message}`,
    } : msg));
    await supabase.from('ai_messages').update({
      action_status: status,
      content: result.success ? `${message.content}\n\n✓ ${result.message}` : `${message.content}\n\n✗ ${result.message}`,
    }).eq('id', message.id);
  };

  const cancelAction = async (message: ChatMessage) => {
    setMessages((m) => m.map((msg) => msg.id === message.id ? { ...msg, action_status: 'cancelled' } : msg));
    await supabase.from('ai_messages').update({ action_status: 'cancelled' }).eq('id', message.id);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg h-[85vh] sm:h-[600px] bg-white dark:bg-ink-900 rounded-t-2xl sm:rounded-2xl shadow-xl border border-ink-200 dark:border-ink-800 flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200 dark:border-ink-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm">SmartDude AI</div>
              <div className="text-xs text-accent-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-accent-500" /> Active</div>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5"><X className="w-5 h-5" /></button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-900 dark:text-ink-100'} rounded-2xl px-4 py-3`}>
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                {msg.action && msg.action_status === 'pending' && (
                  <div className="mt-3 flex gap-2 pt-3 border-t border-ink-200 dark:border-ink-700">
                    <button onClick={() => confirmAction(msg)} className="inline-flex items-center gap-1.5 bg-white dark:bg-ink-900 text-primary-600 dark:text-primary-400 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition">
                      <Check className="w-3.5 h-3.5" /> Confirm
                    </button>
                    <button onClick={() => cancelAction(msg)} className="inline-flex items-center gap-1.5 text-ink-500 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-ink-200 dark:hover:bg-ink-700 transition">
                      Cancel
                    </button>
                  </div>
                )}
                {msg.action_status === 'executing' && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Executing…
                  </div>
                )}
                {msg.action_status === 'failed' && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-error-500">
                    <AlertCircle className="w-3.5 h-3.5" /> Action failed
                  </div>
                )}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex justify-start">
              <div className="bg-ink-100 dark:bg-ink-800 rounded-2xl px-4 py-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-500 animate-pulse-soft" />
                <span className="text-sm text-ink-500">Thinking…</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} onClick={() => send(s)} className="text-xs bg-ink-100 dark:bg-ink-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-ink-600 dark:text-ink-300 px-3 py-1.5 rounded-full transition">
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-ink-200 dark:border-ink-800">
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask SmartDude to do something…"
              className="input flex-1"
              disabled={busy}
            />
            <button type="submit" disabled={busy || !input.trim()} className="btn-primary px-3">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
