import React, { useState, useEffect, useMemo } from 'react';
import {
  Tractor,
  Calendar,
  Layers,
  TrendingUp,
  MapPin,
  Clock,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Fuel,
  Wrench,
  Sprout,
  Check,
  X,
  Filter
} from 'lucide-react';
import {
  TalhaoSitio,
  ApontamentoSitio,
  SitioControleData,
  carregarDadosSitio,
  salvarDadosSitio
} from '../../data/sitioControleData';

interface PortalControleSitioProps {
  onVoltar: () => void;
}

export function PortalControleSitio({ onVoltar }: PortalControleSitioProps) {
  const [sitio, setSitio] = useState<SitioControleData>(carregarDadosSitio());
  const [abaAtiva, setAbaAtiva] = useState<'talhoes' | 'apontamentos' | 'indicadores'>('talhoes');

  // Modal Novo Talhão
  const [modalTalhao, setModalTalhao] = useState(false);
  const [talhaoEmEdicao, setTalhaoEmEdicao] = useState<TalhaoSitio | null>(null);
  const [formTalhao, setFormTalhao] = useState<Omit<TalhaoSitio, 'id'>>({
    codigo: 'TAL-05',
    nome: '',
    area_ha: 15,
    variedade_mandioca: 'Fécula Branca IAC-14',
    data_plantio: new Date().toISOString().split('T')[0],
    data_previsao_colheita: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    status: 'EM_DESENVOLVIMENTO',
    estimativa_ton_ha: 30,
    toneladas_estimadas: 450,
    custo_acumulado_reais: 15000,
    observacoes: ''
  });

  // Modal Novo Apontamento
  const [modalApontamento, setModalApontamento] = useState(false);
  const [formApontamento, setFormApontamento] = useState<Omit<ApontamentoSitio, 'id'>>({
    data: new Date().toISOString().split('T')[0],
    tipo: 'ADUBACAO',
    talhao_id: sitio.talhoes[0]?.id || '',
    talhao_nome: sitio.talhoes[0]?.nome || '',
    responsavel: 'Valdecir (Mestre de Campo)',
    descricao: '',
    valor_custo: 1200,
    quantidade_utilizada: '',
    horas_trator: 0
  });

  useEffect(() => {
    const handleUpdate = () => setSitio(carregarDadosSitio());
    window.addEventListener('sitio_controle_updated', handleUpdate);
    return () => window.removeEventListener('sitio_controle_updated', handleUpdate);
  }, []);

  // Métricas Consolidadas do Sítio
  const metricas = useMemo(() => {
    const totalAreaPlantadaHa = sitio.talhoes.reduce((acc, t) => acc + t.area_ha, 0);
    const totalTonEstimadas = sitio.talhoes.reduce((acc, t) => acc + t.toneladas_estimadas, 0);
    const custoTotalManejo = sitio.talhoes.reduce((acc, t) => acc + t.custo_acumulado_reais, 0);
    const custoMedioPorHa = totalAreaPlantadaHa > 0 ? (custoTotalManejo / totalAreaPlantadaHa) : 0;
    const mediaProdutividadeTonHa = totalAreaPlantadaHa > 0 ? (totalTonEstimadas / totalAreaPlantadaHa) : 0;

    return {
      totalAreaPlantadaHa,
      totalTonEstimadas,
      custoTotalManejo,
      custoMedioPorHa,
      mediaProdutividadeTonHa
    };
  }, [sitio]);

  // Salvar Talhão
  const handleSalvarTalhao = (e: React.FormEvent) => {
    e.preventDefault();
    const tonEstimadas = formTalhao.area_ha * formTalhao.estimativa_ton_ha;

    let novosTalhoes = [...sitio.talhoes];
    if (talhaoEmEdicao) {
      novosTalhoes = novosTalhoes.map(t => {
        if (t.id === talhaoEmEdicao.id) {
          return {
            ...t,
            ...formTalhao,
            toneladas_estimadas: tonEstimadas
          };
        }
        return t;
      });
    } else {
      const novo: TalhaoSitio = {
        id: `tal_${Date.now()}`,
        ...formTalhao,
        toneladas_estimadas: tonEstimadas
      };
      novosTalhoes.push(novo);
    }

    const atualizado = { ...sitio, talhoes: novosTalhoes };
    salvarDadosSitio(atualizado);
    setSitio(atualizado);
    setModalTalhao(false);
    setTalhaoEmEdicao(null);
  };

  // Salvar Apontamento de Campo
  const handleSalvarApontamento = (e: React.FormEvent) => {
    e.preventDefault();
    const talhao = sitio.talhoes.find(t => t.id === formApontamento.talhao_id);
    const novo: ApontamentoSitio = {
      id: `apt_${Date.now()}`,
      ...formApontamento,
      talhao_nome: talhao ? talhao.nome : formApontamento.talhao_nome
    };

    // Atualiza o custo acumulado no talhão correspondente
    const talhoesAtualizados = sitio.talhoes.map(t => {
      if (t.id === formApontamento.talhao_id) {
        return {
          ...t,
          custo_acumulado_reais: t.custo_acumulado_reais + Number(formApontamento.valor_custo || 0)
        };
      }
      return t;
    });

    const atualizado = {
      ...sitio,
      talhoes: talhoesAtualizados,
      apontamentos: [novo, ...sitio.apontamentos]
    };
    salvarDadosSitio(atualizado);
    setSitio(atualizado);
    setModalApontamento(false);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-800 flex flex-col font-sans select-none">
      
      {/* 1. TOPO DO PORTAL CONTROLE DO SÍTIO */}
      <header className="sticky top-0 z-30 bg-[#022013] text-white border-b border-emerald-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onVoltar}
              className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Voltar ao Painel Principal"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-500 to-emerald-700 flex items-center justify-center text-white shadow-sm">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                Grupo ENO · Produção Agrícola Própria
              </div>
              <h1 className="text-base sm:text-xl font-black text-white tracking-tight leading-none">
                Controle do Sítio & Mandiocultura
              </h1>
            </div>
          </div>

          {/* Abas e Atalhos */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTalhaoEmEdicao(null);
                setFormTalhao({
                  codigo: `TAL-0${sitio.talhoes.length + 1}`,
                  nome: '',
                  area_ha: 12,
                  variedade_mandioca: 'Fécula Branca IAC-14',
                  data_plantio: new Date().toISOString().split('T')[0],
                  data_previsao_colheita: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
                  status: 'EM_DESENVOLVIMENTO',
                  estimativa_ton_ha: 30,
                  toneladas_estimadas: 360,
                  custo_acumulado_reais: 10000,
                  observacoes: ''
                });
                setModalTalhao(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Talhão</span>
            </button>

            <button
              onClick={() => {
                setFormApontamento({
                  data: new Date().toISOString().split('T')[0],
                  tipo: 'ADUBACAO',
                  talhao_id: sitio.talhoes[0]?.id || '',
                  talhao_nome: sitio.talhoes[0]?.nome || '',
                  responsavel: 'Valdecir (Mestre de Campo)',
                  descricao: '',
                  valor_custo: 1500,
                  quantidade_utilizada: '',
                  horas_trator: 0
                });
                setModalApontamento(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-lime-600 hover:bg-lime-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Lançar Manejo / Custo</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. CONTEÚDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Identificação do Sítio */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">{sitio.nome_propriedade}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-lime-100 text-lime-900 border border-lime-300">
                {sitio.safra_ativa}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
              <span>Localização: <strong>{sitio.municipio_uf}</strong></span>
              <span>•</span>
              <span>Área Total da Propriedade: <strong>{sitio.area_total_ha} Hectares</strong></span>
              <span>•</span>
              <span>Gestão Responsável: <strong>{sitio.responsavel_proprietario}</strong></span>
            </div>
          </div>

          {/* Abas */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setAbaAtiva('talhoes')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                abaAtiva === 'talhoes' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Talhões & Plantio ({sitio.talhoes.length})
            </button>
            <button
              onClick={() => setAbaAtiva('apontamentos')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                abaAtiva === 'apontamentos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Manejo & Custos ({sitio.apontamentos.length})
            </button>
          </div>
        </div>

        {/* 4 Cards de Resumo do Mandiocal */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="text-xs font-bold text-slate-500">Área de Mandioca Plantada</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {metricas.totalAreaPlantadaHa.toFixed(1)} <span className="text-sm font-bold text-slate-500">ha</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">{sitio.talhoes.length} talhões mapeados</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="text-xs font-bold text-slate-500">Estimativa de Safra Prevista</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
              {metricas.totalTonEstimadas.toLocaleString('pt-BR')} <span className="text-sm font-bold text-slate-500">ton</span>
            </div>
            <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
              Média estimada: {metricas.mediaProdutividadeTonHa.toFixed(1)} t/ha
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="text-xs font-bold text-slate-500">Custo Total de Manejo & Solo</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              R$ {metricas.custoTotalManejo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Adubação, maquinário e colheita</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="text-xs font-bold text-slate-500">Custo Médio por Hectare</div>
            <div className="text-2xl sm:text-3xl font-black text-lime-700 mt-1">
              R$ {metricas.custoMedioPorHa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span className="text-xs text-slate-500">/ha</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Base acumulada da safra atual</div>
          </div>
        </div>

        {/* ABA 1: TALHÕES DO SÍTIO */}
        {abaAtiva === 'talhoes' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Talhões de Mandioca & Previsão de Colheita
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Acompanhe a variedade, stand de plantas, previsão de colheita e custos de cada gleba
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-5">Código / Gleba</th>
                    <th className="py-3 px-4">Área</th>
                    <th className="py-3 px-4">Variedade de Mandioca</th>
                    <th className="py-3 px-4">Plantio / Previsão</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Estimativa Safra</th>
                    <th className="py-3 px-4 text-right">Custo Acumulado</th>
                    <th className="py-3 px-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sitio.talhoes.map((talhao) => (
                    <tr key={talhao.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-mono font-black text-slate-900 text-sm">{talhao.codigo}</div>
                        <div className="text-xs text-emerald-800 font-bold mt-0.5">{talhao.nome}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {talhao.area_ha.toFixed(1)} ha
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {talhao.variedade_mandioca}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        <div>Plantio: {talhao.data_plantio.split('-').reverse().join('/')}</div>
                        <div className="text-emerald-700 font-bold">Colheita: {talhao.data_previsao_colheita.split('-').reverse().join('/')}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {talhao.status === 'COLHENDO' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Colhendo
                          </span>
                        ) : talhao.status === 'PRONTO_COLHEITA' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-lime-100 text-lime-800 border border-lime-300">
                            Pronto p/ Colheita
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300">
                            Em Desenvolvimento
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">
                        <div className="font-black text-slate-900 text-sm">{talhao.toneladas_estimadas} ton</div>
                        <div className="text-[11px] text-slate-500">({talhao.estimativa_ton_ha} t/ha)</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        R$ {talhao.custo_acumulado_reais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => {
                            setTalhaoEmEdicao(talhao);
                            setFormTalhao({
                              codigo: talhao.codigo,
                              nome: talhao.nome,
                              area_ha: talhao.area_ha,
                              variedade_mandioca: talhao.variedade_mandioca,
                              data_plantio: talhao.data_plantio,
                              data_previsao_colheita: talhao.data_previsao_colheita,
                              status: talhao.status,
                              estimativa_ton_ha: talhao.estimativa_ton_ha,
                              toneladas_estimadas: talhao.toneladas_estimadas,
                              custo_acumulado_reais: talhao.custo_acumulado_reais,
                              observacoes: talhao.observacoes || ''
                            });
                            setModalTalhao(true);
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          title="Editar Talhão"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: APONTAMENTOS DE MANEJO & CUSTO */}
        {abaAtiva === 'apontamentos' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Apontamentos Operacionais no Campo (Manejo, Insumos e Tratores)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registro diário de adubações, horas de trator, defensivos e combustível alocados
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-5">Data</th>
                    <th className="py-3 px-4">Talhão</th>
                    <th className="py-3 px-4">Tipo de Atividade</th>
                    <th className="py-3 px-4">Descrição do Trabalho</th>
                    <th className="py-3 px-4">Responsável</th>
                    <th className="py-3 px-4 text-center">Horas Trator</th>
                    <th className="py-3 px-5 text-right">Custo Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sitio.apontamentos.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                        {apt.data.split('-').reverse().join('/')}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-800">
                        {apt.talhao_nome}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800">
                          {apt.tipo}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-xs font-medium">
                        <div>{apt.descricao}</div>
                        {apt.quantidade_utilizada && (
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">Insumo: {apt.quantidade_utilizada}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {apt.responsavel}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        {apt.horas_trator ? `${apt.horas_trator}h` : '-'}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-black text-slate-900">
                        R$ {apt.valor_custo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* MODAL NOVO / EDITAR TALHÃO */}
      {modalTalhao && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-emerald-900/20">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-lg font-black text-slate-900">
                {talhaoEmEdicao ? 'Editar Talhão' : 'Cadastrar Novo Talhão de Mandioca'}
              </h3>
              <button
                onClick={() => setModalTalhao(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarTalhao} className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Código do Talhão</label>
                  <input
                    type="text"
                    value={formTalhao.codigo}
                    onChange={e => setFormTalhao({ ...formTalhao, codigo: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nome / Gleba</label>
                  <input
                    type="text"
                    value={formTalhao.nome}
                    onChange={e => setFormTalhao({ ...formTalhao, nome: e.target.value })}
                    placeholder="Ex: Gleba da Nascente"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Área (Hectares)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formTalhao.area_ha}
                    onChange={e => setFormTalhao({ ...formTalhao, area_ha: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Produtividade Esperada (ton/ha)</label>
                  <input
                    type="number"
                    value={formTalhao.estimativa_ton_ha}
                    onChange={e => setFormTalhao({ ...formTalhao, estimativa_ton_ha: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Variedade de Mandioca</label>
                <input
                  type="text"
                  value={formTalhao.variedade_mandioca}
                  onChange={e => setFormTalhao({ ...formTalhao, variedade_mandioca: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Data do Plantio</label>
                  <input
                    type="date"
                    value={formTalhao.data_plantio}
                    onChange={e => setFormTalhao({ ...formTalhao, data_plantio: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Previsão de Colheita</label>
                  <input
                    type="date"
                    value={formTalhao.data_previsao_colheita}
                    onChange={e => setFormTalhao({ ...formTalhao, data_previsao_colheita: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status do Talhão</label>
                  <select
                    value={formTalhao.status}
                    onChange={e => setFormTalhao({ ...formTalhao, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-white font-bold"
                  >
                    <option value="EM_DESENVOLVIMENTO">Em Desenvolvimento</option>
                    <option value="PRONTO_COLHEITA">Pronto para Colheita</option>
                    <option value="COLHENDO">Colhendo</option>
                    <option value="COLHIDO">Colhido</option>
                    <option value="PREPARO_SOLO">Preparo do Solo</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Custo Acumulado Inicial (R$)</label>
                  <input
                    type="number"
                    value={formTalhao.custo_acumulado_reais}
                    onChange={e => setFormTalhao({ ...formTalhao, custo_acumulado_reais: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalTalhao(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-sm"
                >
                  Salvar Talhão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO APONTAMENTO DE MANEJO / CUSTO */}
      {modalApontamento && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-emerald-900/20">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-lg font-black text-slate-900">
                Lançar Apontamento Operacional & Custo de Manejo
              </h3>
              <button
                onClick={() => setModalApontamento(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarApontamento} className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Talhão de Destino</label>
                  <select
                    value={formApontamento.talhao_id}
                    onChange={e => {
                      const t = sitio.talhoes.find(item => item.id === e.target.value);
                      setFormApontamento({
                        ...formApontamento,
                        talhao_id: e.target.value,
                        talhao_nome: t ? t.nome : ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-white font-bold"
                  >
                    {sitio.talhoes.map(t => (
                      <option key={t.id} value={t.id}>{t.codigo} - {t.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Manejo</label>
                  <select
                    value={formApontamento.tipo}
                    onChange={e => setFormApontamento({ ...formApontamento, tipo: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-white font-bold"
                  >
                    <option value="ADUBACAO">Adubação de Base / Cobertura</option>
                    <option value="PLANTIO">Plantio de Ramas</option>
                    <option value="PULVERIZACAO">Pulverização / Defensivos</option>
                    <option value="CAPINA_MANEJO">Capina / Controle de Daninhas</option>
                    <option value="COLHEITA">Colheita & Carregamento</option>
                    <option value="DESPESA_COMBUSTIVEL">Diesel / Combustível</option>
                    <option value="MANUTENCAO_TRATOR">Manutenção de Trator / Equipamento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descrição do Serviço / Atividade</label>
                <input
                  type="text"
                  value={formApontamento.descricao}
                  onChange={e => setFormApontamento({ ...formApontamento, descricao: e.target.value })}
                  placeholder="Ex: Aplicação de 400kg de adubo NPK 04-14-08 na área da nascente"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Custo Total (R$)</label>
                  <input
                    type="number"
                    value={formApontamento.valor_custo}
                    onChange={e => setFormApontamento({ ...formApontamento, valor_custo: parseFloat(e.target.value) || 0 })}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Horas de Trator</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formApontamento.horas_trator || 0}
                    onChange={e => setFormApontamento({ ...formApontamento, horas_trator: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Responsável</label>
                  <input
                    type="text"
                    value={formApontamento.responsavel}
                    onChange={e => setFormApontamento({ ...formApontamento, responsavel: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Insumo Utilizado / Detalhes</label>
                <input
                  type="text"
                  value={formApontamento.quantidade_utilizada || ''}
                  onChange={e => setFormApontamento({ ...formApontamento, quantidade_utilizada: e.target.value })}
                  placeholder="Ex: 8 sacos adubo, 60L diesel"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalApontamento(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime-600 hover:bg-lime-700 text-white font-bold cursor-pointer shadow-sm"
                >
                  Confirmar Apontamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
