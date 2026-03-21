import type { VirtualFileSystem } from '@devos/filesystem';

export async function execute(args: string[], cwd: string, vfs: VirtualFileSystem): Promise<string> {
  if (args.length === 0) throw new Error('cat: missing file operand');

  const { resolvePath } = await import('@devos/filesystem');
  let output = '';

  for (const arg of args) {
    const targetPath = resolvePath(cwd, arg);
    try {
      const content = await vfs.readFile(targetPath);
      output += content + '\\n';
    } catch (err: any) {
      output += `cat: ${arg}: ${err.message}\\n`;
    }
  }

  return output.trimEnd();
}
