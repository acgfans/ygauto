"use strict";

exports.init = function (driver) {
    require('./gesture').init(driver);
    require('./performance').init(driver);
    require('./compare').init(wd);
}