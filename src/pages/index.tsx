import React, {useEffect, useState} from 'react';
import {Line} from 'react-chartjs-2';
import Head from 'next/head';
import Webcam from 'react-webcam';
import {ChartDataSets} from 'chart.js';
import {browser, cumsum, dispose, image, reshape, tidy} from '@tensorflow/tfjs';
import TextField from '@material-ui/core/TextField';

import Fili from 'fili';
import {fft} from 'mathjs';
import {CredentialType, IDKitWidget, ISuccessResult, useIDKit} from '@worldcoin/idkit';
import Web3 from 'web3';
import {AbiItem} from 'web3-utils';
import {Contract} from 'web3-eth-contract';
import Header from '../components/header';
import PatientInfo from '../components/home/grid';
import styles from '../styles/Home.module.scss';
import tensorStore from '../lib/tensorStore';
import Preprocessor from '../lib/preprocessor';
import Posprocessor from '../lib/posprocessor';
// import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/config';
import contractInfo from '../contracts/BiometricContract.json';
import worldIdcontractInfo from "../contracts/Contract.json";
import {Col, Container, Row} from "react-bootstrap";

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
  const spectrum: any = fft(signal);
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
  // const {open, setOpen} = useIDKit();
  const webcamRef = React.useRef<any>(null);
  const intervalId = React.useRef<NodeJS.Timeout>();
  const coutdownIntervalId = React.useRef<NodeJS.Timeout>();
  const [isRecording, setRecording] = useState(false);
  const [isStartRecording, setViewCamera] = useState(false);
  const [charData, setCharData] = useState<GraphProps>({
    labels: [],
    rppg: []
  });
  const refCountDown = React.useRef(time);
  const [countDown, setCountDown] = useState(time);
  const [heartrate, setheartrate] = useState(0);
  const [resipration, setresipration] = useState(0);
  const [account, setAccount] = useState<string>('');
  const [w3, setW3] = useState<Web3 | undefined>(undefined);
  const [contract, setContract] = useState<Contract | undefined>(undefined);
  const [worldContract, setworldContract] = useState<Contract | undefined>(undefined);
  const [docterAddr, setDocterAddr] = useState<string>("0x4D7F9D84C58ae9f34301cA0C0a44dBe9c9662cA2");
  const [comment, setComment] = useState<string>("");

  const [isDoctor, setDoctor] = useState(false);


  useEffect(
    () => () => {
      // setOpen(true);
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

  useEffect(() => {
    async function load() {
      const w3Instance = new Web3(Web3.givenProvider);
      const accounts = await w3Instance.eth.requestAccounts();
      setAccount(accounts[0]);
      setW3(w3Instance);
      // const bioContract = new Contract(
      //   CONTRACT_ABI as AbiItem[],
      //   CONTRACT_ADDRESS
      // );
      // console.log(bioContract);
      // @ts-ignore
      const bioContract = new w3Instance.eth.Contract(
        contractInfo.abi as AbiItem[],
        // @ts-ignore
        contractInfo.networks['80001'].address
      );
      // @ts-ignore
      const worldIdcontract = new w3Instance.eth.Contract(
        // @ts-ignore
        worldIdcontractInfo.abi as AbiItem[],
        // @ts-ignore
        worldIdcontractInfo.networks['80001'].address
      );
      // console.bi

      // console.log(bioContract);
      // console.log(bioContract);
      const docterComment = await bioContract.methods.getComment().call();
      // console.log(docterComment);
      setContract(bioContract);
      setworldContract(worldIdcontract);
    }

    load();
  }, []);

  useEffect(() => {
    console.log(w3, account, contract);
  }, [w3, account, contract]);
  const sendBiometric = async () => {
    // console.log(contract)
    // if (heartrate == 0 && resipration == 0) {
    //   return;
    // }
    let bioArray = [];
    const hr = w3?.utils.stringToHex(w3?.utils.rightPad(heartrate.toString(), 32));
    const rr = w3?.utils.stringToHex(w3?.utils.rightPad(resipration.toString(), 32));
    const stress = w3?.utils.stringToHex(w3?.utils.rightPad("High", 32));
    const sp = w3?.utils.stringToHex(w3?.utils.rightPad("98", 32));
    const comment = w3?.utils.stringToHex(w3?.utils.rightPad("normal", 32));
    bioArray.push(hr)
    bioArray.push(rr)
    bioArray.push(stress)
    bioArray.push(sp)
    console.log(comment)
    // @ts-ignore
    await contract.methods.sendBiometricData(bioArray, comment, docterAddr).send({
      "from": account,
    });
  }

  const connectToMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      // Metamask가 설치되어 있는 경우
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      const w3 = new Web3(window.ethereum);
      // 이제 web3를 사용하여 Metamask와 상호작용할 수 있습니다.
    } else {
      // Metamask가 설치되어 있지 않은 경우 또는 사용자가 거부한 경우
      console.error('Please install Metamask');
    }
  };

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
    setViewCamera(true);
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
      setheartrate(hr);
      setresipration(rr);
      patientData.set('heartRate', heartrate);
      patientData.set('respirationRate', resipration);
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
  const appid = Web3.utils.soliditySha3("app_staging_a414e2af064c52df63f1e1f8842b613e");
  console.log(appid)


  const handleProof = async (result: ISuccessResult) => {
    console.log(account)
    console.log(result)
    const proof = result.proof;
    const unpakcedMroot = w3?.eth.abi.encodeParameter('uint256', result.merkle_root);
    const unpackedNullfierHash = w3?.eth.abi.encodeParameter('uint256', result.nullifier_hash);
    const unpackedProof = w3?.eth.abi.decodeParameter('uint256[8]', proof);
    console.log(unpakcedMroot);
    console.log(unpackedNullfierHash);
    console.log(unpackedProof);
    const resultString = await worldContract?.methods.verifyAndExecute(account, unpakcedMroot, unpackedNullfierHash, unpackedProof).send({
      "from": account
    });
    console.log(resultString);

  }



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
  const action = "";
  //0x305fd754ee2e9fbb7bbf0a58bfc9b3f9e01ea3a4d8f68e55c8dce738f52f41cb

  const [text, setText] = useState("");

  // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setText(event.target.value);
  // };

  const patientData = new Map();
  patientData.set('heartRate', heartrate);
  patientData.set('respirationRate', resipration);
  patientData.set('stressLevel', 5);
  patientData.set('spO2', 98);
  patientData.set('comment', "Carefully");

  // const handleChange = (event) => {
  //   setValue(event.target.value);
  // };



  return (
    <div style={{overflow: 'auto'}}>
      <Head>
        <title>rPPG Web Demo</title>
        <link rel="icon" href="/images/icon.png"/>
      </Head>
      <Header/>
      <div className={styles.homeContainer}>
        <div className={styles.contentContainer}>
          <h3>Hello, User</h3>
          <h3>rPPG is a method to extract BVP from the face.</h3>
          <h4 style={{color: 'red'}}>
            Please place your face inside of the red box and keep stationary for
            5 seconds
          </h4>
          <p className={styles.countdown}>comment:{comment}</p>
          {/* <input> </input> */}
          {/* <button> send comment</button> */}
          {/* <p className={styles.countdown}>comment:{comment}</p> */}
          <div className={styles.buttonContainer} >
            <TextField
              // style={{width: '300px', height: '200px'}}
              label="Comment : "
              // onChange={}
              // value={text}
              variant='outlined'
              // multiline={true}
            />
            <button
              className={styles.recordingButton}
              style={{width: '400px'}}
              onClick={sendBiometric}
              type="button"
            >
              Send comment
            </button>
          </div>

          <div className={styles.buttonContainer} style={{marginTop: '20px'}}>
            {!isRecording && (
              <button
                className={styles.recordingButton}
                style={{width: '800px'}}
                onClick={startRecording}
                type="button"
              >
                Start Monitoring
              </button>
            )}
            {/* <button // Metamask debug Button
              className={styles.recordingButton}
              onClick={connectToMetaMask}
              type="button"
            >
              MetaMask
            </button>
            <button className={styles.recordingButton} type="button" onClick={sendBiometric}>
              Send Information
            </button>
            <IDKitWidget
              app_id="app_staging_a414e2af064c52df63f1e1f8842b613e" // obtain this from developer.worldcoin.org
              action="submit"
              onSuccess={(result) => handleProof(result)} // pass the proof to the API or your smart contract
            >
              {({open}) => <button className={styles.recordingButton} onClick={open}>World ID Login</button>}
            </IDKitWidget>
          </div>


            </button> */}
          </div>
          <div className={styles.buttonContainer} >
            <button className={styles.recordingButton} style={{width: '800px'}} type="button"
                    onClick={sendBiometric}>
                Send Information
              </button>
          </div>
          <IDKitWidget
            app_id="app_staging_49662fcbff8bf7ca043d45fc46eb065e" // obtained from the Developer Portal
            action="vote_1" // this is your action identifier from the Developer Portal (can also be created on the fly)
            signal="user_value" // any arbitrary value the user is committing to, e.g. for a voting app this could be the vote
            onSuccess={onSuccess => {
              setDoctor(true);
            }}
            credential_types={[CredentialType.Orb, CredentialType.Phone]} // the credentials you want to accept
            //walletConnectProjectId="get_this_from_walletconnect_portal" // optional, obtain from WalletConnect Portal
            enableTelemetry
          >
            {({ open }) => <button
              className={styles.recordingButton}
              style={{width: '800px'}}
              onClick={open}>Verify Doctor
              </button>
            }
          </IDKitWidget>

          <IDKitWidget
            app_id="app_staging_a414e2af064c52df63f1e1f8842b613e" // obtain this from developer.worldcoin.org
            action={action}
            onSuccess={result => console.log(result)} // pass the proof to the API or your smart contract
          />
          {isStartRecording && (
            <>
              <div className={styles.textContainer}>
                <p className={styles.countdown}>{countDown}</p>
                <p className={styles.countdown}> {heartrate}BPM</p>
                <p className={styles.countdown}>{resipration}RR</p>
              </div>
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
            </>
          )}
          {!isRecording && !!charData.rppg.length && (
            <>
            <Line
              data={plotData}
              width={400}
              height={100}
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
            {/* <PatientInfo props={patientData} */}

            {/* /> */}
              <Container>
                <Row>
                  <Col className="text-center">
                    <img src="images/ic_heart_rate.png" alt="hr" width="200" height="200"/>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 'bold',
                    }}>Heart Rate : {heartrate}</div>
                  </Col>
                  <Col className="text-center">
                    <img src="images/ic_respiratory_rate.png" alt="rr" width="200" height="200"/>
                    <p style={{
                      fontSize: '15px',
                      fontWeight: 'bold',
                    }}>Respiration Rate : {resipration}</p>
                  </Col>
                </Row>
                <br />
                <Row>
                  <Col className="text-center">
                    <img src="images/ic_stress.png" alt="stress" width="200" height="200"/>
                    <p style={{
                      fontSize: '15px',
                      fontWeight: 'bold',
                    }}>Stress Level : 4</p>
                  </Col>
                  <Col className="text-center">
                    <img src="images/ic_oxygen_saturation.png" alt="sp" width="200" height="200"/>
                    <p style={{
                      fontSize: '15px',
                      fontWeight: 'bold',
                    }}>SpO2 : 98</p>
                  </Col>
                </Row>
                <br />
                <h3 style={{fontSize: '20px', textAlign: 'center'}}>Comment : carefully</h3>
              </Container>
            </>
          )}
        { //Doctor View
          isDoctor && (
            <div>
              <TextField
                style={{width: '400px', height: '200px'}}
                label="Comment : "
                value={text}
                variant='outlined'
                multiline={true}
              />
              <button className={styles.recordingButton}
               type="submit"
               onClick={() => console.log("your text :: " + text)}
               style={{marginLeft: '10px'}}>Submit</button>
            </div>
          )
        }
        </div>
      </div>
    </div>
  );
};

export default Home;
