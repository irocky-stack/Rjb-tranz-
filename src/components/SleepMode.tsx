import React from 'react';

interface SleepModeProps {
  onWake: () => void;
}

const SleepMode = ({ onWake }: SleepModeProps) => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50" onClick={onWake}>
      <div className="text-white text-center">
        <h2 className="text-2xl mb-4">Sleep Mode</h2>
        <p>Click anywhere to wake up</p>
      </div>
    </div>
  );
};

export default SleepMode;