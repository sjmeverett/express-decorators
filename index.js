
var _ = require('lodash');

// list of methods express supports
var methods = [
  'all', 'checkout', 'connect', 'copy', 'delete', 'get', 'head', 'lock', 'merge', 'mkactivity', 'mkcol', 'move',
  'm-search', 'notify', 'options', 'param', 'patch', 'post', 'propfind', 'proppatch', 'purge', 'put', 'report',
  'search', 'subscribe', 'trace', 'unlock', 'unsubscribe', 'use'
];


function controller(baseUrl) {
  return function (target) {
    target.prototype.baseUrl = baseUrl;

    target.prototype.register = function (router) {
      if (this.routes) {
        var context = this;

        function mapHandler(handler) {
          return function (request, response, next) {
            var result = handler.apply(context, arguments);

            if (typeof result !== 'undefined' && result !== null && typeof result.then === 'function') {
              result.then(undefined, next);
            }
          };
        }

        for (var k in this.routes) {
          var route = this.routes[k];
          var args = route.handlers.map(mapHandler);
          args.unshift(route.route);
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


function route(method, route) {
  return function (target, key, descriptor) {
    setRoute(target, key, {method: method, route: route, handlers: [descriptor.value]});
    return descriptor;
  };
};


methods.forEach(function (method) {
  module.exports[method] = route.bind(null, method);
});


function middleware(middlewareFn) {
  if (typeof middlewareFn === 'string') {
    var name = middlewareFn;

    return middleware(function (request, response, next) {
      if (!this[name]) {
        throw new Error('middleware could not find function this.' + middlewareFn);

      } else {
        return this[name](request, response, next);
      }
    });

  } else {
    return function (target, key, descriptor) {
      setRoute(target, key, {handlers: [middlewareFn]});
      return descriptor;
    };
  }
};

module.exports.controller = controller;
module.exports.route = route;
module.exports.middleware = middleware;
