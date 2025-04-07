import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ShortcutGuide {
  key: string;
  description: string;
  action: () => void;
}

// Exportando a função de mostrar ajuda para uso em outros componentes
export const showKeyboardHelp = (shortcuts: ShortcutGuide[]) => {
  const helpContent = shortcuts.map(s => 
    `<div class="flex justify-between items-center py-2 border-b border-gray-100">
      <kbd class="px-3 py-1.5 text-sm font-semibold bg-muted rounded-md shadow-sm border border-gray-300">${s.key}</kbd>
      <span class="ml-4 text-sm font-medium">${s.description}</span>
    </div>`
  ).join('');

  toast.info(
    <div>
      <h3 className="text-lg font-semibold mb-3 text-center border-b pb-2">Atalhos de Teclado</h3>
      <div 
        className="space-y-1 max-h-[70vh] overflow-y-auto pr-2" 
        dangerouslySetInnerHTML={{ __html: helpContent }} 
      />
      <div className="mt-3 pt-2 border-t text-xs text-center text-muted-foreground">
        Pressione <kbd className="px-1.5 py-0.5 rounded border border-gray-300 bg-muted text-xs">?</kbd> a qualquer momento para mostrar esta ajuda
      </div>
    </div>,
    {
      duration: 10000,
      position: 'top-center',
      className: 'keyboard-shortcuts-toast',
      style: {
        width: '400px',
        maxWidth: '95vw',
      }
    }
  );
};

export function KeyboardShortcuts() {
  const navigate = useNavigate();
  const [keySequence, setKeySequence] = useState('');
  
  // Lista de atalhos disponíveis
  const shortcuts: ShortcutGuide[] = [
    { 
      key: 'h', 
      description: 'Ir para Dashboard', 
      action: () => navigate('/') 
    },
    { 
      key: 't', 
      description: 'Ir para Transações', 
      action: () => navigate('/transactions') 
    },
    { 
      key: 'c', 
      description: 'Ir para Categorias', 
      action: () => navigate('/categories') 
    },
    { 
      key: 'r', 
      description: 'Ir para Relatórios', 
      action: () => navigate('/reports') 
    },
    { 
      key: 's', 
      description: 'Ir para Configurações', 
      action: () => navigate('/settings') 
    },
    { 
      key: 'n', 
      description: 'Nova Transação', 
      action: () => navigate('/?tab=add') 
    },
    { 
      key: '?', 
      description: 'Mostrar Ajuda', 
      action: () => showHelp() 
    },
    { 
      key: 'Escape', 
      description: 'Fechar pop-ups', 
      action: () => document.body.click() 
    },
  ];

  const showHelp = () => {
    showKeyboardHelp(shortcuts);
  };

  useEffect(() => {
    let keyTimer: ReturnType<typeof setTimeout>;

    // Manipulador de eventos de teclado
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar atalhos quando estiver em campos de entrada
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement || 
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      // Tecla Escape tratada diretamente
      if (e.key === 'Escape') {
        const shortcut = shortcuts.find(s => s.key === 'Escape');
        if (shortcut) shortcut.action();
        return;
      }

      // Para o caractere de interrogação
      if (e.key === '?') {
        e.preventDefault();
        const shortcut = shortcuts.find(s => s.key === '?');
        if (shortcut) shortcut.action();
        return;
      }

      // Para outras teclas, construa a sequência
      const key = e.key.toLowerCase();
      
      // Limpar timer anterior
      clearTimeout(keyTimer);
      
      // Verificar primeiro se a tecla sozinha é um atalho
      const singleKeyShortcut = shortcuts.find(s => 
        s.key.toLowerCase() === key
      );
      
      if (singleKeyShortcut) {
        singleKeyShortcut.action();
        setKeySequence('');
        return;
      }
      
      // Caso não seja, adicionar a tecla à sequência
      const newSequence = keySequence ? keySequence + ' ' + key : key;
      setKeySequence(newSequence);
      
      // Verificar se a nova sequência corresponde a algum atalho
      const matchingShortcut = shortcuts.find(s => 
        s.key.toLowerCase() === newSequence
      );
      
      if (matchingShortcut) {
        matchingShortcut.action();
        setKeySequence('');
      } else {
        // Se não corresponder a nenhum atalho após 1 segundo, reiniciar a sequência
        keyTimer = setTimeout(() => {
          setKeySequence('');
        }, 1000);
      }
    };

    // Registrar o manipulador de eventos
    window.addEventListener('keydown', handleKeyDown);
    
    // Limpar o manipulador de eventos ao desmontar o componente
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(keyTimer);
    };
  }, [keySequence, navigate]); // Adicionar dependências

  // Componente sem renderização visível
  return null;
} 