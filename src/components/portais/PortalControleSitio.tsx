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
  Calendar,
  Layers,
  Wrench,
  AlertCircle,
  Truck,
  Droplet
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

  // 1. Modal Entrada de Litros (Abastecer Tanque de Combustível da Fazenda)
  const [modalEntradaLitros, setModalEntradaLitros] = useState(false);
  const [formEntradaTanque, setFormEntradaTanque] = useState({
    data: new Date().toISOString().split('T')[0],
    produto: 'Diesel S10',
    quantidadeLitros: 1000,
    precoLitro: 5.75,
    valorTotal: 5750.00,
    fornecedor: 'Distribuidora Rota do Petróleo & Agronegócio Ltda',
    cnpjFornecedor: '11.892.301/0001-92',
    numeroNF: '',
    observacoes: 'Descarga de combustível no reservatório central do sítio.'
  });

  // 2. Modal Lançar Litros no Trator (Abastecer Trator / Consumo de Combustível)
  const [modalAbastecerTrator, setModalAbastecerTrator] = useState(false);
  const [formTrator, setFormTrator] = useState({
    data: new Date().toISOString().split('T')[0],
    maquinaTrator: 'Trator Valtra A950',
    responsavel: 'Valdecir (Mestre de Campo)',
    produto: 'Diesel S10',
    quantidadeLitros: 120,
    custoLitro: 5.89,
    operacao: 'Aração e Preparo do Solo para Mandiocultura',
    numeroNF: ''
  });

  // 3. Modal Lançar Despesa Situacional (Peças / Serviços / Manutenção)
  const [modalDespesaSituacional, setModalDespesaSituacional] = useState(false);
  const [formSituacional, setFormSituacional] = useState({
    data: new Date().toISOString().split('T')[0],
    nomeDespesa: '',
    tipo: 'PECA' as DespesaSitio['tipo'],
    produto: '',
    quantidade: 1,
    unidade: 'UN',
    valorUnitario: 150.00,
    valorTotal: 150.00,
    maquinaTrator: 'Trator Valtra A950',
    responsavel: 'Marcos Mecânico',
    numeroNF: '',
    fornecedor: 'TratorSul Peças e Implementos Agrícolas',
    cnpjFornecedor: '22.341.988/0001-12'
  });

  useEffect(() => {
    const handleUpdate = () => setDados(carregarControleSitio());
    window.addEventListener('sitio_controle_despesas_updated', handleUpdate);
    return () => window.removeEventListener('sitio_controle_despesas_updated', handleUpdate);
  }, []);

  // Cálculos Dinâmicos dos Cards:
  // 1. Total de litros disponível no tanque do sítio
  const totalLitrosDisponivel = dados.totalLitrosDisponivel;

  // Total em valor de combustível comprado
  const totalCombustivelCompradoValor = useMemo(() => {
    return dados.despesas
      .filter(d => d.tipo === 'COMBUSTIVEL' || d.unidade === 'L')
      .reduce((acc, d) => acc + (Number(d.valorTotal) || 0), 0);
  }, [dados.despesas]);

  // 2. Total de litros usados nesse mês de combustível no trator
  const mesAtualKey = new Date().toISOString().slice(0, 7); // YYYY-MM
  const litrosUsadosNoMes = useMemo(() => {
    return dados.despesas
      .filter(d => {
        const ehMesAtual = d.data.startsWith(mesAtualKey);
        const ehCombustivel = d.unidade === 'L' || d.tipo === 'COMBUSTIVEL';
        const ehUsoTrator = !d.nomeDespesa.toLowerCase().includes('compra de combustível');
        return ehMesAtual && ehCombustivel && ehUsoTrator;
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

  // AÇÃO 1: Entrada de Litros (Abastecer Tanque do Sítio)
  // Lança a despesa do combustível, adiciona no valor total de combustível comprado e adiciona nos litros disponíveis!
  const handleConfirmarEntradaLitros = (e: React.FormEvent) => {
    e.preventDefault();

    const qtdLitros = Number(formEntradaTanque.quantidadeLitros);
    const precoLitro = Number(formEntradaTanque.precoLitro);
    const totalCalculado = Number((qtdLitros * precoLitro).toFixed(2));
    const numeroNF = formEntradaTanque.numeroNF.trim() || `NF-${Math.floor(10000 + Math.random() * 90000)}`;

    const novaDespesaEntrada: DespesaSitio = {
      id: `desp_tanque_${Date.now()}`,
      data: formEntradaTanque.data,
      nomeDespesa: `Compra de Combustível - Tanque Central (${qtdLitros} L)`,
      tipo: 'COMBUSTIVEL',
      produto: formEntradaTanque.produto,
      quantidade: qtdLitros,
      unidade: 'L',
      valorUnitario: precoLitro,
      valorTotal: totalCalculado,
      maquinaTrator: 'Tanque Central da Fazenda',
      responsavel: 'Valdecir (Mestre de Campo)',
      notaFiscal: {
        numero: numeroNF,
        serie: '1',
        chaveAcesso: `4126 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} 0001 8855 0010 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} 9014`,
        dataEmissao: `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
        emitente: formEntradaTanque.fornecedor,
        cnpjEmitente: formEntradaTanque.cnpjFornecedor,
        destinatario: 'Sítio Santana - Grupo ENO Agroindústria',
        cnpjDestinatario: '08.721.432/0001-90',
        formaPagamento: 'Faturado 30 Dias (Boleto Bancário)',
        itens: [
          {
            descricao: `ÓLEO DIESEL ${formEntradaTanque.produto.toUpperCase()} A GRANEL`,
            quantidade: qtdLitros,
            unidade: 'L',
            precoUnitario: precoLitro,
            total: totalCalculado
          }
        ],
        observacoes: formEntradaTanque.observacoes
      }
    };

    const novosDados: ControleSitioState = {
      ...dados,
      totalLitrosDisponivel: dados.totalLitrosDisponivel + qtdLitros,
      despesas: [novaDespesaEntrada, ...dados.despesas]
    };

    salvarControleSitio(novosDados);
    setDados(novosDados);
    setModalEntradaLitros(false);
  };

  // AÇÃO 2: Lançar Litros no Trator (Consumo de Combustível no Trator)
  // Abate os litros do tanque disponível, adiciona aos litros usados no trator e registra na tabela!
  const handleConfirmarAbastecerTrator = (e: React.FormEvent) => {
    e.preventDefault();

    const qtdLitros = Number(formTrator.quantidadeLitros);
    const custoLitro = Number(formTrator.custoLitro);
    const totalCalculado = Number((qtdLitros * custoLitro).toFixed(2));
    const numeroNF = formTrator.numeroNF.trim() || `ABAST-${Math.floor(1000 + Math.random() * 9000)}`;

    const novaDespesaTrator: DespesaSitio = {
      id: `desp_trator_${Date.now()}`,
      data: formTrator.data,
      nomeDespesa: `Abastecimento ${formTrator.maquinaTrator} - ${formTrator.operacao}`,
      tipo: 'COMBUSTIVEL',
      produto: formTrator.produto,
      quantidade: qtdLitros,
      unidade: 'L',
      valorUnitario: custoLitro,
      valorTotal: totalCalculado,
      maquinaTrator: formTrator.maquinaTrator,
      responsavel: formTrator.responsavel,
      notaFiscal: {
        numero: numeroNF,
        serie: '1',
        chaveAcesso: `4126 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} 0001 9255 0010 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} 8172`,
        dataEmissao: `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
        emitente: 'Posto Rota do Agronegócio / Reserva do Sítio',
        cnpjEmitente: '14.892.102/0001-44',
        destinatario: 'Sítio Santana - Grupo ENO Agroindústria',
        cnpjDestinatario: '08.721.432/0001-90',
        formaPagamento: 'Retirada Direta Tanque da Fazenda',
        itens: [
          {
            descricao: `COMBUSTÍVEL AGRÍCOLA ${formTrator.produto.toUpperCase()} PARA ${formTrator.maquinaTrator.toUpperCase()}`,
            quantidade: qtdLitros,
            unidade: 'L',
            precoUnitario: custoLitro,
            total: totalCalculado
          }
        ],
        observacoes: `Operação agrícola: ${formTrator.operacao}. Operador: ${formTrator.responsavel}`
      }
    };

    const novosDados: ControleSitioState = {
      ...dados,
      totalLitrosDisponivel: Math.max(0, dados.totalLitrosDisponivel - qtdLitros),
      despesas: [novaDespesaTrator, ...dados.despesas]
    };

    salvarControleSitio(novosDados);
    setDados(novosDados);
    setModalAbastecerTrator(false);
  };

  // AÇÃO 3: Lançar Despesa Situacional (Peças / Oficina / Lubrificantes)
  const handleConfirmarDespesaSituacional = (e: React.FormEvent) => {
    e.preventDefault();

    const qtd = Number(formSituacional.quantidade);
    const vlrUnit = Number(formSituacional.valorUnitario);
    const totalCalculado = Number((qtd * vlrUnit).toFixed(2));
    const numeroNF = formSituacional.numeroNF.trim() || `NF-${Math.floor(10000 + Math.random() * 90000)}`;

    const novaDespesa: DespesaSitio = {
      id: `desp_sit_${Date.now()}`,
      data: formSituacional.data,
      nomeDespesa: formSituacional.nomeDespesa || `${formSituacional.produto} para ${formSituacional.maquinaTrator}`,
      tipo: formSituacional.tipo,
      produto: formSituacional.produto,
      quantidade: qtd,
      unidade: formSituacional.unidade,
      valorUnitario: vlrUnit,
      valorTotal: totalCalculado,
      maquinaTrator: formSituacional.maquinaTrator,
      responsavel: formSituacional.responsavel,
      notaFiscal: {
        numero: numeroNF,
        serie: '1',
        chaveAcesso: `4126 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} 0001 8855 0020 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} 2011`,
        dataEmissao: `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`,
        emitente: formSituacional.fornecedor,
        cnpjEmitente: formSituacional.cnpjFornecedor,
        destinatario: 'Sítio Santana - Grupo ENO Agroindústria',
        cnpjDestinatario: '08.721.432/0001-90',
        formaPagamento: 'Faturado / À Vista',
        itens: [
          {
            descricao: formSituacional.produto.toUpperCase(),
            quantidade: qtd,
            unidade: formSituacional.unidade,
            precoUnitario: vlrUnit,
            total: totalCalculado
          }
        ],
        observacoes: `Peça/serviço aplicado em: ${formSituacional.maquinaTrator}`
      }
    };

    const novosDados: ControleSitioState = {
      ...dados,
      despesas: [novaDespesa, ...dados.despesas]
    };

    salvarControleSitio(novosDados);
    setDados(novosDados);
    setModalDespesaSituacional(false);
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
              onClick={() => setModalEntradaLitros(true)}
              className="
                inline-flex items-center gap-2
                rounded-xl bg-emerald-600 hover:bg-emerald-500
                px-4 py-2 text-xs sm:text-sm font-extrabold text-white
                shadow-md shadow-emerald-950/30
                transition-all duration-150
                hover:-translate-y-0.5 cursor-pointer
              "
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Entrada de Litros</span>
            </button>
          </div>

        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">

        {/* 2. OS 3 CARDS DE ACORDO COM AS ESPECIFICAÇÕES EXATAS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          
          {/* ========================================================= */}
          {/* CARD 1: Total de litros disponível & Valor Comprado */}
          {/* (Sem 'reserva da fazenda', sem 'diesel s10 e gasolina',   */}
          {/*  com total em valor de combustível comprado e botão verde)*/}
          {/* ========================================================= */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Total de Litros Disponível
                </h3>
                <div className="mt-1 text-xs text-slate-500 font-semibold">
                  Total comprado: <strong className="text-emerald-800">R$ {totalCombustivelCompradoValor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Fuel className="w-6 h-6" />
              </div>
            </div>

            <div className="my-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {totalLitrosDisponivel.toLocaleString('pt-BR')}
                </span>
                <span className="text-lg font-bold text-emerald-700">Litros</span>
              </div>
            </div>

            {/* Apenas o Botão Entrada de Litros em cor verde preenchimento */}
            <div className="pt-2">
              <button
                onClick={() => setModalEntradaLitros(true)}
                className="
                  w-full py-2.5 px-4 rounded-xl
                  bg-emerald-600 hover:bg-emerald-700
                  text-white font-bold text-xs sm:text-sm
                  shadow-sm shadow-emerald-700/20
                  transition-all duration-150
                  flex items-center justify-center gap-2
                  cursor-pointer
                "
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Entrada de Litros (Abastecer Tanque)</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CARD 2: Total de litros usados nesse mês de combustível no trator */}
          {/* (Sem a linha de baixo com tratores, com botão de lançamento) */}
          {/* ========================================================= */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Litros Usados no Mês (Trator)
                </h3>
                <div className="mt-1 text-xs text-slate-500 font-semibold">
                  Consumo acumulado em Outubro/2026
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Tractor className="w-6 h-6" />
              </div>
            </div>

            <div className="my-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {litrosUsadosNoMes.toLocaleString('pt-BR')}
                </span>
                <span className="text-lg font-bold text-blue-600">Litros</span>
              </div>
            </div>

            {/* Botão de Lançamento de Litros no Trator */}
            <div className="pt-2">
              <button
                onClick={() => setModalAbastecerTrator(true)}
                className="
                  w-full py-2.5 px-4 rounded-xl
                  bg-blue-600 hover:bg-blue-700
                  text-white font-bold text-xs sm:text-sm
                  shadow-sm shadow-blue-700/20
                  transition-all duration-150
                  flex items-center justify-center gap-2
                  cursor-pointer
                "
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Lançar Litros no Trator</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CARD 3: Despesas situacionais */}
          {/* (Sem a linha de baixo '7 lançamentos com nf', com botão)  */}
          {/* ========================================================= */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Despesas Situacionais
                </h3>
                <div className="mt-1 text-xs text-slate-500 font-semibold">
                  Combustíveis, peças de reposição e revisões
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="my-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  R$ {totalDespesasSituacionais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Botão de Lançar Despesa Situacional */}
            <div className="pt-2">
              <button
                onClick={() => setModalDespesaSituacional(true)}
                className="
                  w-full py-2.5 px-4 rounded-xl
                  bg-amber-600 hover:bg-amber-700
                  text-white font-bold text-xs sm:text-sm
                  shadow-sm shadow-amber-700/20
                  transition-all duration-150
                  flex items-center justify-center gap-2
                  cursor-pointer
                "
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Lançar Despesa (Peças / Serviços)</span>
              </button>
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
      {/* MODAL 1: ENTRADA DE LITROS (COMPRA DE COMBUSTÍVEL / TANQUE)     */}
      {/* ============================================================== */}
      {modalEntradaLitros && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 sm:p-6 backdrop-blur-xs overflow-y-auto animate-in fade-in"
          onClick={() => setModalEntradaLitros(false)}
        >
          <div
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#022013] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Fuel className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-black text-base">Entrada de Litros (Abastecer Tanque)</h3>
                  <p className="text-[11px] text-emerald-300">
                    Lança a despesa do combustível, adiciona ao valor comprado e ao estoque de litros
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalEntradaLitros(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmarEntradaLitros} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data da Compra</label>
                  <input
                    type="date"
                    required
                    value={formEntradaTanque.data}
                    onChange={e => setFormEntradaTanque({ ...formEntradaTanque, data: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-emerald-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Combustível</label>
                  <select
                    value={formEntradaTanque.produto}
                    onChange={e => setFormEntradaTanque({ ...formEntradaTanque, produto: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-emerald-600 cursor-pointer font-semibold"
                  >
                    <option value="Diesel S10">Diesel S10 (Agrícola)</option>
                    <option value="Diesel S500">Diesel S500</option>
                    <option value="Gasolina Comum">Gasolina Comum</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantidade de Litros Comprados</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      value={formEntradaTanque.quantidadeLitros}
                      onChange={e => {
                        const qtd = Number(e.target.value);
                        setFormEntradaTanque(prev => ({
                          ...prev,
                          quantidadeLitros: qtd,
                          valorTotal: Number((qtd * prev.precoLitro).toFixed(2))
                        }));
                      }}
                      className="w-full pl-3 pr-8 py-2 border rounded-xl border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">L</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preço por Litro (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formEntradaTanque.precoLitro}
                    onChange={e => {
                      const preco = Number(e.target.value);
                      setFormEntradaTanque(prev => ({
                        ...prev,
                        precoLitro: preco,
                        valorTotal: Number((prev.quantidadeLitros * preco).toFixed(2))
                      }));
                    }}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Box de Resumo da Despesa Calculada */}
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    Valor Total da Compra (R$)
                  </span>
                  <div className="text-xl font-black text-emerald-950">
                    R$ {(formEntradaTanque.quantidadeLitros * formEntradaTanque.precoLitro).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-emerald-700 font-bold">Novo Saldo Tanque:</span>
                  <div className="text-sm font-black text-emerald-900">
                    + {formEntradaTanque.quantidadeLitros} L = {(dados.totalLitrosDisponivel + Number(formEntradaTanque.quantidadeLitros)).toLocaleString('pt-BR')} L
                  </div>
                </div>
              </div>

              {/* Dados da Nota Fiscal */}
              <div className="border-t border-slate-200 pt-3 space-y-3">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Dados Fiscais da Compra (Nota Fiscal)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Número da NF-e</label>
                    <input
                      type="text"
                      placeholder="Ex: 091.500"
                      value={formEntradaTanque.numeroNF}
                      onChange={e => setFormEntradaTanque({ ...formEntradaTanque, numeroNF: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Distribuidora / Fornecedor</label>
                    <input
                      type="text"
                      value={formEntradaTanque.fornecedor}
                      onChange={e => setFormEntradaTanque({ ...formEntradaTanque, fornecedor: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalEntradaLitros(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer"
                >
                  Confirmar Entrada de Combustível
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: LANÇAR LITROS NO TRATOR (ABASTECIMENTO DO TRATOR)      */}
      {/* ============================================================== */}
      {modalAbastecerTrator && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 sm:p-6 backdrop-blur-xs overflow-y-auto animate-in fade-in"
          onClick={() => setModalAbastecerTrator(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Tractor className="w-5 h-5 text-blue-300" />
                <div>
                  <h3 className="font-black text-base">Lançar Litros no Trator</h3>
                  <p className="text-[11px] text-blue-200">
                    Abate litros do tanque da fazenda e soma no consumo do trator do mês
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalAbastecerTrator(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmarAbastecerTrator} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data do Abastecimento</label>
                  <input
                    type="date"
                    required
                    value={formTrator.data}
                    onChange={e => setFormTrator({ ...formTrator, data: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-blue-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Máquina / Trator</label>
                  <select
                    value={formTrator.maquinaTrator}
                    onChange={e => setFormTrator({ ...formTrator, maquinaTrator: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-blue-600 cursor-pointer font-semibold"
                  >
                    <option value="Trator Valtra A950">Trator Valtra A950</option>
                    <option value="Trator Massey Ferguson 4292">Trator Massey Ferguson 4292</option>
                    <option value="Roçadeira Husqvarna & Motosserra">Roçadeira Husqvarna & Motosserra</option>
                    <option value="Caminhão Caçamba de Raiz">Caminhão Caçamba de Raiz</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Litros Colocados no Trator</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      value={formTrator.quantidadeLitros}
                      onChange={e => setFormTrator({ ...formTrator, quantidadeLitros: Number(e.target.value) })}
                      className="w-full pl-3 pr-8 py-2 border rounded-xl border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-blue-600 text-sm"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">L</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operador Responsável</label>
                  <input
                    type="text"
                    required
                    value={formTrator.responsavel}
                    onChange={e => setFormTrator({ ...formTrator, responsavel: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-blue-600 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Operação / Serviço no Sítio</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aração Talhão 01, Gradagem, Colheita..."
                  value={formTrator.operacao}
                  onChange={e => setFormTrator({ ...formTrator, operacao: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Box de Impacto no Tanque */}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-950 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-blue-800">Saldo Atual Tanque:</span>
                  <div className="font-bold">{totalLitrosDisponivel} L</div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-blue-800">Após o Abastecimento:</span>
                  <div className="text-sm font-black text-blue-900">
                    {Math.max(0, totalLitrosDisponivel - Number(formTrator.quantidadeLitros))} L disponíveis
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAbastecerTrator(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer"
                >
                  Registrar Litros no Trator
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: LANÇAR DESPESA SITUACIONAL (PEÇAS / SERVIÇOS)         */}
      {/* ============================================================== */}
      {modalDespesaSituacional && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 sm:p-6 backdrop-blur-xs overflow-y-auto animate-in fade-in"
          onClick={() => setModalDespesaSituacional(false)}
        >
          <div
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-amber-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Wrench className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-black text-base">Lançar Despesa Situacional</h3>
                  <p className="text-[11px] text-amber-200">
                    Peças de reposição, lubrificantes, consertos e manutenções
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalDespesaSituacional(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmarDespesaSituacional} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data da Despesa</label>
                  <input
                    type="date"
                    required
                    value={formSituacional.data}
                    onChange={e => setFormSituacional({ ...formSituacional, data: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-amber-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Item</label>
                  <select
                    value={formSituacional.tipo}
                    onChange={e => setFormSituacional({ ...formSituacional, tipo: e.target.value as DespesaSitio['tipo'] })}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-amber-600 cursor-pointer font-semibold"
                  >
                    <option value="PECA">Peça de Reposição</option>
                    <option value="LUBRIFICANTE">Óleo / Graxa / Lubrificante</option>
                    <option value="MANUTENCAO">Serviço / Manutenção Mecânica</option>
                    <option value="OUTROS">Outros Insumos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome da Despesa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Troca de Mangueira Hidráulica da Grade"
                  value={formSituacional.nomeDespesa}
                  onChange={e => setFormSituacional({ ...formSituacional, nomeDespesa: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Produto que foi</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mangueira 1/2 Pol, Filtro Óleo..."
                    value={formSituacional.produto}
                    onChange={e => setFormSituacional({ ...formSituacional, produto: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Máquina / Trator Destinado</label>
                  <select
                    value={formSituacional.maquinaTrator}
                    onChange={e => setFormSituacional({ ...formSituacional, maquinaTrator: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 focus:outline-none focus:border-amber-600 cursor-pointer"
                  >
                    <option value="Trator Valtra A950">Trator Valtra A950</option>
                    <option value="Trator Massey Ferguson 4292">Trator Massey Ferguson 4292</option>
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
                    min="1"
                    required
                    value={formSituacional.quantidade}
                    onChange={e => {
                      const q = Number(e.target.value);
                      setFormSituacional(prev => ({
                        ...prev,
                        quantidade: q,
                        valorTotal: Number((q * prev.valorUnitario).toFixed(2))
                      }));
                    }}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unidade</label>
                  <select
                    value={formSituacional.unidade}
                    onChange={e => setFormSituacional({ ...formSituacional, unidade: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 cursor-pointer font-bold"
                  >
                    <option value="UN">UN (Unidade)</option>
                    <option value="JG">JG (Jogo)</option>
                    <option value="CX">CX (Caixa)</option>
                    <option value="L">L (Litros)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valor Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formSituacional.valorUnitario}
                    onChange={e => {
                      const vu = Number(e.target.value);
                      setFormSituacional(prev => ({
                        ...prev,
                        valorUnitario: vu,
                        valorTotal: Number((prev.quantidade * vu).toFixed(2))
                      }));
                    }}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200 font-bold"
                  />
                </div>
              </div>

              {/* Valor Total Calculado */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                <span className="font-bold text-amber-900">Valor Total da Despesa:</span>
                <span className="text-base font-black text-amber-950">
                  R$ {(formSituacional.quantidade * formSituacional.valorUnitario).toFixed(2)}
                </span>
              </div>

              {/* Dados da NF */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Número da NF-e</label>
                  <input
                    type="text"
                    placeholder="Ex: 014.288"
                    value={formSituacional.numeroNF}
                    onChange={e => setFormSituacional({ ...formSituacional, numeroNF: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Fornecedor / Peças</label>
                  <input
                    type="text"
                    value={formSituacional.fornecedor}
                    onChange={e => setFormSituacional({ ...formSituacional, fornecedor: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalDespesaSituacional(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md cursor-pointer"
                >
                  Lançar Despesa
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: VER A NOTA FISCAL (DANFE / COMPROVANTE ELETRÔNICO)       */}
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

    </div>
  );
}
