import React from 'react';
import { RobotIcon } from './icons/RobotIcon';
import { FolderIcon } from './icons/FolderIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface HeaderProps {
    directoryHandle: FileSystemDirectoryHandle | null;
    onSelectFolder: () => void;
    onClearFolder: () => void;
}

export const Header: React.FC<HeaderProps> = ({ directoryHandle, onSelectFolder, onClearFolder }) => {
    return (
        <header className="flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 p-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <RobotIcon className="w-8 h-8 text-cyan-400" />
                    <h1 className="text-xl font-semibold text-gray-200">
                        Gemini Coding Assistant
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    {directoryHandle ? (
                        <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm">
                            <FolderIcon className="w-5 h-5 text-cyan-400"/>
                            <span className="font-medium text-gray-300">{directoryHandle.name}</span>
                            <button onClick={onClearFolder} className="text-gray-500 hover:text-white transition-colors" title="Clear folder">
                                <XCircleIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    ) : (
                         <button 
                            onClick={onSelectFolder}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-sm font-medium"
                         >
                            <FolderIcon className="w-5 h-5"/>
                            <span>Select Folder</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};
