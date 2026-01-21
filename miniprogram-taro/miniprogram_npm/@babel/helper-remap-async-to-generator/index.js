module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768876401277, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
var _helperWrapFunction = require("@babel/helper-wrap-function");
var _helperAnnotateAsPure = require("@babel/helper-annotate-as-pure");
var _core = require("@babel/core");
var _traverse = require("@babel/traverse");
const {
  callExpression,
  cloneNode,
  isIdentifier,
  isThisExpression,
  yieldExpression
} = _core.types;
const awaitVisitor = _traverse.visitors.environmentVisitor({
  ArrowFunctionExpression(path) {
    path.skip();
  },
  AwaitExpression(path, {
    wrapAwait
  }) {
    const argument = path.get("argument");
    path.replaceWith(yieldExpression(wrapAwait ? callExpression(cloneNode(wrapAwait), [argument.node]) : argument.node));
  }
});
function _default(path, helpers, noNewArrows, ignoreFunctionLength) {
  path.traverse(awaitVisitor, {
    wrapAwait: helpers.wrapAwait
  });
  const isIIFE = checkIsIIFE(path);
  path.node.async = false;
  path.node.generator = true;
  (0, _helperWrapFunction.default)(path, cloneNode(helpers.wrapAsync), noNewArrows, ignoreFunctionLength);
  const isProperty = path.isObjectMethod() || path.isClassMethod() || path.parentPath.isObjectProperty() || path.parentPath.isClassProperty();
  if (!isProperty && !isIIFE && path.isExpression()) {
    (0, _helperAnnotateAsPure.default)(path);
  }
  function checkIsIIFE(path) {
    if (path.parentPath.isCallExpression({
      callee: path.node
    })) {
      return true;
    }
    const {
      parentPath
    } = path;
    if (parentPath.isMemberExpression()) {
      if (isIdentifier(parentPath.node.property, {
        name: "bind"
      })) {
        const {
          parentPath: bindCall
        } = parentPath;
        return (bindCall.isCallExpression() && bindCall.node.arguments.length === 1 && isThisExpression(bindCall.node.arguments[0]) && bindCall.parentPath.isCallExpression({
            callee: bindCall.node
          })
        );
      }
      return true;
    }
    return false;
  }
}

//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768876401277);
})()
//miniprogram-npm-outsideDeps=["@babel/helper-wrap-function","@babel/helper-annotate-as-pure","@babel/core","@babel/traverse"]
//# sourceMappingURL=index.js.map