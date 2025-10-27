
import React, { useState, useCallback } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

interface CodeBlockProps {
    code: string;
    language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(code).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    }, [code]);

    return (
        <div className="bg-gray-900/70 rounded-lg border border-gray-700/50 overflow-hidden my-4">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-800/80">
                <span className="text-gray-400 text-xs font-sans uppercase tracking-wider">
                    {language || 'code'}
                </span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors"
                >
                    {isCopied ? (
                        <>
                            <CheckIcon className="w-4 h-4 text-green-400" />
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <CopyIcon className="w-4 h-4" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <pre className="p-4 text-sm overflow-x-auto text-gray-200">
                <code className={`language-${language}`}>{code}</code>
            </pre>
        </div>
    );
};
