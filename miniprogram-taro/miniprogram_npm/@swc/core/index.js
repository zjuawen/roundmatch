module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768876401558, function(require, module, exports) {

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_EXTENSIONS = exports.getBinaryMetadata = exports.__experimental_registerGlobalTraceConfig = exports.minifySync = exports.minify = exports.bundle = exports.transformFileSync = exports.transformFile = exports.transformSync = exports.transform = exports.printSync = exports.print = exports.parseFileSync = exports.parseFile = exports.parseSync = exports.parse = exports.Compiler = exports.plugins = exports.version = void 0;
const path_1 = require("path");
__exportStar(require("@swc/types"), exports);
const spack_1 = require("./spack");
const assert = __importStar(require("assert"));
// Allow overrides to the location of the .node binding file
const bindingsOverride = process.env["SWC_BINARY_PATH"];
// `@swc/core` includes d.ts for the `@swc/wasm` to provide typed fallback bindings
// todo: fix package.json scripts
let fallbackBindings;
const bindings = (() => {
    let binding;
    try {
        binding = !!bindingsOverride ? require((0, path_1.resolve)(bindingsOverride)) : require('./binding');
        // If native binding loaded successfully, it should return proper target triple constant.
        const triple = binding.getTargetTriple();
        assert.ok(triple, 'Failed to read target triple from native binary.');
        return binding;
    }
    catch (_) {
        // postinstall supposed to install `@swc/wasm` already
        fallbackBindings = require('@swc/wasm');
    }
    finally {
        return binding;
    }
})();
/**
 * Version of the swc binding.
 */
exports.version = require("./package.json").version;
/**
 * @deprecated JavaScript API is deprecated. Please use Wasm plugin instead.
 */
function plugins(ps) {
    return mod => {
        let m = mod;
        for (const p of ps) {
            m = p(m);
        }
        return m;
    };
}
exports.plugins = plugins;
class Compiler {
    constructor() {
        this.fallbackBindingsPluginWarningDisplayed = false;
    }
    minify(src, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            if (bindings) {
                return bindings.minify(toBuffer(src), toBuffer(opts !== null && opts !== void 0 ? opts : {}));
            }
            else if (fallbackBindings) {
                return fallbackBindings.minify(src, opts);
            }
            throw new Error('Bindings not found.');
        });
    }
    minifySync(src, opts) {
        if (bindings) {
            return bindings.minifySync(toBuffer(src), toBuffer(opts !== null && opts !== void 0 ? opts : {}));
        }
        else if (fallbackBindings) {
            return fallbackBindings.minifySync(src, opts);
        }
        throw new Error('Bindings not found.');
    }
    parse(src, options, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            options = options || { syntax: "ecmascript" };
            options.syntax = options.syntax || "ecmascript";
            if (!bindings && !!fallbackBindings) {
                throw new Error('Fallback bindings does not support this interface yet.');
            }
            else if (!bindings) {
                throw new Error('Bindings not found.');
            }
            if (bindings) {
                const res = yield bindings.parse(src, toBuffer(options), filename);
                return JSON.parse(res);
            }
            else if (fallbackBindings) {
                return fallbackBindings.parse(src, options);
            }
            throw new Error('Bindings not found.');
        });
    }
    parseSync(src, options, filename) {
        options = options || { syntax: "ecmascript" };
        options.syntax = options.syntax || "ecmascript";
        if (bindings) {
            return JSON.parse(bindings.parseSync(src, toBuffer(options), filename));
        }
        else if (fallbackBindings) {
            return fallbackBindings.parseSync(src, options);
        }
        throw new Error('Bindings not found.');
    }
    parseFile(path, options) {
        return __awaiter(this, void 0, void 0, function* () {
            options = options || { syntax: "ecmascript" };
            options.syntax = options.syntax || "ecmascript";
            if (!bindings && !!fallbackBindings) {
                throw new Error('Fallback bindings does not support filesystem access.');
            }
            else if (!bindings) {
                throw new Error('Bindings not found.');
            }
            const res = yield bindings.parseFile(path, toBuffer(options));
            return JSON.parse(res);
        });
    }
    parseFileSync(path, options) {
        options = options || { syntax: "ecmascript" };
        options.syntax = options.syntax || "ecmascript";
        if (!bindings && !!fallbackBindings) {
            throw new Error('Fallback bindings does not support filesystem access');
        }
        else if (!bindings) {
            throw new Error('Bindings not found.');
        }
        return JSON.parse(bindings.parseFileSync(path, toBuffer(options)));
    }
    /**
     * Note: this method should be invoked on the compiler instance used
     *  for `parse()` / `parseSync()`.
     */
    print(m, options) {
        return __awaiter(this, void 0, void 0, function* () {
            options = options || {};
            if (bindings) {
                return bindings.print(JSON.stringify(m), toBuffer(options));
            }
            else if (fallbackBindings) {
                return fallbackBindings.print(m, options);
            }
            throw new Error('Bindings not found.');
        });
    }
    /**
     * Note: this method should be invoked on the compiler instance used
     *  for `parse()` / `parseSync()`.
     */
    printSync(m, options) {
        options = options || {};
        if (bindings) {
            return bindings.printSync(JSON.stringify(m), toBuffer(options));
        }
        else if (fallbackBindings) {
            return fallbackBindings.printSync(m, options);
        }
        throw new Error('Bindings not found.');
    }
    transform(src, options) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const isModule = typeof src !== "string";
            options = options || {};
            if ((_a = options === null || options === void 0 ? void 0 : options.jsc) === null || _a === void 0 ? void 0 : _a.parser) {
                options.jsc.parser.syntax = (_b = options.jsc.parser.syntax) !== null && _b !== void 0 ? _b : 'ecmascript';
            }
            const { plugin } = options, newOptions = __rest(options, ["plugin"]);
            if (bindings) {
                if (plugin) {
                    const m = typeof src === "string"
                        ? yield this.parse(src, (_c = options === null || options === void 0 ? void 0 : options.jsc) === null || _c === void 0 ? void 0 : _c.parser, options.filename)
                        : src;
                    return this.transform(plugin(m), newOptions);
                }
                return bindings.transform(isModule ? JSON.stringify(src) : src, isModule, toBuffer(newOptions));
            }
            else if (fallbackBindings) {
                if (plugin && !this.fallbackBindingsPluginWarningDisplayed) {
                    console.warn(`Fallback bindings does not support legacy plugins, it'll be ignored.`);
                    this.fallbackBindingsPluginWarningDisplayed = true;
                }
                return fallbackBindings.transform(src, options);
            }
            throw new Error('Bindings not found.');
        });
    }
    transformSync(src, options) {
        var _a, _b, _c;
        const isModule = typeof src !== "string";
        options = options || {};
        if ((_a = options === null || options === void 0 ? void 0 : options.jsc) === null || _a === void 0 ? void 0 : _a.parser) {
            options.jsc.parser.syntax = (_b = options.jsc.parser.syntax) !== null && _b !== void 0 ? _b : 'ecmascript';
        }
        const { plugin } = options, newOptions = __rest(options, ["plugin"]);
        if (bindings) {
            if (plugin) {
                const m = typeof src === "string" ? this.parseSync(src, (_c = options === null || options === void 0 ? void 0 : options.jsc) === null || _c === void 0 ? void 0 : _c.parser, options.filename) : src;
                return this.transformSync(plugin(m), newOptions);
            }
            return bindings.transformSync(isModule ? JSON.stringify(src) : src, isModule, toBuffer(newOptions));
        }
        else if (fallbackBindings) {
            if (plugin && !this.fallbackBindingsPluginWarningDisplayed) {
                console.warn(`Fallback bindings does not support legacy plugins, it'll be ignored.`);
                this.fallbackBindingsPluginWarningDisplayed = true;
            }
            return fallbackBindings.transformSync(isModule ? JSON.stringify(src) : src, options);
        }
        throw new Error("Bindings not found");
    }
    transformFile(path, options) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            if (!bindings && !!fallbackBindings) {
                throw new Error('Fallback bindings does not support filesystem access.');
            }
            else if (!bindings) {
                throw new Error('Bindings not found.');
            }
            options = options || {};
            if ((_a = options === null || options === void 0 ? void 0 : options.jsc) === null || _a === void 0 ? void 0 : _a.parser) {
                options.jsc.parser.syntax = (_b = options.jsc.parser.syntax) !== null && _b !== void 0 ? _b : 'ecmascript';
            }
            const { plugin } = options, newOptions = __rest(options, ["plugin"]);
            newOptions.filename = path;
            if (plugin) {
                const m = yield this.parseFile(path, (_c = options === null || options === void 0 ? void 0 : options.jsc) === null || _c === void 0 ? void 0 : _c.parser);
                return this.transform(plugin(m), newOptions);
            }
            return bindings.transformFile(path, false, toBuffer(newOptions));
        });
    }
    transformFileSync(path, options) {
        var _a, _b, _c;
        if (!bindings && !!fallbackBindings) {
            throw new Error('Fallback bindings does not support filesystem access.');
        }
        else if (!bindings) {
            throw new Error('Bindings not found.');
        }
        options = options || {};
        if ((_a = options === null || options === void 0 ? void 0 : options.jsc) === null || _a === void 0 ? void 0 : _a.parser) {
            options.jsc.parser.syntax = (_b = options.jsc.parser.syntax) !== null && _b !== void 0 ? _b : 'ecmascript';
        }
        const { plugin } = options, newOptions = __rest(options, ["plugin"]);
        newOptions.filename = path;
        if (plugin) {
            const m = this.parseFileSync(path, (_c = options === null || options === void 0 ? void 0 : options.jsc) === null || _c === void 0 ? void 0 : _c.parser);
            return this.transformSync(plugin(m), newOptions);
        }
        return bindings.transformFileSync(path, /* isModule */ false, toBuffer(newOptions));
    }
    bundle(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!bindings && !!fallbackBindings) {
                throw new Error('Fallback bindings does not support this interface yet.');
            }
            else if (!bindings) {
                throw new Error('Bindings not found.');
            }
            const opts = yield (0, spack_1.compileBundleOptions)(options);
            if (Array.isArray(opts)) {
                const all = yield Promise.all(opts.map((opt) => __awaiter(this, void 0, void 0, function* () {
                    return this.bundle(opt);
                })));
                let obj = {};
                for (const o of all) {
                    obj = Object.assign(Object.assign({}, obj), o);
                }
                return obj;
            }
            return bindings.bundle(toBuffer(Object.assign({}, opts)));
        });
    }
}
exports.Compiler = Compiler;
const compiler = new Compiler();
function parse(src, options) {
    return compiler.parse(src, options);
}
exports.parse = parse;
function parseSync(src, options) {
    return compiler.parseSync(src, options);
}
exports.parseSync = parseSync;
function parseFile(path, options) {
    return compiler.parseFile(path, options);
}
exports.parseFile = parseFile;
function parseFileSync(path, options) {
    return compiler.parseFileSync(path, options);
}
exports.parseFileSync = parseFileSync;
function print(m, options) {
    return compiler.print(m, options);
}
exports.print = print;
function printSync(m, options) {
    return compiler.printSync(m, options);
}
exports.printSync = printSync;
function transform(src, options) {
    return compiler.transform(src, options);
}
exports.transform = transform;
function transformSync(src, options) {
    return compiler.transformSync(src, options);
}
exports.transformSync = transformSync;
function transformFile(path, options) {
    return compiler.transformFile(path, options);
}
exports.transformFile = transformFile;
function transformFileSync(path, options) {
    return compiler.transformFileSync(path, options);
}
exports.transformFileSync = transformFileSync;
function bundle(options) {
    return compiler.bundle(options);
}
exports.bundle = bundle;
function minify(src, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        return compiler.minify(src, opts);
    });
}
exports.minify = minify;
function minifySync(src, opts) {
    return compiler.minifySync(src, opts);
}
exports.minifySync = minifySync;
/**
 * Configure custom trace configuration runs for a process lifecycle.
 * Currently only chromium's trace event format is supported.
 * (https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/preview)
 *
 * This should be called before calling any binding interfaces exported in `@swc/core`, such as
 * `transform*`, or `parse*` or anything. To avoid breaking changes, each binding fn internally
 * sets default trace subscriber if not set.
 *
 * Unlike other configuration, this does not belong to individual api surface using swcrc
 * or api's parameters (`transform(..., {trace})`). This is due to current tracing subscriber
 * can be configured only once for the global scope. Calling `registerGlobalTraceConfig` multiple
 * time won't cause error, subsequent calls will be ignored.
 *
 * As name implies currently this is experimental interface may change over time without semver
 * major breaking changes. Please provide feedbacks,
 * or bug report at https://github.com/swc-project/swc/discussions.
 */
