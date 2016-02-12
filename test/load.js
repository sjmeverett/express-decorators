
import express from 'express';
import load from '../load';
import supertest from 'supertest-as-promised';
import {expect} from 'chai';

describe('express-decorators/load', function () {
  let app;

  beforeEach(function () {
    app = express();
  });


  it('should load the controllers', async function () {
    let controllers = load(app, __dirname + '/controllers');
    expect(controllers.TestController).to.exist;

    let response = await supertest(app)
      .get('/test')
      .expect(200);

    expect(response.text).to.equal('test');
  });


  it('should let you specify other options', async function () {
    let controllers = load(app, {dirname: __dirname + '/controllers', filter: /(.+)Controller\.js$/});
    expect(controllers.Test).to.exist;

    let response = await supertest(app)
      .get('/test')
      .expect(200);

    expect(response.text).to.equal('test');
  });
});
