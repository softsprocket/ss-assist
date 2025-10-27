// Fix: Add global type declaration for window.showDirectoryPicker to fix TypeScript error.
declare global {
    interface Window {
        showDirectoryPicker: (options?: { mode: 'read' | 'readwrite' }) => Promise<FileSystemDirectoryHandle>;
    }
}

import React, { useState, useCallback } from 'react';
import { generateCode } from './services/geminiService';
import { getDirectoryContents, saveFileInDirectory } from './utils/fileSystem';
import { Header } from './components/Header';
import { PromptForm } from './components/PromptForm';
import { ChatWindow } from './components/ChatWindow';

interface AppError {
    title: string;
    message: string;
}

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [response, setResponse] = useState<string>('');
    const [error, setError] = useState<AppError | null>(null);
    const [hasStarted, setHasStarted] = useState<boolean>(false);
    const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);

    const handleSelectFolder = useCallback(async () => {
        console.log('[handleSelectFolder] Function called.');

        if (!('showDirectoryPicker' in window)) {
            console.error('[handleSelectFolder] File System Access API (showDirectoryPicker) is not supported in this browser.');
            setError({
                title: 'Browser Not Supported',
                message: 'Your browser does not support the File System Access API, which is required for folder selection. Please use a recent version of Chrome, Edge, or Opera.'
            });
            return;
        }
        console.log('[handleSelectFolder] File System Access API is supported.');

        try {
            console.log("[handleSelectFolder] Requesting directory picker with mode: 'readwrite'.");
            const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
            console.log('[handleSelectFolder] Successfully received directory handle:', handle);
            setDirectoryHandle(handle);
            setError(null); // Clear previous errors on success
        } catch (err) {
            console.error('[handleSelectFolder] Caught an error during showDirectoryPicker call.');
            console.error('[handleSelectFolder] Full error object:', err); // Log the full error object

            if (err instanceof Error) {
                 console.log(`[handleSelectFolder] Error is an instance of Error. Name: ${err.name}, Message: ${err.message}`);
                if (err.name === 'AbortError') {
                    console.log('[handleSelectFolder] User cancelled the file picker. This is normal.');
                    // User canceled the picker, which is normal. No error message is needed.
                    return;
                }
                if (err.name === 'SecurityError') {
                     console.log('[handleSelectFolder] SecurityError detected. Setting UI error message.');
                    setError({
                        title: 'Permission Denied',
                        message: `Access to the file system was blocked, likely by your browser's security settings. Please go to your browser's site settings for this page and ensure that <strong>'File and folder access'</strong> is set to 'Allow'. You may need to refresh the page after changing the setting.`
                    });
                } else {
                    console.log('[handleSelectFolder] An unexpected but known error type occurred. Setting UI error message.');
                    setError({
                        title: 'An Unexpected Error Occurred',
                        message: `${err.message}. Please check the browser console for more details.`
                    });
                }
            } else {
                 console.log('[handleSelectFolder] An unknown error type occurred. Setting UI error message.');
                setError({
                    title: 'Unknown Error',
                    message: 'An unknown error occurred. Please check your browser\'s security settings and permissions for this site.'
                });
            }
        }
    }, []);

    const handleClearFolder = useCallback(() => {
        setDirectoryHandle(null);
    }, []);

    const handleSaveFile = useCallback(async (filePath: string, content: string): Promise<boolean> => {
        if (!directoryHandle) {
            setError({ title: 'Save Error', message: 'No directory selected.' });
            return false;
        }
        try {
            await saveFileInDirectory(directoryHandle, filePath, content);
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error saving file.';
            console.error('Failed to save file:', err);
            setError({ title: 'Failed to Save File', message });
            return false;
        }
    }, [directoryHandle]);

    const handleGenerate = useCallback(async (prompt: string) => {
        if (!prompt || isLoading) return;
        
        setHasStarted(true);
        setIsLoading(true);
        setError(null);
        setResponse('');

        try {
            let fullPrompt = prompt;
            if (directoryHandle) {
                setLoadingMessage('Analyzing project files...');
                const context = await getDirectoryContents(directoryHandle);
                fullPrompt = `Project Context:\n${context}\n\nUser Request:\n${prompt}`;
            }
            setLoadingMessage('Generating response...');
            const result = await generateCode(fullPrompt);
            setResponse(result);
        } catch (e) {
            const message = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError({ title: 'Generation Error', message });
            console.error(e);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [isLoading, directoryHandle]);

    return (
        <div className="h-screen w-screen bg-gray-900 text-white flex flex-col font-sans">
            <Header 
                directoryHandle={directoryHandle}
                onSelectFolder={handleSelectFolder}
                onClearFolder={handleClearFolder}
            />
            <ChatWindow 
                response={response} 
                isLoading={isLoading} 
                loadingMessage={loadingMessage}
                error={error}
                hasStarted={hasStarted}
                directoryHandle={directoryHandle}
                onSaveFile={handleSaveFile}
            />
            <div className="w-full px-4 sm:px-6 lg:px-8">
               <PromptForm onSubmit={handleGenerate} isLoading={isLoading} />
            </div>
        </div>
    );
};

export default App;