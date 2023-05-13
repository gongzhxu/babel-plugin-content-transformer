import type * as BabelCoreNamespace from '@babel/core'
import type { PluginObj } from '@babel/core'
import { TransfomerDefinition, resolvePath, isDirectory, mTime, isSubDir } from "./utils"
import { readdirSync } from 'fs'
import { loadFile } from './loadFile'
import path from 'path'
import { loadDirectory } from './loadDirectory'

type API = typeof BabelCoreNamespace

export type Options = {
  source: string | string[]
  recursive?: boolean
  nocache?: boolean
  filter?: { test: (path: string) => boolean }
} & TransfomerDefinition

function trackDependency(api: API, options: Options, src: string) {
  if (options.nocache) {
    // @ts-ignore
    api.addExternalDependency(src)
    return
  }

  // @ts-ignore
  api.cache.using(() => {
    return mTime(src)
  })
  // @ts-ignore
  api.addExternalDependency(src)
}

function addDependencies(api: API, options: Options, sources: string[]) {
  const fileDependencies = new Set()
  if (options.nocache) {
    // @ts-ignore
    api.cache.never()
  }

  for (const src of sources) {
    trackDependency(api, options, src)
    if (isDirectory(src)) {
      let files = readdirSync(src, { recursive: options.recursive, encoding: 'utf-8' })
      const subSources = []
      for (let file of files) {
        subSources.push(path.join(src, file))
      }
      addDependencies(api, options, subSources)
    } else {
      if (!options.filter || options.filter.test(src)) {
        fileDependencies.add(src)
      }
    }
  }
}

function validateOptions(opts: Options) {
  if (!opts.source) {
    if ('content' in opts) {
      throw new Error('"content" field is no longer supported')
    } else if ('transformers' in opts) {
      throw new Error('"transformers" field is no longer supported')
    } else {
      throw new Error('Missing required "source" field')
    }
  } else if (typeof opts.source === 'string' && opts.source.trim() === '' || opts.source.length === 0) {
    throw new Error('"source" field cannot be empty')
  }
}

export const Plugin = function (api: API, options: Options): PluginObj {
  validateOptions(options)
  let sources: string[] = []
  if (typeof options.source === 'string') {
    sources = [options.source]
  } else {
    sources = options.source
  }
  sources = sources.map(s => resolvePath(s, process.cwd()))
  addDependencies(api, options, sources)

  const hasTransform = 'transform' in options || 'format' in options
  return {
    visitor: {
      ImportDeclaration(p, state) {
        if (p.node && p.node.source && state.file.opts.filename) {
          const dirPath = path.dirname(state.file.opts.filename)
          const fullPath = resolvePath(p.node.source.value, dirPath)
          if (!isSubDir(sources, fullPath)) {
            return
          }

          if (isDirectory(fullPath)) {
            // trackDependency(api, options, fullPath, true)
            loadDirectory(api.types, p, state, options)
          } else if (hasTransform) {
            // Handle transformation of a single file
            if (!options.filter || options.filter.test(fullPath)) {
              loadFile(api.types, p, state, options)
            }
          }
        }
      }
    },
  }
}