"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HelpCircle } from "lucide-react";

type CatState = "idle" | "wave" | "thinking" | "celebrating" | "pointing";

interface CompanionMessage {
  id: string;
  text: string;
  type: "tip" | "celebration" | "help" | "guide";
  context?: string;
  dismissible?: boolean;
  autoDismiss?: number; // seconds
}

interface CatCompanionProps {
  messages?: CompanionMessage[];
  onDismiss?: (messageId: string) => void;
  className?: string;
}

const CatSVG: React.FC<{ state: CatState; className?: string }> = ({ state, className = "" }) => {
  const isIdle = state === "idle";
  const isWaving = state === "wave";
  const isThinking = state === "thinking"; 
  const isCelebrating = state === "celebrating";
  const isPointing = state === "pointing";

  return (
    <motion.svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      className={className}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Cat body */}
      <motion.ellipse
        cx="30"
        cy="40"
        rx="18"
        ry="16"
        fill="#2B2118"
        animate={isCelebrating ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.6, repeat: isCelebrating ? Infinity : 0 }}
      />
      
      {/* Cat head */}
      <motion.circle
        cx="30"
        cy="25"
        r="15"
        fill="#2B2118"
        animate={isThinking ? { rotate: [-5, 5, -5, 0] } : {}}
        transition={{ duration: 2, repeat: isThinking ? Infinity : 0 }}
      />
      
      {/* Left ear */}
      <motion.polygon
        points="20,15 25,5 30,15"
        fill="#2B2118"
        animate={isWaving ? { rotate: [0, -10, 0] } : {}}
        transition={{ duration: 0.5, repeat: isWaving ? Infinity : 0 }}
      />
      
      {/* Right ear */}
      <motion.polygon
        points="30,15 35,5 40,15"
        fill="#2B2118"
        animate={isWaving ? { rotate: [0, 10, 0] } : {}}
        transition={{ duration: 0.5, repeat: isWaving ? Infinity : 0, delay: 0.1 }}
      />
      
      {/* Inner ears */}
      <polygon points="22,12 25,8 28,12" fill="#B08D57" />
      <polygon points="32,12 35,8 38,12" fill="#B08D57" />
      
      {/* Eyes */}
      <motion.circle
        cx="25"
        cy="22"
        r="3"
        fill="#B08D57"
        animate={isIdle ? { scaleY: [1, 0.1, 1] } : {}}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
      />
      <motion.circle
        cx="35"
        cy="22"
        r="3"
        fill="#B08D57"
        animate={isIdle ? { scaleY: [1, 0.1, 1] } : {}}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
      />
      
      {/* Eye highlights */}
      <circle cx="26" cy="21" r="1" fill="#F6F1E7" />
      <circle cx="36" cy="21" r="1" fill="#F6F1E7" />
      
      {/* Nose */}
      <polygon points="30,26 28,28 32,28" fill="#8B7355" />
      
      {/* Mouth */}
      <path d="M 30 28 Q 28 30 26 29" stroke="#8B7355" strokeWidth="1.5" fill="none" />
      <path d="M 30 28 Q 32 30 34 29" stroke="#8B7355" strokeWidth="1.5" fill="none" />
      
      {/* Tail */}
      <motion.path
        d="M 12 45 Q 8 35 15 30 Q 20 35 18 45"
        fill="#2B2118"
        animate={isIdle || isWaving ? { d: [
          "M 12 45 Q 8 35 15 30 Q 20 35 18 45",
          "M 12 45 Q 6 32 12 28 Q 18 32 16 45",
          "M 12 45 Q 8 35 15 30 Q 20 35 18 45"
        ]} : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Pointing paw (only visible when pointing) */}
      {isPointing && (
        <motion.g
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ellipse cx="50" cy="30" rx="6" ry="3" fill="#2B2118" transform="rotate(30 50 30)" />
        </motion.g>
      )}
      
      {/* Celebration sparkles */}
      {isCelebrating && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <circle cx="45" cy="15" r="1" fill="#B08D57" />
          <circle cx="15" cy="20" r="1" fill="#B08D57" />
          <circle cx="48" cy="35" r="1" fill="#B08D57" />
          <circle cx="12" cy="35" r="1" fill="#B08D57" />
        </motion.g>
      )}
    </motion.svg>
  );
};

