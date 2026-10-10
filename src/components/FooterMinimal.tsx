import React from 'react';

/**
 * FooterMinimal - Grupo ENO v13
 * Faixa de fora a fora (full width) em tom escuro com sombra projetada sobre o conteúdo.
 */
export function FooterMinimal() {
  return (
    <footer id="contato" className="relative z-30 w-full bg-[#02140b] text-slate-300 border-t border-emerald-950 shadow-inner">
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-12 py-12 sm:py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-emerald-900/40">
          {/* Coluna 1: Marca & Missão */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                ENO
              </div>
              <span className="text-xl font-black text-white tracking-tight">GRUPO ENO</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Agroindústria integrada, beneficiamento de raízes de mandioca, produção de féculas nativas, polvilhos especiais e farinhas com padrão de excelência.
            </p>
            <div className="text-[11px] text-emerald-400 font-mono pt-1">
              CNPJ: 14.285.901/0001-44
            </div>
          </div>

          {/* Coluna 2: Planta Industrial */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Unidade Industrial</h4>
            <ul className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
              <li>Rodovia PR-218, Km 14</li>
              <li>Polo Mandioqueiro do Noroeste</li>
              <li>Paranavaí - PR · CEP 87700-000</li>
              <li className="text-emerald-400">Capacidade: 48.000 ton/ano</li>
            </ul>
          </div>

          {/* Coluna 3: Atendimento B2B & Roça */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Canais Diretos</h4>
            <ul className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
              <li>Atendimento ao Produtor Rural</li>
              <li>Vendas Industriais e Exportação</li>
              <li>comercial@grupoeno.com.br</li>
              <li>(44) 3421-8800 · Balança da Roça</li>
            </ul>
          </div>

          {/* Coluna 4: Certificações */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Padrão de Qualidade</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Controle físico-químico lote a lote. Sistema calibrado de balança hidrostática com determinação rigorosa do teor de amido.
            </p>
            <div className="text-[11px] text-slate-500 font-medium">
              Rastreabilidade do Talhão à Mesa
            </div>
          </div>
        </div>

        {/* Linha inferior de copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Grupo ENO Indústria e Agronegócio. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-6">
            <span>Privacidade & Compliance</span>
            <span aria-hidden="true">·</span>
            <span>Termos de Fornecimento</span>
            <span aria-hidden="true">·</span>
            <span>Portal do Produtor</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
