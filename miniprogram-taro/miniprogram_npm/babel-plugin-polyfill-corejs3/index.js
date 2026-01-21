module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768876401660, function(require, module, exports) {


exports.__esModule = true;
exports.default = void 0;
var _data = _interopRequireDefault(require("../core-js-compat/data.js"));
var _shippedProposals = _interopRequireDefault(require("./shipped-proposals"));
var _getModulesListForTargetVersion = _interopRequireDefault(require("../core-js-compat/get-modules-list-for-target-version.js"));
var _builtInDefinitions = require("./built-in-definitions");
var BabelRuntimePaths = _interopRequireWildcard(require("./babel-runtime-corejs3-paths"));
var _usageFilters = _interopRequireDefault(require("./usage-filters"));
var _babel = _interopRequireWildcard(require("@babel/core"));
var _utils = require("./utils");
var _helperDefinePolyfillProvider = _interopRequireDefault(require("@babel/helper-define-polyfill-provider"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  types: t,
  template: template
} = _babel.default || _babel;
const presetEnvCompat = "#__secret_key__@babel/preset-env__compatibility";
const runtimeCompat = "#__secret_key__@babel/runtime__compatibility";
const uniqueObjects = ["array", "string", "iterator", "async-iterator", "dom-collections"].map(v => new RegExp(`[a-z]*\\.${v}\\..*`));
const esnextFallback = (name, cb) => {
  if (cb(name)) return true;
  if (!name.startsWith("es.")) return false;
  const fallback = `esnext.${name.slice(3)}`;
  if (!_data.default[fallback]) return false;
  return cb(fallback);
};
var _default = exports.default = (0, _helperDefinePolyfillProvider.default)(function ({
  getUtils,
  method,
  shouldInjectPolyfill,
  createMetaResolver,
  debug,
  babel
}, {
  version = 3,
  proposals,
  shippedProposals,
  [presetEnvCompat]: {
    noRuntimeName = false
  } = {},
  [runtimeCompat]: {
    useBabelRuntime = false,
    ext = ".js"
  } = {}
}) {
  const isWebpack = babel.caller(caller => (caller == null ? void 0 : caller.name) === "babel-loader");
  const resolve = createMetaResolver({
    global: _builtInDefinitions.BuiltIns,
    static: _builtInDefinitions.StaticProperties,
    instance: _builtInDefinitions.InstanceProperties
  });
  const available = new Set((0, _getModulesListForTargetVersion.default)(version));
  function getCoreJSPureBase(useProposalBase) {
    return useBabelRuntime ? useProposalBase ? `${_utils.BABEL_RUNTIME}/core-js` : `${_utils.BABEL_RUNTIME}/core-js-stable` : useProposalBase ? "core-js-pure/features" : "core-js-pure/stable";
  }
  function maybeInjectGlobalImpl(name, utils) {
    if (shouldInjectPolyfill(name)) {
      debug(name);
      utils.injectGlobalImport((0, _utils.coreJSModule)(name), name);
      return true;
    }
    return false;
  }
  function maybeInjectGlobal(names, utils, fallback = true) {
    for (const name of names) {
      if (fallback) {
        esnextFallback(name, name => maybeInjectGlobalImpl(name, utils));
      } else {
        maybeInjectGlobalImpl(name, utils);
      }
    }
  }
  function maybeInjectPure(desc, hint, utils, object) {
    if (desc.pure && !(object && desc.exclude && desc.exclude.includes(object)) && esnextFallback(desc.name, shouldInjectPolyfill)) {
      const {
        name
      } = desc;
      let useProposalBase = false;
      if (proposals || shippedProposals && name.startsWith("esnext.")) {
        useProposalBase = true;
      } else if (name.startsWith("es.") && !available.has(name)) {
        useProposalBase = true;
      }
      if (useBabelRuntime && !(useProposalBase ? BabelRuntimePaths.proposals : BabelRuntimePaths.stable).has(desc.pure)) {
        return;
      }
      const coreJSPureBase = getCoreJSPureBase(useProposalBase);
      return utils.injectDefaultImport(`${coreJSPureBase}/${desc.pure}${ext}`, hint);
    }
  }
  function isFeatureStable(name) {
    if (name.startsWith("esnext.")) {
      const esName = `es.${name.slice(7)}`;
      // If its imaginative esName is not in latest compat data, it means
      // the proposal is not stage 4
      return esName in _data.default;
    }
    return true;
  }
  return {
    name: "corejs3",
    runtimeName: noRuntimeName ? null : _utils.BABEL_RUNTIME,
    polyfills: _data.default,
    filterPolyfills(name) {
      if (!available.has(name)) return false;
      if (proposals || method === "entry-global") return true;
      if (shippedProposals && _shippedProposals.default.has(name)) {
        return true;
      }
      return isFeatureStable(name);
    },
    entryGlobal(meta, utils, path) {
      if (meta.kind !== "import") return;
      const modules = (0, _utils.isCoreJSSource)(meta.source);
      if (!modules) return;
      if (modules.length === 1 && meta.source === (0, _utils.coreJSModule)(modules[0]) && shouldInjectPolyfill(modules[0])) {
        // Avoid infinite loop: do not replace imports with a new copy of
        // themselves.
        debug(null);
        return;
      }
      const modulesSet = new Set(modules);
      const filteredModules = modules.filter(module => {
        if (!module.startsWith("esnext.")) return true;
        const stable = module.replace("esnext.", "es.");
        if (modulesSet.has(stable) && shouldInjectPolyfill(stable)) {
          return false;
        }
        return true;
      });
      maybeInjectGlobal(filteredModules, utils, false);
      path.remove();
    },
    usageGlobal(meta, utils, path) {
      const resolved = resolve(meta);
      if (!resolved) return;
      if ((0, _usageFilters.default)(resolved.desc, path)) return;
      let deps = resolved.desc.global;
      if (resolved.kind !== "global" && "object" in meta && meta.object && meta.placement === "prototype") {
        const low = meta.object.toLowerCase();
        deps = deps.filter(m => uniqueObjects.some(v => v.test(m)) ? m.includes(low) : true);
      }
      maybeInjectGlobal(deps, utils);
      return true;
    },
    usagePure(meta, utils, path) {
      if (meta.kind === "in") {
        if (meta.key === "Symbol.iterator") {
          path.replaceWith(t.callExpression(utils.injectDefaultImport((0, _utils.coreJSPureHelper)("is-iterable", useBabelRuntime, ext), "isIterable"), [path.node.right] // meta.kind === "in" narrows this
          ));
        }
        return;
      }
      if (path.parentPath.isUnaryExpression({
        operator: "delete"
      })) return;
      if (meta.kind === "property") {
        // We can't compile destructuring and updateExpression.
        if (!path.isMemberExpression() && !path.isOptionalMemberExpression()) {
          return;
        }
        if (!path.isReferenced()) return;
        if (path.parentPath.isUpdateExpression()) return;
        if (t.isSuper(path.node.object)) {
          return;
        }
        if (meta.key === "Symbol.iterator") {
          if (!shouldInjectPolyfill("es.symbol.iterator")) return;
          const {
            parent,
            node
          } = path;
          if (t.isCallExpression(parent, {
            callee: node
          })) {
            if (parent.arguments.length === 0) {
              path.parentPath.replaceWith(t.callExpression(utils.injectDefaultImport((0, _utils.coreJSPureHelper)("get-iterator", useBabelRuntime, ext), "getIterator"), [node.object]));
              path.skip();
            } else {
              (0, _utils.callMethod)(path, utils.injectDefaultImport((0, _utils.coreJSPureHelper)("get-iterator-method", useBabelRuntime, ext), "getIteratorMethod"));
            }
          } else {
            path.replaceWith(t.callExpression(utils.injectDefaultImport((0, _utils.coreJSPureHelper)("get-iterator-method", useBabelRuntime, ext), "getIteratorMethod"), [path.node.object]));
          }
          return;
        }
      }
      let resolved = resolve(meta);
      if (!resolved) return;
      if ((0, _usageFilters.default)(resolved.desc, path)) return;
      if (useBabelRuntime && resolved.desc.pure && resolved.desc.pure.slice(-6) === "/index") {
        // Remove /index, since it doesn't exist in @babel/runtime-corejs3s
        resolved = _extends({}, resolved, {
          desc: _extends({}, resolved.desc, {
            pure: resolved.desc.pure.slice(0, -6)
          })
        });
      }
      if (resolved.kind === "global") {
        const id = maybeInjectPure(resolved.desc, resolved.name, utils);
        if (id) path.replaceWith(id);
      } else if (resolved.kind === "static") {
        const id = maybeInjectPure(resolved.desc, resolved.name, utils,
        // @ts-expect-error
        meta.object);
        if (id) {
          path.replaceWith(id);
          let {
            parentPath
          } = path;
          if (parentPath.isOptionalMemberExpression() || parentPath.isOptionalCallExpression()) {
            do {
              const parentAsNotOptional = parentPath;
              parentAsNotOptional.type = parentAsNotOptional.node.type = parentPath.type === "OptionalMemberExpression" ? "MemberExpression" : "CallExpression";
              delete parentAsNotOptional.node.optional;
              ({
                parentPath
              } = parentPath);
            } while ((parentPath.isOptionalMemberExpression() || parentPath.isOptionalCallExpression()) && !parentPath.node.optional);
          }
        }
      } else if (resolved.kind === "instance") {
        const id = maybeInjectPure(resolved.desc, `${resolved.name}InstanceProperty`, utils,
        // @ts-expect-error
        meta.object);
        if (!id) return;
        const {
          node,
          parent
        } = path;
        if (t.isOptionalCallExpression(parent) && parent.callee === node) {
          const wasOptional = parent.optional;
          parent.optional = !wasOptional;
          if (!wasOptional) {
            const check = (0, _utils.extractOptionalCheck)(path.scope, node);
            const [thisArg, thisArg2] = (0, _utils.maybeMemoizeContext)(node, path.scope);
            path.replaceWith(check(template.expression.ast`
                  Function.call.bind(${id}(${thisArg}), ${thisArg2})
                `));
          } else if (t.isOptionalMemberExpression(node)) {
            const check = (0, _utils.extractOptionalCheck)(path.scope, node);
            (0, _utils.callMethod)(path, id, true, check);
          } else {
            (0, _utils.callMethod)(path, id, true);
          }
        } else if (t.isCallExpression(parent) && parent.callee === node) {
          (0, _utils.callMethod)(path, id, false);
        } else if (t.isOptionalMemberExpression(node)) {
          const check = (0, _utils.extractOptionalCheck)(path.scope, node);
          path.replaceWith(check(t.callExpression(id, [node.object])));
          if (t.isOptionalMemberExpression(parent)) parent.optional = true;
        } else {
          path.replaceWith(t.callExpression(id, [node.object]));
        }
      }
    },
    visitor: method === "usage-global" && {
      // import("foo")
      CallExpression(path) {
        if (path.get("callee").isImport()) {
          const utils = getUtils(path);
          if (isWebpack) {
            // Webpack uses Promise.all to handle dynamic import.
            maybeInjectGlobal(_builtInDefinitions.PromiseDependenciesWithIterators, utils);
          } else {
            maybeInjectGlobal(_builtInDefinitions.PromiseDependencies, utils);
          }
        }
      },
      // (async function () { }).finally(...)
      Function(path) {
        if (path.node.async) {
          maybeInjectGlobal(_builtInDefinitions.PromiseDependencies, getUtils(path));
        }
      },
      // for-of, [a, b] = c
      "ForOfStatement|ArrayPattern"(path) {
        maybeInjectGlobal(_builtInDefinitions.CommonIterators, getUtils(path));
      },
      // [...spread]
      SpreadElement(path) {
        if (!path.parentPath.isObjectExpression()) {
          maybeInjectGlobal(_builtInDefinitions.CommonIterators, getUtils(path));
        }
      },
      // yield*
      YieldExpression(path) {
        if (path.node.delegate) {
          maybeInjectGlobal(_builtInDefinitions.CommonIterators, getUtils(path));
        }
      },
      // Decorators metadata
      Class(path) {
        var _path$node$decorators;
        const hasDecorators = ((_path$node$decorators = path.node.decorators) == null ? void 0 : _path$node$decorators.length) || path.node.body.body.some(el => {
          var _decorators;
          return (_decorators = el.decorators) == null ? void 0 : _decorators.length;
        });
        if (hasDecorators) {
          maybeInjectGlobal(_builtInDefinitions.DecoratorMetadataDependencies, getUtils(path));
        }
      }
    }
  };
});
}, function(modId) {var map = {"../core-js-compat/data.js":1768876401661,"./shipped-proposals":1768876401662,"../core-js-compat/get-modules-list-for-target-version.js":1768876401663,"./built-in-definitions":1768876401664,"./babel-runtime-corejs3-paths":1768876401665,"./usage-filters":1768876401666,"./utils":1768876401667}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401661, function(require, module, exports) {
module.exports = require("core-js-compat/data");

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401662, function(require, module, exports) {


exports.__esModule = true;
exports.default = void 0;
// This file is automatically generated by scripts/build-corejs3-shipped-proposals.mjs
var _default = exports.default = new Set(["esnext.array.group", "esnext.array.group-to-map", "esnext.json.is-raw-json", "esnext.json.parse", "esnext.json.raw-json", "esnext.math.sum-precise", "esnext.symbol.metadata", "esnext.uint8-array.from-base64", "esnext.uint8-array.from-hex", "esnext.uint8-array.set-from-base64", "esnext.uint8-array.set-from-hex", "esnext.uint8-array.to-base64", "esnext.uint8-array.to-hex"]);
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401663, function(require, module, exports) {
module.exports = require("core-js-compat/get-modules-list-for-target-version");

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401664, function(require, module, exports) {


exports.__esModule = true;
exports.StaticProperties = exports.PromiseDependenciesWithIterators = exports.PromiseDependencies = exports.InstanceProperties = exports.DecoratorMetadataDependencies = exports.CommonIterators = exports.BuiltIns = void 0;
var _data = _interopRequireDefault(require("../core-js-compat/data.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const polyfillsOrder = {};
Object.keys(_data.default).forEach((name, index) => {
  polyfillsOrder[name] = index;
});
const define = (pure, global, name = global[0], exclude) => {
  return {
    name,
    pure,
    global: global.sort((a, b) => polyfillsOrder[a] - polyfillsOrder[b]),
    exclude
  };
};
const typed = (...modules) => define(null, [...modules, ...TypedArrayDependencies]);
const ArrayNatureIterators = ["es.array.iterator", "web.dom-collections.iterator"];
const CommonIterators = exports.CommonIterators = ["es.string.iterator", ...ArrayNatureIterators];
const ArrayNatureIteratorsWithTag = ["es.object.to-string", ...ArrayNatureIterators];
const CommonIteratorsWithTag = ["es.object.to-string", ...CommonIterators];
const ErrorDependencies = ["es.error.cause", "es.error.to-string"];
const SuppressedErrorDependencies = ["es.suppressed-error.constructor", ...ErrorDependencies];
const ArrayBufferDependencies = ["es.array-buffer.constructor", "es.array-buffer.slice", "es.data-view", "es.array-buffer.detached", "es.array-buffer.transfer", "es.array-buffer.transfer-to-fixed-length", "es.object.to-string"];
const TypedArrayDependencies = ["es.typed-array.at", "es.typed-array.copy-within", "es.typed-array.every", "es.typed-array.fill", "es.typed-array.filter", "es.typed-array.find", "es.typed-array.find-index", "es.typed-array.find-last", "es.typed-array.find-last-index", "es.typed-array.for-each", "es.typed-array.includes", "es.typed-array.index-of", "es.typed-array.iterator", "es.typed-array.join", "es.typed-array.last-index-of", "es.typed-array.map", "es.typed-array.reduce", "es.typed-array.reduce-right", "es.typed-array.reverse", "es.typed-array.set", "es.typed-array.slice", "es.typed-array.some", "es.typed-array.sort", "es.typed-array.subarray", "es.typed-array.to-locale-string", "es.typed-array.to-reversed", "es.typed-array.to-sorted", "es.typed-array.to-string", "es.typed-array.with", "es.object.to-string", "es.array.iterator", "esnext.typed-array.filter-reject", "esnext.typed-array.group-by", "esnext.typed-array.to-spliced", "esnext.typed-array.unique-by", ...ArrayBufferDependencies];
const PromiseDependencies = exports.PromiseDependencies = ["es.promise", "es.object.to-string"];
const PromiseDependenciesWithIterators = exports.PromiseDependenciesWithIterators = [...PromiseDependencies, ...CommonIterators];
const SymbolDependencies = ["es.symbol", "es.symbol.description", "es.object.to-string"];
const MapDependencies = ["es.map", "esnext.map.delete-all", "esnext.map.emplace", "esnext.map.every", "esnext.map.filter", "esnext.map.find", "esnext.map.find-key", "esnext.map.get-or-insert", "esnext.map.get-or-insert-computed", "esnext.map.includes", "esnext.map.key-of", "esnext.map.map-keys", "esnext.map.map-values", "esnext.map.merge", "esnext.map.reduce", "esnext.map.some", "esnext.map.update", ...CommonIteratorsWithTag];
const SetDependencies = ["es.set", "es.set.difference.v2", "es.set.intersection.v2", "es.set.is-disjoint-from.v2", "es.set.is-subset-of.v2", "es.set.is-superset-of.v2", "es.set.symmetric-difference.v2", "es.set.union.v2", "esnext.set.add-all", "esnext.set.delete-all", "esnext.set.difference", "esnext.set.every", "esnext.set.filter", "esnext.set.find", "esnext.set.intersection", "esnext.set.is-disjoint-from", "esnext.set.is-subset-of", "esnext.set.is-superset-of", "esnext.set.join", "esnext.set.map", "esnext.set.reduce", "esnext.set.some", "esnext.set.symmetric-difference", "esnext.set.union", ...CommonIteratorsWithTag];
const WeakMapDependencies = ["es.weak-map", "esnext.weak-map.delete-all", "esnext.weak-map.emplace", "esnext.weak-map.get-or-insert", "esnext.weak-map.get-or-insert-computed", ...CommonIteratorsWithTag];
const WeakSetDependencies = ["es.weak-set", "esnext.weak-set.add-all", "esnext.weak-set.delete-all", ...CommonIteratorsWithTag];
const DOMExceptionDependencies = ["web.dom-exception.constructor", "web.dom-exception.stack", "web.dom-exception.to-string-tag", "es.error.to-string"];
const URLSearchParamsDependencies = ["web.url-search-params", "web.url-search-params.delete", "web.url-search-params.has", "web.url-search-params.size", ...CommonIteratorsWithTag];
const AsyncIteratorDependencies = ["esnext.async-iterator.constructor", ...PromiseDependencies];
const AsyncIteratorProblemMethods = ["esnext.async-iterator.every", "esnext.async-iterator.filter", "esnext.async-iterator.find", "esnext.async-iterator.flat-map", "esnext.async-iterator.for-each", "esnext.async-iterator.map", "esnext.async-iterator.reduce", "esnext.async-iterator.some"];
const IteratorDependencies = ["es.iterator.constructor", "es.object.to-string"];
const DecoratorMetadataDependencies = exports.DecoratorMetadataDependencies = ["esnext.symbol.metadata", "esnext.function.metadata"];
const TypedArrayStaticMethods = base => ({
  from: define(null, ["es.typed-array.from", base, ...TypedArrayDependencies]),
  fromAsync: define(null, ["esnext.typed-array.from-async", base, ...PromiseDependenciesWithIterators, ...TypedArrayDependencies]),
  of: define(null, ["es.typed-array.of", base, ...TypedArrayDependencies])
});
const DataViewDependencies = ["es.data-view", ...ArrayBufferDependencies];
const BuiltIns = exports.BuiltIns = {
  AsyncDisposableStack: define("async-disposable-stack/index", ["es.async-disposable-stack.constructor", "es.object.to-string", "es.async-iterator.async-dispose", "es.iterator.dispose", ...PromiseDependencies, ...SuppressedErrorDependencies]),
  AsyncIterator: define("async-iterator/index", AsyncIteratorDependencies),
  AggregateError: define("aggregate-error", ["es.aggregate-error", ...ErrorDependencies, ...CommonIteratorsWithTag, "es.aggregate-error.cause"]),
  ArrayBuffer: define(null, ArrayBufferDependencies),
  DataView: define(null, DataViewDependencies),
  Date: define(null, ["es.date.to-string"]),
  DOMException: define("dom-exception/index", DOMExceptionDependencies),
  DisposableStack: define("disposable-stack/index", ["es.disposable-stack.constructor", "es.object.to-string", "es.iterator.dispose", ...SuppressedErrorDependencies]),
  Error: define(null, ErrorDependencies),
  EvalError: define(null, ErrorDependencies),
  Float32Array: typed("es.typed-array.float32-array"),
  Float64Array: typed("es.typed-array.float64-array"),
  Int8Array: typed("es.typed-array.int8-array"),
  Int16Array: typed("es.typed-array.int16-array"),
  Int32Array: typed("es.typed-array.int32-array"),
  Iterator: define("iterator/index", IteratorDependencies),
  Uint8Array: typed("es.typed-array.uint8-array", "esnext.uint8-array.set-from-base64", "esnext.uint8-array.set-from-hex", "esnext.uint8-array.to-base64", "esnext.uint8-array.to-hex"),
  Uint8ClampedArray: typed("es.typed-array.uint8-clamped-array"),
  Uint16Array: typed("es.typed-array.uint16-array"),
  Uint32Array: typed("es.typed-array.uint32-array"),
  Map: define("map/index", MapDependencies),
  Number: define(null, ["es.number.constructor"]),
  Observable: define("observable/index", ["esnext.observable", "esnext.symbol.observable", "es.object.to-string", ...CommonIteratorsWithTag]),
  Promise: define("promise/index", PromiseDependencies),
  RangeError: define(null, ErrorDependencies),
  ReferenceError: define(null, ErrorDependencies),
  Reflect: define(null, ["es.reflect.to-string-tag", "es.object.to-string"]),
  RegExp: define(null, ["es.regexp.constructor", "es.regexp.dot-all", "es.regexp.exec", "es.regexp.sticky", "es.regexp.to-string"]),
  Set: define("set/index", SetDependencies),
  SuppressedError: define("suppressed-error", SuppressedErrorDependencies),
  Symbol: define("symbol/index", SymbolDependencies),
  SyntaxError: define(null, ErrorDependencies),
  TypeError: define(null, ErrorDependencies),
  URIError: define(null, ErrorDependencies),
  URL: define("url/index", ["web.url", "web.url.to-json", ...URLSearchParamsDependencies]),
  URLSearchParams: define("url-search-params/index", URLSearchParamsDependencies),
  WeakMap: define("weak-map/index", WeakMapDependencies),
  WeakSet: define("weak-set/index", WeakSetDependencies),
  atob: define("atob", ["web.atob", ...DOMExceptionDependencies]),
  btoa: define("btoa", ["web.btoa", ...DOMExceptionDependencies]),
  clearImmediate: define("clear-immediate", ["web.immediate"]),
  compositeKey: define("composite-key", ["esnext.composite-key"]),
  compositeSymbol: define("composite-symbol", ["esnext.composite-symbol"]),
  escape: define("escape", ["es.escape"]),
  fetch: define(null, PromiseDependencies),
  globalThis: define("global-this", ["es.global-this"]),
  parseFloat: define("parse-float", ["es.parse-float"]),
  parseInt: define("parse-int", ["es.parse-int"]),
  queueMicrotask: define("queue-microtask", ["web.queue-microtask"]),
  self: define("self", ["web.self"]),
  setImmediate: define("set-immediate", ["web.immediate"]),
  setInterval: define("set-interval", ["web.timers"]),
  setTimeout: define("set-timeout", ["web.timers"]),
  structuredClone: define("structured-clone", ["web.structured-clone", ...DOMExceptionDependencies, "es.array.iterator", "es.object.keys", "es.object.to-string", "es.map", "es.set"]),
  unescape: define("unescape", ["es.unescape"])
};
const StaticProperties = exports.StaticProperties = {
  AsyncIterator: {
    from: define("async-iterator/from", ["esnext.async-iterator.from", ...AsyncIteratorDependencies, ...AsyncIteratorProblemMethods, ...CommonIterators])
  },
  Array: {
    from: define("array/from", ["es.array.from", "es.string.iterator"]),
    fromAsync: define("array/from-async", ["es.array.from-async", ...PromiseDependenciesWithIterators]),
    isArray: define("array/is-array", ["es.array.is-array"]),
    isTemplateObject: define("array/is-template-object", ["esnext.array.is-template-object"]),
    of: define("array/of", ["es.array.of"])
  },
  ArrayBuffer: {
    isView: define(null, ["es.array-buffer.is-view"])
  },
  BigInt: {
    range: define("bigint/range", ["esnext.bigint.range", "es.object.to-string"])
  },
  Date: {
    now: define("date/now", ["es.date.now"])
  },
  Error: {
    isError: define("error/is-error", ["es.error.is-error", "es.object.create"])
  },
  Function: {
    isCallable: define("function/is-callable", ["esnext.function.is-callable"]),
    isConstructor: define("function/is-constructor", ["esnext.function.is-constructor"])
  },
  Iterator: {
    concat: define("iterator/concat", ["esnext.iterator.concat", ...IteratorDependencies, ...CommonIterators]),
    from: define("iterator/from", ["es.iterator.from", ...IteratorDependencies, ...CommonIterators]),
    range: define("iterator/range", ["esnext.iterator.range", ...IteratorDependencies]),
    zip: define("iterator/zip", ["esnext.iterator.zip", ...IteratorDependencies, ...CommonIterators]),
    zipKeyed: define("iterator/zip-keyed", ["esnext.iterator.zip-keyed", "es.object.create", "es.reflect.own-keys", ...IteratorDependencies, ...CommonIterators])
  },
  JSON: {
    isRawJSON: define("json/is-raw-json", ["esnext.json.is-raw-json"]),
    parse: define("json/parse", ["esnext.json.parse", "es.object.keys"]),
    rawJSON: define("json/raw-json", ["esnext.json.raw-json", "es.object.create", "es.object.freeze"]),
    stringify: define("json/stringify", ["es.json.stringify", "es.date.to-json"], "es.symbol")
  },
  Math: {
    DEG_PER_RAD: define("math/deg-per-rad", ["esnext.math.deg-per-rad"]),
    RAD_PER_DEG: define("math/rad-per-deg", ["esnext.math.rad-per-deg"]),
    acosh: define("math/acosh", ["es.math.acosh"]),
    asinh: define("math/asinh", ["es.math.asinh"]),
    atanh: define("math/atanh", ["es.math.atanh"]),
    cbrt: define("math/cbrt", ["es.math.cbrt"]),
    clamp: define("math/clamp", ["esnext.math.clamp"]),
    clz32: define("math/clz32", ["es.math.clz32"]),
    cosh: define("math/cosh", ["es.math.cosh"]),
    degrees: define("math/degrees", ["esnext.math.degrees"]),
    expm1: define("math/expm1", ["es.math.expm1"]),
    fround: define("math/fround", ["es.math.fround"]),
    f16round: define("math/f16round", ["es.math.f16round"]),
    fscale: define("math/fscale", ["esnext.math.fscale"]),
    hypot: define("math/hypot", ["es.math.hypot"]),
    iaddh: define("math/iaddh", ["esnext.math.iaddh"]),
    imul: define("math/imul", ["es.math.imul"]),
    imulh: define("math/imulh", ["esnext.math.imulh"]),
    isubh: define("math/isubh", ["esnext.math.isubh"]),
    log10: define("math/log10", ["es.math.log10"]),
    log1p: define("math/log1p", ["es.math.log1p"]),
    log2: define("math/log2", ["es.math.log2"]),
    radians: define("math/radians", ["esnext.math.radians"]),
    scale: define("math/scale", ["esnext.math.scale"]),
    seededPRNG: define("math/seeded-prng", ["esnext.math.seeded-prng"]),
    sign: define("math/sign", ["es.math.sign"]),
    signbit: define("math/signbit", ["esnext.math.signbit"]),
    sinh: define("math/sinh", ["es.math.sinh"]),
    sumPrecise: define("math/sum-precise", ["esnext.math.sum-precise", "es.array.iterator"]),
    tanh: define("math/tanh", ["es.math.tanh"]),
    trunc: define("math/trunc", ["es.math.trunc"]),
    umulh: define("math/umulh", ["esnext.math.umulh"])
  },
  Map: {
    from: define("map/from", ["esnext.map.from", ...MapDependencies]),
    groupBy: define("map/group-by", ["es.map.group-by", ...MapDependencies]),
    keyBy: define("map/key-by", ["esnext.map.key-by", ...MapDependencies]),
    of: define("map/of", ["esnext.map.of", ...MapDependencies])
  },
  Number: {
    EPSILON: define("number/epsilon", ["es.number.epsilon"]),
    MAX_SAFE_INTEGER: define("number/max-safe-integer", ["es.number.max-safe-integer"]),
    MIN_SAFE_INTEGER: define("number/min-safe-integer", ["es.number.min-safe-integer"]),
    fromString: define("number/from-string", ["esnext.number.from-string"]),
    isFinite: define("number/is-finite", ["es.number.is-finite"]),
    isInteger: define("number/is-integer", ["es.number.is-integer"]),
    isNaN: define("number/is-nan", ["es.number.is-nan"]),
    isSafeInteger: define("number/is-safe-integer", ["es.number.is-safe-integer"]),
    parseFloat: define("number/parse-float", ["es.number.parse-float"]),
    parseInt: define("number/parse-int", ["es.number.parse-int"]),
    range: define("number/range", ["esnext.number.range", "es.object.to-string"])
  },
  Object: {
    assign: define("object/assign", ["es.object.assign"]),
    create: define("object/create", ["es.object.create"]),
    defineProperties: define("object/define-properties", ["es.object.define-properties"]),
    defineProperty: define("object/define-property", ["es.object.define-property"]),
    entries: define("object/entries", ["es.object.entries"]),
    freeze: define("object/freeze", ["es.object.freeze"]),
    fromEntries: define("object/from-entries", ["es.object.from-entries", "es.array.iterator"]),
    getOwnPropertyDescriptor: define("object/get-own-property-descriptor", ["es.object.get-own-property-descriptor"]),
    getOwnPropertyDescriptors: define("object/get-own-property-descriptors", ["es.object.get-own-property-descriptors"]),
    getOwnPropertyNames: define("object/get-own-property-names", ["es.object.get-own-property-names"]),
    getOwnPropertySymbols: define("object/get-own-property-symbols", ["es.symbol"]),
    getPrototypeOf: define("object/get-prototype-of", ["es.object.get-prototype-of"]),
    groupBy: define("object/group-by", ["es.object.group-by", "es.object.create"]),
    hasOwn: define("object/has-own", ["es.object.has-own"]),
    is: define("object/is", ["es.object.is"]),
    isExtensible: define("object/is-extensible", ["es.object.is-extensible"]),
    isFrozen: define("object/is-frozen", ["es.object.is-frozen"]),
    isSealed: define("object/is-sealed", ["es.object.is-sealed"]),
    keys: define("object/keys", ["es.object.keys"]),
    preventExtensions: define("object/prevent-extensions", ["es.object.prevent-extensions"]),
    seal: define("object/seal", ["es.object.seal"]),
    setPrototypeOf: define("object/set-prototype-of", ["es.object.set-prototype-of"]),
    values: define("object/values", ["es.object.values"])
  },
  Promise: {
    all: define(null, PromiseDependenciesWithIterators),
    allSettled: define("promise/all-settled", ["es.promise.all-settled", ...PromiseDependenciesWithIterators]),
    any: define("promise/any", ["es.promise.any", "es.aggregate-error", ...PromiseDependenciesWithIterators]),
    race: define(null, PromiseDependenciesWithIterators),
    try: define("promise/try", ["es.promise.try", ...PromiseDependencies]),
    withResolvers: define("promise/with-resolvers", ["es.promise.with-resolvers", ...PromiseDependencies])
  },
  Reflect: {
    apply: define("reflect/apply", ["es.reflect.apply"]),
    construct: define("reflect/construct", ["es.reflect.construct"]),
    defineMetadata: define("reflect/define-metadata", ["esnext.reflect.define-metadata"]),
    defineProperty: define("reflect/define-property", ["es.reflect.define-property"]),
    deleteMetadata: define("reflect/delete-metadata", ["esnext.reflect.delete-metadata"]),
    deleteProperty: define("reflect/delete-property", ["es.reflect.delete-property"]),
    get: define("reflect/get", ["es.reflect.get"]),
    getMetadata: define("reflect/get-metadata", ["esnext.reflect.get-metadata"]),
    getMetadataKeys: define("reflect/get-metadata-keys", ["esnext.reflect.get-metadata-keys"]),
    getOwnMetadata: define("reflect/get-own-metadata", ["esnext.reflect.get-own-metadata"]),
    getOwnMetadataKeys: define("reflect/get-own-metadata-keys", ["esnext.reflect.get-own-metadata-keys"]),
    getOwnPropertyDescriptor: define("reflect/get-own-property-descriptor", ["es.reflect.get-own-property-descriptor"]),
    getPrototypeOf: define("reflect/get-prototype-of", ["es.reflect.get-prototype-of"]),
    has: define("reflect/has", ["es.reflect.has"]),
    hasMetadata: define("reflect/has-metadata", ["esnext.reflect.has-metadata"]),
    hasOwnMetadata: define("reflect/has-own-metadata", ["esnext.reflect.has-own-metadata"]),
    isExtensible: define("reflect/is-extensible", ["es.reflect.is-extensible"]),
    metadata: define("reflect/metadata", ["esnext.reflect.metadata"]),
    ownKeys: define("reflect/own-keys", ["es.reflect.own-keys"]),
    preventExtensions: define("reflect/prevent-extensions", ["es.reflect.prevent-extensions"]),
    set: define("reflect/set", ["es.reflect.set"]),
    setPrototypeOf: define("reflect/set-prototype-of", ["es.reflect.set-prototype-of"])
  },
  RegExp: {
    escape: define("regexp/escape", ["es.regexp.escape"])
  },
  Set: {
    from: define("set/from", ["esnext.set.from", ...SetDependencies]),
    of: define("set/of", ["esnext.set.of", ...SetDependencies])
  },
  String: {
    cooked: define("string/cooked", ["esnext.string.cooked"]),
    dedent: define("string/dedent", ["esnext.string.dedent", "es.string.from-code-point", "es.weak-map"]),
    fromCodePoint: define("string/from-code-point", ["es.string.from-code-point"]),
    raw: define("string/raw", ["es.string.raw"])
  },
  Symbol: {
    asyncDispose: define("symbol/async-dispose", ["es.symbol.async-dispose", "es.async-iterator.async-dispose"]),
    asyncIterator: define("symbol/async-iterator", ["es.symbol.async-iterator"]),
    customMatcher: define("symbol/custom-matcher", ["esnext.symbol.custom-matcher"]),
    dispose: define("symbol/dispose", ["es.symbol.dispose", "es.iterator.dispose"]),
    for: define("symbol/for", [], "es.symbol"),
    hasInstance: define("symbol/has-instance", ["es.symbol.has-instance", "es.function.has-instance"]),
    isConcatSpreadable: define("symbol/is-concat-spreadable", ["es.symbol.is-concat-spreadable", "es.array.concat"]),
    isRegistered: define("symbol/is-registered", ["esnext.symbol.is-registered", "es.symbol"]),
    isRegisteredSymbol: define("symbol/is-registered-symbol", ["esnext.symbol.is-registered-symbol", "es.symbol"]),
    isWellKnown: define("symbol/is-well-known", ["esnext.symbol.is-well-known", "es.symbol"]),
    isWellKnownSymbol: define("symbol/is-well-known-symbol", ["esnext.symbol.is-well-known-symbol", "es.symbol"]),
    iterator: define("symbol/iterator", ["es.symbol.iterator", ...CommonIteratorsWithTag]),
    keyFor: define("symbol/key-for", [], "es.symbol"),
    match: define("symbol/match", ["es.symbol.match", "es.string.match"]),
    matcher: define("symbol/matcher", ["esnext.symbol.matcher"]),
    matchAll: define("symbol/match-all", ["es.symbol.match-all", "es.string.match-all"]),
    metadata: define("symbol/metadata", DecoratorMetadataDependencies),
    metadataKey: define("symbol/metadata-key", ["esnext.symbol.metadata-key"]),
    observable: define("symbol/observable", ["esnext.symbol.observable"]),
    patternMatch: define("symbol/pattern-match", ["esnext.symbol.pattern-match"]),
    replace: define("symbol/replace", ["es.symbol.replace", "es.string.replace"]),
    search: define("symbol/search", ["es.symbol.search", "es.string.search"]),
    species: define("symbol/species", ["es.symbol.species", "es.array.species"]),
    split: define("symbol/split", ["es.symbol.split", "es.string.split"]),
    toPrimitive: define("symbol/to-primitive", ["es.symbol.to-primitive", "es.date.to-primitive"]),
    toStringTag: define("symbol/to-string-tag", ["es.symbol.to-string-tag", "es.object.to-string", "es.math.to-string-tag", "es.json.to-string-tag"]),
    unscopables: define("symbol/unscopables", ["es.symbol.unscopables"])
  },
  URL: {
    canParse: define("url/can-parse", ["web.url.can-parse", "web.url"]),
    parse: define("url/parse", ["web.url.parse", "web.url"])
  },
  WeakMap: {
    from: define("weak-map/from", ["esnext.weak-map.from", ...WeakMapDependencies]),
    of: define("weak-map/of", ["esnext.weak-map.of", ...WeakMapDependencies])
  },
  WeakSet: {
    from: define("weak-set/from", ["esnext.weak-set.from", ...WeakSetDependencies]),
    of: define("weak-set/of", ["esnext.weak-set.of", ...WeakSetDependencies])
  },
  Int8Array: TypedArrayStaticMethods("es.typed-array.int8-array"),
  Uint8Array: _extends({
    fromBase64: define(null, ["esnext.uint8-array.from-base64", ...TypedArrayDependencies]),
    fromHex: define(null, ["esnext.uint8-array.from-hex", ...TypedArrayDependencies])
  }, TypedArrayStaticMethods("es.typed-array.uint8-array")),
  Uint8ClampedArray: TypedArrayStaticMethods("es.typed-array.uint8-clamped-array"),
  Int16Array: TypedArrayStaticMethods("es.typed-array.int16-array"),
  Uint16Array: TypedArrayStaticMethods("es.typed-array.uint16-array"),
  Int32Array: TypedArrayStaticMethods("es.typed-array.int32-array"),
  Uint32Array: TypedArrayStaticMethods("es.typed-array.uint32-array"),
  Float32Array: TypedArrayStaticMethods("es.typed-array.float32-array"),
  Float64Array: TypedArrayStaticMethods("es.typed-array.float64-array"),
  WebAssembly: {
    CompileError: define(null, ErrorDependencies),
    LinkError: define(null, ErrorDependencies),
    RuntimeError: define(null, ErrorDependencies)
  }
};
["AggregateError", "EvalError", "RangeError", "ReferenceError", "SuppressedError", "SyntaxError", "TypeError", "URIError"].forEach(ERROR_SUBCLASS => {
  StaticProperties[ERROR_SUBCLASS] = StaticProperties.Error;
});
const InstanceProperties = exports.InstanceProperties = {
  asIndexedPairs: define(null, ["esnext.async-iterator.as-indexed-pairs", ...AsyncIteratorDependencies, "esnext.iterator.as-indexed-pairs", ...IteratorDependencies]),
  at: define("instance/at", [
  // TODO: We should introduce overloaded instance methods definition
  // Before that is implemented, the `esnext.string.at` must be the first
  // In pure mode, the provider resolves the descriptor as a "pure" `esnext.string.at`
  // and treats the compat-data of `esnext.string.at` as the compat-data of
  // pure import `instance/at`. The first polyfill here should have the lowest corejs
  // supported versions.
  "esnext.string.at", "es.string.at-alternative", "es.array.at"]),
  anchor: define(null, ["es.string.anchor"]),
  big: define(null, ["es.string.big"]),
  bind: define("instance/bind", ["es.function.bind"]),
  blink: define(null, ["es.string.blink"]),
  bold: define(null, ["es.string.bold"]),
  chunks: define(null, ["esnext.iterator.chunks", ...IteratorDependencies]),
  // TODO: add /instance/ entry
  clamp: define(null, ["esnext.number.clamp"]),
  codePointAt: define("instance/code-point-at", ["es.string.code-point-at"]),
  codePoints: define("instance/code-points", ["esnext.string.code-points"]),
  concat: define("instance/concat", ["es.array.concat"], undefined, ["String"]),
  copyWithin: define("instance/copy-within", ["es.array.copy-within"]),
  demethodize: define("instance/demethodize", ["esnext.function.demethodize"]),
  description: define(null, ["es.symbol", "es.symbol.description"]),
  dotAll: define(null, ["es.regexp.dot-all"]),
  drop: define(null, ["es.iterator.drop", ...IteratorDependencies, "esnext.async-iterator.drop", ...AsyncIteratorDependencies]),
  endsWith: define("instance/ends-with", ["es.string.ends-with"]),
  entries: define("instance/entries", ArrayNatureIteratorsWithTag),
  every: define("instance/every", ["es.array.every", "es.iterator.every", ...IteratorDependencies
  // TODO: add async iterator dependencies when we support sub-dependencies
  // esnext.async-iterator.every depends on es.promise
  // but we don't want to pull es.promise when esnext.async-iterator is disabled
  //
  // "esnext.async-iterator.every",
  // ...AsyncIteratorDependencies
  ]),
  exec: define(null, ["es.regexp.exec"]),
  fill: define("instance/fill", ["es.array.fill"]),
  filter: define("instance/filter", ["es.array.filter", "es.iterator.filter", ...IteratorDependencies
  // "esnext.async-iterator.filter",
  ]),
  filterReject: define("instance/filterReject", ["esnext.array.filter-reject"]),
  finally: define(null, ["es.promise.finally", ...PromiseDependencies]),
  find: define("instance/find", ["es.array.find", "es.iterator.find", ...IteratorDependencies
  // "esnext.async-iterator.find",
  ]),
  findIndex: define("instance/find-index", ["es.array.find-index"]),
  findLast: define("instance/find-last", ["es.array.find-last"]),
  findLastIndex: define("instance/find-last-index", ["es.array.find-last-index"]),
  fixed: define(null, ["es.string.fixed"]),
  flags: define("instance/flags", ["es.regexp.flags"]),
  flatMap: define("instance/flat-map", ["es.array.flat-map", "es.array.unscopables.flat-map", "es.iterator.flat-map", ...IteratorDependencies
  // "esnext.async-iterator.flat-map",
  ]),
  flat: define("instance/flat", ["es.array.flat", "es.array.unscopables.flat"]),
  getFloat16: define(null, ["es.data-view.get-float16", ...DataViewDependencies]),
  getUint8Clamped: define(null, ["esnext.data-view.get-uint8-clamped", ...DataViewDependencies]),
  getYear: define(null, ["es.date.get-year"]),
  group: define("instance/group", ["esnext.array.group"]),
  groupBy: define("instance/group-by", ["esnext.array.group-by"]),
  groupByToMap: define("instance/group-by-to-map", ["esnext.array.group-by-to-map", "es.map", "es.object.to-string"]),
  groupToMap: define("instance/group-to-map", ["esnext.array.group-to-map", "es.map", "es.object.to-string"]),
  fontcolor: define(null, ["es.string.fontcolor"]),
  fontsize: define(null, ["es.string.fontsize"]),
  forEach: define("instance/for-each", ["es.array.for-each", "es.iterator.for-each", ...IteratorDependencies,
  // "esnext.async-iterator.for-each",
  "web.dom-collections.for-each"]),
  includes: define("instance/includes", ["es.array.includes", "es.string.includes"]),
  indexed: define(null, ["esnext.async-iterator.indexed", ...AsyncIteratorDependencies, "esnext.iterator.indexed", ...IteratorDependencies]),
  indexOf: define("instance/index-of", ["es.array.index-of"]),
  isWellFormed: define("instance/is-well-formed", ["es.string.is-well-formed"]),
  italic: define(null, ["es.string.italics"]),
  join: define(null, ["es.array.join"]),
  keys: define("instance/keys", ArrayNatureIteratorsWithTag),
  lastIndex: define(null, ["esnext.array.last-index"]),
  lastIndexOf: define("instance/last-index-of", ["es.array.last-index-of"]),
  lastItem: define(null, ["esnext.array.last-item"]),
  link: define(null, ["es.string.link"]),
  map: define("instance/map", ["es.array.map", "es.iterator.map", ...IteratorDependencies
  // "esnext.async-iterator.map",
  ]),
  match: define(null, ["es.string.match", "es.regexp.exec"]),
  matchAll: define("instance/match-all", ["es.string.match-all", "es.regexp.exec"]),
  name: define(null, ["es.function.name"]),
  padEnd: define("instance/pad-end", ["es.string.pad-end"]),
  padStart: define("instance/pad-start", ["es.string.pad-start"]),
  push: define("instance/push", ["es.array.push"]),
  reduce: define("instance/reduce", ["es.array.reduce", "es.iterator.reduce", ...IteratorDependencies
  // "esnext.async-iterator.reduce",
  ]),
  reduceRight: define("instance/reduce-right", ["es.array.reduce-right"]),
  repeat: define("instance/repeat", ["es.string.repeat"]),
  replace: define(null, ["es.string.replace", "es.regexp.exec"]),
  replaceAll: define("instance/replace-all", ["es.string.replace-all", "es.string.replace", "es.regexp.exec"]),
  reverse: define("instance/reverse", ["es.array.reverse"]),
  search: define(null, ["es.string.search", "es.regexp.exec"]),
  setFloat16: define(null, ["es.data-view.set-float16", ...DataViewDependencies]),
  setUint8Clamped: define(null, ["esnext.data-view.set-uint8-clamped", ...DataViewDependencies]),
  setYear: define(null, ["es.date.set-year"]),
  slice: define("instance/slice", ["es.array.slice"]),
  small: define(null, ["es.string.small"]),
  some: define("instance/some", ["es.array.some", "es.iterator.some", ...IteratorDependencies
  // "esnext.async-iterator.some",
  ]),
  sort: define("instance/sort", ["es.array.sort"]),
  splice: define("instance/splice", ["es.array.splice"]),
  split: define(null, ["es.string.split", "es.regexp.exec"]),
  startsWith: define("instance/starts-with", ["es.string.starts-with"]),
  sticky: define(null, ["es.regexp.sticky"]),
  strike: define(null, ["es.string.strike"]),
  sub: define(null, ["es.string.sub"]),
  substr: define(null, ["es.string.substr"]),
  sup: define(null, ["es.string.sup"]),
  take: define(null, ["es.iterator.take", ...IteratorDependencies, "esnext.async-iterator.take", ...AsyncIteratorDependencies]),
  test: define(null, ["es.regexp.test", "es.regexp.exec"]),
  toArray: define(null, ["es.iterator.to-array", ...IteratorDependencies, "esnext.async-iterator.to-array", ...AsyncIteratorDependencies]),
  toAsync: define(null, ["esnext.iterator.to-async", ...IteratorDependencies, ...AsyncIteratorDependencies, ...AsyncIteratorProblemMethods]),
  toExponential: define(null, ["es.number.to-exponential"]),
  toFixed: define(null, ["es.number.to-fixed"]),
  toGMTString: define(null, ["es.date.to-gmt-string"]),
  toISOString: define(null, ["es.date.to-iso-string"]),
  toJSON: define(null, ["es.date.to-json"]),
  toPrecision: define(null, ["es.number.to-precision"]),
  toReversed: define("instance/to-reversed", ["es.array.to-reversed"]),
  toSorted: define("instance/to-sorted", ["es.array.to-sorted", "es.array.sort"]),
  toSpliced: define("instance/to-spliced", ["es.array.to-spliced"]),
  toString: define(null, ["es.object.to-string", "es.error.to-string", "es.date.to-string", "es.regexp.to-string"]),
  toWellFormed: define("instance/to-well-formed", ["es.string.to-well-formed"]),
  trim: define("instance/trim", ["es.string.trim"]),
  trimEnd: define("instance/trim-end", ["es.string.trim-end"]),
  trimLeft: define("instance/trim-left", ["es.string.trim-start"]),
  trimRight: define("instance/trim-right", ["es.string.trim-end"]),
  trimStart: define("instance/trim-start", ["es.string.trim-start"]),
  uniqueBy: define("instance/unique-by", ["esnext.array.unique-by", "es.map"]),
  unshift: define("instance/unshift", ["es.array.unshift"]),
  unThis: define("instance/un-this", ["esnext.function.un-this"]),
  values: define("instance/values", ArrayNatureIteratorsWithTag),
  windows: define(null, ["esnext.iterator.windows", ...IteratorDependencies]),
  with: define("instance/with", ["es.array.with"]),
  __defineGetter__: define(null, ["es.object.define-getter"]),
  __defineSetter__: define(null, ["es.object.define-setter"]),
  __lookupGetter__: define(null, ["es.object.lookup-getter"]),
  __lookupSetter__: define(null, ["es.object.lookup-setter"]),
  ["__proto__"]: define(null, ["es.object.proto"])
};
}, function(modId) { var map = {"../core-js-compat/data.js":1768876401661}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401665, function(require, module, exports) {


exports.__esModule = true;
exports.stable = exports.proposals = void 0;
// This file contains the list of paths supported by @babel/runtime-corejs3.
// It must _not_ be edited, as all new features should go through direct
// injection of core-js-pure imports.

const stable = exports.stable = new Set(["array", "array/from", "array/is-array", "array/of", "clear-immediate", "date/now", "instance/bind", "instance/code-point-at", "instance/concat", "instance/copy-within", "instance/ends-with", "instance/entries", "instance/every", "instance/fill", "instance/filter", "instance/find", "instance/find-index", "instance/flags", "instance/flat", "instance/flat-map", "instance/for-each", "instance/includes", "instance/index-of", "instance/keys", "instance/last-index-of", "instance/map", "instance/pad-end", "instance/pad-start", "instance/reduce", "instance/reduce-right", "instance/repeat", "instance/reverse", "instance/slice", "instance/some", "instance/sort", "instance/splice", "instance/starts-with", "instance/trim", "instance/trim-end", "instance/trim-left", "instance/trim-right", "instance/trim-start", "instance/values", "json/stringify", "map", "math/acosh", "math/asinh", "math/atanh", "math/cbrt", "math/clz32", "math/cosh", "math/expm1", "math/fround", "math/hypot", "math/imul", "math/log10", "math/log1p", "math/log2", "math/sign", "math/sinh", "math/tanh", "math/trunc", "number/epsilon", "number/is-finite", "number/is-integer", "number/is-nan", "number/is-safe-integer", "number/max-safe-integer", "number/min-safe-integer", "number/parse-float", "number/parse-int", "object/assign", "object/create", "object/define-properties", "object/define-property", "object/entries", "object/freeze", "object/from-entries", "object/get-own-property-descriptor", "object/get-own-property-descriptors", "object/get-own-property-names", "object/get-own-property-symbols", "object/get-prototype-of", "object/is", "object/is-extensible", "object/is-frozen", "object/is-sealed", "object/keys", "object/prevent-extensions", "object/seal", "object/set-prototype-of", "object/values", "parse-float", "parse-int", "promise", "queue-microtask", "reflect/apply", "reflect/construct", "reflect/define-property", "reflect/delete-property", "reflect/get", "reflect/get-own-property-descriptor", "reflect/get-prototype-of", "reflect/has", "reflect/is-extensible", "reflect/own-keys", "reflect/prevent-extensions", "reflect/set", "reflect/set-prototype-of", "set", "set-immediate", "set-interval", "set-timeout", "string/from-code-point", "string/raw", "symbol", "symbol/async-iterator", "symbol/for", "symbol/has-instance", "symbol/is-concat-spreadable", "symbol/iterator", "symbol/key-for", "symbol/match", "symbol/replace", "symbol/search", "symbol/species", "symbol/split", "symbol/to-primitive", "symbol/to-string-tag", "symbol/unscopables", "url", "url-search-params", "weak-map", "weak-set"]);
const proposals = exports.proposals = new Set([...stable, "aggregate-error", "composite-key", "composite-symbol", "global-this", "instance/at", "instance/code-points", "instance/match-all", "instance/replace-all", "math/clamp", "math/degrees", "math/deg-per-rad", "math/fscale", "math/iaddh", "math/imulh", "math/isubh", "math/rad-per-deg", "math/radians", "math/scale", "math/seeded-prng", "math/signbit", "math/umulh", "number/from-string", "observable", "reflect/define-metadata", "reflect/delete-metadata", "reflect/get-metadata", "reflect/get-metadata-keys", "reflect/get-own-metadata", "reflect/get-own-metadata-keys", "reflect/has-metadata", "reflect/has-own-metadata", "reflect/metadata", "symbol/dispose", "symbol/observable", "symbol/pattern-match"]);
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401666, function(require, module, exports) {


exports.__esModule = true;
exports.default = canSkipPolyfill;
var _babel = _interopRequireWildcard(require("@babel/core"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const {
  types: t
} = _babel.default || _babel;
function canSkipPolyfill(desc, path) {
  const {
    node,
    parent
  } = path;
  switch (desc.name) {
    case "es.string.split":
      {
        if (!t.isCallExpression(parent, {
          callee: node
        })) return false;
        if (parent.arguments.length < 1) return true;
        const splitter = parent.arguments[0];
        return t.isStringLiteral(splitter) || t.isTemplateLiteral(splitter);
      }
  }
}
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401667, function(require, module, exports) {


exports.__esModule = true;
exports.BABEL_RUNTIME = void 0;
exports.callMethod = callMethod;
exports.coreJSModule = coreJSModule;
exports.coreJSPureHelper = coreJSPureHelper;
exports.extractOptionalCheck = extractOptionalCheck;
exports.isCoreJSSource = isCoreJSSource;
exports.maybeMemoizeContext = maybeMemoizeContext;
var _babel = _interopRequireWildcard(require("@babel/core"));
var _entries = _interopRequireDefault(require("../core-js-compat/entries.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const {
  types: t
} = _babel.default || _babel;
const BABEL_RUNTIME = exports.BABEL_RUNTIME = "@babel/runtime-corejs3";
function callMethod(path, id, optionalCall, wrapCallee) {
  const [context1, context2] = maybeMemoizeContext(path.node, path.scope);
  let callee = t.callExpression(id, [context1]);
  if (wrapCallee) callee = wrapCallee(callee);
  const call = t.identifier("call");
  path.replaceWith(optionalCall ? t.optionalMemberExpression(callee, call, false, true) : t.memberExpression(callee, call));
  path.parentPath.unshiftContainer("arguments", context2);
}
function maybeMemoizeContext(node, scope) {
  const {
    object
  } = node;
  let context1, context2;
  if (t.isIdentifier(object)) {
    context2 = object;
    context1 = t.cloneNode(object);
  } else {
    context2 = scope.generateDeclaredUidIdentifier("context");
    context1 = t.assignmentExpression("=", t.cloneNode(context2), object);
  }
  return [context1, context2];
}
function extractOptionalCheck(scope, node) {
  let optionalNode = node;
  while (!optionalNode.optional && t.isOptionalMemberExpression(optionalNode.object)) {
    optionalNode = optionalNode.object;
  }
  optionalNode.optional = false;
  const ctx = scope.generateDeclaredUidIdentifier("context");
  const assign = t.assignmentExpression("=", ctx, optionalNode.object);
  optionalNode.object = t.cloneNode(ctx);
  return ifNotNullish => t.conditionalExpression(t.binaryExpression("==", assign, t.nullLiteral()), t.unaryExpression("void", t.numericLiteral(0)), ifNotNullish);
}
function isCoreJSSource(source) {
  if (typeof source === "string") {
    source = source.replace(/\\/g, "/").replace(/(\/(index)?)?(\.js)?$/i, "").toLowerCase();
  }
  return Object.prototype.hasOwnProperty.call(_entries.default, source) && _entries.default[source];
}
function coreJSModule(name) {
  return `core-js/modules/${name}.js`;
}
function coreJSPureHelper(name, useBabelRuntime, ext) {
  return useBabelRuntime ? `${BABEL_RUNTIME}/core-js/${name}${ext}` : `core-js-pure/features/${name}.js`;
}
}, function(modId) { var map = {"../core-js-compat/entries.js":1768876401668}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401668, function(require, module, exports) {
module.exports = require("core-js-compat/entries");

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768876401660);
})()
//miniprogram-npm-outsideDeps=["@babel/core","@babel/helper-define-polyfill-provider","core-js-compat/data","core-js-compat/get-modules-list-for-target-version","core-js-compat/entries"]
//# sourceMappingURL=index.js.map