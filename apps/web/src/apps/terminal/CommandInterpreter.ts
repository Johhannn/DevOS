import { Terminal } from 'xterm';
import { registry } from '@devos/kernel';
import type { VirtualFileSystem } from '@devos/filesystem';
import * as commands from './commands';

export interface CommandResult {
  output: string;
  newCwd?: string;
  exitCode: number;
}

export class CommandInterpreter {
  public cwd: string = '/home/user';
  private history: string[] = [];
  private historyIndex: number = -1;
  private currentInput: string = '';
  
  constructor(private term: Terminal) {}

  public printPrompt() {
    this.term.write(`\\x1B[36mdevos\\x1B[0m:\\x1B[34m${this.cwd}\\x1B[0m$ `);
  }

  public handleInput(data: string) {
    switch (data) {
      case '\\r': // Enter
        this.term.write('\\r\\n');
        this.handleEnter();
        break;
      case '\\x7f': // Backspace
        if (this.currentInput.length > 0) {
          this.currentInput = this.currentInput.slice(0, -1);
          this.term.write('\\b \\b');
        }
        break;
      case '\\x1b[A': // Up Arrow
        if (this.history.length > 0 && this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.replaceInput(this.history[this.history.length - 1 - this.historyIndex]);
        }
        break;
      case '\\x1b[B': // Down Arrow
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.replaceInput(this.history[this.history.length - 1 - this.historyIndex]);
        } else if (this.historyIndex === 0) {
          this.historyIndex = -1;
          this.replaceInput('');
        }
        break;
      case '\\x03': // Ctrl+C
        this.term.write('^C\\r\\n');
        this.currentInput = '';
        this.historyIndex = -1;
        this.printPrompt();
        break;
      case '\\x0c': // Ctrl+L
        this.term.clear();
        break;
      default:
        // Filter out unhandled control sequences
        if (data >= String.fromCharCode(0x20) && data !== '\\x7f') {
          this.currentInput += data;
          this.term.write(data);
        }
    }
  }

  private replaceInput(newInput: string) {
    // Clear current line visibly
    while (this.currentInput.length > 0) {
      this.term.write('\\b \\b');
      this.currentInput = this.currentInput.slice(0, -1);
    }
    this.currentInput = newInput;
    this.term.write(newInput);
  }

  private async handleEnter() {
    const input = this.currentInput.trim();
    this.currentInput = '';
    this.historyIndex = -1;

    if (input) {
      this.history.push(input);
      const result = await this.execute(input);
      
      if (result.output) {
        // Ensure standard lines end with \\r\\n for xterm
        const formattedOutput = result.output.replace(/\\n/g, '\\r\\n');
        this.term.write(formattedOutput + '\\r\\n');
      }
      if (result.newCwd) {
        this.cwd = result.newCwd;
      }
    }

    this.printPrompt();
  }

  public async execute(input: string): Promise<CommandResult> {
    try {
      const parts = input.match(/(?:[^\\s"']+|"[^"]*"|'[^']*')+/g) || [];
      if (parts.length === 0) return { output: '', exitCode: 0 };

      // Remove quotes from args
      const parsedArgs = parts.map(arg => {
        if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
          return arg.slice(1, -1);
        }
        return arg;
      });

      const cmd = parsedArgs[0];
      const args = parsedArgs.slice(1);

      // Verify VFS is accessible
      let vfs: VirtualFileSystem;
      try {
        vfs = registry.get<VirtualFileSystem>('filesystem');
      } catch (err) {
        return { output: '\\x1B[31m[System Error] VFS not found in registry.\\x1B[0m', exitCode: 1 };
      }

      // Route commands
      const handlerMap: Record<string, any> = commands;
      const handlerMethod = handlerMap[cmd];

      if (handlerMethod && typeof handlerMethod === 'function') {
        const output = await handlerMethod(args, this.cwd, vfs);
        return { output, exitCode: 0 };
      } else if (cmd === 'clear') {
        this.term.clear();
        return { output: '', exitCode: 0 };
      } else {
        return { output: `devos: command not found: ${cmd}`, exitCode: 127 };
      }

    } catch (error: any) {
      const msg = error instanceof Error ? error.message : String(error);
      return { output: `\\x1B[31m${msg}\\x1B[0m`, exitCode: 1 };
    }
  }
}
