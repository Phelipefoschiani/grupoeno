// Módulo Financeiro Consolidado do Grupo ENO Agroindustrial
// Integra Contas a Receber (Vendas Faturadas), Contas a Pagar (Compras de Mandioca / Insumos),
// Lançamento de Despesas, Notas Fiscais (Entrada/Saída), Receitas Extras e Caixa de Investimento.

export interface TituloReceber {
  id: string;
  pedido_venda_id?: string;
  numero_documento: string; // ex: DUP-4891-01
  cliente_nome: string;
  cliente_cnpj: string;
  valor: number;
  data_emissao: string;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'EM_ABERTO' | 'PAGO' | 'VENCIDO';
  forma_pagamento: string;
  banco_emissor: string;
  linha_digitavel?: string;
  observacoes?: string;
}

export interface TituloPagar {
  id: string;
  pedido_compra_id?: string;
  numero_documento: string; // ex: DUP-ENT-1048
  favorecido_nome: string;
  tipo_favorecido: 'Agricultor' | 'Fornecedor' | 'Operacional';
  categoria: 'Mandioca / Matéria-Prima' | 'Lenha & Biomassa' | 'Embalagens' | 'Energia / Concessionárias' | 'Manutenção Mecânica' | 'Fretes';
  valor: number;
  data_emissao: string;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'A_PAGAR' | 'PAGO' | 'VENCIDO';
  forma_pagamento: string;
  chave_pix?: string;
  dados_bancarios?: string;
  observacoes?: string;
}

export interface DespesaOperacional {
  id: string;
  data: string;
  categoria: string;
  descricao: string;
  valor: number;
  setor: 'Fábrica & Moagem' | 'Secador & Caldeira' | 'Frotas & Logística' | 'Administrativo & TI' | 'Qualidade & Laboratório';
  responsavel: string;
  forma_pagamento: string;
  comprovante_anexo?: boolean;
}

export interface NotaFiscalSaida {
  id: string;
  numero: string;
  serie: string;
  chave_acesso: string;
  cliente_nome: string;
  cnpj_cpf: string;
  valor_total: number;
  peso_liquido_kg: number;
  data_emissao: string;
  status_sefaz: 'AUTORIZADA' | 'CANCELADA' | 'INUTILIZADA';
  transportadora: string;
  placa: string;
}

export interface NotaFiscalEntrada {
  id: string;
  numero: string;
  serie: string;
  chave_acesso: string;
  parceiro_nome: string;
  tipo_parceiro: 'Agricultor' | 'Fornecedor';
  cnpj_cpf: string;
  produto_descricao: string;
  peso_liquido_kg: number;
  valor_total: number;
  data_emissao: string;
  status_sefaz: 'AUTORIZADA' | 'PROCESSADA';
}

export interface LancamentoReceita {
  id: string;
  data: string;
  origem: 'Venda de Resíduo/Bagaço Úmido' | 'Venda de Cascas/Destopo' | 'Rendimento de Aplicação Financeira' | 'Bonificação/Reembolso' | 'Outras Receitas';
  comprador_origem: string;
  descricao: string;
  valor: number;
  conta_creditada: string;
  forma_recebimento: string;
}

export interface CaixaInvestimento {
  saldo_disponivel_industrial: number;
  fundo_reserva_safra: number;
  fundo_modernizacao_maquinario: number;
  rendimento_mensal_estimado: number;
  investimentos_recentes: Array<{
    id: string;
    data: string;
    titulo: string;
    valor: number;
    categoria: string;
    status: 'CONCLUIDO' | 'EM_ANDAMENTO' | 'PLANEJADO';
  }>;
}

