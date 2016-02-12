
import * as web from '../../index';

@web.controller('/test')
export default class TestController {
  constructor() {
  }

  @web.get('/')
  indexAction(request, response) {
    response.send('test');
  }
};