function __experimental_registerGlobalTraceConfig(traceConfig) {
    // Do not raise error if binding doesn't exists - fallback binding will not support
    // this ever.
    if (bindings) {
        if (traceConfig.type === 'traceEvent') {
            bindings.initCustomTraceSubscriber(traceConfig.fileName);
        }
    }
}
exports.__experimental_registerGlobalTraceConfig = __experimental_registerGlobalTraceConfig;
/**
 * @ignore
 *
 * Returns current binary's metadata to determine which binary is actually loaded.
 *
 * This is undocumented interface, does not guarantee stability across `@swc/core`'s semver
 * as internal representation may change anytime. Use it with caution.
 */
function getBinaryMetadata() {
    return {
        target: bindings ? bindings === null || bindings === void 0 ? void 0 : bindings.getTargetTriple() : undefined
    };
}
exports.getBinaryMetadata = getBinaryMetadata;
exports.DEFAULT_EXTENSIONS = Object.freeze([
    ".js",
    ".jsx",
    ".es6",
    ".es",
    ".mjs",
    ".ts",
    ".tsx",
    ".cts",
    ".mts"
]);
function toBuffer(t) {
    return Buffer.from(JSON.stringify(t));
}

}, function(modId) {var map = {"./spack":1768876401559,"./binding":1768876401560,"./package.json":1768876401561}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401559, function(require, module, exports) {

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.compileBundleOptions = exports.isLocalFile = void 0;
const path = __importStar(require("path"));
exports.isLocalFile = /^\.{0,2}\//; // starts with '/' './' '../'
function compileBundleOptions(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const f = config === undefined ? '.' : config;
        try {
            const filepath = typeof f === 'string' ? f : 'spack.config.js';
            const fileModule = exports.isLocalFile.test(filepath) ? path.resolve(filepath) : filepath;
            let configFromFile = require(fileModule);
            if (configFromFile.default) {
                configFromFile = configFromFile.default;
            }
            if (Array.isArray(configFromFile)) {
                if (Array.isArray(f)) {
                    return [...configFromFile, ...f];
                }
                if (typeof f !== 'string') {
                    configFromFile.push(f);
                }
                return configFromFile;
            }
            return Object.assign(Object.assign({}, configFromFile), (typeof config === 'string') ? {} : config);
        }
        catch (e) {
            if (typeof f === 'string') {
                throw new Error(`Error occurred while loading config file at ${config}: ${e}`);
            }
            return f;
        }
    });
}
exports.compileBundleOptions = compileBundleOptions;
/**
 * Usage: In `spack.config.js` / `spack.config.ts`, you can utilize type annotations (to get autocompletions) like
 *
 * ```ts
 * import { config } from '@swc/core/spack';
 *
 * export default config({
 *      name: 'web',
 * });
 * ```
 *
 *
 *
 */
