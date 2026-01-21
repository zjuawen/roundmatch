module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768876401287, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = wrapFunction;
var _template = require("@babel/template");
var _t = require("@babel/types");
const {
  blockStatement,
  callExpression,
  functionExpression,
  isAssignmentPattern,
  isFunctionDeclaration,
  isRestElement,
  returnStatement,
  isCallExpression,
  memberExpression,
  identifier,
  thisExpression,
  isPattern
} = _t;
const buildAnonymousExpressionWrapper = _template.default.expression(`
  (function () {
    var REF = FUNCTION;
    return function NAME(PARAMS) {
      return REF.apply(this, arguments);
    };
  })()
`);
const buildNamedExpressionWrapper = _template.default.expression(`
  (function () {
    var REF = FUNCTION;
    function NAME(PARAMS) {
      return REF.apply(this, arguments);
    }
    return NAME;
  })()
`);
const buildDeclarationWrapper = _template.default.statements(`
  function NAME(PARAMS) { return REF.apply(this, arguments); }
  function REF() {
    REF = FUNCTION;
    return REF.apply(this, arguments);
  }
`);
function classOrObjectMethod(path, callId, ignoreFunctionLength) {
  const node = path.node;
  const body = node.body;
  let params = [];
  const shouldForwardParams = node.params.some(p => isPattern(p));
  if (shouldForwardParams) {
    params = node.params;
    node.params = [];
    if (!ignoreFunctionLength) {
      for (const param of params) {
        if (isAssignmentPattern(param) || isRestElement(param)) {
          break;
        }
        node.params.push(path.scope.generateUidIdentifier("x"));
      }
    }
  }
  const container = functionExpression(null, params, blockStatement(body.body), true);
  if (shouldForwardParams) {
    body.body = [returnStatement(callExpression(memberExpression(callExpression(callId, [container]), identifier("apply")), [thisExpression(), identifier("arguments")]))];
    path.get("body.body.0.argument.callee.object.arguments.0").unwrapFunctionEnvironment();
  } else {
    body.body = [returnStatement(callExpression(callExpression(callId, [container]), []))];
    path.get("body.body.0.argument.callee.arguments.0").unwrapFunctionEnvironment();
  }
  node.async = false;
  node.generator = false;
}
function plainFunction(inPath, callId, noNewArrows, ignoreFunctionLength, hadName) {
  let path = inPath;
  let node;
  let functionId = null;
  const nodeParams = inPath.node.params;
  if (path.isArrowFunctionExpression()) {
    var _path$arrowFunctionTo;
    path = (_path$arrowFunctionTo = path.arrowFunctionToExpression({
      noNewArrows
    })) != null ? _path$arrowFunctionTo : path;
    node = path.node;
  } else {
    node = path.node;
  }
  const isDeclaration = isFunctionDeclaration(node);
  let built = node;
  if (!isCallExpression(node)) {
    functionId = node.id;
    node.id = null;
    node.type = "FunctionExpression";
    built = callExpression(callId, [node]);
  }
  const params = [];
  for (const param of nodeParams) {
    if (isAssignmentPattern(param) || isRestElement(param)) {
      break;
    }
    params.push(path.scope.generateUidIdentifier("x"));
  }
  const wrapperArgs = {
    NAME: functionId || null,
    REF: path.scope.generateUidIdentifier(hadName ? functionId.name : "ref"),
    FUNCTION: built,
    PARAMS: params
  };
  if (isDeclaration) {
    const container = buildDeclarationWrapper(wrapperArgs);
    path.replaceWith(container[0]);
    path.insertAfter(container[1]);
  } else {
    let container;
    if (hadName) {
      container = buildNamedExpressionWrapper(wrapperArgs);
    } else {
      container = buildAnonymousExpressionWrapper(wrapperArgs);
    }
    if (functionId || !ignoreFunctionLength && params.length) {
      path.replaceWith(container);
    } else {
      path.replaceWith(built);
    }
  }
}
function wrapFunction(path, callId, noNewArrows = true, ignoreFunctionLength = false) {
  if (path.isMethod()) {
    classOrObjectMethod(path, callId, ignoreFunctionLength);
  } else {
    var _path, _path$ensureFunctionN;
    const hadName = "id" in path.node && !!path.node.id;
    (_path$ensureFunctionN = (_path = path).ensureFunctionName) != null ? _path$ensureFunctionN : _path.ensureFunctionName = require("@babel/traverse").NodePath.prototype.ensureFunctionName;
    path = path.ensureFunctionName(false);
    plainFunction(path, callId, noNewArrows, ignoreFunctionLength, hadName);
  }
}

//# sourceMappingURL=index.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768876401287);
})()
//miniprogram-npm-outsideDeps=["@babel/template","@babel/types","@babel/traverse"]
//# sourceMappingURL=index.js.map