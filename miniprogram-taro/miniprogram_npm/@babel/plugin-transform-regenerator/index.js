module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768876401359, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _helperPluginUtils = require("@babel/helper-plugin-utils");
var _visit = require("./regenerator/visit.js");
var _default = exports.default = (0, _helperPluginUtils.declare)(({
  types: t,
  traverse,
  assertVersion
}) => {
  assertVersion(7);
  return {
    name: "transform-regenerator",
    visitor: traverse.visitors.merge([(0, _visit.getVisitor)(), {
      CallExpression(path) {
        var _this$availableHelper;
        if (!((_this$availableHelper = this.availableHelper) != null && _this$availableHelper.call(this, "regeneratorRuntime"))) {
          return;
        }
        const callee = path.get("callee");
        if (!callee.isMemberExpression()) return;
        const obj = callee.get("object");
        if (obj.isIdentifier({
          name: "regeneratorRuntime"
        })) {
          const helper = this.addHelper("regeneratorRuntime");
          if (t.isArrowFunctionExpression(helper)) {
            obj.replaceWith(helper.body);
            return;
          }
          obj.replaceWith(t.callExpression(helper, []));
        }
      }
    }])
  };
});

//# sourceMappingURL=index.js.map

}, function(modId) {var map = {"./regenerator/visit.js":1768876401360}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401360, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getVisitor = void 0;
var _assert = require("assert");
var _hoist = require("./hoist.js");
var _emit = require("./emit.js");
var _replaceShorthandObjectMethod = require("./replaceShorthandObjectMethod.js");
var util = require("./util.js");
var _core = require("@babel/core");
const getVisitor = () => ({
  Method(path, state) {
    const node = path.node;
    if (!shouldRegenerate(node, state)) return;
    const container = _core.types.functionExpression(null, [], _core.types.cloneNode(node.body, false), node.generator, node.async);
    path.get("body").set("body", [_core.types.returnStatement(_core.types.callExpression(container, []))]);
    node.async = false;
    node.generator = false;
    path.get("body.body.0.argument.callee").unwrapFunctionEnvironment();
  },
  Function: {
    exit(path, state) {
      let node = path.node;
      if (!shouldRegenerate(node, state)) return;
      path = (0, _replaceShorthandObjectMethod.default)(path);
      node = path.node;
      const contextId = path.scope.generateUidIdentifier("context");
      const argsId = path.scope.generateUidIdentifier("args");
      path.ensureBlock();
      const bodyBlockPath = path.get("body");
      if (node.async) {
        bodyBlockPath.traverse(awaitVisitor, this);
      }
      bodyBlockPath.traverse(functionSentVisitor, {
        context: contextId,
        pluginPass: this
      });
      const outerBody = [];
      const innerBody = [];
      bodyBlockPath.get("body").forEach(function (childPath) {
        const node = childPath.node;
        if (_core.types.isExpressionStatement(node) && _core.types.isStringLiteral(node.expression)) {
          outerBody.push(node);
        } else if ((node == null ? void 0 : node._blockHoist) != null) {
          outerBody.push(node);
        } else {
          innerBody.push(node);
        }
      });
      if (outerBody.length > 0) {
        bodyBlockPath.node.body = innerBody;
      }
      const outerFnExpr = getOuterFnExpr(this, path);
      _core.types.assertIdentifier(node.id);
      const vars = (0, _hoist.hoist)(path);
      const context = {
        usesThis: false,
        usesArguments: false,
        getArgsId: () => _core.types.cloneNode(argsId)
      };
      path.traverse(argumentsThisVisitor, context);
      if (context.usesArguments) {
        vars.push(_core.types.variableDeclarator(_core.types.cloneNode(argsId), _core.types.identifier("arguments")));
      }
      const emitter = new _emit.Emitter(contextId, path.scope, vars, this);
      emitter.explode(path.get("body"));
      if (vars.length > 0) {
        outerBody.push(_core.types.variableDeclaration("var", vars));
      }
      const wrapArgs = [emitter.getContextFunction()];
      const tryLocsList = emitter.getTryLocsList();
      if (node.generator) {
        wrapArgs.push(outerFnExpr);
      } else if (context.usesThis || tryLocsList || node.async) {
        wrapArgs.push(_core.types.nullLiteral());
      }
      if (context.usesThis) {
        wrapArgs.push(_core.types.thisExpression());
      } else if (tryLocsList || node.async) {
        wrapArgs.push(_core.types.nullLiteral());
      }
      if (tryLocsList) {
        wrapArgs.push(tryLocsList);
      } else if (node.async) {
        wrapArgs.push(_core.types.nullLiteral());
      }
      if (node.async) {
        let currentScope = path.scope;
        do {
          if (currentScope.hasOwnBinding("Promise")) currentScope.rename("Promise");
        } while (currentScope = currentScope.parent);
        wrapArgs.push(_core.types.identifier("Promise"));
      }
      const wrapCall = _core.types.callExpression(util.newHelpersAvailable(this) ? !node.async ? _core.types.memberExpression(_core.types.callExpression(this.addHelper("regenerator"), []), _core.types.identifier("w")) : node.generator ? this.addHelper("regeneratorAsyncGen") : this.addHelper("regeneratorAsync") : util.runtimeProperty(this, node.async ? "async" : "wrap"), wrapArgs);
      outerBody.push(_core.types.returnStatement(wrapCall));
      node.body = _core.types.blockStatement(outerBody);
      path.get("body.body").forEach(p => p.scope.registerDeclaration(p));
      const oldDirectives = bodyBlockPath.node.directives;
      if (oldDirectives) {
        node.body.directives = oldDirectives;
      }
      const wasGeneratorFunction = node.generator;
      if (wasGeneratorFunction) {
        node.generator = false;
      }
      if (node.async) {
        node.async = false;
      }
      if (wasGeneratorFunction && _core.types.isExpression(node)) {
        path.replaceWith(_core.types.callExpression(util.newHelpersAvailable(this) ? _core.types.memberExpression(_core.types.callExpression(this.addHelper("regenerator"), []), _core.types.identifier("m")) : util.runtimeProperty(this, "mark"), [node]));
        path.addComment("leading", "#__PURE__");
      }
      const insertedLocs = emitter.getInsertedLocs();
      path.traverse({
        NumericLiteral(path) {
          if (!insertedLocs.has(path.node)) {
            return;
          }
          path.replaceWith(_core.types.numericLiteral(path.node.value));
        }
      });
      path.requeue();
    }
  }
});
exports.getVisitor = getVisitor;
function shouldRegenerate(node, state) {
  if (node.generator) {
    if (node.async) {
      return state.opts.asyncGenerators !== false;
    } else {
      return state.opts.generators !== false;
    }
  } else if (node.async) {
    return state.opts.async !== false;
  } else {
    return false;
  }
}
function getOuterFnExpr(state, funPath) {
  const node = funPath.node;
  _core.types.assertFunction(node);
  if (!node.id) {
    node.id = funPath.scope.parent.generateUidIdentifier("callee");
  }
  if (node.generator && _core.types.isFunctionDeclaration(node)) {
    return getMarkedFunctionId(state, funPath);
  }
  return _core.types.cloneNode(node.id);
}
const markInfo = new WeakMap();
function getMarkInfo(node) {
  if (!markInfo.has(node)) {
    markInfo.set(node, {});
  }
  return markInfo.get(node);
}
function getMarkedFunctionId(state, funPath) {
  const node = funPath.node;
  _core.types.assertIdentifier(node.id);
  const blockPath = funPath.findParent(function (path) {
    return path.isProgram() || path.isBlockStatement();
  });
  if (!blockPath) {
    return node.id;
  }
  const block = blockPath.node;
  _assert.ok(Array.isArray(block.body));
  const info = getMarkInfo(block);
  if (!info.decl) {
    info.decl = _core.types.variableDeclaration("var", []);
    blockPath.unshiftContainer("body", info.decl);
    info.declPath = blockPath.get("body.0");
  }
  _assert.strictEqual(info.declPath.node, info.decl);
  const markedId = blockPath.scope.generateUidIdentifier("marked");
  const markCallExp = _core.types.callExpression(util.newHelpersAvailable(state) ? _core.types.memberExpression(_core.types.callExpression(state.addHelper("regenerator"), []), _core.types.identifier("m")) : util.runtimeProperty(state, "mark"), [_core.types.cloneNode(node.id)]);
  const index = info.decl.declarations.push(_core.types.variableDeclarator(markedId, markCallExp)) - 1;
  const markCallExpPath = info.declPath.get("declarations." + index + ".init");
  _assert.strictEqual(markCallExpPath.node, markCallExp);
  markCallExpPath.addComment("leading", "#__PURE__");
  return _core.types.cloneNode(markedId);
}
const argumentsThisVisitor = {
  "FunctionExpression|FunctionDeclaration|Method": function (path) {
    path.skip();
  },
  Identifier: function (path, state) {
    if (path.node.name === "arguments" && util.isReference(path)) {
      path.replaceWith(state.getArgsId());
      state.usesArguments = true;
    }
  },
  ThisExpression: function (path, state) {
    state.usesThis = true;
  }
};
const functionSentVisitor = {
  MetaProperty(path, state) {
    const {
      node
    } = path;
    if (node.meta.name === "function" && node.property.name === "sent") {
      path.replaceWith(_core.types.memberExpression(_core.types.cloneNode(state.context), _core.types.identifier(util.newHelpersAvailable(state.pluginPass) ? "v" : "_sent")));
    }
  }
};
const awaitVisitor = {
  Function: function (path) {
    path.skip();
  },
  AwaitExpression: function (path) {
    const argument = path.node.argument;
    const helper = util.newHelpersAvailable(this) ? this.addHelper("awaitAsyncGenerator") : util.runtimeProperty(this, "awrap");
    path.replaceWith(_core.types.yieldExpression(_core.types.callExpression(helper, [argument]), false));
  }
};

//# sourceMappingURL=visit.js.map

}, function(modId) { var map = {"./hoist.js":1768876401361,"./emit.js":1768876401362,"./replaceShorthandObjectMethod.js":1768876401366,"./util.js":1768876401365}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401361, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hoist = hoist;
var _core = require("@babel/core");
function hoist(funPath) {
  _core.types.assertFunction(funPath.node);
  const vars = {
    __proto__: null
  };
  function varDeclToExpr({
    node: vdec
  }, includeIdentifiers) {
    _core.types.assertVariableDeclaration(vdec);
    const exprs = [];
    vdec.declarations.forEach(function (dec) {
      vars[dec.id.name] = _core.types.identifier(dec.id.name);
      if (dec.init) {
        exprs.push(_core.types.assignmentExpression("=", dec.id, dec.init));
      } else if (includeIdentifiers) {
        exprs.push(dec.id);
      }
    });
    if (exprs.length === 0) return null;
    if (exprs.length === 1) return exprs[0];
    return _core.types.sequenceExpression(exprs);
  }
  funPath.get("body").traverse({
    VariableDeclaration: {
      exit: function (path) {
        const expr = varDeclToExpr(path, false);
        if (expr === null) {
          path.remove();
        } else {
          for (const name of Object.keys(vars)) {
            path.scope.removeBinding(name);
          }
          path.replaceWith(_core.types.expressionStatement(expr));
        }
        path.skip();
      }
    },
    ForStatement: function (path) {
      const init = path.get("init");
      if (init.isVariableDeclaration()) {
        const expr = varDeclToExpr(init, false);
        if (expr) {
          init.replaceWith(expr);
        } else {
          init.remove();
        }
      }
    },
    ForXStatement: function (path) {
      const left = path.get("left");
      if (left.isVariableDeclaration()) {
        left.replaceWith(varDeclToExpr(left, true));
      }
    },
    FunctionDeclaration: function (path) {
      const node = path.node;
      vars[node.id.name] = node.id;
      const assignment = _core.types.expressionStatement(_core.types.assignmentExpression("=", _core.types.cloneNode(node.id), _core.types.functionExpression(path.scope.generateUidIdentifierBasedOnNode(node), node.params, node.body, node.generator, node.async)));
      if (path.parentPath.isBlockStatement()) {
        path.parentPath.unshiftContainer("body", assignment);
        path.remove();
      } else {
        path.replaceWith(assignment);
        path.scope.removeBinding(node.id.name);
      }
      path.skip();
    },
    FunctionExpression: function (path) {
      path.skip();
    },
    ArrowFunctionExpression: function (path) {
      path.skip();
    }
  });
  const paramNames = {
    __proto__: null
  };
  funPath.get("params").forEach(function (paramPath) {
    const param = paramPath.node;
    if (_core.types.isIdentifier(param)) {
      paramNames[param.name] = param;
    } else {}
  });
  const declarations = [];
  Object.keys(vars).forEach(function (name) {
    if (!hasOwnProperty.call(paramNames, name)) {
      declarations.push(_core.types.variableDeclarator(vars[name], null));
    }
  });
  return declarations;
}

//# sourceMappingURL=hoist.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401362, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Emitter = void 0;
var _assert = require("assert");
var leap = require("./leap.js");
var meta = require("./meta.js");
var util = require("./util.js");
var _core = require("@babel/core");
const PENDING_LOCATION = Number.MAX_VALUE;
function getDeclError(node) {
  return new Error("all declarations should have been transformed into " + "assignments before the Exploder began its work: " + JSON.stringify(node));
}
const catchParamVisitor = {
  Identifier: function (path, state) {
    if (path.node.name === state.catchParamName && util.isReference(path)) {
      path.replaceWith(state.getSafeParam());
    }
  },
  Scope: function (path, state) {
    if (path.scope.hasOwnBinding(state.catchParamName)) {
      path.skip();
    }
  }
};
class Emitter {
  constructor(contextId, scope, vars, pluginPass) {
    this.nextTempId = void 0;
    this.contextId = void 0;
    this.index = void 0;
    this.indexMap = void 0;
    this.listing = void 0;
    this.returns = void 0;
    this.lastReferenceIndex = 0;
    this.marked = void 0;
    this.insertedLocs = void 0;
    this.finalLoc = void 0;
    this.tryEntries = void 0;
    this.leapManager = void 0;
    this.scope = void 0;
    this.vars = void 0;
    this.pluginPass = void 0;
    this.pluginPass = pluginPass;
    this.scope = scope;
    this.vars = vars;
    this.nextTempId = 0;
    this.contextId = contextId;
    this.listing = [];
    this.index = 0;
    this.indexMap = new Map([[0, 0]]);
    this.returns = new Set();
    this.lastReferenceIndex = 0;
    this.marked = [true];
    this.insertedLocs = new Set();
    this.finalLoc = this.loc();
    this.tryEntries = [];
    this.leapManager = new leap.LeapManager(this);
  }
  loc() {
    const l = _core.types.numericLiteral(PENDING_LOCATION);
    this.insertedLocs.add(l);
    return l;
  }
  getInsertedLocs() {
    return this.insertedLocs;
  }
  getContextId() {
    return _core.types.cloneNode(this.contextId);
  }
  getIndex() {
    if (!this.indexMap.has(this.listing.length)) {
      this.indexMap.set(this.listing.length, ++this.index);
    }
    return this.index;
  }
  mark(loc) {
    if (loc.value === PENDING_LOCATION) {
      loc.value = this.getIndex();
    } else {
      _assert.strictEqual(loc.value, this.index);
    }
    this.marked[this.listing.length] = true;
    if (loc.value > this.lastReferenceIndex) {
      this.lastReferenceIndex = loc.value;
    }
    return loc;
  }
  emit(node) {
    if (_core.types.isExpression(node)) {
      node = _core.types.expressionStatement(node);
    }
    _core.types.assertStatement(node);
    this.listing.push(node);
  }
  emitAssign(lhs, rhs) {
    this.emit(this.assign(lhs, rhs));
    return lhs;
  }
  assign(lhs, rhs) {
    return _core.types.expressionStatement(_core.types.assignmentExpression("=", _core.types.cloneNode(lhs), rhs));
  }
  contextProperty(name) {
    const computed = name === "catch";
    return _core.types.memberExpression(this.getContextId(), computed ? _core.types.stringLiteral(name) : _core.types.identifier(name), !!computed);
  }
  clearPendingException(tryLoc, assignee) {
    const catchCall = _core.types.callExpression(this.contextProperty("catch"), [_core.types.cloneNode(tryLoc)]);
    if (assignee) {
      this.emitAssign(assignee, catchCall);
    } else {
      this.emit(catchCall);
    }
  }
  jump(toLoc) {
    this.emitAssign(this.contextProperty(util.newHelpersAvailable(this.pluginPass) ? "n" : "next"), toLoc);
    this.emit(_core.types.breakStatement());
  }
  jumpIf(test, toLoc) {
    this.emit(_core.types.ifStatement(test, _core.types.blockStatement([this.assign(this.contextProperty(util.newHelpersAvailable(this.pluginPass) ? "n" : "next"), toLoc), _core.types.breakStatement()])));
  }
  jumpIfNot(test, toLoc) {
    let negatedTest;
    if (_core.types.isUnaryExpression(test) && test.operator === "!") {
      negatedTest = test.argument;
    } else {
      negatedTest = _core.types.unaryExpression("!", test);
    }
    this.emit(_core.types.ifStatement(negatedTest, _core.types.blockStatement([this.assign(this.contextProperty(util.newHelpersAvailable(this.pluginPass) ? "n" : "next"), toLoc), _core.types.breakStatement()])));
  }
  makeContextTempVar() {
    return this.contextProperty("t" + this.nextTempId++);
  }
  makeTempVar() {
    const id = this.scope.generateUidIdentifier("t");
    this.vars.push(_core.types.variableDeclarator(id));
    return _core.types.cloneNode(id);
  }
  getContextFunction() {
    return _core.types.functionExpression(null, [this.getContextId()], _core.types.blockStatement([this.getDispatchLoop()]), false, false);
  }
  getDispatchLoop() {
    const self = this;
    const cases = [];
    let current;
    let alreadyEnded = false;
    self.listing.forEach(function (stmt, i) {
      if (self.marked[i]) {
        cases.push(_core.types.switchCase(_core.types.numericLiteral(self.indexMap.get(i)), current = []));
        alreadyEnded = false;
      }
      if (!alreadyEnded) {
        current.push(stmt);
        if (_core.types.isCompletionStatement(stmt)) alreadyEnded = true;
      }
    });
    this.finalLoc.value = this.getIndex();
    if (util.newHelpersAvailable(this.pluginPass)) {
      if (this.lastReferenceIndex === this.index || !this.returns.has(this.listing.length)) {
        cases.push(_core.types.switchCase(this.finalLoc, [_core.types.returnStatement(_core.types.callExpression(this.contextProperty("a"), [_core.types.numericLiteral(2)]))]));
      }
    } else {
      cases.push(_core.types.switchCase(this.finalLoc, []), _core.types.switchCase(_core.types.stringLiteral("end"), [_core.types.returnStatement(_core.types.callExpression(this.contextProperty("stop"), []))]));
    }
    return _core.types.whileStatement(_core.types.numericLiteral(1), _core.types.switchStatement(util.newHelpersAvailable(this.pluginPass) ? this.tryEntries.length === 0 ? this.contextProperty("n") : _core.types.assignmentExpression("=", this.contextProperty("p"), this.contextProperty("n")) : _core.types.assignmentExpression("=", this.contextProperty("prev"), this.contextProperty("next")), cases));
  }
  getTryLocsList() {
    if (this.tryEntries.length === 0) {
      return null;
    }
    let lastLocValue = 0;
    const arrayExpression = _core.types.arrayExpression(this.tryEntries.map(function (tryEntry) {
      const thisLocValue = tryEntry.firstLoc.value;
      _assert.ok(thisLocValue >= lastLocValue, "try entries out of order");
      lastLocValue = thisLocValue;
      const ce = tryEntry.catchEntry;
      const fe = tryEntry.finallyEntry;
      const locs = [tryEntry.firstLoc, ce ? ce.firstLoc : null];
      if (fe) {
        locs[2] = fe.firstLoc;
        locs[3] = fe.afterLoc;
      }
      return _core.types.arrayExpression(locs.map(loc => loc && _core.types.cloneNode(loc)));
    }));
    if (util.newHelpersAvailable(this.pluginPass)) {
      arrayExpression.elements.reverse();
    }
    return arrayExpression;
  }
  explode(path, ignoreResult) {
    const node = path.node;
    const self = this;
    if (_core.types.isDeclaration(node)) throw getDeclError(node);
    if (path.isStatement()) return self.explodeStatement(path);
    if (path.isExpression()) return self.explodeExpression(path, ignoreResult);
    switch (node.type) {
      case "VariableDeclarator":
        throw getDeclError(node);
      case "ObjectProperty":
      case "SwitchCase":
      case "CatchClause":
        throw new Error(node.type + " nodes should be handled by their parents");
      default:
        throw new Error("unknown Node of type " + JSON.stringify(node.type));
    }
  }
  explodeStatement(path, labelId = null) {
    const stmt = path.node;
    const self = this;
    let before, after, head;
    if (path.isBlockStatement()) {
      path.get("body").forEach(function (path) {
        self.explodeStatement(path);
      });
      return;
    }
    if (!meta.containsLeap(stmt)) {
      self.emit(stmt);
      return;
    }
    switch (path.type) {
      case "ExpressionStatement":
        self.explodeExpression(path.get("expression"), true);
        break;
      case "LabeledStatement":
        after = this.loc();
        self.leapManager.withEntry(new leap.LabeledEntry(after, path.node.label), function () {
          self.explodeStatement(path.get("body"), path.node.label);
        });
        self.mark(after);
        break;
      case "WhileStatement":
        before = this.loc();
        after = this.loc();
        self.mark(before);
        self.jumpIfNot(self.explodeExpression(path.get("test")), after);
        self.leapManager.withEntry(new leap.LoopEntry(after, before, labelId), function () {
          self.explodeStatement(path.get("body"));
        });
        self.jump(before);
        self.mark(after);
        break;
      case "DoWhileStatement":
        const first = this.loc();
        const test = this.loc();
        after = this.loc();
        self.mark(first);
        self.leapManager.withEntry(new leap.LoopEntry(after, test, labelId), function () {
          self.explode(path.get("body"));
        });
        self.mark(test);
        self.jumpIf(self.explodeExpression(path.get("test")), first);
        self.mark(after);
        break;
      case "ForStatement":
        head = this.loc();
        const update = this.loc();
        after = this.loc();
        if (path.node.init) {
          self.explode(path.get("init"), true);
        }
        self.mark(head);
        if (path.node.test) {
          self.jumpIfNot(self.explodeExpression(path.get("test")), after);
        } else {}
        self.leapManager.withEntry(new leap.LoopEntry(after, update, labelId), function () {
          self.explodeStatement(path.get("body"));
        });
        self.mark(update);
        if (path.node.update) {
          self.explode(path.get("update"), true);
        }
        self.jump(head);
        self.mark(after);
        break;
      case "TypeCastExpression":
        return self.explodeExpression(path.get("expression"));
      case "ForInStatement":
        head = this.loc();
        after = this.loc();
        const keyIterNextFn = self.makeTempVar();
        const helper = util.newHelpersAvailable(this.pluginPass) ? this.pluginPass.addHelper("regeneratorKeys") : util.runtimeProperty(this.pluginPass, "keys");
        self.emitAssign(keyIterNextFn, _core.types.callExpression(helper, [self.explodeExpression(path.get("right"))]));
        self.mark(head);
        const keyInfoTmpVar = self.makeTempVar();
        self.jumpIf(_core.types.memberExpression(_core.types.assignmentExpression("=", keyInfoTmpVar, _core.types.callExpression(_core.types.cloneNode(keyIterNextFn), [])), _core.types.identifier("done"), false), after);
        self.emitAssign(path.node.left, _core.types.memberExpression(_core.types.cloneNode(keyInfoTmpVar), _core.types.identifier("value"), false));
        self.leapManager.withEntry(new leap.LoopEntry(after, head, labelId), function () {
          self.explodeStatement(path.get("body"));
        });
        self.jump(head);
        self.mark(after);
        break;
      case "BreakStatement":
        self.emitAbruptCompletion({
          type: 3,
          target: self.leapManager.getBreakLoc(path.node.label)
        });
        break;
      case "ContinueStatement":
        self.emitAbruptCompletion({
          type: 3,
          target: self.leapManager.getContinueLoc(path.node.label)
        });
        break;
      case "SwitchStatement":
        const disc = self.emitAssign(self.makeTempVar(), self.explodeExpression(path.get("discriminant")));
        after = this.loc();
        const defaultLoc = this.loc();
        let condition = defaultLoc;
        const caseLocs = [];
        const cases = path.node.cases || [];
        for (let i = cases.length - 1; i >= 0; --i) {
          const c = cases[i];
          if (c.test) {
            condition = _core.types.conditionalExpression(_core.types.binaryExpression("===", _core.types.cloneNode(disc), c.test), caseLocs[i] = this.loc(), condition);
          } else {
            caseLocs[i] = defaultLoc;
          }
        }
        const discriminant = path.get("discriminant");
        discriminant.replaceWith(condition);
        self.jump(self.explodeExpression(discriminant));
        self.leapManager.withEntry(new leap.SwitchEntry(after), function () {
          path.get("cases").forEach(function (casePath) {
            const i = casePath.key;
            self.mark(caseLocs[i]);
            casePath.get("consequent").forEach(function (path) {
              self.explodeStatement(path);
            });
          });
        });
        self.mark(after);
        if (defaultLoc.value === PENDING_LOCATION) {
          self.mark(defaultLoc);
          _assert.strictEqual(after.value, defaultLoc.value);
        }
        break;
      case "IfStatement":
        const elseLoc = path.node.alternate && this.loc();
        after = this.loc();
        self.jumpIfNot(self.explodeExpression(path.get("test")), elseLoc || after);
        self.explodeStatement(path.get("consequent"));
        if (elseLoc) {
          self.jump(after);
          self.mark(elseLoc);
          self.explodeStatement(path.get("alternate"));
        }
        self.mark(after);
        break;
      case "ReturnStatement":
        self.emitAbruptCompletion({
          type: 2,
          value: self.explodeExpression(path.get("argument"))
        });
        break;
      case "WithStatement":
        throw new Error("WithStatement not supported in generator functions.");
      case "TryStatement":
        after = this.loc();
        const handler = path.node.handler;
        const catchLoc = handler && this.loc();
        const catchEntry = catchLoc && new leap.CatchEntry(catchLoc, handler.param);
        const finallyLoc = path.node.finalizer && this.loc();
        const finallyEntry = finallyLoc && new leap.FinallyEntry(finallyLoc, after);
        const tryEntry = new leap.TryEntry(self.getUnmarkedCurrentLoc(), catchEntry, finallyEntry);
        self.tryEntries.push(tryEntry);
        self.updateContextPrevLoc(tryEntry.firstLoc);
        self.leapManager.withEntry(tryEntry, () => {
          self.explodeStatement(path.get("block"));
          if (catchLoc) {
            const body = path.node.block.body;
            if (finallyLoc) {
              self.jump(finallyLoc);
            } else if (body.length && body[body.length - 1].type === "ReturnStatement") {
              after = null;
            } else {
              self.jump(after);
            }
            self.updateContextPrevLoc(self.mark(catchLoc));
            const bodyPath = path.get("handler.body");
            const safeParam = self.makeTempVar();
            if (util.newHelpersAvailable(this.pluginPass)) {
              this.emitAssign(safeParam, self.contextProperty("v"));
            } else {
              self.clearPendingException(tryEntry.firstLoc, safeParam);
            }
            bodyPath.traverse(catchParamVisitor, {
              getSafeParam: () => _core.types.cloneNode(safeParam),
              catchParamName: handler.param.name
            });
            self.leapManager.withEntry(catchEntry, function () {
              self.explodeStatement(bodyPath);
            });
          }
          if (finallyLoc) {
            self.updateContextPrevLoc(self.mark(finallyLoc));
            self.leapManager.withEntry(finallyEntry, function () {
              self.explodeStatement(path.get("finalizer"));
            });
            self.emit(_core.types.returnStatement(_core.types.callExpression(self.contextProperty(util.newHelpersAvailable(this.pluginPass) ? "f" : "finish"), [finallyEntry.firstLoc])));
          }
        });
        if (after) self.mark(after);
        break;
      case "ThrowStatement":
        self.emit(_core.types.throwStatement(self.explodeExpression(path.get("argument"))));
        break;
      case "ClassDeclaration":
        self.emit(self.explodeClass(path));
        break;
      default:
        throw new Error("unknown Statement of type " + JSON.stringify(stmt.type));
    }
  }
  emitAbruptCompletion(record) {
    const abruptArgs = [util.newHelpersAvailable(this.pluginPass) ? _core.types.numericLiteral(record.type) : _core.types.stringLiteral(record.type === 3 ? "continue" : "return")];
    if (record.type === 3) {
      abruptArgs[1] = this.insertedLocs.has(record.target) ? record.target : _core.types.cloneNode(record.target);
    } else if (record.type === 2) {
      if (record.value) {
        abruptArgs[1] = _core.types.cloneNode(record.value);
      }
    }
    this.emit(_core.types.returnStatement(_core.types.callExpression(this.contextProperty(util.newHelpersAvailable(this.pluginPass) ? "a" : "abrupt"), abruptArgs)));
    if (record.type === 2) {
      this.returns.add(this.listing.length);
    }
  }
  getUnmarkedCurrentLoc() {
    return _core.types.numericLiteral(this.getIndex());
  }
  updateContextPrevLoc(loc) {
    if (loc) {
      if (loc.value === PENDING_LOCATION) {
        loc.value = this.getIndex();
      } else {
        _assert.strictEqual(loc.value, this.index);
      }
    } else {
      loc = this.getUnmarkedCurrentLoc();
    }
    this.emitAssign(this.contextProperty(util.newHelpersAvailable(this.pluginPass) ? "p" : "prev"), loc);
  }
  explodeViaTempVar(tempVar, childPath, hasLeapingChildren, ignoreChildResult) {
    _assert.ok(!ignoreChildResult || !tempVar, "Ignoring the result of a child expression but forcing it to " + "be assigned to a temporary variable?");
    let result = this.explodeExpression(childPath, ignoreChildResult);
    if (ignoreChildResult) {} else if (tempVar || hasLeapingChildren && !_core.types.isLiteral(result)) {
      result = this.emitAssign(tempVar || this.makeTempVar(), result);
    }
    return result;
  }
  explodeExpression(path, ignoreResult) {
    const expr = path.node;
    if (!expr) {
      return expr;
    }
    const self = this;
    let result;
    let after;
    function finish(expr) {
      if (ignoreResult) {
        self.emit(expr);
      }
      return expr;
    }
    if (!meta.containsLeap(expr)) {
      return finish(expr);
    }
    const hasLeapingChildren = meta.containsLeap.onlyChildren(expr);
    switch (path.type) {
      case "MemberExpression":
        return finish(_core.types.memberExpression(self.explodeExpression(path.get("object")), path.node.computed ? self.explodeViaTempVar(null, path.get("property"), hasLeapingChildren) : path.node.property, path.node.computed));
      case "CallExpression":
        const calleePath = path.get("callee");
        const argsPath = path.get("arguments");
        let newCallee;
        let newArgs;
        let lastLeapingArgIndex = argsPath.length - 1;
        while (lastLeapingArgIndex >= 0 && !meta.containsLeap(argsPath[lastLeapingArgIndex].node)) {
          lastLeapingArgIndex--;
        }
        let injectFirstArg = null;
        if (_core.types.isMemberExpression(calleePath.node)) {
          if (lastLeapingArgIndex !== -1) {
            const newObject = self.explodeViaTempVar(self.makeTempVar(), calleePath.get("object"), hasLeapingChildren);
            const newProperty = calleePath.node.computed ? self.explodeViaTempVar(null, calleePath.get("property"), hasLeapingChildren) : calleePath.node.property;
            injectFirstArg = newObject;
            newCallee = _core.types.memberExpression(_core.types.memberExpression(_core.types.cloneNode(newObject), newProperty, calleePath.node.computed), _core.types.identifier("call"), false);
          } else {
            newCallee = self.explodeExpression(calleePath);
          }
        } else {
          newCallee = self.explodeViaTempVar(null, calleePath, hasLeapingChildren);
          if (_core.types.isMemberExpression(newCallee)) {
            newCallee = _core.types.sequenceExpression([_core.types.numericLiteral(0), _core.types.cloneNode(newCallee)]);
          }
        }
        if (lastLeapingArgIndex !== -1) {
          newArgs = argsPath.map((argPath, index) => index >= lastLeapingArgIndex ? self.explodeExpression(argPath) : self.explodeViaTempVar(null, argPath, hasLeapingChildren));
          if (injectFirstArg) newArgs.unshift(injectFirstArg);
          newArgs = newArgs.map(arg => _core.types.cloneNode(arg));
        } else {
          newArgs = path.node.arguments;
        }
        return finish(_core.types.callExpression(newCallee, newArgs));
      case "NewExpression":
        return finish(_core.types.newExpression(self.explodeViaTempVar(null, path.get("callee"), hasLeapingChildren), path.get("arguments").map(function (argPath) {
          return self.explodeViaTempVar(null, argPath, hasLeapingChildren);
        })));
      case "ObjectExpression":
        return finish(_core.types.objectExpression(path.get("properties").map(function (propPath) {
          if (propPath.isObjectProperty()) {
            return _core.types.objectProperty(propPath.node.key, self.explodeViaTempVar(null, propPath.get("value"), hasLeapingChildren), propPath.node.computed);
          } else {
            return propPath.node;
          }
        })));
      case "ArrayExpression":
        return finish(_core.types.arrayExpression(path.get("elements").map(function (elemPath) {
          if (!elemPath.node) {
            return null;
          }
          if (elemPath.isSpreadElement()) {
            return _core.types.spreadElement(self.explodeViaTempVar(null, elemPath.get("argument"), hasLeapingChildren));
          } else {
            return self.explodeViaTempVar(null, elemPath, hasLeapingChildren);
          }
        })));
      case "SequenceExpression":
        const lastIndex = path.node.expressions.length - 1;
        path.get("expressions").forEach(function (exprPath) {
          if (exprPath.key === lastIndex) {
            result = self.explodeExpression(exprPath, ignoreResult);
          } else {
            self.explodeExpression(exprPath, true);
          }
        });
        return result;
      case "LogicalExpression":
        after = this.loc();
        if (!ignoreResult) {
          result = self.makeTempVar();
        }
        const left = self.explodeViaTempVar(result, path.get("left"), hasLeapingChildren);
        if (path.node.operator === "&&") {
          self.jumpIfNot(left, after);
        } else {
          _assert.strictEqual(path.node.operator, "||");
          self.jumpIf(left, after);
        }
        self.explodeViaTempVar(result, path.get("right"), hasLeapingChildren, ignoreResult);
        self.mark(after);
        return result;
      case "ConditionalExpression":
        const elseLoc = this.loc();
        after = this.loc();
        const test = self.explodeExpression(path.get("test"));
        self.jumpIfNot(test, elseLoc);
        if (!ignoreResult) {
          result = self.makeTempVar();
        }
        self.explodeViaTempVar(result, path.get("consequent"), hasLeapingChildren, ignoreResult);
        self.jump(after);
        self.mark(elseLoc);
        self.explodeViaTempVar(result, path.get("alternate"), hasLeapingChildren, ignoreResult);
        self.mark(after);
        return result;
      case "UnaryExpression":
        return finish(_core.types.unaryExpression(path.node.operator, self.explodeExpression(path.get("argument")), !!path.node.prefix));
      case "BinaryExpression":
        return finish(_core.types.binaryExpression(path.node.operator, self.explodeViaTempVar(null, path.get("left"), hasLeapingChildren), self.explodeViaTempVar(null, path.get("right"), hasLeapingChildren)));
      case "AssignmentExpression":
        if (path.node.operator === "=") {
          return finish(_core.types.assignmentExpression(path.node.operator, self.explodeExpression(path.get("left")), self.explodeExpression(path.get("right"))));
        }
        const lhs = self.explodeExpression(path.get("left"));
        const temp = self.emitAssign(self.makeTempVar(), lhs);
        return finish(_core.types.assignmentExpression("=", _core.types.cloneNode(lhs), _core.types.assignmentExpression(path.node.operator, _core.types.cloneNode(temp), self.explodeExpression(path.get("right")))));
      case "UpdateExpression":
        return finish(_core.types.updateExpression(path.node.operator, self.explodeExpression(path.get("argument")), path.node.prefix));
      case "YieldExpression":
        after = this.loc();
        const arg = path.node.argument && self.explodeExpression(path.get("argument"));
        if (arg && path.node.delegate) {
          if (util.newHelpersAvailable(this.pluginPass)) {
            const ret = _core.types.returnStatement(_core.types.callExpression(self.contextProperty("d"), [_core.types.callExpression(this.pluginPass.addHelper("regeneratorValues"), [arg]), after]));
            ret.loc = expr.loc;
            self.emit(ret);
            self.mark(after);
            return self.contextProperty("v");
          } else {
            const result = self.makeContextTempVar();
            const ret = _core.types.returnStatement(_core.types.callExpression(self.contextProperty("delegateYield"), [arg, _core.types.stringLiteral(result.property.name), after]));
            ret.loc = expr.loc;
            self.emit(ret);
            self.mark(after);
            return result;
          }
        }
        self.emitAssign(self.contextProperty(util.newHelpersAvailable(this.pluginPass) ? "n" : "next"), after);
        const ret = _core.types.returnStatement(_core.types.cloneNode(arg) || null);
        ret.loc = expr.loc;
        self.emit(ret);
        self.mark(after);
        return self.contextProperty(util.newHelpersAvailable(self.pluginPass) ? "v" : "sent");
      case "ClassExpression":
        return finish(self.explodeClass(path));
      default:
        throw new Error("unknown Expression of type " + JSON.stringify(expr.type));
    }
  }
  explodeClass(path) {
    const explodingChildren = [];
    if (path.node.superClass) {
      explodingChildren.push(path.get("superClass"));
    }
    path.get("body.body").forEach(member => {
      if (member.node.computed) {
        explodingChildren.push(member.get("key"));
      }
    });
    const hasLeapingChildren = explodingChildren.some(child => meta.containsLeap(child.node));
    for (let i = 0; i < explodingChildren.length; i++) {
      const child = explodingChildren[i];
      const isLast = i === explodingChildren.length - 1;
      if (isLast) {
        child.replaceWith(this.explodeExpression(child));
      } else {
        child.replaceWith(this.explodeViaTempVar(null, child, hasLeapingChildren));
      }
    }
    return path.node;
  }
}
exports.Emitter = Emitter;

//# sourceMappingURL=emit.js.map

}, function(modId) { var map = {"./leap.js":1768876401363,"./meta.js":1768876401364,"./util.js":1768876401365}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401363, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TryEntry = exports.SwitchEntry = exports.LoopEntry = exports.LeapManager = exports.LabeledEntry = exports.FunctionEntry = exports.FinallyEntry = exports.Entry = exports.CatchEntry = void 0;
var _assert = require("assert");
class Entry {}
exports.Entry = Entry;
class FunctionEntry extends Entry {
  constructor(returnLoc) {
    super();
    this.returnLoc = void 0;
    this.returnLoc = returnLoc;
  }
}
exports.FunctionEntry = FunctionEntry;
class LoopEntry extends Entry {
  constructor(breakLoc, continueLoc, label = null) {
    super();
    this.breakLoc = void 0;
    this.continueLoc = void 0;
    this.label = void 0;
    this.breakLoc = breakLoc;
    this.continueLoc = continueLoc;
    this.label = label;
  }
}
exports.LoopEntry = LoopEntry;
class SwitchEntry extends Entry {
  constructor(breakLoc) {
    super();
    this.breakLoc = void 0;
    this.breakLoc = breakLoc;
  }
}
exports.SwitchEntry = SwitchEntry;
class TryEntry extends Entry {
  constructor(firstLoc, catchEntry = null, finallyEntry = null) {
    super();
    this.firstLoc = void 0;
    this.catchEntry = void 0;
    this.finallyEntry = void 0;
    _assert.ok(catchEntry || finallyEntry);
    this.firstLoc = firstLoc;
    this.catchEntry = catchEntry;
    this.finallyEntry = finallyEntry;
  }
}
exports.TryEntry = TryEntry;
class CatchEntry extends Entry {
  constructor(firstLoc, paramId) {
    super();
    this.firstLoc = void 0;
    this.paramId = void 0;
    this.firstLoc = firstLoc;
    this.paramId = paramId;
  }
}
exports.CatchEntry = CatchEntry;
class FinallyEntry extends Entry {
  constructor(firstLoc, afterLoc) {
    super();
    this.firstLoc = void 0;
    this.afterLoc = void 0;
    this.firstLoc = firstLoc;
    this.afterLoc = afterLoc;
  }
}
exports.FinallyEntry = FinallyEntry;
class LabeledEntry extends Entry {
  constructor(breakLoc, label) {
    super();
    this.breakLoc = void 0;
    this.label = void 0;
    this.breakLoc = breakLoc;
    this.label = label;
  }
}
exports.LabeledEntry = LabeledEntry;
class LeapManager {
  constructor(emitter) {
    this.emitter = void 0;
    this.entryStack = void 0;
    this.emitter = emitter;
    this.entryStack = [new FunctionEntry(emitter.finalLoc)];
  }
  withEntry(entry, callback) {
    this.entryStack.push(entry);
    try {
      callback.call(this.emitter);
    } finally {
      const popped = this.entryStack.pop();
      _assert.strictEqual(popped, entry);
    }
  }
  _findLeapLocation(property, label) {
    for (let i = this.entryStack.length - 1; i >= 0; --i) {
      const entry = this.entryStack[i];
      const loc = entry[property];
      if (loc) {
        if (label) {
          if (entry.label && entry.label.name === label.name) {
            return loc;
          }
        } else if (entry instanceof LabeledEntry) {} else {
          return loc;
        }
      }
    }
    return null;
  }
  getBreakLoc(label) {
    return this._findLeapLocation("breakLoc", label);
  }
  getContinueLoc(label) {
    return this._findLeapLocation("continueLoc", label);
  }
}
exports.LeapManager = LeapManager;

//# sourceMappingURL=leap.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401364, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasSideEffects = exports.containsLeap = void 0;
var _assert = require("assert");
var _core = require("@babel/core");
const mMap = new WeakMap();
function m(node) {
  if (!mMap.has(node)) {
    mMap.set(node, {});
  }
  return mMap.get(node);
}
function makePredicate(propertyName, knownTypes) {
  function onlyChildren(node) {
    _core.types.assertNode(node);
    let result = false;
    function check(child) {
      if (result) {} else if (Array.isArray(child)) {
        child.some(check);
      } else if (_core.types.isNode(child)) {
        _assert.strictEqual(result, false);
        result = predicate(child);
      }
      return result;
    }
    const keys = _core.types.VISITOR_KEYS[node.type];
    if (keys) {
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const child = node[key];
        check(child);
      }
    }
    return result;
  }
  function predicate(node) {
    _core.types.assertNode(node);
    const meta = m(node);
    if (hasOwnProperty.call(meta, propertyName)) return meta[propertyName];
    if (hasOwnProperty.call(opaqueTypes, node.type)) return meta[propertyName] = false;
    if (hasOwnProperty.call(knownTypes, node.type)) return meta[propertyName] = true;
    return meta[propertyName] = onlyChildren(node);
  }
  predicate.onlyChildren = onlyChildren;
  return predicate;
}
const opaqueTypes = {
  FunctionExpression: true,
  ArrowFunctionExpression: true
};
const sideEffectTypes = {
  CallExpression: true,
  ForInStatement: true,
  UnaryExpression: true,
  BinaryExpression: true,
  AssignmentExpression: true,
  UpdateExpression: true,
  NewExpression: true
};
const leapTypes = {
  YieldExpression: true,
  BreakStatement: true,
  ContinueStatement: true,
  ReturnStatement: true,
  ThrowStatement: true
};
for (const type in leapTypes) {
  if (hasOwnProperty.call(leapTypes, type)) {
    sideEffectTypes[type] = leapTypes[type];
  }
}
const hasSideEffects = exports.hasSideEffects = makePredicate("hasSideEffects", sideEffectTypes);
const containsLeap = exports.containsLeap = makePredicate("containsLeap", leapTypes);

