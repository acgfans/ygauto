var should = require('chai').should();
var supertest = require('supertest');
var api = supertest.agent('http://localhost:9001/api');

describe('api simple', function () {
  it('Should return a 200 response', function (done) {
    api.post('/user/login')
      .send({ "loginname": 'lianghao', "password": 'bGgxMjM0' })
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200, done);
  });

  it('respond with json', function (done) {
    api.get('/machine/pv')
      .end(function (err, res) {
        if (!err || res.ok) {
          //console.log(JSON.stringify(res.body));
        }

        done();
      })
  });
});