import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

const socket = io('http://localhost:3000');

// Wick definitions relative to the lamp container
const WICK_CONFIG = [
  { left: '10%', top: '35%', xOffset: -320 },
  { left: '30%', top: '25%', xOffset: -160 },
  { left: '50%', top: '15%', xOffset: 0 },
  { left: '70%', top: '25%', xOffset: 160 },
  { left: '90%', top: '35%', xOffset: 320 },
];

function Lamp({ litWicks }) {
  return (
    <div style={{ position: 'relative', width: '800px', height: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
      {/* 5 Flames absolutely positioned over the Lamp Image */}
      {WICK_CONFIG.map((pos, index) => (
        <div
          key={index}
          className={`lamp-flame ${litWicks[index] ? 'flame-active' : ''}`}
          style={{
            left: pos.left,
            top: pos.top,
            width: '80px',
            height: '130px',
            transform: 'translateX(-50%) translateY(-50%)'
          }}
        />
      ))}

      {/* Main Lamp Image */}
      <img
        src="/images/lamp.png"
        alt="Traditional Indian Lamp"
        style={{ width: '100%', height: '100%', objectFit: 'contain', zIndex: 4 }}
      />
    </div>
  );
}

function App() {
  const [litWicks, setLitWicks] = useState([false, false, false, false, false]);
  const [avatarStatus, setAvatarStatus] = useState(['idle', 'idle', 'idle', 'idle', 'idle']);

  const avatars = [
    '/images/Dr Murali.png',
    '/images/drbenny.png',
    '/images/frantony.png',
    '/images/drleon.png',
    '/images/drramkumar.png'
  ];

  useEffect(() => {
    socket.on('connect', () => console.log('Connected to server'));

    socket.on('light-wick', (data) => {
      const { index } = data;
      setAvatarStatus(prev => {
        const next = [...prev]; next[index] = 'walking'; return next;
      });

      // 1. Walk to lamp (at the top)
      setTimeout(() => {
        setAvatarStatus(prev => {
          const next = [...prev]; next[index] = 'lighting'; return next;
        });

        // 2. Light it
        setTimeout(() => {
          setLitWicks(prev => {
            const next = [...prev]; next[index] = true; return next;
          });

          // 3. Descend to group photo position
          setTimeout(() => {
            setAvatarStatus(prev => {
              const next = [...prev]; next[index] = 'lit'; return next;
            });
          }, 800);

        }, 1200);

      }, 2800);
    });

    return () => {
      socket.off('connect');
      socket.off('light-wick');
    };
  }, []);

  const totalLit = litWicks.filter(Boolean).length;
  const isAnyActive = avatarStatus.some(s => s !== 'idle');
  const phase = totalLit === 5 ? 'complete' : (isAnyActive ? 'active' : 'waiting');

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'var(--bg-color)', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Atmospheric Glow Center Stage */}
      <AnimatePresence>
        {totalLit > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: totalLit * 0.15 }}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'radial-gradient(circle at 50% 30%, rgba(245,158,11,0.4) 0%, transparent 60%)',
              zIndex: 1
            }}
          />
        )}
      </AnimatePresence>

      {/* Conference Header - High Up */}
      <div style={{ marginTop: '5vh', zIndex: 10, textAlign: 'center', width: '90%' }}>
        <motion.h1
          animate={{ opacity: phase === 'complete' ? 0.6 : 1 }}
          className="glow-text"
          style={{ fontSize: '3.2rem', fontWeight: 300, letterSpacing: '10px', textTransform: 'uppercase', margin: 0 }}
        >
          Inauguration of ADSSSC 2026
        </motion.h1>
        <p style={{ fontSize: '1.5rem', letterSpacing: '4px', textTransform: 'uppercase', marginTop: '5px', color: '#eab308', opacity: 0.8 }}>
          IEEE International Conference at Sahrdaya
        </p>
      </div>

      {/* Main Stage (Elevated Lamp) */}
      <div style={{ position: 'relative', width: '100vw', height: '40vh', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5, marginTop: '2vh' }}>
        <motion.div
          animate={{ scale: phase === 'complete' ? 0.8 : 1 }}
          style={{ zIndex: 10 }}
        >
          <Lamp litWicks={litWicks} />
        </motion.div>
      </div>

      {/* Group Photo Area (Bottom Half) */}
      <div style={{ position: 'absolute', bottom: '0', width: '100vw', height: '90vh', pointerEvents: 'none', zIndex: 20 }}>
        {avatars.map((src, i) => {
          const status = avatarStatus[i];
          if (status === 'idle') return null;

          const targetX = WICK_CONFIG[i].xOffset;
          // Vertical movement: 
          // 'walking' or 'lighting' -> matches the lamp (high)
          // 'lit' -> matches group photo (low)
          const isAtTop = status === 'walking' || status === 'lighting';

          return (
            <motion.div
              key={i}
              initial={{ x: 1600, y: '-40vh', opacity: 0 }}
              animate={{
                x: targetX,
                y: isAtTop ? '-42vh' : '0vh',  // Animate down to 0vh for lit
                opacity: 1,
                rotate: status === 'lighting' ? (targetX < 0 ? 8 : -8) : 0,
                scale: status === 'lighting' ? 1.05 : 1,
                filter: isAtTop ? 'brightness(1.2)' : 'brightness(1)'
              }}
              transition={{
                x: { duration: 3, ease: "easeOut" },
                y: { duration: 1.5, ease: "easeInOut" },
                rotate: { duration: 0.5 }
              }}
              className="avatar-container"
              style={{ position: 'absolute', bottom: '10vh', left: '50%', transform: 'translateX(-50%)' }}
            >
              <img
                src={src}
                alt="Inaugurator"
                className={`avatar ${status === 'walking' ? 'walking-animation' : ''}`}
                style={{ width: '220px', height: '480px', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/notionists/svg?seed=Person${i}`;
                }}
              />

              {status !== 'lit' && (
                <motion.div
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ position: 'absolute', top: '-120px', left: '50%', transform: 'translateX(-50%)', color: '#eab308', fontSize: '1rem', letterSpacing: '4px', whiteSpace: 'nowrap' }}
                >
                  {status === 'walking' ? 'APPROACHING' : 'LIGHTING'}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* System Integrity & Messages */}
      <footer style={{ position: 'absolute', bottom: '3vh', zIndex: 10 }}>
        <AnimatePresence>
          {phase === 'waiting' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              style={{ letterSpacing: '12px', fontSize: '0.9rem', color: '#fff' }}
            >
              READY • AWAITING SEQUENCE
            </motion.p>
          )}
        </AnimatePresence>
      </footer>

    </div>
  );
}

export default App;
