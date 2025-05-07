import logoPreta from '/icons/logopreta.png';
import logoBranca from '/icons/logobranca.png';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center transition-all duration-300 hover:scale-105 gap-3">
      {/* Logo - versões diferentes para modo claro e escuro */}
      <div className="w-16 h-16 flex items-center justify-center">
        {/* Logo para modo claro (escondida no modo escuro) */}
        <img 
          src={logoPreta} 
          alt="Expense Guru Logo" 
          className="w-full h-full object-contain block dark:hidden" 
        />
        
        {/* Logo branca para modo escuro (escondida no modo claro) */}
        <img 
          src={logoBranca} 
          alt="Expense Guru Logo" 
          className="w-full h-full object-contain hidden dark:block" 
        />
      </div>
      
      <div className="text-left">
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