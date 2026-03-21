import type { VirtualFileSystem } from '@devos/filesystem';

export async function execute(args: string[], cwd: string, vfs: VirtualFileSystem): Promise<string> {
  if (args.length < 2) throw new Error('cp: missing source or destination');

  const { resolvePath } = await import('@devos/filesystem');
  const src = resolvePath(cwd, args[0]);
  let dst = resolvePath(cwd, args[1]);

  try {
    const srcNode = await vfs.getNode(src);
    if (!srcNode) throw new Error(`cp: cannot stat '${args[0]}': No such file or directory`);

    const dstNode = await vfs.getNode(dst);
    if (dstNode && dstNode.type === 'directory') {
       dst = resolvePath(dst, srcNode.name);
    }

    if (srcNode.type === 'file') {
      const content = await vfs.readFile(src);
      if (await vfs.exists(dst)) {
        await vfs.writeFile(dst, content);
      } else {
        await vfs.createFile(dst);
        await vfs.writeFile(dst, content);
      }
    } else {
      throw new Error(`cp: -r not specified; omitting directory '${args[0]}'`);
    }
  } catch (err: any) {
    throw new Error(`cp: ${err.message}`);
  }
  
  return '';
}
