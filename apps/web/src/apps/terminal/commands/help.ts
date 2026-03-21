import type { VirtualFileSystem } from '@devos/filesystem';

export async function execute(args: string[], cwd: string, vfs: VirtualFileSystem): Promise<string> {
  return [
    '\\x1B[32mDevOS Terminal Commands:\\x1B[0m',
    '  ls [path]      List directory contents',
    '  cd [path]      Change directory',
    '  pwd            Print working directory',
    '  cat <file>     Print file content',
    '  echo [text]    Print text',
    '  mkdir <dir>    Create directory',
    '  touch <file>   Create empty file',
    '  rm [-r] <path> Remove file or directory',
    '  cp <src> <dst> Copy file',
    '  mv <src> <dst> Move/rename file',
    '  clear          Clear terminal',
    '  help           Display this help message',
    '\\n\\x1B[32mSystem Commands:\\x1B[0m',
    '  devos apps       List running processes',
    '  devos kill <pid> Kill a process',
    '  devos open <app> Open an app by ID (e.g. explorer)',
    '  devos theme <n>  Change theme'
  ].join('\\n');
}
