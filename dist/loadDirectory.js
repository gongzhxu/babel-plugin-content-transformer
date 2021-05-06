"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadDirectory = loadDirectory;

var fs = _interopRequireWildcard(require("fs"));

var path = _interopRequireWildcard(require("path"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function loadDirectory(t, p, state, opts) {
  var loc = p.node.source.value;

  if (opts.dir.test(loc)) {
    var base = path.dirname(state.file.opts.filename);
    var fullPath = path.join(base, loc);
    var files = fs.readdirSync(fullPath);
    var keys = [];
    var nodes = files.filter(function (f) {
      return !opts.filter || opts.filter.test(f);
    }).map(function (f) {
      var key = path.basename(f).replace(path.extname(f), '');
      var identifier = t.identifier(key);
      keys.push(identifier); // TODO: This could be changed to a named import or default import

      return t.importDeclaration([t.importNamespaceSpecifier(identifier)], t.stringLiteral(path.join(loc, f)));
    });
    var arrId = t.identifier('files');
    var arrDeclaration = t.variableDeclaration('const', [t.variableDeclarator(arrId, t.arrayExpression(keys))]);
    var exportDeclaration = t.exportDefaultDeclaration(arrId);
    nodes.push(arrDeclaration, exportDeclaration);
    p.replaceWithMultiple(nodes);
  }
}