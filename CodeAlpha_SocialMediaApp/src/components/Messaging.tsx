import React, { useState, useEffect, useRef } from 'react';
import { useSocialMedia } from '../data/store';
import { Message, User } from '../types';
import { 
  Send, Image, Smile, Check, CheckCheck, 
  Circle, Phone, Video, Search, ChevronLeft, Mail 
} from 'lucide-react';

export const Messaging: React.FC = () => {
  const { 
    currentUser, 
    users, 
    profiles, 
    messages, 
    sendMessage, 
    markMessagesAsRead 
  } = useSocialMedia();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [typedMessage, setTypedMessage] = useState('');
  const [showEmojiDrawer, setShowEmojiDrawer] = useState(false);
  
  // Custom smart simulation states
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mark selected user's messages as read
  useEffect(() => {
    if (selectedUserId && currentUser) {
      markMessagesAsRead(selectedUserId);
    }
  }, [selectedUserId, messages, currentUser]);

  // Scroll to bottom of active chat thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, selectedUserId]);

  if (!currentUser) return null;

  // Selected interlocutor details
  const activeUser = users.find(u => u.id === selectedUserId);
  const activeProfile = profiles.find(p => p.userId === selectedUserId);

  // Get other users list with latest messages if any
  const chatList = users
    .filter(u => u.id !== currentUser.id && u.role !== 'admin')
    .filter(u => {
      const prof = profiles.find(p => p.userId === u.id);
      const matchName = prof?.fullName.toLowerCase().includes(chatSearchQuery.toLowerCase());
      const matchUsername = u.username.toLowerCase().includes(chatSearchQuery.toLowerCase());
      return matchName || matchUsername;
    });

  // Filter messages for active chat thread
  const activeChatMessages = messages.filter(m => 
    (m.senderId === currentUser.id && m.receiverId === selectedUserId) ||
    (m.senderId === selectedUserId && m.receiverId === currentUser.id)
  );

  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !selectedUserId) return;

    const contentText = typedMessage.trim();
    sendMessage(selectedUserId, contentText);
    setTypedMessage('');
    setShowEmojiDrawer(false);

    // TRIGGER AN AGENT AUTOREPLY DELAY SIMULATOR
    triggerSimulatedAutoReply(selectedUserId, contentText);
  };

  const triggerSimulatedAutoReply = (targetId: string, originalText: string) => {
    setIsTyping(true);

    setTimeout(() => {
      let responseText = "That sounds super interesting! Let's definitely talk more about it soon.";
      
      const lowerText = originalText.toLowerCase();

      if (targetId === 'user_taylor') {
        if (lowerText.includes('song') || lowerText.includes('music') || lowerText.includes('album')) {
          responseText = "I'm working on some new melodies in the studio right now! Can't wait for you to hear them. 🎶🎸";
        } else if (lowerText.includes('tour') || lowerText.includes('concert') || lowerText.includes('stage')) {
          responseText = "The tour is going incredibly well! The crowd was shouting so loud tonight! ✨🎤";
        } else {
          responseText = "Thanks for checking in! Sending you all my love. Have a magical day! ✨🎹";
        }
      } else if (targetId === 'user_tech') {
        if (lowerText.includes('react') || lowerText.includes('coding') || lowerText.includes('code')) {
          responseText = "Yes! React 19 is amazing. The performance and hydration features are a complete game changer. 🚀💻";
        } else if (lowerText.includes('bug') || lowerText.includes('error')) {
          responseText = "Ugh, debugging is the worst. Try checking your useEffect dependency arrays! 🐛👨‍💻";
        } else {
          responseText = "I'm just finishing up a code review, then I'm down to sync! Let's build something cool.";
        }
      } else if (targetId === 'user_travel') {
        if (lowerText.includes('bali') || lowerText.includes('travel') || lowerText.includes('trip')) {
          responseText = "Bali has been absolutely magical! You have to check out the waterfalls in north Ubud. 🌊⛰️";
        } else if (lowerText.includes('food') || lowerText.includes('eat')) {
          responseText = "The street food here is actually incredible! Tried some amazing local Nasi Goreng today! 🍛✨";
        } else {
          responseText = "Currently packing for my flight to Tokyo tomorrow! So excited! ✈️🗺️";
        }
      } else if (targetId === 'user_foodie') {
        if (lowerText.includes('recipe') || lowerText.includes('cook') || lowerText.includes('bake')) {
          responseText = "The key to a good bread crust is adding a pan of hot water at the bottom of your oven for steam! 🍞🥖";
        } else if (lowerText.includes('cake') || lowerText.includes('sweet') || lowerText.includes('dessert')) {
          responseText = "You should definitely try my recipe for lemon meringue tart, it has a secret dash of cardamon! 🍋🍰";
        } else {
          responseText = "Fresh croissants are just coming out of the kitchen right now! I wish you could smell this! 🥐☕";
        }
      }

      sendMessage(currentUser.id, responseText);
      setIsTyping(false);
    }, 3500); // 3.5 seconds total typing/response delay
  };

  const handleShareMockImage = () => {
    if (!selectedUserId) return;
    const mockImages = [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400'
    ];
    const chosenImage = mockImages[Math.floor(Math.random() * mockImages.length)];
    
    sendMessage(selectedUserId, "Look at this photo I took! 📸", chosenImage);
    triggerSimulatedAutoReply(selectedUserId, "image share check");
  };

  const emojiList = ['😀', '😂', '🔥', '✨', '❤️', '🙌', '💻', '🌍', '✈️', '🥐', '🎤'];

  return (
    <div className="flex-1 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-3xl h-[80vh] flex overflow-hidden shadow-xs" id="messages_module">
      
      {/* CHAT LIST (LEFT BAR) */}
      <div className={`w-full md:w-80 border-r border-gray-100 dark:border-gray-900 flex flex-col ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
        {/* Search header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-900">
          <h2 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-3">Chats</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={chatSearchQuery}
              onChange={(e) => setChatSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Chats Users items */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-900/30 p-2 space-y-1">
          {chatList.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">No active chats.</div>
          ) : (
            chatList.map((userItem) => {
              const prof = profiles.find(p => p.userId === userItem.id);
              const threadMessages = messages.filter(m => 
                (m.senderId === currentUser.id && m.receiverId === userItem.id) ||
                (m.senderId === userItem.id && m.receiverId === currentUser.id)
              );
              const lastMsg = threadMessages[threadMessages.length - 1];
              const isSelected = selectedUserId === userItem.id;
              
              // Unread messages check
              const unreadCount = threadMessages.filter(m => m.receiverId === currentUser.id && !m.isRead).length;

              return (
                <button
                  key={userItem.id}
                  onClick={() => setSelectedUserId(userItem.id)}
                  className={`w-full text-left p-2.5 rounded-2xl flex items-center gap-3 transition-colors cursor-pointer ${
                    isSelected ? 'bg-purple-50 dark:bg-purple-950/20' : 'hover:bg-gray-50 dark:hover:bg-gray-900/30'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={prof?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=50'}
                      alt="avatar"
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {/* Simulated online indicator */}
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-950"></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                        {prof?.fullName}
                      </p>
                      {lastMsg && (
                        <span className="text-[9px] text-gray-400 font-mono">
                          {new Date(lastMsg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] truncate ${unreadCount > 0 ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-gray-400 dark:text-gray-500'}`}>
                      {lastMsg ? lastMsg.content : 'Start a conversation'}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* CHAT THREAD CANVAS (RIGHT PANEL) */}
      <div className={`flex-1 flex flex-col ${!selectedUserId ? 'hidden md:flex' : 'flex'}`}>
        {selectedUserId ? (
          <>
            {/* Header chat metadata */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-900 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedUserId(null)}
                  className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full md:hidden cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <img
                  src={activeProfile?.avatar}
                  alt="avatar"
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">{activeProfile?.fullName}</h4>
                  <div className="flex items-center gap-1">
                    <Circle className="w-1.5 h-1.5 fill-green-500 text-green-500" />
                    <span className="text-[10px] text-gray-400 dark:text-gray-600">Online • Active now</span>
                  </div>
                </div>
              </div>

              {/* Call Controls mock buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900">
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MESSAGE STREAM AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat_messages_container">
              {activeChatMessages.map((msg, idx) => {
                const isMine = msg.senderId === currentUser.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] space-y-1`}>
                      {/* Text box bubble */}
                      <div className={`p-3 rounded-2xl text-xs shadow-xs ${
                        isMine 
                          ? 'bg-linear-to-r from-pink-500 via-purple-600 to-indigo-500 text-white rounded-tr-none' 
                          : 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-tl-none'
                      }`}>
                        {msg.content}
                        
                        {/* Share media preview in bubble */}
                        {msg.media && (
                          <div className="mt-2 overflow-hidden rounded-xl border border-black/10">
                            <img
                              src={msg.media}
                              alt="Shared media"
                              referrerPolicy="no-referrer"
                              className="w-full max-h-48 object-cover"
                            />
                          </div>
                        )}
                      </div>

                      {/* Msg bottom state metadata */}
                      <div className={`flex items-center gap-1 text-[9px] text-gray-400 font-mono ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        {isMine && (
                          msg.isRead ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" /> : <Check className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Bot typing simulation row */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-900 py-2.5 px-3.5 rounded-2xl rounded-tl-none text-[11px] text-gray-500 font-semibold flex items-center gap-2">
                    <span className="animate-bounce">•</span>
                    <span className="animate-bounce [animation-delay:0.2s]">•</span>
                    <span className="animate-bounce [animation-delay:0.4s]">•</span>
                    <span>{activeProfile?.fullName} is typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT CONTROLLER FORM */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-950/20 relative">
              
              {/* Optional Emoji shelf drawer */}
              {showEmojiDrawer && (
                <div className="absolute bottom-16 left-4 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 rounded-xl p-2.5 shadow-lg flex gap-2 z-30">
                  {emojiList.map(emoji => (
                    <button 
                      key={emoji}
                      onClick={() => setTypedMessage(prev => prev + emoji)}
                      className="text-lg hover:scale-115 transition-transform cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSendMessageSubmit} className="flex gap-2 items-center">
                <button 
                  type="button"
                  onClick={() => setShowEmojiDrawer(!showEmojiDrawer)}
                  className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-full cursor-pointer"
                  title="Insert Emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>

                <button 
                  type="button"
                  onClick={handleShareMockImage}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-full cursor-pointer"
                  title="Share Photo"
                >
                  <Image className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  placeholder={`Write a private message to ${activeProfile?.fullName}...`}
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2.5 text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
                />

                <button 
                  type="submit"
                  className="p-2.5 bg-linear-to-r from-pink-500 via-purple-600 to-indigo-500 text-white rounded-full hover:opacity-95 transition-opacity cursor-pointer shadow-xs shadow-purple-500/10"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 dark:text-gray-500">
            <Mail className="w-12 h-12 stroke-[1.5] text-purple-200 dark:text-purple-950/50 mb-3 animate-pulse" />
            <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">Your Inbox</h4>
            <p className="text-xs max-w-xs mt-1">
              Select any verified user or blogger on the left pane to launch secure end-to-end messaging with smart simulation.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
