module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768876401385, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.isPluginRequired = isPluginRequired;
exports.transformIncludesAndExcludes = void 0;
var _semver = require("semver");
var _debug = require("./debug.js");
var _filterItems = require("./filter-items.js");
var _moduleTransformations = require("./module-transformations.js");
var _normalizeOptions = require("./normalize-options.js");
var _shippedProposals = require("./shipped-proposals.js");
var _pluginsCompatData = require("./plugins-compat-data.js");
var _babelPluginPolyfillCorejs = require("babel-plugin-polyfill-corejs3");
var _babel7Plugins = require("./polyfills/babel-7-plugins.cjs");
var _helperCompilationTargets = require("@babel/helper-compilation-targets");
var _availablePlugins = require("./available-plugins.js");
var _helperPluginUtils = require("@babel/helper-plugin-utils");
const pluginCoreJS3 = _babelPluginPolyfillCorejs.default || _babelPluginPolyfillCorejs;
function isPluginRequired(targets, support) {
  return (0, _helperCompilationTargets.isRequired)("fake-name", targets, {
    compatData: {
      "fake-name": support
    }
  });
}
function filterStageFromList(list, stageList) {
  return Object.keys(list).reduce((result, item) => {
    if (!stageList.has(item)) {
      result[item] = list[item];
    }
    return result;
  }, {});
}
const pluginsListWithProposals = Object.assign({}, _pluginsCompatData.plugins, _pluginsCompatData.pluginsBugfixes);
const pluginsListWithoutProposals = filterStageFromList(pluginsListWithProposals, _shippedProposals.proposalPlugins);
var pluginsListNoBugfixesWithProposals = _pluginsCompatData.plugins;
var pluginsListNoBugfixesWithoutProposals = filterStageFromList(_pluginsCompatData.plugins, _shippedProposals.proposalPlugins);
const getPlugin = pluginName => {
  const plugin = _availablePlugins.default[pluginName]();
  if (!plugin) {
    throw new Error(`Could not find plugin "${pluginName}". Ensure there is an entry in ./available-plugins.js for it.`);
  }
  return plugin;
};
const transformIncludesAndExcludes = opts => {
  return opts.reduce((result, opt) => {
    const target = /^(?:es|es6|es7|esnext|web)\./.test(opt) ? "builtIns" : "plugins";
    result[target].add(opt);
    return result;
  }, {
    all: opts,
    plugins: new Set(),
    builtIns: new Set()
  });
};
exports.transformIncludesAndExcludes = transformIncludesAndExcludes;
function getSpecialModulesPluginNames(modules, shouldTransformDynamicImport, babelVersion) {
  const modulesPluginNames = [];
  if (modules) {
    modulesPluginNames.push(_moduleTransformations.default[modules]);
  }
  if (shouldTransformDynamicImport) {
    if (modules && modules !== "umd") {
      modulesPluginNames.push("transform-dynamic-import");
    } else {
      console.warn("Dynamic import can only be transformed when transforming ES" + " modules to AMD, CommonJS or SystemJS.");
    }
  }
  if (!babelVersion.startsWith("8")) {
    if (!shouldTransformDynamicImport) {
      modulesPluginNames.push("syntax-dynamic-import");
    }
    modulesPluginNames.push("syntax-top-level-await");
    modulesPluginNames.push("syntax-import-meta");
  }
  return modulesPluginNames;
}
const getCoreJSOptions = ({
  useBuiltIns,
  corejs,
  polyfillTargets,
  include,
  exclude,
  proposals,
  shippedProposals,
  debug
}) => ({
  method: `${useBuiltIns}-global`,
  version: corejs ? corejs.toString() : undefined,
  targets: polyfillTargets,
  include,
  exclude,
  proposals,
  shippedProposals,
  debug,
  "#__secret_key__@babel/preset-env__compatibility": {
    noRuntimeName: true
  }
});
var getPolyfillPlugins = ({
  useBuiltIns,
  corejs,
  polyfillTargets,
  include,
  exclude,
  proposals,
  shippedProposals,
  regenerator,
  debug
}) => {
  const polyfillPlugins = [];
  if (useBuiltIns === "usage" || useBuiltIns === "entry") {
    const pluginOptions = getCoreJSOptions({
      useBuiltIns,
      corejs,
      polyfillTargets,
      include,
      exclude,
      proposals,
      shippedProposals,
      debug
    });
    if (corejs) {
      if (useBuiltIns === "usage") {
        if (corejs.major === 2) {
          polyfillPlugins.push([_babel7Plugins.pluginCoreJS2, pluginOptions], [_babel7Plugins.legacyBabelPolyfillPlugin, {
            usage: true
          }]);
        } else {
          polyfillPlugins.push([pluginCoreJS3, pluginOptions], [_babel7Plugins.legacyBabelPolyfillPlugin, {
            usage: true,
            deprecated: true
          }]);
        }
        if (regenerator) {
          polyfillPlugins.push([_babel7Plugins.pluginRegenerator, {
            method: "usage-global",
            debug
          }]);
        }
      } else {
        if (corejs.major === 2) {
          polyfillPlugins.push([_babel7Plugins.legacyBabelPolyfillPlugin, {
            regenerator
          }], [_babel7Plugins.pluginCoreJS2, pluginOptions]);
        } else {
          polyfillPlugins.push([pluginCoreJS3, pluginOptions], [_babel7Plugins.legacyBabelPolyfillPlugin, {
            deprecated: true
          }]);
          if (!regenerator) {
            polyfillPlugins.push([_babel7Plugins.removeRegeneratorEntryPlugin, pluginOptions]);
          }
        }
      }
    }
  }
  return polyfillPlugins;
};
exports.getPolyfillPlugins = getPolyfillPlugins;
function getLocalTargets(optionsTargets, ignoreBrowserslistConfig, configPath, browserslistEnv, api) {
  if (optionsTargets != null && optionsTargets.esmodules && optionsTargets.browsers) {
    console.warn(`
@babel/preset-env: esmodules and browsers targets have been specified together.
\`browsers\` target, \`${optionsTargets.browsers.toString()}\` will be ignored.
`);
  }
  return (0, _helperCompilationTargets.default)(optionsTargets, {
    ignoreBrowserslistConfig,
    configPath,
    browserslistEnv,
    onBrowserslistConfigFound(config) {
      api.addExternalDependency(config);
    }
  });
}
function supportsStaticESM(caller) {
  return !!(caller != null && caller.supportsStaticESM);
}
function supportsDynamicImport(caller) {
  return !!(caller != null && caller.supportsDynamicImport);
}
function supportsExportNamespaceFrom(caller) {
  return !!(caller != null && caller.supportsExportNamespaceFrom);
}
var _default = exports.default = (0, _helperPluginUtils.declarePreset)((api, opts) => {
  api.assertVersion(7);
  const babelTargets = api.targets();
  const {
    configPath,
    debug,
    exclude: optionsExclude,
    forceAllTransforms,
    ignoreBrowserslistConfig,
    include: optionsInclude,
    modules: optionsModules,
    shippedProposals,
    targets: optionsTargets,
    useBuiltIns,
    corejs: {
      version: corejs,
      proposals
    },
    browserslistEnv
  } = (0, _normalizeOptions.default)(opts);
  var {
    loose,
    spec = false,
    bugfixes = false
  } = opts;
  let targets = babelTargets;
  if (_semver.lt(api.version, "7.13.0") || opts.targets || opts.configPath || opts.browserslistEnv || opts.ignoreBrowserslistConfig) {
    var hasUglifyTarget = false;
    if (optionsTargets != null && optionsTargets.uglify) {
      hasUglifyTarget = true;
      delete optionsTargets.uglify;
      console.warn(`
The uglify target has been deprecated. Set the top level
option \`forceAllTransforms: true\` instead.
`);
    }
    targets = getLocalTargets(optionsTargets, ignoreBrowserslistConfig, configPath, browserslistEnv, api);
  }
  const transformTargets = forceAllTransforms || hasUglifyTarget ? {} : targets;
  const include = transformIncludesAndExcludes(optionsInclude);
  const exclude = transformIncludesAndExcludes(optionsExclude);
  const compatData = bugfixes ? shippedProposals ? pluginsListWithProposals : pluginsListWithoutProposals : shippedProposals ? pluginsListNoBugfixesWithProposals : pluginsListNoBugfixesWithoutProposals;
  const modules = optionsModules === "auto" ? api.caller(supportsStaticESM) ? false : "commonjs" : optionsModules;
  const shouldTransformDynamicImport = optionsModules === "auto" ? !api.caller(supportsDynamicImport) : !!modules;
  if (!exclude.plugins.has("transform-export-namespace-from") && (optionsModules === "auto" ? !api.caller(supportsExportNamespaceFrom) : !!modules)) {
    include.plugins.add("transform-export-namespace-from");
  }
  const pluginNames = (0, _helperCompilationTargets.filterItems)(compatData, include.plugins, exclude.plugins, transformTargets, getSpecialModulesPluginNames(modules, shouldTransformDynamicImport, api.version), !loose ? undefined : ["transform-typeof-symbol"], _shippedProposals.pluginSyntaxMap);
  if (shippedProposals) {
    (0, _filterItems.addProposalSyntaxPlugins)(pluginNames, _shippedProposals.proposalSyntaxPlugins);
  }
  (0, _filterItems.removeUnsupportedItems)(pluginNames, api.version);
  (0, _filterItems.removeUnnecessaryItems)(pluginNames, _pluginsCompatData.overlappingPlugins);
  const polyfillPlugins = getPolyfillPlugins({
    useBuiltIns,
    corejs,
    polyfillTargets: targets,
    include: include.builtIns,
    exclude: exclude.builtIns,
    proposals,
    shippedProposals,
    regenerator: pluginNames.has("transform-regenerator"),
    debug
  });
  const pluginUseBuiltIns = useBuiltIns !== false;
  const plugins = Array.from(pluginNames).map(pluginName => {
    if (pluginName === "transform-class-properties" || pluginName === "transform-private-methods" || pluginName === "transform-private-property-in-object") {
      return [getPlugin(pluginName), {
        loose: loose ? "#__internal__@babel/preset-env__prefer-true-but-false-is-ok-if-it-prevents-an-error" : "#__internal__@babel/preset-env__prefer-false-but-true-is-ok-if-it-prevents-an-error"
      }];
    }
    if (pluginName === "syntax-import-attributes") {
      return [getPlugin(pluginName), {
        deprecatedAssertSyntax: true
      }];
    }
    return [getPlugin(pluginName), {
      spec,
      loose,
      useBuiltIns: pluginUseBuiltIns
    }];
  }).concat(polyfillPlugins);
  if (debug) {
    console.log("@babel/preset-env: `DEBUG` option");
    console.log("\nUsing targets:");
    console.log(JSON.stringify((0, _helperCompilationTargets.prettifyTargets)(targets), null, 2));
    console.log(`\nUsing modules transform: ${optionsModules.toString()}`);
    console.log("\nUsing plugins:");
    pluginNames.forEach(pluginName => {
      (0, _debug.logPlugin)(pluginName, targets, compatData);
    });
    if (!useBuiltIns) {
      console.log("\nUsing polyfills: No polyfills were added, since the `useBuiltIns` option was not set.");
    }
  }
  return {
    plugins
  };
});
exports.getModulesPluginNames = ({
  modules,
  transformations,
  shouldTransformESM,
  shouldTransformDynamicImport,
  shouldTransformExportNamespaceFrom
}) => {
  const modulesPluginNames = [];
  if (modules !== false && transformations[modules]) {
    if (shouldTransformESM) {
      modulesPluginNames.push(transformations[modules]);
    }
    if (shouldTransformDynamicImport) {
      if (shouldTransformESM && modules !== "umd") {
        modulesPluginNames.push("transform-dynamic-import");
      } else {
        console.warn("Dynamic import can only be transformed when transforming ES" + " modules to AMD, CommonJS or SystemJS.");
      }
    }
  }
  if (shouldTransformExportNamespaceFrom) {
    modulesPluginNames.push("transform-export-namespace-from");
  }
  if (!shouldTransformDynamicImport) {
    modulesPluginNames.push("syntax-dynamic-import");
  }
  if (!shouldTransformExportNamespaceFrom) {
    modulesPluginNames.push("syntax-export-namespace-from");
  }
  modulesPluginNames.push("syntax-top-level-await");
  modulesPluginNames.push("syntax-import-meta");
  return modulesPluginNames;
};

