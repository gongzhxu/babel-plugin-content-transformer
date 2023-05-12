"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = void 0;
const utils_1 = require("./utils");
const fs_1 = require("fs");
const loadFile_1 = require("./loadFile");
const path_1 = __importDefault(require("path"));
const loadDirectory_1 = require("./loadDirectory");
function trackDependency(api, options, src, isDirectory) {
    if (options.nocache) {
        // @ts-ignore
        api.addExternalDependency(src);
        return;
    }
    if (isDirectory) {
        // @ts-ignore
        api.cache.using(() => {
            const key = (0, fs_1.statSync)(src).mtimeMs;
            return key;
        });
        // @ts-ignore
        api.addExternalDependency(src);
    }
    else {
        // @ts-ignore
        api.cache.using(() => {
            const key = (0, fs_1.statSync)(src).mtimeMs;
            return key;
        });
        // @ts-ignore
        api.addExternalDependency(src);
    }
}
function addDependencies(api, options, sources) {
    const fileDependencies = new Set();
    if (options.nocache) {
        // @ts-ignore
        api.cache.never();
    }
    for (const src of sources) {
        const isDir = isDirectory(src);
        trackDependency(api, options, src, isDir);
        if (isDir) {
            let files = (0, fs_1.readdirSync)(src, { recursive: options.recursive, encoding: 'utf-8' });
            if (options.filter) {
                files = files.filter(file => options.filter.test(file));
            }
            for (let file of files) {
                file = path_1.default.join(src, file);
                fileDependencies.add(file);
                trackDependency(api, options, file, false);
            }
        }
        else {
            fileDependencies.add(src);
        }
    }
    return fileDependencies;
}
function validateOptions(opts) {
    if (!opts.source) {
        if ('content' in opts) {
            throw new Error('"content" field is no longer supported');
        }
        else if ('transformers' in opts) {
            throw new Error('"transformers" field is no longer supported');
        }
        else {
            throw new Error('Missing required "source" field');
        }
    }
    else if (typeof opts.source === 'string' && opts.source.trim() === '' || opts.source.length === 0) {
        throw new Error('"source" field cannot be empty');
    }
}
function isDirectory(path) {
    try {
        return (0, fs_1.statSync)(path).isDirectory();
    }
    catch (_a) {
        return false;
    }
}
const Plugin = function (api, options) {
    validateOptions(options);
    let sources = [];
    if (typeof options.source === 'string') {
        sources = [options.source];
    }
    else {
        sources = options.source;
    }
    sources = sources.map(s => (0, utils_1.resolvePath)(s, process.cwd()));
    const files = addDependencies(api, options, sources);
    const hasTransform = 'transform' in options || 'format' in options;
    return {
        visitor: {
            ImportDeclaration(p, state) {
                if (p.node && p.node.source && state.file.opts.filename) {
                    const dirPath = path_1.default.dirname(state.file.opts.filename);
                    const fullPath = (0, utils_1.resolvePath)(p.node.source.value, dirPath);
                    if (isDirectory(fullPath) && sources.includes(fullPath)) {
                        // trackDependency(api, options, fullPath, true)
                        (0, loadDirectory_1.loadDirectory)(api.types, p, state, options);
                    }
                    else if (hasTransform && files.has(fullPath)) {
                        // Handle transformation of a single file
                        (0, loadFile_1.loadFile)(api.types, p, state, options);
                    }
                }
            }
        },
    };
};
exports.Plugin = Plugin;
