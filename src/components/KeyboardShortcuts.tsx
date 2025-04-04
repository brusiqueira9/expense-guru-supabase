import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ShortcutGuide {
  key: string;
  description: string;
  action: () => void;
}

export function KeyboardShortcuts() {
  const navigate = useNavigate();

  // Lista de atalhos disponíveis
  const shortcuts: ShortcutGuide[] = [
    { 
      key: 'g d', 
      description: 'Ir para Dashboard', 
      action: () => navigate('/dashboard') 
    },
    { 
      key: 'g t', 
      description: 'Ir para Transações', 
      action: () => navigate('/transactions') 
    },
    { 
      key: 'g c', 
      description: 'Ir para Gráficos', 
      action: () => navigate('/charts') 
    },
    { 
      key: 'g r', 
      description: 'Ir para Relatórios', 
      action: () => navigate('/reports') 
    },
    { 
      key: 'g s', 
      description: 'Ir para Configurações', 
      action: () => navigate('/settings') 
    },
    { 
      key: 'n t', 
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

  // Estado para controlar a sequência de teclas pressionadas
  let keySequence = '';
  let keyTimer: ReturnType<typeof setTimeout>;

  const showHelp = () => {
    const helpContent = shortcuts.map(s => 
      `<div class="flex justify-between py-1">
        <span class="font-mono bg-muted px-2 rounded">${s.key}</span>
        <span class="ml-4">${s.description}</span>
      </div>`
    ).join('');

    toast.info(
      <div>
        <h3 className="text-lg font-medium mb-2">Atalhos de Teclado</h3>
        <div 
          className="space-y-1 text-sm" 
          dangerouslySetInnerHTML={{ __html: helpContent }} 
        />
      </div>,
      {
        duration: 8000,
        position: 'top-center',
        className: 'keyboard-shortcuts-toast',
        style: {
          width: '350px',
        }
      }
    );
  };

  useEffect(() => {
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

      // Para outras teclas, construa a sequência
      const key = e.key.toLowerCase();
      
      // Limpar timer anterior
      clearTimeout(keyTimer);
      
      // Adicionar a tecla à sequência
      keySequence += keySequence ? ' ' + key : key;
      
      // Verificar se a sequência corresponde a algum atalho
      const matchingShortcut = shortcuts.find(s => 
        s.key.toLowerCase() === keySequence
      );
      
      if (matchingShortcut) {
        matchingShortcut.action();
        keySequence = '';
      } else {
        // Se não corresponder a nenhum atalho após 1 segundo, reiniciar a sequência
        keyTimer = setTimeout(() => {
          keySequence = '';
        }, 1000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null; // Componente sem renderização
} 