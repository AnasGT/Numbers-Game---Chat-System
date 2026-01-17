import { Message, Player } from '../types';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === Player.USER;
  const isSystem = message.sender === Player.SYSTEM;

  if (isSystem) {
    return (
      <div className="flex justify-center my-4 animate-fadeIn">
        <span className="bg-slate-800/50 text-slate-400 text-xs py-1 px-3 rounded-full border border-slate-700/50">
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'} animate-slideUp`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Avatar / Name */}
        <span className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 ml-1">
          {isUser ? 'You' : 'Opponent'}
        </span>

        {/* Bubble */}
        <div className={`
          relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg
          ${isUser 
            ? 'bg-cyan-600 text-white rounded-tr-none' 
            : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
          }
        `}>
          {/* Main Text / Banter */}
          {message.text && <p>{message.text}</p>}

          {/* Guess & Feedback Block */}
          {message.isGuess && (
            <div className={`mt-2 p-2 rounded-lg bg-black/20 flex items-center justify-between gap-4 min-w-[160px]`}>
              <div className="flex flex-col">
                <span className="text-[10px] opacity-70 uppercase">Guess</span>
                <span className="text-xl font-mono font-bold tracking-widest">{message.text.match(/\d{3}/)?.[0] || '---'}</span>
              </div>
              
              {message.feedback && (
                <div className="flex flex-col items-end text-right">
                   <div className="flex items-center gap-1">
                      <span className={`text-lg font-bold ${message.feedback.bulls > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                        {message.feedback.bulls}
                      </span>
                      <span className="text-[10px] opacity-70">RIGHT</span>
                   </div>
                   <div className="flex items-center gap-1">
                      <span className={`text-lg font-bold ${message.feedback.cows > 0 ? 'text-yellow-400' : 'text-slate-500'}`}>
                        {message.feedback.cows}
                      </span>
                      <span className="text-[10px] opacity-70">CLOSE</span>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};