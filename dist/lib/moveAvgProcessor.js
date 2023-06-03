"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constant_1 = require("../constant");
var MovingAvgProcessor = /** @class */ (function () {
    function MovingAvgProcessor() {
        var _this = this;
        this.reset = function () {
            _this.sum = 0;
            _this.movingAvg = 0;
            _this.dataSet = [];
        };
        this.getSum = function () { return _this.sum; };
        this.getMovingAvg = function () { return _this.movingAvg; };
        this.addData = function (data) {
            if (_this.dataSet.length === constant_1.BATCHSIZE) {
                _this.sum -= _this.dataSet.shift() || 0;
            }
            _this.sum += data;
            _this.dataSet.push(data);
            _this.movingAvg = _this.sum / _this.dataSet.length;
        };
        this.sum = 0;
        this.movingAvg = 0;
        this.dataSet = [];
    }
    return MovingAvgProcessor;
}());
exports.default = MovingAvgProcessor;
