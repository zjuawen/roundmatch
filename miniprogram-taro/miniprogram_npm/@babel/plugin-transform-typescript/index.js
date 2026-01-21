module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768876401376, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _helperPluginUtils = require("@babel/helper-plugin-utils");
var _pluginSyntaxTypescript = require("@babel/plugin-syntax-typescript");
var _helperCreateClassFeaturesPlugin = require("@babel/helper-create-class-features-plugin");
var _constEnum = require("./const-enum.js");
var _enum = require("./enum.js");
var _globalTypes = require("./global-types.js");
var _namespace = require("./namespace.js");
function isInType(path) {
  switch (path.parent.type) {
    case "TSTypeReference":
    case "TSExpressionWithTypeArguments":
    case "TSExpressionWithTypeArguments":
    case "TSTypeQuery":
      return true;
    case "TSQualifiedName":
      return (path.parentPath.findParent(path => path.type !== "TSQualifiedName").type !== "TSImportEqualsDeclaration"
      );
    case "ExportSpecifier":
      return (path.parent.exportKind === "type" || path.parentPath.parent.exportKind === "type"
      );
    default:
      return false;
  }
}
const NEEDS_EXPLICIT_ESM = new WeakMap();
const PARSED_PARAMS = new WeakSet();
function safeRemove(path) {
  const ids = path.getBindingIdentifiers();
  for (const name of Object.keys(ids)) {
    const binding = path.scope.getBinding(name);
    if (binding && binding.identifier === ids[name]) {
      binding.scope.removeBinding(name);
    }
  }
  path.opts.noScope = true;
  path.remove();
  path.opts.noScope = false;
}
function assertCjsTransformEnabled(path, pass, wrong, suggestion, extra = "") {
  if (pass.file.get("@babel/plugin-transform-modules-*") !== "commonjs") {
    throw path.buildCodeFrameError(`\`${wrong}\` is only supported when compiling modules to CommonJS.\n` + `Please consider using \`${suggestion}\`${extra}, or add ` + `@babel/plugin-transform-modules-commonjs to your Babel config.`);
  }
}
var _default = exports.default = (0, _helperPluginUtils.declare)((api, opts) => {
  const {
    types: t,
    template
  } = api;
  api.assertVersion(7);
  const JSX_PRAGMA_REGEX = /\*?\s*@jsx((?:Frag)?)\s+(\S+)/;
  const {
    allowNamespaces = true,
    jsxPragma = "React.createElement",
    jsxPragmaFrag = "React.Fragment",
    onlyRemoveTypeImports = false,
    optimizeConstEnums = false
  } = opts;
  var {
    allowDeclareFields = false
  } = opts;
  const classMemberVisitors = {
    field(path) {
      const {
        node
      } = path;
      if (!allowDeclareFields && node.declare) {
        throw path.buildCodeFrameError(`The 'declare' modifier is only allowed when the 'allowDeclareFields' option of ` + `@babel/plugin-transform-typescript or @babel/preset-typescript is enabled.`);
      }
      if (node.declare) {
        if (node.value) {
          throw path.buildCodeFrameError(`Fields with the 'declare' modifier cannot be initialized here, but only in the constructor`);
        }
        if (!node.decorators) {
          path.remove();
        }
      } else if (node.definite) {
        if (node.value) {
          throw path.buildCodeFrameError(`Definitely assigned fields cannot be initialized here, but only in the constructor`);
        }
        if (!allowDeclareFields && !node.decorators && !t.isClassPrivateProperty(node)) {
          path.remove();
        }
      } else if (node.abstract) {
        path.remove();
      } else {
        if (!allowDeclareFields && !node.value && !node.decorators && !t.isClassPrivateProperty(node)) {
          path.remove();
        }
      }
      if (node.accessibility) node.accessibility = null;
      if (node.abstract) node.abstract = null;
      if (node.readonly) node.readonly = null;
      if (node.optional) node.optional = null;
      if (node.typeAnnotation) node.typeAnnotation = null;
      if (node.definite) node.definite = null;
      if (node.declare) node.declare = null;
      if (node.override) node.override = null;
    },
    method({
      node
    }) {
      if (node.accessibility) node.accessibility = null;
      if (node.abstract) node.abstract = null;
      if (node.optional) node.optional = null;
      if (node.override) node.override = null;
    },
    constructor(path, classPath) {
      if (path.node.accessibility) path.node.accessibility = null;
      const assigns = [];
      const {
        scope
      } = path;
      for (const paramPath of path.get("params")) {
        const param = paramPath.node;
        if (param.type === "TSParameterProperty") {
          const parameter = param.parameter;
          if (PARSED_PARAMS.has(parameter)) continue;
          PARSED_PARAMS.add(parameter);
          let id;
          if (t.isIdentifier(parameter)) {
            id = parameter;
          } else if (t.isAssignmentPattern(parameter) && t.isIdentifier(parameter.left)) {
            id = parameter.left;
          } else {
            throw paramPath.buildCodeFrameError("Parameter properties can not be destructuring patterns.");
          }
          assigns.push(template.statement.ast`
              this.${t.cloneNode(id)} = ${t.cloneNode(id)}
            `);
          paramPath.replaceWith(paramPath.get("parameter"));
          scope.registerBinding("param", paramPath);
        }
      }
      (0, _helperCreateClassFeaturesPlugin.injectInitialization)(classPath, path, assigns);
    }
  };
  return {
    name: "transform-typescript",
    inherits: _pluginSyntaxTypescript.default,
    visitor: {
      Pattern: visitPattern,
      Identifier: visitPattern,
      RestElement: visitPattern,
      Program: {
        enter(path, state) {
          const {
            file
          } = state;
          let fileJsxPragma = null;
          let fileJsxPragmaFrag = null;
          const programScope = path.scope;
          if (!_globalTypes.GLOBAL_TYPES.has(programScope)) {
            _globalTypes.GLOBAL_TYPES.set(programScope, new Set());
          }
          if (file.ast.comments) {
            for (const comment of file.ast.comments) {
              const jsxMatches = JSX_PRAGMA_REGEX.exec(comment.value);
              if (jsxMatches) {
                if (jsxMatches[1]) {
                  fileJsxPragmaFrag = jsxMatches[2];
                } else {
                  fileJsxPragma = jsxMatches[2];
                }
              }
            }
          }
          let pragmaImportName = fileJsxPragma || jsxPragma;
          if (pragmaImportName) {
            [pragmaImportName] = pragmaImportName.split(".");
          }
          let pragmaFragImportName = fileJsxPragmaFrag || jsxPragmaFrag;
          if (pragmaFragImportName) {
            [pragmaFragImportName] = pragmaFragImportName.split(".");
          }
          for (let stmt of path.get("body")) {
            if (stmt.isImportDeclaration()) {
              if (!NEEDS_EXPLICIT_ESM.has(state.file.ast.program)) {
                NEEDS_EXPLICIT_ESM.set(state.file.ast.program, true);
              }
              if (stmt.node.importKind === "type") {
                for (const specifier of stmt.node.specifiers) {
                  (0, _globalTypes.registerGlobalType)(programScope, specifier.local.name);
                }
                stmt.remove();
                continue;
              }
              const importsToRemove = new Set();
              const specifiersLength = stmt.node.specifiers.length;
              const isAllSpecifiersElided = () => specifiersLength > 0 && specifiersLength === importsToRemove.size;
              for (const specifier of stmt.node.specifiers) {
                if (specifier.type === "ImportSpecifier" && specifier.importKind === "type") {
                  (0, _globalTypes.registerGlobalType)(programScope, specifier.local.name);
                  const binding = stmt.scope.getBinding(specifier.local.name);
                  if (binding) {
                    importsToRemove.add(binding.path);
                  }
                }
              }
              if (onlyRemoveTypeImports) {
                NEEDS_EXPLICIT_ESM.set(path.node, false);
              } else {
                if (stmt.node.specifiers.length === 0) {
                  NEEDS_EXPLICIT_ESM.set(path.node, false);
                  continue;
                }
                for (const specifier of stmt.node.specifiers) {
                  const binding = stmt.scope.getBinding(specifier.local.name);
                  if (binding && !importsToRemove.has(binding.path)) {
                    if (isImportTypeOnly({
                      binding,
                      programPath: path,
                      pragmaImportName,
                      pragmaFragImportName
                    })) {
                      importsToRemove.add(binding.path);
                    } else {
                      NEEDS_EXPLICIT_ESM.set(path.node, false);
                    }
                  }
                }
              }
              if (isAllSpecifiersElided() && !onlyRemoveTypeImports) {
                stmt.remove();
              } else {
                for (const importPath of importsToRemove) {
                  importPath.remove();
                }
              }
              continue;
            }
            if (!onlyRemoveTypeImports && stmt.isTSImportEqualsDeclaration()) {
              const {
                id
              } = stmt.node;
              const binding = stmt.scope.getBinding(id.name);
              if (binding && !stmt.node.isExport && isImportTypeOnly({
                binding,
                programPath: path,
                pragmaImportName,
                pragmaFragImportName
              })) {
                stmt.remove();
                continue;
              }
            }
            if (stmt.isExportDeclaration()) {
              stmt = stmt.get("declaration");
            }
            if (stmt.isVariableDeclaration({
              declare: true
            })) {
              for (const name of Object.keys(stmt.getBindingIdentifiers())) {
                (0, _globalTypes.registerGlobalType)(programScope, name);
              }
            } else if (stmt.isTSTypeAliasDeclaration() || stmt.isTSDeclareFunction() && stmt.get("id").isIdentifier() || stmt.isTSInterfaceDeclaration() || stmt.isClassDeclaration({
              declare: true
            }) || stmt.isTSEnumDeclaration({
              declare: true
            }) || stmt.isTSModuleDeclaration({
              declare: true
            }) && stmt.get("id").isIdentifier()) {
              (0, _globalTypes.registerGlobalType)(programScope, stmt.node.id.name);
            }
          }
        },
        exit(path) {
          if (path.node.sourceType === "module" && NEEDS_EXPLICIT_ESM.get(path.node)) {
            path.pushContainer("body", t.exportNamedDeclaration());
          }
        }
      },
      ExportNamedDeclaration(path, state) {
        if (!NEEDS_EXPLICIT_ESM.has(state.file.ast.program)) {
          NEEDS_EXPLICIT_ESM.set(state.file.ast.program, true);
        }
        if (path.node.exportKind === "type") {
          path.remove();
          return;
        }
        if (path.node.source && path.node.specifiers.length > 0 && path.node.specifiers.every(specifier => specifier.type === "ExportSpecifier" && specifier.exportKind === "type")) {
          path.remove();
          return;
        }
        if (!path.node.source && path.node.specifiers.length > 0 && path.node.specifiers.every(specifier => t.isExportSpecifier(specifier) && (0, _globalTypes.isGlobalType)(path, specifier.local.name))) {
          path.remove();
          return;
        }
        if (t.isTSModuleDeclaration(path.node.declaration)) {
          const namespace = path.node.declaration;
          if (!t.isStringLiteral(namespace.id)) {
            const id = (0, _namespace.getFirstIdentifier)(namespace.id);
            if (path.scope.hasOwnBinding(id.name)) {
              path.replaceWith(namespace);
            } else {
              const [newExport] = path.replaceWithMultiple([t.exportNamedDeclaration(t.variableDeclaration("let", [t.variableDeclarator(t.cloneNode(id))])), namespace]);
              path.scope.registerDeclaration(newExport);
            }
          }
        }
        NEEDS_EXPLICIT_ESM.set(state.file.ast.program, false);
      },
      ExportAllDeclaration(path) {
        if (path.node.exportKind === "type") path.remove();
      },
      ExportSpecifier(path) {
        const parent = path.parent;
        if (!parent.source && (0, _globalTypes.isGlobalType)(path, path.node.local.name) || path.node.exportKind === "type") {
          path.remove();
        }
      },
      ExportDefaultDeclaration(path, state) {
        if (!NEEDS_EXPLICIT_ESM.has(state.file.ast.program)) {
          NEEDS_EXPLICIT_ESM.set(state.file.ast.program, true);
        }
        if (t.isIdentifier(path.node.declaration) && (0, _globalTypes.isGlobalType)(path, path.node.declaration.name)) {
          path.remove();
          return;
        }
        NEEDS_EXPLICIT_ESM.set(state.file.ast.program, false);
      },
      TSDeclareFunction(path) {
        safeRemove(path);
      },
      TSDeclareMethod(path) {
        safeRemove(path);
      },
      VariableDeclaration(path) {
        if (path.node.declare) {
          safeRemove(path);
        }
      },
      VariableDeclarator({
        node
      }) {
        if (node.definite) node.definite = null;
      },
      TSIndexSignature(path) {
        path.remove();
      },
      ClassDeclaration(path) {
        const {
          node
        } = path;
        if (node.declare) {
          safeRemove(path);
        }
      },
      Class(path) {
        const {
          node
        } = path;
        if (node.typeParameters) node.typeParameters = null;
        if (node.superTypeParameters) node.superTypeParameters = null;
        if (node.implements) node.implements = null;
        if (node.abstract) node.abstract = null;
        path.get("body.body").forEach(child => {
          if (child.isClassMethod() || child.isClassPrivateMethod()) {
            if (child.node.kind === "constructor") {
              classMemberVisitors.constructor(child, path);
            } else {
              classMemberVisitors.method(child);
            }
          } else if (child.isClassProperty() || child.isClassPrivateProperty() || child.isClassAccessorProperty()) {
            classMemberVisitors.field(child);
          }
        });
      },
      Function(path) {
        const {
          node
        } = path;
        if (node.typeParameters) node.typeParameters = null;
        if (node.returnType) node.returnType = null;
        const params = node.params;
        if (params.length > 0 && t.isIdentifier(params[0], {
          name: "this"
        })) {
          params.shift();
        }
      },
      TSModuleDeclaration(path) {
        (0, _namespace.default)(path, allowNamespaces);
      },
      TSInterfaceDeclaration(path) {
        path.remove();
      },
      TSTypeAliasDeclaration(path) {
        path.remove();
      },
      TSEnumDeclaration(path) {
        if (optimizeConstEnums && path.node.const) {
          (0, _constEnum.default)(path, t);
        } else {
          (0, _enum.default)(path, t);
        }
      },
      TSImportEqualsDeclaration(path, pass) {
        const {
          id,
          moduleReference
        } = path.node;
        let init;
        let varKind;
        if (t.isTSExternalModuleReference(moduleReference)) {
          assertCjsTransformEnabled(path, pass, `import ${id.name} = require(...);`, `import ${id.name} from '...';`, " alongside Typescript's --allowSyntheticDefaultImports option");
          init = t.callExpression(t.identifier("require"), [moduleReference.expression]);
          varKind = "const";
        } else {
          init = entityNameToExpr(moduleReference);
          varKind = "var";
        }
        const newNode = t.variableDeclaration(varKind, [t.variableDeclarator(id, init)]);
        path.replaceWith(path.node.isExport ? t.exportNamedDeclaration(newNode) : newNode);
        path.scope.registerDeclaration(path);
      },
      TSExportAssignment(path, pass) {
        assertCjsTransformEnabled(path, pass, `export = <value>;`, `export default <value>;`);
        path.replaceWith(template.statement.ast`module.exports = ${path.node.expression}`);
      },
      TSTypeAssertion(path) {
        path.replaceWith(path.node.expression);
      },
      [`TSAsExpression${t.tsSatisfiesExpression ? "|TSSatisfiesExpression" : ""}`](path) {
        let {
          node
        } = path;
        do {
          node = node.expression;
        } while (t.isTSAsExpression(node) || t.isTSSatisfiesExpression != null && t.isTSSatisfiesExpression(node));
        path.replaceWith(node);
      },
      [api.types.tsInstantiationExpression ? "TSNonNullExpression|TSInstantiationExpression" : "TSNonNullExpression"](path) {
        path.replaceWith(path.node.expression);
      },
      CallExpression(path) {
        path.node.typeParameters = null;
      },
      OptionalCallExpression(path) {
        path.node.typeParameters = null;
      },
      NewExpression(path) {
        path.node.typeParameters = null;
      },
      JSXOpeningElement(path) {
        path.node.typeParameters = null;
      },
      TaggedTemplateExpression(path) {
        path.node.typeParameters = null;
      }
    }
  };
  function entityNameToExpr(node) {
    if (t.isTSQualifiedName(node)) {
      return t.memberExpression(entityNameToExpr(node.left), node.right);
    }
    return node;
  }
  function visitPattern({
    node
  }) {
    if (node.typeAnnotation) node.typeAnnotation = null;
    if (t.isIdentifier(node) && node.optional) node.optional = null;
  }
  function isImportTypeOnly({
    binding,
    programPath,
    pragmaImportName,
    pragmaFragImportName
  }) {
    for (const path of binding.referencePaths) {
      if (!isInType(path)) {
        return false;
      }
    }
    if (binding.identifier.name !== pragmaImportName && binding.identifier.name !== pragmaFragImportName) {
      return true;
    }
    let sourceFileHasJsx = false;
    programPath.traverse({
      "JSXElement|JSXFragment"(path) {
        sourceFileHasJsx = true;
        path.stop();
      }
    });
    return !sourceFileHasJsx;
  }
});

