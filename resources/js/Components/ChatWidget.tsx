import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export default function ChatWidget() {
    const { t } = useLaravelReactI18n();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, open]);

    const send = async () => {
        const text = input.trim();
        if (!text || sending) return;

        const next: ChatMessage[] = [...messages, { role: 'user', content: text }];
        setMessages(next);
        setInput('');
        setSending(true);

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': xsrfToken(),
                },
                body: JSON.stringify({ messages: next.slice(-20) }),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            setMessages([...next, { role: 'assistant', content: data.reply }]);
        } catch {
            setMessages([...next, { role: 'assistant', content: t('chat.error') }]);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end">
            {open && (
                <div className="mb-3 w-[min(92vw,380px)] h-[520px] max-h-[70vh] bg-white rounded-[22px] shadow-2xl border border-[#e4ddd0] flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-[#16241b] px-5 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#2e4a39] flex items-center justify-center">
                            <MessageCircle size={18} className="text-[#f0a05e]" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white text-[14px] font-semibold leading-tight">{t('chat.title')}</p>
                            <p className="text-white/60 text-[11px]">{t('chat.subtitle')}</p>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            aria-label="Close chat"
                            className="text-white/60 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#fbf8f2]">
                        <div className="flex justify-start">
                            <div className="max-w-[85%] rounded-[16px] rounded-bl-[4px] bg-white border border-[#e4ddd0] px-4 py-2.5 text-[13px] leading-[20px] text-[#16241b]">
                                {t('chat.greeting')}
                            </div>
                        </div>
                        {messages.map((message, i) => (
                            <div key={i} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[85%] rounded-[16px] px-4 py-2.5 text-[13px] leading-[20px] whitespace-pre-wrap ${
                                        message.role === 'user'
                                            ? 'bg-[#2e4a39] text-white rounded-br-[4px]'
                                            : 'bg-white border border-[#e4ddd0] text-[#16241b] rounded-bl-[4px]'
                                    }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}
                        {sending && (
                            <div className="flex justify-start">
                                <div className="rounded-[16px] rounded-bl-[4px] bg-white border border-[#e4ddd0] px-4 py-2.5 text-[13px] text-[#8a968d]">
                                    <span className="inline-flex gap-1">
                                        <span className="animate-bounce">·</span>
                                        <span className="animate-bounce [animation-delay:120ms]">·</span>
                                        <span className="animate-bounce [animation-delay:240ms]">·</span>
                                    </span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-[#e4ddd0] bg-white p-3 flex items-center gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    send();
                                }
                            }}
                            placeholder={t('chat.placeholder')}
                            className="flex-1 rounded-full border-2 border-[#e4ddd0] px-4 py-2 text-[13px] text-[#16241b] placeholder-[#8a968d] focus:border-[#6e8c79] focus:outline-none"
                        />
                        <button
                            onClick={send}
                            disabled={sending || !input.trim()}
                            aria-label="Send message"
                            className="w-9 h-9 rounded-full bg-[#2e4a39] text-white flex items-center justify-center hover:bg-[#16241b] transition-colors disabled:opacity-50 shrink-0"
                        >
                            <Send size={15} />
                        </button>
                    </div>
                </div>
            )}

            <button
                onClick={() => setOpen((o) => !o)}
                aria-label="Open chat"
                className="w-14 h-14 rounded-full bg-[#2e4a39] text-white shadow-xl flex items-center justify-center hover:bg-[#16241b] transition-colors"
            >
                {open ? <X size={22} /> : <MessageCircle size={22} />}
            </button>
        </div>
    );
}
