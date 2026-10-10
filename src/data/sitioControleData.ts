// Dados e Lógica de Controle do Sítio / Fazenda (Plantio, Talhões, Colheita, Custos por Hectare e Estimativas de Safra de Mandioca)

export interface TalhaoSitio {
  id: string;
  codigo: string; // Ex: 'TAL-01'
  nome: string; // Ex: 'Gleba da Represa'
  area_ha: number; // Hectares
  variedade_mandioca: string; // Ex: 'Fécula Branca IAC-14', 'Baianinha', 'Pão da China'
  data_plantio: string; // YYYY-MM-DD
  data_previsao_colheita: string; // YYYY-MM-DD
  status: 'EM_DESENVOLVIMENTO' | 'PRONTO_COLHEITA' | 'COLHENDO' | 'COLHIDO' | 'PREPARO_SOLO';
  estimativa_ton_ha: number; // Média t/ha esperada (ex: 28 t/ha)
  toneladas_estimadas: number;
  custo_acumulado_reais: number;
  observacoes?: string;
}

export interface ApontamentoSitio {
  id: string;
  data: string;
  tipo: 'PLANTIO' | 'ADUBACAO' | 'PULVERIZACAO' | 'CAPINA_MANEJO' | 'COLHEITA' | 'DESPESA_COMBUSTIVEL' | 'MANUTENCAO_TRATOR';
  talhao_id: string;
  talhao_nome: string;
  responsavel: string;
  descricao: string;
  valor_custo: number;
  quantidade_utilizada?: string; // Ex: '4 sacos adubo 04-14-08', '120 litros diesel'
  horas_trator?: number;
}

export interface SitioControleData {
  id: string;
  nome_propriedade: string;
  responsavel_proprietario: string;
  municipio_uf: string;
  area_total_ha: number;
  safra_ativa: string;
  talhoes: TalhaoSitio[];
  apontamentos: ApontamentoSitio[];
}

export const SITIO_CONTROLE_INICIAL: SitioControleData = {
  id: 'sitio_principal',
  nome_propriedade: 'Sítio Santana & Fazenda Mandioca Forte',
  responsavel_proprietario: 'Grupo ENO - Gestão Agrícola Integrada',
  municipio_uf: 'Jacarezinho / PR',
  area_total_ha: 85,
  safra_ativa: 'Safra 2026/2027',
  talhoes: [
    {
      id: 'tal_01',
      codigo: 'TAL-01',
      nome: 'Gleba da Represa Velha',
      area_ha: 22.5,
      variedade_mandioca: 'Fécula Branca IAC-14 (Alto Amido)',
      data_plantio: '2025-09-15',
      data_previsao_colheita: '2026-10-20',
      status: 'PRONTO_COLHEITA',
      estimativa_ton_ha: 32,
      toneladas_estimadas: 720,
      custo_acumulado_reais: 42800.00,
      observacoes: 'Excelente enraizamento e taxa de amido medida em pré-colheita em 31,5%.'
    },
    {
      id: 'tal_02',
      codigo: 'TAL-02',
      nome: 'Talhão do Espigão Sul',
      area_ha: 18.0,
      variedade_mandioca: 'Baianinha do Norte Pioneiro',
      data_plantio: '2025-11-03',
      data_previsao_colheita: '2026-11-30',
      status: 'EM_DESENVOLVIMENTO',
      estimativa_ton_ha: 29,
      toneladas_estimadas: 522,
      custo_acumulado_reais: 28400.00,
      observacoes: 'Recebeu segunda adubação de cobertura em Janeiro/2026. Stand uniforme de plantas.'
    },
    {
      id: 'tal_03',
      codigo: 'TAL-03',
      nome: 'Mandiocal da Sede Nova',
      area_ha: 25.0,
      variedade_mandioca: 'Fécula Branca IAC-14',
      data_plantio: '2025-08-20',
      data_previsao_colheita: '2026-09-15',
      status: 'COLHENDO',
      estimativa_ton_ha: 34,
      toneladas_estimadas: 850,
      custo_acumulado_reais: 56100.00,
      observacoes: 'Colheita iniciada para fornecimento contínuo da fecularia. Transporte diário via caçamba.'
    },
    {
      id: 'tal_04',
      codigo: 'TAL-04',
      nome: 'Baixada dos Eucaliptos',
      area_ha: 19.5,
      variedade_mandioca: 'IAC 90 / Pão da China',
      data_plantio: '2026-03-10',
      data_previsao_colheita: '2027-04-15',
      status: 'EM_DESENVOLVIMENTO',
      estimativa_ton_ha: 30,
      toneladas_estimadas: 585,
      custo_acumulado_reais: 19200.00,
      observacoes: 'Plantio recente com ramas selecionadas e tratadas.'
    }
  ],
  apontamentos: [
    {
      id: 'apt_01',
      data: '2026-04-02',
      tipo: 'COLHEITA',
      talhao_id: 'tal_03',
      talhao_nome: 'Mandiocal da Sede Nova',
      responsavel: 'Valdecir (Mestre de Campo)',
      descricao: 'Arranquio mecanizado de 1.5 ha e carregamento de 2 carretas agrícolas com destino à fábrica.',
      valor_custo: 3200.00,
      horas_trator: 9
    },
    {
      id: 'apt_02',
      data: '2026-03-28',
      tipo: 'PULVERIZACAO',
      talhao_id: 'tal_02',
      talhao_nome: 'Talhão do Espigão Sul',
      responsavel: 'Marcos Operador',
      descricao: 'Aplicação foliar preventiva contra mandarová da mandioca.',
      valor_custo: 1850.00,
      quantidade_utilizada: '600 litros de calda biológica',
      horas_trator: 4
    },
    {
      id: 'apt_03',
      data: '2026-03-20',
      tipo: 'MANUTENCAO_TRATOR',
      talhao_id: 'tal_01',
      talhao_nome: 'Gleba da Represa Velha',
      responsavel: 'Oficina Central ENO',
      descricao: 'Troca de filtros, óleo do motor e graxa nos pinos do trator John Deere 6110M.',
      valor_custo: 2450.00,
      quantidade_utilizada: 'Óleo 15W40 + Filtros originais'
    },
    {
      id: 'apt_04',
      data: '2026-03-10',
      tipo: 'PLANTIO',
      talhao_id: 'tal_04',
      talhao_nome: 'Baixada dos Eucaliptos',
      responsavel: 'Valdecir (Mestre de Campo)',
      descricao: 'Plantio mecanizado com plantadeira de ramas de mandioca 2 linhas.',
      valor_custo: 8900.00,
      horas_trator: 16
    }
  ]
};

const STORAGE_KEY_SITIO = 'grupo_eno_sitio_controle_v1';

export function carregarDadosSitio(): SitioControleData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SITIO);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Erro ao ler dados do sítio:', e);
  }
  return SITIO_CONTROLE_INICIAL;
}

export function salvarDadosSitio(dados: SitioControleData): void {
  try {
    localStorage.setItem(STORAGE_KEY_SITIO, JSON.stringify(dados));
    window.dispatchEvent(new Event('sitio_controle_updated'));
  } catch (e) {
    console.error('Erro ao salvar dados do sítio:', e);
  }
}
