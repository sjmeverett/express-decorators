
var _ = require('lodash');
var debugRoutes = require('debug')('express-decorators:routes');
var debugHandlers = require('debug')('express-decorators:handlers');

// list of methods express supports
var methods = [
  'all', 'checkout', 'connect', 'copy', 'delete', 'get', 'head', 'lock', 'merge', 'mkactivity', 'mkcol', 'move',
  'm-search', 'notify', 'options', 'param', 'patch', 'post', 'propfind', 'proppatch', 'purge', 'put', 'report',
  'search', 'subscribe', 'trace', 'unlock', 'unsubscribe'
];

function trimslash(s) {
  return s[s.length - 1] === '/'
    ? s.slice(0, s.length - 1)
    : s;
}


function controller(baseUrl) {
  return function (target) {
    target.prototype.baseUrl = baseUrl;

    target.prototype.register = function (router) {
      if (this.routes) {
        var context = this;

        for (var k in this.routes) {
          var route = this.routes[k];

          var args = route.handlers.map(function (handler) {
            return function (request, response, next) {
              debugHandlers(route.method.toUpperCase() + ' ' + (url ? url + ' ' : '')
                + handler.name);

              var result = handler.apply(context, arguments);

              if (typeof result !== 'undefined' && result !== null && typeof result.then === 'function') {
                result.then(undefined, next);
              }
            };
          });

          var url = route.path;

          if (route.method !== 'param' && _.isString(url)) {
            url = trimslash(this.baseUrl) + trimslash(url);
          }

          debugRoutes(route.method.toUpperCase() + ' ' + (url ? url + ' ' : '')
            + route.handlers[route.handlers.length - 1].name)

          if (url) {
            args.unshift(url);
          }

          router[route.method].apply(router, args);
        }
      }
    };
  };
};


function setRoute(target, key, value) {
  if (!target.routes) {
    target.routes = {};
  }

  target.routes[key] = _.merge(target.routes[key] || {}, value, function (a, b) {
    if (_.isArray(a)) {
      return a.concat(b);
    }
  });
}


function route(method, path) {
  return function (target, key, descriptor) {
    setRoute(target, key, {method: method, path: path, handlers: [descriptor.value]});
    return descriptor;
  };
};


function use(target, key, descriptor) {
  if (typeof target !== 'undefined' && typeof key !== 'undefined') {
    setRoute(target, key, {method: 'use', handlers: [descriptor.value]});
    return descriptor;
  } else {
    return route('use', target);
  }
}


function middleware(fn) {
  if (typeof fn === 'string') {
    // var is tricky, unlike let, hence the extra utility function
    var name = fn;

    fn = function (request, response, next) {
      if (!this[name]) {
        throw new Error('middleware could not find function this.' + name);

      } else {
        return this[name](request, response, next);
      }
    }
  }

  return _middleware(fn);
};


function _middleware(fn) {
  return function (target, key, descriptor) {
    setRoute(target, key, {handlers: [fn]});
    return descriptor;
  };
}


module.exports.controller = controller;
module.exports.route = route;
module.exports.middleware = middleware;

methods.forEach(function (method) {
  module.exports[method] = route.bind(null, method);
});

module.exports.use = use;
