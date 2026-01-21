module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768876401338, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
Object.defineProperty(exports, "defineCommonJSHook", {
  enumerable: true,
  get: function () {
    return _hooks.defineCommonJSHook;
  }
});
var _helperPluginUtils = require("@babel/helper-plugin-utils");
var _helperModuleTransforms = require("@babel/helper-module-transforms");
var _core = require("@babel/core");
var _dynamicImport = require("./dynamic-import.js");
var _lazy = require("./lazy.js");
var _hooks = require("./hooks.js");
var _default = exports.default = (0, _helperPluginUtils.declare)((api, options) => {
  var _api$assumption, _api$assumption2, _api$assumption3;
  api.assertVersion(7);
  const {
    strictNamespace = false,
    mjsStrictNamespace = strictNamespace,
    allowTopLevelThis,
    strict,
    strictMode,
    noInterop,
    importInterop,
    lazy = false,
    allowCommonJSExports = true,
    loose = false
  } = options;
  const constantReexports = (_api$assumption = api.assumption("constantReexports")) != null ? _api$assumption : loose;
  const enumerableModuleMeta = (_api$assumption2 = api.assumption("enumerableModuleMeta")) != null ? _api$assumption2 : loose;
  const noIncompleteNsImportDetection = (_api$assumption3 = api.assumption("noIncompleteNsImportDetection")) != null ? _api$assumption3 : false;
  if (typeof lazy !== "boolean" && typeof lazy !== "function" && (!Array.isArray(lazy) || !lazy.every(item => typeof item === "string"))) {
    throw new Error(`.lazy must be a boolean, array of strings, or a function`);
  }
  if (typeof strictNamespace !== "boolean") {
    throw new Error(`.strictNamespace must be a boolean, or undefined`);
  }
  if (typeof mjsStrictNamespace !== "boolean") {
    throw new Error(`.mjsStrictNamespace must be a boolean, or undefined`);
  }
  const getAssertion = localName => _core.template.expression.ast`
    (function(){
      throw new Error(
        "The CommonJS '" + "${localName}" + "' variable is not available in ES6 modules." +
        "Consider setting setting sourceType:script or sourceType:unambiguous in your " +
        "Babel config for this file.");
    })()
  `;
  const moduleExportsVisitor = {
    ReferencedIdentifier(path) {
      const localName = path.node.name;
      if (localName !== "module" && localName !== "exports") return;
      const localBinding = path.scope.getBinding(localName);
      const rootBinding = this.scope.getBinding(localName);
      if (rootBinding !== localBinding || path.parentPath.isObjectProperty({
        value: path.node
      }) && path.parentPath.parentPath.isObjectPattern() || path.parentPath.isAssignmentExpression({
        left: path.node
      }) || path.isAssignmentExpression({
        left: path.node
      })) {
        return;
      }
      path.replaceWith(getAssertion(localName));
    },
    UpdateExpression(path) {
      const arg = path.get("argument");
      if (!arg.isIdentifier()) return;
      const localName = arg.node.name;
      if (localName !== "module" && localName !== "exports") return;
      const localBinding = path.scope.getBinding(localName);
      const rootBinding = this.scope.getBinding(localName);
      if (rootBinding !== localBinding) return;
      path.replaceWith(_core.types.assignmentExpression(path.node.operator[0] + "=", arg.node, getAssertion(localName)));
    },
    AssignmentExpression(path) {
      const left = path.get("left");
      if (left.isIdentifier()) {
        const localName = left.node.name;
        if (localName !== "module" && localName !== "exports") return;
        const localBinding = path.scope.getBinding(localName);
        const rootBinding = this.scope.getBinding(localName);
        if (rootBinding !== localBinding) return;
        const right = path.get("right");
        right.replaceWith(_core.types.sequenceExpression([right.node, getAssertion(localName)]));
      } else if (left.isPattern()) {
        const ids = left.getOuterBindingIdentifiers();
        const localName = Object.keys(ids).find(localName => {
          if (localName !== "module" && localName !== "exports") return false;
          return this.scope.getBinding(localName) === path.scope.getBinding(localName);
        });
        if (localName) {
          const right = path.get("right");
          right.replaceWith(_core.types.sequenceExpression([right.node, getAssertion(localName)]));
        }
      }
    }
  };
  return {
    name: "transform-modules-commonjs",
    pre() {
      this.file.set("@babel/plugin-transform-modules-*", "commonjs");
      if (lazy) (0, _hooks.defineCommonJSHook)(this.file, (0, _lazy.lazyImportsHook)(lazy));
    },
    visitor: {
      ["CallExpression" + (api.types.importExpression ? "|ImportExpression" : "")](path) {
        if (!this.file.has("@babel/plugin-proposal-dynamic-import")) return;
        if (path.isCallExpression() && !_core.types.isImport(path.node.callee)) return;
        let {
          scope
        } = path;
        do {
          scope.rename("require");
        } while (scope = scope.parent);
        (0, _dynamicImport.transformDynamicImport)(path, noInterop, this.file);
      },
      Program: {
        exit(path, state) {
          if (!(0, _helperModuleTransforms.isModule)(path)) return;
          path.scope.rename("exports");
          path.scope.rename("module");
          path.scope.rename("require");
          path.scope.rename("__filename");
          path.scope.rename("__dirname");
          if (!allowCommonJSExports) {
            path.traverse(moduleExportsVisitor, {
              scope: path.scope
            });
          }
          let moduleName = (0, _helperModuleTransforms.getModuleName)(this.file.opts, options);
          if (moduleName) moduleName = _core.types.stringLiteral(moduleName);
          const hooks = (0, _hooks.makeInvokers)(this.file);
          const {
            meta,
            headers
          } = (0, _helperModuleTransforms.rewriteModuleStatementsAndPrepareHeader)(path, {
            exportName: "exports",
            constantReexports,
            enumerableModuleMeta,
            strict,
            strictMode,
            allowTopLevelThis,
            noInterop,
            importInterop,
            wrapReference: hooks.wrapReference,
            getWrapperPayload: hooks.getWrapperPayload,
            esNamespaceOnly: typeof state.filename === "string" && state.filename.endsWith(".mjs") ? mjsStrictNamespace : strictNamespace,
            noIncompleteNsImportDetection,
            filename: this.file.opts.filename
          });
          for (const [source, metadata] of meta.source) {
            const loadExpr = _core.types.callExpression(_core.types.identifier("require"), [_core.types.stringLiteral(source)]);
            let header;
            if ((0, _helperModuleTransforms.isSideEffectImport)(metadata)) {
              if (lazy && metadata.wrap === "function") {
                throw new Error("Assertion failure");
              }
              header = _core.types.expressionStatement(loadExpr);
            } else {
              const init = (0, _helperModuleTransforms.wrapInterop)(path, loadExpr, metadata.interop) || loadExpr;
              if (metadata.wrap) {
                const res = hooks.buildRequireWrapper(metadata.name, init, metadata.wrap, metadata.referenced);
                if (res === false) continue;else header = res;
              }
              header != null ? header : header = _core.template.statement.ast`
                var ${metadata.name} = ${init};
              `;
            }
            header.loc = metadata.loc;
            headers.push(header);
            headers.push(...(0, _helperModuleTransforms.buildNamespaceInitStatements)(meta, metadata, constantReexports, hooks.wrapReference));
          }
          (0, _helperModuleTransforms.ensureStatementsHoisted)(headers);
          path.unshiftContainer("body", headers);
          path.get("body").forEach(path => {
            if (!headers.includes(path.node)) return;
            if (path.isVariableDeclaration()) {
              path.scope.registerDeclaration(path);
            }
          });
        }
      }
    }
  };
});

