import type { VirtualFileSystem } from '@devos/filesystem';

export async function execute(args: string[], cwd: string, vfs: VirtualFileSystem): Promise<string> {
  if (args.length < 2) throw new Error('mv: missing source or destination');

  const { resolvePath, dirname, basename } = await import('@devos/filesystem');
  const src = resolvePath(cwd, args[0]);
  let dst = resolvePath(cwd, args[1]);

  try {
    const srcNode = await vfs.getNode(src);
    if (!srcNode) throw new Error(`mv: cannot stat '${args[0]}': No such file or directory`);

    const dstNode = await vfs.getNode(dst);
    if (dstNode && dstNode.type === 'directory') {
       dst = resolvePath(dst, srcNode.name);
    }

    // In a sophisticated VFS this is just rename, but here we can just do rename
    const dstParentDir = dirname(dst);
    const dstParentNode = await vfs.getNode(dstParentDir);
    
    if (!dstParentNode) throw new Error(`mv: cannot move to '${args[1]}': Directory does not exist`);
    
    // Simplistic rename
    await vfs.rename(src, basename(dst));
  } catch (err: any) {
    throw new Error(`mv: ${err.message}`);
  }
  
  return '';
}
