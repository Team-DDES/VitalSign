"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
var tfjs_1 = require("@tensorflow/tfjs");
var TSM = /** @class */ (function (_super) {
    __extends(TSM, _super);
    function TSM() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TSM.prototype.call = function (inputs) {
        return (0, tfjs_1.tidy)(function () {
            var _a, _b, _c;
            // Initialization
            var input = inputs[0];
            var out1;
            var out2;
            var out3;
            var empty;
            var out;
            var nt = input.shape[0]; // batch_size;
            var h = input.shape[1];
            var w = input.shape[2];
            var c = input.shape[3];
            var foldDiv = 3;
            var fold = Math.floor(c / foldDiv);
            var lastFold = c - (foldDiv - 1) * fold;
            input = (0, tfjs_1.reshape)(input, [-1, nt, h, w, c]);
            _a = __read((0, tfjs_1.split)(input, [fold, fold, lastFold], -1), 3), out1 = _a[0], out2 = _a[1], out3 = _a[2];
            // Shift left
            var padding1 = (0, tfjs_1.zeros)([
                out1.shape[0],
                1,
                out1.shape[2],
                out1.shape[3],
                fold
            ]);
            _b = __read((0, tfjs_1.split)(out1, [1, nt - 1], 1), 2), empty = _b[0], out1 = _b[1];
            out1 = (0, tfjs_1.concat)([out1, padding1], 1);
            // Shift right
            var padding2 = (0, tfjs_1.zeros)([
                out2.shape[0],
                1,
                out2.shape[2],
                out2.shape[3],
                fold
            ]);
            _c = __read((0, tfjs_1.split)(out2, [nt - 1, 1], 1), 2), out2 = _c[0], empty = _c[1];
            out2 = (0, tfjs_1.concat)([padding2, out2], 1);
            out = (0, tfjs_1.concat)([out1, out2, out3], -1);
            out = (0, tfjs_1.reshape)(out, [-1, h, w, c]);
            out3 = empty;
            return out;
        });
    };
    TSM.prototype.getConfig = function () {
        var config = _super.prototype.getConfig.call(this);
        return config;
    };
    TSM.getClassName = function () {
        return 'TSM';
    };
    TSM.className = 'TSM';
    return TSM;
}(tfjs_1.layers.Layer));
exports.default = TSM;
