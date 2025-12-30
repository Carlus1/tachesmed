import ModernLayout from '../components/ModernLayout';
import type { User } from '@supabase/gotrue-js';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';

interface MessagesPageProps {
  user: User;
}

interface Message {
  id?: string;
  from: string;
  to?: string;
  text: string;
  created_at?: string;
}

export default function MessagesPage({ user }: MessagesPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try to fetch from Supabase 'messages' table if it exists
        const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(200);
        if (error) {
          console.warn('Supabase messages fetch error (fallback to local):', error.message);
          throw error;
        }

        if (mounted && Array.isArray(data)) {
          setMessages(data.map((m: any) => ({ id: m.id, from: m.from, to: m.to, text: m.text, created_at: m.created_at })));
        }
      } catch (_e) {
        // Fallback sample messages
        if (mounted) {
          setMessages([
            { from: 'Jean', text: "Bonjour, la réunion est confirmée demain à 10h.", created_at: new Date().toISOString() },
            { from: 'Marie', text: "Merci — j'ai ajouté l'ordre du jour.", created_at: new Date().toISOString() }
          ]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // scroll to bottom on new message
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const newMsg: Message = { from: user.email ?? 'Vous', text: input.trim(), created_at: new Date().toISOString() };

    // Optimistic UI
    setMessages((m) => [...m, newMsg]);
    setInput('');

    try {
      // Try insert into Supabase if available
      const { error } = await supabase.from('messages').insert({ from: newMsg.from, text: newMsg.text });
      if (error) {
        console.warn('Failed to persist message to Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Error inserting message (ignored):', err);
    }
  };

  return (
    <ModernLayout user={user}>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary-700">Messages</h1>
        <p className="text-primary-400">Conversations et messagerie interne</p>
      </div>

      <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-medium text-primary-700">Boîte de réception</h2>
        </div>

        <div className="p-4 h-80 overflow-auto" ref={listRef}>
          {loading ? (
            <div className="text-primary-400">Chargement des messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-primary-400">Aucun message pour le moment.</div>
          ) : (
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={i} className="p-3 rounded-lg bg-background border border-border">
                  <div className="text-sm text-primary-700 font-medium">{m.from}</div>
                  <div className="text-sm text-primary-400 mt-1">{m.text}</div>
                  <div className="text-xs text-primary-300 mt-2">{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={(e) => void handleSend(e)} className="p-4 border-t border-border bg-background flex items-center space-x-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrire un message..."
            className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">Envoyer</button>
        </form>
      </div>
    </ModernLayout>
  );
}
