import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, User } from 'lucide-react';

const socket = io('https://digital-inaugral-adssc.onrender.com');

function App() {
  const [statuses, setStatuses] = useState(Array(5).fill('ready')); // ready, sending, sent

  useEffect(() => {
    socket.on('connect', () => console.log('Connected to server'));
    return () => socket.off('connect');
  }, []);

  const handleInitiate = (index) => {
    if (statuses[index] !== 'ready') return;
    
    setStatuses(prev => {
      const nw = [...prev]; nw[index] = 'sending'; return nw;
    });
    
    setTimeout(() => {
      socket.emit('light-wick', { index, timestamp: Date.now() });
      
      setStatuses(prev => {
        const nw = [...prev]; nw[index] = 'sent'; return nw;
      });
    }, 800);
  };

  return (
    <div style={{
        display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%',
        padding: '20px'
    }}>
      <h1 style={{ marginBottom: '40px', fontSize: '2rem', fontWeight: 600, letterSpacing: '1px' }}>
        Digital Inauguration
      </h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', maxWidth: '800px' }}>
        {[0, 1, 2, 3, 4].map(index => {
          const status = statuses[index];
          return (
            <motion.button
              key={index}
              whileHover={{ scale: status === 'ready' ? 1.05 : 1 }}
              whileTap={{ scale: status === 'ready' ? 0.95 : 1 }}
              disabled={status !== 'ready'}
              onClick={() => handleInitiate(index)}
              style={{
                position: 'relative',
                padding: '20px 40px',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'white',
                background: status === 'sent' ? 'var(--success-color)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                borderRadius: '20px',
                cursor: status === 'ready' ? 'pointer' : 'not-allowed',
                boxShadow: `0 0 20px ${status === 'sent' ? 'var(--success-glow)' : 'var(--accent-glow)'}`,
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                overflow: 'hidden'
              }}
            >
              {status === 'ready' && (
                <>
                  <User size={24} />
                  <span>Person {index + 1}</span>
                </>
              )}
              
              {status === 'sending' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  <div className="spinner" style={{ 
                    width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.3)', 
                    borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' 
                  }} />
                  <span>Activating...</span>
                </motion.div>
              )}

              {status === 'sent' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  <CheckCircle2 size={24} />
                  <span>Lit Wick {index + 1}</span>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
      
      <p style={{ marginTop: '40px', opacity: 0.6, fontSize: '0.9rem' }}>
        Press a button to summon the respective person
      </p>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default App;
