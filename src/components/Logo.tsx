import React, { useEffect, useState } from 'react';
import money from '@/assets/money.png';

const Logo: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [rotation, setRotation] = useState(0);
  
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      if (isHovering) {
        setRotation(prev => (prev + 1) % 360);
      }
    }, 20);
    
    return () => clearInterval(rotationInterval);
  }, [isHovering]);

  return (
    <div 
      className="relative flex items-center cursor-pointer transition-all duration-300 hover:scale-105"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative w-14 h-14 flex items-center justify-center">
        {/* Visual elements */}
        <div className="absolute w-full h-full bg-black rounded-full opacity-[0.08] animate-pulse-slow"></div>
        <div className="absolute w-[90%] h-[90%] border border-black/30 rounded-full"></div>
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent"
            style={{ transform: `rotate(${rotation}deg)` }}
          ></div>
        </div>
        
        {/* Logo image */}
        <div className="relative z-10 w-8 h-8">
          <img src={money} alt="Money Icon" className="w-full h-full object-contain grayscale contrast-150" />
        </div>
      </div>
      
      <div className="ml-2 text-left">
        <div className="text-xl font-semibold text-black tracking-tight transition-all duration-300 group-hover:tracking-wide">
          Expense
        </div>
        <div className="text-sm text-gray-600 -mt-1 font-medium">
          Guru
        </div>
      </div>
    </div>
  );
};

export default Logo; 