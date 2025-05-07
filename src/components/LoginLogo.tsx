import logoPreta from '/icons/logopreta.png';

const LoginLogo: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Logo para tela de login */}
      <div className="mb-2">
        <img 
          src={logoPreta} 
          alt="Expense Guru Logo" 
          className="w-36 h-36 object-contain" 
        />
      </div>
      
      {/* Texto abaixo da logo */}
      <div className="text-center">
        <div className="text-3xl font-bold text-black tracking-tight">
          Expense
        </div>
        <div className="text-xl text-gray-600 -mt-1 font-medium">
          Guru
        </div>
      </div>
    </div>
  );
};

export default LoginLogo; 