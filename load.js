
var _ = require('lodash');
var requireAll = require('require-all');


function load(router, options) {
  if (_.isString(options))
    options = {dirname: options};

  return requireAll(_.defaults(options, {
    filter: /(.*Controller)\.js$/,
    recursive: true,
    resolve: function (Controller) {
      var c = new (Controller.__esModule ? Controller.default : Controller)();
      c.register && c.register(router);
      return c;
    }
  }));
}


module.exports = load;
