'use strict';

require("./basedriver");
var path = require('path');
var _ = require('lodash');
var childProcess = require('child_process');
var wd = require('wd');

global.browser = null;

var desired = {
    browserName: 'chrome'
};

exports.start = function (opts) {
    desired = _.merge(desired, opts || {});
    browser = wd.remote('http://localhost:9515/', 'promiseChain');

    return browser
        .init(desired)
        .setImplicitWaitTimeout(30000);
}

exports.init = function (cb) {
    checkServer().then(function () {
        cb.call(this);
    }, function () {
        startServer().then(function () {
            cb.call(this);
        });
    });

    function startServer() {
        return new Promise(function (resolve, reject) {
            var chromePath = path.join(__dirname, '..', 'chromedriver.exe')
            var process = childProcess.spawn(chromePath);

            process.stderr.setEncoding('utf8');
            process.stdout.setEncoding('utf8');

            var res = '';
            var startFlag = 'Starting';

            process.stdout.on('data', function (data) {
                res += data;

                if (res.startsWith(startFlag)) {
                    resolve('chromedriver start success!');
                } else if (res.length >= startFlag.length) {
                    reject(new Error('chromedriver start failed.'));
                }
            });

            process.on('error', function (err) {
                reject(err);
            });

            process.on('exit', function (code, signal) {
                reject(new Error("chromedriver exit with code: " + code + ", signal: " + signal));
            });
        }).catch(function (err) {
            console.log('Error: ' + err);
        });
    }

    function stopServer() {
        return new Promise(function (resolve, reject) {
           	childProcess.exec('taskkill /f /im chromedriver.exe', function (err, stdout) {
                resolve("kill chromedriver process!");
            });
        });
    }

    function checkServer() {
        return new Promise(function (resolve, reject) {
            childProcess.exec('tasklist | find /i "chromedriver.exe"', function (err, stdout) {
                if (stdout.length > 0) {
                    resolve("chromedriver is running.");
                } else {
                    reject("Noting to find!");
                }
            });
        });
    }
}

exports.stop = function (cb) {
    childProcess.exec('taskkill /f /im chromedriver.exe', function (err, stdout) {
        cb.call(this);
    });
}