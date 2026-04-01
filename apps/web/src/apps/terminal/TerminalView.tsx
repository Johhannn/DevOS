import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import { CommandInterpreter } from './CommandInterpreter';

export function TerminalView() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const interpreterRef = useRef<CommandInterpreter | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm.js
    const term = new Terminal({
      fontFamily: 'JetBrains Mono, Fira Code, monospace',
      fontSize: 13,
      theme: {
        background: '#000000',
        foreground: '#F9FAFB',
        cursor: '#6366F1',
        selectionBackground: 'rgba(99, 102, 241, 0.4)',
        black: '#1F2937', red: '#EF4444', green: '#10B981',
        yellow: '#F59E0B', blue: '#6366F1', magenta: '#A855F7',
        cyan: '#06B6D4', white: '#F9FAFB'
      },
      cursorBlink: true
    });
    
    // Setup addons
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Initialize Interpreter
    const interpreter = new CommandInterpreter(term);
    interpreterRef.current = interpreter;

    // Initial prompt
    interpreter.printPrompt();

    // Handle Resize
    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    // Keystroke parsing structure managed inside Interpreter to keep component clean
    // but the raw hook is here
    term.onData((data) => {
      interpreter.handleInput(data);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  return <div ref={terminalRef} className="w-full h-full" />;
}
