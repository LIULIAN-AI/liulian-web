'use client';

import { Wifi, Bot, Keyboard } from 'lucide-react';
import styles from './assistant.module.css';

export default function StatusBar() {
  return (
    <div className={styles.statusBar}>
      <div className={styles.statusBarLeft}>
        <span className={styles.statusBarItem}>
          <Wifi size={11} />
          Connected
        </span>
        <span className={styles.statusBarDot} />
        <span className={styles.statusBarItem}>
          <Bot size={11} />
          AI Ready
        </span>
      </div>
      <div className={styles.statusBarRight}>
        <span className={styles.statusBarItem}>
          <Keyboard size={11} />
          <kbd>Cmd+Shift+F</kbd> Chat
          <kbd>Cmd+Shift+C</kbd> Canvas
          <kbd>Cmd+Shift+W</kbd> Both
          <kbd>Cmd+B</kbd> Sidebar
        </span>
      </div>
    </div>
  );
}
