import React from 'react';
import styles from './header.module.scss';

const Header = () => (
  <header className={styles.header}>
    <view style={{padding: 2, marginTop: 5, marginBottom: 5}}>
      <a href="https://github.com/ubicomplab/rppg-web" target="_blank">
        <img
          src="images/worldcoin_logo.png"
          width="188"
          height="32"
        />
      </a>
      <a 
        className={styles.github}
        href="https://github.com/ubicomplab/rppg-web" target="_blank">
          GITHUB
      </a>
    </view>
    
  </header>
);

export default Header;
