import type { VirtualFileSystem } from '@devos/filesystem';

export async function execute(args: string[], cwd: string, vfs: VirtualFileSystem): Promise<string> {
  if (args.length === 0) throw new Error('rm: missing operand');

  const { resolvePath } = await import('@devos/filesystem');
  const recursive = args.includes('-r') || args.includes('-R');
  const actualArgs = args.filter(a => !a.startsWith('-'));

  for (const arg of actualArgs) {
    const targetPath = resolvePath(cwd, arg);
    try {
      await vfs.delete(targetPath, recursive);
    } catch (err: any) {
      throw new Error(`rm: cannot remove '${arg}': ${err.message}`);
    }
  }
  
  return '';
}
