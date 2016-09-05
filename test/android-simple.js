"use strict";

var wd = require("wd");
var driver = require('../helpers/common/androiddriver');
var util = require('../helpers/util').init(wd);

var desired = {
  appPackage: 'com.github.android_app_bootstrap',
  appActivity: '.activity.WelcomeActivity',
  appWaitActivity: ".activity.WelcomeActivity"
};

before(function (done) {
  driver.init(function () {
    done();
  });
});

describe("android simple", function () {
  var browser;
  this.timeout(60000);

  before(function () {
    browser = driver.start(desired);
  });

  after(function () {
    return browser
      .quit();
  });

  it("login", function () {
    return browser
      .elementById('com.github.android_app_bootstrap:id/mobileNoEditText')
      .sendKeys('12345678')
      .sleep(1000)
      .elementById('com.github.android_app_bootstrap:id/codeEditText')
      .sendKeys('111111')
      .sleep(1000)
      .elementById('com.github.android_app_bootstrap:id/login_button')
      .tap()
      .androidMem(desired.appPackage).then(function (m) {
        console.log('Meminfo: ' + m);
      })
      .sleep(2000)
  });

  it("click in list", function () {
    return browser
      .elementByClassName('android.widget.Button')
      .tap()
      .sleep(3000)
  });

  it("swipe and back", function () {
    return browser
      .swipeToUp()
      .deviceKeyEvent(4)
      .sleep(2000)
  });

  it("webview", function () {
    return browser
      .elementByXPath('//android.widget.TextView[contains(@text,"Webview")]')
      .tap()
      .sleep(2000)
      .elementByAccessibilityId('pushView')
      .tap()
      .elementByAccessibilityId('setTitle')
      .tap()
      .sleep(2000)
      .elementByAccessibilityId('popView')
      .tap()
      .androidCPU(desired.appPackage).then(function (c) {
        console.log('CPU: ' + c);
      })
  });

  it("go to personal", function () {
    return browser
      .elementByXPath('//android.widget.TextView[contains(@text,"PERSONAL")]')
      .tap()
      .androidPerfPin(desired.appPackage).then(function (p) {
        console.log('performance：' + JSON.stringify(p));
      })
      .sleep(2000)
  });

  it("logout", function () {
    return browser
      .elementById('com.github.android_app_bootstrap:id/logout_button')
      .click()
  });
});