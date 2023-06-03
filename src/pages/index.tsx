import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import Head from 'next/head';
import Webcam from 'react-webcam';
import { ChartDataSets } from 'chart.js';
import {
  image,
  browser,
  tidy,
  dispose,
  cumsum,
  reshape
} from '@tensorflow/tfjs';
import Fili from 'fili';
import { fft, pow, sqrt } from 'mathjs';
import { CredentialType, IDKitWidget, ISuccessResult } from '@worldcoin/idkit';
import Header from '../components/header';
import Research from '../components/research';
import Contributor from '../components/contributor';
import styles from '../styles/Home.module.scss';
import tensorStore from '../lib/tensorStore';
import Preprocessor from '../lib/preprocessor';
import Posprocessor from '../lib/posprocessor';

import testAbi from '../../testabi.json';
const postprocessor = new Posprocessor(tensorStore);
const preprocessor = new Preprocessor(tensorStore, postprocessor);

const time = 5;

const config: ChartDataSets = {
  fill: false,
  lineTension: 0.1,
  borderDash: [],
  borderDashOffset: 0.0,
  pointRadius: 0
};

function getHeartRateFromPPG({
  ppgSignal,
  sampleRate,
  min,
  max
}: {
  ppgSignal: Float32Array | Int32Array | Uint8Array;
  sampleRate: any;
  min: any;
  max: any;
}) {
  // FFT 라이브러리를 사용하여 FFT 수행

  const signal = Array.from(ppgSignal); // Float32Array를 Array로 변환
  const spectrum:any= fft(signal);
  const startFrequency = min; // 심장박동 주파수 범위의 시작값
  const endFrequency = max; // 심장박동 주파수 범위의 종료값

  // 주파수 대역에서 최대값을 찾습니다.
  let maxAmplitude = -Infinity;
  let maxFrequency = 0;


  // 주파수 대역 내에서 최대값을 찾습니다.
  for (let i = 0; i < spectrum.length; i++) {
    const frequency = (i * sampleRate) / ppgSignal.length;
    if (frequency >= startFrequency && frequency <= endFrequency) {
      // const amplitude = 0;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const amplitude = Math.sqrt(
        Math.pow(spectrum[i].im, 2) + Math.pow(spectrum[i].re, 2)
      );
      if (amplitude > maxAmplitude) {
        maxAmplitude = amplitude;
        maxFrequency = frequency;
      }
    }
  }

  // 주파수를 심장박동 수로 변환합니다.
  const heartRate = maxFrequency * 60;

  return heartRate;
}

type GraphProps = {
  labels: string[];
  rppg: number[];
};

