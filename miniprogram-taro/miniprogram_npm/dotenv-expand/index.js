module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768876402335, function(require, module, exports) {


function _interpolate (envValue, environment, config) {
  const matches = envValue.match(/(.?\${*[\w]*(?::-[\w/]*)?}*)/g) || []

  return matches.reduce(function (newEnv, match, index) {
    const parts = /(.?)\${*([\w]*(?::-[\w/]*)?)?}*/g.exec(match)
    if (!parts || parts.length === 0) {
      return newEnv
    }

    const prefix = parts[1]

    let value, replacePart

    if (prefix === '\\') {
      replacePart = parts[0]
      value = replacePart.replace('\\$', '$')
    } else {
      const keyParts = parts[2].split(':-')
      const key = keyParts[0]
      replacePart = parts[0].substring(prefix.length)
      // process.env value 'wins' over .env file's value
      value = Object.prototype.hasOwnProperty.call(environment, key)
        ? environment[key]
        : (config.parsed[key] || keyParts[1] || '')

      // If the value is found, remove nested expansions.
      if (keyParts.length > 1 && value) {
        const replaceNested = matches[index + 1]
        matches[index + 1] = ''

        newEnv = newEnv.replace(replaceNested, '')
      }
      // Resolve recursive interpolations
      value = _interpolate(value, environment, config)
    }

    return newEnv.replace(replacePart, value)
  }, envValue)
}

function expand (config) {
  // if ignoring process.env, use a blank object
  const environment = config.ignoreProcessEnv ? {} : process.env

  for (const configKey in config.parsed) {
    const value = Object.prototype.hasOwnProperty.call(environment, configKey) ? environment[configKey] : config.parsed[configKey]

    config.parsed[configKey] = _interpolate(value, environment, config)
  }

  for (const processKey in config.parsed) {
    environment[processKey] = config.parsed[processKey]
  }

  return config
}

module.exports.expand = expand

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768876402335);
})()
//miniprogram-npm-outsideDeps=[]
//# sourceMappingURL=index.js.map