module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768876401346, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _helperPluginUtils = require("@babel/helper-plugin-utils");
var _core = require("@babel/core");
var _default = exports.default = (0, _helperPluginUtils.declare)((api, {
  loose = false
}) => {
  var _api$assumption, _api$assumption2;
  api.assertVersion("^7.0.0-0 || ^8.0.0-0 || >8.0.0-alpha <8.0.0-beta");
  const noDocumentAll = (_api$assumption = api.assumption("noDocumentAll")) != null ? _api$assumption : loose;
  const pureGetters = (_api$assumption2 = api.assumption("pureGetters")) != null ? _api$assumption2 : false;
  return {
    name: "transform-nullish-coalescing-operator",
    manipulateOptions: (_, parser) => parser.plugins.push("nullishCoalescingOperator"),
    visitor: {
      LogicalExpression(path) {
        const {
          node,
          scope
        } = path;
        if (node.operator !== "??") {
          return;
        }
        let ref;
        let assignment;
        if (pureGetters && scope.path.isPattern() && _core.types.isMemberExpression(node.left) && !node.left.computed && _core.types.isIdentifier(node.left.object) && _core.types.isIdentifier(node.left.property) || _core.types.isIdentifier(node.left) && (pureGetters || scope.hasBinding(node.left.name))) {
          ref = node.left;
          assignment = _core.types.cloneNode(node.left);
        } else if (scope.path.isPattern()) {
          path.replaceWith(_core.template.statement.ast`(() => ${path.node})()`);
          return;
        } else {
          ref = scope.generateUidIdentifierBasedOnNode(node.left);
          scope.push({
            id: _core.types.cloneNode(ref)
          });
          assignment = _core.types.assignmentExpression("=", ref, node.left);
        }
        path.replaceWith(_core.types.conditionalExpression(noDocumentAll ? _core.types.binaryExpression("!=", assignment, _core.types.nullLiteral()) : _core.types.logicalExpression("&&", _core.types.binaryExpression("!==", assignment, _core.types.nullLiteral()), _core.types.binaryExpression("!==", _core.types.cloneNode(ref), scope.buildUndefinedNode())), _core.types.cloneNode(ref), node.right));
      }
    }
  };
});

//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768876401346);
})()
//miniprogram-npm-outsideDeps=["@babel/helper-plugin-utils","@babel/core"]
//# sourceMappingURL=index.js.map