const Home = () => {
  const webcamRef = React.useRef<any>(null);
  const intervalId = React.useRef<NodeJS.Timeout>();
  const coutdownIntervalId = React.useRef<NodeJS.Timeout>();
  const [isRecording, setRecording] = useState(false);
  const [charData, setCharData] = useState<GraphProps>({
    labels: [],
    rppg: []
  });
  const refCountDown = React.useRef(time);
  const [countDown, setCountDown] = useState(time);

  useEffect(
    () => () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }

      if (coutdownIntervalId.current) {
        clearInterval(coutdownIntervalId.current);
      }
    },
    []
  );

  useEffect(
    () => () => {
      preprocessor.stopProcess();
      // postprocessor.stopProcess();
      tensorStore.reset();
    },
    []
  );

  const startRecording = async () => {
    await postprocessor.loadModel();
    intervalId.current = setInterval(capture, 30);
    coutdownIntervalId.current = setInterval(() => {
      setCountDown(prevCount => prevCount - 1);
      refCountDown.current -= 1;
      if (refCountDown.current === 0) {
        plotGraph();
        stopRecording();
      }
    }, 1000);
    setRecording(true);
    preprocessor.startProcess();
  };

  const stopRecording = () => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
    }
    if (coutdownIntervalId.current) {
      clearInterval(coutdownIntervalId.current);
    }
    preprocessor.stopProcess();
    tensorStore.reset();
    setCountDown(time);
    refCountDown.current = time;
    setRecording(false);
  };

  const capture = React.useCallback(() => {
    if (webcamRef.current !== null) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc === null) return;
      const img = new Image(480, 640);

      img.src = imageSrc;
      img.onload = () => {
        const origVExpand: any = tidy(() =>
          browser.fromPixels(img).expandDims(0)
        );
        const crop = image.cropAndResize(
          origVExpand,
          [[0.1, 0.3, 0.56, 0.7]],
          [0],
          [36, 36],
          'bilinear'
        );
        dispose(origVExpand);
        const origV: any = crop.reshape([36, 36, 3]);
        tensorStore.addRawTensor(origV);
      };
    }
  }, [webcamRef]);

  const plotGraph = () => {
    const pltData = tensorStore.rppgPltData;
    const iirCalculator = new Fili.CalcCascades();
    const iirFilterCoeffs = iirCalculator.bandpass({
      order: 1, // cascade 3 biquad filters (max: 12)
      characteristic: 'butterworth',
      Fs: 30, // sampling frequency
      Fc: 1.375, // (2.5-0.75) / 2 + 0.75, 2.5 --> 150/60, 0.75 --> 45/60 # 1.625
      BW: 1.25, // 2.5 - 0.75 = 1.75
      gain: 0, // gain for peak, lowshelf and highshelf
      preGain: false // adds one constant multiplication for highpass and lowpass
    });
    const iirFilter = new Fili.IirFilter(iirFilterCoeffs);
    if (pltData) {
      const rppgCumsum = cumsum(reshape(pltData, [-1, 1]), 0).dataSync();
      const hr = getHeartRateFromPPG({
        ppgSignal: rppgCumsum,
        sampleRate: 30,
        min: 1,
        max: 3.5
      });
      const rr = getHeartRateFromPPG({
        ppgSignal: rppgCumsum,
        sampleRate: 30,
        min: 0.07,
        max: 0.3
      });
      console.log(hr);
      console.log(rr);
      const result = iirFilter
        .filtfilt(rppgCumsum)
        .slice(0, rppgCumsum.length - 60);
      const labels = Array.from(pltData.keys())
        .map(i => i.toString())
        .slice(0, rppgCumsum.length - 60);
      setCharData({
        labels,
        rppg: result
      });
    }
  };

  const plotData = {
    labels: charData.labels,
    datasets: [
      {
        ...config,
        label: 'Pulse',
        borderColor: 'red',
        data: charData.rppg
      }
    ]
  };

  const handleProof = (result: ISuccessResult) =>
    new Promise<void>(resolve => {
      setTimeout(() => resolve(), 3000);
      // NOTE: Example of how to decline the verification request and show an error message to the user
    });

  const onSuccess = (result: ISuccessResult) => {
    console.log(result);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
  });
  // const urlParams = new URLSearchParams(window.location.search);

  // const credential_types = (urlParams.get("credential_types")?.split(",") as CredentialType[]) ?? [
  // 	CredentialType.Orb,
  // 	CredentialType.Phone,
  // ];

  // const action = urlParams.get("action") ?? "";
  // const app_id = urlParams.get("app_id") ?? "app_BPZsRJANxct2cZxVRyh80SFG";
  const action = JSON.stringify(testAbi);
  return (
    <>
      <Head>
        <title>rPPG Web Demo</title>
        <link rel="icon" href="/images/icon.png" />
      </Head>
      <Header />
      <div className={styles.homeContainer}>
        <Contributor />
        <div className={styles.contentContainer}>
          <h3>
            This is a demo for camera-based remote PPG (Pulse) sensing. The
            recorded video will not be uploaded to cloud.
          </h3>
          <h4 style={{ color: 'red' }}>
            Please place your face inside of the red box and keep stationary for
            30 seconds
          </h4>
          {!isRecording && (
            <button
              className={styles.recordingButton}
              onClick={startRecording}
              type="button"
            >
              Start the Demo
            </button>
          )}
          {/* <div
            className="App"
            style={{
              minHeight: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <IDKitWidget
              action={action}
              signal="my_signal"
              onSuccess={onSuccess}
              handleVerify={handleProof}
              app_id={app_id}
              credential_types={credential_types}
              // walletConnectProjectId="get_this_from_walletconnect_portal"
            >
              {({ open }) => <button onClick={open}>Click me</button>}
            </IDKitWidget>
          </div> */}
          <IDKitWidget
            app_id="app_BPZsRJANxct2cZxVRyh80SFG" // obtain this from developer.worldcoin.org
            action={action}
            enableTelemetry
            onSuccess={result => console.log(result)} // pass the proof to the API or your smart contract
          />
          <p className={styles.countdown}>{countDown}</p>
          <div className={styles.innerContainer}>
            <div className={styles.webcam}>
              <Webcam
                width={500}
                height={500}
                mirrored
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
              />
            </div>
          </div>
          {!isRecording && !!charData.rppg.length && (
            <Line
              data={plotData}
              width={1200}
              height={300}
              options={{
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
              }}
            />
          )}
          <Research />
          <a href="http://cs.washington.edu/" target="_blank">
            <img src="/images/UWlogo5.png" alt="" width={500} height={70} />
          </a>
        </div>
      </div>
    </>
  );
};

export default Home;
