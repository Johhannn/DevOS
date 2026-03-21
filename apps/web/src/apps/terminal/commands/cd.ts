import type { VirtualFileSystem } from '@devos/filesystem';

export async function execute(args: string[], cwd: string, vfs: VirtualFileSystem): Promise<string> {
  let targetPath = '/home/user';
  if (args.length > 0) {
    const { resolvePath } = await import('@devos/filesystem');
    targetPath = resolvePath(cwd, args[0]);
  }

  try {
    const node = await vfs.getNode(targetPath);
    if (!node) throw new Error('No such file or directory');
    if (node.type !== 'directory') throw new Error('Not a directory');
    
    // We use a special marker to tell the interpreter to change CWD
    return `__CWD_CHANGE__:${targetPath}`;
  } catch (err: any) {
    throw new Error(`cd: ${targetPath}: ${err.message}`);
  }
}
