
import React, { useState, useRef, useCallback } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface PromptFormProps {
    onSubmit: (prompt: string) => void;
    isLoading: boolean;
}

export const PromptForm: React.FC<PromptFormProps> = ({ onSubmit, isLoading }) => {
    const [prompt, setPrompt] = useState<string>('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleInput = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    }, []);

    const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
        e?.preventDefault();
        if (prompt.trim() && !isLoading) {
            onSubmit(prompt.trim());
            setPrompt('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="max-w-3xl mx-auto pb-4">
            <form onSubmit={handleSubmit} className="relative">
                <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a coding question..."
                    rows={1}
                    className="w-full bg-gray-800 border border-gray-600 rounded-xl resize-none text-gray-200 p-4 pr-20 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow duration-200"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !prompt.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-cyan-600 text-white font-semibold transition-all duration-200 enabled:hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <SparklesIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Generate</span>
                </button>
            </form>
        </div>
    );
};
