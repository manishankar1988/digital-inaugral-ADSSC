import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

const socket = io('http://localhost:3000');

function Lamp({ litWicks }) {
  // Positions for 5 wicks distributed along the top of the lamp image
  const wickPositions = [
    { left: '10%', top: '35%' },
    { left: '30%', top: '25%' },
    { left: '50%', top: '15%' },
    { left: '70%', top: '25%' },
    { left: '90%', top: '35%' },
  ];

  return (
    <div style={{ position: 'relative', width: '500px', height: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', zIndex: 10 }}>
      {/* 5 Flames absolutely positioned over the Lamp Image */}
      {wickPositions.map((pos, index) => (
        <div
          key={index}
          className={`lamp-flame ${litWicks[index] ? 'flame-active' : ''}`}
          style={{ ...pos }}
        />
      ))}

      {/* Main Lamp Image from Public/Images Folder */}
      <img
        src="/images/lamp.png"
        alt="Traditional Indian Lamp"
        style={{ width: '100%', height: '100%', objectFit: 'contain', zIndex: 4 }}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      {/* Fallback if image is missing */}
      <div style={{ display: 'none', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.1)', border: '2px dashed #b45309', borderRadius: '10px', alignItems: 'center', justifyContent: 'center', color: '#b45309', textAlign: 'center', padding: '20px' }}>
        Paste your <b>lamp.png</b> in the <code>public/images/</code> folder!
      </div>
    </div>
  );
}

function App() {
  const [litWicks, setLitWicks] = useState([false, false, false, false, false]);
  const [walkingWicks, setWalkingWicks] = useState([false, false, false, false, false]);

  const avatars = [
    '/images/avatar1.jpg',
    '/images/avatar2.jpg',
    '/images/avatar3.jpg',
    '/images/avatar4.jpg',
    '/images/avatar5.jpg'
  ];

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('light-wick', (data) => {
      const { index } = data;
      console.log(`Starting sequence for index ${index}`);

      // Avatar begins walking
      setWalkingWicks(prev => {
        const nw = [...prev]; nw[index] = true; return nw;
      });

      // Avatar takes 2.5 seconds to walk in (duration: 3). We wait 3s then light.
      setTimeout(() => {
        setLitWicks(prev => {
          const nl = [...prev]; nl[index] = true; return nl;
        });
        setWalkingWicks(prev => {
          const nw = [...prev]; nw[index] = false; return nw;
        });
      }, 3000);
    });

    return () => {
      socket.off('connect');
      socket.off('light-wick');
    };
  }, []);

  const totalLit = litWicks.filter(Boolean).length;
  const phase = totalLit === 5 ? 'complete' : (totalLit > 0 || walkingWicks.some(Boolean) ? 'active' : 'waiting');

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>

      {/* Background Glow */}
      <AnimatePresence>
        {totalLit > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: totalLit * 0.2 }}
            transition={{ duration: 1 }}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'radial-gradient(circle at 50% 70%, rgba(245,158,11,0.3) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', zIndex: 10, position: 'relative' }}>

        {/* Title */}
        <motion.h1
          animate={{ y: phase !== 'waiting' ? -100 : 0, scale: phase !== 'waiting' ? 0.9 : 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="glow-text"
          style={{ fontSize: '3vw', fontWeight: 300, letterSpacing: '6px', textTransform: 'uppercase', marginBottom: '20px', textAlign: 'center', zIndex: 10 }}
        >
          {phase === 'complete' ? 'Inauguration Complete' : 'Welcome to the inaugral Ceremony of ADSSSC 2026'}
        </motion.h1>

        {/* Avatars Container */}
        <div style={{ display: 'flex', gap: '40px', marginBottom: '80px', height: '300px', alignItems: 'flex-end', zIndex: 5 }}>
          <AnimatePresence>
            {avatars.map((srcPath, i) => {
              const isWalking = walkingWicks[i];
              const isLit = litWicks[i];

              // Only render if they are walking or have already lit their wick
              if (!isWalking && !isLit) return null;

              return (
                <motion.div
                  key={i}
                  initial={{ x: '100vw', opacity: 0 }}
                  // Slower walking duration
                  animate={{ x: 0, opacity: 1 }}
                  transition={{
                    duration: 2.8,
                    ease: "linear"
                  }}
                  className="avatar-container"
                >
                  <img
                    src={srcPath}
                    alt={`Inaugurator ${i + 1}`}
                    // Add walking-animation class only if they are actively walking
                    className={`avatar ${isWalking ? 'walking-animation active' : ''}`}
                    style={{ width: '130px', height: '300px' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://api.dicebear.com/7.x/notionists/svg?seed=Missing${i}&backgroundColor=transparent`;
                    }}
                  />
                  {isWalking && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ position: 'absolute', bottom: '-40px', color: '#eab308', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px' }}
                    >
                      Approaching...
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* The Lamp */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: phase !== 'waiting' ? 1 : 0, y: phase !== 'waiting' ? 0 : 50 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ zIndex: 10 }}
        >
          <Lamp litWicks={litWicks} />
        </motion.div>

        {/* Footer info */}
        <AnimatePresence>
          {phase === 'waiting' && (
            <motion.p
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', bottom: '10%', opacity: 0.5, letterSpacing: '2px', fontSize: '1.2vw' }}
            >
              Awaiting signals from the Operator Panel...
            </motion.p>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default App;
