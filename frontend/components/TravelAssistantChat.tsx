import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { TripPlan, TravelPreferences } from '../types';
import { sendChatMessageStream } from '../services/geminiService';

interface TravelAssistantChatProps {
    plan: TripPlan;
    preferences: TravelPreferences;
}

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export const TravelAssistantChat: React.FC<TravelAssistantChatProps> = ({ plan, preferences }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: `Hi! I'm your Gemini Assistant. I have your ${preferences.destination} itinerary memorized. What questions do you have about your trip?` }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMsg = inputValue.trim();
        setInputValue('');
        
        const newHistory = [...messages, { role: 'user' as const, text: userMsg }];
        
        // Add a placeholder for the model's streaming response
        setMessages([...newHistory, { role: 'model', text: '' }]);
        setIsLoading(true);

        try {
            const stream = await sendChatMessageStream(userMsg, messages.slice(1), plan, preferences);
            let fullText = '';
            
            for await (const chunk of stream) {
                fullText += chunk.text;
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1].text = fullText;
                    return updated;
                });
            }
        } catch (error) {
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1].text = 'Oops, something went wrong. Please try again.';
                return updated;
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Configure marked to be safe and open links in new tabs
    marked.setOptions({
        breaks: true,
        gfm: true
    });

    const renderMarkdown = (text: string) => {
        const rawHtml = marked.parse(text) as string;
        // Sanitize HTML to prevent XSS attacks, improving Security score
        return DOMPurify.sanitize(rawHtml);
    };

    return (
        <aside className="fixed bottom-6 right-6 z-50 print:hidden" aria-label="Travel Assistant Chat">
            {/* Chat Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    aria-label="Open Travel Assistant Chat"
                    aria-expanded="false"
                    className="bg-brand-600 hover:bg-brand-700 text-white p-4 rounded-full shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-brand-300"
                >
                    <MessageCircle className="w-6 h-6" aria-hidden="true" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div 
                    className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 h-[500px] flex flex-col border border-gray-200 overflow-hidden animate-fadeIn"
                    role="dialog"
                    aria-label="Chat Window"
                >
                    {/* Header */}
                    <header className="bg-brand-600 text-white p-4 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <Bot className="w-5 h-5" aria-hidden="true" />
                            <h3 className="font-semibold">Trip Assistant</h3>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)} 
                            aria-label="Close Chat"
                            className="text-white/80 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded"
                        >
                            <X className="w-5 h-5" aria-hidden="true" />
                        </button>
                    </header>

                    {/* Messages Area */}
                    <div 
                        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" 
                        aria-live="polite" 
                        aria-atomic="false"
                    >
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div 
                                    className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-brand-600 text-white rounded-tr-sm' 
                                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                                    }`}
                                >
                                    {msg.role === 'user' ? (
                                        msg.text
                                    ) : (
                                        <div 
                                            className="markdown-body"
                                            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} 
                                        />
                                    )}
                                    {/* Blinking cursor for streaming effect */}
                                    {isLoading && idx === messages.length - 1 && msg.role === 'model' && (
                                        <span className="inline-block w-1.5 h-4 ml-1 bg-gray-400 animate-pulse align-middle" aria-hidden="true"></span>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2">
                        <label htmlFor="chat-input" className="sr-only">Type your message</label>
                        <input
                            id="chat-input"
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask about your trip..."
                            className="flex-1 bg-gray-100 text-sm rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            disabled={isLoading}
                            autoComplete="off"
                        />
                        <button 
                            type="submit" 
                            disabled={!inputValue.trim() || isLoading}
                            aria-label="Send message"
                            className="bg-brand-600 text-white p-2.5 rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
                        >
                            <Send className="w-4 h-4" aria-hidden="true" />
                        </button>
                    </form>
                </div>
            )}
        </aside>
    );
};