function config(c) {
    return c;
}
exports.config = config;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401560, function(require, module, exports) {

/* tslint:disable */
/* eslint-disable */
/* prettier-ignore */
/* auto-generated by NAPI-RS */
const { existsSync, readFileSync } = require('fs');
const { join } = require('path');
const { platform, arch } = process;
let nativeBinding = null;
let localFileExisted = false;
let loadError = null;
function isMusl() {
    // For Node 10
    if (!process.report || typeof process.report.getReport !== 'function') {
        try {
            const lddPath = require('child_process').execSync('which ldd').toString().trim();
            return readFileSync(lddPath, 'utf8').includes('musl');
        }
        catch (e) {
            return true;
        }
    }
    else {
        const { glibcVersionRuntime } = process.report.getReport().header;
        return !glibcVersionRuntime;
    }
}
switch (platform) {
    case 'android':
        switch (arch) {
            case 'arm64':
                localFileExisted = existsSync(join(__dirname, 'swc.android-arm64.node'));
                try {
                    if (localFileExisted) {
                        nativeBinding = require('./swc.android-arm64.node');
                    }
                    else {
                        nativeBinding = require('@swc/core-android-arm64');
                    }
                }
                catch (e) {
                    loadError = e;
                }
                break;
            case 'arm':
                localFileExisted = existsSync(join(__dirname, 'swc.android-arm-eabi.node'));
                try {
                    if (localFileExisted) {
                        nativeBinding = require('./swc.android-arm-eabi.node');
                    }
                    else {
                        nativeBinding = require('@swc/core-android-arm-eabi');
                    }
                }
                catch (e) {
                    loadError = e;
                }
                break;
            default:
                throw new Error(`Unsupported architecture on Android ${arch}`);
        }
        break;
    case 'win32':
        switch (arch) {
            case 'x64':
                localFileExisted = existsSync(join(__dirname, 'swc.win32-x64-msvc.node'));
                try {
                    if (localFileExisted) {
                        nativeBinding = require('./swc.win32-x64-msvc.node');
                    }
                    else {
                        nativeBinding = require('@swc/core-win32-x64-msvc');
                    }
                }
                catch (e) {
                    loadError = e;
                }
                break;
            case 'ia32':
                localFileExisted = existsSync(join(__dirname, 'swc.win32-ia32-msvc.node'));
                try {
                    if (localFileExisted) {
                        nativeBinding = require('./swc.win32-ia32-msvc.node');
                    }
                    else {
                        nativeBinding = require('@swc/core-win32-ia32-msvc');
                    }
                }
                catch (e) {
                    loadError = e;
                }
                break;
            case 'arm64':
                localFileExisted = existsSync(join(__dirname, 'swc.win32-arm64-msvc.node'));
                try {
                    if (localFileExisted) {
                        nativeBinding = require('./swc.win32-arm64-msvc.node');
                    }
                    else {
                        nativeBinding = require('@swc/core-win32-arm64-msvc');
                    }
                }
                catch (e) {
                    loadError = e;
                }
                break;
            default:
                throw new Error(`Unsupported architecture on Windows: ${arch}`);
        }
        break;
    case 'darwin':
        localFileExisted = existsSync(join(__dirname, 'swc.darwin-universal.node'));
        try {
            if (localFileExisted) {
                nativeBinding = require('./swc.darwin-universal.node');
            }
            else {
                nativeBinding = require('@swc/core-darwin-universal');
            }
            break;
        }
        catch (_a) { }
        switch (arch) {
            case 'x64':
                localFileExisted = existsSync(join(__dirname, 'swc.darwin-x64.node'));
                try {
                    if (localFileExisted) {
                        nativeBinding = require('./swc.darwin-x64.node');
                    }
                    else {
                        nativeBinding = require('@swc/core-darwin-x64');
                    }
                }
                catch (e) {
                    loadError = e;
                }
                break;
            case 'arm64':
                localFileExisted = existsSync(join(__dirname, 'swc.darwin-arm64.node'));
                try {
                    if (localFileExisted) {
                        nativeBinding = require('./swc.darwin-arm64.node');
                    }
                    else {
                        nativeBinding = require('@swc/core-darwin-arm64');
                    }
                }
                catch (e) {
                    loadError = e;
                }
                break;
            default:
                throw new Error(`Unsupported architecture on macOS: ${arch}`);
        }
        break;
    case 'freebsd':
        if (arch !== 'x64') {
            throw new Error(`Unsupported architecture on FreeBSD: ${arch}`);
        }
        localFileExisted = existsSync(join(__dirname, 'swc.freebsd-x64.node'));
        try {
            if (localFileExisted) {
                nativeBinding = require('./swc.freebsd-x64.node');
            }
            else {
                nativeBinding = require('@swc/core-freebsd-x64');
            }
        }
        catch (e) {
            loadError = e;
        }
        break;
    case 'linux':
        switch (arch) {
            case 'x64':
                if (isMusl()) {
                    localFileExisted = existsSync(join(__dirname, 'swc.linux-x64-musl.node'));
                    try {
                        if (localFileExisted) {
                            nativeBinding = require('./swc.linux-x64-musl.node');
                        }
                        else {
                            nativeBinding = require('@swc/core-linux-x64-musl');
                        }
                    }
                    catch (e) {
                        loadError = e;
                    }
                }
                else {
                    localFileExisted = existsSync(join(__dirname, 'swc.linux-x64-gnu.node'));
                    try {
                        if (localFileExisted) {
                            nativeBinding = require('./swc.linux-x64-gnu.node');
                        }
                        else {
                            nativeBinding = require('@swc/core-linux-x64-gnu');
                        }
                    }
                    catch (e) {
                        loadError = e;
                    }
                }
                break;
            case 'arm64':
                if (isMusl()) {
                    localFileExisted = existsSync(join(__dirname, 'swc.linux-arm64-musl.node'));
                    try {
                        if (localFileExisted) {
                            nativeBinding = require('./swc.linux-arm64-musl.node');
                        }
                        else {
                            nativeBinding = require('@swc/core-linux-arm64-musl');
                        }
                    }
                    catch (e) {
                        loadError = e;
                    }
                }
                else {
                    localFileExisted = existsSync(join(__dirname, 'swc.linux-arm64-gnu.node'));
                    try {
                        if (localFileExisted) {
                            nativeBinding = require('./swc.linux-arm64-gnu.node');
                        }
                        else {
                            nativeBinding = require('@swc/core-linux-arm64-gnu');
                        }
                    }
                    catch (e) {
                        loadError = e;
                    }
                }
                break;
            case 'arm':
                localFileExisted = existsSync(join(__dirname, 'swc.linux-arm-gnueabihf.node'));
                try {
                    if (localFileExisted) {
                        nativeBinding = require('./swc.linux-arm-gnueabihf.node');
                    }
                    else {
                        nativeBinding = require('@swc/core-linux-arm-gnueabihf');
                    }
                }
                catch (e) {
                    loadError = e;
                }
                break;
            default:
                throw new Error(`Unsupported architecture on Linux: ${arch}`);
        }
        break;
    default:
        throw new Error(`Unsupported OS: ${platform}, architecture: ${arch}`);
}
if (!nativeBinding) {
    if (loadError) {
        throw loadError;
    }
    throw new Error(`Failed to load native binding`);
}
const { bundle, minify, minifySync, parse, parseSync, parseFileSync, parseFile, print, printSync, transform, transformSync, transformFile, transformFileSync, getTargetTriple, initCustomTraceSubscriber, Compiler } = nativeBinding;
module.exports.bundle = bundle;
module.exports.minify = minify;
module.exports.minifySync = minifySync;
module.exports.parse = parse;
module.exports.parseSync = parseSync;
module.exports.parseFileSync = parseFileSync;
module.exports.parseFile = parseFile;
module.exports.print = print;
module.exports.printSync = printSync;
module.exports.transform = transform;
module.exports.transformSync = transformSync;
module.exports.transformFile = transformFile;
module.exports.transformFileSync = transformFileSync;
module.exports.getTargetTriple = getTargetTriple;
module.exports.initCustomTraceSubscriber = initCustomTraceSubscriber;
module.exports.Compiler = Compiler;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401561, function(require, module, exports) {
module.exports = {
  "name": "@swc/core",
  "version": "1.3.96",
  "description": "Super-fast alternative for babel",
  "homepage": "https://swc.rs",
  "main": "./index.js",
  "author": "강동윤 <kdy1997.dev@gmail.com>",
  "license": "Apache-2.0",
  "keywords": [
    "swc",
    "swcpack",
    "babel",
    "typescript",
    "rust",
    "webpack",
    "tsc"
  ],
  "engines": {
    "node": ">=10"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/swc-project/swc.git"
  },
  "bugs": {
    "url": "https://github.com/swc-project/swc/issues"
  },
  "napi": {
    "name": "swc",
    "triples": {
      "defaults": true,
      "additional": [
        "x86_64-unknown-linux-musl",
        "i686-pc-windows-msvc",
        "aarch64-unknown-linux-gnu",
        "armv7-unknown-linux-gnueabihf",
        "aarch64-apple-darwin",
        "aarch64-unknown-linux-musl",
        "aarch64-pc-windows-msvc"
      ]
    }
  },
  "publishConfig": {
    "registry": "https://registry.npmjs.org/",
    "access": "public"
  },
  "types": "./index.d.ts",
  "scripts": {
    "changelog": "git cliff --output CHANGELOG.md",
    "setup": "husky install && git config feature.manyFiles true && node ./crates/swc_ecma_preset_env/scripts/copy-data.js",
    "postinstall": "node postinstall.js",
    "artifacts": "napi artifacts --dist scripts/npm",
    "prepublishOnly": "tsc -d && napi prepublish -p scripts/npm --tagstyle npm",
    "pack": "wasm-pack",
    "build:ts": "tsc -d",
    "build:wasm": "npm-run-all \"pack -- build ./bindings/binding_core_wasm --scope swc {1} -t {2} --features plugin\" --",
    "build": "tsc -d && napi build --platform --cargo-name binding_core_node --js ./node-swc/src/binding.js --dts ./node-swc/src/binding.d.ts --cargo-cwd ./bindings -p binding_core_node --release",
    "build:dev": "tsc -d && napi build --platform --cargo-name binding_core_node --js ./node-swc/src/binding.js --dts ./node-swc/src/binding.d.ts --cargo-cwd ./bindings -p binding_core_node",
    "test": "cross-env NODE_OPTIONS='--experimental-vm-modules' jest --config ./node-swc/jest.config.js",
    "version": "napi version -p scripts/npm"
  },
  "lint-staged": {
    "*.toml": [
      "taplo format"
    ],
    "*.rs": [
      "rustfmt --"
    ],
    "*.json": [
      "prettier --write"
    ],
    "!(**/tests/**/*)*.js": [
      "prettier --write"
    ],
    "!(**/tests/**/*)*.ts": [
      "prettier --write"
    ],
    "!(**/tests/**/*)*.jsx": [
      "prettier --write"
    ],
    "!(**/tests/**/*)*.tsx": [
      "prettier --write"
    ]
  },
  "devDependencies": {
    "@babel/compat-data": "^7.23.2",
    "@babel/core": "^7.13.16",
    "@babel/generator": "^7.18.13",
    "@babel/plugin-proposal-class-properties": "^7.13.0",
    "@babel/plugin-proposal-decorators": "^7.13.15",
    "@babel/plugin-proposal-object-rest-spread": "^7.13.8",
    "@babel/preset-env": "^7.13.15",
    "@babel/preset-react": "^7.13.13",
    "@babel/preset-typescript": "^7.13.0",
    "@babel/types": "^7.14.0",
    "@napi-rs/cli": "^2.14.1",
    "@swc/core": "=1.2.220",
    "@swc/helpers": "^0.5.0",
    "@swc/plugin-jest": "latest",
    "@taplo/cli": "^0.3.2",
    "@types/jest": "^28.1.4",
    "@types/node": "^20.5.0",
    "@types/terser": "^3.12.0",
    "acorn": "^8.6.0",
    "acorn-jsx": "^5.3.2",
    "axios": "^0.21.1",
    "babel-plugin-transform-node-env-inline": "^0.4.3",
    "benchmark": "^2.1.4",
    "bootstrap": "^5.2.1",
    "class-validator": "^0.13.1",
    "core-js": "^2.6.11",
    "core-js-compat": "^3.33.1",
    "cross-env": "^7.0.3",
    "cspell": "^5.12.3",
    "expect": "^27.4.2",
    "glob": "^8.0.3",
    "husky": "^7.0.2",
    "jest": "^28.1.2",
    "js-beautify": "^1.14.3",
    "lint-staged": "^12.3.6",
    "lodash": "^4.17.21",
    "mocha": "^9.1.3",
    "npm-run-all": "^4.1.5",
    "prettier": "^2.6.2",
    "progress": "^2.0.3",
    "prop-types": "^15.7.2",
    "react": "^17.0.2",
    "reflect-metadata": "^0.1.13",
    "regenerator-runtime": "^0.13.9",
    "source-map": "^0.7.3",
    "source-map-support": "^0.5.19",
    "sourcemap-validator": "^2.1.0",
    "swc-plugin-coverage-instrument": "^0.0.12",
    "terser": "^5.7.1",
    "ts-node": "^10.5.0",
    "typescript": "^4.5.2"
  },
  "peerDependencies": {
    "@swc/helpers": "^0.5.0"
  },
  "peerDependenciesMeta": {
    "@swc/helpers": {
      "optional": true
    }
  },
  "funding": {
    "type": "opencollective",
    "url": "https://opencollective.com/swc"
  },
  "optionalDependencies": {
    "@swc/core-win32-x64-msvc": "1.3.96",
    "@swc/core-darwin-x64": "1.3.96",
    "@swc/core-linux-x64-gnu": "1.3.96",
    "@swc/core-linux-x64-musl": "1.3.96",
    "@swc/core-win32-ia32-msvc": "1.3.96",
    "@swc/core-linux-arm64-gnu": "1.3.96",
    "@swc/core-linux-arm-gnueabihf": "1.3.96",
    "@swc/core-darwin-arm64": "1.3.96",
    "@swc/core-linux-arm64-musl": "1.3.96",
    "@swc/core-win32-arm64-msvc": "1.3.96"
  },
  "files": [
    "CHANGELOG.md",
    "Visitor.d.ts",
    "index.d.ts",
    "spack.js",
    "util.d.ts",
    "LICENSE",
    "Visitor.js",
    "binding.d.ts",
    "index.js",
    "types.d.ts",
    "util.js",
    "README.md",
    "binding.js",
    "package.json",
    "spack.d.ts",
    "types.js",
    "postinstall.js",
    "bindings/binding_core_wasm/pkg/binding_core_wasm.d.ts"
  ],
  "packageManager": "yarn@3.5.0",
  "dependencies": {
    "@swc/counter": "^0.1.1",
    "@swc/types": "^0.1.5"
  }
}
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768876401558);
})()
//miniprogram-npm-outsideDeps=["path","@swc/types","assert","@swc/wasm","fs","child_process","./swc.android-arm64.node","@swc/core-android-arm64","./swc.android-arm-eabi.node","@swc/core-android-arm-eabi","./swc.win32-x64-msvc.node","@swc/core-win32-x64-msvc","./swc.win32-ia32-msvc.node","@swc/core-win32-ia32-msvc","./swc.win32-arm64-msvc.node","@swc/core-win32-arm64-msvc","./swc.darwin-universal.node","@swc/core-darwin-universal","./swc.darwin-x64.node","@swc/core-darwin-x64","./swc.darwin-arm64.node","@swc/core-darwin-arm64","./swc.freebsd-x64.node","@swc/core-freebsd-x64","./swc.linux-x64-musl.node","@swc/core-linux-x64-musl","./swc.linux-x64-gnu.node","@swc/core-linux-x64-gnu","./swc.linux-arm64-musl.node","@swc/core-linux-arm64-musl","./swc.linux-arm64-gnu.node","@swc/core-linux-arm64-gnu","./swc.linux-arm-gnueabihf.node","@swc/core-linux-arm-gnueabihf"]
//# sourceMappingURL=index.js.map