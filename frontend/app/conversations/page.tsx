'use client';

import Shell from '@/components/layout/Shell';
import { Search, MoreVertical, Phone, Video, Send, Smile, Paperclip, CheckCheck, User, Sparkles, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function ConversationsPage() {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // Empty state - data will be populated from API later
    const [chats, setChats] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);

    const activeChat = chats.find(c => c.id === selectedId);

    return (
        <Shell>
            <div className="h-[calc(100vh-180px)] max-w-[1600px] mx-auto flex gap-6 overflow-hidden">
                {/* Sidebar */}
                <div className="w-96 flex flex-col bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-xl overflow-hidden shrink-0">
                    <div className="p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Messages</h2>
                            <div className="p-2 bg-primary-50 rounded-xl">
                                <Sparkles className="w-5 h-5 text-primary-600" />
                            </div>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-100 transition-all font-medium text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2 custom-scrollbar">
                        {chats.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
                                <Search className="w-12 h-12 text-gray-300 mb-4" />
                                <p className="font-bold text-gray-400">No conversations</p>
                            </div>
                        ) : (
                            chats.map((chat) => (
                                <button
                                    key={chat.id}
                                    onClick={() => setSelectedId(chat.id)}
                                    className={`w-full p-4 rounded-3xl flex items-center gap-4 transition-all group ${selectedId === chat.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 grow' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="relative shrink-0">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg ${selectedId === chat.id ? 'bg-white/20' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {chat.name[0]}
                                        </div>
                                        {chat.online && (
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 border-2 border-white rounded-full" />
                                        )}
                                    </div>
                                    <div className="flex-1 text-left overflow-hidden">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-bold truncate">{chat.name}</p>
                                            <p className={`text-[10px] font-bold uppercase tracking-wider ${selectedId === chat.id ? 'text-white/60' : 'text-gray-400'
                                                }`}>{chat.time}</p>
                                        </div>
                                        <p className={`text-xs font-medium truncate ${selectedId === chat.id ? 'text-white/80' : 'text-gray-500'
                                            }`}>{chat.lastMsg}</p>
                                    </div>
                                    {chat.unread > 0 && selectedId !== chat.id && (
                                        <div className="w-5 h-5 bg-danger-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg">
                                            {chat.unread}
                                        </div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                {selectedId && activeChat ? (
                    <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-xl overflow-hidden relative">
                        {/* Chat Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 font-black">
                                    {activeChat.name[0]}
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 leading-tight">{activeChat.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="w-1.5 h-1.5 bg-success-500 rounded-full" />
                                        <p className="text-[10px] font-black text-success-600 uppercase tracking-widest">Active Now</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-all"><Phone className="w-5 h-5" /></button>
                                <button className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-all"><Video className="w-5 h-5" /></button>
                                <button className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-all"><MoreVertical className="w-5 h-5" /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                            {messages.length === 0 ? (
                                <div className="flex h-full items-center justify-center">
                                    <p className="font-bold text-gray-400 opacity-60">No messages in this conversation yet</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-center">
                                        <span className="px-4 py-1.5 bg-gray-100 text-[10px] font-black text-gray-500 rounded-full uppercase tracking-widest">Today</span>
                                    </div>

                                    {messages.map((msg, i) => (
                                        msg.isMine ? (
                                            <div key={i} className="flex flex-row-reverse gap-4 max-w-2xl ml-auto">
                                                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shrink-0 self-end shadow-lg">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="p-5 bg-primary-600 text-white rounded-3xl rounded-br-none shadow-xl shadow-primary-500/20 font-medium leading-relaxed">
                                                        {msg.text}
                                                    </div>
                                                    <div className="flex items-center justify-end gap-1.5 mr-2">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{msg.time}</p>
                                                        <CheckCheck className="w-3.5 h-3.5 text-primary-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div key={i} className="flex gap-4 max-w-2xl">
                                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 shrink-0 self-end">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="p-5 bg-gray-50 rounded-3xl rounded-bl-none border border-gray-100 text-gray-700 font-medium leading-relaxed">
                                                        {msg.text}
                                                    </div>
                                                    {msg.time && <p className="text-[10px] font-bold text-gray-400 uppercase ml-2 tracking-widest">{msg.time}</p>}
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </>
                            )}
                        </div>

                        {/* Chat Input */}
                        <div className="p-8 border-t border-gray-100 bg-white/50">
                            <div className="flex items-center gap-4 bg-white p-2 border border-gray-200 rounded-[2rem] shadow-sm focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-300 transition-all">
                                <div className="flex items-center gap-1 pl-2">
                                    <button className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-all"><Paperclip className="w-5 h-5" /></button>
                                    <button className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-all"><Smile className="w-5 h-5" /></button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Type your message here..."
                                    className="flex-1 bg-transparent py-3 px-4 outline-none font-medium"
                                />
                                <button className="px-8 py-3 bg-primary-600 text-white rounded-3xl font-black shadow-lg shadow-primary-500/30 hover:bg-primary-500 active:scale-95 transition-all flex items-center gap-2">
                                    Send
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-xl overflow-hidden items-center justify-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
                            <MessageSquare className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400 mb-2">No Conversation Selected</h3>
                        <p className="text-sm font-medium text-gray-400 max-w-xs text-center">Select a conversation from the sidebar or start a new message.</p>
                    </div>
                )}
            </div>
        </Shell>
    );
}
