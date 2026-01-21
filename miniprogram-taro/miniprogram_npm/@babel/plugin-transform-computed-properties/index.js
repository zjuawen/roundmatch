module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768876401321, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("@babel/core");
var _helperPluginUtils = require("@babel/helper-plugin-utils");
var _template = require("@babel/template");
var DefineAccessorHelper = _template.default.expression.ast`
    function (type, obj, key, fn) {
      var desc = { configurable: true, enumerable: true };
      desc[type] = fn;
      return Object.defineProperty(obj, key, desc);
    }
  `;
DefineAccessorHelper._compact = true;
var _default = exports.default = (0, _helperPluginUtils.declare)((api, options) => {
  var _api$assumption;
  api.assertVersion(7);
  const setComputedProperties = (_api$assumption = api.assumption("setComputedProperties")) != null ? _api$assumption : options.loose;
  const pushComputedProps = setComputedProperties ? pushComputedPropsLoose : pushComputedPropsSpec;
  function buildDefineAccessor(state, obj, prop) {
    const type = prop.kind;
    const key = !prop.computed && _core.types.isIdentifier(prop.key) ? _core.types.stringLiteral(prop.key.name) : prop.key;
    const fn = getValue(prop);
    let helper;
    if (state.availableHelper("defineAccessor")) {
      helper = state.addHelper("defineAccessor");
    } else {
      const file = state.file;
      helper = file.get("fallbackDefineAccessorHelper");
      if (!helper) {
        const id = file.scope.generateUidIdentifier("defineAccessor");
        file.scope.push({
          id,
          init: DefineAccessorHelper
        });
        file.set("fallbackDefineAccessorHelper", helper = id);
      }
      helper = _core.types.cloneNode(helper);
    }
    return _core.types.callExpression(helper, [_core.types.stringLiteral(type), obj, key, fn]);
  }
  function getValue(prop) {
    if (_core.types.isObjectProperty(prop)) {
      return prop.value;
    } else if (_core.types.isObjectMethod(prop)) {
      return _core.types.functionExpression(null, prop.params, prop.body, prop.generator, prop.async);
    }
  }
  function pushAssign(objId, prop, body) {
    body.push(_core.types.expressionStatement(_core.types.assignmentExpression("=", _core.types.memberExpression(_core.types.cloneNode(objId), prop.key, prop.computed || _core.types.isLiteral(prop.key)), getValue(prop))));
  }
  function pushComputedPropsLoose(info) {
    const {
      computedProps,
      state,
      initPropExpression,
      objId,
      body
    } = info;
    for (const prop of computedProps) {
      if (_core.types.isObjectMethod(prop) && (prop.kind === "get" || prop.kind === "set")) {
        if (computedProps.length === 1) {
          return buildDefineAccessor(state, initPropExpression, prop);
        } else {
          body.push(_core.types.expressionStatement(buildDefineAccessor(state, _core.types.cloneNode(objId), prop)));
        }
      } else {
        pushAssign(_core.types.cloneNode(objId), prop, body);
      }
    }
  }
  function pushComputedPropsSpec(info) {
    const {
      objId,
      body,
      computedProps,
      state
    } = info;
    const CHUNK_LENGTH_CAP = 10;
    let currentChunk = null;
    const computedPropsChunks = [];
    for (const prop of computedProps) {
      if (!currentChunk || currentChunk.length === CHUNK_LENGTH_CAP) {
        currentChunk = [];
        computedPropsChunks.push(currentChunk);
      }
      currentChunk.push(prop);
    }
    for (const chunk of computedPropsChunks) {
      const single = computedPropsChunks.length === 1;
      let node = single ? info.initPropExpression : _core.types.cloneNode(objId);
      for (const prop of chunk) {
        if (_core.types.isObjectMethod(prop) && (prop.kind === "get" || prop.kind === "set")) {
          node = buildDefineAccessor(info.state, node, prop);
        } else {
          node = _core.types.callExpression(state.addHelper("defineProperty"), [node, _core.types.toComputedKey(prop), getValue(prop)]);
        }
      }
      if (single) return node;
      body.push(_core.types.expressionStatement(node));
    }
  }
  return {
    name: "transform-computed-properties",
    visitor: {
      ObjectExpression: {
        exit(path, state) {
          const {
            node,
            parent,
            scope
          } = path;
          let hasComputed = false;
          for (const prop of node.properties) {
            hasComputed = prop.computed === true;
            if (hasComputed) break;
          }
          if (!hasComputed) return;
          const initProps = [];
          const computedProps = [];
          let foundComputed = false;
          for (const prop of node.properties) {
            if (_core.types.isSpreadElement(prop)) {
              continue;
            }
            if (prop.computed) {
              foundComputed = true;
            }
            if (foundComputed) {
              computedProps.push(prop);
            } else {
              initProps.push(prop);
            }
          }
          const objId = scope.generateUidIdentifierBasedOnNode(parent);
          const initPropExpression = _core.types.objectExpression(initProps);
          const body = [];
          body.push(_core.types.variableDeclaration("var", [_core.types.variableDeclarator(objId, initPropExpression)]));
          const single = pushComputedProps({
            scope,
            objId,
            body,
            computedProps,
            initPropExpression,
            state
          });
          if (single) {
            path.replaceWith(single);
          } else {
            if (setComputedProperties) {
              body.push(_core.types.expressionStatement(_core.types.cloneNode(objId)));
            }
            path.replaceWithMultiple(body);
          }
        }
      }
    }
  };
});

//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768876401321);
})()
//miniprogram-npm-outsideDeps=["@babel/core","@babel/helper-plugin-utils","@babel/template"]
//# sourceMappingURL=index.js.map