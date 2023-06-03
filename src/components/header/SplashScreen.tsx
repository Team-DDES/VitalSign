import React from 'react';
import styled, { keyframes } from 'styled-components';

const SplashContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
`;

const loading = keyframes`
  0% { width: 0% }
  100% { width: 100% }
`;

const SplashProgressBar = styled.div`
  position: relative;
  height: 20px;
  width: 80%;
  background-color: #ddd;
`;

const ProgressBar = styled.div`
  height: 100%;
  width: 0;
  background-color: #008CBA;
  animation: ${loading} 2s ease-in-out;
`;