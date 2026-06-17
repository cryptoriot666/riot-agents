'use client'

interface ChatBubbleProps {
  role: 'user' | 'agent'
  content: string
  agentName?: string
  timestamp?: number
}

export function ChatBubble({ role, content, agentName, timestamp }: ChatBubbleProps) {
  const isUser = role === 'user'

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-up`}>
      <div
        className={`max-w-[75%] px-5 py-3 font-mono text-sm leading-relaxed relative ${
          isUser
            ? 'bg-blood text-white rounded-l-lg rounded-tr-lg'
            : 'bg-ink text-cream rounded-r-lg rounded-tl-lg punk-border border-ink'
        }`}
        style={isUser ? { boxShadow: '2px 2px 0 rgba(0,0,0,0.3)' } : undefined}
      >
        {!isUser && agentName && (
          <span className="text-highlight font-display text-xs tracking-widest uppercase block mb-1">
            {agentName}
          </span>
        )}
        <p className="whitespace-pre-wrap">{content}</p>
        {timestamp && (
          <span className={`text-[10px] mt-2 block ${isUser ? 'text-red-200' : 'text-ink/40'}`}>
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        )}

        {!isUser && (
          <div
            className="absolute -left-2 top-4 w-0 h-0"
            style={{
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderRight: '8px solid #111111'
            }}
          />
        )}
      </div>
    </div>
  )
}

export function TypingIndicator({ name }: { name?: string }) {
  return (
    <div className="flex justify-start mb-4 animate-fade-up">
      <div className="bg-ink/90 text-cream px-5 py-4 rounded-r-lg rounded-tl-lg punk-border border-ink">
        {name && (
          <span className="text-highlight font-display text-xs tracking-widest uppercase block mb-2">
            {name}
          </span>
        )}
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cream typing-dot" />
          <span className="w-2 h-2 rounded-full bg-cream typing-dot" />
          <span className="w-2 h-2 rounded-full bg-cream typing-dot" />
        </div>
      </div>
    </div>
  )
}
