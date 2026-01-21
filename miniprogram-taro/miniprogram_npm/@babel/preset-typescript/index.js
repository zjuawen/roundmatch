module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768876401395, function(require, module, exports) {


Object.defineProperty(exports, '__esModule', { value: true });

var helperPluginUtils = require('@babel/helper-plugin-utils');
var transformTypeScript = require('@babel/plugin-transform-typescript');
require('@babel/plugin-syntax-jsx');
var transformModulesCommonJS = require('@babel/plugin-transform-modules-commonjs');
var helperValidatorOption = require('@babel/helper-validator-option');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var transformTypeScript__default = /*#__PURE__*/_interopDefault(transformTypeScript);
var transformModulesCommonJS__default = /*#__PURE__*/_interopDefault(transformModulesCommonJS);

const v = new helperValidatorOption.OptionValidator("@babel/preset-typescript");
function normalizeOptions(options = {}) {
  let {
    allowNamespaces = true,
    jsxPragma,
    onlyRemoveTypeImports
  } = options;
  const TopLevelOptions = {
    ignoreExtensions: "ignoreExtensions",
    allowNamespaces: "allowNamespaces",
    disallowAmbiguousJSXLike: "disallowAmbiguousJSXLike",
    jsxPragma: "jsxPragma",
    jsxPragmaFrag: "jsxPragmaFrag",
    onlyRemoveTypeImports: "onlyRemoveTypeImports",
    optimizeConstEnums: "optimizeConstEnums",
    rewriteImportExtensions: "rewriteImportExtensions",
    allExtensions: "allExtensions",
    isTSX: "isTSX"
  };
  const jsxPragmaFrag = v.validateStringOption(TopLevelOptions.jsxPragmaFrag, options.jsxPragmaFrag, "React.Fragment");
  {
    var allExtensions = v.validateBooleanOption(TopLevelOptions.allExtensions, options.allExtensions, false);
    var isTSX = v.validateBooleanOption(TopLevelOptions.isTSX, options.isTSX, false);
    if (isTSX) {
      v.invariant(allExtensions, "isTSX:true requires allExtensions:true");
    }
  }
  const ignoreExtensions = v.validateBooleanOption(TopLevelOptions.ignoreExtensions, options.ignoreExtensions, false);
  const disallowAmbiguousJSXLike = v.validateBooleanOption(TopLevelOptions.disallowAmbiguousJSXLike, options.disallowAmbiguousJSXLike, false);
  if (disallowAmbiguousJSXLike) {
    {
      v.invariant(allExtensions, "disallowAmbiguousJSXLike:true requires allExtensions:true");
    }
  }
  const optimizeConstEnums = v.validateBooleanOption(TopLevelOptions.optimizeConstEnums, options.optimizeConstEnums, false);
  const rewriteImportExtensions = v.validateBooleanOption(TopLevelOptions.rewriteImportExtensions, options.rewriteImportExtensions, false);
  const normalized = {
    ignoreExtensions,
    allowNamespaces,
    disallowAmbiguousJSXLike,
    jsxPragma,
    jsxPragmaFrag,
    onlyRemoveTypeImports,
    optimizeConstEnums,
    rewriteImportExtensions
  };
  {
    normalized.allExtensions = allExtensions;
    normalized.isTSX = isTSX;
  }
  return normalized;
}

var pluginRewriteTSImports = helperPluginUtils.declare(function ({
  types: t,
  template
}) {
  function maybeReplace(source, path, state) {
    if (!source) return;
    if (t.isStringLiteral(source)) {
      if (/^\.\.?\//.test(source.value)) {
        source.value = source.value.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+)?)\.([cm]?)ts$/i, function (m, tsx, d, ext, cm) {
          return tsx ? ".js" : d && (!ext || !cm) ? m : d + ext + "." + cm.toLowerCase() + "js";
        });
      }
      return;
    }
    if (state.availableHelper("tsRewriteRelativeImportExtensions")) {
      path.replaceWith(t.callExpression(state.addHelper("tsRewriteRelativeImportExtensions"), [source]));
    } else {
      path.replaceWith(template.expression.ast`(${source} + "").replace(/([\\/].*\.[mc]?)tsx?$/, "$1js")`);
    }
  }
  return {
    name: "preset-typescript/plugin-rewrite-ts-imports",
    visitor: {
      "ImportDeclaration|ExportAllDeclaration|ExportNamedDeclaration"(path, state) {
        const node = path.node;
        const kind = t.isImportDeclaration(node) ? node.importKind : node.exportKind;
        if (kind === "value") {
          maybeReplace(node.source, path.get("source"), state);
        }
      },
      CallExpression(path, state) {
        if (t.isImport(path.node.callee)) {
          maybeReplace(path.node.arguments[0], path.get("arguments.0"), state);
        }
      },
      ImportExpression(path, state) {
        maybeReplace(path.node.source, path.get("source"), state);
      }
    }
  };
});

var index = helperPluginUtils.declarePreset((api, opts) => {
  api.assertVersion(7);
  const {
    allExtensions,
    ignoreExtensions,
    allowNamespaces,
    disallowAmbiguousJSXLike,
    isTSX,
    jsxPragma,
    jsxPragmaFrag,
    onlyRemoveTypeImports,
    optimizeConstEnums,
    rewriteImportExtensions
  } = normalizeOptions(opts);
  const pluginOptions = disallowAmbiguousJSXLike => ({
    allowDeclareFields: opts.allowDeclareFields,
    allowNamespaces,
    disallowAmbiguousJSXLike,
    jsxPragma,
    jsxPragmaFrag,
    onlyRemoveTypeImports,
    optimizeConstEnums
  });
  const getPlugins = (isTSX, disallowAmbiguousJSXLike) => {
    {
      return [[transformTypeScript__default.default, Object.assign({
        isTSX
      }, pluginOptions(disallowAmbiguousJSXLike))]];
    }
  };
  const disableExtensionDetect = allExtensions || ignoreExtensions;
  return {
    plugins: rewriteImportExtensions ? [pluginRewriteTSImports] : [],
    overrides: disableExtensionDetect ? [{
      plugins: getPlugins(isTSX, disallowAmbiguousJSXLike)
    }] : [{
      test: /\.ts$/,
      plugins: getPlugins(false, false)
    }, {
      test: /\.mts$/,
      sourceType: "module",
      plugins: getPlugins(false, true)
    }, {
      test: /\.cts$/,
      sourceType: "unambiguous",
      plugins: [[transformModulesCommonJS__default.default, {
        allowTopLevelThis: true
      }], [transformTypeScript__default.default, pluginOptions(true)]]
    }, {
      test: /\.tsx$/,
      plugins: getPlugins(true, false)
    }]
  };
});

exports.default = index;
//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768876401395);
})()
//miniprogram-npm-outsideDeps=["@babel/helper-plugin-utils","@babel/plugin-transform-typescript","@babel/plugin-syntax-jsx","@babel/plugin-transform-modules-commonjs","@babel/helper-validator-option"]
//# sourceMappingURL=index.js.map