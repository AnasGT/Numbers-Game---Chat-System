import React, { useState, useEffect, useRef } from 'react';
import { GameStatus, Player, Message, TurnHistoryItem } from './types';
import { generateSecretNumber, isValidNumber, calculateFeedback } from './utils/gameLogic';
import { getAIGuess } from './services/geminiService';
import { ChatBubble } from './components/ChatBubble';
import { Button } from './components/Button';

// Icons
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
);

export default function App() {
  // Game State
  const [status, setStatus] = useState<GameStatus>(GameStatus.LOBBY);
  const [userSecret, setUserSecret] = useState<string>('');
  const [aiSecret, setAiSecret] = useState<string>('');
  const [turn, setTurn] = useState<Player | null>(null);
  
  // Chat & Data State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [aiHistory, setAiHistory] = useState<TurnHistoryItem[]>([]);
  const [userGuessHistory, setUserGuessHistory] = useState<TurnHistoryItem[]>([]);
  
  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Helpers ---

  const addMessage = (sender: Player, text: string, isGuess = false, feedback?: any) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      sender,
      text,
      isGuess,
      feedback,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- Game Lifecycle ---

  const handleStartMatchmaking = () => {
    setStatus(GameStatus.LOBBY);
    // Simulate finding a player
    setTimeout(() => {
      setStatus(GameStatus.SETUP);
    }, 1500);
  };

  const handleConfirmSecret = () => {
    if (!isValidNumber(inputValue)) {
      alert("Please enter 3 unique digits (e.g., 398)");
      return;
    }
    setUserSecret(inputValue);
    setAiSecret(generateSecretNumber()); // AI generates its secret
    setInputValue('');
    setStatus(GameStatus.PLAYING);
    
    // Random Start
    const startingPlayer = Math.random() > 0.5 ? Player.USER : Player.AI;
    setTurn(startingPlayer);
    
    addMessage(Player.SYSTEM, `Game Started! Secret codes locked. ${startingPlayer === Player.USER ? "You start" : "Opponent starts"}.`);
    
    if (startingPlayer === Player.AI) {
      setTimeout(handleAITurn, 1000);
    }
  };

  const handleUserGuess = () => {
    if (turn !== Player.USER) return;
    if (!isValidNumber(inputValue)) {
      // Small visual shake or alert could go here
      return; 
    }

    const guess = inputValue;
    const feedback = calculateFeedback(aiSecret, guess);
    
    // Add User Guess to Chat
    addMessage(Player.USER, guess, true, feedback);
    setInputValue('');
    
    // Save history (optional, for UI stats later)
    setUserGuessHistory([...userGuessHistory, { guess, feedback }]);

    // Check Win
    if (feedback.bulls === 3) {
      setStatus(GameStatus.GAME_OVER);
      addMessage(Player.SYSTEM, "You cracked the code! You Win! 🏆");
    } else {
      setTurn(Player.AI); // Switch to AI
    }
  };

  const handleAITurn = async () => {
    if (status !== GameStatus.PLAYING) return;

    // Simulate thinking time
    addMessage(Player.SYSTEM, "Opponent is thinking...");
    
    // Call Gemini
    const { guess, banter } = await getAIGuess(aiHistory);
    
    // Calculate result against USER's secret
    const feedback = calculateFeedback(userSecret, guess);
    
    // Update AI History so it learns
    setAiHistory((prev) => [...prev, { guess, feedback }]);

    // Remove "Thinking" (Simplest way is just to append new message, user won't notice previous system msg much)
    // In a real app we might remove the specific loading ID.

    // Post AI Guess
    addMessage(Player.AI, banter || guess, true, feedback);

    // Check Win
    if (feedback.bulls === 3) {
      setStatus(GameStatus.GAME_OVER);
      addMessage(Player.SYSTEM, `Opponent cracked your code (${userSecret})! You Lose. 💀`);
    } else {
      setTurn(Player.USER); // Switch to User
    }
  };

  // Effect to trigger AI turn when state changes to AI
  useEffect(() => {
    if (status === GameStatus.PLAYING && turn === Player.AI) {
      handleAITurn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, status]);


  const resetGame = () => {
    setStatus(GameStatus.LOBBY);
    setMessages([]);
    setAiHistory([]);
    setUserGuessHistory([]);
    setUserSecret('');
    setAiSecret('');
    setInputValue('');
    setTurn(null);
  };

  // --- Render Sections ---

  if (status === GameStatus.LOBBY) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-slate-950 p-6 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[128px]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[128px]"></div>
        </div>

        <div className="z-10 flex flex-col items-center max-w-md w-full text-center space-y-8 animate-fadeIn">
          <div className="mb-4">
            <div className="w-24 h-24 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl rotate-3 flex items-center justify-center shadow-2xl shadow-cyan-500/20 mx-auto">
              <span className="text-4xl font-mono font-bold text-white">398</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-white">
            MindMatch
          </h1>
          <p className="text-slate-400 text-lg">
            Multiplayer Number Duel. <br/>
            Crack the code before your opponent does.
          </p>

          <Button 
            variant="primary" 
            fullWidth 
            className="text-lg py-4 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
            onClick={handleStartMatchmaking}
          >
            Find Match
          </Button>

          <div className="flex gap-4 text-xs text-slate-500 font-mono mt-8">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              24 Players Online
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              Gemini AI Active
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === GameStatus.SETUP) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-950 p-6 animate-fadeIn">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="p-4 bg-slate-800 rounded-full">
              <LockIcon />
            </div>
            <h2 className="text-2xl font-bold text-white">Set Your Secret Code</h2>
            <p className="text-slate-400 text-center text-sm">
              Choose 3 unique digits (e.g. 398). <br/>
              Your opponent will try to guess this.
            </p>
          </div>

          <div className="relative mb-6">
            <input 
              type="text" 
              maxLength={3}
              inputMode="numeric"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="_ _ _"
              className="w-full bg-slate-950 border-2 border-slate-700 focus:border-cyan-500 rounded-2xl py-6 text-center text-5xl font-mono tracking-[0.5em] text-cyan-400 outline-none transition-colors placeholder:text-slate-800"
            />
          </div>

          <Button 
            fullWidth 
            onClick={handleConfirmSecret}
            disabled={inputValue.length !== 3}
          >
            Lock In Code
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 max-w-2xl mx-auto shadow-2xl overflow-hidden md:border-x md:border-slate-800">
      
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold">
            AI
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-200">Opponent</span>
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
            </span>
          </div>
        </div>

        {/* Secret Display (Hidden/Revealed) */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase text-slate-500 tracking-wider">Your Code</span>
          <span className="font-mono text-cyan-400 font-bold tracking-widest">
            {userSecret}
          </span>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide space-y-2">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        {status === GameStatus.GAME_OVER && (
            <div className="flex justify-center mt-8 mb-4">
                <Button onClick={resetGame} variant="secondary">
                    <RefreshIcon /> Play Again
                </Button>
            </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      {status === GameStatus.PLAYING && (
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <div className={`relative transition-opacity duration-300 ${turn === Player.AI ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <form 
              onSubmit={(e) => { e.preventDefault(); handleUserGuess(); }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                maxLength={3}
                inputMode="numeric"
                value={inputValue}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  // Prevent duplicate digits for better UX
                  const uniqueVal = Array.from(new Set(val.split(''))).join('');
                  // Actually, let user type duplicates then fail valid check logic so they learn rules? 
                  // Or restrict? Let's restrict strictly to 3 chars, but validate uniqueness on submit for simplicity here.
                  setInputValue(val); 
                }}
                placeholder={turn === Player.USER ? "Enter 3 digits..." : "Opponent's turn..."}
                className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 font-mono text-lg focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-700"
                autoFocus
              />
              <Button 
                type="submit" 
                variant="primary" 
                className="!py-3 !px-4 !rounded-xl"
                disabled={inputValue.length !== 3 || turn !== Player.USER}
              >
                <SendIcon />
              </Button>
            </form>
            {turn === Player.USER && (
              <p className="text-[10px] text-slate-500 mt-2 text-center">
                Guess the opponent's 3-digit number (Unique digits)
              </p>
            )}
            {turn === Player.AI && (
              <p className="text-[10px] text-cyan-500/70 mt-2 text-center animate-pulse">
                Opponent is calculating...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}