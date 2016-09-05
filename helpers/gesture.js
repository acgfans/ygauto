"use strict";

var wd = require('wd');

function swipeToUp() {
    return Promise.all([
        this.getWindowSize()
    ]).then(function (res) {
        var size = res[0];
        var action = new wd.TouchAction(this);

        action
            .press({ x: size.width / 2, y: size.height * 3 / 4 })
            .wait(1000)
            .moveTo({ x: size.width / 2, y: size.height / 4 })
            .release();

        return action.perform();
    }.bind(this));
};

function swipeToDown() {
    return Promise.all([
        this.getWindowSize()
    ]).then(function (res) {
        var size = res[0];
        var action = new wd.TouchAction(this);

        action
            .press({ x: size.width / 2, y: size.height / 4 })
            .wait(1000)
            .moveTo({ x: size.width / 2, y: size.height * 3 / 4 })
            .release();

        return action.perform();
    }.bind(this));
};

function swipeToLeft() {
    return Promise.all([
        this.getWindowSize()
    ]).then(function (res) {
        var size = res[0];
        var action = new wd.TouchAction(this);

        action
            .press({ x: size.width * 3 / 4, y: size.height / 2 })
            .wait(1000)
            .moveTo({ x: size.width / 4, y: size.height / 2 })
            .release();

        return action.perform();
    }.bind(this));
};

function swipeToRight() {
    return Promise.all([
        this.getWindowSize()
    ]).then(function (res) {
        var size = res[0];
        var action = new wd.TouchAction(this);

        action
            .press({ x: size.width / 4, y: size.height / 2 })
            .wait(1000)
            .moveTo({ x: size.width * 3 / 4, y: size.height / 2 })
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

function swipeToGrid(el, path) {
    return Promise.all([
        el.getSize(),
        el.getLocation()
    ]).then(function (res) {
        var size = res[0];
        var loc = res[1];
        var grid = new Array(9);

        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                grid[j * 3 + i] = {
                    x: ((i * (size.width / 3)) + (size.width / 3) / 2 + loc.x),
                    y: ((j * (size.height / 3)) + (size.height / 3) / 2 + loc.y)
                };;
            }
        }

        var action = new wd.TouchAction(this);
        if (grid.length > 0) {
            for (var k = 0; k < path.length; k++) {
                var cp = grid[path.substring(k, k + 1) - 1];
                if (k == 0) {
                    action.press({ x: cp.x, y: cp.y });
                } else {
                    var ep = grid[path.substring(k - 1, k) - 1];
                    action.moveTo({
                        x: cp.x - ep.x,
                        y: cp.y - ep.y
                    }).wait(500);
                }

                if (k == path.length - 1)
                    action.release();
            }
        }

        return action.perform();
    }.bind(this));
};

function pinch(el) {
    return Promise.all([
        el.getSize(),
        el.getLocation()
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
    return Promise.all([
        this.getWindowSize(),
        this.getLocation(el)
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
    driver.addPromiseChainMethod('swipeToGrid', swipeToGrid);
}