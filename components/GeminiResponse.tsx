import React from 'react';
import { CodeBlock } from './CodeBlock';
import { RobotIcon } from './icons/RobotIcon';

interface GeminiResponseProps {
    content: string;
    directoryHandle: FileSystemDirectoryHandle | null;
    onSaveFile: (filePath: string, content: string) => Promise<boolean>;
}

const TextBlock: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.trim().split('\n');
    const elements: React.ReactNode[] = [];
    let listType: 'ul' | 'ol' | null = null;
    let listItems: React.ReactNode[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            if (listType === 'ul') {
                elements.push(<ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-2">{listItems}</ul>);
            }
            if (listType === 'ol') {
                elements.push(<ol key={`ol-${elements.length}`} className="list-decimal pl-5 space-y-2">{listItems}</ol>);
            }
        }
        listItems = [];
        listType = null;
    };

    const renderLineContent = (line: string) => {
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        line = line.replace(/__(.*?)__/g, '<strong>$1</strong>');
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
        line = line.replace(/_(.*?)_/g, '<em>$1</em>');
        line = line.replace(/`(.*?)`/g, '<code class="bg-gray-700/50 rounded px-1.5 py-1 font-mono text-sm text-cyan-300">$1</code>');
        return <span dangerouslySetInnerHTML={{ __html: line }} />;
    };

    lines.forEach((line, i) => {
        const isUl = line.trim().startsWith('- ');
        const isOl = /^\d+\.\s/.test(line.trim());

        if (isUl) {
            if (listType !== 'ul') flushList();
            listType = 'ul';
            listItems.push(<li key={i}>{renderLineContent(line.substring(2))}</li>);
        } else if (isOl) {
            if (listType !== 'ol') flushList();
            listType = 'ol';
            listItems.push(<li key={i}>{renderLineContent(line.replace(/^\d+\.\s/, ''))}</li>);
        } else {
            flushList();
            if (line.trim()) {
                elements.push(<p key={i}>{renderLineContent(line)}</p>);
            }
        }
    });

    flushList();

    return (
        <div className="prose prose-invert max-w-none text-gray-300 leading-7 space-y-4">
            {elements}
        </div>
    );
};


export const GeminiResponse: React.FC<GeminiResponseProps> = ({ content, directoryHandle, onSaveFile }) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    const filePathRegex = /`((?:\.?\/)?[\w\d-]+\/)*[\w\d-]+\.\w+`/g;
    
    let suggestedFilePath: string | null = null;
    const renderedParts = [];

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part.startsWith('```') && part.endsWith('```')) {
            const codeBlock = part.slice(3, -3);
            const firstNewLineIndex = codeBlock.indexOf('\n');
            const language = codeBlock.substring(0, firstNewLineIndex).trim();
            const code = codeBlock.substring(firstNewLineIndex + 1);
            
            renderedParts.push(
                <CodeBlock
                    key={i}
                    code={code}
                    language={language}
                    directoryHandle={directoryHandle}
                    onSaveFile={onSaveFile}
                    suggestedFilePath={suggestedFilePath}
                />
            );
            suggestedFilePath = null; 
        } else if (part.trim()) {
            const matches = [...part.matchAll(filePathRegex)];
            if (matches.length > 0) {
                const lastMatch = matches[matches.length - 1][0];
                suggestedFilePath = lastMatch.replace(/`/g, '');
            }
            renderedParts.push(<TextBlock key={i} text={part} />);
        }
    }

    return (
         <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center ring-2 ring-gray-600">
                <RobotIcon className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1 space-y-6">
                {renderedParts.length > 0 ? renderedParts : <TextBlock text={content} />}
            </div>
        </div>
    );
};