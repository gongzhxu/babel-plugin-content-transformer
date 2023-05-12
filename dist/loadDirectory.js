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
exports.loadDirectory = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const escapeVarName_1 = require("./escapeVarName");
function loadDirectory(t, p, state, opts) {
    if (p.node.specifiers.length > 1) {
        throw new Error(`Only default imports are supported. Check the import statement in ${state.file.opts.filename}`);
    }
    else if (!state.file.opts.filename) {
        throw new Error(`Could not determine filename for ${p.node.source.value}`);
    }
    const loc = p.node.source.value;
    const specifier = p.node.specifiers[0];
    const id = specifier.local.name;
    const base = path.dirname(state.file.opts.filename);
    const fullPath = path.join(base, loc);
    const files = fs.readdirSync(fullPath);
    const keys = [];
    const nodes = files.filter(f => !opts.filter || opts.filter.test(f)).map(f => {
        const key = path.basename(f).replace(path.extname(f), '');
        const identifier = t.identifier((0, escapeVarName_1.escapeVarName)(key));
        keys.push(identifier);
        let importPath = path.join(path.relative(base, fullPath), f);
        if (!importPath.startsWith('.')) {
            importPath = './' + importPath;
        }
        return t.importDeclaration([
            t.importNamespaceSpecifier(identifier)
        ], t.stringLiteral(importPath));
    });
    const arrId = t.identifier(id);
    const arrDeclaration = t.variableDeclaration('const', [
        t.variableDeclarator(arrId, t.arrayExpression(keys))
    ]);
    // @ts-ignore because it's trying to stop us from replacing the import declaration with a variable declaration
    nodes.push(arrDeclaration);
    p.replaceWithMultiple(nodes);
}
exports.loadDirectory = loadDirectory;
