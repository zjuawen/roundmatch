module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768876401328, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _helperPluginUtils = require("@babel/helper-plugin-utils");
var _default = exports.default = (0, _helperPluginUtils.declare)(api => {
  api.assertVersion("^7.0.0-0 || ^8.0.0-0 || >8.0.0-alpha <8.0.0-beta");
  const {
    types: t,
    template
  } = api;
  function build(left, right) {
    return t.callExpression(t.memberExpression(t.identifier("Math"), t.identifier("pow")), [left, right]);
  }
  function maybeMemoize(node, scope) {
    if (scope.isStatic(node)) {
      return {
        assign: node,
        ref: t.cloneNode(node)
      };
    }
    if (scope.path.isPattern()) {
      return null;
    }
    const id = scope.generateUidIdentifierBasedOnNode(node);
    scope.push({
      id
    });
    return {
      assign: t.assignmentExpression("=", t.cloneNode(id), node),
      ref: t.cloneNode(id)
    };
  }
  return {
    name: "transform-exponentiation-operator",
    visitor: {
      AssignmentExpression(path) {
        const {
          node,
          scope
        } = path;
        if (node.operator !== "**=") return;
        if (t.isMemberExpression(node.left)) {
          let member1;
          let member2;
          const object = maybeMemoize(node.left.object, scope);
          if (!object) {
            path.replaceWith(template.expression.ast`(() => ${path.node})()`);
            return;
          }
          const {
            property,
            computed
          } = node.left;
          if (computed) {
            const prop = maybeMemoize(property, scope);
            member1 = t.memberExpression(object.assign, prop.assign, true);
            member2 = t.memberExpression(object.ref, prop.ref, true);
          } else {
            member1 = t.memberExpression(object.assign, property, false);
            member2 = t.memberExpression(object.ref, t.cloneNode(property), false);
          }
          path.replaceWith(t.assignmentExpression("=", member1, build(member2, node.right)));
        } else {
          path.replaceWith(t.assignmentExpression("=", node.left, build(t.cloneNode(node.left), node.right)));
        }
      },
      BinaryExpression(path) {
        const {
          node
        } = path;
        if (node.operator === "**") {
          path.replaceWith(build(node.left, node.right));
        }
      }
    }
  };
});

//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768876401328);
})()
//miniprogram-npm-outsideDeps=["@babel/helper-plugin-utils"]
//# sourceMappingURL=index.js.map