//# sourceMappingURL=meta.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401365, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isReference = isReference;
exports.runtimeProperty = exports.newHelpersAvailable = void 0;
var _core = require("@babel/core");
let newHelpersAvailable = exports.newHelpersAvailable = void 0;
exports.newHelpersAvailable = newHelpersAvailable = file => {
  return file.availableHelper("regenerator") && !_core.types.isIdentifier(file.addHelper("regenerator"), {
    name: "__interal_marker_fallback_regenerator__"
  });
};
let runtimeProperty = exports.runtimeProperty = void 0;
exports.runtimeProperty = runtimeProperty = function (file, name) {
  const helper = file.addHelper("regeneratorRuntime");
  return _core.types.memberExpression(_core.types.isArrowFunctionExpression(helper) && _core.types.isIdentifier(helper.body) ? helper.body : _core.types.callExpression(helper, []), _core.types.identifier(name), false);
};
function isReference(path) {
  return path.isReferenced() || path.parentPath.isAssignmentExpression({
    left: path.node
  });
}

//# sourceMappingURL=util.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401366, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = replaceShorthandObjectMethod;
var _core = require("@babel/core");
function replaceShorthandObjectMethod(path) {
  if (!path.node || !_core.types.isFunction(path.node)) {
    throw new Error("replaceShorthandObjectMethod can only be called on Function AST node paths.");
  }
  if (!_core.types.isObjectMethod(path.node)) {
    return path;
  }
  if (!path.node.generator) {
    return path;
  }
  const parameters = path.node.params.map(function (param) {
    return _core.types.cloneNode(param);
  });
  const functionExpression = _core.types.functionExpression(null, parameters, _core.types.cloneNode(path.node.body), path.node.generator, path.node.async);
  path.replaceWith(_core.types.objectProperty(_core.types.cloneNode(path.node.key), functionExpression, path.node.computed, false));
  return path.get("value");
}

//# sourceMappingURL=replaceShorthandObjectMethod.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768876401359);
})()
//miniprogram-npm-outsideDeps=["@babel/helper-plugin-utils","assert","@babel/core"]
//# sourceMappingURL=index.js.map