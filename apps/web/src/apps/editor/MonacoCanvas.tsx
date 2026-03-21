import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface MonacoCanvasProps {
  filePath: string;
  language: string;
  content: string;
  onContentChange: (newContent: string) => void;
  onSave: () => void;
}

export function MonacoCanvas({ filePath, language, content, onContentChange, onSave }: MonacoCanvasProps) {
  const monacoRef = useRef<any>(null);

  const handleEditorWillMount = (monaco: any) => {
    // Define custom devos-dark theme
    monaco.editor.defineTheme('devos-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
        { token: 'string', foreground: '10B981' },
        { token: 'keyword', foreground: 'A855F7' },
        { token: 'number', foreground: 'F59E0B' }
      ],
      colors: {
        'editor.background': '#0B0F19',
        'editor.foreground': '#F9FAFB',
        'editor.lineHighlightBackground': '#1F2937',
        'editor.selectionBackground': '#6366F14D' // 4D is roughly 30% alpha
      }
    });
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    monacoRef.current = { editor, monaco };
    
    // Register action for save shortcut
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave();
    });
  };

  return (
    <div className="w-full h-full">
      <MonacoEditor
        path={filePath}
        language={language}
        theme="devos-dark"
        value={content}
        onChange={(val) => onContentChange(val || '')}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        options={{
          fontFamily: 'JetBrains Mono',
          fontSize: 13,
          lineHeight: 22,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          bracketPairColorization: { enabled: true },
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          wordWrap: 'off'
        }}
        loading={<div className="flex w-full h-full items-center justify-center text-white/30 text-sm">Loading Editor...</div>}
      />
    </div>
  );
}
