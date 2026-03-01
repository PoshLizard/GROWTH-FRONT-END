import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Leaf, Sprout } from 'lucide-react';
import { useGardens } from '../context/GardenContext';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { gardens } = useGardens();

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
    
    // Simulate bot thinking and response
    setTimeout(() => {
      const botResponse = generateResponse(inputText, gardens);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: botResponse,
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    }, 1000);
  };

  return (
    <>
      {/* Chat Window */}
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
                  placeholder="Ask about your plants..."
                  className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/70"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
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

// Simple logic to generate responses based on keywords and context
function generateResponse(input: string, gardens: any[]): string {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
    return "Hello! I'm here to help you grow. What's on your mind?";
  }

  if (lowerInput.includes('water') || lowerInput.includes('watering')) {
    return "Most plants prefer to be watered when the top inch of soil feels dry. Check your specific plant's needs in the details view!";
  }
  
  if (lowerInput.includes('sun') || lowerInput.includes('light')) {
    return "Light is crucial! Make sure your plants are getting the right amount of direct or indirect sunlight based on their type.";
  }

  if (lowerInput.includes('my plant') || lowerInput.includes('status') || lowerInput.includes('how are they')) {
      const plantCount = gardens.reduce((acc, g) => acc + g.plants.length, 0);
      const unhealthyCount = gardens.reduce((acc, g) => acc + g.plants.filter((p: any) => !p.isHealthy).length, 0);
      
      if (plantCount === 0) return "You haven't added any plants yet! Start by adding a garden and some plants.";
      if (unhealthyCount > 0) return `You have ${plantCount} plants total, but ${unhealthyCount} need attention. Check for alerts!`;
      return `Your ${plantCount} plants are looking great! Keep up the good work.`;
  }
  
  if (lowerInput.includes('thank')) {
      return "You're welcome! Happy gardening! 🌱";
  }

  return "That's an interesting question about gardening! While I'm still learning, I'd recommend checking the specific care instructions for your plant type.";
}