// DADOS INICIAIS DE CONTAS A RECEBER (espelhado dos pedidos faturados)
export const TITULOS_RECEBER_INICIAIS: TituloReceber[] = [
  {
    id: 'rec_001',
    pedido_venda_id: 'ped_venda_006',
    numero_documento: 'FAT-4891-01',
    cliente_nome: 'Atacadão de Cereais & Féculas Triângulo',
    cliente_cnpj: '02.418.990/0001-12',
    valor: 105000.00,
    data_emissao: '26/03/2026',
    data_vencimento: '23/04/2026',
    status: 'EM_ABERTO',
    forma_pagamento: 'Boleto Bancário 28 Dias',
    banco_emissor: 'Banco do Brasil S.A. (Ag. 0048)',
    linha_digitavel: '00190.00009 01234.567890 12345.678901 1 95420000105000',
    observacoes: 'NF-e 004.891 emitida. Carga entregue em Uberlândia/MG.'
  },
  {
    id: 'rec_002',
    pedido_venda_id: 'ped_venda_007',
    numero_documento: 'FAT-4872-01',
    cliente_nome: 'Indústria de Biscoitos & Massas Paulista S.A.',
    cliente_cnpj: '51.902.441/0001-77',
    valor: 148750.00,
    data_emissao: '15/03/2026',
    data_vencimento: '19/04/2026',
    status: 'EM_ABERTO',
    forma_pagamento: 'Boleto Bancário 35 Dias',
    banco_emissor: 'Itaú Unibanco S.A. (Ag. 1892)',
    linha_digitavel: '34191.09008 55432.109876 54321.098765 2 95380000148750',
    observacoes: 'Contrato industrial anual. 42 Ton de fécula doce.'
  },
  {
    id: 'rec_003',
    pedido_venda_id: 'ped_venda_008',
    numero_documento: 'FAT-4855-01',
    cliente_nome: 'Distribuidora de Alimentos Vale Verde S.A.',
    cliente_cnpj: '08.774.321/0001-89',
    valor: 39590.00,
    data_emissao: '11/03/2026',
    data_vencimento: '25/03/2026',
    data_pagamento: '25/03/2026',
    status: 'PAGO',
    forma_pagamento: 'Boleto Bancário (1/2)',
    banco_emissor: 'Banco do Brasil S.A. (Ag. 0048)',
    observacoes: 'Primeira parcela liquidada no prazo via compensação bancária.'
  },
  {
    id: 'rec_004',
    pedido_venda_id: 'ped_venda_008',
    numero_documento: 'FAT-4855-02',
    cliente_nome: 'Distribuidora de Alimentos Vale Verde S.A.',
    cliente_cnpj: '08.774.321/0001-89',
    valor: 39590.00,
    data_emissao: '11/03/2026',
    data_vencimento: '25/04/2026',
    status: 'EM_ABERTO',
    forma_pagamento: 'Boleto Bancário (2/2)',
    banco_emissor: 'Banco do Brasil S.A. (Ag. 0048)',
    linha_digitavel: '00190.00009 01234.998877 65432.112233 4 95440000039590',
    observacoes: 'Segunda parcela do pedido 1031.'
  }
];

// DADOS INICIAIS DE CONTAS A PAGAR
export const TITULOS_PAGAR_INICIAIS: TituloPagar[] = [
  {
    id: 'pag_001',
    numero_documento: 'COMP-RAIZ-401',
    favorecido_nome: 'Antônio Carlos Beltrame (Sítio Três Meninas)',
    tipo_favorecido: 'Agricultor',
    categoria: 'Mandioca / Matéria-Prima',
    valor: 18450.00,
    data_emissao: '26/03/2026',
    data_vencimento: '02/04/2026',
    status: 'A_PAGAR',
    forma_pagamento: 'PIX (Chave CPF)',
    chave_pix: '123.456.789-00',
    observacoes: '30.750 kg de raiz bruta entregues na balança. Desconto de destopo 5.8%.'
  },
  {
    id: 'pag_002',
    numero_documento: 'COMP-LEN-102',
    favorecido_nome: 'Biomassa Florestal & Cavacos Brasil Ltda',
    tipo_favorecido: 'Fornecedor',
    categoria: 'Lenha & Biomassa',
    valor: 13200.00,
    data_emissao: '20/03/2026',
    data_vencimento: '05/04/2026',
    status: 'A_PAGAR',
    forma_pagamento: 'Boleto Bancário',
    observacoes: '120 estéreos de lenha seca de eucalipto para caldeira a vapor.'
  },
  {
    id: 'pag_003',
    numero_documento: 'COMP-EMB-88',
    favorecido_nome: 'Ráfia & Embalagens Industriais Paulista',
    tipo_favorecido: 'Fornecedor',
    categoria: 'Embalagens',
    valor: 32000.00,
    data_emissao: '14/03/2026',
    data_vencimento: '28/03/2026',
    data_pagamento: '28/03/2026',
    status: 'PAGO',
    forma_pagamento: 'TED Bancária',
    observacoes: '10.000 sacos de ráfia valvulados 25kg com impressão Grupo ENO.'
  },
  {
    id: 'pag_004',
    numero_documento: 'CONC-ENERGIA-03',
    favorecido_nome: 'Companhia Energética Elektro / Neoenergia',
    tipo_favorecido: 'Operacional',
    categoria: 'Energia / Concessionárias',
    valor: 42800.00,
    data_emissao: '10/03/2026',
    data_vencimento: '10/04/2026',
    status: 'A_PAGAR',
    forma_pagamento: 'Débito Automático / Boleto',
    observacoes: 'Fatura de média tensão (Demanda industrial ponta/fora de ponta da fábrica).'
  }
];

