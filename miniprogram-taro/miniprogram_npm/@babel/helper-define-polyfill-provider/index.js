module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768876401253, function(require, module, exports) {


exports.__esModule = true;
exports.default = definePolyfillProvider;
var _helperPluginUtils = require("@babel/helper-plugin-utils");
var _helperCompilationTargets = _interopRequireWildcard(require("@babel/helper-compilation-targets"));
var _utils = require("./utils");
var _importsInjector = _interopRequireDefault(require("./imports-injector"));
var _debugUtils = require("./debug-utils");
var _normalizeOptions = require("./normalize-options");
var v = _interopRequireWildcard(require("./visitors"));
var deps = _interopRequireWildcard(require("./node/dependencies"));
var _metaResolver = _interopRequireDefault(require("./meta-resolver"));
const _excluded = ["method", "targets", "ignoreBrowserslistConfig", "configPath", "debug", "shouldInjectPolyfill", "absoluteImports"];
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
const getTargets = _helperCompilationTargets.default.default || _helperCompilationTargets.default;
function resolveOptions(options, babelApi) {
  const {
      method,
      targets: targetsOption,
      ignoreBrowserslistConfig,
      configPath,
      debug,
      shouldInjectPolyfill,
      absoluteImports
    } = options,
    providerOptions = _objectWithoutPropertiesLoose(options, _excluded);
  if (isEmpty(options)) {
    throw new Error(`\
This plugin requires options, for example:
    {
      "plugins": [
        ["<plugin name>", { method: "usage-pure" }]
      ]
    }

See more options at https://github.com/babel/babel-polyfills/blob/main/docs/usage.md`);
  }
  let methodName;
  if (method === "usage-global") methodName = "usageGlobal";else if (method === "entry-global") methodName = "entryGlobal";else if (method === "usage-pure") methodName = "usagePure";else if (typeof method !== "string") {
    throw new Error(".method must be a string");
  } else {
    throw new Error(`.method must be one of "entry-global", "usage-global"` + ` or "usage-pure" (received ${JSON.stringify(method)})`);
  }
  if (typeof shouldInjectPolyfill === "function") {
    if (options.include || options.exclude) {
      throw new Error(`.include and .exclude are not supported when using the` + ` .shouldInjectPolyfill function.`);
    }
  } else if (shouldInjectPolyfill != null) {
    throw new Error(`.shouldInjectPolyfill must be a function, or undefined` + ` (received ${JSON.stringify(shouldInjectPolyfill)})`);
  }
  if (absoluteImports != null && typeof absoluteImports !== "boolean" && typeof absoluteImports !== "string") {
    throw new Error(`.absoluteImports must be a boolean, a string, or undefined` + ` (received ${JSON.stringify(absoluteImports)})`);
  }
  let targets;
  if (
  // If any browserslist-related option is specified, fallback to the old
  // behavior of not using the targets specified in the top-level options.
  targetsOption || configPath || ignoreBrowserslistConfig) {
    const targetsObj = typeof targetsOption === "string" || Array.isArray(targetsOption) ? {
      browsers: targetsOption
    } : targetsOption;
    targets = getTargets(targetsObj, {
      ignoreBrowserslistConfig,
      configPath
    });
  } else {
    targets = babelApi.targets();
  }
  return {
    method,
    methodName,
    targets,
    absoluteImports: absoluteImports != null ? absoluteImports : false,
    shouldInjectPolyfill,
    debug: !!debug,
    providerOptions: providerOptions
  };
}
function instantiateProvider(factory, options, missingDependencies, dirname, debugLog, babelApi) {
  const {
    method,
    methodName,
    targets,
    debug,
    shouldInjectPolyfill,
    providerOptions,
    absoluteImports
  } = resolveOptions(options, babelApi);

  // eslint-disable-next-line prefer-const
  let include, exclude;
  let polyfillsSupport;
  let polyfillsNames;
  let filterPolyfills;
  const getUtils = (0, _utils.createUtilsGetter)(new _importsInjector.default(moduleName => deps.resolve(dirname, moduleName, absoluteImports), name => {
    var _polyfillsNames$get, _polyfillsNames;
    return (_polyfillsNames$get = (_polyfillsNames = polyfillsNames) == null ? void 0 : _polyfillsNames.get(name)) != null ? _polyfillsNames$get : Infinity;
  }));
  const depsCache = new Map();
  const api = {
    babel: babelApi,
    getUtils,
    method: options.method,
    targets,
    createMetaResolver: _metaResolver.default,
    shouldInjectPolyfill(name) {
      if (polyfillsNames === undefined) {
        throw new Error(`Internal error in the ${factory.name} provider: ` + `shouldInjectPolyfill() can't be called during initialization.`);
      }
      if (!polyfillsNames.has(name)) {
        console.warn(`Internal error in the ${providerName} provider: ` + `unknown polyfill "${name}".`);
      }
      if (filterPolyfills && !filterPolyfills(name)) return false;
      let shouldInject = (0, _helperCompilationTargets.isRequired)(name, targets, {
        compatData: polyfillsSupport,
        includes: include,
        excludes: exclude
      });
      if (shouldInjectPolyfill) {
        shouldInject = shouldInjectPolyfill(name, shouldInject);
        if (typeof shouldInject !== "boolean") {
          throw new Error(`.shouldInjectPolyfill must return a boolean.`);
        }
      }
      return shouldInject;
    },
    debug(name) {
      var _debugLog, _debugLog$polyfillsSu;
      debugLog().found = true;
      if (!debug || !name) return;
      if (debugLog().polyfills.has(providerName)) return;
      debugLog().polyfills.add(name);
      (_debugLog$polyfillsSu = (_debugLog = debugLog()).polyfillsSupport) != null ? _debugLog$polyfillsSu : _debugLog.polyfillsSupport = polyfillsSupport;
    },
    assertDependency(name, version = "*") {
      if (missingDependencies === false) return;
      if (absoluteImports) {
        // If absoluteImports is not false, we will try resolving
        // the dependency and throw if it's not possible. We can
        // skip the check here.
        return;
      }
      const dep = version === "*" ? name : `${name}@^${version}`;
      const found = missingDependencies.all ? false : mapGetOr(depsCache, `${name} :: ${dirname}`, () => deps.has(dirname, name));
      if (!found) {
        debugLog().missingDeps.add(dep);
      }
    }
  };
  const provider = factory(api, providerOptions, dirname);
  const providerName = provider.name || factory.name;
  if (typeof provider[methodName] !== "function") {
    throw new Error(`The "${providerName}" provider doesn't support the "${method}" polyfilling method.`);
  }
  if (Array.isArray(provider.polyfills)) {
    polyfillsNames = new Map(provider.polyfills.map((name, index) => [name, index]));
    filterPolyfills = provider.filterPolyfills;
  } else if (provider.polyfills) {
    polyfillsNames = new Map(Object.keys(provider.polyfills).map((name, index) => [name, index]));
    polyfillsSupport = provider.polyfills;
    filterPolyfills = provider.filterPolyfills;
  } else {
    polyfillsNames = new Map();
  }
  ({
    include,
    exclude
  } = (0, _normalizeOptions.validateIncludeExclude)(providerName, polyfillsNames, providerOptions.include || [], providerOptions.exclude || []));
  let callProvider;
  if (methodName === "usageGlobal") {
    callProvider = (payload, path) => {
      var _ref;
      const utils = getUtils(path);
      return (_ref = provider[methodName](payload, utils, path)) != null ? _ref : false;
    };
  } else {
    callProvider = (payload, path) => {
      const utils = getUtils(path);
      provider[methodName](payload, utils, path);
      return false;
    };
  }
  return {
    debug,
    method,
    targets,
    provider,
    providerName,
    callProvider
  };
}
function definePolyfillProvider(factory) {
  return (0, _helperPluginUtils.declare)((babelApi, options, dirname) => {
    babelApi.assertVersion("^7.0.0 || ^8.0.0-alpha.0");
    const {
      traverse
    } = babelApi;
    let debugLog;
    const missingDependencies = (0, _normalizeOptions.applyMissingDependenciesDefaults)(options, babelApi);
    const {
      debug,
      method,
      targets,
      provider,
      providerName,
      callProvider
    } = instantiateProvider(factory, options, missingDependencies, dirname, () => debugLog, babelApi);
    const createVisitor = method === "entry-global" ? v.entry : v.usage;
    const visitor = provider.visitor ? traverse.visitors.merge([createVisitor(callProvider), provider.visitor]) : createVisitor(callProvider);
    if (debug && debug !== _debugUtils.presetEnvSilentDebugHeader) {
      console.log(`${providerName}: \`DEBUG\` option`);
      console.log(`\nUsing targets: ${(0, _debugUtils.stringifyTargetsMultiline)(targets)}`);
      console.log(`\nUsing polyfills with \`${method}\` method:`);
    }
    const {
      runtimeName
    } = provider;
    return {
      name: "inject-polyfills",
      visitor,
      pre(file) {
        var _provider$pre;
        if (runtimeName) {
          if (file.get("runtimeHelpersModuleName") && file.get("runtimeHelpersModuleName") !== runtimeName) {
            console.warn(`Two different polyfill providers` + ` (${file.get("runtimeHelpersModuleProvider")}` + ` and ${providerName}) are trying to define two` + ` conflicting @babel/runtime alternatives:` + ` ${file.get("runtimeHelpersModuleName")} and ${runtimeName}.` + ` The second one will be ignored.`);
          } else {
            file.set("runtimeHelpersModuleName", runtimeName);
            file.set("runtimeHelpersModuleProvider", providerName);
          }
        }
        debugLog = {
          polyfills: new Set(),
          polyfillsSupport: undefined,
          found: false,
          providers: new Set(),
          missingDeps: new Set()
        };
        (_provider$pre = provider.pre) == null || _provider$pre.apply(this, arguments);
      },
      post() {
        var _provider$post;
        (_provider$post = provider.post) == null || _provider$post.apply(this, arguments);
        if (missingDependencies !== false) {
          if (missingDependencies.log === "per-file") {
            deps.logMissing(debugLog.missingDeps);
          } else {
            deps.laterLogMissing(debugLog.missingDeps);
          }
        }
        if (!debug) return;
        if (this.filename) console.log(`\n[${this.filename}]`);
        if (debugLog.polyfills.size === 0) {
          console.log(method === "entry-global" ? debugLog.found ? `Based on your targets, the ${providerName} polyfill did not add any polyfill.` : `The entry point for the ${providerName} polyfill has not been found.` : `Based on your code and targets, the ${providerName} polyfill did not add any polyfill.`);
          return;
        }
        if (method === "entry-global") {
          console.log(`The ${providerName} polyfill entry has been replaced with ` + `the following polyfills:`);
        } else {
          console.log(`The ${providerName} polyfill added the following polyfills:`);
        }
        for (const name of debugLog.polyfills) {
          var _debugLog$polyfillsSu2;
          if ((_debugLog$polyfillsSu2 = debugLog.polyfillsSupport) != null && _debugLog$polyfillsSu2[name]) {
            const filteredTargets = (0, _helperCompilationTargets.getInclusionReasons)(name, targets, debugLog.polyfillsSupport);
            const formattedTargets = JSON.stringify(filteredTargets).replace(/,/g, ", ").replace(/^\{"/, '{ "').replace(/"\}$/, '" }');
            console.log(`  ${name} ${formattedTargets}`);
          } else {
            console.log(`  ${name}`);
          }
        }
      }
    };
  });
}
function mapGetOr(map, key, getDefault) {
  let val = map.get(key);
  if (val === undefined) {
    val = getDefault();
    map.set(key, val);
  }
  return val;
}
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}
}, function(modId) {var map = {"./utils":1768876401254,"./imports-injector":1768876401255,"./debug-utils":1768876401256,"./normalize-options":1768876401257,"./visitors":1768876401258,"./node/dependencies":1768876401261,"./meta-resolver":1768876401262}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401254, function(require, module, exports) {


exports.__esModule = true;
exports.createUtilsGetter = createUtilsGetter;
exports.getImportSource = getImportSource;
exports.getRequireSource = getRequireSource;
exports.has = has;
exports.intersection = intersection;
exports.resolveKey = resolveKey;
exports.resolveSource = resolveSource;
var _babel = _interopRequireWildcard(require("@babel/core"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const {
  types: t,
  template: template
} = _babel.default || _babel;
function intersection(a, b) {
  const result = new Set();
  a.forEach(v => b.has(v) && result.add(v));
  return result;
}
function has(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}
function resolve(path, resolved = new Set()) {
  if (resolved.has(path)) return;
  resolved.add(path);
  if (path.isVariableDeclarator()) {
    if (path.get("id").isIdentifier()) {
      return resolve(path.get("init"), resolved);
    }
  } else if (path.isReferencedIdentifier()) {
    const binding = path.scope.getBinding(path.node.name);
    if (!binding) return path;
    if (!binding.constant) return;
    return resolve(binding.path, resolved);
  }
  return path;
}
function resolveId(path) {
  if (path.isIdentifier() && !path.scope.hasBinding(path.node.name, /* noGlobals */true)) {
    return path.node.name;
  }
  const resolved = resolve(path);
  if (resolved != null && resolved.isIdentifier()) {
    return resolved.node.name;
  }
}
function resolveKey(path, computed = false) {
  const {
    scope
  } = path;
  if (path.isStringLiteral()) return path.node.value;
  const isIdentifier = path.isIdentifier();
  if (isIdentifier && !(computed || path.parent.computed)) {
    return path.node.name;
  }
  if (computed && path.isMemberExpression() && path.get("object").isIdentifier({
    name: "Symbol"
  }) && !scope.hasBinding("Symbol", /* noGlobals */true)) {
    const sym = resolveKey(path.get("property"), path.node.computed);
    if (sym) return "Symbol." + sym;
  }
  if (isIdentifier ? scope.hasBinding(path.node.name, /* noGlobals */true) : path.isPure()) {
    const {
      value
    } = path.evaluate();
    if (typeof value === "string") return value;
  }
}
function resolveSource(obj) {
  if (obj.isMemberExpression() && obj.get("property").isIdentifier({
    name: "prototype"
  })) {
    const id = resolveId(obj.get("object"));
    if (id) {
      return {
        id,
        placement: "prototype"
      };
    }
    return {
      id: null,
      placement: null
    };
  }
  const id = resolveId(obj);
  if (id) {
    return {
      id,
      placement: "static"
    };
  }
  const path = resolve(obj);
  switch (path == null ? void 0 : path.type) {
    case "RegExpLiteral":
      return {
        id: "RegExp",
        placement: "prototype"
      };
    case "FunctionExpression":
      return {
        id: "Function",
        placement: "prototype"
      };
    case "StringLiteral":
      return {
        id: "String",
        placement: "prototype"
      };
    case "NumberLiteral":
      return {
        id: "Number",
        placement: "prototype"
      };
    case "BooleanLiteral":
      return {
        id: "Boolean",
        placement: "prototype"
      };
    case "ObjectExpression":
      return {
        id: "Object",
        placement: "prototype"
      };
    case "ArrayExpression":
      return {
        id: "Array",
        placement: "prototype"
      };
  }
  return {
    id: null,
    placement: null
  };
}
function getImportSource({
  node
}) {
  if (node.specifiers.length === 0) return node.source.value;
}
function getRequireSource({
  node
}) {
  if (!t.isExpressionStatement(node)) return;
  const {
    expression
  } = node;
  if (t.isCallExpression(expression) && t.isIdentifier(expression.callee) && expression.callee.name === "require" && expression.arguments.length === 1 && t.isStringLiteral(expression.arguments[0])) {
    return expression.arguments[0].value;
  }
}
function hoist(node) {
  // @ts-expect-error
  node._blockHoist = 3;
  return node;
}
function createUtilsGetter(cache) {
  return path => {
    const prog = path.findParent(p => p.isProgram());
    return {
      injectGlobalImport(url, moduleName) {
        cache.storeAnonymous(prog, url, moduleName, (isScript, source) => {
          return isScript ? template.statement.ast`require(${source})` : t.importDeclaration([], source);
        });
      },
      injectNamedImport(url, name, hint = name, moduleName) {
        return cache.storeNamed(prog, url, name, moduleName, (isScript, source, name) => {
          const id = prog.scope.generateUidIdentifier(hint);
          return {
            node: isScript ? hoist(template.statement.ast`
                  var ${id} = require(${source}).${name}
                `) : t.importDeclaration([t.importSpecifier(id, name)], source),
            name: id.name
          };
        });
      },
      injectDefaultImport(url, hint = url, moduleName) {
        return cache.storeNamed(prog, url, "default", moduleName, (isScript, source) => {
          const id = prog.scope.generateUidIdentifier(hint);
          return {
            node: isScript ? hoist(template.statement.ast`var ${id} = require(${source})`) : t.importDeclaration([t.importDefaultSpecifier(id)], source),
            name: id.name
          };
        });
      }
    };
  };
}
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401255, function(require, module, exports) {


exports.__esModule = true;
exports.default = void 0;
var _babel = _interopRequireWildcard(require("@babel/core"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const {
  types: t
} = _babel.default || _babel;
class ImportsCachedInjector {
  constructor(resolver, getPreferredIndex) {
    this._imports = new WeakMap();
    this._anonymousImports = new WeakMap();
    this._lastImports = new WeakMap();
    this._resolver = resolver;
    this._getPreferredIndex = getPreferredIndex;
  }
  storeAnonymous(programPath, url, moduleName, getVal) {
    const key = this._normalizeKey(programPath, url);
    const imports = this._ensure(this._anonymousImports, programPath, Set);
    if (imports.has(key)) return;
    const node = getVal(programPath.node.sourceType === "script", t.stringLiteral(this._resolver(url)));
    imports.add(key);
    this._injectImport(programPath, node, moduleName);
  }
  storeNamed(programPath, url, name, moduleName, getVal) {
    const key = this._normalizeKey(programPath, url, name);
    const imports = this._ensure(this._imports, programPath, Map);
    if (!imports.has(key)) {
      const {
        node,
        name: id
      } = getVal(programPath.node.sourceType === "script", t.stringLiteral(this._resolver(url)), t.identifier(name));
      imports.set(key, id);
      this._injectImport(programPath, node, moduleName);
    }
    return t.identifier(imports.get(key));
  }
  _injectImport(programPath, node, moduleName) {
    var _this$_lastImports$ge;
    const newIndex = this._getPreferredIndex(moduleName);
    const lastImports = (_this$_lastImports$ge = this._lastImports.get(programPath)) != null ? _this$_lastImports$ge : [];
    const isPathStillValid = path => path.node &&
    // Sometimes the AST is modified and the "last import"
    // we have has been replaced
    path.parent === programPath.node && path.container === programPath.node.body;
    let last;
    if (newIndex === Infinity) {
      // Fast path: we can always just insert at the end if newIndex is `Infinity`
      if (lastImports.length > 0) {
        last = lastImports[lastImports.length - 1].path;
        if (!isPathStillValid(last)) last = undefined;
      }
    } else {
      for (const [i, data] of lastImports.entries()) {
        const {
          path,
          index
        } = data;
        if (isPathStillValid(path)) {
          if (newIndex < index) {
            const [newPath] = path.insertBefore(node);
            lastImports.splice(i, 0, {
              path: newPath,
              index: newIndex
            });
            return;
          }
          last = path;
        }
      }
    }
    if (last) {
      const [newPath] = last.insertAfter(node);
      lastImports.push({
        path: newPath,
        index: newIndex
      });
    } else {
      const [newPath] = programPath.unshiftContainer("body", [node]);
      this._lastImports.set(programPath, [{
        path: newPath,
        index: newIndex
      }]);
    }
  }
  _ensure(map, programPath, Collection) {
    let collection = map.get(programPath);
    if (!collection) {
      collection = new Collection();
      map.set(programPath, collection);
    }
    return collection;
  }
  _normalizeKey(programPath, url, name = "") {
    const {
      sourceType
    } = programPath.node;

    // If we rely on the imported binding (the "name" parameter), we also need to cache
    // based on the sourceType. This is because the module transforms change the names
    // of the import variables.
    return `${name && sourceType}::${url}::${name}`;
  }
}
exports.default = ImportsCachedInjector;
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401256, function(require, module, exports) {


exports.__esModule = true;
exports.presetEnvSilentDebugHeader = void 0;
exports.stringifyTargets = stringifyTargets;
exports.stringifyTargetsMultiline = stringifyTargetsMultiline;
var _helperCompilationTargets = require("@babel/helper-compilation-targets");
const presetEnvSilentDebugHeader = exports.presetEnvSilentDebugHeader = "#__secret_key__@babel/preset-env__don't_log_debug_header_and_resolved_targets";
function stringifyTargetsMultiline(targets) {
  return JSON.stringify((0, _helperCompilationTargets.prettifyTargets)(targets), null, 2);
}
function stringifyTargets(targets) {
  return JSON.stringify(targets).replace(/,/g, ", ").replace(/^\{"/, '{ "').replace(/"\}$/, '" }');
}
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401257, function(require, module, exports) {


exports.__esModule = true;
exports.applyMissingDependenciesDefaults = applyMissingDependenciesDefaults;
exports.validateIncludeExclude = validateIncludeExclude;
var _utils = require("./utils");
function patternToRegExp(pattern) {
  if (pattern instanceof RegExp) return pattern;
  try {
    return new RegExp(`^${pattern}$`);
  } catch (_unused) {
    return null;
  }
}
function buildUnusedError(label, unused) {
  if (!unused.length) return "";
  return `  - The following "${label}" patterns didn't match any polyfill:\n` + unused.map(original => `    ${String(original)}\n`).join("");
}
function buldDuplicatesError(duplicates) {
  if (!duplicates.size) return "";
  return `  - The following polyfills were matched both by "include" and "exclude" patterns:\n` + Array.from(duplicates, name => `    ${name}\n`).join("");
}
function validateIncludeExclude(provider, polyfills, includePatterns, excludePatterns) {
  let current;
  const filter = pattern => {
    const regexp = patternToRegExp(pattern);
    if (!regexp) return false;
    let matched = false;
    for (const polyfill of polyfills.keys()) {
      if (regexp.test(polyfill)) {
        matched = true;
        current.add(polyfill);
      }
    }
    return !matched;
  };

  // prettier-ignore
  const include = current = new Set();
  const unusedInclude = Array.from(includePatterns).filter(filter);

  // prettier-ignore
  const exclude = current = new Set();
  const unusedExclude = Array.from(excludePatterns).filter(filter);
  const duplicates = (0, _utils.intersection)(include, exclude);
  if (duplicates.size > 0 || unusedInclude.length > 0 || unusedExclude.length > 0) {
    throw new Error(`Error while validating the "${provider}" provider options:\n` + buildUnusedError("include", unusedInclude) + buildUnusedError("exclude", unusedExclude) + buldDuplicatesError(duplicates));
  }
  return {
    include,
    exclude
  };
}
function applyMissingDependenciesDefaults(options, babelApi) {
  const {
    missingDependencies = {}
  } = options;
  if (missingDependencies === false) return false;
  const caller = babelApi.caller(caller => caller == null ? void 0 : caller.name);
  const {
    log = "deferred",
    inject = caller === "rollup-plugin-babel" ? "throw" : "import",
    all = false
  } = missingDependencies;
  return {
    log,
    inject,
    all
  };
}
}, function(modId) { var map = {"./utils":1768876401254}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401258, function(require, module, exports) {


exports.__esModule = true;
exports.usage = exports.entry = void 0;
var _usage = _interopRequireDefault(require("./usage"));
exports.usage = _usage.default;
var _entry = _interopRequireDefault(require("./entry"));
exports.entry = _entry.default;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
}, function(modId) { var map = {"./usage":1768876401259,"./entry":1768876401260}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401259, function(require, module, exports) {


exports.__esModule = true;
exports.default = void 0;
var _utils = require("../utils");
function isRemoved(path) {
  if (path.removed) return true;
  if (!path.parentPath) return false;
  if (path.listKey) {
    var _path$parentPath$node;
    if (!((_path$parentPath$node = path.parentPath.node) != null && (_path$parentPath$node = _path$parentPath$node[path.listKey]) != null && _path$parentPath$node.includes(path.node))) return true;
  } else {
    var _path$parentPath$node2;
    if (((_path$parentPath$node2 = path.parentPath.node) == null ? void 0 : _path$parentPath$node2[path.key]) !== path.node) return true;
  }
  return isRemoved(path.parentPath);
}
var _default = callProvider => {
  function property(object, key, placement, path) {
    return callProvider({
      kind: "property",
      object,
      key,
      placement
    }, path);
  }
  function handleReferencedIdentifier(path) {
    const {
      node: {
        name
      },
      scope
    } = path;
    if (scope.getBindingIdentifier(name)) return;
    callProvider({
      kind: "global",
      name
    }, path);
  }
  function analyzeMemberExpression(path) {
    const key = (0, _utils.resolveKey)(path.get("property"), path.node.computed);
    return {
      key,
      handleAsMemberExpression: !!key && key !== "prototype"
    };
  }
  return {
    // Symbol(), new Promise
    ReferencedIdentifier(path) {
      const {
        parentPath
      } = path;
      if (parentPath.isMemberExpression({
        object: path.node
      }) && analyzeMemberExpression(parentPath).handleAsMemberExpression) {
        return;
      }
      handleReferencedIdentifier(path);
    },
    "MemberExpression|OptionalMemberExpression"(path) {
      const {
        key,
        handleAsMemberExpression
      } = analyzeMemberExpression(path);
      if (!handleAsMemberExpression) return;
      const object = path.get("object");
      let objectIsGlobalIdentifier = object.isIdentifier();
      if (objectIsGlobalIdentifier) {
        const binding = object.scope.getBinding(object.node.name);
        if (binding) {
          if (binding.path.isImportNamespaceSpecifier()) return;
          objectIsGlobalIdentifier = false;
        }
      }
      const source = (0, _utils.resolveSource)(object);
      let skipObject = property(source.id, key, source.placement, path);
      skipObject || (skipObject = !objectIsGlobalIdentifier || path.shouldSkip || object.shouldSkip || isRemoved(object));
      if (!skipObject) handleReferencedIdentifier(object);
    },
    ObjectPattern(path) {
      const {
        parentPath,
        parent
      } = path;
      let obj;

      // const { keys, values } = Object
      if (parentPath.isVariableDeclarator()) {
        obj = parentPath.get("init");
        // ({ keys, values } = Object)
      } else if (parentPath.isAssignmentExpression()) {
        obj = parentPath.get("right");
        // !function ({ keys, values }) {...} (Object)
        // resolution does not work after properties transform :-(
      } else if (parentPath.isFunction()) {
        const grand = parentPath.parentPath;
        if (grand.isCallExpression() || grand.isNewExpression()) {
          if (grand.node.callee === parent) {
            obj = grand.get("arguments")[path.key];
          }
        }
      }
      let id = null;
      let placement = null;
      if (obj) ({
        id,
        placement
      } = (0, _utils.resolveSource)(obj));
      for (const prop of path.get("properties")) {
        if (prop.isObjectProperty()) {
          const key = (0, _utils.resolveKey)(prop.get("key"));
          if (key) property(id, key, placement, prop);
        }
      }
    },
    BinaryExpression(path) {
      if (path.node.operator !== "in") return;
      const source = (0, _utils.resolveSource)(path.get("right"));
      const key = (0, _utils.resolveKey)(path.get("left"), true);
      if (!key) return;
      callProvider({
        kind: "in",
        object: source.id,
        key,
        placement: source.placement
      }, path);
    }
  };
};
exports.default = _default;
}, function(modId) { var map = {"../utils":1768876401254}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401260, function(require, module, exports) {


exports.__esModule = true;
exports.default = void 0;
var _utils = require("../utils");
var _default = callProvider => ({
  ImportDeclaration(path) {
    const source = (0, _utils.getImportSource)(path);
    if (!source) return;
    callProvider({
      kind: "import",
      source
    }, path);
  },
  Program(path) {
    path.get("body").forEach(bodyPath => {
      const source = (0, _utils.getRequireSource)(bodyPath);
      if (!source) return;
      callProvider({
        kind: "import",
        source
      }, bodyPath);
    });
  }
});
exports.default = _default;
}, function(modId) { var map = {"../utils":1768876401254}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401261, function(require, module, exports) {


exports.__esModule = true;
exports.has = has;
exports.laterLogMissing = laterLogMissing;
exports.logMissing = logMissing;
exports.resolve = resolve;
var _path = _interopRequireDefault(require("path"));
var _lodash = _interopRequireDefault(require("lodash.debounce"));
var _resolve = _interopRequireDefault(require("resolve"));
var _module = require("module");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const nativeRequireResolve = parseFloat(process.versions.node) >= 8.9;
// eslint-disable-line

function myResolve(name, basedir) {
  if (nativeRequireResolve) {
    return require.resolve(name, {
      paths: [basedir]
    }).replace(/\\/g, "/");
  } else {
    return _resolve.default.sync(name, {
      basedir
    }).replace(/\\/g, "/");
  }
}
function resolve(dirname, moduleName, absoluteImports) {
  if (absoluteImports === false) return moduleName;
  let basedir = dirname;
  if (typeof absoluteImports === "string") {
    basedir = _path.default.resolve(basedir, absoluteImports);
  }
  try {
    return myResolve(moduleName, basedir);
  } catch (err) {
    if (err.code !== "MODULE_NOT_FOUND") throw err;
    throw Object.assign(new Error(`Failed to resolve "${moduleName}" relative to "${dirname}"`), {
      code: "BABEL_POLYFILL_NOT_FOUND",
      polyfill: moduleName,
      dirname
    });
  }
}
function has(basedir, name) {
  try {
    myResolve(name, basedir);
    return true;
  } catch (_unused) {
    return false;
  }
}
function logMissing(missingDeps) {
  if (missingDeps.size === 0) return;
  const deps = Array.from(missingDeps).sort().join(" ");
  console.warn("\nSome polyfills have been added but are not present in your dependencies.\n" + "Please run one of the following commands:\n" + `\tnpm install --save ${deps}\n` + `\tyarn add ${deps}\n`);
  process.exitCode = 1;
}
let allMissingDeps = new Set();
const laterLogMissingDependencies = (0, _lodash.default)(() => {
  logMissing(allMissingDeps);
  allMissingDeps = new Set();
}, 100);
function laterLogMissing(missingDeps) {
  if (missingDeps.size === 0) return;
  missingDeps.forEach(name => allMissingDeps.add(name));
  laterLogMissingDependencies();
}
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401262, function(require, module, exports) {


exports.__esModule = true;
exports.default = createMetaResolver;
var _utils = require("./utils");
const PossibleGlobalObjects = new Set(["global", "globalThis", "self", "window"]);
function createMetaResolver(polyfills) {
  const {
    static: staticP,
    instance: instanceP,
    global: globalP
  } = polyfills;
  return meta => {
    if (meta.kind === "global" && globalP && (0, _utils.has)(globalP, meta.name)) {
      return {
        kind: "global",
        desc: globalP[meta.name],
        name: meta.name
      };
    }
    if (meta.kind === "property" || meta.kind === "in") {
      const {
        placement,
        object,
        key
      } = meta;
      if (object && placement === "static") {
        if (globalP && PossibleGlobalObjects.has(object) && (0, _utils.has)(globalP, key)) {
          return {
            kind: "global",
            desc: globalP[key],
            name: key
          };
        }
        if (staticP && (0, _utils.has)(staticP, object) && (0, _utils.has)(staticP[object], key)) {
          return {
            kind: "static",
            desc: staticP[object][key],
            name: `${object}$${key}`
          };
        }
      }
      if (instanceP && (0, _utils.has)(instanceP, key)) {
        return {
          kind: "instance",
          desc: instanceP[key],
          name: `${key}`
        };
      }
    }
  };
}
}, function(modId) { var map = {"./utils":1768876401254}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768876401253);
})()
//miniprogram-npm-outsideDeps=["@babel/helper-plugin-utils","@babel/helper-compilation-targets","@babel/core","path","lodash.debounce","resolve","module"]
//# sourceMappingURL=index.js.map