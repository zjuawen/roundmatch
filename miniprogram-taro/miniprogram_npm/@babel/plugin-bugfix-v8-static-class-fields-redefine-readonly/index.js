module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768876401295, function(require, module, exports) {


Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@babel/core');
var helperPluginUtils = require('@babel/helper-plugin-utils');

function isNameOrLength(key) {
  if (core.types.isIdentifier(key)) {
    return key.name === "name" || key.name === "length";
  }
  if (core.types.isStringLiteral(key)) {
    return key.value === "name" || key.value === "length";
  }
  return false;
}
function isStaticFieldWithValue(node) {
  return (core.types.isClassProperty(node) || core.types.isClassPrivateProperty(node)) && node.static && !!node.value;
}
const hasReferenceVisitor = {
  ReferencedIdentifier(path, state) {
    if (path.node.name === state.name) {
      state.ref();
      path.stop();
    }
  },
  Scope(path, {
    name
  }) {
    if (path.scope.hasOwnBinding(name)) {
      path.skip();
    }
  }
};
function isReferenceOrThis(node, name) {
  return core.types.isThisExpression(node) || name && core.types.isIdentifier(node, {
    name
  });
}
const hasReferenceOrThisVisitor = {
  "ThisExpression|ReferencedIdentifier"(path, state) {
    if (isReferenceOrThis(path.node, state.name)) {
      state.ref();
      path.stop();
    }
  },
  FunctionParent(path, state) {
    if (path.isArrowFunctionExpression()) return;
    if (state.name && !path.scope.hasOwnBinding(state.name)) {
      path.traverse(hasReferenceVisitor, state);
    }
    path.skip();
    if (path.isMethod()) {
      if (path.requeueComputedKeyAndDecorators) {
        path.requeueComputedKeyAndDecorators();
      } else {
        require("@babel/traverse").NodePath.prototype.requeueComputedKeyAndDecorators.call(path);
      }
    }
  }
};
function getPotentiallyBuggyFieldsIndexes(path) {
  var _path$node$id;
  const buggyPublicStaticFieldsIndexes = [];
  let classReferenced = false;
  const className = (_path$node$id = path.node.id) == null ? void 0 : _path$node$id.name;
  const hasReferenceState = {
    name: className,
    ref: () => classReferenced = true
  };
  if (className) {
    for (const el of path.get("body.body")) {
      if (el.node.computed) {
        el.get("key").traverse(hasReferenceVisitor, hasReferenceState);
        if (classReferenced) break;
      }
    }
  }
  let nextPotentiallyBuggy = false;
  const {
    body
  } = path.node.body;
  for (let i = 0; i < body.length; i++) {
    const node = body[i];
    if (!nextPotentiallyBuggy) {
      if (core.types.isStaticBlock(node)) {
        classReferenced = true;
        nextPotentiallyBuggy = true;
      } else if (isStaticFieldWithValue(node)) {
        if (!classReferenced) {
          if (isReferenceOrThis(node.value, className)) {
            classReferenced = true;
          } else {
            path.get(`body.body.${i}.value`).traverse(hasReferenceOrThisVisitor, hasReferenceState);
          }
        }
        if (classReferenced) {
          nextPotentiallyBuggy = !path.scope.isPure(node.value);
        }
      }
    }
    if (core.types.isClassProperty(node, {
      static: true
    }) && (nextPotentiallyBuggy || node.computed || isNameOrLength(node.key))) {
      buggyPublicStaticFieldsIndexes.push(i);
    }
  }
  return buggyPublicStaticFieldsIndexes;
}
function getNameOrLengthStaticFieldsIndexes(path) {
  const indexes = [];
  const {
    body
  } = path.node.body;
  for (let i = 0; i < body.length; i++) {
    const node = body[i];
    if (core.types.isClassProperty(node, {
      static: true,
      computed: false
    }) && isNameOrLength(node.key)) {
      indexes.push(i);
    }
  }
  return indexes;
}
function toRanges(nums) {
  const ranges = [];
  if (nums.length === 0) return ranges;
  let start = nums[0];
  let end = start + 1;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] <= nums[i - 1]) {
      throw new Error("Internal Babel error: nums must be in ascending order");
    }
    if (nums[i] === end) {
      end++;
    } else {
      ranges.push([start, end]);
      start = nums[i];
      end = start + 1;
    }
  }
  ranges.push([start, end]);
  return ranges;
}

function buildFieldsReplacement(fields, scope, file) {
  return core.types.staticBlock(fields.map(field => {
    const key = field.computed || !core.types.isIdentifier(field.key) ? field.key : core.types.stringLiteral(field.key.name);
    return core.types.expressionStatement(core.types.callExpression(file.addHelper("defineProperty"), [core.types.thisExpression(), key, field.value || scope.buildUndefinedNode()]));
  }));
}
var index = helperPluginUtils.declare(api => {
  api.assertVersion("^7.0.0-0 || ^8.0.0-0 || >8.0.0-alpha <8.0.0-beta");
  const setPublicClassFields = api.assumption("setPublicClassFields");
  return {
    name: "bugfix-v8-static-class-fields-redefine-readonly",
    visitor: {
      Class(path) {
        const ranges = toRanges(setPublicClassFields ? getNameOrLengthStaticFieldsIndexes(path) : getPotentiallyBuggyFieldsIndexes(path));
        for (let i = ranges.length - 1; i >= 0; i--) {
          const [start, end] = ranges[i];
          const startPath = path.get("body.body")[start];
          startPath.replaceWith(buildFieldsReplacement(path.node.body.body.slice(start, end), path.scope, this.file));
          for (let j = end - 1; j > start; j--) {
            path.get("body.body")[j].remove();
          }
        }
      }
    }
  };
});

exports.default = index;
//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768876401295);
})()
//miniprogram-npm-outsideDeps=["@babel/core","@babel/helper-plugin-utils","@babel/traverse"]
//# sourceMappingURL=index.js.map