import type { VirtualFileSystem } from '@devos/filesystem';

export async function execute(args: string[], cwd: string, vfs: VirtualFileSystem): Promise<string> {
  if (args.length === 0) throw new Error('mkdir: missing operand');

  const { resolvePath } = await import('@devos/filesystem');

  for (const arg of args) {
    const targetPath = resolvePath(cwd, arg);
    try {
      await vfs.createDirectory(targetPath);
    } catch (err: any) {
      throw new Error(`mkdir: cannot create directory '${arg}': ${err.message}`);
    }
  }
  
  return '';
}
