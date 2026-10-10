import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Header } from './components/Header';
import { LoginModal, DestinoAcesso } from './components/LoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { PortalAgricultor } from './components/portais/PortalAgricultor';
import { PortalRCA } from './components/portais/PortalRCA';
import { PortalConvidadoExclusivo } from './components/portfolio/PortalConvidadoExclusivo';
import { PortalControleSitio } from './components/portais/PortalControleSitio';
import { CadastroProducao } from './components/cadastros/CadastroProducao';
import { CADASTROS_PROVISORIOS_INICIAIS } from './data/portfolioData';
import { testarConexaoFirestore } from './lib/firebase';
import { sincronizarTodasColecoesFirestore } from './lib/firestoreSync';
import {
  carregarEstoqueProdutos,
  carregarMateriaPrima,
  carregarReceitas,
  carregarFichasTecnicas,
  carregarTabelasPreco
} from './data/produtosData';
import { carregarPedidosVenda } from './data/pedidosVendaData';

export default function App() {
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  
  // Controle de rota / tela dedicada ativa
  // 'HOME' | 'ADMIN' | 'AGRICULTOR' | 'RCA' | 'PROVISORIO' | 'PRODUCAO' | 'SITIO'
  const [telaAtiva, setTelaAtiva] = useState<'HOME' | DestinoAcesso>('HOME');

  useEffect(() => {
    testarConexaoFirestore().then(() => {
      sincronizarTodasColecoesFirestore({
        produtos: carregarEstoqueProdutos(),
        materias: carregarMateriaPrima(),
        receitas: carregarReceitas(),
        fichas: carregarFichasTecnicas(),
        tabelas: carregarTabelasPreco(),
        pedidosVenda: carregarPedidosVenda()
      });
    });
  }, []);

  const handleLoginSuccess = (destino: DestinoAcesso = 'ADMIN') => {
    setTelaAtiva(destino);
  };

  const handleVoltarHome = () => {
    setTelaAtiva('HOME');
  };

  // 1. Portal dos Agricultores (Fornecedores de Mandioca)
  if (telaAtiva === 'AGRICULTOR') {
    return <PortalAgricultor onVoltar={handleVoltarHome} />;
  }

  // 2. Portal do RCA (Representante Comercial Autônomo)
  if (telaAtiva === 'RCA') {
    return <PortalRCA onVoltar={handleVoltarHome} />;
  }

  // 3. Portal do Cadastro Provisório (Portfólio / VIP)
  if (telaAtiva === 'PROVISORIO') {
    const cadastroVip = CADASTROS_PROVISORIOS_INICIAIS[0];
    return (
      <div className="min-h-screen bg-[#02130b] text-white flex flex-col">
        <PortalConvidadoExclusivo
          cadastro={cadastroVip}
          onVoltar={handleVoltarHome}
        />
      </div>
    );
  }

  // 4. Cadastro Produção (Página dedicada para a equipe da fábrica)
  if (telaAtiva === 'PRODUCAO') {
    return (
      <div className="min-h-screen bg-[#f4f8f5] flex flex-col">
        <header className="bg-[#022013] text-white px-6 py-4 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <button
              onClick={handleVoltarHome}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              ← Voltar ao Início
            </button>
            <div>
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Grupo ENO · Chão de Fábrica</div>
              <h1 className="text-base sm:text-lg font-black text-white">Cadastro e Gestão da Produção</h1>
            </div>
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
          <CadastroProducao />
        </div>
      </div>
    );
  }

  // 5. Cadastro Controle do Sítio (Mandiocultura & Talhões)
  if (telaAtiva === 'SITIO') {
    return <PortalControleSitio onVoltar={handleVoltarHome} />;
  }

  // 6. Painel Geral Administrativo (Visão Geral, Pedidos, Produtos, Financeiro, etc.)
  if (telaAtiva === 'ADMIN') {
    return <AdminDashboard onLogout={handleVoltarHome} />;
  }

  // TELA INICIAL (Landing Page Corporativa Limpa)
  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 text-slate-900 flex flex-col justify-between select-none relative">
      
      {/* Background sutil com luminosidade suave e limpa */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-400/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[550px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      {/* 1. TOPO: Marca na esquerda e 'Acessar o Sistema' na direita */}
      <Header onOpenLogin={() => setIsLoginOpen(true)} />

      {/* 2. CONTEÚDO CENTRAL: Limpo, direto e sem rolagem */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 text-center max-w-5xl mx-auto w-full relative z-10 py-4 sm:py-6">
        
        {/* Título Principal */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] max-w-4xl text-balance">
          Controle Completo para Fábricas, Agroindústrias e Produtores Rurais
        </h1>

        {/* Descrição curta e objetiva */}
        <p className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Do campo à indústria: gerencie pesagens de raiz, cálculo na roça, processos de fabricação, estoque de féculas e expedição de pedidos em uma única plataforma.
        </p>

        {/* Botão de Acesso Principal */}
        <div className="mt-7 sm:mt-8 flex items-center justify-center">
          <button
            onClick={() => setIsLoginOpen(true)}
            className="
              inline-flex items-center justify-center gap-2.5
              rounded-xl
              bg-emerald-600 hover:bg-emerald-700
              border border-emerald-600
              px-7 py-3.5 sm:px-8 sm:py-4
              text-sm sm:text-base font-bold text-white
              shadow-lg shadow-emerald-700/20
              transition-all duration-150
              hover:-translate-y-0.5
              active:translate-y-0
              cursor-pointer whitespace-nowrap
            "
          >
            <span>Acessar o Sistema</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>

      </main>

      {/* 3. RODAPÉ COMPACTO */}
      <footer className="w-full border-t border-slate-200/80 bg-white/70 backdrop-blur-xs px-6 py-3.5 text-xs text-slate-500 shrink-0 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 Grupo ENO · Sistema Integrado para Fábricas, Agroindústrias e Produtores Rurais</span>
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ambiente Corporativo Seguro</span>
          </div>
        </div>
      </footer>

      {/* Modal de Autenticação e Escolha de Portais */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}
