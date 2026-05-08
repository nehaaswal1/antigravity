import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react';
import { TripPlan, TravelPreferences } from '../types';
import { sendChatMessage } from '../services/geminiService';

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
        setMessages(newHistory);
        setIsLoading(true);

        try {
            const responseText = await sendChatMessage(userMsg, messages.slice(1), plan, preferences);
            setMessages([...newHistory, { role: 'model', text: responseText }]);
        } catch (error) {
            setMessages([...newHistory, { role: 'model', text: 'Oops, something went wrong. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to parse basic markdown (bold and newlines) from Gemini
    const formatText = (text: string) => {
        return text.split('\n').map((line, i) => (
            <React.Fragment key={i}>
                {line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
                    }
                    return part;
                })}
                {i !== text.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 print:hidden">
            {/* Chat Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-brand-600 hover:bg-brand-700 text-white p-4 rounded-full shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 h-[500px] flex flex-col border border-gray-200 overflow-hidden animate-fadeIn">
                    {/* Header */}
                    <div className="bg-brand-600 text-white p-4 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <Bot className="w-5 h-5" />
                            <h3 className="font-semibold">Trip Assistant</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div 
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-brand-600 text-white rounded-tr-sm' 
                                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                                    }`}
                                >
                                    {formatText(msg.text)}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center space-x-2">
                                    <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
                                    <span className="text-xs text-gray-500">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask about your trip..."
                            className="flex-1 bg-gray-100 text-sm rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            disabled={isLoading}
                        />
                        <button 
                            type="submit" 
                            disabled={!inputValue.trim() || isLoading}
                            className="bg-brand-600 text-white p-2.5 rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};