// DADOS DE DESPESAS OPERACIONAIS
export const DESPESAS_OPERACIONAIS_INICIAIS: DespesaOperacional[] = [
  {
    id: 'desp_001',
    data: '27/03/2026',
    categoria: 'Combustível & Abastecimento',
    descricao: 'Diesel S10 para trator pás carregadeiras e empilhadeiras do pátio',
    valor: 4850.00,
    setor: 'Fábrica & Moagem',
    responsavel: 'Valmir de Souza (Encarregado Pátio)',
    forma_pagamento: 'Cartão Frota Corporativo'
  },
  {
    id: 'desp_002',
    data: '25/03/2026',
    categoria: 'Manutenção Mecânica & Peças',
    descricao: 'Substituição de correias dentadas e rolamentos SKF do ralador industrial',
    valor: 2780.00,
    setor: 'Fábrica & Moagem',
    responsavel: 'Paulo César Antunes (Mecânico Chefe)',
    forma_pagamento: 'Boleto 14 Dias'
  },
  {
    id: 'desp_003',
    data: '22/03/2026',
    categoria: 'Reagentes & Análises',
    descricao: 'Kits químicos para titulação de acidez e análise de cinzas no laboratório',
    valor: 1150.00,
    setor: 'Qualidade & Laboratório',
    responsavel: 'Camila Fernandes (Eng. de Alimentos)',
    forma_pagamento: 'PIX'
  }
];

// DADOS DE NOTAS FISCAIS DE SAÍDA (NF-e)
export const NOTAS_SAIDA_INICIAIS: NotaFiscalSaida[] = [
  {
    id: 'nfe_sai_001',
    numero: '004.891',
    serie: '1',
    chave_acesso: '41260302418990000112550010000048911048912340',
    cliente_nome: 'Atacadão de Cereais & Féculas Triângulo',
    cnpj_cpf: '02.418.990/0001-12',
    valor_total: 105000.00,
    peso_liquido_kg: 30000,
    data_emissao: '26/03/2026 14:15',
    status_sefaz: 'AUTORIZADA',
    transportadora: 'Transportadora Triângulo Mineiro Ltda',
    placa: 'NKL-9921'
  },
  {
    id: 'nfe_sai_002',
    numero: '004.872',
    serie: '1',
    chave_acesso: '41260351902441000177550010000048721048721190',
    cliente_nome: 'Indústria de Biscoitos & Massas Paulista S.A.',
    cnpj_cpf: '51.902.441/0001-77',
    valor_total: 148750.00,
    peso_liquido_kg: 42350,
    data_emissao: '15/03/2026 16:30',
    status_sefaz: 'AUTORIZADA',
    transportadora: 'TransGrãos Logística Cargas Pesadas',
    placa: 'PRX-1842'
  },
  {
    id: 'nfe_sai_003',
    numero: '004.855',
    serie: '1',
    chave_acesso: '41260308774321000189550010000048551048558832',
    cliente_nome: 'Distribuidora de Alimentos Vale Verde S.A.',
    cnpj_cpf: '08.774.321/0001-89',
    valor_total: 79180.00,
    peso_liquido_kg: 19600,
    data_emissao: '11/03/2026 09:40',
    status_sefaz: 'AUTORIZADA',
    transportadora: 'Transportes Paulínia Cargas Fracionadas',
    placa: 'BWE-3310'
  }
];