const SpeechBubble: React.FC<{
  message: CompanionMessage;
  onDismiss: () => void;
}> = ({ message, onDismiss }) => {
  useEffect(() => {
    if (message.autoDismiss) {
      const timer = setTimeout(onDismiss, message.autoDismiss * 1000);
      return () => clearTimeout(timer);
    }
  }, [message.autoDismiss, onDismiss]);

  const getBubbleStyle = () => {
    switch (message.type) {
      case "celebration":
        return "halftone-emphasis";
      case "help":
        return "bg-blue-50 border-blue-300";
      case "guide":
        return "bg-brass/10 border-brass/30";
      default:
        return "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl text-neutral-900 ${getBubbleStyle()}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-neutral-900 leading-relaxed">
          {message.text}
        </p>
        {message.dismissible && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded text-neutral-400 hover:text-neutral-900 transition-colors"
            aria-label="Dismiss message"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

const helpResponses = [
  "Try exploring your Journey page to set new goals!",
  "Check out the Progress section to see your learning patterns.",
  "Save items to your notes for later reflection.",
  "Use the 'Summarize for me' button to get AI-powered insights.",
  "Export your notes as a beautiful PDF to study offline!",
  "Your feed is curated based on your aspirations - update them anytime.",
];

export const CatCompanion: React.FC<CatCompanionProps> = ({
  messages = [],
  onDismiss,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMessages, setActiveMessages] = useState<CompanionMessage[]>(messages);
  const [catStateOverride, setCatStateOverride] = useState<CatState | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Keep local message list in sync with props — adjusting state during
  // render is the React-sanctioned pattern for derived state from props.
  const [prevMessages, setPrevMessages] = useState<CompanionMessage[]>(messages);
  if (prevMessages !== messages) {
    setPrevMessages(messages);
    setActiveMessages(messages);
    setCatStateOverride(null);
  }

  // Cat state is derived from the latest message — no effect needed.
  const catState: CatState =
    catStateOverride ??
    (activeMessages.length === 0
      ? "idle"
      : (() => {
          switch (activeMessages[activeMessages.length - 1].type) {
            case "celebration":
              return "celebrating";
            case "guide":
              return "pointing";
            case "help":
              return "thinking";
            default:
              return "wave";
          }
        })());

  const handleDismissMessage = (messageId: string) => {
    setActiveMessages(prev => prev.filter(m => m.id !== messageId));
    onDismiss?.(messageId);
  };

  const handleCompanionClick = () => {
    if (activeMessages.length > 0) {
      setIsExpanded(!isExpanded);
    } else {
      // Show help menu
      setShowHelp(true);
      setCatStateOverride("wave");
    }
  };

  const handleHelpResponse = () => {
    const randomResponse = helpResponses[Math.floor(Math.random() * helpResponses.length)];
    const helpMessage: CompanionMessage = {
      id: `help-${Date.now()}`,
      text: randomResponse,
      type: "help",
      dismissible: true,
      autoDismiss: 8,
    };
    
    setActiveMessages([helpMessage]);
    setCatStateOverride(null);
    setShowHelp(false);
    setIsExpanded(true);
  };

  const hasMessages = activeMessages.length > 0;
  const hasActiveBubbles = isExpanded && hasMessages;

  return (
    <div className={`companion-container ${hasMessages ? 'companion-active' : ''} ${className}`}>
      {/* Speech bubbles */}
      <AnimatePresence>
        {hasActiveBubbles && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-4 space-y-2"
          >
            {activeMessages.map((message) => (
              <SpeechBubble
                key={message.id}
                message={message}
                onDismiss={() => handleDismissMessage(message.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help menu */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl"
          >
            <p className="text-sm font-semibold text-neutral-900 mb-3">
              What would you like to know?
            </p>
            <div className="space-y-2">
              <button
                onClick={handleHelpResponse}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-900 hover:bg-neutral-100 transition-all"
              >
                <HelpCircle size={14} />
                What should I do next?
              </button>
              <button
                onClick={() => setShowHelp(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-all"
              >
                <X size={14} />
                Never mind
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cat companion */}
      <motion.button
        onClick={handleCompanionClick}
        className="relative group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Chat with companion"
      >
        <div className="relative">
          <CatSVG state={catState} />
          
          {/* Notification indicator */}
          {hasMessages && !isExpanded && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-comic-magenta rounded-full border-2 border-card flex items-center justify-center"
            >
              <span className="text-xs font-bold text-card">
                {activeMessages.length}
              </span>
            </motion.div>
          )}
          
          {/* Hover hint */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 bg-ink text-card px-2 py-1 rounded text-xs font-medium pointer-events-none"
          >
            {hasMessages ? 'View messages' : 'Need help?'}
          </motion.div>
        </div>
      </motion.button>
    </div>
  );
};

// Hook for managing companion messages
export const useCompanionMessages = () => {
  const [messages, setMessages] = useState<CompanionMessage[]>([]);

  const addMessage = (message: Omit<CompanionMessage, 'id'>) => {
    const newMessage: CompanionMessage = {
      ...message,
      id: `msg-${Date.now()}`,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const dismissMessage = (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    
    // Store dismissal to avoid showing again
    if (typeof window !== 'undefined') {
      const dismissed = JSON.parse(
        localStorage.getItem('companion-dismissed') || '[]'
      );
      dismissed.push(messageId);
      localStorage.setItem('companion-dismissed', JSON.stringify(dismissed));
    }
  };

  const clearAllMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    addMessage,
    dismissMessage,
    clearAllMessages,
  };
};