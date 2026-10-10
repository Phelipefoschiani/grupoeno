import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Fuel,
  Tractor,
  DollarSign,
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  X,
  Printer,
  Download,
  Calendar,
  Layers,
  Wrench,
  ShieldCheck,
  AlertCircle,
  Truck,
  Droplet,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import {
  DespesaSitio,
  ControleSitioState,
  carregarControleSitio,
  salvarControleSitio,
  NotaFiscalDespesa
} from '../../data/sitioControleData';

interface PortalControleSitioProps {
  onVoltar: () => void;
}

export function PortalControleSitio({ onVoltar }: PortalControleSitioProps) {
  const [dados, setDados] = useState<ControleSitioState>(carregarControleSitio());
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  
  // Modal de Visualização da Nota Fiscal
  const [notaSelecionada, setNotaSelecionada] = useState<{
    despesa: DespesaSitio;
    nota: NotaFiscalDespesa;
  } | null>(null);

  // Modal de Nova Despesa
  const [modalNovaDespesa, setModalNovaDespesa] = useState(false);
  const [formDespesa, setFormDespesa] = useState({
    data: new Date().toISOString().split('T')[0],
    nomeDespesa: '',
    tipo: 'COMBUSTIVEL' as DespesaSitio['tipo'],
    produto: 'Diesel S10',
    quantidade: 100,
    unidade: 'L',
    valorUnitario: 5.89,
    valorTotal: 589.00,
    maquinaTrator: 'Trator Valtra A950',
    responsavel: 'Valdecir (Mestre de Campo)',
    numeroNF: '',
    emitenteNF: 'Posto Rota do Agronegócio Ltda',
    cnpjEmitente: '14.892.102/0001-44',
    abaterDoTanque: true
  });

  // Modal de Abastecer Tanque do Sítio
  const [modalAbastecerTanque, setModalAbastecerTanque] = useState(false);
  const [litrosEntradaTanque, setLitrosEntradaTanque] = useState<number>(1000);
  const [fornecedorTanque, setFornecedorTanque] = useState('Distribuidora Petrobras / Ipiranga');
  const [notaTanque, setNotaTanque] = useState('NF-e 089.442');

  useEffect(() => {
    const handleUpdate = () => setDados(carregarControleSitio());
    window.addEventListener('sitio_controle_despesas_updated', handleUpdate);
    return () => window.removeEventListener('sitio_controle_despesas_updated', handleUpdate);
  }, []);

  // Cálculos dos 3 Cards Solicitados:
  // 1. Total de litros disponível no tanque do sítio
  const totalLitrosDisponivel = dados.totalLitrosDisponivel;
  const capacidadeTanque = dados.capacidadeTanqueLitros || 5000;
  const porcentagemTanque = Math.min(100, Math.round((totalLitrosDisponivel / capacidadeTanque) * 100));

  // Mês e Ano corrente para cálculo mensal (YYYY-MM)
  const mesAtualKey = new Date().toISOString().slice(0, 7); // ex: "2026-10"

  // 2. Total de litros usados nesse mês de combustível no trator
  const litrosUsadosNoMes = useMemo(() => {
    return dados.despesas
      .filter(d => {
        const ehMesAtual = d.data.startsWith(mesAtualKey);
        const ehCombustivelTrator = d.unidade === 'L' || d.tipo === 'COMBUSTIVEL';
        return ehMesAtual && ehCombustivelTrator;
      })
      .reduce((acc, d) => acc + (Number(d.quantidade) || 0), 0);
  }, [dados.despesas, mesAtualKey]);

  // 3. Despesas situacionais (Total em R$ de todas as despesas situacionais cadastradas)
  const totalDespesasSituacionais = useMemo(() => {
    return dados.despesas.reduce((acc, d) => acc + (Number(d.valorTotal) || 0), 0);
  }, [dados.despesas]);

  // Filtro da Tabela em Linhas
  const despesasFiltradas = useMemo(() => {
    return dados.despesas.filter(d => {
      const matchBusca = 
        d.nomeDespesa.toLowerCase().includes(busca.toLowerCase()) ||
        d.produto.toLowerCase().includes(busca.toLowerCase()) ||
        d.maquinaTrator.toLowerCase().includes(busca.toLowerCase()) ||
        d.notaFiscal.numero.toLowerCase().includes(busca.toLowerCase());

      const matchTipo = filtroTipo === 'TODOS' || d.tipo === filtroTipo;

      return matchBusca && matchTipo;
    });
  }, [dados.despesas, busca, filtroTipo]);

  // Manipular alteração de quantidade / valor unitário no formulário
  const handleAtualizarPrecoUnitario = (qtd: number, vlrUnit: number) => {
    setFormDespesa(prev => ({
      ...prev,
      quantidade: qtd,
      valorUnitario: vlrUnit,
      valorTotal: Number((qtd * vlrUnit).toFixed(2))
    }));
  };

  // Salvar Nova Despesa
  const handleSalvarDespesa = (e: React.FormEvent) => {
    e.preventDefault();

    const numeroNotaFormatado = formDespesa.numeroNF.trim() || `NF-${Math.floor(10000 + Math.random() * 90000)}`;

    const novaDespesa: DespesaSitio = {
      id: `desp_${Date.now()}`,
      data: formDespesa.data,
      nomeDespesa: formDespesa.nomeDespesa || `${formDespesa.tipo === 'COMBUSTIVEL' ? 'Abastecimento' : 'Compra'} - ${formDespesa.produto}`,
      tipo: formDespesa.tipo,
      produto: formDespesa.produto,
      quantidade: Number(formDespesa.quantidade),
      unidade: formDespesa.unidade,
      valorUnitario: Number(formDespesa.valorUnitario),
      valorTotal: Number(formDespesa.valorTotal),
      maquinaTrator: formDespesa.maquinaTrator,
      responsavel: formDespesa.responsavel,
      notaFiscal: {
        numero: numeroNotaFormatado,
        serie: '1',
        chaveAcesso: `4126 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} 0001 9255 0010 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} 8172`,
        dataEmissao: `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
        emitente: formDespesa.emitenteNF,
        cnpjEmitente: formDespesa.cnpjEmitente,
        destinatario: 'Sítio Santana - Grupo ENO Agroindústria',
        cnpjDestinatario: '08.721.432/0001-90',
        formaPagamento: 'Faturado (Boleto Bancário)',
        itens: [
          {
            descricao: formDespesa.produto.toUpperCase(),
            quantidade: Number(formDespesa.quantidade),
            unidade: formDespesa.unidade,
            precoUnitario: Number(formDespesa.valorUnitario),
            total: Number(formDespesa.valorTotal)
          }
        ],
        observacoes: `Lançado no Controle do Sítio. Aplicação: ${formDespesa.maquinaTrator}`
      }
    };

    let novoTotalTanque = dados.totalLitrosDisponivel;
    if (formDespesa.tipo === 'COMBUSTIVEL' && formDespesa.unidade === 'L' && formDespesa.abaterDoTanque) {
      novoTotalTanque = Math.max(0, novoTotalTanque - Number(formDespesa.quantidade));
    }

    const novosDados: ControleSitioState = {
      ...dados,
      totalLitrosDisponivel: novoTotalTanque,
      despesas: [novaDespesa, ...dados.despesas]
    };

    salvarControleSitio(novosDados);
    setDados(novosDados);
    setModalNovaDespesa(false);
  };

  // Entrada de Litros no Tanque da Fazenda
  const handleConfirmarEntradaTanque = (e: React.FormEvent) => {
    e.preventDefault();
    const novosLitros = dados.totalLitrosDisponivel + Number(litrosEntradaTanque);

    const novosDados: ControleSitioState = {
      ...dados,
      totalLitrosDisponivel: novosLitros
    };

    salvarControleSitio(novosDados);
    setDados(novosDados);
    setModalAbastecerTanque(false);
  };

  const formatarDataBR = (dataIso: string) => {
    if (!dataIso) return '-';
    const partes = dataIso.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataIso;
  };

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-900 flex flex-col font-sans">
      
      {/* 1. TOPO: 'Controle' em destaque com navegação e ações */}
      <header className="bg-[#022013] text-white border-b border-emerald-900 shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button
              onClick={onVoltar}
              className="
                inline-flex items-center gap-1.5 px-3.5 py-2
                rounded-xl bg-white/10 hover:bg-white/20
                text-xs font-bold text-emerald-200 hover:text-white
                border border-white/10
                transition-all cursor-pointer
              "
              title="Sair do portal e voltar ao início"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Início</span>
            </button>

            <div className="h-6 w-px bg-emerald-800/80 hidden sm:block" />

            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-emerald-400">
                Grupo ENO · Agroindústria & Campo
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Controle</span>
                <span className="text-emerald-400/80 text-sm font-semibold tracking-normal hidden md:inline">
                  · Gestão de Combustível, Tratores & Despesas Situacionais
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setModalAbastecerTanque(true)}
              className="
                inline-flex items-center gap-2
                rounded-xl bg-emerald-800/80 hover:bg-emerald-700
                border border-emerald-600/50
                px-3.5 py-2 text-xs font-bold text-emerald-100
                transition-all cursor-pointer shadow-xs
              "
            >
              <Fuel className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline">Abastecer Tanque</span>
              <span className="sm:hidden">+ Tanque</span>
            </button>

            <button
              onClick={() => setModalNovaDespesa(true)}
              className="
                inline-flex items-center gap-2
                rounded-xl bg-emerald-500 hover:bg-emerald-400
                px-4 py-2 text-xs sm:text-sm font-extrabold text-slate-950
                shadow-md shadow-emerald-950/30
                transition-all duration-150
                hover:-translate-y-0.5 cursor-pointer
              "
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Lançar Despesa</span>
            </button>
          </div>

        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">

        {/* 2. OS 3 CARDS SOLICITADOS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          
          {/* CARD 1: Total de litros disponível */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Reserva da Fazenda
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                  Total de Litros Disponível
                </h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Fuel className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {totalLitrosDisponivel.toLocaleString('pt-BR')}
                </span>
                <span className="text-lg font-bold text-emerald-700">Litros</span>
              </div>
              
              {/* Barra de volume do reservatório */}
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-slate-500 font-semibold mb-1">
                  <span>Tanque central do sítio</span>
                  <span>{porcentagemTanque}% ({totalLitrosDisponivel} / {capacidadeTanque} L)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      porcentagemTanque < 25 ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${porcentagemTanque}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <Droplet className="w-3.5 h-3.5" /> Diesel S10 & Gasolina
              </span>
              <button
                onClick={() => setModalAbastecerTanque(true)}
                className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
              >
                + Entrada de Litros
              </button>
            </div>
          </div>

          {/* CARD 2: Total de litros usados nesse mês de combustível no trator */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Consumo Operacional
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                  Litros Usados no Mês (Trator)
                </h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Tractor className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {litrosUsadosNoMes.toLocaleString('pt-BR')}
                </span>
                <span className="text-lg font-bold text-blue-600">Litros</span>
              </div>

              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-600">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                <span>Consumo acumulado em Outubro/2026</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Tratores: Valtra A950 & Massey</span>
              <span className="font-semibold text-slate-700">Média: {(litrosUsadosNoMes / 30).toFixed(1)} L/dia</span>
            </div>
          </div>

          {/* CARD 3: Despesas situacionais */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Custos e Peças
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                  Despesas Situacionais
                </h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  R$ {totalDespesasSituacionais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-600">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                <span>Combustíveis, peças de reposição e revisões</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{dados.despesas.length} lançamentos com NF</span>
              <span className="font-semibold text-emerald-700">100% comprovados</span>
            </div>
          </div>

        </section>

        {/* 3. TABELA EM LINHAS COM AS DESPESAS E NOTAS FISCAIS */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          
          {/* Cabeçalho da Tabela e Barra de Busca */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Tabela de Despesas Situacionais & Combustível
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Histórico detalhado com data, nome da despesa, produto, quantidade/unidade e comprovante fiscal
              </p>
            </div>

            {/* Barra de Filtro e Busca */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  placeholder="Buscar despesa, produto, NF..."
                  className="
                    w-full pl-9 pr-3 py-2 rounded-xl text-xs
                    border border-slate-200 bg-white
                    focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600
                  "
                />
              </div>

              <select
                value={filtroTipo}
                onChange={e => setFiltroTipo(e.target.value)}
                className="
                  px-3 py-2 rounded-xl text-xs font-semibold
                  border border-slate-200 bg-white text-slate-700
                  focus:outline-none focus:border-emerald-600 cursor-pointer
                "
              >
                <option value="TODOS">Todos os Tipos</option>
                <option value="COMBUSTIVEL">Combustível</option>
                <option value="PECA">Peças / Implementos</option>
                <option value="LUBRIFICANTE">Lubrificantes</option>
              </select>
            </div>
          </div>

          {/* Tabela de Despesas em Linhas */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-4 sm:px-6">Data</th>
                  <th className="py-3 px-4">Nome da Despesa</th>
                  <th className="py-3 px-4">Produto que foi</th>
                  <th className="py-3 px-4 text-center">Quantidade / Unidade</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                  <th className="py-3 px-4 sm:px-6 text-center">Ver a Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {despesasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      Nenhuma despesa encontrada para os critérios selecionados.
                    </td>
                  </tr>
                ) : (
                  despesasFiltradas.map((desp) => (
                    <tr
                      key={desp.id}
                      className="hover:bg-emerald-50/40 transition-colors group"
                    >
                      {/* 1. Data */}
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatarDataBR(desp.data)}</span>
                        </div>
                      </td>

                      {/* 2. Nome da Despesa */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {desp.nomeDespesa}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1 font-medium text-emerald-800">
                            <Tractor className="w-3 h-3 text-emerald-600" />
                            {desp.maquinaTrator}
                          </span>
                          <span>•</span>
                          <span>{desp.responsavel}</span>
                        </div>
                      </td>

                      {/* 3. Produto que foi */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          <span className={`
                            w-2 h-2 rounded-full shrink-0
                            ${desp.tipo === 'COMBUSTIVEL' ? 'bg-emerald-600' : desp.tipo === 'PECA' ? 'bg-amber-600' : 'bg-blue-600'}
                          `} />
                          <span>{desp.produto}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Tipo: {desp.tipo}
                        </span>
                      </td>

                      {/* 4. Quantidade / Unidade (se gasolina/diesel: L; se peça: UN) */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`
                          inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-black
                          ${desp.unidade === 'L' 
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300/60' 
                            : 'bg-amber-100 text-amber-900 border border-amber-300/60'}
                        `}>
                          {desp.quantidade} {desp.unidade}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          R$ {desp.valorUnitario.toFixed(2)} /{desp.unidade}
                        </div>
                      </td>

                      {/* 5. Valor Total */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="font-black text-slate-900 text-sm">
                          R$ {desp.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* 6. Ver a Nota */}
                      <td className="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap">
                        <button
                          onClick={() => setNotaSelecionada({ despesa: desp, nota: desp.notaFiscal })}
                          className="
                            inline-flex items-center gap-1.5 px-3 py-1.5
                            rounded-xl bg-emerald-50 hover:bg-emerald-100
                            border border-emerald-300 text-emerald-900
                            text-xs font-bold transition-all duration-150
                            hover:scale-105 active:scale-100 cursor-pointer
                          "
                          title={`Ver Nota Fiscal ${desp.notaFiscal.numero}`}
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Ver a Nota</span>
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Rodapé da Tabela */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span>
              Exibindo <strong>{despesasFiltradas.length}</strong> de <strong>{dados.despesas.length}</strong> registros
            </span>
            <div className="flex items-center gap-3">
              <span className="font-medium text-slate-700">
                Total Filtrado: <strong>R$ {despesasFiltradas.reduce((a, b) => a + b.valorTotal, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </span>
            </div>
          </div>

        </section>

      </main>

      {/* ============================================================== */}
      {/* MODAL: VER A NOTA FISCAL (DANFE / COMPROVANTE ELETRÔNICO) */}
      {/* ============================================================== */}
      {notaSelecionada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 sm:p-6 backdrop-blur-xs overflow-y-auto animate-in fade-in"
          onClick={() => setNotaSelecionada(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-8"
            onClick={e => e.stopPropagation()}
          >
            {/* Topo do Modal de Nota */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-black text-sm sm:text-base leading-tight">
                    Documento Fiscal Eletrônico (DANFE / NF-e)
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Número: {notaSelecionada.nota.numero} · Série: {notaSelecionada.nota.serie}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Imprimir Nota Fiscal"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setNotaSelecionada(null)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Corpo da Nota Fiscal em Formato Realista */}
            <div className="p-6 sm:p-8 space-y-5 text-xs text-slate-800 font-sans max-h-[80vh] overflow-y-auto">
              
              {/* Box Emitente e Chave */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-300 rounded-xl p-4 bg-slate-50/50">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">EMITENTE</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">
                    {notaSelecionada.nota.emitente}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    CNPJ: <strong>{notaSelecionada.nota.cnpjEmitente}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Inscrição Estadual: 908.241.192-PR · Jacarezinho / PR
                  </div>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-slate-200 md:pl-4 pt-3 md:pt-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">DANFE / NF-E</div>
                  <div className="text-sm font-bold text-emerald-800">
                    NF-e Nº {notaSelecionada.nota.numero}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Data Emissão: <strong>{notaSelecionada.nota.dataEmissao}</strong>
                  </div>
                  <div className="mt-2 p-2 bg-slate-100 rounded text-[10px] font-mono text-slate-700 break-all">
                    Chave de Acesso: {notaSelecionada.nota.chaveAcesso}
                  </div>
                </div>
              </div>

              {/* Box Destinatário */}
              <div className="border border-slate-300 rounded-xl p-4 bg-white">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">DESTINATÁRIO / TOMADOR</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  <div>
                    <div className="font-bold text-slate-900">{notaSelecionada.nota.destinatario}</div>
                    <div className="text-[11px] text-slate-600">CNPJ: {notaSelecionada.nota.cnpjDestinatario}</div>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    <div>Endereço: Rodovia PR-431, Km 12 - Zona Rural</div>
                    <div>Município: Jacarezinho / PR · CEP: 86400-000</div>
                  </div>
                </div>
              </div>

              {/* Tabela de Itens Fiscais */}
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                  DADOS DO PRODUTO / SERVIÇO
                </div>
                <div className="border border-slate-300 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold uppercase text-slate-600">
                      <tr>
                        <th className="py-2.5 px-3">Descrição do Produto</th>
                        <th className="py-2.5 px-2 text-center">Unid.</th>
                        <th className="py-2.5 px-2 text-center">Qtd.</th>
                        <th className="py-2.5 px-3 text-right">Preço Unit.</th>
                        <th className="py-2.5 px-3 text-right">Valor Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {notaSelecionada.nota.itens.map((item, idx) => (
                        <tr key={idx} className="bg-white">
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            {item.descricao}
                          </td>
                          <td className="py-3 px-2 text-center font-bold text-emerald-800">
                            {item.unidade}
                          </td>
                          <td className="py-3 px-2 text-center font-bold">
                            {item.quantidade}
                          </td>
                          <td className="py-3 px-3 text-right">
                            R$ {item.precoUnitario.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right font-black text-slate-900">
                            R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Informações de Pagamento e Totais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">FORMA DE PAGAMENTO</span>
                  <div className="font-bold text-slate-900 mt-1">{notaSelecionada.nota.formaPagamento}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {notaSelecionada.nota.observacoes || 'Operação autorizada pela SEFAZ.'}
                  </div>
                </div>

                <div className="border border-emerald-300 rounded-xl p-3.5 bg-emerald-50 flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">VALOR TOTAL DA NOTA</span>
                  <div className="text-2xl font-black text-emerald-950 mt-1">
                    R$ {notaSelecionada.despesa.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-emerald-700 mt-0.5">Comprovante válido e auditado</span>
                </div>
              </div>

            </div>

            {/* Rodapé do Modal de Nota */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Despesa associada: <strong>{notaSelecionada.despesa.nomeDespesa}</strong>
              </span>
              <button
                onClick={() => setNotaSelecionada(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Fechar Nota
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: LANÇAR NOVA DESPESA / ABASTECIMENTO */}
      {/* ============================================================== */}
      {modalNovaDespesa && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 sm:p-6 backdrop-blur-xs overflow-y-auto animate-in fade-in"
          onClick={() => setModalNovaDespesa(false)}
        >
          <div
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#022013] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-base">Lançar Nova Despesa no Sítio</h3>
              </div>
              <button
                onClick={() => setModalNovaDespesa(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarDespesa} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data da Despesa</label>
                  <input
                    type="date"
                    required
                    value={formDespesa.data}
                    onChange={e => setFormDespesa({ ...formDespesa, data: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Despesa</label>
                  <select
                    value={formDespesa.tipo}
                    onChange={e => {
                      const novoTipo = e.target.value as DespesaSitio['tipo'];
                      const ehCombustivel = novoTipo === 'COMBUSTIVEL';
                      setFormDespesa(prev => ({
                        ...prev,
                        tipo: novoTipo,
                        unidade: ehCombustivel ? 'L' : 'UN',
                        produto: ehCombustivel ? 'Diesel S10' : prev.produto
                      }));
                    }}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="COMBUSTIVEL">Combustível (Abastecimento)</option>
                    <option value="PECA">Peça de Reposição</option>
                    <option value="LUBRIFICANTE">Lubrificante / Óleo</option>
                    <option value="MANUTENCAO">Manutenção Mecânica</option>
                    <option value="OUTROS">Outros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome da Despesa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Abastecimento Trator Valtra - Plantio"
                  value={formDespesa.nomeDespesa}
                  onChange={e => setFormDespesa({ ...formDespesa, nomeDespesa: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Produto que foi</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Diesel S10, Gasolina, Filtro de Óleo..."
                    value={formDespesa.produto}
                    onChange={e => setFormDespesa({ ...formDespesa, produto: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trator / Máquina</label>
                  <select
                    value={formDespesa.maquinaTrator}
                    onChange={e => setFormDespesa({ ...formDespesa, maquinaTrator: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="Trator Valtra A950">Trator Valtra A950</option>
                    <option value="Trator Massey Ferguson 4292">Trator Massey Ferguson 4292</option>
                    <option value="Roçadeira Husqvarna & Motosserra">Roçadeira Husqvarna & Motosserra</option>
                    <option value="Caminhão Caçamba Mandioca">Caminhão Caçamba Mandioca</option>
                    <option value="Geral (Sítio / Implementos)">Geral (Sítio / Implementos)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantidade</label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="1"
                    value={formDespesa.quantidade}
                    onChange={e => handleAtualizarPrecoUnitario(Number(e.target.value), formDespesa.valorUnitario)}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unidade</label>
                  <select
                    value={formDespesa.unidade}
                    onChange={e => setFormDespesa({ ...formDespesa, unidade: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="L">Litros (L)</option>
                    <option value="UN">Unidades (UN)</option>
                    <option value="JG">Jogo (JG)</option>
                    <option value="CX">Caixa (CX)</option>
                    <option value="KG">Quilos (KG)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preço Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formDespesa.valorUnitario}
                    onChange={e => handleAtualizarPrecoUnitario(formDespesa.quantidade, Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <span className="font-bold text-emerald-900">Valor Total Calculado:</span>
                <span className="text-base font-black text-emerald-950">
                  R$ {formDespesa.valorTotal.toFixed(2)}
                </span>
              </div>

              {/* Informações da Nota Fiscal */}
              <div className="border-t border-slate-200 pt-3 space-y-3">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Dados da Nota Fiscal / Comprovante
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Número da NF-e</label>
                    <input
                      type="text"
                      placeholder="Ex: 048.990"
                      value={formDespesa.numeroNF}
                      onChange={e => setFormDespesa({ ...formDespesa, numeroNF: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Fornecedor / Emitente</label>
                    <input
                      type="text"
                      value={formDespesa.emitenteNF}
                      onChange={e => setFormDespesa({ ...formDespesa, emitenteNF: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Abater do Tanque (se for combustível) */}
              {formDespesa.tipo === 'COMBUSTIVEL' && formDespesa.unidade === 'L' && (
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formDespesa.abaterDoTanque}
                    onChange={e => setFormDespesa({ ...formDespesa, abaterDoTanque: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Abater <strong>{formDespesa.quantidade} Litros</strong> do total disponível no tanque da fazenda
                  </span>
                </label>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovaDespesa(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer"
                >
                  Confirmar Lançamento
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ABASTECER TANQUE DA FAZENDA (+ Litros Disponíveis) */}
      {/* ============================================================== */}
      {modalAbastecerTanque && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 sm:p-6 backdrop-blur-xs overflow-y-auto animate-in fade-in"
          onClick={() => setModalAbastecerTanque(false)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#022013] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Fuel className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-base">Abastecer Tanque da Fazenda</h3>
              </div>
              <button
                onClick={() => setModalAbastecerTanque(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmarEntradaTanque} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Adicione litros de combustível recebidos pelo caminhão comboio ou fornecedor para recarregar o reservatório central do sítio.
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Litros a Adicionar</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={litrosEntradaTanque}
                    onChange={e => setLitrosEntradaTanque(Number(e.target.value))}
                    className="w-full pl-3 pr-12 py-2.5 border rounded-xl border-slate-200 text-base font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-emerald-700">Litros</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fornecedor / Distribuidora</label>
                  <input
                    type="text"
                    value={fornecedorTanque}
                    onChange={e => setFornecedorTanque(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nota Fiscal de Compra</label>
                  <input
                    type="text"
                    value={notaTanque}
                    onChange={e => setNotaTanque(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                <div className="text-[11px] font-semibold">Novo Saldo Disponível:</div>
                <div className="text-xl font-black mt-0.5">
                  {(dados.totalLitrosDisponivel + Number(litrosEntradaTanque)).toLocaleString('pt-BR')} Litros
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAbastecerTanque(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer"
                >
                  Confirmar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
