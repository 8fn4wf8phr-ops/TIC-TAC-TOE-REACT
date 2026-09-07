import { useState, useEffect } from 'react';
import { setSoundEnabled } from '../utils/sounds';

// Persists the sound on/off preference to localStorage, mirroring useTheme.
export function useSound() {
  const [soundOn, setSoundOn] = useState(() => {
    try {
      const saved = localStorage.getItem('ttt-react-sound');
      if (saved !== null) return saved === 'on';
    } catch {
      /* ignore */
    }
    return true;
  });

  useEffect(() => {
    setSoundEnabled(soundOn);
    try {
      localStorage.setItem('ttt-react-sound', soundOn ? 'on' : 'off');
    } catch {
      /* ignore */
    }
  }, [soundOn]);

  function toggleSound() {
    setSoundOn((s) => !s);
  }

  return { soundOn, toggleSound };
}
