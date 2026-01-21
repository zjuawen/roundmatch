module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768876401369, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _helperPluginUtils = require("@babel/helper-plugin-utils");
var _helperModuleImports = require("@babel/helper-module-imports");
var _core = require("@babel/core");
var _index = require("./get-runtime-path/index.js");
var _index2 = require("./babel-7/index.cjs");
var _semver = require("semver");
var _default = exports.default = (0, _helperPluginUtils.declare)((api, options, dirname) => {
  api.assertVersion(7);
  const {
    version: runtimeVersion = "7.0.0-beta.0",
    absoluteRuntime = false,
    moduleName = null
  } = options;
  if (typeof absoluteRuntime !== "boolean" && typeof absoluteRuntime !== "string") {
    throw new Error("The 'absoluteRuntime' option must be undefined, a boolean, or a string.");
  }
  if (typeof runtimeVersion !== "string") {
    throw new Error(`The 'version' option must be a version string.`);
  }
  if (moduleName !== null && typeof moduleName !== "string") {
    throw new Error("The 'moduleName' option must be null or a string.");
  }
  {
    var supportsCJSDefault;
    if (!runtimeVersion) {
      supportsCJSDefault = true;
    } else {
      const normalizedRuntimeVersion = _semver.valid(runtimeVersion) ? `^${runtimeVersion}` : runtimeVersion;
      supportsCJSDefault = !_semver.intersects(`<7.13.0`, normalizedRuntimeVersion) && !_semver.intersects(`>=8.0.0`, normalizedRuntimeVersion);
    }
  }
  if (hasOwnProperty.call(options, "useBuiltIns")) {
    if (options.useBuiltIns) {
      throw new Error("The 'useBuiltIns' option has been removed. The @babel/runtime " + "module now uses builtins by default.");
    } else {
      throw new Error("The 'useBuiltIns' option has been removed. Use the 'corejs'" + "option to polyfill with `core-js` via @babel/runtime.");
    }
  }
  if (hasOwnProperty.call(options, "polyfill")) {
    if (options.polyfill === false) {
      throw new Error("The 'polyfill' option has been removed. The @babel/runtime " + "module now skips polyfilling by default.");
    } else {
      throw new Error("The 'polyfill' option has been removed. Use the 'corejs'" + "option to polyfill with `core-js` via @babel/runtime.");
    }
  }
  ;
  {
    const {
      useESModules = false
    } = options;
    if (typeof useESModules !== "boolean" && useESModules !== "auto") {
      throw new Error("The 'useESModules' option must be undefined, or a boolean, or 'auto'.");
    }
    var esModules = useESModules === "auto" ? api.caller(caller => !!(caller != null && caller.supportsStaticESM)) : useESModules;
  }
  {
    var {
      helpers: useRuntimeHelpers = true
    } = options;
    if (typeof useRuntimeHelpers !== "boolean") {
      throw new Error("The 'helpers' option must be undefined, or a boolean.");
    }
  }
  const HEADER_HELPERS = new Set(["interopRequireWildcard", "interopRequireDefault"]);
  return {
    name: "transform-runtime",
    inherits: _index2.createPolyfillPlugins(options, runtimeVersion, absoluteRuntime),
    pre(file) {
      if (!useRuntimeHelpers) return;
      let modulePath;
      file.set("helperGenerator", name => {
        var _ref;
        modulePath != null ? modulePath : modulePath = (0, _index.default)((_ref = moduleName != null ? moduleName : file.get("runtimeHelpersModuleName")) != null ? _ref : "@babel/runtime", dirname, absoluteRuntime);
        {
          if (!(file.availableHelper != null && file.availableHelper(name, runtimeVersion))) {
            if (name === "regeneratorRuntime") {
              return _core.types.arrowFunctionExpression([], _core.types.identifier("regeneratorRuntime"));
            }
            if (name === "regenerator" || name === "regeneratorKeys" || name === "regeneratorAsync" || name === "regeneratorAsyncGen") {
              return _core.types.identifier("__interal_marker_fallback_regenerator__");
            }
            return;
          }
        }
        const blockHoist = HEADER_HELPERS.has(name) && !(0, _helperModuleImports.isModule)(file.path) ? 4 : undefined;
        let helperPath = `${modulePath}/helpers/${esModules && file.path.node.sourceType === "module" ? "esm/" + name : name}`;
        if (absoluteRuntime) helperPath = (0, _index.resolveFSPath)(helperPath);
        return addDefaultImport(helperPath, name, blockHoist, true);
      });
      const cache = new Map();
      function addDefaultImport(source, nameHint, blockHoist, isHelper = false) {
        const cacheKey = (0, _helperModuleImports.isModule)(file.path);
        const key = `${source}:${nameHint}:${cacheKey || ""}`;
        let cached = cache.get(key);
        if (cached) {
          cached = _core.types.cloneNode(cached);
        } else {
          cached = (0, _helperModuleImports.addDefault)(file.path, source, {
            importedInterop: isHelper && supportsCJSDefault ? "compiled" : "uncompiled",
            nameHint,
            blockHoist
          });
          cache.set(key, cached);
        }
        return cached;
      }
    }
  };
});

//# sourceMappingURL=index.js.map

}, function(modId) {var map = {"./get-runtime-path/index.js":1768876401370}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401370, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
exports.resolveFSPath = resolveFSPath;
var _path = require("path");
require("module");
function _default(moduleName, dirname, absoluteRuntime) {
  if (absoluteRuntime === false) return moduleName;
  return resolveAbsoluteRuntime(moduleName, _path.resolve(dirname, absoluteRuntime === true ? "." : absoluteRuntime));
}
function resolveAbsoluteRuntime(moduleName, dirname) {
  try {
    return _path.dirname((((v, w) => (v = v.split("."), w = w.split("."), +v[0] > +w[0] || v[0] == w[0] && +v[1] >= +w[1]))(process.versions.node, "8.9") ? require.resolve : (r, {
      paths: [b]
    }, M = require("module")) => {
      let f = M._findPath(r, M._nodeModulePaths(b).concat(b));
      if (f) return f;
      f = new Error(`Cannot resolve module '${r}'`);
      f.code = "MODULE_NOT_FOUND";
      throw f;
    })(`${moduleName}/package.json`, {
      paths: [dirname]
    })).replace(/\\/g, "/");
  } catch (err) {
    if (err.code !== "MODULE_NOT_FOUND") throw err;
    throw Object.assign(new Error(`Failed to resolve "${moduleName}" relative to "${dirname}"`), {
      code: "BABEL_RUNTIME_NOT_FOUND",
      runtime: moduleName,
      dirname
    });
  }
}
function resolveFSPath(path) {
  return require.resolve(path).replace(/\\/g, "/");
}

//# sourceMappingURL=index.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768876401369);
})()
//miniprogram-npm-outsideDeps=["@babel/helper-plugin-utils","@babel/helper-module-imports","@babel/core","./babel-7/index.cjs","semver","path","module"]
//# sourceMappingURL=index.js.map