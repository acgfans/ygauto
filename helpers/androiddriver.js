'use strict';

require("./basedriver");
var path = require('path');
var _ = require('lodash');
var childProcess = require('child_process');
var wd = require('wd');

global.browser = null;

var desired = {
    browserName: '',
    appiumVersion: '1.5.3',
    platformName: 'Android',
    platformVersion: '4.4.2',
    deviceName: 'Nox',
    unicodeKeyboard: true,
    resetKeyboard: true,
    app: undefined
};

exports.start = function (opts) {
    desired = _.merge(desired, opts || {});
    browser = wd.remote('http://127.0.0.1:4726/wd/hub/', 'promiseChain');

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
            getDevices().then(function (devices) {
                var appiumPath = path.join(__dirname, '..', 'node_modules', '.bin', 'appium.cmd')
                var args = ['-a 127.0.0.1 -p 4726 -bp 4780 --session-override --no-reset --command-timeout 600'];

                var process = childProcess.spawn(appiumPath, args, {
                    cwd: null,
                    env: null,
                    windowsVerbatimArguments: true
                });

                process.stderr.setEncoding('utf8');
                process.stdout.setEncoding('utf8');

                var res = '';
                var flag = 'listener started';

                var isCB = false;
                process.stdout.on('data', function (data) {
                    res += data;

                    if (!isCB && res.indexOf(flag) > -1) {
                        isCB = true;
                        resolve('appium start success!');
                    }
                });

                process.on('error', function (err) {
                    reject(err);
                });

                process.on('exit', function (code, signal) {
                    reject(new Error("appium exit with code: " + code + ", signal: " + signal));
                });
            }, function () {
                reject("Noting Devices Connected!");
            });
        }).catch(function (err) {
            console.log('Error: ' + err);
        });
    }

    function checkServer() {
        return new Promise(function (resolve, reject) {
            childProcess.exec('netstat -aon | findstr 4726', function (err, stdout) {
                if (stdout.length > 0) {
                    resolve("appium is running.");
                } else {
                    reject("Noting to find!");
                }
            });
        });
    }

    function getDevices() {
        return new Promise(function (resolve, reject) {
            childProcess.exec('adb devices -l', function (err, stdout) {
                if (err) {
                    reject("Noting to find!");
                } else {
                    var ps = [];
                    stdout.split('\n').filter(function (line) {
                        var p = line.trim().split(/\s+/), device = p[0];
                        if (parseInt(device)) {
                            ps.push(device);
                        }
                    });

                    if (ps.length > 0) {
                        resolve(ps);
                    } else {
                        reject("Noting Connected!");
                    }
                }
            });
        });
    }
}

exports.stop = function (cb) {
    childProcess.exec('netstat -aon | findstr 4726', function (err, stdout) {
        if (err) {
            cb.call(this);
        } else {
            var ps = "";
            stdout.split('\n').filter(function (line) {
                var p = line.trim().split(/\s+/), pid = p[4];
                if (parseInt(pid)) {
                    ps += ' /pid ' + pid;
                }
            });

            childProcess.exec('taskkill /f' + ps, function (err, stdout) {
                cb.call(this);
            });
        }
    });
}