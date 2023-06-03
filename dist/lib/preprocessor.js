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
Object.defineProperty(exports, "__esModule", { value: true });
var tfjs_1 = require("@tensorflow/tfjs");
var constant_1 = require("../constant");
var Preprocessor = /** @class */ (function () {
    function Preprocessor(tensorStore, posprocessor) {
        var _this = this;
        this.reset = function () {
            (0, tfjs_1.dispose)(_this.rawBatch);
            (0, tfjs_1.dispose)(_this.normalizedBatch);
            if (_this.previousFrame) {
                (0, tfjs_1.dispose)(_this.previousFrame);
            }
            _this.previousFrame = null;
            _this.isProcessing = false;
            _this.rawBatch = (0, tfjs_1.tensor)([]);
            _this.normalizedBatch = (0, tfjs_1.tensor)([]);
        };
        this.startProcess = function () {
            _this.isProcessing = true;
            _this.process();
        };
        this.stopProcess = function () {
            _this.isProcessing = false;
            _this.reset();
        };
        this.process = function () {
            if (_this.isProcessing) {
                var frame = _this.tensorStore.getRawTensor();
                if (!frame) {
                    setTimeout(function () {
                        _this.process();
                    }, 30);
                }
                else {
                    // const tpre = new Date();
                    _this.compute(_this.previousFrame, frame);
                    // console.log('preprocess ', new Date() - tpre);
                    (0, tfjs_1.dispose)(frame);
                    _this.process();
                }
            }
        };
        this.compute = function (previousFrame, currentFrame) {
            var _a = __read((0, tfjs_1.tidy)(function () {
                var expandOrigV = currentFrame
                    .asType('float32')
                    .div((0, tfjs_1.scalar)(255))
                    .clipByValue(1 / 255, 1)
                    .expandDims(0);
                if (previousFrame) {
                    var tempNormalizedFrame = (0, tfjs_1.div)((0, tfjs_1.sub)(expandOrigV, previousFrame), (0, tfjs_1.add)(expandOrigV, previousFrame));
                    var normalizedFrame = (0, tfjs_1.div)(tempNormalizedFrame, (0, tfjs_1.moments)(tempNormalizedFrame).variance.sqrt());
                    var tempMeanNormalize = (0, tfjs_1.sub)(expandOrigV, (0, tfjs_1.mean)(expandOrigV));
                    var meanNormalize = (0, tfjs_1.div)(tempMeanNormalize, (0, tfjs_1.moments)(tempMeanNormalize).variance.sqrt());
                    (0, tfjs_1.dispose)(previousFrame);
                    return [expandOrigV, normalizedFrame, meanNormalize];
                }
                return [expandOrigV];
            }), 3), frame = _a[0], nNormalize = _a[1], mNoramlize = _a[2];
            if (_this.rawBatch.shape[0] && mNoramlize && nNormalize) {
                var tempRawBath = (0, tfjs_1.tidy)(function () { return (0, tfjs_1.concat)([_this.rawBatch, mNoramlize]); });
                (0, tfjs_1.dispose)(_this.rawBatch);
                _this.rawBatch = tempRawBath;
                var tempNormalizedBatch = (0, tfjs_1.tidy)(function () {
                    return (0, tfjs_1.concat)([_this.normalizedBatch, nNormalize]);
                });
                (0, tfjs_1.dispose)(_this.normalizedBatch);
                _this.normalizedBatch = tempNormalizedBatch;
            }
            else if (nNormalize && mNoramlize) {
                var tempRawBath = (0, tfjs_1.tidy)(function () { return (0, tfjs_1.cast)(mNoramlize, 'float32'); });
                (0, tfjs_1.dispose)(_this.rawBatch);
                _this.rawBatch = tempRawBath;
                var tempNormalized = (0, tfjs_1.tidy)(function () { return (0, tfjs_1.cast)(nNormalize, 'float32'); });
                (0, tfjs_1.dispose)(_this.normalizedBatch);
                _this.normalizedBatch = tempNormalized;
            }
            if (_this.rawBatch.shape[0] === constant_1.BATCHSIZE) {
                _this.posprocessor.compute(_this.normalizedBatch, _this.rawBatch);
                (0, tfjs_1.dispose)(_this.rawBatch);
                (0, tfjs_1.dispose)(_this.normalizedBatch);
                _this.rawBatch = (0, tfjs_1.tensor)([]);
                _this.normalizedBatch = (0, tfjs_1.tensor)([]);
            }
            (0, tfjs_1.dispose)(nNormalize);
            (0, tfjs_1.dispose)(mNoramlize);
            _this.previousFrame = frame;
        };
        this.tensorStore = tensorStore;
        this.posprocessor = posprocessor;
        this.previousFrame = null;
        this.isProcessing = false;
        this.rawBatch = (0, tfjs_1.tensor)([]);
        this.normalizedBatch = (0, tfjs_1.tensor)([]);
    }
    return Preprocessor;
}());
exports.default = Preprocessor;
