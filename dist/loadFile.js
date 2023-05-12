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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadFile = void 0;
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
function loadFile(t, p, state, opts) {
    if (p.node.specifiers.length > 1) {
        throw new Error(`Only default imports are supported. Check the import statement in ${state.file.opts.filename}`);
    }
    else if (!state.file.opts.filename) {
        throw new Error(`Could not determine filename for ${p.node.source.value}`);
    }
    const specifier = p.node.specifiers[0];
    const id = specifier.local.name;
    // Function that transforms content into an AST node
    let transformer = (contents) => t.valueToNode(contents);
    if ("transform" in opts) {
        transformer = contents => {
            return t.valueToNode(opts.transform(contents));
        };
    }
    else {
        switch (opts.format) {
            case 'yaml':
                const YAML = require('yaml');
                transformer = contents => t.valueToNode(YAML.parse(contents));
                break;
            case 'toml':
                const toml = require('toml');
                transformer = contents => t.valueToNode(toml.parse(contents));
                break;
            default:
                transformer = contents => t.stringLiteral(contents);
        }
    }
    const fileDir = path_1.default.dirname(state.file.opts.filename);
    const fullPath = (0, utils_1.resolvePath)(p.node.source.value, fileDir);
    const fileContents = fs.readFileSync(fullPath, 'utf-8');
    const transformedVal = transformer(fileContents);
    p.replaceWith({
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [
            t.variableDeclarator(t.identifier(id), transformedVal)
        ],
        leadingComments: [{
                type: 'CommentBlock',
                value: `babel-content-loader '${p.node.source.value}'`
            }]
    });
}
exports.loadFile = loadFile;
