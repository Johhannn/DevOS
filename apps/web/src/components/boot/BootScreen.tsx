import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from '../../stores/systemStore';
import { twMerge } from 'tailwind-merge';

const LOGS = [
  'DevOS v1.0.0',
  'Initialising kernel...',
  'Loading Virtual File System...',
  'Registering services...',
  'Starting desktop environment...',
  'Welcome.'
];

export function BootScreen() {
  const bootStatus = useSystemStore((s) => s.bootStatus);
  const boot = useSystemStore((s) => s.boot);
  
  const [visibleLogs, setVisibleLogs] = useState<number>(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let currentLog = 0;
    
    // Simulate log display
    const showLogs = async () => {
      for (let i = 0; i < LOGS.length; i++) {
        // Random delay between 200-400ms
        const delay = Math.random() * 200 + 200;
        await new Promise((resolve) => setTimeout(resolve, delay));
        currentLog++;
        setVisibleLogs(currentLog);
        setProgress((currentLog / LOGS.length) * 100);
      }
      
      // Wait a tiny bit after the last log ('Welcome.'), then finish boot
      setTimeout(() => {
        boot();
      }, 500);
    };

    showLogs();
  }, [boot]);

  return (
    <AnimatePresence>
      {bootStatus === 'booting' && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-desktop"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
          <div className="flex flex-col items-center max-w-lg w-full px-6 space-y-8">
            
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-3 mb-4"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/50 flex items-center justify-center text-white text-3xl font-bold">
                DO
              </div>
              <h1 className="text-4xl font-extrabold text-white tracking-widest">DevOS</h1>
            </motion.div>

            {/* Loading Bar */}
            <div className="w-64 h-1.5 bg-black/40 rounded-full overflow-hidden mb-8 border border-white/10">
              <motion.div
                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>

            {/* Terminal Logs */}
            <div className="w-full h-40 bg-black/60 rounded border border-white/5 p-4 font-mono text-xs overflow-hidden leading-relaxed shadow-xl text-left">
              {LOGS.slice(0, visibleLogs).map((log, index) => (
                <div 
                  key={index} 
                  className={twMerge(
                    "text-gray-300",
                    index === LOGS.length - 1 && "text-blue-400 font-semibold"
                  )}
                >
                  <span className="text-gray-500 mr-2">[{new Date().toISOString().substring(11, 23)}]</span>
                  {log}
                </div>
              ))}
            </div>
            
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