//# sourceMappingURL=index.js.map

}, function(modId) {var map = {"./debug.js":1768876401386,"./filter-items.js":1768876401387,"./module-transformations.js":1768876401389,"./normalize-options.js":1768876401390,"./shipped-proposals.js":1768876401393,"./plugins-compat-data.js":1768876401391,"./available-plugins.js":1768876401388}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401386, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logPlugin = void 0;
var _helperCompilationTargets = require("@babel/helper-compilation-targets");
const compatData = require("@babel/compat-data/plugins");
const logPlugin = (item, targetVersions, list) => {
  const filteredList = (0, _helperCompilationTargets.getInclusionReasons)(item, targetVersions, list);
  const support = list[item];
  if (item.startsWith("transform-")) {
    const proposalName = `proposal-${item.slice(10)}`;
    if (proposalName === "proposal-dynamic-import" || hasOwnProperty.call(compatData, proposalName)) {
      item = proposalName;
    }
  }
  if (!support) {
    console.log(`  ${item}`);
    return;
  }
  let formattedTargets = `{`;
  let first = true;
  for (const target of Object.keys(filteredList)) {
    if (!first) formattedTargets += `,`;
    first = false;
    formattedTargets += ` ${target}`;
    if (support[target]) formattedTargets += ` < ${support[target]}`;
  }
  formattedTargets += ` }`;
  console.log(`  ${item} ${formattedTargets}`);
};
exports.logPlugin = logPlugin;

//# sourceMappingURL=debug.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401387, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addProposalSyntaxPlugins = addProposalSyntaxPlugins;
exports.removeUnnecessaryItems = removeUnnecessaryItems;
exports.removeUnsupportedItems = removeUnsupportedItems;
var _semver = require("semver");
var _availablePlugins = require("./available-plugins.js");
function addProposalSyntaxPlugins(items, proposalSyntaxPlugins) {
  proposalSyntaxPlugins.forEach(plugin => {
    items.add(plugin);
  });
}
function removeUnnecessaryItems(items, overlapping) {
  items.forEach(item => {
    var _overlapping$item;
    (_overlapping$item = overlapping[item]) == null || _overlapping$item.forEach(name => items.delete(name));
  });
}
function removeUnsupportedItems(items, babelVersion) {
  items.forEach(item => {
    if (hasOwnProperty.call(_availablePlugins.minVersions, item) && _semver.lt(babelVersion, _availablePlugins.minVersions[item])) {
      items.delete(item);
    } else if (babelVersion.startsWith("8") && _availablePlugins.legacyBabel7SyntaxPlugins.has(item)) {
      items.delete(item);
    }
  });
}

//# sourceMappingURL=filter-items.js.map

}, function(modId) { var map = {"./available-plugins.js":1768876401388}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401388, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.minVersions = exports.legacyBabel7SyntaxPlugins = exports.default = void 0;
var _pluginSyntaxImportAssertions = require("@babel/plugin-syntax-import-assertions");
var _pluginSyntaxImportAttributes = require("@babel/plugin-syntax-import-attributes");
var _pluginTransformAsyncGeneratorFunctions = require("@babel/plugin-transform-async-generator-functions");
var _pluginTransformAsyncToGenerator = require("@babel/plugin-transform-async-to-generator");
var _pluginTransformArrowFunctions = require("@babel/plugin-transform-arrow-functions");
var _pluginTransformBlockScopedFunctions = require("@babel/plugin-transform-block-scoped-functions");
var _pluginTransformBlockScoping = require("@babel/plugin-transform-block-scoping");
var _pluginTransformClasses = require("@babel/plugin-transform-classes");
var _pluginTransformClassProperties = require("@babel/plugin-transform-class-properties");
var _pluginTransformClassStaticBlock = require("@babel/plugin-transform-class-static-block");
var _pluginTransformComputedProperties = require("@babel/plugin-transform-computed-properties");
var _pluginTransformDestructuring = require("@babel/plugin-transform-destructuring");
var _pluginTransformDotallRegex = require("@babel/plugin-transform-dotall-regex");
var _pluginTransformDuplicateKeys = require("@babel/plugin-transform-duplicate-keys");
var _pluginTransformDuplicateNamedCapturingGroupsRegex = require("@babel/plugin-transform-duplicate-named-capturing-groups-regex");
var _pluginTransformDynamicImport = require("@babel/plugin-transform-dynamic-import");
var _pluginTransformExplicitResourceManagement = require("@babel/plugin-transform-explicit-resource-management");
var _pluginTransformExponentiationOperator = require("@babel/plugin-transform-exponentiation-operator");
var _pluginTransformExportNamespaceFrom = require("@babel/plugin-transform-export-namespace-from");
var _pluginTransformForOf = require("@babel/plugin-transform-for-of");
var _pluginTransformFunctionName = require("@babel/plugin-transform-function-name");
var _pluginTransformJsonStrings = require("@babel/plugin-transform-json-strings");
var _pluginTransformLiterals = require("@babel/plugin-transform-literals");
var _pluginTransformLogicalAssignmentOperators = require("@babel/plugin-transform-logical-assignment-operators");
var _pluginTransformMemberExpressionLiterals = require("@babel/plugin-transform-member-expression-literals");
var _pluginTransformModulesAmd = require("@babel/plugin-transform-modules-amd");
var _pluginTransformModulesCommonjs = require("@babel/plugin-transform-modules-commonjs");
var _pluginTransformModulesSystemjs = require("@babel/plugin-transform-modules-systemjs");
var _pluginTransformModulesUmd = require("@babel/plugin-transform-modules-umd");
var _pluginTransformNamedCapturingGroupsRegex = require("@babel/plugin-transform-named-capturing-groups-regex");
var _pluginTransformNewTarget = require("@babel/plugin-transform-new-target");
var _pluginTransformNullishCoalescingOperator = require("@babel/plugin-transform-nullish-coalescing-operator");
var _pluginTransformNumericSeparator = require("@babel/plugin-transform-numeric-separator");
var _pluginTransformObjectRestSpread = require("@babel/plugin-transform-object-rest-spread");
var _pluginTransformObjectSuper = require("@babel/plugin-transform-object-super");
var _pluginTransformOptionalCatchBinding = require("@babel/plugin-transform-optional-catch-binding");
var _pluginTransformOptionalChaining = require("@babel/plugin-transform-optional-chaining");
var _pluginTransformParameters = require("@babel/plugin-transform-parameters");
var _pluginTransformPrivateMethods = require("@babel/plugin-transform-private-methods");
var _pluginTransformPrivatePropertyInObject = require("@babel/plugin-transform-private-property-in-object");
var _pluginTransformPropertyLiterals = require("@babel/plugin-transform-property-literals");
var _pluginTransformRegenerator = require("@babel/plugin-transform-regenerator");
var _pluginTransformRegexpModifiers = require("@babel/plugin-transform-regexp-modifiers");
var _pluginTransformReservedWords = require("@babel/plugin-transform-reserved-words");
var _pluginTransformShorthandProperties = require("@babel/plugin-transform-shorthand-properties");
var _pluginTransformSpread = require("@babel/plugin-transform-spread");
var _pluginTransformStickyRegex = require("@babel/plugin-transform-sticky-regex");
var _pluginTransformTemplateLiterals = require("@babel/plugin-transform-template-literals");
var _pluginTransformTypeofSymbol = require("@babel/plugin-transform-typeof-symbol");
var _pluginTransformUnicodeEscapes = require("@babel/plugin-transform-unicode-escapes");
var _pluginTransformUnicodePropertyRegex = require("@babel/plugin-transform-unicode-property-regex");
var _pluginTransformUnicodeRegex = require("@babel/plugin-transform-unicode-regex");
var _pluginTransformUnicodeSetsRegex = require("@babel/plugin-transform-unicode-sets-regex");
var _index = require("@babel/preset-modules/lib/plugins/transform-async-arrows-in-class/index.js");
var _index2 = require("@babel/preset-modules/lib/plugins/transform-edge-default-parameters/index.js");
var _index3 = require("@babel/preset-modules/lib/plugins/transform-edge-function-name/index.js");
var _pluginBugfixFirefoxClassInComputedClassKey = require("@babel/plugin-bugfix-firefox-class-in-computed-class-key");
var _index4 = require("@babel/preset-modules/lib/plugins/transform-tagged-template-caching/index.js");
var _index5 = require("@babel/preset-modules/lib/plugins/transform-safari-block-shadowing/index.js");
var _index6 = require("@babel/preset-modules/lib/plugins/transform-safari-for-shadowing/index.js");
var _pluginBugfixSafariIdDestructuringCollisionInFunctionExpression = require("@babel/plugin-bugfix-safari-id-destructuring-collision-in-function-expression");
var _pluginBugfixSafariClassFieldInitializerScope = require("@babel/plugin-bugfix-safari-class-field-initializer-scope");
var _pluginBugfixV8SpreadParametersInOptionalChaining = require("@babel/plugin-bugfix-v8-spread-parameters-in-optional-chaining");
var _pluginBugfixV8StaticClassFieldsRedefineReadonly = require("@babel/plugin-bugfix-v8-static-class-fields-redefine-readonly");
const availablePlugins = exports.default = {
  "bugfix/transform-async-arrows-in-class": () => _index,
  "bugfix/transform-edge-default-parameters": () => _index2,
  "bugfix/transform-edge-function-name": () => _index3,
  "bugfix/transform-firefox-class-in-computed-class-key": () => _pluginBugfixFirefoxClassInComputedClassKey.default,
  "bugfix/transform-safari-block-shadowing": () => _index5,
  "bugfix/transform-safari-class-field-initializer-scope": () => _pluginBugfixSafariClassFieldInitializerScope.default,
  "bugfix/transform-safari-for-shadowing": () => _index6,
  "bugfix/transform-safari-id-destructuring-collision-in-function-expression": () => _pluginBugfixSafariIdDestructuringCollisionInFunctionExpression.default,
  "bugfix/transform-tagged-template-caching": () => _index4,
  "bugfix/transform-v8-spread-parameters-in-optional-chaining": () => _pluginBugfixV8SpreadParametersInOptionalChaining.default,
  "bugfix/transform-v8-static-class-fields-redefine-readonly": () => _pluginBugfixV8StaticClassFieldsRedefineReadonly.default,
  "transform-arrow-functions": () => _pluginTransformArrowFunctions.default,
  "transform-async-generator-functions": () => _pluginTransformAsyncGeneratorFunctions.default,
  "transform-async-to-generator": () => _pluginTransformAsyncToGenerator.default,
  "transform-block-scoped-functions": () => _pluginTransformBlockScopedFunctions.default,
  "transform-block-scoping": () => _pluginTransformBlockScoping.default,
  "transform-class-properties": () => _pluginTransformClassProperties.default,
  "transform-class-static-block": () => _pluginTransformClassStaticBlock.default,
  "transform-classes": () => _pluginTransformClasses.default,
  "transform-computed-properties": () => _pluginTransformComputedProperties.default,
  "transform-destructuring": () => _pluginTransformDestructuring.default,
  "transform-dotall-regex": () => _pluginTransformDotallRegex.default,
  "transform-duplicate-keys": () => _pluginTransformDuplicateKeys.default,
  "transform-duplicate-named-capturing-groups-regex": () => _pluginTransformDuplicateNamedCapturingGroupsRegex.default,
  "transform-dynamic-import": () => _pluginTransformDynamicImport.default,
  "transform-explicit-resource-management": () => _pluginTransformExplicitResourceManagement.default,
  "transform-exponentiation-operator": () => _pluginTransformExponentiationOperator.default,
  "transform-export-namespace-from": () => _pluginTransformExportNamespaceFrom.default,
  "transform-for-of": () => _pluginTransformForOf.default,
  "transform-function-name": () => _pluginTransformFunctionName.default,
  "transform-json-strings": () => _pluginTransformJsonStrings.default,
  "transform-literals": () => _pluginTransformLiterals.default,
  "transform-logical-assignment-operators": () => _pluginTransformLogicalAssignmentOperators.default,
  "transform-member-expression-literals": () => _pluginTransformMemberExpressionLiterals.default,
  "transform-modules-amd": () => _pluginTransformModulesAmd.default,
  "transform-modules-commonjs": () => _pluginTransformModulesCommonjs.default,
  "transform-modules-systemjs": () => _pluginTransformModulesSystemjs.default,
  "transform-modules-umd": () => _pluginTransformModulesUmd.default,
  "transform-named-capturing-groups-regex": () => _pluginTransformNamedCapturingGroupsRegex.default,
  "transform-new-target": () => _pluginTransformNewTarget.default,
  "transform-nullish-coalescing-operator": () => _pluginTransformNullishCoalescingOperator.default,
  "transform-numeric-separator": () => _pluginTransformNumericSeparator.default,
  "transform-object-rest-spread": () => _pluginTransformObjectRestSpread.default,
  "transform-object-super": () => _pluginTransformObjectSuper.default,
  "transform-optional-catch-binding": () => _pluginTransformOptionalCatchBinding.default,
  "transform-optional-chaining": () => _pluginTransformOptionalChaining.default,
  "transform-parameters": () => _pluginTransformParameters.default,
  "transform-private-methods": () => _pluginTransformPrivateMethods.default,
  "transform-private-property-in-object": () => _pluginTransformPrivatePropertyInObject.default,
  "transform-property-literals": () => _pluginTransformPropertyLiterals.default,
  "transform-regenerator": () => _pluginTransformRegenerator.default,
  "transform-regexp-modifiers": () => _pluginTransformRegexpModifiers.default,
  "transform-reserved-words": () => _pluginTransformReservedWords.default,
  "transform-shorthand-properties": () => _pluginTransformShorthandProperties.default,
  "transform-spread": () => _pluginTransformSpread.default,
  "transform-sticky-regex": () => _pluginTransformStickyRegex.default,
  "transform-template-literals": () => _pluginTransformTemplateLiterals.default,
  "transform-typeof-symbol": () => _pluginTransformTypeofSymbol.default,
  "transform-unicode-escapes": () => _pluginTransformUnicodeEscapes.default,
  "transform-unicode-property-regex": () => _pluginTransformUnicodePropertyRegex.default,
  "transform-unicode-regex": () => _pluginTransformUnicodeRegex.default,
  "transform-unicode-sets-regex": () => _pluginTransformUnicodeSetsRegex.default
};
const minVersions = exports.minVersions = {};
let legacyBabel7SyntaxPlugins = exports.legacyBabel7SyntaxPlugins = void 0;
Object.assign(minVersions, {
  "bugfix/transform-safari-id-destructuring-collision-in-function-expression": "7.16.0",
  "bugfix/transform-v8-static-class-fields-redefine-readonly": "7.12.0",
  "syntax-import-attributes": "7.22.0",
  "transform-class-static-block": "7.12.0",
  "transform-duplicate-named-capturing-groups-regex": "7.19.0",
  "transform-explicit-resource-management": "7.23.9",
  "transform-private-property-in-object": "7.10.0",
  "transform-regexp-modifiers": "7.19.0"
});
const syntax = name => () => () => ({
  manipulateOptions: (_, p) => p.plugins.push(name)
});
const legacyBabel7SyntaxPluginsLoaders = {
  "syntax-async-generators": syntax("asyncGenerators"),
  "syntax-class-properties": syntax("classProperties"),
  "syntax-class-static-block": syntax("classStaticBlock"),
  "syntax-dynamic-import": syntax("dynamicImport"),
  "syntax-explicit-resource-management": syntax("explicitResourceManagement"),
  "syntax-export-namespace-from": syntax("exportNamespaceFrom"),
  "syntax-import-meta": syntax("importMeta"),
  "syntax-json-strings": syntax("jsonStrings"),
  "syntax-logical-assignment-operators": syntax("logicalAssignment"),
  "syntax-nullish-coalescing-operator": syntax("nullishCoalescingOperator"),
  "syntax-numeric-separator": syntax("numericSeparator"),
  "syntax-object-rest-spread": syntax("objectRestSpread"),
  "syntax-optional-catch-binding": syntax("optionalCatchBinding"),
  "syntax-optional-chaining": syntax("optionalChaining"),
  "syntax-private-property-in-object": syntax("privateIn"),
  "syntax-top-level-await": syntax("topLevelAwait"),
  "syntax-import-assertions": () => _pluginSyntaxImportAssertions.default,
  "syntax-import-attributes": () => _pluginSyntaxImportAttributes.default,
  "syntax-unicode-sets-regex": () => require("@babel/plugin-syntax-unicode-sets-regex")
};
Object.assign(availablePlugins, legacyBabel7SyntaxPluginsLoaders);
exports.legacyBabel7SyntaxPlugins = legacyBabel7SyntaxPlugins = new Set(Object.keys(legacyBabel7SyntaxPluginsLoaders));

//# sourceMappingURL=available-plugins.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401389, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = exports.default = {
  amd: "transform-modules-amd",
  commonjs: "transform-modules-commonjs",
  cjs: "transform-modules-commonjs",
  systemjs: "transform-modules-systemjs",
  umd: "transform-modules-umd"
};

