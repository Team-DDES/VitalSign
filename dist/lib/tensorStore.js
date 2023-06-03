"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var tfjs_1 = require("@tensorflow/tfjs");
var TensorStore = /** @class */ (function () {
    function TensorStore() {
        var _this = this;
        this.reset = function () {
            _this.rawFrames.forEach(function (f) {
                (0, tfjs_1.dispose)(f);
            });
            _this.rawFrames = [];
            _this.rppgPltData = [];
            _this.initialWait = true;
        };
        this.getRawTensor = function () {
            if (_this.rawFrames) {
                var tensor = _this.rawFrames.shift() || null;
                return tensor;
            }
            return null;
        };
        this.addRppgPltData = function (data) {
            _this.rppgPltData = __spreadArray(__spreadArray([], __read(_this.rppgPltData), false), __read(data), false);
        };
        this.addRawTensor = function (tensor) {
            _this.rawFrames.push(tensor);
        };
        this.rawFrames = [];
        this.rppgPltData = [];
        this.initialWait = true;
    }
    return TensorStore;
}());
exports.default = new TensorStore();
