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
Object.defineProperty(exports, "__esModule", { value: true });
var tf = require("@tensorflow/tfjs");
var AttentionMask = /** @class */ (function (_super) {
    __extends(AttentionMask, _super);
    function AttentionMask() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AttentionMask.prototype.computeOutputShape = function (inputShape) {
        return [inputShape[0], inputShape[1], inputShape[2], inputShape[3]];
    };
    AttentionMask.prototype.call = function (inputs) {
        return tf.tidy(function () {
            var input = inputs[0];
            var inputSum = tf.sum(input, 1, true);
            inputSum = tf.sum(inputSum, 2, true);
            var out = input
                .div(inputSum)
                .mul(input.shape[1])
                .mul(input.shape[2])
                .mul(0.5);
            return out;
        });
    };
    AttentionMask.prototype.getConfig = function () {
        var config = _super.prototype.getConfig.call(this);
        return config;
    };
    AttentionMask.getClassName = function () {
        return 'AttentionMask';
    };
    AttentionMask.className = 'AttentionMask';
    return AttentionMask;
}(tf.layers.Layer));
exports.default = AttentionMask;