//# sourceMappingURL=module-transformations.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401390, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkDuplicateIncludeExcludes = void 0;
exports.default = normalizeOptions;
exports.normalizeCoreJSOption = normalizeCoreJSOption;
exports.validateUseBuiltInsOption = exports.validateModulesOption = exports.normalizePluginName = void 0;
var _semver = require("semver");
var _pluginsCompatData = require("./plugins-compat-data.js");
var _moduleTransformations = require("./module-transformations.js");
var _options = require("./options.js");
var _helperValidatorOption = require("@babel/helper-validator-option");
var _babel7Plugins = require("./polyfills/babel-7-plugins.cjs");
const corejs3Polyfills = require("core-js-compat/data.json");
const v = new _helperValidatorOption.OptionValidator("@babel/preset-env");
const allPluginsList = Object.keys(_pluginsCompatData.plugins);
const modulePlugins = ["transform-dynamic-import", ...Object.keys(_moduleTransformations.default).map(m => _moduleTransformations.default[m])];
const getValidIncludesAndExcludes = (type, corejs) => {
  const set = new Set(allPluginsList);
  if (type === "exclude") modulePlugins.map(set.add, set);
  if (corejs) {
    if (corejs === 2) {
      Object.keys(_babel7Plugins.corejs2Polyfills).map(set.add, set);
      set.add("web.timers").add("web.immediate").add("web.dom.iterable");
    } else {
      Object.keys(corejs3Polyfills).map(set.add, set);
    }
  }
  return Array.from(set);
};
function flatMap(array, fn) {
  return Array.prototype.concat.apply([], array.map(fn));
}
const normalizePluginName = plugin => plugin.replace(/^(?:@babel\/|babel-)(?:plugin-)?/, "");
exports.normalizePluginName = normalizePluginName;
const expandIncludesAndExcludes = (filterList = [], type, corejs) => {
  if (filterList.length === 0) return [];
  const filterableItems = getValidIncludesAndExcludes(type, corejs);
  const invalidFilters = [];
  const selectedPlugins = flatMap(filterList, filter => {
    let re;
    if (typeof filter === "string") {
      try {
        re = new RegExp(`^${normalizePluginName(filter)}$`);
      } catch (_) {
        invalidFilters.push(filter);
        return [];
      }
    } else {
      re = filter;
    }
    const items = filterableItems.filter(item => {
      return re.test(item) || re.test(item.replace(/^transform-/, "proposal-"));
    });
    if (items.length === 0) invalidFilters.push(filter);
    return items;
  });
  v.invariant(invalidFilters.length === 0, `The plugins/built-ins '${invalidFilters.join(", ")}' passed to the '${type}' option are not
    valid. Please check data/[plugin-features|built-in-features].js in babel-preset-env`);
  return selectedPlugins;
};
const checkDuplicateIncludeExcludes = (include = [], exclude = []) => {
  const duplicates = include.filter(opt => exclude.includes(opt));
  v.invariant(duplicates.length === 0, `The plugins/built-ins '${duplicates.join(", ")}' were found in both the "include" and
    "exclude" options.`);
};
exports.checkDuplicateIncludeExcludes = checkDuplicateIncludeExcludes;
const normalizeTargets = targets => {
  if (typeof targets === "string" || Array.isArray(targets)) {
    return {
      browsers: targets
    };
  }
  return Object.assign({}, targets);
};
const validateModulesOption = (modulesOpt = _options.ModulesOption.auto) => {
  v.invariant(_options.ModulesOption[modulesOpt.toString()] || modulesOpt === _options.ModulesOption.false, `The 'modules' option must be one of \n` + ` - 'false' to indicate no module processing\n` + ` - a specific module type: 'commonjs', 'amd', 'umd', 'systemjs'` + ` - 'auto' (default) which will automatically select 'false' if the current\n` + `   process is known to support ES module syntax, or "commonjs" otherwise\n`);
  return modulesOpt;
};
exports.validateModulesOption = validateModulesOption;
const validateUseBuiltInsOption = (builtInsOpt = false) => {
  v.invariant(_options.UseBuiltInsOption[builtInsOpt.toString()] || builtInsOpt === _options.UseBuiltInsOption.false, `The 'useBuiltIns' option must be either
    'false' (default) to indicate no polyfill,
    '"entry"' to indicate replacing the entry polyfill, or
    '"usage"' to import only used polyfills per file`);
  return builtInsOpt;
};
exports.validateUseBuiltInsOption = validateUseBuiltInsOption;
function normalizeCoreJSOption(corejs, useBuiltIns) {
  let proposals = false;
  let rawVersion;
  if (useBuiltIns && corejs === undefined) {
    rawVersion = 2;
    console.warn("\nWARNING (@babel/preset-env): We noticed you're using the `useBuiltIns` option without declaring a " + `core-js version. Currently, we assume version 2.x when no version ` + "is passed. Since this default version will likely change in future " + "versions of Babel, we recommend explicitly setting the core-js version " + "you are using via the `corejs` option.\n" + "\nYou should also be sure that the version you pass to the `corejs` " + "option matches the version specified in your `package.json`'s " + "`dependencies` section. If it doesn't, you need to run one of the " + "following commands:\n\n" + "  npm install --save core-js@2    npm install --save core-js@3\n" + "  yarn add core-js@2              yarn add core-js@3\n\n" + "More info about useBuiltIns: https://babeljs.io/docs/en/babel-preset-env#usebuiltins\n" + "More info about core-js: https://babeljs.io/docs/en/babel-preset-env#corejs");
  } else if (typeof corejs === "object" && corejs !== null) {
    rawVersion = corejs.version;
    proposals = Boolean(corejs.proposals);
  } else {
    rawVersion = corejs;
  }
  const version = rawVersion ? _semver.coerce(String(rawVersion)) : false;
  if (version) {
    if (useBuiltIns) {
      if (version.major < 2 || version.major > 3) {
        throw new RangeError("Invalid Option: The version passed to `corejs` is invalid. Currently, " + "only core-js@2 and core-js@3 are supported.");
      }
    } else {
      console.warn("\nWARNING (@babel/preset-env): The `corejs` option only has an effect when the `useBuiltIns` option is not `false`\n");
    }
  }
  return {
    version,
    proposals
  };
}
function normalizeOptions(opts) {
  v.validateTopLevelOptions(opts, _options.TopLevelOptions);
  const useBuiltIns = validateUseBuiltInsOption(opts.useBuiltIns);
  const corejs = normalizeCoreJSOption(opts.corejs, useBuiltIns);
  const include = expandIncludesAndExcludes(opts.include, _options.TopLevelOptions.include, !!corejs.version && corejs.version.major);
  const exclude = expandIncludesAndExcludes(opts.exclude, _options.TopLevelOptions.exclude, !!corejs.version && corejs.version.major);
  checkDuplicateIncludeExcludes(include, exclude);
  v.validateBooleanOption("loose", opts.loose);
  v.validateBooleanOption("spec", opts.spec);
  v.validateBooleanOption("bugfixes", opts.bugfixes);
  return {
    configPath: v.validateStringOption(_options.TopLevelOptions.configPath, opts.configPath, process.cwd()),
    corejs,
    debug: v.validateBooleanOption(_options.TopLevelOptions.debug, opts.debug, false),
    include,
    exclude,
    forceAllTransforms: v.validateBooleanOption(_options.TopLevelOptions.forceAllTransforms, opts.forceAllTransforms, false),
    ignoreBrowserslistConfig: v.validateBooleanOption(_options.TopLevelOptions.ignoreBrowserslistConfig, opts.ignoreBrowserslistConfig, false),
    modules: validateModulesOption(opts.modules),
    shippedProposals: v.validateBooleanOption(_options.TopLevelOptions.shippedProposals, opts.shippedProposals, false),
    targets: normalizeTargets(opts.targets),
    useBuiltIns: useBuiltIns,
    browserslistEnv: v.validateStringOption(_options.TopLevelOptions.browserslistEnv, opts.browserslistEnv)
  };
}

