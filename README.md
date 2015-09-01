express-decorators
==================

Provides decorators for easily wiring up controller classes to [express.js](http://expressjs.com/) routes.  If you you use [hapijs](http://hapijs.com) and want something similar, then the [hapi-decorators](https://github.com/knownasilya/hapi-decorators) project has you covered.

Installation
------------

`npm install --save express-decorators`

Example
-------

```js

import * as web from 'express-decorators';
import myMiddlewareFunction from './middleware';
import express from 'express';

/*** define a controller class ***/

@web.controller('/hello')
public class TestController {
  constructor(target) {
    this.target = target;
  }

  @web.get('/world')
  @web.middleware(myMiddlewareFunction)
  async sayHelloAction(request, response) {
    response.send(`hello, ${this.target}`);
  }

  @web.use
  async otherMiddleware(request, response, next) {
    // this will get called for every action
  }
}

/*** install the routes in an express app ***/
let app = express();
let test = new TestController('world');
test.register(app);

/*** now we can go to  /hello/world and get 'hello, world' back! ***/
```

Notes
-----

 * actions are called with the correct context (i.e. `this` is an instance of the class)
 * actions can return promises (or be `async` methods) and errors will get handled properly


API
---

### `controller(baseUrl)`

Decorates a class as a controller.  Basically, adds `baseUrl` and a `register(router)` method to the prototype.  You can call this method, passing it an express router, and it will put all your registered actions in the router.


### `middleware(fn)`

If `fn` is a function, then the function is added as route-specific middleware for the action.  Note that the middleware will be bound to the controller instance.

If `fn` is a string, then the method with that name will be exectued as route-specific middleware when the action is invoked.


### `route(method, route)`

Registers the action for the specified route (url) and http method.  The `route` parameter is just passed straight to the relevant express method, so whatever is valid there is valid here.

There are shortcuts for all the HTTP methods that express supports, plus `param`, `use` and `all`.  I.e., instead of `route('get', '/')` you can use `get('/')`.  The following is a list of methods supported:

 * `all`
 * `checkout`
 * `connect`
 * `copy`
 * `delete`
 * `get`
 * `head`
 * `lock`
 * `merge`
 * `mkactivity`
 * `mkcol`
 * `move`
 * `m-search`
 * `notify`
 * `options`
 * `param`
 * `patch`
 * `post`
 * `propfind`
 * `proppatch`
 * `purge`
 * `put`
 * `report`
 * `search`
 * `subscribe`
 * `trace`
 * `unlock`
 * `unsubscribe`
 * `use`


Running the tests
-----------------

The tests use [mocha](https://mochajs.org/), and are written in ES6.  The ES6 is transpiled by [babel](https://babeljs.io/).  Run the following:

    $ mocha --compilers js:babel/register

Or simply:

    $ npm test


Debugging
---------

This module uses [debug](https://github.com/visionmedia/debug), so you can turn on tracing of routes created by setting the `DEBUG` environment variable, e.g.:

    $ DEBUG=express-decorators:* node index.js

This will output all the routes created when `register` is called.  For example, the output for the tests is:

```
  express-decorators:routes GET /test indexAction +1ms
  express-decorators:routes PARAM param param +1ms
  express-decorators:routes GET /test/:param paramAction +0ms
  express-decorators:routes GET /test/routemiddleware routeMiddlewareAction +0ms
  express-decorators:routes GET /test/namedmiddleware namedMiddlewareAction +0ms
  express-decorators:routes GET /test/error errorAction +0ms
  express-decorators:routes GET /test/async asyncAction +0ms
  express-decorators:routes USE /test/middleware middleware +0ms
  express-decorators:routes GET /test/middleware middlewareAction +0ms
  express-decorators:routes USE noCallMiddleware +0ms
  express-decorators:routes GET /test/nocallmiddleware noCallMiddlewareAction +0ms
```

This tells you the HTTP method (or `PARAM` for a parameter), the route (or parameter name), and the handler function name.

It also outputs the handlers as they are accessed, e.g.:

```
  express-decorators:handlers GET /test/nocallmiddleware noCallMiddleware +0ms
  express-decorators:handlers GET /test/nocallmiddleware noCallMiddlewareAction +1ms
```

Questions, comments?
--------------------

Please feel free to start an issue or offer a pull request.
