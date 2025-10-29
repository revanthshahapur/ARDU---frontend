// src/components/loaders/AutoRickshawLoader.jsx (Final Z-Index & Position Fix)

import React from 'react';

const autoImage = './tem1.png'; // or use the full path from your public folder

const AutoRickshawLoader = () => {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen 
                    bg-gradient-to-t from-[#b3e5fc] to-[#e1f5fe] 
                    overflow-hidden z-[9999] flex items-end justify-center">
      
      <style>{`
        .road-fix {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 100px;
          background: #555;
          border-top: 5px solid #333;
          z-index: 10; 
        }

        .auto-fix {
          position: absolute;
          bottom: 100px;
          width: 300px;
          z-index: 20;
          animation: auto-move 15s linear infinite; 
        }

        .auto-fix img {
          width: 300px;
          height: auto;
          display: block;
          transform: scaleX(-1);
        }

        @keyframes auto-move {
          0% { 
            transform: translateX(-100%);
          }
          100% { 
            transform: translateX(100vw);
          }
        }
      `}</style>
      
      <div className="road-fix"></div>

      <div className="auto-fix">
        <img src={autoImage} alt="Auto Rickshaw" />
      </div>
    </div>
  );
};

export default AutoRickshawLoader;