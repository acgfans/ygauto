"use strict";

var wd = require("wd");
var driver = require('../helpers/webdriver');

before(function (done) {
  driver.init(function () {
    done();
  });
});

describe("web simple", function () {
  var browser;
  this.timeout(60000);

  before(function () {
    browser = driver.start();
  });

  after(function () {
    return browser
      .quit();
		});

  it("open url", function () {
    return browser
      .get("https://www.baidu.com")
      .sleep(3000)
  });

  it("search", function () {
    return browser
      .elementById('kw')
      .type('ygsoft')
      .sleep(3000)
      .elementById('su')
      .click()
  });

  it.skip('wait', function () {
  });

  it("screenshot", function () {
    return browser
      .saveScreenshot('path')
  });
});