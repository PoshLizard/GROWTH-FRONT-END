import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import hurbeeIcon from '../../images/hurbee.gif';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface HurbeeChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HurbeeChatbot({ isOpen, onClose }: HurbeeChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Hurbee, your personal plant assistant. How can I help you with your garden today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userText = inputText.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userText }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "I'm sorry, I'm having trouble connecting to my garden brain right now.",
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "Bzzzzt! Something went wrong. Make sure my backend server is running!",
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end animate-in slide-in-from-bottom-5 duration-300">
          <div className="mb-4 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col h-[500px] max-h-[80vh]">
            
            {/* Header */}
            <div className="bg-primary/10 p-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-3">
                <div className="relative size-10 flex items-center justify-center">
                   <img src={hurbeeIcon} alt="Hurbee" className="w-full h-full object-contain drop-shadow-sm" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Hurbee</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="size-2 bg-green-500 rounded-full animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-black/5 rounded-full transition-colors text-muted-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/30">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                      <div className="size-8 rounded-full overflow-hidden shrink-0 mr-2 self-end mb-1">
                          <img src={hurbeeIcon} alt="Bot" className="w-full h-full object-contain" />
                      </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-card text-card-foreground border border-border rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="size-8 rounded-full overflow-hidden shrink-0 mr-2 self-end mb-1">
                    <img src={hurbeeIcon} alt="Bot" className="w-full h-full object-contain opacity-50" />
                  </div>
                  <div className="bg-card text-card-foreground border border-border px-4 py-2.5 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1">
                      <span className="size-1.5 bg-muted-foreground rounded-full animate-bounce" />
                      <span className="size-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="size-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-card border-t border-border">
              <form 
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-2 border border-transparent focus-within:border-primary/50 transition-colors"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask Hurbee anything..."
                  className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/70"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  <Send className="size-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}