"use strict";

var path = require('path');
var BlinkDiff = require('blink-diff');

function diffImage(image, output, tolerantCfg) {
    return new Promise(function (resolve, reject) {
        browser.takeScreenshot(function (err, screenshot) {
            if (err) {
                reject(err);
            } else {
                var screenshotImg = new Buffer(screenshot, 'base64');
                var diff = new BlinkDiff({
                    imageA: screenshotImg,
                    imageBPath: path.resolve(__dirname, '../expectScreenshot/' + image),
                    thresholdType: BlinkDiff.THRESHOLD_PERCENT,
                    threshold: tolerantCfg / 100 || 0,
                    imageOutputPath: output || ''
                });

                diff.run(function (err, result) {
                    if (err) {
                        reject('diff image error:' + err);
                    } else {
                        var isPassed = diff.hasPassed(result.code);
                        if (isPassed) {
                            resolve(isPassed);
                        }
                        else {
                            reject('Found ' + result.differences + ' pixel differences between two images.');
                        }
                    }
                });
            }
        });
    });
};

function diffImage2File(imageA, imageB, output, tolerantCfg) {
    return new Promise(function (resolve, reject) {
        var diff = new BlinkDiff({
            imageAPath: path.resolve(__dirname, '../expectScreenshot/' + imageA),
            imageBPath: path.resolve(__dirname, '../expectScreenshot/' + imageB),
            thresholdType: BlinkDiff.THRESHOLD_PERCENT,
            threshold: tolerantCfg / 100 || 0,
            imageOutputPath: output || ''
        });

        diff.run(function (err, result) {
            if (err) {
                reject('diff image error:' + err);
            } else {
                var isPassed = diff.hasPassed(result.code);
                if (isPassed) {
                    resolve(isPassed);
                }
                else {
                    reject('Found ' + result.differences + ' pixel differences between two images.');
                }
            }
        });
    });
};

function diffImage2Element(el, image, output, tolerantCfg) {
    return Promise.all([
        el.getSize(),
        el.getLocation()
    ]).then(function (res) {
        return new Promise(function (resolve, reject) {
            browser.takeScreenshot(function (err, screenshot) {
                if (err) {
                    reject(err);
                } else {
                    var size = res[0];
                    var loc = res[1];

                    var screenshotImg = new Buffer(screenshot, 'base64');
                    var diff = new BlinkDiff({
                        imageA: screenshotImg,
                        imageBPath: path.resolve(__dirname, '../expectScreenshot/' + image),
                        thresholdType: BlinkDiff.THRESHOLD_PERCENT,
                        threshold: tolerantCfg / 100 || 0,
                        imageOutputPath: output || '',
                        cropImageA: { x: loc.x, y: loc.y, width: size.width, height: size.height }
                    });

                    diff.run(function (err, result) {
                        if (err) {
                            reject('diff image error:' + err);
                        } else {
                            var isPassed = diff.hasPassed(result.code);
                            if (isPassed) {
                                resolve(isPassed);
                            }
                            else {
                                reject('Found ' + result.differences + ' pixel differences between two images.');
                            }
                        }
                    });
                }
            });
        });
    });
};

exports.init = function (driver) {
    driver.addPromiseChainMethod('diffImage', diffImage);
    driver.addPromiseChainMethod('diffImage2File', diffImage2File);
    driver.addPromiseChainMethod('diffImage2Element', diffImage2Element);
}