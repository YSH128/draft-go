import React from 'react';
import ChatBubble from '../../../components/ui/ChatBubble';
import ChatInput from '../../../components/ui/ChatInput';

export default function ChatSection({
    messages,
    chatContainerRef,
    onSendMessage
}) {
    return (
        <aside className="w-[380px] border-l border-[#393528] bg-black flex flex-col shadow-2xl z-20 h-[calc(100vh-var(--header-height))] sticky top-[var(--header-height)]">
            <div className="p-5 border-b border-[#393528] flex items-center justify-between bg-panel-dark">
                <h4 className="text-white font-bold flex items-center gap-2 uppercase tracking-wider text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">forum</span>
                    실시간 채팅 (Live Chat)
                </h4>
                <div className="flex items-center gap-2 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                    <div className="size-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
                    <span className="text-[10px] text-green-500 font-bold uppercase">Online</span>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-2 bg-[#0c0b09] flex flex-col min-h-0"
            >
                <div className="mt-auto"></div>
                {messages.map((msg) => (
                    <ChatBubble key={msg.id} sender={msg.sender} message={msg.message} variant={msg.variant} timestamp={msg.timestamp} />
                ))}
            </div>

            {/* Input Area */}
            <div className="p-5 bg-panel-dark border-t border-[#393528]">
                <ChatInput onSubmit={onSendMessage} />
            </div>
        </aside>
    );
}
