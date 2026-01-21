module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768876401291, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _traverse = require("@babel/traverse");
var _helperPluginUtils = require("@babel/helper-plugin-utils");
var _default = exports.default = (0, _helperPluginUtils.declare)(({
  types: t,
  assertVersion
}) => {
  assertVersion(7);
  const containsClassExpressionVisitor = {
    ClassExpression(path, state) {
      state.found = true;
      path.stop();
    },
    Function(path) {
      path.skip();
    }
  };
  const containsYieldOrAwaitVisitor = _traverse.visitors.environmentVisitor({
    YieldExpression(path, state) {
      state.yield = true;
      if (state.await) path.stop();
    },
    AwaitExpression(path, state) {
      state.await = true;
      if (state.yield) path.stop();
    }
  });
  function containsClassExpression(path) {
    if (t.isClassExpression(path.node)) return true;
    if (t.isFunction(path.node)) return false;
    const state = {
      found: false
    };
    {
      path.traverse(containsClassExpressionVisitor, state);
    }
    return state.found;
  }
  function wrap(path) {
    const context = {
      yield: t.isYieldExpression(path.node),
      await: t.isAwaitExpression(path.node)
    };
    {
      path.traverse(containsYieldOrAwaitVisitor, context);
    }
    let replacement;
    if (context.yield) {
      const fn = t.functionExpression(null, [], t.blockStatement([t.returnStatement(path.node)]), true, context.await);
      replacement = t.yieldExpression(t.callExpression(t.memberExpression(fn, t.identifier("call")), [t.thisExpression(), t.identifier("arguments")]), true);
    } else {
      const fn = t.arrowFunctionExpression([], path.node, context.await);
      replacement = t.callExpression(fn, []);
      if (context.await) replacement = t.awaitExpression(replacement);
    }
    path.replaceWith(replacement);
  }
  return {
    name: "bugfix-firefox-class-in-computed-class-key",
    visitor: {
      Class(path) {
        const hasPrivateElement = path.node.body.body.some(node => t.isPrivate(node));
        if (!hasPrivateElement) return;
        for (const elem of path.get("body.body")) {
          if ("computed" in elem.node && elem.node.computed && containsClassExpression(elem.get("key"))) {
            wrap(elem.get("key"));
          }
        }
      }
    }
  };
});

//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768876401291);
})()
//miniprogram-npm-outsideDeps=["@babel/traverse","@babel/helper-plugin-utils"]
//# sourceMappingURL=index.js.map