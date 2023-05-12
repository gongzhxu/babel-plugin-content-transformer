"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeVarName = exports.replaceAll = void 0;
function replaceAll(val, pattern, replacement) {
    let newVal = val;
    do {
        val = newVal;
        newVal = newVal.replace(pattern, replacement);
    } while (newVal !== val);
    return newVal;
}
exports.replaceAll = replaceAll;
function escapeVarName(name) {
    return replaceAll(name, /[-'"\(\)\\\/\?\.]/, '_');
}
exports.escapeVarName = escapeVarName;
