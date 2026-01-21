module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768876401332, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _helperCompilationTargets = require("@babel/helper-compilation-targets");
var _helperPluginUtils = require("@babel/helper-plugin-utils");
var _default = exports.default = (0, _helperPluginUtils.declare)(api => {
  api.assertVersion(7);
  const supportUnicodeId = !(0, _helperCompilationTargets.isRequired)("transform-unicode-escapes", api.targets());
  return {
    name: "transform-function-name",
    visitor: {
      FunctionExpression: {
        exit(path) {
          if (path.key !== "value" && !path.parentPath.isObjectProperty()) {
            {
              var _path$ensureFunctionN;
              (_path$ensureFunctionN = path.ensureFunctionName) != null ? _path$ensureFunctionN : path.ensureFunctionName = require("@babel/traverse").NodePath.prototype.ensureFunctionName;
            }
            path.ensureFunctionName(supportUnicodeId);
          }
        }
      },
      ObjectProperty(path) {
        const value = path.get("value");
        if (value.isFunction()) {
          {
            var _value$ensureFunction;
            (_value$ensureFunction = value.ensureFunctionName) != null ? _value$ensureFunction : value.ensureFunctionName = require("@babel/traverse").NodePath.prototype.ensureFunctionName;
          }
          value.ensureFunctionName(supportUnicodeId);
        }
      }
    }
  };
});

//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768876401332);
})()
//miniprogram-npm-outsideDeps=["@babel/helper-compilation-targets","@babel/helper-plugin-utils","@babel/traverse"]
//# sourceMappingURL=index.js.map