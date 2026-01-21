module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768876401607, function(require, module, exports) {
module.exports = require('./dist/index.js')

module.exports.default = module.exports

}, function(modId) {var map = {"./dist/index.js":1768876401608}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401608, function(require, module, exports) {

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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSwcRegister = exports.npm = exports.injectDefineConfigHeader = exports.createBabelRegister = exports.createDebug = exports.chokidar = exports.swc = void 0;
exports.swc = __importStar(require("@swc/core"));
exports.chokidar = __importStar(require("chokidar"));
const createDebug = (id) => require('debug')(id);
exports.createDebug = createDebug;
var babelRegister_1 = require("./babelRegister");
Object.defineProperty(exports, "createBabelRegister", { enumerable: true, get: function () { return __importDefault(babelRegister_1).default; } });
Object.defineProperty(exports, "injectDefineConfigHeader", { enumerable: true, get: function () { return babelRegister_1.injectDefineConfigHeader; } });
__exportStar(require("./constants"), exports);
__exportStar(require("./dotenv"), exports);
__exportStar(require("./esbuild"), exports);
exports.npm = __importStar(require("./npm"));
var swcRegister_1 = require("./swcRegister");
Object.defineProperty(exports, "createSwcRegister", { enumerable: true, get: function () { return __importDefault(swcRegister_1).default; } });
__exportStar(require("./terminal"), exports);
__exportStar(require("./utils"), exports);
//# sourceMappingURL=index.js.map
}, function(modId) { var map = {"./babelRegister":1768876401609,"./constants":1768876401610,"./dotenv":1768876401612,"./esbuild":1768876401613,"./npm":1768876401615,"./swcRegister":1768876401617,"./terminal":1768876401611,"./utils":1768876401616}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401609, function(require, module, exports) {

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectDefineConfigHeader = void 0;
const path = __importStar(require("path"));
/**
 * Inject `defineAppConfig` and `definePageConfig`
 * require header at the top of a config file,
 * without the need to specifically require them
 * if they are used
*/
function injectDefineConfigHeader(babel) {
    const appConfig = 'function defineAppConfig(config) { return config }';
    const pageConfig = 'function definePageConfig(config) { return config }';
    const prependHeader = (nodePath, header) => {
        const parsedHeader = babel.parse(header, { filename: '' }).program.body[0];
        nodePath.node.body.unshift(parsedHeader);
    };
    const enterHandler = (nodePath) => {
        const { scope, node } = nodePath;
        scope.traverse(node, {
            CallExpression(p) {
                const callee = p.node.callee;
                // @ts-ignore
                switch (callee.name) {
                    case 'defineAppConfig':
                        return prependHeader(nodePath, appConfig);
                    case 'definePageConfig':
                        return prependHeader(nodePath, pageConfig);
                }
            }
        });
    };
    return {
        visitor: {
            Program: { enter: enterHandler }
        }
    };
}
exports.injectDefineConfigHeader = injectDefineConfigHeader;
function createBabelRegister({ only }) {
    require('@babel/register')({
        only: Array.from(new Set([...only])),
        presets: [
            require.resolve('@babel/preset-env'),
            require.resolve('@babel/preset-typescript')
        ],
        plugins: [
            injectDefineConfigHeader,
            [require.resolve('@babel/plugin-proposal-decorators'), {
                    legacy: true
                }],
            require.resolve('@babel/plugin-proposal-object-rest-spread'),
            [require.resolve('@babel/plugin-transform-runtime'), {
                    corejs: false,
                    helpers: true,
                    regenerator: true,
                    useESModules: false,
                    version: '^7.7.7',
                    absoluteRuntime: path.resolve(__dirname, '..', 'node_modules/@babel/runtime')
                }]
        ],
        extensions: ['.jsx', '.js', '.ts', '.tsx'],
        babelrc: false,
        configFile: false,
        cache: false
    });
}
exports.default = createBabelRegister;
//# sourceMappingURL=babelRegister.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401610, function(require, module, exports) {

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TARO_BASE_CONFIG = exports.TARO_CONFIG_FOLDER = exports.DEFAULT_TEMPLATE_SRC_GITEE = exports.DEFAULT_TEMPLATE_SRC = exports.isWindows = exports.DEVICE_RATIO_NAME = exports.taroJsMobxCommon = exports.taroJsMobx = exports.taroJsRedux = exports.taroJsFramework = exports.taroJsQuickAppComponents = exports.taroJsComponents = exports.META_TYPE = exports.UPDATE_PACKAGE_LIST = exports.FILE_PROCESSOR_MAP = exports.DEVICE_RATIO = exports.PROJECT_CONFIG = exports.NODE_MODULES_REG = exports.NODE_MODULES = exports.CSS_IMPORT_REG = exports.REG_URL = exports.REG_WXML_IMPORT = exports.REG_TEMPLATE = exports.REG_UX = exports.REG_JSON = exports.REG_FONT = exports.REG_IMAGE = exports.REG_MEDIA = exports.REG_CSS = exports.REG_STYLE = exports.REG_STYLUS = exports.REG_LESS = exports.REG_SASS_SCSS = exports.REG_SASS_SASS = exports.REG_SASS = exports.REG_VUE = exports.REG_SCRIPTS = exports.REG_TYPESCRIPT = exports.REG_SCRIPT = exports.REG_JS = exports.VUE_EXT = exports.SCRIPT_EXT = exports.UX_EXT = exports.TS_EXT = exports.JS_EXT = exports.SCSS_EXT = exports.CSS_EXT = exports.processTypeMap = exports.processTypeEnum = exports.PLATFORMS = void 0;
exports.defaultMainFields = exports.FRAMEWORK_MAP = exports.ENTRY = exports.NPM_DIR = exports.TEMP_DIR = exports.SOURCE_DIR = exports.OUTPUT_DIR = exports.TARO_GLOBAL_CONFIG_FILE = exports.TARO_GLOBAL_CONFIG_DIR = void 0;
const os = __importStar(require("os"));
const terminal_1 = require("./terminal");
// eslint-disable-next-line dot-notation
exports.PLATFORMS = global['PLATFORMS'] = global['PLATFORMS'] || {};
var processTypeEnum;
(function (processTypeEnum) {
    processTypeEnum["START"] = "start";
    processTypeEnum["CREATE"] = "create";
    processTypeEnum["COMPILE"] = "compile";
    processTypeEnum["CONVERT"] = "convert";
    processTypeEnum["COPY"] = "copy";
    processTypeEnum["GENERATE"] = "generate";
    processTypeEnum["MODIFY"] = "modify";
    processTypeEnum["ERROR"] = "error";
    processTypeEnum["WARNING"] = "warning";
    processTypeEnum["UNLINK"] = "unlink";
    processTypeEnum["REFERENCE"] = "reference";
    processTypeEnum["REMIND"] = "remind";
})(processTypeEnum = exports.processTypeEnum || (exports.processTypeEnum = {}));
exports.processTypeMap = {
    ["create" /* processTypeEnum.CREATE */]: {
        name: '创建',
        color: 'cyan'
    },
    ["compile" /* processTypeEnum.COMPILE */]: {
        name: '编译',
        color: 'green'
    },
    ["convert" /* processTypeEnum.CONVERT */]: {
        name: '转换',
        color: terminal_1.chalk.rgb(255, 136, 0)
    },
    ["copy" /* processTypeEnum.COPY */]: {
        name: '拷贝',
        color: 'magenta'
    },
    ["generate" /* processTypeEnum.GENERATE */]: {
        name: '生成',
        color: 'blue'
    },
    ["modify" /* processTypeEnum.MODIFY */]: {
        name: '修改',
        color: 'yellow'
    },
    ["error" /* processTypeEnum.ERROR */]: {
        name: '错误',
        color: 'red'
    },
    ["warning" /* processTypeEnum.WARNING */]: {
        name: '警告',
        color: 'yellowBright'
    },
    ["unlink" /* processTypeEnum.UNLINK */]: {
        name: '删除',
        color: 'magenta'
    },
    ["start" /* processTypeEnum.START */]: {
        name: '启动',
        color: 'green'
    },
    ["reference" /* processTypeEnum.REFERENCE */]: {
        name: '引用',
        color: 'blue'
    },
    ["remind" /* processTypeEnum.REMIND */]: {
        name: '提示',
        color: 'green'
    }
};
exports.CSS_EXT = ['.css', '.scss', '.sass', '.less', '.styl', '.stylus', '.wxss', '.acss'];
exports.SCSS_EXT = ['.scss'];
exports.JS_EXT = ['.js', '.jsx'];
exports.TS_EXT = ['.ts', '.tsx'];
exports.UX_EXT = ['.ux'];
exports.SCRIPT_EXT = exports.JS_EXT.concat(exports.TS_EXT);
exports.VUE_EXT = ['.vue'];
exports.REG_JS = /\.js(\?.*)?$/;
exports.REG_SCRIPT = /\.(js|jsx)(\?.*)?$/;
exports.REG_TYPESCRIPT = /\.(tsx|ts)(\?.*)?$/;
exports.REG_SCRIPTS = /\.m?[tj]sx?$/i;
exports.REG_VUE = /\.vue$/i;
exports.REG_SASS = /\.(s[ac]ss)$/;
exports.REG_SASS_SASS = /\.sass$/;
exports.REG_SASS_SCSS = /\.scss$/;
exports.REG_LESS = /\.less$/;
exports.REG_STYLUS = /\.styl(us)?$/;
exports.REG_STYLE = /\.(css|scss|sass|less|styl|stylus|wxss|acss|ttss|jxss|qss)(\?.*)?$/;
exports.REG_CSS = /\.(css|qss|jxss|wxss|acss|ttss)(\?.*)?$/;
exports.REG_MEDIA = /\.(mp4|webm|ogg|mp3|m4a|wav|flac|aac)(\?.*)?$/;
exports.REG_IMAGE = /\.(png|jpe?g|gif|bpm|svg|webp)(\?.*)?$/;
exports.REG_FONT = /\.(woff2?|eot|ttf|otf)(\?.*)?$/;
exports.REG_JSON = /\.json(\?.*)?$/;
exports.REG_UX = /\.ux(\?.*)?$/;
exports.REG_TEMPLATE = /\.(hxml|wxml|axml|ttml|qml|swan|jxml)(\?.*)?$/;
exports.REG_WXML_IMPORT = /<import(.*)?src=(?:(?:'([^']*)')|(?:"([^"]*)"))/gi;
exports.REG_URL = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
exports.CSS_IMPORT_REG = /@import (["'])(.+?)\1;/g;
exports.NODE_MODULES = 'node_modules';
exports.NODE_MODULES_REG = /(.*)node_modules/;
exports.PROJECT_CONFIG = 'config/index';
exports.DEVICE_RATIO = {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
};
exports.FILE_PROCESSOR_MAP = {
    '.js': 'babel',
    '.scss': 'sass',
    '.sass': 'sass',
    '.less': 'less',
    '.styl': 'stylus'
};
exports.UPDATE_PACKAGE_LIST = [
    'babel-plugin-transform-react-jsx-to-rn-stylesheet',
    'taro-css-to-react-native',
    'stylelint-config-taro-rn',
    'stylelint-taro-rn',
    'babel-plugin-transform-taroapi',
    'babel-preset-taro',
    'eslint-config-taro',
    'postcss-html-transform',
    'postcss-plugin-constparse',
    'postcss-pxtransform',
    '@tarojs/shared',
    '@tarojs/taro',
    '@tarojs/cli',
    '@tarojs/api',
    '@tarojs/components',
    '@tarojs/components-react',
    '@tarojs/components-rn',
    '@tarojs/extend',
    '@tarojs/taro-h5',
    '@tarojs/taro-rn',
    '@tarojs/rn-runner',
    '@tarojs/rn-style-transformer',
    '@tarojs/rn-supporter',
    '@tarojs/rn-transformer',
    '@tarojs/helper',
    '@tarojs/taro-loader',
    '@tarojs/mini-runner',
    '@tarojs/react',
    '@tarojs/plugin-framework-react',
    '@tarojs/plugin-framework-vue2',
    '@tarojs/plugin-framework-vue3',
    '@tarojs/plugin-react-devtools',
    '@tarojs/plugin-vue-devtools',
    '@tarojs/router',
    '@tarojs/router-rn',
    '@tarojs/runner-utils',
    '@tarojs/runtime',
    '@tarojs/runtime-rn',
    '@tarojs/service',
    '@tarojs/webpack-runner',
    '@tarojs/with-weapp',
    '@tarojs/taroize',
    '@tarojs/plugin-platform-weapp',
    '@tarojs/plugin-platform-ascf',
    '@tarojs/plugin-platform-alipay',
    '@tarojs/plugin-platform-swan',
    '@tarojs/plugin-platform-tt',
    '@tarojs/plugin-platform-qq',
    '@tarojs/plugin-platform-jd',
    '@tarojs/plugin-platform-h5',
    '@tarojs/plugin-html',
    '@tarojs/plugin-mini-ci',
    '@tarojs/webpack5-runner',
    '@tarojs/webpack5-prebundle',
];
var META_TYPE;
(function (META_TYPE) {
    META_TYPE["ENTRY"] = "ENTRY";
    META_TYPE["PAGE"] = "PAGE";
    META_TYPE["COMPONENT"] = "COMPONENT";
    META_TYPE["NORMAL"] = "NORMAL";
    META_TYPE["STATIC"] = "STATIC";
    META_TYPE["CONFIG"] = "CONFIG";
    META_TYPE["EXPORTS"] = "EXPORTS";
})(META_TYPE = exports.META_TYPE || (exports.META_TYPE = {}));
exports.taroJsComponents = '@tarojs/components';
exports.taroJsQuickAppComponents = '@tarojs/components-qa';
exports.taroJsFramework = '@tarojs/taro';
exports.taroJsRedux = '@tarojs/redux';
exports.taroJsMobx = '@tarojs/mobx';
exports.taroJsMobxCommon = '@tarojs/mobx-common';
exports.DEVICE_RATIO_NAME = 'deviceRatio';
exports.isWindows = os.platform() === 'win32';
exports.DEFAULT_TEMPLATE_SRC = 'github:NervJS/taro-project-templates#v3.6-rs';
exports.DEFAULT_TEMPLATE_SRC_GITEE = 'direct:https://gitee.com/o2team/taro-project-templates.git#v3.6-rs';
exports.TARO_CONFIG_FOLDER = '.taro3.6-rs';
exports.TARO_BASE_CONFIG = 'index.json';
exports.TARO_GLOBAL_CONFIG_DIR = '.taro-global-config';
exports.TARO_GLOBAL_CONFIG_FILE = 'index.json';
exports.OUTPUT_DIR = 'dist';
exports.SOURCE_DIR = 'src';
exports.TEMP_DIR = '.temp';
exports.NPM_DIR = 'npm';
exports.ENTRY = 'app';
var FRAMEWORK_MAP;
(function (FRAMEWORK_MAP) {
    FRAMEWORK_MAP["VUE"] = "vue";
    FRAMEWORK_MAP["VUE3"] = "vue3";
    FRAMEWORK_MAP["REACT"] = "react";
    FRAMEWORK_MAP["NERV"] = "nerv";
})(FRAMEWORK_MAP = exports.FRAMEWORK_MAP || (exports.FRAMEWORK_MAP = {}));
exports.defaultMainFields = ['browser', 'module', 'jsnext:main', 'main'];
//# sourceMappingURL=constants.js.map
}, function(modId) { var map = {"./terminal":1768876401611}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401611, function(require, module, exports) {

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.terminalLink = exports.chalk = void 0;
const ansi_escapes_1 = __importDefault(require("ansi-escapes"));
const chalk_1 = __importDefault(require("chalk"));
exports.chalk = chalk_1.default;
const supports_hyperlinks_1 = __importDefault(require("supports-hyperlinks"));
function terminalLink(text, url, { target = 'stdout', fallback } = {}) {
    if (!supports_hyperlinks_1.default[target]) {
        if (fallback === false)
            return text;
        return typeof fallback === 'function' ? fallback(text, url) : `${text} (\u200B${url}\u200B)`;
    }
    return ansi_escapes_1.default.link(text, url);
}
exports.terminalLink = terminalLink;
terminalLink.isSupported = supports_hyperlinks_1.default.stdout;
terminalLink.stderr = ((text, url, options = {}) => terminalLink(text, url, Object.assign({ target: 'stderr' }, options)));
terminalLink.stderr.isSupported = supports_hyperlinks_1.default.stderr;
//# sourceMappingURL=terminal.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401612, function(require, module, exports) {

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchEnv = exports.dotenvParse = exports.formatPrefix = void 0;
const dotenv_1 = require("dotenv");
const dotenv_expand_1 = require("dotenv-expand");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
// 支持 --env-prefix=TARO_APP_,aa 类型参数
const formatPrefix = (prefixs = ['TARO_APP_']) => {
    const prefixsArr = (Array.isArray(prefixs) ? prefixs : prefixs.split(',')).map(prefix => prefix.trim()).filter(prefix => !!prefix);
    return prefixsArr;
};
exports.formatPrefix = formatPrefix;
const dotenvParse = (root, prefixs = ['TARO_APP_'], mode) => {
    const prefixsArr = (0, exports.formatPrefix)(prefixs);
    const envFiles = new Set([
        /** default file */ `.env`,
        /** local file */ `.env.local`,
    ]);
    if (mode) {
        envFiles.add(/** mode file */ `.env.${mode}`);
        envFiles.add(/** mode local file */ `.env.${mode}.local`);
    }
    let parseTemp = {};
    const load = envPath => {
        // file doesn'et exist
        if (!fs.existsSync(envPath))
            return;
        const env = (0, dotenv_1.parse)(fs.readFileSync(envPath));
        parseTemp = Object.assign(Object.assign({}, parseTemp), env);
    };
    envFiles.forEach(envPath => {
        load(path.resolve(root, envPath));
    });
    const parsed = {};
    Object.entries(parseTemp).forEach(([key, value]) => {
        if (prefixsArr.some(prefix => key.startsWith(prefix)) || ['TARO_APP_ID'].includes(key)) {
            parsed[key] = value;
        }
    });
    (0, dotenv_expand_1.expand)({ parsed });
    return parsed;
};
exports.dotenvParse = dotenvParse;
// 扩展 env
const patchEnv = (config, expandEnv) => {
    const expandEnvStringify = {};
    for (const key in expandEnv) {
        expandEnvStringify[key] = JSON.stringify(expandEnv[key]);
    }
    return Object.assign(Object.assign({}, config.env), expandEnvStringify);
};
exports.patchEnv = patchEnv;
//# sourceMappingURL=dotenv.js.map
}, function(modId) { var map = {"dotenv":1768876401612}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401613, function(require, module, exports) {

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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.esbuild = exports.requireWithEsbuild = exports.defaultEsbuildLoader = void 0;
const core_1 = require("@swc/core");
const esbuild_1 = __importDefault(require("esbuild"));
exports.esbuild = esbuild_1.default;
const lodash_1 = require("lodash");
const require_from_string_1 = __importDefault(require("require-from-string"));
const constants_1 = require("../constants");
exports.defaultEsbuildLoader = {
    '.js': 'tsx',
    '.jsx': 'tsx',
    '.ts': 'tsx'
};
/** 基于 esbuild 的 require 实现 */
function requireWithEsbuild(id, { customConfig = {}, customSwcConfig = {}, cwd = process.cwd() } = {}) {
    const { outputFiles = [] } = esbuild_1.default.buildSync((0, lodash_1.defaults)((0, lodash_1.omit)(customConfig, ['alias', 'define', 'loader', 'plugins']), {
        platform: 'node',
        absWorkingDir: cwd,
        bundle: true,
        define: (0, lodash_1.defaults)(customConfig.define, {
            // AMD 被 esbuild 转 ESM 后，是套着 ESM 外皮的 AMD 语法模块。
            // Webpack HarmonyDetectionParserPlugin 会阻止 AMDDefineDependencyParserPlugin 对这些模块的处理。
            // 导致这些模块报错（如 lodash）。目前的办法是把 define 置为 false，不支持 AMD 导出。
            define: 'false'
        }),
        alias: Object.fromEntries(Object.entries(customConfig.alias || {}).filter(([key]) => !key.startsWith('/'))),
        entryPoints: [id],
        format: 'esm',
        loader: (0, lodash_1.defaults)(customConfig.loader, exports.defaultEsbuildLoader),
        mainFields: constants_1.defaultMainFields,
        write: false
    }));
    // Note: esbuild.buildSync 模式下不支持引入插件，所以这里需要手动转换
    const { code = '' } = (0, core_1.transformSync)(outputFiles[0].text, (0, lodash_1.defaults)(customSwcConfig, {
        jsc: { target: 'es2015' },
    }));
    return (0, require_from_string_1.default)(code, id);
}
exports.requireWithEsbuild = requireWithEsbuild;
__exportStar(require("./utils"), exports);
//# sourceMappingURL=index.js.map
}, function(modId) { var map = {"../constants":1768876401610,"./utils":1768876401614}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401614, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.externalEsbuildModule = void 0;
const path_1 = require("path");
function externalEsbuildModule({ path, namespace, importer, pluginData }) {
    if (namespace === 'file' && importer && path) {
        path = (0, path_1.resolve)(importer, path);
    }
    return {
        path,
        namespace,
        pluginData,
        external: true
    };
}
exports.externalEsbuildModule = externalEsbuildModule;
//# sourceMappingURL=utils.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401615, function(require, module, exports) {

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
exports.getNpmPkg = exports.getNpmPkgSync = exports.callPluginSync = exports.callPlugin = exports.installNpmPkg = exports.resolveNpmSync = exports.resolveNpm = exports.taroPluginPrefix = void 0;
const terminal_1 = require("./terminal");
const Util = __importStar(require("./utils"));
const PEERS = /UNMET PEER DEPENDENCY ([a-z\-0-9.]+)@(.+)/gm;
const npmCached = {};
const erroneous = [];
const defaultInstallOptions = {
    dev: false,
    peerDependencies: true
};
exports.taroPluginPrefix = '@tarojs/plugin-';
function resolveNpm(pluginName, root) {
    const resolvePath = require('resolve');
    if (!npmCached[pluginName]) {
        return new Promise((resolve, reject) => {
            resolvePath(`${pluginName}`, { basedir: root }, (err, res) => {
                if (err) {
                    return reject(err);
                }
                npmCached[pluginName] = res;
                resolve(res || '');
            });
        });
    }
    return Promise.resolve(npmCached[pluginName]);
}
exports.resolveNpm = resolveNpm;
function resolveNpmSync(pluginName, root) {
    const resolvePath = require('resolve');
    try {
        if (!npmCached[pluginName]) {
            const res = resolvePath.sync(pluginName, { basedir: root });
            return res;
        }
        return npmCached[pluginName];
    }
    catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
            console.log(terminal_1.chalk.cyan(`缺少npm包${pluginName}，开始安装...`));
            const installOptions = {
                dev: false
            };
            if (pluginName.indexOf(exports.taroPluginPrefix) >= 0) {
                installOptions.dev = true;
            }
            installNpmPkg(pluginName, installOptions);
            return resolveNpmSync(pluginName, root);
        }
        return '';
    }
}
exports.resolveNpmSync = resolveNpmSync;
function installNpmPkg(pkgList, options) {
    if (!pkgList) {
        return;
    }
    if (!Array.isArray(pkgList)) {
        pkgList = [pkgList];
    }
    pkgList = pkgList.filter(dep => {
        return erroneous.indexOf(dep) === -1;
    });
    if (!pkgList.length) {
        return;
    }
    options = Object.assign({}, defaultInstallOptions, options);
    let installer = '';
    let args = [];
    if (Util.shouldUseYarn()) {
        installer = 'yarn';
    }
    else if (Util.shouldUseCnpm()) {
        installer = 'cnpm';
    }
    else {
        installer = 'npm';
    }
    if (Util.shouldUseYarn()) {
        args = ['add'].concat(pkgList).filter(Boolean);
        args.push('--silent', '--no-progress');
        if (options.dev) {
            args.push('-D');
        }
    }
    else {
        args = ['install'].concat(pkgList).filter(Boolean);
        args.push('--silent', '--no-progress');
        if (options.dev) {
            args.push('--save-dev');
        }
        else {
            args.push('--save');
        }
    }
    const spawn = require('cross-spawn');
    const output = spawn.sync(installer, args, {
        stdio: ['ignore', 'pipe', 'inherit']
    });
    if (output.status) {
        pkgList.forEach(dep => {
            erroneous.push(dep);
        });
    }
    let matches = null;
    const peers = [];
    while ((matches = PEERS.exec(output.stdout))) {
        const pkg = matches[1];
        const version = matches[2];
        if (version.match(' ')) {
            peers.push(pkg);
        }
        else {
            peers.push(`${pkg}@${version}`);
        }
    }
    if (options.peerDependencies && peers.length) {
        console.info('正在安装 peerDependencies...');
        installNpmPkg(peers, options);
    }
    return output;
}
exports.installNpmPkg = installNpmPkg;
const callPlugin = (pluginName, content, file, config, root) => __awaiter(void 0, void 0, void 0, function* () {
    const pluginFn = yield getNpmPkg(`${exports.taroPluginPrefix}${pluginName}`, root);
    return pluginFn(content, file, config);
});
exports.callPlugin = callPlugin;
const callPluginSync = (pluginName, content, file, config, root) => {
    const pluginFn = getNpmPkgSync(`${exports.taroPluginPrefix}${pluginName}`, root);
    return pluginFn(content, file, config);
};
exports.callPluginSync = callPluginSync;
function getNpmPkgSync(npmName, root) {
    const npmPath = resolveNpmSync(npmName, root);
    const npmFn = require(npmPath);
    return npmFn;
}
exports.getNpmPkgSync = getNpmPkgSync;
function getNpmPkg(npmName, root) {
    return __awaiter(this, void 0, void 0, function* () {
        let npmPath;
        try {
            npmPath = resolveNpmSync(npmName, root);
        }
        catch (err) {
            if (err.code === 'MODULE_NOT_FOUND') {
                console.log(terminal_1.chalk.cyan(`缺少npm包${npmName}，开始安装...`));
                const installOptions = {
                    dev: false
                };
                if (npmName.indexOf(exports.taroPluginPrefix) >= 0) {
                    installOptions.dev = true;
                }
                installNpmPkg(npmName, installOptions);
                npmPath = yield resolveNpm(npmName, root);
            }
        }
        const npmFn = require(npmPath);
        return npmFn;
    });
}
exports.getNpmPkg = getNpmPkg;
//# sourceMappingURL=npm.js.map
}, function(modId) { var map = {"./terminal":1768876401611,"./utils":1768876401616}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401616, function(require, module, exports) {

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
exports.fs = exports.readConfig = exports.readPageConfig = exports.removeHeadSlash = exports.getModuleDefaultExport = exports.addPlatforms = exports.extnameExpRegOf = exports.readDirWithFileTypes = exports.getAllFilesInFolder = exports.unzip = exports.applyArrayedVisitors = exports.mergeVisitors = exports.recursiveMerge = exports.getInstalledNpmPkgVersion = exports.getInstalledNpmPkgPath = exports.pascalCase = exports.emptyDirectory = exports.cssImports = exports.generateConstantsList = exports.getNpmPackageAbsolutePath = exports.generateEnvList = exports.resolveScriptPath = exports.resolveMainFilePath = exports.isEmptyObject = exports.shouldUseCnpm = exports.shouldUseYarn = exports.getSystemUsername = exports.getConfig = exports.getTaroPath = exports.getUserHomeDir = exports.recursiveFindNodeModules = exports.printLog = exports.resolveStylePath = exports.promoteRelativePath = exports.replaceAliasPath = exports.isAliasPath = exports.isQuickAppPkg = exports.isNpmPkg = exports.isNodeModule = exports.normalizePath = void 0;
const child_process = __importStar(require("child_process"));
const fs = __importStar(require("fs-extra"));
exports.fs = fs;
const lodash_1 = require("lodash");
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const constants_1 = require("./constants");
const esbuild_1 = require("./esbuild");
const terminal_1 = require("./terminal");
const execSync = child_process.execSync;
function normalizePath(path) {
    return path.replace(/\\/g, '/').replace(/\/{2,}/g, '/');
}
exports.normalizePath = normalizePath;
const isNodeModule = (filename) => constants_1.NODE_MODULES_REG.test(filename);
exports.isNodeModule = isNodeModule;
function isNpmPkg(name) {
    if (/^(\.|\/)/.test(name)) {
        return false;
    }
    return true;
}
exports.isNpmPkg = isNpmPkg;
function isQuickAppPkg(name) {
    return /^@(system|service)\.[a-zA-Z]{1,}/.test(name);
}
exports.isQuickAppPkg = isQuickAppPkg;
function isAliasPath(name, pathAlias = {}) {
    const prefixes = Object.keys(pathAlias);
    if (prefixes.length === 0) {
        return false;
    }
    return prefixes.includes(name) || (new RegExp(`^(${prefixes.join('|')})/`).test(name));
}
exports.isAliasPath = isAliasPath;
function replaceAliasPath(filePath, name, pathAlias = {}) {
    // 后续的 path.join 在遇到符号链接时将会解析为真实路径，如果
    // 这里的 filePath 没有做同样的处理，可能会导致 import 指向
    // 源代码文件，导致文件被意外修改
    filePath = fs.realpathSync(filePath);
    const prefixes = Object.keys(pathAlias);
    if (prefixes.includes(name)) {
        return promoteRelativePath(path.relative(filePath, fs.realpathSync(resolveScriptPath(pathAlias[name]))));
    }
    const reg = new RegExp(`^(${prefixes.join('|')})/(.*)`);
    name = name.replace(reg, function (_m, $1, $2) {
        return promoteRelativePath(path.relative(filePath, path.join(pathAlias[$1], $2)));
    });
    return name;
}
exports.replaceAliasPath = replaceAliasPath;
function promoteRelativePath(fPath) {
    const fPathArr = fPath.split(path.sep);
    let dotCount = 0;
    fPathArr.forEach(item => {
        if (item.indexOf('..') >= 0) {
            dotCount++;
        }
    });
    if (dotCount === 1) {
        fPathArr.splice(0, 1, '.');
        return fPathArr.join('/');
    }
    if (dotCount > 1) {
        fPathArr.splice(0, 1);
        return fPathArr.join('/');
    }
    return normalizePath(fPath);
}
exports.promoteRelativePath = promoteRelativePath;
function resolveStylePath(p) {
    const realPath = p;
    const removeExtPath = p.replace(path.extname(p), '');
    const taroEnv = process.env.TARO_ENV;
    for (let i = 0; i < constants_1.CSS_EXT.length; i++) {
        const item = constants_1.CSS_EXT[i];
        if (taroEnv) {
            if (fs.existsSync(`${removeExtPath}.${taroEnv}${item}`)) {
                return `${removeExtPath}.${taroEnv}${item}`;
            }
        }
        if (fs.existsSync(`${p}${item}`)) {
            return `${p}${item}`;
        }
    }
    return realPath;
}
exports.resolveStylePath = resolveStylePath;
function printLog(type, tag, filePath) {
    const typeShow = constants_1.processTypeMap[type];
    const tagLen = tag.replace(/[\u0391-\uFFE5]/g, 'aa').length;
    const tagFormatLen = 8;
    if (tagLen < tagFormatLen) {
        const rightPadding = new Array(tagFormatLen - tagLen + 1).join(' ');
        tag += rightPadding;
    }
    const padding = '';
    filePath = filePath || '';
    if (typeof typeShow.color === 'string') {
        console.log(terminal_1.chalk[typeShow.color](typeShow.name), padding, tag, padding, filePath);
    }
    else {
        console.log(typeShow.color(typeShow.name), padding, tag, padding, filePath);
    }
}
exports.printLog = printLog;
function recursiveFindNodeModules(filePath, lastFindPath) {
    const findWorkspaceRoot = require('find-yarn-workspace-root');
    if (lastFindPath && (normalizePath(filePath) === normalizePath(lastFindPath))) {
        return filePath;
    }
    const dirname = path.dirname(filePath);
    const workspaceRoot = findWorkspaceRoot(dirname);
    const nodeModules = path.join(workspaceRoot || dirname, 'node_modules');
    if (fs.existsSync(nodeModules)) {
        return nodeModules;
    }
    if (dirname.split(path.sep).length <= 1) {
        printLog("error" /* processTypeEnum.ERROR */, `在${dirname}目录下`, '未找到node_modules文件夹，请先安装相关依赖库！');
        return nodeModules;
    }
    return recursiveFindNodeModules(dirname, filePath);
}
exports.recursiveFindNodeModules = recursiveFindNodeModules;
function getUserHomeDir() {
    function homedir() {
        const env = process.env;
        const home = env.HOME;
        const user = env.LOGNAME || env.USER || env.LNAME || env.USERNAME;
        if (process.platform === 'win32') {
            return env.USERPROFILE || '' + env.HOMEDRIVE + env.HOMEPATH || home || '';
        }
        if (process.platform === 'darwin') {
            return home || (user ? '/Users/' + user : '');
        }
        if (process.platform === 'linux') {
            return home || (process.getuid() === 0 ? '/root' : (user ? '/home/' + user : ''));
        }
        return home || '';
    }
    return typeof os.homedir === 'function' ? os.homedir() : homedir();
}
exports.getUserHomeDir = getUserHomeDir;
function getTaroPath() {
    const taroPath = path.join(getUserHomeDir(), constants_1.TARO_CONFIG_FOLDER);
    if (!fs.existsSync(taroPath)) {
        fs.ensureDirSync(taroPath);
    }
    return taroPath;
}
exports.getTaroPath = getTaroPath;
function getConfig() {
    const configPath = path.join(getTaroPath(), 'config.json');
    if (fs.existsSync(configPath)) {
        return require(configPath);
    }
    return {};
}
exports.getConfig = getConfig;
function getSystemUsername() {
    const userHome = getUserHomeDir();
    const systemUsername = process.env.USER || path.basename(userHome);
    return systemUsername;
}
exports.getSystemUsername = getSystemUsername;
function shouldUseYarn() {
    try {
        execSync('yarn --version', { stdio: 'ignore' });
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.shouldUseYarn = shouldUseYarn;
function shouldUseCnpm() {
    try {
        execSync('cnpm --version', { stdio: 'ignore' });
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.shouldUseCnpm = shouldUseCnpm;
function isEmptyObject(obj) {
    if (obj == null) {
        return true;
    }
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}
exports.isEmptyObject = isEmptyObject;
function resolveMainFilePath(p, extArrs = constants_1.SCRIPT_EXT) {
    if (p.startsWith('pages/') || p === 'app.config') {
        return p;
    }
    const realPath = p;
    const taroEnv = process.env.TARO_ENV;
    for (let i = 0; i < extArrs.length; i++) {
        const item = extArrs[i];
        if (taroEnv) {
            if (fs.existsSync(`${p}.${taroEnv}${item}`)) {
                return `${p}.${taroEnv}${item}`;
            }
            if (fs.existsSync(`${p}${path.sep}index.${taroEnv}${item}`)) {
                return `${p}${path.sep}index.${taroEnv}${item}`;
            }
            if (fs.existsSync(`${p.replace(/\/index$/, `.${taroEnv}/index`)}${item}`)) {
                return `${p.replace(/\/index$/, `.${taroEnv}/index`)}${item}`;
            }
        }
        if (fs.existsSync(`${p}${item}`)) {
            return `${p}${item}`;
        }
        if (fs.existsSync(`${p}${path.sep}index${item}`)) {
            return `${p}${path.sep}index${item}`;
        }
    }
    // 存在多端页面但是对应的多端页面配置不存在时，使用该页面默认配置
    if (taroEnv && path.parse(p).base.endsWith(`.${taroEnv}.config`)) {
        const idx = p.lastIndexOf(`.${taroEnv}.config`);
        return resolveMainFilePath(p.slice(0, idx) + '.config');
    }
    return realPath;
}
exports.resolveMainFilePath = resolveMainFilePath;
function resolveScriptPath(p) {
    return resolveMainFilePath(p);
}
exports.resolveScriptPath = resolveScriptPath;
function generateEnvList(env) {
    const res = {};
    if (env && !isEmptyObject(env)) {
        for (const key in env) {
            try {
                res[`process.env.${key}`] = JSON.parse(env[key]);
            }
            catch (err) {
                res[`process.env.${key}`] = env[key];
            }
        }
    }
    return res;
}
exports.generateEnvList = generateEnvList;
/**
 * 获取 npm 文件或者依赖的绝对路径
 *
 * @param {string} 参数1 - 组件路径
 * @param {string} 参数2 - 文件扩展名
 * @returns {string} npm 文件绝对路径
 */
function getNpmPackageAbsolutePath(npmPath, defaultFile = 'index') {
    try {
        let packageName = '';
        let componentRelativePath = '';
        const packageParts = npmPath.split(path.sep);
        // 获取 npm 包名和指定的包文件路径
        // taro-loader/path/index => packageName = taro-loader, componentRelativePath = path/index
        // @tarojs/runtime/path/index => packageName = @tarojs/runtime, componentRelativePath = path/index
        if (npmPath.startsWith('@')) {
            packageName = packageParts.slice(0, 2).join(path.sep);
            componentRelativePath = packageParts.slice(2).join(path.sep);
        }
        else {
            packageName = packageParts[0];
            componentRelativePath = packageParts.slice(1).join(path.sep);
        }
        // 没有指定的包文件路径统一使用 defaultFile
        componentRelativePath || (componentRelativePath = defaultFile);
        // require.resolve 解析的路径会包含入口文件路径，通过正则过滤一下
        const match = require.resolve(packageName).match(new RegExp('.*' + packageName));
        if (!(match === null || match === void 0 ? void 0 : match.length))
            return null;
        const packagePath = match[0];
        return path.join(packagePath, `./${componentRelativePath}`);
    }
    catch (error) {
        return null;
    }
}
exports.getNpmPackageAbsolutePath = getNpmPackageAbsolutePath;
function generateConstantsList(constants) {
    const res = {};
    if (constants && !isEmptyObject(constants)) {
        for (const key in constants) {
            if ((0, lodash_1.isPlainObject)(constants[key])) {
                res[key] = generateConstantsList(constants[key]);
            }
            else {
                try {
                    res[key] = JSON.parse(constants[key]);
                }
                catch (err) {
                    res[key] = constants[key];
                }
            }
        }
    }
    return res;
}
exports.generateConstantsList = generateConstantsList;
function cssImports(content) {
    let match;
    const results = [];
    content = String(content).replace(/\/\*.+?\*\/|\/\/.*(?=[\n\r])/g, '');
    while ((match = constants_1.CSS_IMPORT_REG.exec(content))) {
        results.push(match[2]);
    }
    return results;
}
exports.cssImports = cssImports;
/*eslint-disable*/
const retries = (process.platform === 'win32') ? 100 : 1;
function emptyDirectory(dirPath, opts = { excludes: [] }) {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach(file => {
            const curPath = path.join(dirPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                let removed = false;
                let i = 0; // retry counter
                do {
                    try {
                        const excludes = Array.isArray(opts.excludes) ? opts.excludes : [opts.excludes];
                        const canRemove = !excludes.length ||
                            !excludes.some((item) => typeof item === 'string' ? curPath.indexOf(item) >= 0 : item.test(curPath));
                        if (canRemove) {
                            emptyDirectory(curPath);
                            fs.rmdirSync(curPath);
                        }
                        removed = true;
                    }
                    catch (e) {
                    }
                    finally {
                        if (++i < retries) {
                            continue;
                        }
                    }
                } while (!removed);
            }
            else {
                fs.unlinkSync(curPath);
            }
        });
    }
}
exports.emptyDirectory = emptyDirectory;
/* eslint-enable */
const pascalCase = (str) => str.charAt(0).toUpperCase() + (0, lodash_1.camelCase)(str.substr(1));
exports.pascalCase = pascalCase;
function getInstalledNpmPkgPath(pkgName, basedir) {
    const resolvePath = require('resolve');
    try {
        return resolvePath.sync(`${pkgName}/package.json`, { basedir });
    }
    catch (err) {
        return null;
    }
}
exports.getInstalledNpmPkgPath = getInstalledNpmPkgPath;
function getInstalledNpmPkgVersion(pkgName, basedir) {
    const pkgPath = getInstalledNpmPkgPath(pkgName, basedir);
    if (!pkgPath) {
        return null;
    }
    return fs.readJSONSync(pkgPath).version;
}
exports.getInstalledNpmPkgVersion = getInstalledNpmPkgVersion;
const recursiveMerge = (src, ...args) => {
    return (0, lodash_1.mergeWith)(src, ...args, (value, srcValue) => {
        const typeValue = typeof value;
        const typeSrcValue = typeof srcValue;
        if (typeValue !== typeSrcValue)
            return;
        if (Array.isArray(value) && Array.isArray(srcValue)) {
            return value.concat(srcValue);
        }
        if (typeValue === 'object') {
            return (0, exports.recursiveMerge)(value, srcValue);
        }
    });
};
exports.recursiveMerge = recursiveMerge;
const mergeVisitors = (src, ...args) => {
    const validFuncs = ['exit', 'enter'];
    return (0, lodash_1.mergeWith)(src, ...args, (value, srcValue, key, object, srcObject) => {
        if (!object.hasOwnProperty(key) || !srcObject.hasOwnProperty(key)) {
            return undefined;
        }
        const shouldMergeToArray = validFuncs.indexOf(key) > -1;
        if (shouldMergeToArray) {
            return (0, lodash_1.flatMap)([value, srcValue]);
        }
        const [newValue, newSrcValue] = [value, srcValue].map(v => {
            if (typeof v === 'function') {
                return {
                    enter: v
                };
            }
            else {
                return v;
            }
        });
        return (0, exports.mergeVisitors)(newValue, newSrcValue);
    });
};
exports.mergeVisitors = mergeVisitors;
const applyArrayedVisitors = obj => {
    let key;
    for (key in obj) {
        const funcs = obj[key];
        if (Array.isArray(funcs)) {
            obj[key] = (astPath, ...args) => {
                funcs.forEach(func => {
                    func(astPath, ...args);
                });
            };
        }
        else if (typeof funcs === 'object') {
            (0, exports.applyArrayedVisitors)(funcs);
        }
    }
    return obj;
};
exports.applyArrayedVisitors = applyArrayedVisitors;
function unzip(zipPath) {
    const Transform = require('stream').Transform;
    const yauzl = require('yauzl');
    return new Promise((resolve, reject) => {
        yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
            if (err || !zipfile)
                throw err;
            zipfile.on('close', () => {
                fs.removeSync(zipPath);
                resolve();
            });
            zipfile.readEntry();
            zipfile.on('error', (err) => {
                reject(err);
            });
            zipfile.on('entry', entry => {
                if (/\/$/.test(entry.fileName)) {
                    const fileNameArr = entry.fileName.replace(/\\/g, '/').split('/');
                    fileNameArr.shift();
                    const fileName = fileNameArr.join('/');
                    fs.ensureDirSync(path.join(path.dirname(zipPath), fileName));
                    zipfile.readEntry();
                }
                else {
                    zipfile.openReadStream(entry, (err, readStream) => {
                        if (err || !readStream)
                            throw err;
                        const filter = new Transform();
                        filter._transform = function (chunk, _encoding, cb) {
                            cb(undefined, chunk);
                        };
                        filter._flush = function (cb) {
                            cb();
                            zipfile.readEntry();
                        };
                        const fileNameArr = normalizePath(entry.fileName).split('/');
                        fileNameArr.shift();
                        const fileName = fileNameArr.join('/');
                        const writeStream = fs.createWriteStream(path.join(path.dirname(zipPath), fileName));
                        writeStream.on('close', () => { });
                        readStream
                            .pipe(filter)
                            .pipe(writeStream);
                    });
                }
            });
        });
    });
}
exports.unzip = unzip;
const getAllFilesInFolder = (folder, filter = []) => __awaiter(void 0, void 0, void 0, function* () {
    let files = [];
    const list = readDirWithFileTypes(folder);
    yield Promise.all(list.map((item) => __awaiter(void 0, void 0, void 0, function* () {
        const itemPath = path.join(folder, item.name);
        if (item.isDirectory) {
            const _files = yield (0, exports.getAllFilesInFolder)(itemPath, filter);
            files = [...files, ..._files];
        }
        else if (item.isFile) {
            if (!filter.find(rule => rule === item.name))
                files.push(itemPath);
        }
    })));
    return files;
});
exports.getAllFilesInFolder = getAllFilesInFolder;
function readDirWithFileTypes(folder) {
    const list = fs.readdirSync(folder);
    const res = list.map(name => {
        const stat = fs.statSync(path.join(folder, name));
        return {
            name,
            isDirectory: stat.isDirectory(),
            isFile: stat.isFile()
        };
    });
    return res;
}
exports.readDirWithFileTypes = readDirWithFileTypes;
function extnameExpRegOf(filePath) {
    return new RegExp(`${path.extname(filePath)}$`);
}
exports.extnameExpRegOf = extnameExpRegOf;
function addPlatforms(platform) {
    const upperPlatform = platform.toLocaleUpperCase();
    if (constants_1.PLATFORMS[upperPlatform])
        return;
    constants_1.PLATFORMS[upperPlatform] = platform;
}
exports.addPlatforms = addPlatforms;
const getModuleDefaultExport = exports => exports.__esModule ? exports.default : exports;
exports.getModuleDefaultExport = getModuleDefaultExport;
function removeHeadSlash(str) {
    return str.replace(/^(\/|\\)/, '');
}
exports.removeHeadSlash = removeHeadSlash;
// converts ast nodes to js object
function exprToObject(node) {
    const types = ['BooleanLiteral', 'StringLiteral', 'NumericLiteral'];
    if (types.includes(node.type)) {
        return node.value;
    }
    if (node.name === 'undefined' && !node.value) {
        return undefined;
    }
    if (node.type === 'NullLiteral') {
        return null;
    }
    if (node.type === 'ObjectExpression') {
        return genProps(node.properties);
    }
    if (node.type === 'ArrayExpression') {
        return node.elements.reduce((acc, el) => [
            ...acc,
            ...(el.type === 'SpreadElement'
                ? exprToObject(el.argument)
                : [exprToObject(el)])
        ], []);
    }
}
// converts ObjectExpressions to js object
function genProps(props) {
    return props.reduce((acc, prop) => {
        if (prop.type === 'SpreadElement') {
            return Object.assign(Object.assign({}, acc), exprToObject(prop.argument));
        }
        else if (prop.type !== 'ObjectMethod') {
            const v = exprToObject(prop.value);
            if (v !== undefined) {
                return Object.assign(Object.assign({}, acc), { [prop.key.name || prop.key.value]: v });
            }
        }
        return acc;
    }, {});
}
// read page config from a sfc file instead of the regular config file
function readSFCPageConfig(configPath) {
    if (!fs.existsSync(configPath))
        return {};
    const sfcSource = fs.readFileSync(configPath, 'utf8');
    const dpcReg = /definePageConfig\(\{[\w\W]+?\}\)/g;
    const matches = sfcSource.match(dpcReg);
    let result = {};
    if (matches && matches.length === 1) {
        const callExprHandler = (p) => {
            const { callee } = p.node;
            if (!callee.name)
                return;
            if (callee.name && callee.name !== 'definePageConfig')
                return;
            const configNode = p.node.arguments[0];
            result = exprToObject(configNode);
            p.stop();
        };
        const configSource = matches[0];
        const babel = require('@babel/core');
        const ast = babel.parse(configSource, { filename: '' });
        babel.traverse(ast.program, { CallExpression: callExprHandler });
    }
    return result;
}
function readPageConfig(configPath) {
    let result = {};
    const extNames = ['.js', '.jsx', '.ts', '.tsx', '.vue'];
    // check source file extension
    extNames.some(ext => {
        const tempPath = configPath.replace('.config', ext);
        if (fs.existsSync(tempPath)) {
            try {
                result = readSFCPageConfig(tempPath);
            }
            catch (error) {
                result = {};
            }
            return true;
        }
    });
    return result;
}
exports.readPageConfig = readPageConfig;
function readConfig(configPath, options = {}) {
    let result = {};
    if (fs.existsSync(configPath)) {
        if (constants_1.REG_JSON.test(configPath)) {
            result = fs.readJSONSync(configPath);
        }
        else {
            result = (0, esbuild_1.requireWithEsbuild)(configPath, {
                customConfig: {
                    define: options.defineConstants || {},
                    alias: options.alias || {},
                },
                customSwcConfig: {
                    jsc: {
                        parser: {
                            syntax: 'typescript',
                            decorators: true
                        },
                        transform: {
                            legacyDecorator: true
                        },
                        experimental: {
                            plugins: [
                                [path.resolve(__dirname, '../swc/swc_plugin_define_config.wasm'), {}]
                            ]
                        }
                    },
                    module: {
                        type: 'commonjs'
                    }
                }
            });
        }
        result = (0, exports.getModuleDefaultExport)(result);
    }
    else {
        result = readPageConfig(configPath);
    }
    return result;
}
exports.readConfig = readConfig;
//# sourceMappingURL=utils.js.map
}, function(modId) { var map = {"./constants":1768876401610,"./esbuild":1768876401613,"./terminal":1768876401611}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768876401617, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
function createSwcRegister({ only, plugins }) {
    const config = {
        only: Array.from(new Set([...only])),
        jsc: {
            parser: {
                syntax: 'typescript',
                decorators: true
            },
            transform: {
                legacyDecorator: true
            }
        },
        module: {
            type: 'commonjs'
        }
    };
    if (plugins) {
        config.jsc.experimental = {
            plugins
        };
    }
    require('@swc/register')(config);
}
exports.default = createSwcRegister;
//# sourceMappingURL=swcRegister.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768876401607);
})()
//miniprogram-npm-outsideDeps=["@swc/core","chokidar","debug","path","@babel/register","os","ansi-escapes","chalk","supports-hyperlinks","dotenv-expand","fs-extra","esbuild","lodash","require-from-string","resolve","cross-spawn","child_process","find-yarn-workspace-root","stream","yauzl","@babel/core","@swc/register"]
//# sourceMappingURL=index.js.map