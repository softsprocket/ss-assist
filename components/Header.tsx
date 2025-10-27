
import React from 'react';
import { RobotIcon } from './icons/RobotIcon';

export const Header: React.FC = () => {
    return (
        <header className="flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 p-4">
            <div className="max-w-5xl mx-auto flex items-center gap-3">
                <RobotIcon className="w-8 h-8 text-cyan-400" />
                <h1 className="text-xl font-semibold text-gray-200">
                    Gemini Coding Assistant
                </h1>
            </div>
        </header>
    );
};
