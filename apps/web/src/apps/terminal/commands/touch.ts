import type { VirtualFileSystem } from '@devos/filesystem';

export async function execute(args: string[], cwd: string, vfs: VirtualFileSystem): Promise<string> {
  if (args.length === 0) throw new Error('touch: missing file operand');

  const { resolvePath } = await import('@devos/filesystem');

  for (const arg of args) {
    const targetPath = resolvePath(cwd, arg);
    try {
      if (await vfs.exists(targetPath)) {
        await vfs.writeFile(targetPath, await vfs.readFile(targetPath)); // Update modifiedAt
      } else {
        await vfs.createFile(targetPath);
      }
    } catch (err: any) {
      throw new Error(`touch: cannot touch '${arg}': ${err.message}`);
    }
  }
  
  return '';
}