//# sourceMappingURL=index.js.map

}, function(modId) {var map = {"./dynamic-import.js":1768876401339,"./lazy.js":1768876401340,"./hooks.js":1768876401341}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401339, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transformDynamicImport = transformDynamicImport;
var _core = require("@babel/core");
var _helperModuleTransforms = require("@babel/helper-module-transforms");
const requireNoInterop = source => _core.template.expression.ast`require(${source})`;
const requireInterop = (source, file) => _core.types.callExpression(file.addHelper("interopRequireWildcard"), [requireNoInterop(source)]);
function transformDynamicImport(path, noInterop, file) {
  const buildRequire = noInterop ? requireNoInterop : requireInterop;
  path.replaceWith((0, _helperModuleTransforms.buildDynamicImport)(path.node, true, false, specifier => buildRequire(specifier, file)));
}

//# sourceMappingURL=dynamic-import.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401340, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lazyImportsHook = void 0;
var _core = require("@babel/core");
var _helperModuleTransforms = require("@babel/helper-module-transforms");
const lazyImportsHook = lazy => ({
  name: `${"@babel/plugin-transform-modules-commonjs"}/lazy`,
  version: "7.28.6",
  getWrapperPayload(source, metadata) {
    if ((0, _helperModuleTransforms.isSideEffectImport)(metadata) || metadata.reexportAll) {
      return null;
    }
    if (lazy === true) {
      return source.includes(".") ? null : "lazy/function";
    }
    if (Array.isArray(lazy)) {
      return !lazy.includes(source) ? null : "lazy/function";
    }
    if (typeof lazy === "function") {
      return lazy(source) ? "lazy/function" : null;
    }
  },
  buildRequireWrapper(name, init, payload, referenced) {
    if (payload === "lazy/function") {
      if (!referenced) return false;
      return _core.template.statement.ast`
        function ${name}() {
          const data = ${init};
          ${name} = function(){ return data; };
          return data;
        }
      `;
    }
  },
  wrapReference(ref, payload) {
    if (payload === "lazy/function") return _core.types.callExpression(ref, []);
  }
});
exports.lazyImportsHook = lazyImportsHook;

//# sourceMappingURL=lazy.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401341, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defineCommonJSHook = defineCommonJSHook;
exports.makeInvokers = makeInvokers;
const commonJSHooksKey = "@babel/plugin-transform-modules-commonjs/customWrapperPlugin";
function defineCommonJSHook(file, hook) {
  let hooks = file.get(commonJSHooksKey);
  if (!hooks) file.set(commonJSHooksKey, hooks = []);
  hooks.push(hook);
}
function findMap(arr, cb) {
  if (arr) {
    for (const el of arr) {
      const res = cb(el);
      if (res != null) return res;
    }
  }
}
function makeInvokers(file) {
  const hooks = file.get(commonJSHooksKey);
  return {
    getWrapperPayload(...args) {
      return findMap(hooks, hook => hook.getWrapperPayload == null ? void 0 : hook.getWrapperPayload(...args));
    },
    wrapReference(...args) {
      return findMap(hooks, hook => hook.wrapReference == null ? void 0 : hook.wrapReference(...args));
    },
    buildRequireWrapper(...args) {
      return findMap(hooks, hook => hook.buildRequireWrapper == null ? void 0 : hook.buildRequireWrapper(...args));
    }
  };
}

//# sourceMappingURL=hooks.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768876401338);
})()
//miniprogram-npm-outsideDeps=["@babel/helper-plugin-utils","@babel/helper-module-transforms","@babel/core"]
//# sourceMappingURL=index.js.map