//# sourceMappingURL=index.js.map

}, function(modId) {var map = {"./const-enum.js":1768876401377,"./enum.js":1768876401378,"./global-types.js":1768876401379,"./namespace.js":1768876401380}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401377, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EXPORTED_CONST_ENUMS_IN_NAMESPACE = void 0;
exports.default = transpileConstEnum;
var _enum = require("./enum.js");
const EXPORTED_CONST_ENUMS_IN_NAMESPACE = exports.EXPORTED_CONST_ENUMS_IN_NAMESPACE = new WeakSet();
function transpileConstEnum(path, t) {
  const {
    name
  } = path.node.id;
  const parentIsExport = path.parentPath.isExportNamedDeclaration();
  let isExported = parentIsExport;
  if (!isExported && t.isProgram(path.parent)) {
    isExported = path.parent.body.some(stmt => t.isExportNamedDeclaration(stmt) && stmt.exportKind !== "type" && !stmt.source && stmt.specifiers.some(spec => t.isExportSpecifier(spec) && spec.exportKind !== "type" && spec.local.name === name));
  }
  const {
    enumValues: entries
  } = (0, _enum.translateEnumValues)(path, t);
  if (isExported || EXPORTED_CONST_ENUMS_IN_NAMESPACE.has(path.node)) {
    const obj = t.objectExpression(entries.map(([name, value]) => t.objectProperty(t.isValidIdentifier(name) ? t.identifier(name) : t.stringLiteral(name), value)));
    if (path.scope.hasOwnBinding(name)) {
      (parentIsExport ? path.parentPath : path).replaceWith(t.expressionStatement(t.callExpression(t.memberExpression(t.identifier("Object"), t.identifier("assign")), [path.node.id, obj])));
    } else {
      path.replaceWith(t.variableDeclaration("var", [t.variableDeclarator(path.node.id, obj)]));
      path.scope.registerDeclaration(path);
    }
    return;
  }
  const entriesMap = new Map(entries);
  path.scope.path.traverse({
    Scope(path) {
      if (path.scope.hasOwnBinding(name)) path.skip();
    },
    MemberExpression(path) {
      if (!t.isIdentifier(path.node.object, {
        name
      })) return;
      let key;
      if (path.node.computed) {
        if (t.isStringLiteral(path.node.property)) {
          key = path.node.property.value;
        } else {
          return;
        }
      } else if (t.isIdentifier(path.node.property)) {
        key = path.node.property.name;
      } else {
        return;
      }
      if (!entriesMap.has(key)) return;
      path.replaceWith(t.cloneNode(entriesMap.get(key)));
    }
  });
  path.remove();
}

//# sourceMappingURL=const-enum.js.map

}, function(modId) { var map = {"./enum.js":1768876401378}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401378, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transpileEnum;
exports.isSyntacticallyString = isSyntacticallyString;
exports.translateEnumValues = translateEnumValues;
var _core = require("@babel/core");
var _assert = require("assert");
var _helperAnnotateAsPure = require("@babel/helper-annotate-as-pure");
var _helperSkipTransparentExpressionWrappers = require("@babel/helper-skip-transparent-expression-wrappers");
const ENUMS = new WeakMap();
const buildEnumWrapper = _core.template.expression(`
    (function (ID) {
      ASSIGNMENTS;
      return ID;
    })(INIT)
  `);
function transpileEnum(path, t) {
  const {
    node,
    parentPath
  } = path;
  if (node.declare) {
    path.remove();
    return;
  }
  const name = node.id.name;
  const {
    fill,
    data,
    isPure
  } = enumFill(path, t, node.id);
  switch (parentPath.type) {
    case "BlockStatement":
    case "ExportNamedDeclaration":
    case "Program":
      {
        const isGlobal = t.isProgram(path.parent);
        const isSeen = seen(parentPath);
        let init = t.objectExpression([]);
        if (isSeen || isGlobal) {
          init = t.logicalExpression("||", t.cloneNode(fill.ID), init);
        }
        const enumIIFE = buildEnumWrapper(Object.assign({}, fill, {
          INIT: init
        }));
        if (isPure) (0, _helperAnnotateAsPure.default)(enumIIFE);
        if (isSeen) {
          const toReplace = parentPath.isExportDeclaration() ? parentPath : path;
          toReplace.replaceWith(t.expressionStatement(t.assignmentExpression("=", t.cloneNode(node.id), enumIIFE)));
        } else {
          path.scope.registerDeclaration(path.replaceWith(t.variableDeclaration(isGlobal ? "var" : "let", [t.variableDeclarator(node.id, enumIIFE)]))[0]);
        }
        ENUMS.set(path.scope.getBindingIdentifier(name), data);
        break;
      }
    default:
      throw new Error(`Unexpected enum parent '${path.parent.type}`);
  }
  function seen(parentPath) {
    if (parentPath.isExportDeclaration()) {
      return seen(parentPath.parentPath);
    }
    if (parentPath.getData(name)) {
      return true;
    } else {
      parentPath.setData(name, true);
      return false;
    }
  }
}
const buildStringAssignment = _core.template.statement(`
  ENUM["NAME"] = VALUE;
`);
const buildNumericAssignment = _core.template.statement(`
  ENUM[ENUM["NAME"] = VALUE] = "NAME";
`);
const buildEnumMember = (isString, options) => (isString ? buildStringAssignment : buildNumericAssignment)(options);
function enumFill(path, t, id) {
  const {
    enumValues,
    data,
    isPure
  } = translateEnumValues(path, t);
  const enumMembers = path.get("members");
  const assignments = [];
  for (let i = 0; i < enumMembers.length; i++) {
    const [memberName, memberValue] = enumValues[i];
    assignments.push(t.inheritsComments(buildEnumMember(isSyntacticallyString(memberValue), {
      ENUM: t.cloneNode(id),
      NAME: memberName,
      VALUE: memberValue
    }), enumMembers[i].node));
  }
  return {
    fill: {
      ID: t.cloneNode(id),
      ASSIGNMENTS: assignments
    },
    data,
    isPure
  };
}
function isSyntacticallyString(expr) {
  expr = (0, _helperSkipTransparentExpressionWrappers.skipTransparentExprWrapperNodes)(expr);
  switch (expr.type) {
    case "BinaryExpression":
      {
        const left = expr.left;
        const right = expr.right;
        return expr.operator === "+" && (isSyntacticallyString(left) || isSyntacticallyString(right));
      }
    case "TemplateLiteral":
    case "StringLiteral":
      return true;
  }
  return false;
}
function ReferencedIdentifier(expr, state) {
  const {
    seen,
    path,
    t
  } = state;
  const name = expr.node.name;
  if (seen.has(name)) {
    for (let curScope = expr.scope; curScope !== path.scope; curScope = curScope.parent) {
      if (curScope.hasOwnBinding(name)) {
        return;
      }
    }
    expr.replaceWith(t.memberExpression(t.cloneNode(path.node.id), t.cloneNode(expr.node)));
    expr.skip();
  }
}
const enumSelfReferenceVisitor = {
  ReferencedIdentifier
};
function translateEnumValues(path, t) {
  var _ENUMS$get;
  const bindingIdentifier = path.scope.getBindingIdentifier(path.node.id.name);
  const seen = (_ENUMS$get = ENUMS.get(bindingIdentifier)) != null ? _ENUMS$get : new Map();
  let constValue = -1;
  let lastName;
  let isPure = true;
  const enumMembers = path.get("members");
  const enumValues = enumMembers.map(memberPath => {
    const member = memberPath.node;
    const name = t.isIdentifier(member.id) ? member.id.name : member.id.value;
    const initializerPath = memberPath.get("initializer");
    const initializer = member.initializer;
    let value;
    if (initializer) {
      constValue = computeConstantValue(initializerPath, seen);
      if (constValue !== undefined) {
        seen.set(name, constValue);
        _assert(typeof constValue === "number" || typeof constValue === "string");
        if (constValue === Infinity || Number.isNaN(constValue)) {
          value = t.identifier(String(constValue));
        } else if (constValue === -Infinity) {
          value = t.unaryExpression("-", t.identifier("Infinity"));
        } else {
          value = t.valueToNode(constValue);
        }
      } else {
        isPure && (isPure = initializerPath.isPure());
        if (initializerPath.isReferencedIdentifier()) {
          ReferencedIdentifier(initializerPath, {
            t,
            seen,
            path
          });
        } else {
          initializerPath.traverse(enumSelfReferenceVisitor, {
            t,
            seen,
            path
          });
        }
        value = initializerPath.node;
        seen.set(name, undefined);
      }
    } else if (typeof constValue === "number") {
      constValue += 1;
      value = t.numericLiteral(constValue);
      seen.set(name, constValue);
    } else if (typeof constValue === "string") {
      throw path.buildCodeFrameError("Enum member must have initializer.");
    } else {
      const lastRef = t.memberExpression(t.cloneNode(path.node.id), t.stringLiteral(lastName), true);
      value = t.binaryExpression("+", t.numericLiteral(1), lastRef);
      seen.set(name, undefined);
    }
    lastName = name;
    return [name, value];
  });
  return {
    isPure,
    data: seen,
    enumValues
  };
}
function computeConstantValue(path, prevMembers, seen = new Set()) {
  return evaluate(path);
  function evaluate(path) {
    const expr = path.node;
    switch (expr.type) {
      case "MemberExpression":
        return evaluateRef(path, prevMembers, seen);
      case "StringLiteral":
        return expr.value;
      case "UnaryExpression":
        return evalUnaryExpression(path);
      case "BinaryExpression":
        return evalBinaryExpression(path);
      case "NumericLiteral":
        return expr.value;
      case "ParenthesizedExpression":
        return evaluate(path.get("expression"));
      case "Identifier":
        return evaluateRef(path, prevMembers, seen);
      case "TemplateLiteral":
        {
          if (expr.quasis.length === 1) {
            return expr.quasis[0].value.cooked;
          }
          const paths = path.get("expressions");
          const quasis = expr.quasis;
          let str = "";
          for (let i = 0; i < quasis.length; i++) {
            str += quasis[i].value.cooked;
            if (i + 1 < quasis.length) {
              const value = evaluateRef(paths[i], prevMembers, seen);
              if (value === undefined) return undefined;
              str += value;
            }
          }
          return str;
        }
      default:
        return undefined;
    }
  }
  function evaluateRef(path, prevMembers, seen) {
    if (path.isMemberExpression()) {
      const expr = path.node;
      const obj = expr.object;
      const prop = expr.property;
      if (!_core.types.isIdentifier(obj) || (expr.computed ? !_core.types.isStringLiteral(prop) : !_core.types.isIdentifier(prop))) {
        return;
      }
      const bindingIdentifier = path.scope.getBindingIdentifier(obj.name);
      const data = ENUMS.get(bindingIdentifier);
      if (!data) return;
      return data.get(prop.computed ? prop.value : prop.name);
    } else if (path.isIdentifier()) {
      const name = path.node.name;
      if (["Infinity", "NaN"].includes(name)) {
        return Number(name);
      }
      let value = prevMembers == null ? void 0 : prevMembers.get(name);
      if (value !== undefined) {
        return value;
      }
      if (prevMembers != null && prevMembers.has(name)) {
        return undefined;
      }
      if (seen.has(path.node)) return;
      seen.add(path.node);
      value = computeConstantValue(path.resolve(), prevMembers, seen);
      return value;
    }
  }
  function evalUnaryExpression(path) {
    const value = evaluate(path.get("argument"));
    if (value === undefined) {
      return undefined;
    }
    switch (path.node.operator) {
      case "+":
        return value;
      case "-":
        return -value;
      case "~":
        return ~value;
      default:
        return undefined;
    }
  }
  function evalBinaryExpression(path) {
    const left = evaluate(path.get("left"));
    if (left === undefined) {
      return undefined;
    }
    const right = evaluate(path.get("right"));
    if (right === undefined) {
      return undefined;
    }
    switch (path.node.operator) {
      case "|":
        return left | right;
      case "&":
        return left & right;
      case ">>":
        return left >> right;
      case ">>>":
        return left >>> right;
      case "<<":
        return left << right;
      case "^":
        return left ^ right;
      case "*":
        return left * right;
      case "/":
        return left / right;
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "%":
        return left % right;
      case "**":
        return Math.pow(left, right);
      default:
        return undefined;
    }
  }
}

//# sourceMappingURL=enum.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401379, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GLOBAL_TYPES = void 0;
exports.isGlobalType = isGlobalType;
exports.registerGlobalType = registerGlobalType;
const GLOBAL_TYPES = exports.GLOBAL_TYPES = new WeakMap();
function isGlobalType({
  scope
}, name) {
  if (scope.hasBinding(name)) return false;
  if (GLOBAL_TYPES.get(scope).has(name)) return true;
  console.warn(`The exported identifier "${name}" is not declared in Babel's scope tracker\n` + `as a JavaScript value binding, and "@babel/plugin-transform-typescript"\n` + `never encountered it as a TypeScript type declaration.\n` + `It will be treated as a JavaScript value.\n\n` + `This problem is likely caused by another plugin injecting\n` + `"${name}" without registering it in the scope tracker. If you are the author\n` + ` of that plugin, please use "scope.registerDeclaration(declarationPath)".`);
  return false;
}
function registerGlobalType(programScope, name) {
  GLOBAL_TYPES.get(programScope).add(name);
}

//# sourceMappingURL=global-types.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401380, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transpileNamespace;
exports.getFirstIdentifier = getFirstIdentifier;
var _core = require("@babel/core");
var _globalTypes = require("./global-types.js");
var _constEnum = require("./const-enum.js");
function getFirstIdentifier(node) {
  if (_core.types.isIdentifier(node)) {
    return node;
  }
  return getFirstIdentifier(node.left);
}
function transpileNamespace(path, allowNamespaces) {
  if (path.node.declare || path.node.id.type === "StringLiteral") {
    path.remove();
    return;
  }
  if (!allowNamespaces) {
    throw path.get("id").buildCodeFrameError("Namespace not marked type-only declare." + " Non-declarative namespaces are only supported experimentally in Babel." + " To enable and review caveats see:" + " https://babeljs.io/docs/en/babel-plugin-transform-typescript");
  }
  const name = getFirstIdentifier(path.node.id).name;
  const value = handleNested(path, path.node);
  if (value === null) {
    const program = path.findParent(p => p.isProgram());
    (0, _globalTypes.registerGlobalType)(program.scope, name);
    path.remove();
  } else if (path.scope.hasOwnBinding(name)) {
    path.replaceWith(value);
  } else {
    path.scope.registerDeclaration(path.replaceWithMultiple([getDeclaration(name), value])[0]);
  }
}
function getDeclaration(name) {
  return _core.types.variableDeclaration("let", [_core.types.variableDeclarator(_core.types.identifier(name))]);
}
function getMemberExpression(name, itemName) {
  return _core.types.memberExpression(_core.types.identifier(name), _core.types.identifier(itemName));
}
function handleVariableDeclaration(node, name, hub) {
  if (node.kind !== "const") {
    throw hub.file.buildCodeFrameError(node, "Namespaces exporting non-const are not supported by Babel." + " Change to const or see:" + " https://babeljs.io/docs/en/babel-plugin-transform-typescript");
  }
  const {
    declarations
  } = node;
  if (declarations.every(declarator => _core.types.isIdentifier(declarator.id))) {
    for (const declarator of declarations) {
      declarator.init = _core.types.assignmentExpression("=", getMemberExpression(name, declarator.id.name), declarator.init);
    }
    return [node];
  }
  const bindingIdentifiers = _core.types.getBindingIdentifiers(node);
  const assignments = [];
  for (const idName in bindingIdentifiers) {
    assignments.push(_core.types.assignmentExpression("=", getMemberExpression(name, idName), _core.types.cloneNode(bindingIdentifiers[idName])));
  }
  return [node, _core.types.expressionStatement(_core.types.sequenceExpression(assignments))];
}
function buildNestedAmbientModuleError(path, node) {
  return path.hub.buildError(node, "Ambient modules cannot be nested in other modules or namespaces.", Error);
}
function handleNested(path, node, parentExport) {
  const names = new Set();
  const realName = node.id;
  const name = path.scope.generateUid(realName.name);
  const body = node.body;
  let id = node.id;
  let namespaceTopLevel;
  namespaceTopLevel = _core.types.isTSModuleBlock(body) ? body.body : [_core.types.exportNamedDeclaration(body)];
  let isEmpty = true;
  for (let i = 0; i < namespaceTopLevel.length; i++) {
    const subNode = namespaceTopLevel[i];
    switch (subNode.type) {
      case "TSModuleDeclaration":
        {
          if (!_core.types.isIdentifier(subNode.id)) {
            throw buildNestedAmbientModuleError(path, subNode);
          }
          const transformed = handleNested(path, subNode);
          if (transformed !== null) {
            isEmpty = false;
            const moduleName = subNode.id.name;
            if (names.has(moduleName)) {
              namespaceTopLevel[i] = transformed;
            } else {
              names.add(moduleName);
              namespaceTopLevel.splice(i++, 1, getDeclaration(moduleName), transformed);
            }
          }
          continue;
        }
      case "TSEnumDeclaration":
      case "FunctionDeclaration":
      case "ClassDeclaration":
        isEmpty = false;
        names.add(subNode.id.name);
        continue;
      case "VariableDeclaration":
        {
          isEmpty = false;
          for (const name in _core.types.getBindingIdentifiers(subNode)) {
            names.add(name);
          }
          continue;
        }
      default:
        isEmpty && (isEmpty = _core.types.isTypeScript(subNode));
        continue;
      case "ExportNamedDeclaration":
    }
    if ("declare" in subNode.declaration && subNode.declaration.declare) {
      continue;
    }
    switch (subNode.declaration.type) {
      case "TSEnumDeclaration":
        _constEnum.EXPORTED_CONST_ENUMS_IN_NAMESPACE.add(subNode.declaration);
      case "FunctionDeclaration":
      case "ClassDeclaration":
        {
          isEmpty = false;
          const itemName = subNode.declaration.id.name;
          names.add(itemName);
          namespaceTopLevel.splice(i++, 1, subNode.declaration, _core.types.expressionStatement(_core.types.assignmentExpression("=", getMemberExpression(name, itemName), _core.types.identifier(itemName))));
          break;
        }
      case "VariableDeclaration":
        {
          isEmpty = false;
          const nodes = handleVariableDeclaration(subNode.declaration, name, path.hub);
          namespaceTopLevel.splice(i, nodes.length, ...nodes);
          i += nodes.length - 1;
          break;
        }
      case "TSModuleDeclaration":
        {
          if (!_core.types.isIdentifier(subNode.declaration.id)) {
            throw buildNestedAmbientModuleError(path, subNode.declaration);
          }
          const transformed = handleNested(path, subNode.declaration, _core.types.identifier(name));
          if (transformed !== null) {
            isEmpty = false;
            const moduleName = subNode.declaration.id.name;
            if (names.has(moduleName)) {
              namespaceTopLevel[i] = transformed;
            } else {
              names.add(moduleName);
              namespaceTopLevel.splice(i++, 1, getDeclaration(moduleName), transformed);
            }
          } else {
            namespaceTopLevel.splice(i, 1);
            i--;
          }
        }
    }
  }
  if (isEmpty) return null;
  let fallthroughValue = _core.types.objectExpression([]);
  if (parentExport) {
    const memberExpr = _core.types.memberExpression(parentExport, realName);
    fallthroughValue = _core.template.expression.ast`
      ${_core.types.cloneNode(memberExpr)} ||
        (${_core.types.cloneNode(memberExpr)} = ${fallthroughValue})
    `;
  }
  return _core.template.statement.ast`
    (function (${_core.types.identifier(name)}) {
      ${namespaceTopLevel}
    })(${realName} || (${_core.types.cloneNode(realName)} = ${fallthroughValue}));
  `;
}

//# sourceMappingURL=namespace.js.map

}, function(modId) { var map = {"./global-types.js":1768876401379,"./const-enum.js":1768876401377}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768876401376);
})()
//miniprogram-npm-outsideDeps=["@babel/helper-plugin-utils","@babel/plugin-syntax-typescript","@babel/helper-create-class-features-plugin","@babel/core","assert","@babel/helper-annotate-as-pure","@babel/helper-skip-transparent-expression-wrappers"]
//# sourceMappingURL=index.js.map