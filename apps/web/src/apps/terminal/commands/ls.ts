import type { VirtualFileSystem } from '@devos/filesystem';

export async function execute(args: string[], cwd: string, vfs: VirtualFileSystem): Promise<string> {
  let targetDir = cwd;
  if (args.length > 0) {
    const { resolvePath } = await import('@devos/filesystem');
    targetDir = resolvePath(cwd, args[0]);
  }

  try {
    const nodes = await vfs.list(targetDir);
    if (nodes.length === 0) return '';
    
    // Format: directories in cyan, files in white
    return nodes.map(n => 
      n.type === 'directory' 
        ? `\\x1B[36m${n.name}\\x1B[0m`
        : `\\x1B[37m${n.name}\\x1B[0m`
    ).join('  ');
  } catch (err: any) {
    throw new Error(`ls: cannot access '${targetDir}': ${err.message}`);
  }
}
