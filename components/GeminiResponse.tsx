
import React from 'react';
import { CodeBlock } from './CodeBlock';
import { RobotIcon } from './icons/RobotIcon';

interface GeminiResponseProps {
    content: string;
}

const TextBlock: React.FC<{ text: string }> = ({ text }) => {
    // Basic markdown-like substitutions
    const renderLine = (line: string) => {
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        line = line.replace(/__(.*?)__/g, '<strong>$1</strong>');
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
        line = line.replace(/_(.*?)_/g, '<em>$1</em>');
        line = line.replace(/`(.*?)`/g, '<code class="bg-gray-700/50 rounded px-1.5 py-1 font-mono text-sm text-cyan-300">$1</code>');
        return <p dangerouslySetInnerHTML={{ __html: line }} />;
    };

    return (
        <div className="prose prose-invert max-w-none text-gray-300 leading-7 space-y-4">
            {text.trim().split('\n').map((line, i) => {
                if (line.trim().startsWith('- ')) {
                    return <ul key={i} className="list-disc pl-5"><li className="pl-2">{renderLine(line.substring(2))}</li></ul>
                }
                if (/^\d+\.\s/.test(line.trim())) {
                    return <ol key={i} className="list-decimal pl-5"><li className="pl-2">{renderLine(line.replace(/^\d+\.\s/, ''))}</li></ol>
                }
                return <div key={i}>{renderLine(line)}</div>;
            })}
        </div>
    );
};

export const GeminiResponse: React.FC<GeminiResponseProps> = ({ content }) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return (
         <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center ring-2 ring-gray-600">
                <RobotIcon className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1 space-y-6">
                {parts.map((part, index) => {
                    if (part.startsWith('```') && part.endsWith('```')) {
                        const codeBlock = part.slice(3, -3);
                        const firstNewLineIndex = codeBlock.indexOf('\n');
                        const language = codeBlock.substring(0, firstNewLineIndex).trim();
                        const code = codeBlock.substring(firstNewLineIndex + 1);
                        return <CodeBlock key={index} code={code} language={language} />;
                    } else if (part.trim()) {
                        return <TextBlock key={index} text={part} />;
                    }
                    return null;
                })}
            </div>
        </div>
    );
};
