"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePath = exports.fixPath = void 0;
const path = __importStar(require("path"));
function fixPath(p) {
    p = path.normalize(p);
    if (p.endsWith('/')) {
        return p.slice(0, -1);
    }
    else if (p.endsWith('\\')) {
        return p.slice(0, -1);
    }
    return p;
}
exports.fixPath = fixPath;
function resolvePath(p, dirPath) {
    if (p.startsWith('.')) {
        return fixPath(path.join(dirPath, p));
    }
    try {
        return fixPath(require.resolve(p));
    }
    catch (err) {
        throw new Error(`Could not resolve path ${p}. Make sure to use ./ or ../ for relative paths.`);
    }
}
exports.resolvePath = resolvePath;
// export function mtime(filePath) {
//   try {
//     return statSync(filePath).mtimeMs
//   } catch {
//     return null
//   }
// }
