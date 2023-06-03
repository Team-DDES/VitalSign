import React from 'react';
import styles from './header.module.scss';

const Header = () => (
  <header className={styles.header}>
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: 2, marginTop: 5, marginBottom: 5 }}>
      <a href="https://worldcoin.org/" target="_blank" rel="noopener noreferrer">
        <img
          src="images/worldcoin_logo.png"
          width="188"
          height="32"
        />
      </a>
      <div style={{fontSize: '20px', fontWeight: 'bold', alignSelf: 'center' }}>
        rPPG with WORLDCOIN
      </div>
      <a href="https://github.com/Team-DDES/VitalSign" target="_blank" rel="noopener noreferrer">
        <img
          src="images/innopia_logo.png"
          width="188"
          height="32"
        />
      </a>
    </div>
  
  </header>
);

export default Header;
