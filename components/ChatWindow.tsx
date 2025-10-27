
import React, { useEffect, useRef } from 'react';
import { GeminiResponse } from './GeminiResponse';
import { RobotIcon } from './icons/RobotIcon';

interface ChatWindowProps {
    response: string;
    isLoading: boolean;
    error: string | null;
    hasStarted: boolean;
}

const WelcomeMessage: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
        <RobotIcon className="w-20 h-20 mb-4 text-gray-600"/>
        <h2 className="text-3xl font-bold text-gray-300">Gemini Coding Assistant</h2>
        <p className="mt-2 max-w-md">
            Ask me anything about code, from simple syntax questions to complex architectural problems.
        </p>
    </div>
);

const LoadingIndicator: React.FC = () => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <RobotIcon className="w-5 h-5 text-cyan-400 animate-pulse"/>
        </div>
        <div className="flex-1 pt-1.5 space-y-3">
            <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse"></div>
        </div>
    </div>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
        <h3 className="font-bold mb-2">An Error Occurred</h3>
        <p>{message}</p>
    </div>
);

export const ChatWindow: React.FC<ChatWindowProps> = ({ response, isLoading, error, hasStarted }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [response, isLoading, error]);

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">
                {!hasStarted ? (
                    <WelcomeMessage />
                ) : (
                    <>
                        {isLoading && <LoadingIndicator />}
                        {error && <ErrorMessage message={error} />}
                        {response && <GeminiResponse content={response} />}
                    </>
                )}
            </div>
        </div>
    );
};
