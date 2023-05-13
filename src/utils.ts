import * as path from 'path'
import { statSync } from 'fs'

export type TransfomerDefinition = {
  format: string
} | {
  transform(contents: string): string
}

export function fixPath(p: string): string {
  p = path.normalize(p)
  if (p.endsWith('/')) {
    return p.slice(0, -1)
  } else if (p.endsWith('\\')) {
    return p.slice(0, -1)
  }
  return p
}

export function resolvePath (p: string, dirPath: string) {
  if (p.startsWith('.')) {
    return fixPath(path.join(dirPath, p))
  }
  try {
    return fixPath(require.resolve(p))
  } catch (err) {
    throw new Error(`Could not resolve path ${p}. Make sure to use ./ or ../ for relative paths.`)
  }
}

export function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory()
  } catch {
    return false
  }
}

export function mTime(path: string) {
  try {
    return statSync(path).mtimeMs
  } catch {
    return 0
  }
}

export function isSubDir(sources: string[], dirPath: string): boolean  {
  for (const source of sources) {
    if (dirPath.startsWith(source)) {
      return true
    }
  }

  return false
}
