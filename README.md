express-decorators
==================

Provides decorators for easily wiring up controller classes to [express.js](http://expressjs.com/) routes.

Installation
------------

`npm install --save express-decorators`

Example
-------

```js

import * as web from 'express-decorators';
import myMiddlewareFunction from './middlware';
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
}

/*** install the routes in an express router ***/
let router = express.Router();
let test = new TestController('world');
test.register(router);

/*** use the router in an application ***/
// (test.baseUrl is '/hello', i.e., the value passed into the controller decorator)
app.use(test.baseUrl, router);


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


Questions, comments?
--------------------

Please feel free to start an issue or offer a pull request.
