export function detectLanguage(filename: string): string {
  if (!filename) return 'plaintext';
  
  const extMatch = filename.match(/\\.([^.]+)$/);
  if (!extMatch) return 'plaintext';

  const ext = extMatch[1].toLowerCase();

  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'py': return 'python';
    case 'go': return 'go';
    case 'rs': return 'rust';
    case 'md': return 'markdown';
    case 'json': return 'json';
    case 'yml':
    case 'yaml': return 'yaml';
    case 'css': return 'css';
    case 'html': return 'html';
    case 'sh': return 'shell';
    case 'sql': return 'sql';
    default: return 'plaintext';
  }
}
