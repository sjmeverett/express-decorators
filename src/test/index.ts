import test from 'ava';
import * as web from '../lib';
import * as express from 'express';
import * as supertest from 'supertest';

test('get', t => {
  class Test {
    @web.get('/test')
    getTest() {}
  }

  let routes = web.getRoutes(new Test());
  t.is(routes.length, 1);

  let route = routes[0];
  t.is(route.key, 'getTest');
  t.is(route.handlers.length, 1);
  t.is(route.method, 'get');
  t.is(route.path, '/test');
});

test('multiple', t => {
  class Test {
    @web.get('/test')
    getTest() {}
    @web.post('/test')
    postTest() {}
  }

  let routes = web.getRoutes(new Test());
  t.is(routes.length, 2);
});

test('basePath', t => {
  @web.basePath('/test')
  class Test {
    @web.get('/foo')
    getTest() {}
  }

  let route = web.getRoutes(new Test())[0];
  t.is(route.path, '/test/foo');
});

test('middleware string', t => {
  @web.basePath('/test')
  class Test {
    @web.middleware('testMiddleware')
    @web.get('/foo')
    getTest() {}

    testMiddleware() {}
  }

  let route = web.getRoutes(new Test())[0];
  t.is(route.path, '/test/foo');
  t.is(route.handlers.length, 2);
});

test('middleware string set in constructor', t => {
  @web.basePath('/test')
  class Test {
    testMiddleware = () => {};

    @web.middleware('testMiddleware')
    @web.get('/foo')
    getTest() {}
  }

  let route = web.getRoutes(new Test())[0];
  t.is(route.path, '/test/foo');
  t.is(route.handlers.length, 2);
});

test('express', async t => {
  @web.basePath('/test')
  class Test {
    bar = 'hello';

    @web.use()
    setup(request, response, next) {
      request.foo = 8;
      t.is(this.bar, 'hello');
      next();
    }

    @web.param('id')
    idParam(request, response, next, id) {
      request.params.id = parseInt(request.params.id);
      t.is(this.bar, 'hello');
      next();
    }

    middleware = (request, response, next) => {
      request.middleware = true;
      next();
    };

    @web.get('/foo/:id', ['middleware'])
    foo(request, response) {
      t.is(request.params.id, 5);
      t.is(request.foo, 8);
      t.is(this.bar, 'hello');
      t.is(request.middleware, true);
      response.send();
    }

    @web.get('/error')
    async error(request, response) {
      throw new Error();
    }
  }

  let app = express();
  let controller = new Test();
  web.register(app, controller);

  app.use((error, request, response, next) => {
    response.status(500).send();
  });

  t.plan(7);

  await supertest(app)
    .get('/test/foo/5')
    .expect(200);

  await supertest(app)
    .get('/test/error')
    .expect(500);
});
