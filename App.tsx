
import React, { useState, useCallback } from 'react';
import { generateCode } from './services/geminiService';
import { Header } from './components/Header';
import { PromptForm } from './components/PromptForm';
import { ChatWindow } from './components/ChatWindow';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [response, setResponse] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [hasStarted, setHasStarted] = useState<boolean>(false);

    const handleGenerate = useCallback(async (prompt: string) => {
        if (!prompt || isLoading) return;
        
        setHasStarted(true);
        setIsLoading(true);
        setError(null);
        setResponse('');

        try {
            const result = await generateCode(prompt);
            setResponse(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading]);

    return (
        <div className="h-screen w-screen bg-gray-900 text-white flex flex-col font-sans">
            <Header />
            <ChatWindow 
                response={response} 
                isLoading={isLoading} 
                error={error}
                hasStarted={hasStarted}
            />
            <div className="w-full px-4 sm:px-6 lg:px-8">
               <PromptForm onSubmit={handleGenerate} isLoading={isLoading} />
            </div>
        </div>
    );
};

export default App;
