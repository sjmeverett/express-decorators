
import express from 'express';
import supertest from 'supertest-as-promised';
import {expect} from 'chai';
import * as web from '../index';

@web.controller('/test')
class TestController {
  constructor() {
    this.context = 'TestController';
  }

  @web.get('/')
  indexAction(request, response) {
    expect(this.context).to.equal('TestController');
    expect(request.middlewareCalled).to.not.exist;
    response.send('hi');
  }

  @web.param('param')
  param(request, response, next) {
    expect(this.context).to.equal('TestController');
    request.paramCalled = true;
    next();
  }

  @web.get('/param/:param')
  paramAction(request, response) {
    expect(this.context).to.equal('TestController');
    expect(request.paramCalled).to.be.true;
    response.send();
  }

  @web.get('/routemiddleware')
  @web.middleware(function (request, response, next) {
    expect(this.context).to.equal('TestController');
    request.middlewareCalled = true;
    next();
  })
  routeMiddlewareAction(request, response) {
    expect(request.middlewareCalled).to.be.true;
    response.send();
  }

  @web.get('/namedmiddleware')
  @web.middleware('routeMiddleware')
  namedMiddlewareAction(request, response) {
    expect(request.middlewareCalled).to.be.true;
    response.send();
  }

  routeMiddleware(request, response, next) {
    expect(this.context).to.equal('TestController');
    request.middlewareCalled = true;
    next();
  }

  @web.get('/error')
  errorAction(request, response) {
    throw new Error();
  }


  @web.get('/async')
  async asyncAction(request, response) {
    let value = await new Promise(function (resolve, reject) {
      resolve(5);
    });

    expect(value).to.equal(5);
    response.send();
  }

  @web.use('/middleware')
  middleware(request, response, next) {
    expect(this.context).to.equal('TestController');
    request.middlewareCalled = true;
    next();
  }

  @web.get('/middleware')
  middlewareAction(request, response) {
    expect(request.middlewareCalled).to.be.true;
    response.send();
  }

  @web.use
  noCallMiddleware(request, response, next) {
    expect(this.context).to.equal('TestController');
    request.globalMiddlewareCalled = true;
    next();
  }

  @web.get('/nocallmiddleware')
  noCallMiddlewareAction(request, response) {
    expect(request.globalMiddlewareCalled).to.be.true;
    response.send();
  }
}


describe('express-decorators', function () {
  let app;

  beforeEach(function () {
    app = express();

    let controller = new TestController();
    controller.register(app);

    // register a quieter error handler
    app.use(function (err, request, response, next) {
      response.status(500);
      response.send();
    });
  });


  it('should correctly install a route', async function () {
    let response = await supertest(app)
      .get('/test')
      .expect(200);

    expect(response.text).to.equal('hi');
  });


  it('should support parameters', async function () {
    await supertest(app)
      .get('/test/param/test')
      .expect(200);
  });


  it('should support route middleware', async function () {
    await supertest(app)
      .get('/test/routemiddleware')
      .expect(200);
  });


  it('should support named middleware -test', async function () {
    await supertest(app)
      .get('/test/namedmiddleware')
      .expect(200);
  });


  it('should handle errors', async function () {
    await supertest(app)
      .get('/test/error')
      .expect(500);
  });


  it('should support async', async function () {
    await supertest(app)
      .get('/test/async')
      .expect(200);
  });

  it('should support middleware for certain routes', async function () {
    await supertest(app)
      .get('/test/middleware')
      .expect(200);
  });

  it('should support middleware', async function () {
    await supertest(app)
      .get('/test/nocallmiddleware')
      .expect(200);
  });
});
