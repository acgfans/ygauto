"use strict";

var _ = require('lodash');
var childProcess = require('child_process');

function getMeminfo(name) {
    return new Promise(function (resolve, reject) {
        childProcess.exec('adb shell dumpsys meminfo ' + name, function (err, stdout) {
            if (err) {
                reject(err);
            } else {
                var sec = _.find(stdout.split('\n'), function (line) {
                    return _.startsWith(line.trim(), 'TOTAL ');
                }).trim().split(/\s+/g);

                resolve(sec[1]);
            }
        });
    });
};

function getCPU(name) {
    return new Promise(function (resolve, reject) {
        childProcess.exec('adb shell top -n 1', function (err, stdout) {
            if (err) {
                reject(err);
            } else {
                var sec = _.find(stdout.split('\n'), function (line) {
                    return line.split(/\s+/g)[10] == name;
                }).trim().split(/\s+/g);

                resolve(sec[2]);
            }
        });
    });
};

function getThreadCount(name) {
    return new Promise(function (resolve, reject) {
        getPid(name).then(function (pid) {
            childProcess.exec('adb shell cat /proc/' + pid + '/status', function (err, stdout) {
                if (err) {
                    reject(err);
                } else {
                    var sec = _.find(stdout.split('\n'), function (line) {
                        return line.includes('Threads');
                    }).trim().split(/\s+/g);

                    resolve(sec[1]);
                }
            });
        });
    });
};

function getTraffic(name) {
    return new Promise(function (resolve, reject) {
        getUid(name).then(function (uid) {
            childProcess.exec('adb shell cat /proc/net/xt_qtaguid/stats', function (err, stdout) {
                if (err) {
                    reject(err);
                } else {
                    var uidx, rcvx, sndx;
                    var res = { rx: 0, tx: 0 };

                    _.forEach(stdout.split('\n'), function (line) {
                        var token = line.trim().split(/\s+/g);

                        if (token[0] == 'idx') {
                            uidx = _.indexOf(token, 'uid_tag_int');
                            rcvx = _.indexOf(token, 'rx_bytes');
                            sndx = _.indexOf(token, 'tx_bytes');
                        } else if (token[uidx] == uid) {
                            res.rx += parseInt(token[rcvx], 10);
                            res.tx += parseInt(token[sndx], 10);
                        }
                    });

                    resolve(res);
                }
            });
        });
    });
};

function getPid(name) {
    return new Promise(function (resolve, reject) {
        childProcess.exec('adb shell ps', function (err, stdout) {
            if (err) {
                reject(err);
            } else {
                var sec = _.find(stdout.split('\n'), function (line) {
                    return line.split(/\s+/g)[8] == name;
                }).trim().split(/\s+/g);

                resolve(sec[1]);
            }
        });
    });
};

function getUid(name) {
    return new Promise(function (resolve, reject) {
        getPid(name).then(function (pid) {
            childProcess.exec('adb shell cat /proc/' + pid + '/status', function (err, stdout) {
                if (err) {
                    reject(err);
                } else {
                    var sec = _.find(stdout.split('\n'), function (line) {
                        return line.includes('Uid');
                    }).trim().split(/\s+/g);

                    resolve(sec[1]);
                }
            });
        });
    });
};

function getAll(name) {
    return Promise.all([
        getCPU(name),
        getMeminfo(name),
        getTraffic(name),
        getThreadCount(name)
    ]).then(function (res) {
        return new Promise(function (resolve, reject) {
            var output = [];
            if (res.length > 0) {
                var arr = ['cpu', 'mem', 'traffic', 'threadcount'];
                for (var k = 0; l < res.length; k++) {
                    output.push({
                        item: arr[k], data: res[k]
                    });
                }

                resolve(output);
            } else {
                reject('err');
            }
        });
    });
};

//adb shell monkey -p #{package} -c android.intent.category.LAUNCHER 1
exports.init = function (driver) {
    driver.addPromiseChainMethod('androidPerfPin', getAll);
    driver.addPromiseChainMethod('androidMem', getMeminfo);
    driver.addPromiseChainMethod('androidCPU', getCPU);
    driver.addPromiseChainMethod('androidTraffic', getTraffic);
    driver.addPromiseChainMethod('androidThreadCount', getThreadCount);
}