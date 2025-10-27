const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.vscode', '.idea']);
const IGNORED_FILES = new Set(['.DS_Store', 'package-lock.json', 'yarn.lock']);
const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1MB

async function formatFileContent(entry: FileSystemFileHandle, path: string): Promise<string> {
    try {
        const file = await entry.getFile();
        if (file.size > MAX_FILE_SIZE_BYTES) {
            return `\n---\nFile: ${path}/${entry.name} (file too large, skipped)\n`;
        }
        
        const isLikelyText = file.type.startsWith('text/') || 
                              file.type.includes('json') || 
                              file.type.includes('javascript') ||
                              file.type.includes('typescript') ||
                              file.type.includes('xml') ||
                              file.type.includes('css') ||
                              file.type.includes('html') ||
                              file.type === '';

        if (!isLikelyText) {
             return `\n---\nFile: ${path}/${entry.name} (binary file, skipped)\n`;
        }
                              
        const fileContent = await file.text();
        if (fileContent.includes('\uFFFD')) { // Check for replacement character, indicating binary read as text
             return `\n---\nFile: ${path}/${entry.name} (likely binary, skipped)\n`;
        }
        const filePath = `${path}/${entry.name}`;
        return `\n---\nFile: ${filePath}\n\`\`\`\n${fileContent}\n\`\`\`\n`;
    } catch (e) {
        console.warn(`Could not read file ${path}/${entry.name}:`, e);
        return `\n---\nFile: ${path}/${entry.name} (could not be read)\n`;
    }
}

async function getDirectoryContentsRecursive(
    dirHandle: FileSystemDirectoryHandle,
    path: string
): Promise<string> {
    let content = '';
    const entries = [];
    for await (const entry of dirHandle.values()) {
        entries.push(entry);
    }
    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
        if (entry.kind === 'directory') {
            if (IGNORED_DIRS.has(entry.name)) {
                continue;
            }
            content += await getDirectoryContentsRecursive(entry, `${path}/${entry.name}`);
        } else if (entry.kind === 'file') {
            if (IGNORED_FILES.has(entry.name)) {
                continue;
            }
            content += await formatFileContent(entry as FileSystemFileHandle, path);
        }
    }
    return content;
}

export async function getDirectoryContents(dirHandle: FileSystemDirectoryHandle): Promise<string> {
    return getDirectoryContentsRecursive(dirHandle, '');
}

export async function saveFileInDirectory(
    dirHandle: FileSystemDirectoryHandle,
    filePath: string,
    content: string
): Promise<void> {
    const pathParts = filePath.replace(/^\//, '').split('/');
    const fileName = pathParts.pop();

    if (!fileName) {
        throw new Error('Invalid file path.');
    }

    let currentDir = dirHandle;
    for (const part of pathParts) {
        if (!part || part === '.') continue;
        currentDir = await currentDir.getDirectoryHandle(part, { create: true });
    }

    const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
}
