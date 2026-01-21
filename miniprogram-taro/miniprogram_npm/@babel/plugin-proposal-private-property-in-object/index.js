module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768876401299, function(require, module, exports) {
(function() {
maybeWarn: try {
  var stackTraceLimit = Error.stackTraceLimit;
  Error.stackTraceLimit = Infinity;
  var stack = new Error().stack;
  Error.stackTraceLimit = stackTraceLimit;
  if (!stack.includes("babel-preset-react-app")) break maybeWarn;

  // Try this as a fallback, in case it's available in node_modules
  module.exports = require("@babel/plugin-transform-private-property-in-object");

  setTimeout(console.warn, 2500, `\
\x1B[0;33mOne of your dependencies, babel-preset-react-app, is importing the
"@babel/plugin-proposal-private-property-in-object" package without
declaring it in its dependencies. This is currently working because
"@babel/plugin-proposal-private-property-in-object" is already in your
node_modules folder for unrelated reasons, but it \x1B[1mmay break at any time\x1B[0;33m.

babel-preset-react-app is part of the create-react-app project, \x1B[1mwhich
is not maintianed anymore\x1B[0;33m. It is thus unlikely that this bug will
ever be fixed. Add "@babel/plugin-proposal-private-property-in-object" to
your devDependencies to work around this error. This will make this message
go away.\x1B[0m
  `);

  return;
} catch (e) {}
})();

throw new Error(`\
--- PLACEHOLDER PACKAGE ---
This @babel/plugin-proposal-private-property-in-object version is not meant to
be imported. Something is importing
@babel/plugin-proposal-private-property-in-object without declaring it in its
dependencies (or devDependencies) in the package.json file.
Add "@babel/plugin-proposal-private-property-in-object" to your devDependencies
to work around this error. This will make this message go away.
`);

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768876401299);
})()
//miniprogram-npm-outsideDeps=["@babel/plugin-transform-private-property-in-object"]
//# sourceMappingURL=index.js.map