// DADOS DE NOTAS FISCAIS DE ENTRADA (NFe-E)
export const NOTAS_ENTRADA_INICIAIS: NotaFiscalEntrada[] = [
  {
    id: 'nfe_ent_001',
    numero: '001.240',
    serie: '1',
    chave_acesso: '41260312345678000100550010000012401012409988',
    parceiro_nome: 'Antônio Carlos Beltrame (Sítio Três Meninas)',
    tipo_parceiro: 'Agricultor',
    cnpj_cpf: '123.456.789-00',
    produto_descricao: 'Mandioca Raiz In Natura para Industrialização',
    peso_liquido_kg: 30750,
    valor_total: 18450.00,
    data_emissao: '26/03/2026 08:30',
    status_sefaz: 'AUTORIZADA'
  },
  {
    id: 'nfe_ent_002',
    numero: '002.890',
    serie: '2',
    chave_acesso: '41260399887766000199550020000028901028901122',
    parceiro_nome: 'Biomassa Florestal & Cavacos Brasil Ltda',
    tipo_parceiro: 'Fornecedor',
    cnpj_cpf: '99.887.766/0001-99',
    produto_descricao: 'Lenha de Eucalipto Reflorestado em Toras',
    peso_liquido_kg: 48000,
    valor_total: 13200.00,
    data_emissao: '20/03/2026 11:20',
    status_sefaz: 'AUTORIZADA'
  }
];

// RECEITAS EXTRAS / SUBPRODUTOS
export const RECEITAS_EXTRAS_INICIAIS: LancamentoReceita[] = [
  {
    id: 'rec_extra_001',
    data: '27/03/2026',
    origem: 'Venda de Resíduo/Bagaço Úmido',
    comprador_origem: 'Fazenda Confinamento Vale Verde (Bovinos de Corte)',
    descricao: 'Venda de 18 Toneladas de bagaço de mandioca prensado para nutrição animal',
    valor: 4500.00,
    conta_creditada: 'Banco do Brasil - Conta Movimento',
    forma_recebimento: 'PIX à Vista'
  },
  {
    id: 'rec_extra_002',
    data: '20/03/2026',
    origem: 'Rendimento de Aplicação Financeira',
    comprador_origem: 'Tesouro Selic / CDB Liquidez Diária BB',
    descricao: 'Rendimento de juros do caixa de safra e capital de giro',
    valor: 12840.00,
    conta_creditada: 'Conta Aplicação Automática',
    forma_recebimento: 'Crédito em Conta'
  }
];

// CAIXA DE INVESTIMENTO E RESERVA DE SAFRA
export const CAIXA_INVESTIMENTO_INICIAL: CaixaInvestimento = {
  saldo_disponivel_industrial: 485900.00,
  fundo_reserva_safra: 750000.00, // Garantia de compra de mandioca na safra alta
  fundo_modernizacao_maquinario: 220000.00,
  rendimento_mensal_estimado: 9400.00,
  investimentos_recentes: [
    {
      id: 'inv_001',
      data: 'Fevereiro/2026',
      titulo: 'Upgrade dos Ciclones e Queimador da Caldeira',
      valor: 85000.00,
      categoria: 'Eficiência Energética & Vapor',
      status: 'CONCLUIDO'
    },
    {
      id: 'inv_002',
      data: 'Março/2026',
      titulo: 'Ensacadeira Automática de Alta Precisão (25kg)',
      valor: 140000.00,
      categoria: 'Automação Fabril & Pesagem',
      status: 'EM_ANDAMENTO'
    },
    {
      id: 'inv_003',
      data: 'Previsão Maio/2026',
      titulo: 'Instalação de Sistema Fotovoltaico nos Telhados dos Galpões',
      valor: 310000.00,
      categoria: 'Energia Solar Renovável',
      status: 'PLANEJADO'
    }
  ]
};

// STORAGE HELPERS
const STORAGE_KEY_RECEBER = 'grupo_eno_financeiro_receber_v1';
const STORAGE_KEY_PAGAR = 'grupo_eno_financeiro_pagar_v1';
const STORAGE_KEY_DESPESAS = 'grupo_eno_financeiro_despesas_v1';
const STORAGE_KEY_RECEITAS_EXTRAS = 'grupo_eno_financeiro_receitas_v1';

export function carregarTitulosReceber(): TituloReceber[] {
  if (typeof window === 'undefined') return TITULOS_RECEBER_INICIAIS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECEBER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RECEBER, JSON.stringify(TITULOS_RECEBER_INICIAIS));
      return TITULOS_RECEBER_INICIAIS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return TITULOS_RECEBER_INICIAIS;
  }
}

