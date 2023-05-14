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
function trackDependency(api, options, src) {
    // @ts-ignore
    api.cache.using(() => {
        return (0, utils_1.mTime)(src);
    });
    // @ts-ignore
    api.addExternalDependency(src);
}
function addDependencies(api, options, sources) {
    for (const src of sources) {
        if ((0, utils_1.isDirectory)(src)) {
            let files = (0, fs_1.readdirSync)(src, { recursive: options.recursive, encoding: 'utf-8' });
            const subSources = [];
            for (let file of files) {
                subSources.push(path_1.default.join(src, file));
            }
            //trackDependency(api, options, src)
            addDependencies(api, options, subSources);
        }
        else {
            if (!options.filter || options.filter.test(src)) {
                trackDependency(api, options, src);
            }
        }
    }
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
    addDependencies(api, options, sources);
    const hasTransform = 'transform' in options || 'format' in options;
    return {
        visitor: {
            ImportDeclaration(p, state) {
                if (p.node && p.node.source && state.file.opts.filename) {
                    const dirPath = path_1.default.dirname(state.file.opts.filename);
                    const fullPath = (0, utils_1.resolvePath)(p.node.source.value, dirPath);
                    if (!(0, utils_1.isSubDir)(sources, fullPath)) {
                        return;
                    }
                    if ((0, utils_1.isDirectory)(fullPath)) {
                        (0, loadDirectory_1.loadDirectory)(api.types, p, state, options);
                    }
                    else if (hasTransform) {
                        // Handle transformation of a single file
                        if (!options.filter || options.filter.test(fullPath)) {
                            (0, loadFile_1.loadFile)(api.types, p, state, options);
                        }
                    }
                }
            }
        },
    };
};
exports.Plugin = Plugin;
