/**
 * Splits a path into cleaned segments, filtering out empty segments and '.' 
 */
export function pathParts(path: string): string[] {
  return path.split('/').filter(p => p !== '' && p !== '.');
}

/**
 * Resolves an absolute or relative path into a normalized absolute path.
 * Handles '..', '.', and '~'.
 * 
 * Example: resolvePath('/home/user', '../notes') = '/home/notes'
 */
export function resolvePath(cwd: string, input: string): string {
  // Handle home directory alias
  if (input.startsWith('~')) {
    input = '/home/user' + input.slice(1);
  }

  // If already absolute, start from root, else start from cwd
  const isAbsolute = input.startsWith('/');
  const baseParts = isAbsolute ? [] : pathParts(cwd);
  const targetParts = pathParts(input);

  const resolved = [...baseParts];

  for (const part of targetParts) {
    if (part === '..') {
      if (resolved.length > 0) {
        resolved.pop();
      }
    } else {
      resolved.push(part);
    }
  }

  return '/' + resolved.join('/');
}

/**
 * Gets the directory name of a given path.
 * Example: dirname('/home/user/test.txt') = '/home/user'
 * Example: dirname('/home') = '/'
 */
export function dirname(path: string): string {
  const parts = pathParts(path);
  if (parts.length <= 1) return '/';
  parts.pop();
  return '/' + parts.join('/');
}

/**
 * Gets the base name of a given path.
 * Example: basename('/home/user/test.txt') = 'test.txt'
 */
export function basename(path: string): string {
  const parts = pathParts(path);
  return parts.length > 0 ? parts[parts.length - 1] : '/';
}

/**
 * Prevents traversal above root directory (e.g. going `../../..` from `/`).
 */
export function sanitizePath(path: string): string {
  return resolvePath('/', path);
}
