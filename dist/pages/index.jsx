"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var react_1 = require("react");
var react_chartjs_2_1 = require("react-chartjs-2");
var head_1 = require("next/head");
var react_webcam_1 = require("react-webcam");
var tfjs_1 = require("@tensorflow/tfjs");
var fili_1 = require("fili");
var Home_module_scss_1 = require("../styles/Home.module.scss");
var tensorStore_1 = require("../lib/tensorStore");
var preprocessor_1 = require("../lib/preprocessor");
var posprocessor_1 = require("../lib/posprocessor");
var postprocessor = new posprocessor_1.default(tensorStore_1.default);
var preprocessor = new preprocessor_1.default(tensorStore_1.default, postprocessor);
var config = {
    fill: false,
    lineTension: 0.1,
    borderDash: [],
    borderDashOffset: 0.0,
    pointRadius: 0
};
var Home = function () {
    var webcamRef = react_1.default.useRef(null);
    var intervalId = react_1.default.useRef();
    var coutdownIntervalId = react_1.default.useRef();
    var _a = __read((0, react_1.useState)(false), 2), isRecording = _a[0], setRecording = _a[1];
    var _b = __read((0, react_1.useState)({
        labels: [],
        rppg: []
    }), 2), charData = _b[0], setCharData = _b[1];
    var refCountDown = react_1.default.useRef(30);
    var _c = __read((0, react_1.useState)(30), 2), countDown = _c[0], setCountDown = _c[1];
    (0, react_1.useEffect)(function () { return function () {
        if (intervalId.current) {
            clearInterval(intervalId.current);
        }
        if (coutdownIntervalId.current) {
            clearInterval(coutdownIntervalId.current);
        }
    }; }, []);
    (0, react_1.useEffect)(function () { return function () {
        preprocessor.stopProcess();
        // postprocessor.stopProcess();
        tensorStore_1.default.reset();
    }; }, []);
    var startRecording = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, postprocessor.loadModel()];
                case 1:
                    _a.sent();
                    intervalId.current = setInterval(capture, 30);
                    coutdownIntervalId.current = setInterval(function () {
                        setCountDown(function (prevCount) { return prevCount - 1; });
                        refCountDown.current -= 1;
                        if (refCountDown.current === 0) {
                            plotGraph();
                            stopRecording();
                        }
                    }, 1000);
                    setRecording(true);
                    preprocessor.startProcess();
                    return [2 /*return*/];
            }
        });
    }); };
    var stopRecording = function () {
        if (intervalId.current) {
            clearInterval(intervalId.current);
        }
        if (coutdownIntervalId.current) {
            clearInterval(coutdownIntervalId.current);
        }
        preprocessor.stopProcess();
        tensorStore_1.default.reset();
        setCountDown(30);
        refCountDown.current = 30;
        setRecording(false);
    };
    var capture = react_1.default.useCallback(function () {
        if (webcamRef.current !== null) {
            var imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc === null)
                return;
            var img_1 = new Image(480, 640);
            img_1.src = imageSrc;
            img_1.onload = function () {
                var origVExpand = (0, tfjs_1.tidy)(function () {
                    return tfjs_1.browser.fromPixels(img_1).expandDims(0);
                });
                var crop = tfjs_1.image.cropAndResize(origVExpand, [[0.1, 0.3, 0.56, 0.7]], [0], [36, 36], 'bilinear');
                (0, tfjs_1.dispose)(origVExpand);
                var origV = crop.reshape([36, 36, 3]);
                tensorStore_1.default.addRawTensor(origV);
            };
        }
    }, [webcamRef]);
    var plotGraph = function () {
        var pltData = tensorStore_1.default.rppgPltData;
        var iirCalculator = new fili_1.default.CalcCascades();
        var iirFilterCoeffs = iirCalculator.bandpass({
            order: 1,
            characteristic: 'butterworth',
            Fs: 30,
            Fc: 1.375,
            BW: 1.25,
            gain: 0,
            preGain: false // adds one constant multiplication for highpass and lowpass
        });
        var iirFilter = new fili_1.default.IirFilter(iirFilterCoeffs);
        if (pltData) {
            var rppgCumsum = (0, tfjs_1.cumsum)((0, tfjs_1.reshape)(pltData, [-1, 1]), 0).dataSync();
            var result = iirFilter
                .filtfilt(rppgCumsum)
                .slice(0, rppgCumsum.length - 60);
            var labels = Array.from(pltData.keys())
                .map(function (i) { return i.toString(); })
                .slice(0, rppgCumsum.length - 60);
            setCharData({
                labels: labels,
                rppg: result
            });
        }
    };
    var plotData = {
        labels: charData.labels,
        datasets: [
            __assign(__assign({}, config), { label: 'Pulse', borderColor: 'red', data: charData.rppg })
        ]
    };
    return (<>
      <head_1.default>
        <title>rPPG Web Demo</title>
        <link rel="icon" href="/images/icon.png"/>
      </head_1.default>
      <div className={Home_module_scss_1.default.homeContainer}>
        <div className={Home_module_scss_1.default.contentContainer}>
          <h3>
            This is a demo for camera-based remote PPG (Pulse) sensing. The
            recorded video will not be uploaded to cloud.
          </h3>
          <h4 style={{ color: 'red' }}>
            Please place your face inside of the red box and keep stationary for
            30 seconds
          </h4>
          {!isRecording && (<button className={Home_module_scss_1.default.recordingButton} onClick={startRecording} type="button">
              Start the Demo
            </button>)}
          <p className={Home_module_scss_1.default.countdown}>{countDown}</p>
          <div className={Home_module_scss_1.default.innerContainer}>
            <div className={Home_module_scss_1.default.webcam}>
              <react_webcam_1.default width={500} height={500} mirrored audio={false} ref={webcamRef} screenshotFormat="image/jpeg"/>
            </div>
          </div>
          {!isRecording && !!charData.rppg.length && (<react_chartjs_2_1.Line data={plotData} width={1200} height={300} options={{
                responsive: false,
                animation: {
                    duration: 0
                },
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                display: false
                            }
                        }
                    ],
                    xAxes: [
                        {
                            ticks: {
                                display: false
                            }
                        }
                    ]
                }
            }}/>)}
        </div>
      </div>
    </>);
};
exports.default = Home;