export function salvarTitulosReceber(dados: TituloReceber[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_RECEBER, JSON.stringify(dados));
  window.dispatchEvent(new Event('financeiro_updated'));
}

export function carregarTitulosPagar(): TituloPagar[] {
  if (typeof window === 'undefined') return TITULOS_PAGAR_INICIAIS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PAGAR);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PAGAR, JSON.stringify(TITULOS_PAGAR_INICIAIS));
      return TITULOS_PAGAR_INICIAIS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return TITULOS_PAGAR_INICIAIS;
  }
}

export function salvarTitulosPagar(dados: TituloPagar[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_PAGAR, JSON.stringify(dados));
  window.dispatchEvent(new Event('financeiro_updated'));
}

export function carregarDespesas(): DespesaOperacional[] {
  if (typeof window === 'undefined') return DESPESAS_OPERACIONAIS_INICIAIS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DESPESAS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_DESPESAS, JSON.stringify(DESPESAS_OPERACIONAIS_INICIAIS));
      return DESPESAS_OPERACIONAIS_INICIAIS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DESPESAS_OPERACIONAIS_INICIAIS;
  }
}

export function salvarDespesas(dados: DespesaOperacional[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_DESPESAS, JSON.stringify(dados));
  window.dispatchEvent(new Event('financeiro_updated'));
}

export function carregarReceitasExtras(): LancamentoReceita[] {
  if (typeof window === 'undefined') return RECEITAS_EXTRAS_INICIAIS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECEITAS_EXTRAS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RECEITAS_EXTRAS, JSON.stringify(RECEITAS_EXTRAS_INICIAIS));
      return RECEITAS_EXTRAS_INICIAIS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return RECEITAS_EXTRAS_INICIAIS;
  }
}

export function salvarReceitasExtras(dados: LancamentoReceita[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_RECEITAS_EXTRAS, JSON.stringify(dados));
  window.dispatchEvent(new Event('financeiro_updated'));
}

const STORAGE_KEY_NOTAS_SAIDA = 'grupo_eno_financeiro_notas_saida_v1';
const STORAGE_KEY_NOTAS_ENTRADA = 'grupo_eno_financeiro_notas_entrada_v1';
const STORAGE_KEY_CAIXA_INVEST = 'grupo_eno_financeiro_caixa_invest_v1';

export function carregarNotasSaida(): NotaFiscalSaida[] {
  if (typeof window === 'undefined') return NOTAS_SAIDA_INICIAIS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTAS_SAIDA);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_NOTAS_SAIDA, JSON.stringify(NOTAS_SAIDA_INICIAIS));
      return NOTAS_SAIDA_INICIAIS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return NOTAS_SAIDA_INICIAIS;
  }
}

export function salvarNotasSaida(dados: NotaFiscalSaida[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_NOTAS_SAIDA, JSON.stringify(dados));
  window.dispatchEvent(new Event('financeiro_updated'));
}

export function carregarNotasEntrada(): NotaFiscalEntrada[] {
  if (typeof window === 'undefined') return NOTAS_ENTRADA_INICIAIS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTAS_ENTRADA);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_NOTAS_ENTRADA, JSON.stringify(NOTAS_ENTRADA_INICIAIS));
      return NOTAS_ENTRADA_INICIAIS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return NOTAS_ENTRADA_INICIAIS;
  }
}

export function salvarNotasEntrada(dados: NotaFiscalEntrada[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_NOTAS_ENTRADA, JSON.stringify(dados));
  window.dispatchEvent(new Event('financeiro_updated'));
}

export function carregarCaixaInvestimento(): CaixaInvestimento {
  if (typeof window === 'undefined') return CAIXA_INVESTIMENTO_INICIAL;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CAIXA_INVEST);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CAIXA_INVEST, JSON.stringify(CAIXA_INVESTIMENTO_INICIAL));
      return CAIXA_INVESTIMENTO_INICIAL;
    }
    return JSON.parse(raw);
  } catch (e) {
    return CAIXA_INVESTIMENTO_INICIAL;
  }
}

export function salvarCaixaInvestimento(dados: CaixaInvestimento): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_CAIXA_INVEST, JSON.stringify(dados));
  window.dispatchEvent(new Event('financeiro_updated'));
}

