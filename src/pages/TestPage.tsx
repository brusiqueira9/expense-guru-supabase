import React from 'react';
import { TestConnection } from '@/components/TestConnection';

export default function TestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Página de Teste do Banco de Dados</h1>
      <p className="mb-6 text-muted-foreground">
        Esta página permite testar a conexão com o banco de dados Supabase e verificar se as transações estão sendo salvas corretamente.
      </p>
      
      <div className="bg-card rounded-lg shadow-md p-6">
        <TestConnection />
      </div>
    </div>
  );
} 