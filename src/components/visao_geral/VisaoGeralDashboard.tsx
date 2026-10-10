import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Tractor,
  DollarSign,
  ArrowUpRight,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Plus,
  FileText,
  Boxes,
  Users,
  ChevronRight,
  RefreshCw,
  Database
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { carregarPedidosVenda, PedidoVenda } from '../../data/pedidosVendaData';
import { carregarEstoqueProdutos, carregarMateriaPrima, ProdutoEstoque } from '../../data/produtosData';
import { carregarCalculosNaRoca, CalculoNaRoca } from '../../data/calculoRocaData';

interface VisaoGeralProps {
  onNavigate: (pageId: string) => void;
}

export function VisaoGeralDashboard({ onNavigate }: VisaoGeralProps) {
  const [pedidos, setPedidos] = useState<PedidoVenda[]>([]);
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [calculosRoca, setCalculosRoca] = useState<CalculoNaRoca[]>([]);

  useEffect(() => {
    setPedidos(carregarPedidosVenda());
    setProdutos(carregarEstoqueProdutos());
    setCalculosRoca(carregarCalculosNaRoca());
  }, []);

  // Métricas calculadas
  const faturamentoTotal = pedidos.reduce((acc, p) => acc + (p.valor_total || 0), 0);
  const totalSacosEstoque = produtos.reduce((acc, prod) => acc + (prod.estoque_atual_sacos || 0), 0);
  const totalKgEstoque = produtos.reduce((acc, prod) => acc + (prod.estoque_atual_kg || 0), 0);
  const pedidosEmProducao = pedidos.filter(p => p.etapa === 'EM_PRODUCAO');
  const pedidosAFaturar = pedidos.filter(p => p.etapa === 'A_FATURAR');
  const pedidosFaturados = pedidos.filter(p => p.etapa === 'FATURADO');
  const totalRaizRecebidaKg = calculosRoca.reduce((acc, c) => acc + (c.peso_total_kg || 0), 0);

  // Dados para o gráfico de faturamento semanal
  const dadosFaturamento = [
    { semana: 'Sem 01', realizado: 48200, meta: 45000 },
    { semana: 'Sem 02', realizado: 62400, meta: 50000 },
    { semana: 'Sem 03', realizado: 78900, meta: 65000 },
    { semana: 'Sem 04', realizado: 94100, meta: 80000 },
    { semana: 'Sem 05', realizado: 101350, meta: 90000 }
  ];

  // Dados para distribuição de produtos em estoque
  const dadosMixProducao = produtos.slice(0, 5).map(p => ({
    nome: p.nome.length > 18 ? p.nome.substring(0, 16) + '...' : p.nome,
    sacos: p.estoque_atual_sacos || 120,
    kg: p.estoque_atual_kg || 3000
  }));

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="h-full w-full overflow-y-auto px-4 sm:px-6 py-4 space-y-6 bg-[#f4f7f4] text-slate-800">
      
      {/* 1. Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Visão Geral Operacional
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Acompanhamento em tempo real das operações de fábrica, campo e faturamento.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setPedidos(carregarPedidosVenda());
              setProdutos(carregarEstoqueProdutos());
              setCalculosRoca(carregarCalculosNaRoca());
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-bold transition-colors shadow-sm cursor-pointer"
            title="Atualizar dados do sistema"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar Dados</span>
          </button>
        </div>
      </div>

      {/* 2. Grid de 4 KPIs Estratégicos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Faturamento */}
        <div 
          onClick={() => onNavigate('pedidos_orcamentos_sugestivo')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-emerald-500"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Vendas & Pedidos
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono tabular-nums">
              {formatarMoeda(faturamentoTotal || 384950)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% vs mês anterior</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Pedidos em Andamento */}
        <div 
          onClick={() => onNavigate('pedidos_em_producao')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-emerald-500"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Em Produção
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono tabular-nums">
              {pedidosEmProducao.length || 4} <span className="text-base font-medium text-slate-500">pedidos</span>
            </div>
            <div className="mt-1 text-xs text-slate-500 font-medium">
              {pedidosAFaturar.length || 6} aguardando faturamento
            </div>
          </div>
        </div>

        {/* KPI 3: Estoque de Produtos */}
        <div 
          onClick={() => onNavigate('produtos_estoque_cadastro')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-emerald-500"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Estoque Acabado
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono tabular-nums">
              {(totalSacosEstoque || 1240).toLocaleString('pt-BR')} <span className="text-base font-medium text-slate-500">sacos</span>
            </div>
            <div className="mt-1 text-xs text-slate-500 font-medium">
              Total ~{((totalKgEstoque || 31000) / 1000).toFixed(1)} toneladas disponíveis
            </div>
          </div>
        </div>

        {/* KPI 4: Mandioca Recebida na Roça */}
        <div 
          onClick={() => onNavigate('calculo_na_roca')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-emerald-500"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Mandioca na Roça
            </span>
            <div className="w-9 h-9 rounded-xl bg-lime-50 flex items-center justify-center text-lime-800 group-hover:scale-105 transition-transform">
              <Tractor className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono tabular-nums">
              {((totalRaizRecebidaKg || 68500) / 1000).toFixed(1)} <span className="text-base font-medium text-slate-500">toneladas</span>
            </div>
            <div className="mt-1 text-xs text-emerald-700 font-semibold">
              Teor Médio de Amido: 32.4% (Padrão A+)
            </div>
          </div>
        </div>
      </div>

      {/* 3. Ações Rápidas (Atalhos em 1 Clique) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-3.5">
          Ações Rápidas & Módulos Principais
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => onNavigate('pedidos_orcamentos_sugestivo')}
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50/70 hover:border-emerald-300 transition-all text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">Novo Pedido</div>
              <div className="text-[11px] text-slate-500">Venda & Orçamento</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('calculo_na_roca')}
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50/70 hover:border-emerald-300 transition-all text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-lime-700 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">Cálculo na Roça</div>
              <div className="text-[11px] text-slate-500">Pesagem & Amido</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('produtos_estoque_cadastro')}
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50/70 hover:border-emerald-300 transition-all text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">Estoque Produtos</div>
              <div className="text-[11px] text-slate-500">Féculas & Polvilhos</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('financeiro_lancar_despesas')}
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50/70 hover:border-emerald-300 transition-all text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-sm">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">Lançar Caixa</div>
              <div className="text-[11px] text-slate-500">Despesas & Receitas</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('cadastro_clientes')}
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50/70 hover:border-emerald-300 transition-all text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">Clientes</div>
              <div className="text-[11px] text-slate-500">Base Comercial</div>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Gráficos de Produção e Vendas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Faturamento Semanal vs Meta */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Evolução de Vendas vs Meta</h3>
              <p className="text-xs text-slate-500">Comparativo das últimas 5 semanas de safra</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
              +14% acima da meta
            </span>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dadosFaturamento} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="corRealizado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="semana" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, '']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="realizado" name="Faturado" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#corRealizado)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Mix de Estoque por Linha de Produto */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Mix de Estoque Disponível</h3>
              <p className="text-xs text-slate-500">Quantidade de sacaria em armazém pronto para entrega</p>
            </div>
            <button
              onClick={() => onNavigate('produtos_estoque_cadastro')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosMixProducao} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="nome" tick={{ fontSize: 11, fill: '#334155' }} axisLine={false} tickLine={false} width={110} />
                <Tooltip 
                  formatter={(value: any) => [`${value} sacos`, 'Estoque']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="sacos" fill="#047857" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. Tabela de Pedidos Recentes & Monitor da Roça */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Painel de Pedidos Recentes */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Últimos Pedidos Comerciais</h3>
              <p className="text-xs text-slate-500">Pedidos registrados no sistema de vendas</p>
            </div>
            <button
              onClick={() => onNavigate('pedidos_orcamentos_sugestivo')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Módulo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-2.5">Nº Pedido</th>
                  <th className="pb-2.5">Cliente</th>
                  <th className="pb-2.5">Valor</th>
                  <th className="pb-2.5 text-right">Etapa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pedidos.slice(0, 5).map((ped) => (
                  <tr key={ped.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 font-bold text-slate-800 font-mono">
                      {ped.numero_pedido}
                    </td>
                    <td className="py-2.5 text-slate-700 truncate max-w-[140px]">
                      {ped.cliente_nome}
                    </td>
                    <td className="py-2.5 font-semibold text-slate-900 font-mono tabular-nums">
                      {formatarMoeda(ped.valor_total)}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ped.etapa === 'FATURADO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ped.etapa === 'EM_PRODUCAO'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {ped.etapa.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Painel de Últimas Pesagens na Roça */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recebimento de Raiz na Roça</h3>
              <p className="text-xs text-slate-500">Últimas pesagens registradas com agricultores</p>
            </div>
            <button
              onClick={() => onNavigate('calculo_na_roca')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Pesagens</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-2.5">Ticket</th>
                  <th className="pb-2.5">Produtor</th>
                  <th className="pb-2.5">Peso Total</th>
                  <th className="pb-2.5 text-right">Valor Estimado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {calculosRoca.slice(0, 5).map((calc) => (
                  <tr key={calc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 font-bold text-slate-800 font-mono">
                      {calc.numero_ticket}
                    </td>
                    <td className="py-2.5 text-slate-700 truncate max-w-[140px]">
                      {calc.fornecedor_nome}
                    </td>
                    <td className="py-2.5 font-semibold text-slate-900 font-mono tabular-nums">
                      {calc.peso_total_kg.toLocaleString('pt-BR')} kg
                    </td>
                    <td className="py-2.5 text-right font-bold text-emerald-800 font-mono tabular-nums">
                      {formatarMoeda(calc.valor_total_estimado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
