import React, { useState } from 'react';
import FunnelXLandingShader from './FunnelXLandingShader';
import FunnelxOpening from './FunnelxOpening';
import CRMSuite from './CRMSuite';
import CleanRocketTransition from './CleanRocketTransition';

function App() {
  const [step, setStep] = useState('landing'); // 'landing' | 'select' | 'dashboard'
  const [userPath, setUserPath] = useState(null);
  const [isScreenFading, setIsScreenFading] = useState(false);
  const [rocketActive, setRocketActive] = useState(false);

  const handleIgnite = () => {
    setRocketActive(true);
    setIsScreenFading(true);
    setTimeout(() => {
      setStep('select');
      setTimeout(() => {
        setIsScreenFading(false);
      }, 50);
    }, 330);
  };

  const handlePathSelect = (pathId) => {
    setUserPath(pathId);
    localStorage.setItem('funnelx_path', pathId);

    setRocketActive(true);
    setIsScreenFading(true);
    setTimeout(() => {
      setStep('dashboard');
      setTimeout(() => {
        setIsScreenFading(false);
      }, 50);
    }, 330);
  };

  return (
    <>
      <div
        className="app-screen-container"
        style={{
          opacity: isScreenFading ? 0 : 1,
          transform: isScreenFading ? 'translateY(8px)' : 'translateY(0)',
          transition: 'opacity 250ms ease-out, transform 250ms ease-out',
          minHeight: '100vh',
          width: '100%'
        }}
      >
        {step === 'landing' && (
          <FunnelXLandingShader onPathSelect={handleIgnite} />
        )}
        {step === 'select' && (
          <FunnelxOpening onSelectPath={handlePathSelect} />
        )}
        {step === 'dashboard' && (
          <CRMSuite userPath={userPath} />
        )}
      </div>
      {rocketActive && (
        <CleanRocketTransition
          key="app-rocket-transition"
          direction="right"
          duration={700}
          onComplete={() => setRocketActive(false)}
        />
      )}
    </>
  );
}

export default App;
