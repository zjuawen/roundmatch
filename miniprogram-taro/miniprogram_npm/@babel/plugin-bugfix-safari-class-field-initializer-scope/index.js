module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768876401292, function(require, module, exports) {


Object.defineProperty(exports, '__esModule', { value: true });

var helperPluginUtils = require('@babel/helper-plugin-utils');
var core = require('@babel/core');

function needsWrapping(node) {
  if (core.types.isLiteral(node) && !core.types.isTemplateLiteral(node)) {
    return false;
  }
  if (core.types.isCallExpression(node) || core.types.isOptionalCallExpression(node) || core.types.isNewExpression(node)) {
    return needsWrapping(node.callee) || node.arguments.some(needsWrapping);
  }
  if (core.types.isTemplateLiteral(node)) {
    return node.expressions.some(needsWrapping);
  }
  if (core.types.isTaggedTemplateExpression(node)) {
    return needsWrapping(node.tag) || needsWrapping(node.quasi);
  }
  if (core.types.isArrayExpression(node)) {
    return node.elements.some(needsWrapping);
  }
  if (core.types.isObjectExpression(node)) {
    return node.properties.some(prop => {
      if (core.types.isObjectProperty(prop)) {
        return needsWrapping(prop.value) || prop.computed && needsWrapping(prop.key);
      }
      if (core.types.isObjectMethod(prop)) {
        return false;
      }
      return false;
    });
  }
  if (core.types.isMemberExpression(node) || core.types.isOptionalMemberExpression(node)) {
    return needsWrapping(node.object) || node.computed && needsWrapping(node.property);
  }
  if (core.types.isFunctionExpression(node) || core.types.isArrowFunctionExpression(node) || core.types.isClassExpression(node)) {
    return false;
  }
  if (core.types.isThisExpression(node)) {
    return false;
  }
  if (core.types.isSequenceExpression(node)) {
    return node.expressions.some(needsWrapping);
  }
  return true;
}
function wrapInitializer(path) {
  const {
    value
  } = path.node;
  if (value && needsWrapping(value)) {
    path.node.value = core.types.callExpression(core.types.arrowFunctionExpression([], value), []);
  }
}
var index = helperPluginUtils.declare(api => {
  api.assertVersion("^7.16.0");
  return {
    name: "plugin-bugfix-safari-class-field-initializer-scope",
    visitor: {
      ClassProperty(path) {
        wrapInitializer(path);
      },
      ClassPrivateProperty(path) {
        wrapInitializer(path);
      }
    }
  };
});

exports.default = index;
//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768876401292);
})()
//miniprogram-npm-outsideDeps=["@babel/helper-plugin-utils","@babel/core"]
//# sourceMappingURL=index.js.map