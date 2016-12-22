# express-decorators

**NOTE: this has been rewritten for version 1, with some breaking changes**

Provides decorators for easily wiring up controller classes to [express.js](http://expressjs.com/) routes.  If you you use [hapijs](http://hapijs.com) and want something similar, then the [hapi-decorators](https://github.com/knownasilya/hapi-decorators) project has you covered.

TypeScript definitions are built in.

## Installation

    $ npm install --save express-decorators

## Example

```js
import * as web from 'express-decorators';
import myMiddlewareFunction from './middleware';
import express from 'express';

/*** define a controller class ***/

@web.basePath('/hello')
public class TestController {
  constructor(target) {
    this.target = target;
  }

  @web.get('/world', myMiddlewareFunction)
  async sayHelloAction(request, response) {
    response.send(`hello, ${this.target}`);
  }

  @web.use()
  async otherMiddleware(request, response, next) {
    // this will get called for every action
  }
}

/*** install the routes in an express app ***/
let app = express();
let test = new TestController('world');
web.register(app, test);

/*** now we can go to  /hello/world and get 'hello, world' back! ***/
```

## Notes

 * actions are called with the correct context (i.e. `this` is an instance of the class)
 * actions can return promises (or be `async` methods) and errors will get handled properly


## API

### `basePath(path: string)`

Class decorator to add a base path to every route defined in the class.

### `middleware(fn: Middleware)`

If `fn` is a function, then the function is added as route-specific middleware for the action.  Note that the middleware will be bound to the controller instance.

If `fn` is a string, then the method with that name will be exectued as route-specific middleware when the action is invoked.


### `route(method: string, path: string, middleware: Middleware[])`

Marks the method as a handler for the specified path and http method.  The `route` parameter is just passed straight to the relevant express method, so whatever is valid there is valid here.

There are shortcuts for the methods below.  I.e., instead of `route('get', '/')` you can use `get('/')`.

 * `all`
 * `delete` (called `del` so it compiles)
 * `get`
 * `options`
 * `param`
 * `patch`
 * `post`
 * `put`
 * `use`

### `getRoutes(target: Object): Route[]`

Gets the route metadata for the target object.  Paths are automatically prefixed with a base path if one was defined.

### `register(router: Express.Router, target: Object)`

Registers the routes found on the target object with an express Router instance.

## Questions, comments?

Please feel free to start an issue or offer a pull request.
