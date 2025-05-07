import logoOficial from '/icons/logo-oficial.png';

const Logo: React.FC = () => {
  return (
    <div className="relative flex items-center transition-all duration-300 hover:scale-105">
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Visual elements - estáticos */}
        <div className="absolute w-[90%] h-[90%] border border-black/30 rounded-full dark:border-white/30"></div>
        
        {/* Logo image */}
        <div className="relative z-10 w-14 h-14">
          <img 
            src={logoOficial} 
            alt="Expense Guru Logo" 
            className="w-full h-full object-contain grayscale contrast-125 dark:brightness-90" 
          />
        </div>
      </div>
      
      <div className="ml-3 text-left">
        <div className="text-2xl font-bold text-black tracking-tight dark:text-white">
          Expense
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 -mt-1 font-medium">
          Guru
        </div>
      </div>
    </div>
  );
};

export default Logo; 