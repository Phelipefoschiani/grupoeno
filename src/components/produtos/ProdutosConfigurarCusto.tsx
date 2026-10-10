import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Scale,
  Edit2,
  Save,
  Check,
  AlertCircle,
  FlaskConical,
  Boxes,
  Percent,
  Search,
  CheckCircle2,
  X,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import {
  ProdutoEstoque,
  ReceitaIndustrial,
  carregarEstoqueProdutos,
  salvarEstoqueProdutos,
  carregarReceitas
} from '../../data/produtosData';
import { ProdutosNavTabs } from './ProdutosNavTabs';

interface Props {
  onNavigate?: (tabId: string) => void;
}

export function ProdutosConfigurarCusto({ onNavigate }: Props) {
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [receitas, setReceitas] = useState<ReceitaIndustrial[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS');

  // Modal de Ajuste de Custo e Impostos
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState<ProdutoEstoque | null>(null);

  // Form State do Modal
  const [formCustoInsumos, setFormCustoInsumos] = useState('0');
  const [formImpostosPct, setFormImpostosPct] = useState('8.0');
  const [formCustoOperacional, setFormCustoOperacional] = useState('0.85');
  const [formPrecoVenda, setFormPrecoVenda] = useState('12.50');
  const [formTipoAcondicionamento, setFormTipoAcondicionamento] = useState<'Fardo' | 'Caixa' | 'Saco' | 'Avulso'>('Caixa');
  const [formUnidadesAcond, setFormUnidadesAcond] = useState('10');
  const [formMargemAlvo, setFormMargemAlvo] = useState('50');

  // Modo de simulação: 'PRECO' (calcula margem) ou 'MARGEM' (calcula preço)
  const [modoSimulador, setModoSimulador] = useState<'PRECO' | 'MARGEM'>('PRECO');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const recarregar = () => {
    setProdutos(carregarEstoqueProdutos());
    setReceitas(carregarReceitas());
  };

  useEffect(() => {
    recarregar();
    const handleUpdate = () => recarregar();
    window.addEventListener('produtos_updated', handleUpdate);
    window.addEventListener('receitas_updated', handleUpdate);
    return () => {
      window.removeEventListener('produtos_updated', handleUpdate);
      window.removeEventListener('receitas_updated', handleUpdate);
    };
  }, []);

  const dispararToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Abrir Modal de Edição de Custos e Impostos do Produto
  const handleAbrirAjuste = (prod: ProdutoEstoque) => {
    setProdutoEmEdicao(prod);
    const custoMp = prod.custo_materia_prima || 0;
    const impPct = prod.impostos_percentual ?? 8.0;
    const op = prod.custo_operacional || (prod.peso_unitario_kg <= 1 ? 0.85 : 7.50);
    const preco = prod.preco_unitario_venda || 0;
    const acond = (prod.tipo_acondicionamento as any) || (prod.tipo_embalagem.includes('Fardo') ? 'Fardo' : prod.tipo_embalagem.includes('Caixa') ? 'Caixa' : 'Saco');
    const unid = prod.unidades_por_acondicionamento || (acond === 'Fardo' ? 10 : acond === 'Caixa' ? 10 : 1);

    const baseCusto = custoMp + op;
    const impValor = (baseCusto * impPct) / 100;
    const total = baseCusto + impValor;
    const margem = preco > 0 ? ((preco - total) / preco) * 100 : 30;

    setFormCustoInsumos(String(custoMp));
    setFormImpostosPct(String(impPct));
    setFormCustoOperacional(String(op));
    setFormPrecoVenda(String(preco));
    setFormTipoAcondicionamento(acond);
    setFormUnidadesAcond(String(unid));
    setFormMargemAlvo(String(margem.toFixed(1)));
    setModoSimulador('PRECO');
    setModalAberto(true);
  };

  // Cálculos do modal em tempo real
  const calculosModal = useMemo(() => {
    const custoMp = parseFloat(formCustoInsumos) || 0;
    const custoOp = parseFloat(formCustoOperacional) || 0;
    const impostosPct = parseFloat(formImpostosPct) || 0;
    const unidades = parseInt(formUnidadesAcond) || 1;

    // Base de custo antes dos impostos
    const baseCusto = custoMp + custoOp;
    const impostosValor = (baseCusto * impostosPct) / 100;
    const custoTotalUnit = baseCusto + impostosValor;
    const custoTotalPacoteFechado = custoTotalUnit * unidades;

    let precoUnit = parseFloat(formPrecoVenda) || 0;
    let margemPct = parseFloat(formMargemAlvo) || 0;

    if (modoSimulador === 'MARGEM') {
      // Se definiu margem alvo, calcula preço de venda necessário
      // Margem = (Preço - Custo) / Preço => Preço = Custo / (1 - Margem/100)
      if (margemPct < 100) {
        precoUnit = custoTotalUnit / (1 - margemPct / 100);
      } else {
        precoUnit = custoTotalUnit * 2;
      }
    } else {
      // Se definiu preço de venda, calcula margem resultante
      margemPct = precoUnit > 0 ? ((precoUnit - custoTotalUnit) / precoUnit) * 100 : 0;
    }

    const precoPacoteFechado = precoUnit * unidades;
    const lucroUnitario = precoUnit - custoTotalUnit;
    const lucroPacoteFechado = lucroUnitario * unidades;

    return {
      custoMp,
      custoOp,
      impostosPct,
      impostosValor,
      custoTotalUnit,
      custoTotalPacoteFechado,
      precoUnit,
      precoPacoteFechado,
      margemPct,
      lucroUnitario,
      lucroPacoteFechado,
      unidades
    };
  }, [formCustoInsumos, formCustoOperacional, formImpostosPct, formPrecoVenda, formMargemAlvo, formUnidadesAcond, modoSimulador]);

  // Salvar ajustes de custos no produto
  const handleSalvarCustoProduto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoEmEdicao) return;

    const atualizados = produtos.map(p => {
      if (p.id === produtoEmEdicao.id) {
        return {
          ...p,
          custo_materia_prima: calculosModal.custoMp,
          impostos_percentual: calculosModal.impostosPct,
          impostos_valor: parseFloat(calculosModal.impostosValor.toFixed(2)),
          custo_operacional: calculosModal.custoOp,
          custo_total: parseFloat(calculosModal.custoTotalUnit.toFixed(2)),
          preco_unitario_venda: parseFloat(calculosModal.precoUnit.toFixed(2)),
          tipo_acondicionamento: formTipoAcondicionamento,
          unidades_por_acondicionamento: calculosModal.unidades,
          preco_venda_acondicionamento: parseFloat(calculosModal.precoPacoteFechado.toFixed(2)),
          margem_lucro_percentual: parseFloat(calculosModal.margemPct.toFixed(1))
        };
      }
      return p;
    });

    salvarEstoqueProdutos(atualizados);
    setProdutos(atualizados);
    setModalAberto(false);
    dispararToast(`Custos e impostos de "${produtoEmEdicao.nome}" atualizados com sucesso!`);
  };

  // Filtros
  const produtosFiltrados = useMemo(() => {
    return produtos.filter(p => {
      const matchBusca =
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.codigo.toLowerCase().includes(busca.toLowerCase()) ||
        (p.receita_nome && p.receita_nome.toLowerCase().includes(busca.toLowerCase()));

      const matchCat = filtroCategoria === 'TODAS' || p.categoria === filtroCategoria;
      return matchBusca && matchCat;
    });
  }, [produtos, busca, filtroCategoria]);

  // Métricas Globais
  const metricas = useMemo(() => {
    const total = produtos.length;
    const comReceita = produtos.filter(p => Boolean(p.receita_id)).length;
    const mediaMargem = total > 0
      ? produtos.reduce((acc, p) => acc + (p.margem_lucro_percentual || 0), 0) / total
      : 0;
    const mediaImpostos = total > 0
      ? produtos.reduce((acc, p) => acc + (p.impostos_percentual || 8.0), 0) / total
      : 0;

    return { total, comReceita, mediaMargem, mediaImpostos };
  }, [produtos]);

  return (
    <div className="relative h-full w-full flex flex-col bg-[#f8faf8] text-slate-800 overflow-hidden">
      
      {/* 1. NAVEGAÇÃO DE PRODUTOS */}
      <ProdutosNavTabs activeTab="produtos_configurar_custo" onNavigate={onNavigate} />

      {/* 2. CABEÇALHO */}
      <div className="bg-white border-b border-slate-200/80 px-6 py-3.5 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Configuração de Custos & Preços</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                {metricas.total} produtos
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              {metricas.comReceita} de {metricas.total} vinculados a receitas
            </span>
          </div>
        </div>

        {/* STAT BAR EM LINHA */}
        <div className="flex flex-wrap items-center gap-6 pt-3 mt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Impostos Médios:</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {metricas.mediaImpostos.toFixed(1)}%
            </span>
          </div>
          <div className="w-px h-4 bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Margem Bruta Média:</span>
            <span className={`font-mono font-bold text-sm ${metricas.mediaMargem >= 20 ? 'text-emerald-700' : 'text-amber-700'}`}>
              +{metricas.mediaMargem.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="mx-6 mt-3 p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 3. BARRA DE BUSCA E FILTROS */}
      <div className="bg-[#f1f5f2] px-6 py-2.5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex-1 min-w-[260px] max-w-sm relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por produto, código ou receita vinculada..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-700 font-medium"
          />
        </div>

        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
        >
          <option value="TODAS">Todas as Categorias</option>
          <option value="Mandioca Gourmet">Mandioca Gourmet</option>
          <option value="Féculas Nativas">Féculas Nativas</option>
          <option value="Féculas Especiais">Féculas Especiais</option>
          <option value="Polvilhos">Polvilhos</option>
          <option value="Tapiocas">Tapiocas</option>
          <option value="Farinhas">Farinhas</option>
        </select>
      </div>

      {/* 4. TABELA DE COMPOSIÇÃO DE CUSTO, IMPOSTOS E PREÇO */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-slate-500 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-5">Produto & Receita Vinculada</th>
                <th className="py-3 px-3">Acondicionamento</th>
                <th className="py-3 px-3 text-right">Insumos (Receita)</th>
                <th className="py-3 px-3 text-right">Impostos (%)</th>
                <th className="py-3 px-3 text-right">Operacional</th>
                <th className="py-3 px-3 text-right">Custo Total Unit.</th>
                <th className="py-3 px-4 text-right">Preço Venda Unit.</th>
                <th className="py-3 px-3 text-right">Margem %</th>
                <th className="py-3 px-5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    Nenhum produto cadastrado com estes filtros.
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((item) => {
                  const custoInsumo = item.custo_materia_prima || 0;
                  const impPct = item.impostos_percentual ?? 8.0;
                  const op = item.custo_operacional || 0;
                  const custoTotal = item.custo_total || (custoInsumo + op + (custoInsumo + op) * (impPct / 100));
                  const preco = item.preco_unitario_venda || 0;
                  const margem = preco > 0 ? ((preco - custoTotal) / preco) * 100 : 0;
                  const acondTipo = item.tipo_acondicionamento || (item.tipo_embalagem.includes('Fardo') ? 'Fardo' : item.tipo_embalagem.includes('Caixa') ? 'Caixa' : 'Saco');
                  const acondQtd = item.unidades_por_acondicionamento || 1;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900">{item.nome}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>{item.codigo}</span>
                          <span>•</span>
                          <span className="text-slate-600">{item.categoria}</span>
                          {item.receita_nome ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                              <FlaskConical className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[160px]">{item.receita_nome}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Sem receita vinculada</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
                          {acondTipo} {acondQtd > 1 ? `c/ ${acondQtd} un` : 'Avulso'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono text-slate-800">
                        {custoInsumo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                        <div className="font-bold">{impPct.toFixed(1)}%</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          +{((custoInsumo + op) * (impPct / 100)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                        {op.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 bg-slate-50/50">
                        {custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-right">
                        <div>{preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                        {acondQtd > 1 && (
                          <div className="text-[10px] text-emerald-800 font-normal">
                            {(preco * acondQtd).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} /{acondTipo}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold">
                        <span className={margem >= 20 ? 'text-emerald-700' : margem > 0 ? 'text-amber-700' : 'text-red-700'}>
                          {margem.toFixed(1)}%
                        </span>
                        <div className="text-[10px] text-slate-400 font-normal">
                          +{(preco - custoTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/un
                        </div>
                      </td>

                      <td className="py-3.5 px-5 text-right font-sans">
                        <button
                          onClick={() => handleAbrirAjuste(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                          title="Ajustar Custo, Impostos e Margem de Venda"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Configurar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL DE CONFIGURAR CUSTO & IMPOSTOS COM SIMULADOR EM TEMPO REAL */}
      {modalAberto && produtoEmEdicao && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-3 sm:p-6 flex justify-center items-start animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-auto max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3.5rem)]">
            
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <Calculator className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    Configurar Custos & Impostos: {produtoEmEdicao.nome}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Código: {produtoEmEdicao.codigo} • Categoria: {produtoEmEdicao.categoria} • Receita: {produtoEmEdicao.receita_nome || 'Nenhuma'}
                  </p>
                </div>
              </div>
              <button onClick={() => setModalAberto(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarCustoProduto} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              
              {/* Card da Receita Vinculada */}
              {produtoEmEdicao.receita_id && (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-950 block">
                          Receita Vinculada: {produtoEmEdicao.receita_nome}
                        </span>
                        <span className="text-[11px] text-emerald-800">
                          A matéria-prima e os insumos da receita fornecem o custo base da formulação.
                        </span>
                      </div>
                    </div>

                    {(() => {
                      const rec = receitas.find(r => r.id === produtoEmEdicao.receita_id);
                      const totalRec = rec ? (rec.custo_total_materias_primas || (rec.materias_primas || []).reduce((acc, m) => acc + (m.custo_total || 0), 0)) : 0;
                      const rend = rec?.rendimento_pacotes || 1;
                      return (
                        <div className="text-right bg-white px-3 py-1.5 rounded-lg border border-emerald-200">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                            Custo Insumos por Unidade
                          </span>
                          <span className="font-mono text-base font-black text-emerald-950">
                            {calculosModal.custoMp.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} /un
                          </span>
                          <span className="text-[9px] text-emerald-800 font-mono block font-bold">
                            ({totalRec.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ÷ {rend} un)
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Proporções da Receita (TUDO EM LINHAS DE UMA TABELA) */}
                  {(() => {
                    const rec = receitas.find(r => r.id === produtoEmEdicao.receita_id);
                    if (!rec || !rec.materias_primas || rec.materias_primas.length === 0) return null;
                    const rend = rec.rendimento_pacotes || 1;
                    const totalRec = rec.custo_total_materias_primas || (rec.materias_primas || []).reduce((acc, m) => acc + (m.custo_total || 0), 0);

                    return (
                      <div className="pt-2 border-t border-slate-200">
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
                          <div className="bg-slate-100/90 px-3 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-1 text-[11px]">
                            <span className="font-bold text-slate-800">
                              Divisão Proporcional por Unidade ({rend} {rec.tipo_embalagem || 'pacotes'} de {rec.peso_por_pacote_kg || 1}kg):
                            </span>
                            <span className="font-mono text-emerald-900 font-bold">
                              {totalRec.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ÷ {rend} = {calculosModal.custoMp.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} /un
                            </span>
                          </div>
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                                <th className="py-2 px-3">Matéria-Prima</th>
                                <th className="py-2 px-3 text-right">Qtd na Receita</th>
                                <th className="py-2 px-3 text-right">Divisão por Unidade</th>
                                <th className="py-2 px-3 text-right">Custo na Receita</th>
                                <th className="py-2 px-3 text-right">Custo por Unidade</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono">
                              {rec.materias_primas.map((mp, i) => {
                                const propUnitaria = (mp.quantidade / rend);
                                const custoTotalMp = mp.custo_total || (mp.quantidade * (mp.custo_unitario || 0));
                                const custoUn = (custoTotalMp / rend);
                                return (
                                  <tr key={i} className="hover:bg-slate-50/70">
                                    <td className="py-2 px-3 font-sans font-bold text-slate-800">{mp.materia_prima_nome}</td>
                                    <td className="py-2 px-3 text-right text-slate-600">{mp.quantidade.toLocaleString('pt-BR')} {mp.unidade_medida}</td>
                                    <td className="py-2 px-3 text-right font-bold text-emerald-900">
                                      {propUnitaria < 0.1 ? propUnitaria.toFixed(3) : propUnitaria.toFixed(2)} {mp.unidade_medida}
                                    </td>
                                    <td className="py-2 px-3 text-right text-slate-500">
                                      {custoTotalMp.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                    <td className="py-2 px-3 text-right font-bold text-emerald-950 bg-emerald-50/30">
                                      {custoUn.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 1. COMPONENTES DO CUSTO (INSUMOS + IMPOSTOS + OPERACIONAL) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-xs block">
                  1. Composição de Custo Industrial & Tributário
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Custo Insumos */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Custo Insumos (Receita) R$
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formCustoInsumos}
                      onChange={(e) => setFormCustoInsumos(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 text-right focus:outline-none focus:border-emerald-700 shadow-2xs"
                    />
                    <span className="text-[10px] text-slate-400 block text-right mt-0.5">raiz + embalagem</span>
                  </div>

                  {/* Impostos sobre o Produto */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Impostos sobre Produto (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formImpostosPct}
                      onChange={(e) => setFormImpostosPct(e.target.value)}
                      className="w-full bg-white border-2 border-emerald-500 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 text-right focus:outline-none focus:border-emerald-700 shadow-xs"
                    />
                    <span className="text-[10px] text-emerald-800 font-semibold block text-right mt-0.5 font-mono">
                      + R$ {calculosModal.impostosValor.toFixed(2)} por unidade
                    </span>
                  </div>

                  {/* Custos Operacionais */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Custos Operacionais (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formCustoOperacional}
                      onChange={(e) => setFormCustoOperacional(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-800 text-right focus:outline-none focus:border-emerald-700 shadow-2xs"
                    />
                    <span className="text-[10px] text-slate-400 block text-right mt-0.5">energia/caldeira/mão de obra</span>
                  </div>

                  {/* Custo Total Resultante */}
                  <div className="bg-emerald-950 p-3 rounded-xl text-white flex flex-col justify-center text-right shadow-xs">
                    <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">
                      Custo Total Unitário
                    </span>
                    <span className="font-mono text-base font-black text-lime-300">
                      {calculosModal.custoTotalUnit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <span className="text-[10px] text-emerald-200/80 font-mono">
                      ({calculosModal.custoTotalPacoteFechado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} /{formTipoAcondicionamento.toLowerCase()})
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. ACONDICIONAMENTO DE DESPACHO */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-xs block">
                  2. Acondicionamento de Envio & Quantidades
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tipo de Acondicionamento *</label>
                    <select
                      value={formTipoAcondicionamento}
                      onChange={(e) => setFormTipoAcondicionamento(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-emerald-700 cursor-pointer shadow-2xs"
                    >
                      <option value="Caixa">Caixa</option>
                      <option value="Fardo">Fardo</option>
                      <option value="Saco">Saco</option>
                      <option value="Avulso">Avulso / Granel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Quantos que vai ({formTipoAcondicionamento}) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formUnidadesAcond}
                      onChange={(e) => setFormUnidadesAcond(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono font-black text-center text-slate-900 focus:outline-none focus:border-emerald-700 shadow-2xs"
                    />
                    <span className="text-[10px] text-slate-500 block text-center mt-0.5">
                      unidades por {formTipoAcondicionamento.toLowerCase()} fechado
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. SIMULADOR DUPLO DE PREÇO & MARGEM */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                    <span>3. Simulador de Preço de Venda & Margem de Lucro</span>
                  </span>

                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setModoSimulador('PRECO')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        modoSimulador === 'PRECO'
                          ? 'bg-emerald-900 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Definir Preço de Venda
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoSimulador('MARGEM')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        modoSimulador === 'MARGEM'
                          ? 'bg-emerald-900 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Definir Margem Alvo (%)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  {/* Preço de Venda Unitário */}
                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">
                      Preço de Venda Unitário (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={modoSimulador === 'PRECO' ? formPrecoVenda : calculosModal.precoUnit.toFixed(2)}
                      onChange={(e) => {
                        setModoSimulador('PRECO');
                        setFormPrecoVenda(e.target.value);
                      }}
                      className="w-full bg-white border-2 border-emerald-600 rounded-xl px-3 py-2 font-mono font-black text-emerald-950 text-base text-right focus:outline-none focus:border-emerald-700 shadow-xs"
                    />
                    <span className="text-[10px] text-emerald-800 font-semibold block text-right mt-0.5">
                      utilizado nos pedidos de venda
                    </span>
                  </div>

                  {/* Margem Bruta Alvo */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Margem Bruta Resultante (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={modoSimulador === 'MARGEM' ? formMargemAlvo : calculosModal.margemPct.toFixed(1)}
                      onChange={(e) => {
                        setModoSimulador('MARGEM');
                        setFormMargemAlvo(e.target.value);
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 text-right focus:outline-none focus:border-emerald-700 shadow-2xs"
                    />
                    <span className="text-[10px] text-slate-500 block text-right mt-0.5 font-mono">
                      Lucro: +{calculosModal.lucroUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/un
                    </span>
                  </div>

                  {/* Preço do Acondicionamento Fechado */}
                  <div className="bg-white p-3 rounded-xl border border-slate-300 text-right flex flex-col justify-center shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                      Preço da {formTipoAcondicionamento} Fechada
                    </span>
                    <span className="font-mono text-base font-black text-slate-900">
                      {calculosModal.precoPacoteFechado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Lucro na {formTipoAcondicionamento.toLowerCase()}: +{calculosModal.lucroPacoteFechado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botões do Rodapé */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs hover:shadow text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar & Atualizar Produto</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
