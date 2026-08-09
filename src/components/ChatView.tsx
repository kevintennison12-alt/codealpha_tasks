/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Send, MessageSquare, ShieldCheck, Hash, ArrowRight } from 'lucide-react';
import { ChatMessage, Project, User } from '../types';
import { api } from '../utils/api';

interface ChatViewProps {
  projects: Project[];
  currentUser: User | null;
}

export default function ChatView({ projects, currentUser }: ChatViewProps) {
  const [selectedChannelId, setSelectedChannelId] = React.useState<string>('global');
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = React.useState<string>('');
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  // Load channel messages
  const loadMessages = async () => {
    try {
      const msgs = await api.chat.getMessages(selectedChannelId);
      // Sort messages ascending by time
      setMessages(msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    }
  };

  React.useEffect(() => {
    loadMessages();
    // Setup simulated polling for real-time like updates (every 3 seconds)
    const interval = setInterval(() => {
      loadMessages();
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedChannelId]);

  // Scroll to bottom on load/new message
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    try {
      const sent = await api.chat.sendMessage(selectedChannelId, newMessageText.trim());
      setMessages(prev => [...prev, sent]);
      setNewMessageText('');
    } catch (err) {
      alert('Failed to send message');
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50 dark:bg-[#0b0f19]">
      {/* Channels Sidebar List */}
      <div className="w-52 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-display font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wide">
            Discussion Channels
          </h2>
          <p className="text-[9px] text-slate-400 font-medium">
            Project team rooms and chat lobbies
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
          {/* Global Channel */}
          <button
            onClick={() => setSelectedChannelId('global')}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] font-semibold text-left transition-colors cursor-pointer ${
              selectedChannelId === 'global'
                ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/20'
            }`}
          >
            <Hash className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate flex-1">Global Main Lobby</span>
          </button>

          {/* Project Specific Channels */}
          <div className="px-2.5 pt-2 pb-0.5">
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Project Channels
            </span>
          </div>

          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedChannelId(p.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] font-semibold text-left transition-colors cursor-pointer ${
                selectedChannelId === p.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/20'
              }`}
            >
              <Hash className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate flex-1">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Conversation Room */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden bg-white dark:bg-[#0b0f19]">
        {/* Room Header */}
        <div className="h-11 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between shrink-0 bg-white dark:bg-slate-950">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-indigo-500" />
            <span className="font-display font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              {selectedChannelId === 'global' 
                ? 'Global Main Lobby' 
                : projects.find(p => p.id === selectedChannelId)?.name + ' Team Room'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[9px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.2 rounded font-bold">
            <ShieldCheck className="h-3 w-3" />
            <span>Encrypted</span>
          </div>
        </div>

        {/* Message Feed list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-1.5" />
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
                No conversation logs in this room.
              </p>
              <p className="text-[9px] text-slate-400 mt-0.5 font-medium">
                Be the first to say hello to the project members!
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.userId === currentUser?.id;
              return (
                <div 
                  key={m.id} 
                  className={`flex gap-2 text-xs max-w-lg ${isMine ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {/* Avatar */}
                  <div className="h-6 w-6 rounded bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400 text-[9px] font-bold flex items-center justify-center shrink-0">
                    {m.userAvatar}
                  </div>
                  
                  {/* Bubble content */}
                  <div className="space-y-0.5 min-w-0">
                    <div className={`flex items-center gap-1.5 ${isMine ? 'justify-end' : ''}`}>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[10px]">
                        {m.userName}
                      </span>
                      <span className="text-[8px] text-slate-400">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className={`p-2 px-2.5 rounded ${
                      isMine 
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs' 
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-200/20 dark:border-slate-800/40'
                    }`}>
                      <p className="font-semibold leading-normal break-words">
                        {m.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box form */}
        <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-1.5 items-center">
            <input
              type="text"
              placeholder="Type message here..."
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              className="flex-1 text-xs font-semibold px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded outline-none dark:text-white"
            />
            <button
              type="submit"
              className="h-7 w-7 flex items-center justify-center rounded bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer transition-colors shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
