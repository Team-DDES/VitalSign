import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import '../styles/globals.scss';
import '../components/SplashScreen'
import Home from './index'
import Doctor from './doctor'
import Web3 from "web3";


function MyApp({ Component, pageProps }: any) {
  const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
  
  useEffect(() => {
   
  const router = (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doctor/" element={<Doctor />} />
    </Routes>
  );
  const initMetamask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      // Metamask가 설치되어 있는 경우
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3 = new Web3(window.ethereum);
      setIsMetamaskConnected(true);
      // 이제 web3를 사용하여 Metamask와 상호작용할 수 있습니다.
    } else {
      // Metamask가 설치되어 있지 않은 경우 또는 사용자가 거부한 경우
      console.error('Please install Metamask');
    }
  }
  initMetamask();
  }, []);

  if (isMetamaskConnected) {
    return <Component {...pageProps} />;
  } else {
    return ;
  }
}


export default MyApp;