//# sourceMappingURL=normalize-options.js.map

}, function(modId) { var map = {"./plugins-compat-data.js":1768876401391,"./module-transformations.js":1768876401389,"./options.js":1768876401392}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401391, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pluginsBugfixes = exports.plugins = exports.overlappingPlugins = void 0;
var _availablePlugins = require("./available-plugins.js");
const originalPlugins = require("@babel/compat-data/plugins"),
  originalPluginsBugfixes = require("@babel/compat-data/plugin-bugfixes"),
  originalOverlappingPlugins = require("@babel/compat-data/overlapping-plugins");
const keys = Object.keys;
const plugins = exports.plugins = filterAvailable(originalPlugins);
const pluginsBugfixes = exports.pluginsBugfixes = filterAvailable(originalPluginsBugfixes);
const overlappingPlugins = exports.overlappingPlugins = filterAvailable(originalOverlappingPlugins);
overlappingPlugins["syntax-import-attributes"] = ["syntax-import-assertions"];
function filterAvailable(data) {
  const result = {};
  for (const plugin of keys(data)) {
    if (hasOwnProperty.call(_availablePlugins.default, plugin)) {
      result[plugin] = data[plugin];
    }
  }
  return result;
}

//# sourceMappingURL=plugins-compat-data.js.map

}, function(modId) { var map = {"./available-plugins.js":1768876401388}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401392, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UseBuiltInsOption = exports.TopLevelOptions = exports.ModulesOption = void 0;
const TopLevelOptions = exports.TopLevelOptions = {
  configPath: "configPath",
  corejs: "corejs",
  debug: "debug",
  exclude: "exclude",
  forceAllTransforms: "forceAllTransforms",
  ignoreBrowserslistConfig: "ignoreBrowserslistConfig",
  include: "include",
  modules: "modules",
  shippedProposals: "shippedProposals",
  targets: "targets",
  useBuiltIns: "useBuiltIns",
  browserslistEnv: "browserslistEnv"
};
Object.assign(TopLevelOptions, {
  bugfixes: "bugfixes",
  loose: "loose",
  spec: "spec"
});
const ModulesOption = exports.ModulesOption = {
  false: false,
  auto: "auto",
  amd: "amd",
  commonjs: "commonjs",
  cjs: "cjs",
  systemjs: "systemjs",
  umd: "umd"
};
const UseBuiltInsOption = exports.UseBuiltInsOption = {
  false: false,
  entry: "entry",
  usage: "usage"
};

//# sourceMappingURL=options.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401393, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.proposalSyntaxPlugins = exports.proposalPlugins = exports.pluginSyntaxMap = void 0;
const proposalPlugins = exports.proposalPlugins = new Set([]);
const proposalSyntaxPlugins = exports.proposalSyntaxPlugins = ["syntax-import-assertions", "syntax-import-attributes"];
const pluginSyntaxObject = {
  "transform-async-generator-functions": "syntax-async-generators",
  "transform-class-properties": "syntax-class-properties",
  "transform-class-static-block": "syntax-class-static-block",
  "transform-export-namespace-from": "syntax-export-namespace-from",
  "transform-json-strings": "syntax-json-strings",
  "transform-nullish-coalescing-operator": "syntax-nullish-coalescing-operator",
  "transform-numeric-separator": "syntax-numeric-separator",
  "transform-object-rest-spread": "syntax-object-rest-spread",
  "transform-optional-catch-binding": "syntax-optional-catch-binding",
  "transform-optional-chaining": "syntax-optional-chaining",
  "transform-private-methods": "syntax-class-properties",
  "transform-private-property-in-object": "syntax-private-property-in-object",
  "transform-unicode-property-regex": null
};
const pluginSyntaxEntries = Object.keys(pluginSyntaxObject).map(function (key) {
  return [key, pluginSyntaxObject[key]];
});
const pluginSyntaxMap = exports.pluginSyntaxMap = new Map(pluginSyntaxEntries);

//# sourceMappingURL=shipped-proposals.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768876401385);
})()
//miniprogram-npm-outsideDeps=["semver","babel-plugin-polyfill-corejs3","./polyfills/babel-7-plugins.cjs","@babel/helper-compilation-targets","@babel/helper-plugin-utils","@babel/compat-data/plugins","@babel/plugin-syntax-import-assertions","@babel/plugin-syntax-import-attributes","@babel/plugin-transform-async-generator-functions","@babel/plugin-transform-async-to-generator","@babel/plugin-transform-arrow-functions","@babel/plugin-transform-block-scoped-functions","@babel/plugin-transform-block-scoping","@babel/plugin-transform-classes","@babel/plugin-transform-class-properties","@babel/plugin-transform-class-static-block","@babel/plugin-transform-computed-properties","@babel/plugin-transform-destructuring","@babel/plugin-transform-dotall-regex","@babel/plugin-transform-duplicate-keys","@babel/plugin-transform-duplicate-named-capturing-groups-regex","@babel/plugin-transform-dynamic-import","@babel/plugin-transform-explicit-resource-management","@babel/plugin-transform-exponentiation-operator","@babel/plugin-transform-export-namespace-from","@babel/plugin-transform-for-of","@babel/plugin-transform-function-name","@babel/plugin-transform-json-strings","@babel/plugin-transform-literals","@babel/plugin-transform-logical-assignment-operators","@babel/plugin-transform-member-expression-literals","@babel/plugin-transform-modules-amd","@babel/plugin-transform-modules-commonjs","@babel/plugin-transform-modules-systemjs","@babel/plugin-transform-modules-umd","@babel/plugin-transform-named-capturing-groups-regex","@babel/plugin-transform-new-target","@babel/plugin-transform-nullish-coalescing-operator","@babel/plugin-transform-numeric-separator","@babel/plugin-transform-object-rest-spread","@babel/plugin-transform-object-super","@babel/plugin-transform-optional-catch-binding","@babel/plugin-transform-optional-chaining","@babel/plugin-transform-parameters","@babel/plugin-transform-private-methods","@babel/plugin-transform-private-property-in-object","@babel/plugin-transform-property-literals","@babel/plugin-transform-regenerator","@babel/plugin-transform-regexp-modifiers","@babel/plugin-transform-reserved-words","@babel/plugin-transform-shorthand-properties","@babel/plugin-transform-spread","@babel/plugin-transform-sticky-regex","@babel/plugin-transform-template-literals","@babel/plugin-transform-typeof-symbol","@babel/plugin-transform-unicode-escapes","@babel/plugin-transform-unicode-property-regex","@babel/plugin-transform-unicode-regex","@babel/plugin-transform-unicode-sets-regex","@babel/preset-modules/lib/plugins/transform-async-arrows-in-class/index.js","@babel/preset-modules/lib/plugins/transform-edge-default-parameters/index.js","@babel/preset-modules/lib/plugins/transform-edge-function-name/index.js","@babel/plugin-bugfix-firefox-class-in-computed-class-key","@babel/preset-modules/lib/plugins/transform-tagged-template-caching/index.js","@babel/preset-modules/lib/plugins/transform-safari-block-shadowing/index.js","@babel/preset-modules/lib/plugins/transform-safari-for-shadowing/index.js","@babel/plugin-bugfix-safari-id-destructuring-collision-in-function-expression","@babel/plugin-bugfix-safari-class-field-initializer-scope","@babel/plugin-bugfix-v8-spread-parameters-in-optional-chaining","@babel/plugin-bugfix-v8-static-class-fields-redefine-readonly","@babel/plugin-syntax-unicode-sets-regex","@babel/helper-validator-option","core-js-compat/data.json","@babel/compat-data/plugin-bugfixes","@babel/compat-data/overlapping-plugins"]
//# sourceMappingURL=index.js.map