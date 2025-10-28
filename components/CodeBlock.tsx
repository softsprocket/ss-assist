import React, { useState, useCallback } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SaveIcon } from './icons/SaveIcon';

interface CodeBlockProps {
    code: string;
    language?: string;
    directoryHandle: FileSystemDirectoryHandle | null;
    onSaveFile: (filePath: string, content: string) => Promise<boolean>;
    suggestedFilePath?: string | null;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, directoryHandle, onSaveFile, suggestedFilePath }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(code).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    }, [code]);

    const handleSave = useCallback(async () => {
        const filePath = window.prompt("Enter file path to save:", suggestedFilePath || "");
        if (filePath) {
            setSaveState('saving');
            const success = await onSaveFile(filePath, code);
            if (success) {
                setSaveState('saved');
                setTimeout(() => setSaveState('idle'), 2000);
            } else {
                setSaveState('error');
                setTimeout(() => setSaveState('idle'), 3000);
            }
        }
    }, [code, onSaveFile, suggestedFilePath]);

    const getSaveButtonContent = () => {
        switch (saveState) {
            case 'saving':
                return <><span>Saving...</span></>;
            case 'saved':
                return <><CheckIcon className="w-4 h-4 text-green-400" /><span>Saved!</span></>;
            case 'error':
                return <><span>Error</span></>;
            default:
                return <><SaveIcon className="w-4 h-4" /><span>Save</span></>;
        }
    }

    return (
        <div className="bg-gray-900/70 rounded-lg border border-gray-700/50 overflow-hidden my-4">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-800/80">
                <span className="text-gray-400 text-xs font-sans uppercase tracking-wider">
                    {language || 'code'}
                </span>
                <div className="flex items-center gap-4">
                    {directoryHandle && (
                        <button
                            onClick={handleSave}
                            disabled={saveState !== 'idle'}
                            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-wait"
                        >
                            {getSaveButtonContent()}
                        </button>
                    )}
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
            </div>
            <pre className="p-4 text-sm overflow-x-auto text-gray-200">
                <code className={`language-${language}`}>{code}</code>
            </pre>
        </div>
    );
};