"use strict";

var wd = require('wd');
var Q = require('q');

function swipeToUp() {
    return Q.all([
        this.getWindowSize()
    ]).then(function (res) {
        var size = res[0];
        var opts = {
            startX: size.width / 2,
            startY: size.height * 3 / 4,
            endX: size.width / 2,
            endY: size.height / 4,
            duration: 1000
        };

        var action = new wd.TouchAction(this);
        action
            .press({ x: opts.startX, y: opts.startY })
            .wait(opts.duration)
            .moveTo({ x: opts.endX, y: opts.endY })
            .release();

        return action.perform();
    }.bind(this));
};

function swipeToDown() {
    return Q.all([
        this.getWindowSize()
    ]).then(function (res) {
        var size = res[0];
        var opts = {
            startX: size.width / 2,
            startY: size.height / 4,
            endX: size.width / 2,
            endY: size.height * 3 / 4,
            duration: 1000
        };

        var action = new wd.TouchAction(this);
        action
            .press({ x: opts.startX, y: opts.startY })
            .wait(opts.duration)
            .moveTo({ x: opts.endX, y: opts.endY })
            .release();

        return action.perform();
    }.bind(this));
};

function swipeToLeft() {
    return Q.all([
        this.getWindowSize()
    ]).then(function (res) {
        var size = res[0];
        var opts = {
            startX: size.width * 3 / 4,
            startY: size.height / 2,
            endX: size.width / 4,
            endY: size.height / 2,
            duration: 1000
        };

        var action = new wd.TouchAction(this);
        action
            .press({ x: opts.startX, y: opts.startY })
            .wait(opts.duration)
            .moveTo({ x: opts.endX, y: opts.endY })
            .release();

        return action.perform();
    }.bind(this));
};

function swipeToRight() {
    return Q.all([
        this.getWindowSize()
    ]).then(function (res) {
        var size = res[0];
        var opts = {
            startX: size.width / 4,
            startY: size.height / 2,
            endX: size.width * 3 / 4,
            endY: size.height / 2,
            duration: 1000
        };

        var action = new wd.TouchAction(this);
        action
            .press({ x: opts.startX, y: opts.startY })
            .wait(opts.duration)
            .moveTo({ x: opts.endX, y: opts.endY })
            .release();

        return action.perform();
    }.bind(this));
};

function swipe(opts) {
    var action = new wd.TouchAction();
    action
        .press({ x: opts.startX, y: opts.startY })
        .wait(opts.duration)
        .moveTo({ x: opts.endX, y: opts.endY })
        .release();

    return this.performTouchAction(action);
};

function pinch(el) {
    return Q.all([
        el.getSize(),
        el.getLocation(),
    ]).then(function (res) {
        var size = res[0];
        var loc = res[1];
        var center = {
            x: loc.x + size.width / 2,
            y: loc.y + size.height / 2
        };
        var a1 = new wd.TouchAction(this);
        a1.press({ el: el, x: center.x, y: center.y - 100 }).moveTo({ el: el }).release();
        var a2 = new wd.TouchAction(this);
        a2.press({ el: el, x: center.x, y: center.y + 100 }).moveTo({ el: el }).release();
        var m = new wd.MultiAction(this);
        m.add(a1, a2);

        return m.perform();
    }.bind(this));
};

function zoom(el) {
    return Q.all([
        this.getWindowSize(),
        this.getLocation(el),
    ]).then(function (res) {
        var size = res[0];
        var loc = res[1];
        var center = {
            x: loc.x + size.width / 2,
            y: loc.y + size.height / 2
        };
        var a1 = new wd.TouchAction(this);
        a1.press({ el: el }).moveTo({ el: el, x: center.x, y: center.y - 100 }).release();
        var a2 = new wd.TouchAction(this);
        a2.press({ el: el }).moveTo({ el: el, x: center.x, y: center.y + 100 }).release();
        var m = new wd.MultiAction(this);
        m.add(a1, a2);

        return m.perform();
    }.bind(this));
};

exports.init = function (driver) {
    driver.addPromiseChainMethod('pinch', pinch);
    driver.addPromiseChainMethod('zoom', zoom);
    driver.addPromiseChainMethod('swipe', swipe);
    driver.addPromiseChainMethod('swipeToUp', swipeToUp);
    driver.addPromiseChainMethod('swipeToDown', swipeToDown);
    driver.addPromiseChainMethod('swipeToLeft', swipeToLeft);
    driver.addPromiseChainMethod('swipeToRight', swipeToRight);
}