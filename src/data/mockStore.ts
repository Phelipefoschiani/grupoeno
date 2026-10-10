// Store compartilhado para sincronização entre Cadastros e Pedidos de Compra

export type StatusPedidoCompra = 'A Confirmar' | 'Confirmado' | 'Programado' | 'Orçamento' | 'Entregue (A Pagar)' | 'Pago';

export type CategoriaCompra = 
  | 'Mandioca / Matéria-Prima'
  | 'Mercado / Cozinha / Copa'
  | 'Embalagens'
  | 'Manutenção & Peças'
  | 'Combustível & Lubrificantes'
  | 'Químicos & Laboratório'
  | 'Insumos Agrícolas'
  | 'Limpeza & Escritório'
  | 'Outros';

export interface PedidoCompraGeral {
  id: string;
  data: string;
  tipo_parceiro: 'AGRICULTOR' | 'FORNECEDOR';
  // Agricultor (quando aplicável)
  agricultor_id?: string;
  agricultor_nome?: string;
  agricultor_propriedade?: string;
  agricultor_cpf_cnpj?: string;
  agricultor_ie?: string;
  agricultor_cidade_uf?: string;
  agricultor_chave_pix?: string;
  // Fornecedor (quando aplicável)
  fornecedor_id?: string;
  fornecedor_nome?: string;
  fornecedor_fantasia?: string;
  fornecedor_cnpj?: string;
  fornecedor_ie?: string;
  fornecedor_cidade_uf?: string;
  fornecedor_chave_pix?: string;
  fornecedor_telefone?: string;
  // Solicitante e Local de Compra
  comprador_nome?: string;
  local_compra?: string;
  // Detalhes da Compra
  item_descricao: string;
  categoria: CategoriaCompra;
  quantidade: number;
  unidade_medida: 'KG' | 'Sacos' | 'Litros' | 'Unidades' | 'Caixas' | 'Toneladas' | 'Pacotes' | 'Fardos';
  valor_unitario: number;
  valor_total: number;
  // Refugo de mandioca (apenas quando for mandioca)
  residuo_destopo_casca_kg?: number;
  // Status e Pagamento
  status_pedido: StatusPedidoCompra;
  forma_pagamento: 'PIX' | 'Boleto Bancário' | 'Transferência TED' | 'À Vista Dinheiro' | 'Cartão Corporativo';
  data_pagamento?: string;
  observacoes?: string;
}

export interface Agricultor {
  id: string;
  empresa_id: string;
  tipo_pessoa: 'PF' | 'PJ';
  nome_completo: string;
  nome_propriedade: string;
  cpf_cnpj: string;
  ie_rural: string;
  telefone: string;
  email?: string;
  endereco: {
    estrada_linha: string;
    comunidade_bairro: string;
    municipio: string;
    uf: string;
    cep: string;
    ponto_referencia?: string;
  };
  area_hectares?: number;
  capacidade_estimada_safra_ton?: number;
  chave_pix: string;
  tipo_chave_pix: 'CPF' | 'CNPJ' | 'Celular' | 'E-mail' | 'Aleatória';
  titular_pix?: string;
  banco_nome?: string;
  agencia?: string;
  conta?: string;
  observacoes_financeiras?: string;
  ativo: boolean;
  criado_em: string;
}

export interface Fornecedor {
  id: string;
  empresa_id: string;
  tipo_pessoa: 'PF' | 'PJ';
  razao_nome: string;
  fantasia?: string;
  cpf_cnpj: string;
  ie_rg?: string;
  email: string;
  telefone: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    bairro: string;
    municipio: string;
    uf: string;
    complemento?: string;
  };
  forma_pagamento_nome?: string;
  chave_pix?: string;
  ativo: boolean;
  criado_em: string;
}

export const AGRICULTORES_CADASTRADOS: Agricultor[] = [
  {
    id: 'agr_001',
    empresa_id: 'emp_grupo_eno',
    tipo_pessoa: 'PF',
    nome_completo: 'Sebastião Moreira dos Santos',
    nome_propriedade: 'Sítio São José',
    cpf_cnpj: '241.882.909-44',
    ie_rural: 'PR-904.312.11-0',
    telefone: '(43) 99654-2211',
    email: 'sebastiao.moreira.agro@gmail.com',
    endereco: {
      estrada_linha: 'Estrada Municipal da Água Doce, Km 6',
      comunidade_bairro: 'Bairro Água Doce',
      municipio: 'Jacarezinho',
      uf: 'PR',
      cep: '86400-000',
      ponto_referencia: 'Próximo à Capela São José'
    },
    area_hectares: 24,
    capacidade_estimada_safra_ton: 480,
    chave_pix: '241.882.909-44',
    tipo_chave_pix: 'CPF',
    titular_pix: 'Sebastião Moreira dos Santos',
    banco_nome: 'Banco do Brasil',
    agencia: '0158-9',
    conta: '14.520-X',
    observacoes_financeiras: 'Pagamento de safra via PIX na pesagem',
    ativo: true,
    criado_em: '2026-01-10T08:00:00Z',
  },
  {
    id: 'agr_002',
    empresa_id: 'emp_grupo_eno',
    tipo_pessoa: 'PF',
    nome_completo: 'Antônio Carlos de Oliveira',
    nome_propriedade: 'Fazenda Santa Helena',
    cpf_cnpj: '315.774.208-15',
    ie_rural: 'PR-842.119.50-2',
    telefone: '(43) 99877-3344',
    email: 'antoniocarlos.helena@hotmail.com',
    endereco: {
      estrada_linha: 'Rodovia PR-431, Km 12',
      comunidade_bairro: 'Barra Grande',
      municipio: 'Ribeirão Claro',
      uf: 'PR',
      cep: '86410-000',
      ponto_referencia: 'Entrada após o silo de grãos'
    },
    area_hectares: 58,
    capacidade_estimada_safra_ton: 1100,
    chave_pix: '43998773344',
    tipo_chave_pix: 'Celular',
    titular_pix: 'Antônio Carlos de Oliveira',
    banco_nome: 'Sicredi Agro',
    agencia: '0718',
    conta: '55.431-2',
    observacoes_financeiras: 'PIX celular com confirmação imediata',
    ativo: true,
    criado_em: '2026-01-18T10:30:00Z',
  },
  {
    id: 'agr_003',
    empresa_id: 'emp_grupo_eno',
    tipo_pessoa: 'PJ',
    nome_completo: 'Agropecuária & Mandioca Terra Viva Ltda',
    nome_propriedade: 'Fazenda Terra Viva',
    cpf_cnpj: '18.442.890/0001-62',
    ie_rural: 'SP-458.910.334',
    telefone: '(19) 3862-9900',
    email: 'financeiro@terravivaagro.com.br',
    endereco: {
      estrada_linha: 'Estrada Velha de Mogi, Gleba 4',
      comunidade_bairro: 'Zona Rural Sul',
      municipio: 'Mogi Mirim',
      uf: 'SP',
      cep: '13800-970',
      ponto_referencia: 'Em frente ao entreposto da cooperativa'
    },
    area_hectares: 120,
    capacidade_estimada_safra_ton: 2600,
    chave_pix: '18.442.890/0001-62',
    tipo_chave_pix: 'CNPJ',
    titular_pix: 'Agropecuária & Mandioca Terra Viva Ltda',
    banco_nome: 'Bradesco',
    agencia: '2104',
    conta: '0018542-9',
    observacoes_financeiras: 'PIX corporativo CNPJ',
    ativo: true,
    criado_em: '2026-02-05T14:15:00Z',
  },
  {
    id: 'agr_004',
    empresa_id: 'emp_grupo_eno',
    tipo_pessoa: 'PF',
    nome_completo: 'Benedito Ramos da Silva',
    nome_propriedade: 'Chácara Bela Vista',
    cpf_cnpj: '109.845.228-70',
    ie_rural: 'PR-775.402.19-8',
    telefone: '(43) 99120-8855',
    email: 'benedito.ramos.rural@gmail.com',
    endereco: {
      estrada_linha: 'Estrada do Bairro dos Macacos, Lote 14',
      comunidade_bairro: 'Bairro dos Macacos',
      municipio: 'Carlópolis',
      uf: 'PR',
      cep: '86420-000',
      ponto_referencia: 'Segunda porteira à direita da ponte'
    },
    area_hectares: 18,
    capacidade_estimada_safra_ton: 360,
    chave_pix: 'benedito.ramos.rural@gmail.com',
    tipo_chave_pix: 'E-mail',
    titular_pix: 'Benedito Ramos da Silva',
    banco_nome: 'Sicoob',
    agencia: '4350',
    conta: '19.880-1',
    observacoes_financeiras: 'PIX e-mail após pesagem',
    ativo: true,
    criado_em: '2026-02-20T11:40:00Z',
  }
];

export const FORNECEDORES_CADASTRADOS: Fornecedor[] = [
  {
    id: 'forn_001',
    empresa_id: 'emp_grupo_eno',
    tipo_pessoa: 'PJ',
    razao_nome: 'Embalagens e Plásticos Paulínia Ltda',
    fantasia: 'Paulínia Embalagens',
    cpf_cnpj: '03.882.110/0001-92',
    ie_rg: '524.119.340.118',
    email: 'vendas@pauliniaembalagens.com.br',
    telefone: '(19) 3874-5000',
    endereco: {
      cep: '13140-000',
      logradouro: 'Av. José Paulino',
      numero: '2400',
      bairro: 'Distrito Industrial',
      municipio: 'Paulínia',
      uf: 'SP',
      complemento: 'Bloco A'
    },
    forma_pagamento_nome: 'Boleto Bancário',
    chave_pix: 'contato@pauliniaembalagens.com.br',
    ativo: true,
    criado_em: '2026-01-10T08:00:00Z',
  },
  {
    id: 'forn_002',
    empresa_id: 'emp_grupo_eno',
    tipo_pessoa: 'PJ',
    razao_nome: 'Distribuidora de Combustíveis Pioneiro Ltda',
    fantasia: 'Posto & Diesel Pioneiro',
    cpf_cnpj: '82.991.204/0001-10',
    ie_rg: '903.114.770-19',
    email: 'comercial@diesel-pioneiro.com.br',
    telefone: '(43) 3522-8000',
    endereco: {
      cep: '86400-000',
      logradouro: 'Rodovia BR-153',
      numero: 'Km 28',
      bairro: 'Industrial',
      municipio: 'Jacarezinho',
      uf: 'PR',
    },
    forma_pagamento_nome: 'Boleto Bancário',
    chave_pix: '82.991.204/0001-10',
    ativo: true,
    criado_em: '2026-01-15T09:00:00Z',
  },
  {
    id: 'forn_003',
    empresa_id: 'emp_grupo_eno',
    tipo_pessoa: 'PJ',
    razao_nome: 'Supermercado & Atacado Central Norte PR Ltda',
    fantasia: 'Atacado Central (Mercado & Copa)',
    cpf_cnpj: '14.552.190/0001-88',
    ie_rg: '901.884.220-45',
    email: 'faturamento@atacadocentralpr.com.br',
    telefone: '(43) 3511-4400',
    endereco: {
      cep: '86400-000',
      logradouro: 'Rua Paraná',
      numero: '1150',
      bairro: 'Centro',
      municipio: 'Jacarezinho',
      uf: 'PR',
    },
    forma_pagamento_nome: 'Boleto Bancário',
    chave_pix: '14.552.190/0001-88',
    ativo: true,
    criado_em: '2026-01-20T11:00:00Z',
  },
  {
    id: 'forn_004',
    empresa_id: 'emp_grupo_eno',
    tipo_pessoa: 'PJ',
    razao_nome: 'Norte Peças & Rolamentos Industriais Ltda',
    fantasia: 'Norte Peças e Manutenção',
    cpf_cnpj: '04.887.112/0001-44',
    ie_rg: '906.441.980-33',
    email: 'vendas@nortepecasagro.com.br',
    telefone: '(43) 3534-1900',
    endereco: {
      cep: '86430-000',
      logradouro: 'Av. Brasil',
      numero: '450',
      bairro: 'Vila Nova',
      municipio: 'Santo Antônio da Platina',
      uf: 'PR',
    },
    forma_pagamento_nome: 'Pix',
    chave_pix: 'vendas@nortepecasagro.com.br',
    ativo: true,
    criado_em: '2026-02-01T14:00:00Z',
  },
  {
    id: 'forn_005',
    empresa_id: 'emp_grupo_eno',
    tipo_pessoa: 'PJ',
    razao_nome: 'Química Industrial Bandeirantes Ltda',
    fantasia: 'Bandeirantes Químicos',
    cpf_cnpj: '45.190.432/0001-18',
    ie_rg: '634.881.002.341',
    email: 'pedidos@bandeirantesquimica.com.br',
    telefone: '(11) 4022-9911',
    endereco: {
      cep: '13300-000',
      logradouro: 'Rua Floriano Peixoto',
      numero: '890',
      bairro: 'Industrial',
      municipio: 'Itu',
      uf: 'SP',
    },
    forma_pagamento_nome: 'Pix',
    chave_pix: 'financeiro@bandeirantesquimica.com.br',
    ativo: true,
    criado_em: '2026-02-05T14:15:00Z',
  }
];

export const PEDIDOS_COMPRA_INICIAIS: PedidoCompraGeral[] = [
  // 1. Mandioca - Sebastião Moreira
  {
    id: 'ped_001',
    data: '12/03/2026',
    tipo_parceiro: 'AGRICULTOR',
    agricultor_id: 'agr_001',
    agricultor_nome: 'Sebastião Moreira dos Santos',
    agricultor_propriedade: 'Sítio São José',
    agricultor_cpf_cnpj: '241.882.909-44',
    agricultor_ie: 'PR-904.312.11-0',
    agricultor_cidade_uf: 'Jacarezinho/PR',
    agricultor_chave_pix: '241.882.909-44 (CPF)',
    item_descricao: 'Mandioca Industrial (Raiz In Natura)',
    categoria: 'Mandioca / Matéria-Prima',
    quantidade: 24500,
    unidade_medida: 'KG',
    valor_unitario: 0.60,
    valor_total: 14700.00,
    residuo_destopo_casca_kg: 2100,
    status_pedido: 'Pago',
    forma_pagamento: 'PIX',
    data_pagamento: '12/03/2026 15:42',
    observacoes: 'Carga de excelente teor de amido. Descarga realizada no lavador principal.'
  },
  // 2. Mercado / Cozinha do Refeitório dos Funcionários
  {
    id: 'ped_002',
    data: '11/03/2026',
    tipo_parceiro: 'FORNECEDOR',
    fornecedor_id: 'forn_003',
    fornecedor_nome: 'Supermercado & Atacado Central Norte PR Ltda',
    fornecedor_fantasia: 'Atacado Central (Mercado & Copa)',
    fornecedor_cnpj: '14.552.190/0001-88',
    fornecedor_ie: '901.884.220-45',
    fornecedor_cidade_uf: 'Jacarezinho/PR',
    fornecedor_chave_pix: '14.552.190/0001-88 (CNPJ)',
    fornecedor_telefone: '(43) 3511-4400',
    item_descricao: 'Café Superior a Vácuo 500g, Açúcar Cristal 5kg, Leite Integral e Itens da Copa/Cozinha da Fábrica',
    categoria: 'Mercado / Cozinha / Copa',
    quantidade: 1,
    unidade_medida: 'Fardos',
    valor_unitario: 3450.00,
    valor_total: 3450.00,
    status_pedido: 'Entregue (A Pagar)',
    forma_pagamento: 'Boleto Bancário',
    observacoes: 'Suprimentos quinzenais da cozinha e refeitório da indústria.'
  },
  // 3. Embalagens de Sacaria 50kg
  {
    id: 'ped_003',
    data: '10/03/2026',
    tipo_parceiro: 'FORNECEDOR',
    fornecedor_id: 'forn_001',
    fornecedor_nome: 'Embalagens e Plásticos Paulínia Ltda',
    fornecedor_fantasia: 'Paulínia Embalagens',
    fornecedor_cnpj: '03.882.110/0001-92',
    fornecedor_ie: '524.119.340.118',
    fornecedor_cidade_uf: 'Paulínia/SP',
    fornecedor_chave_pix: 'contato@pauliniaembalagens.com.br',
    fornecedor_telefone: '(19) 3874-5000',
    item_descricao: 'Sacaria de Ráfia Valvulada 50kg Personalizada Grupo ENO',
    categoria: 'Embalagens',
    quantidade: 5000,
    unidade_medida: 'Unidades',
    valor_unitario: 2.85,
    valor_total: 14250.00,
    status_pedido: 'Pago',
    forma_pagamento: 'Boleto Bancário',
    data_pagamento: '10/03/2026 11:30',
    observacoes: 'Lote padrão alimentício com logotipo Grupo ENO impresso.'
  },
  // 4. Mandioca - Antônio Carlos
  {
    id: 'ped_004',
    data: '09/03/2026',
    tipo_parceiro: 'AGRICULTOR',
    agricultor_id: 'agr_002',
    agricultor_nome: 'Antônio Carlos de Oliveira',
    agricultor_propriedade: 'Fazenda Santa Helena',
    agricultor_cpf_cnpj: '315.774.208-15',
    agricultor_ie: 'PR-842.119.50-2',
    agricultor_cidade_uf: 'Ribeirão Claro/PR',
    agricultor_chave_pix: '43998773344 (Celular)',
    item_descricao: 'Mandioca Industrial (Raiz In Natura)',
    categoria: 'Mandioca / Matéria-Prima',
    quantidade: 32000,
    unidade_medida: 'KG',
    valor_unitario: 0.60,
    valor_total: 19200.00,
    residuo_destopo_casca_kg: 2900,
    status_pedido: 'Entregue (A Pagar)',
    forma_pagamento: 'PIX',
    observacoes: 'Carga aguardando aprovação final da pesagem para liberação do PIX.'
  },
  // 5. Óleo Diesel para Caldeira e Frota
  {
    id: 'ped_005',
    data: '08/03/2026',
    tipo_parceiro: 'FORNECEDOR',
    fornecedor_id: 'forn_002',
    fornecedor_nome: 'Distribuidora de Combustíveis Pioneiro Ltda',
    fornecedor_fantasia: 'Posto & Diesel Pioneiro',
    fornecedor_cnpj: '82.991.204/0001-10',
    fornecedor_ie: '903.114.770-19',
    fornecedor_cidade_uf: 'Jacarezinho/PR',
    fornecedor_chave_pix: '82.991.204/0001-10',
    fornecedor_telefone: '(43) 3522-8000',
    item_descricao: 'Óleo Diesel S10 para Caldeira Industrial e Caminhões',
    categoria: 'Combustível & Lubrificantes',
    quantidade: 3000,
    unidade_medida: 'Litros',
    valor_unitario: 5.92,
    valor_total: 17760.00,
    status_pedido: 'Pago',
    forma_pagamento: 'Boleto Bancário',
    data_pagamento: '08/03/2026 09:15',
    observacoes: 'Abastecimento direto no tanque estacionário da fábrica.'
  },
  // 6. Peças e Manutenção Industrial
  {
    id: 'ped_006',
    data: '06/03/2026',
    tipo_parceiro: 'FORNECEDOR',
    fornecedor_id: 'forn_004',
    fornecedor_nome: 'Norte Peças & Rolamentos Industriais Ltda',
    fornecedor_fantasia: 'Norte Peças e Manutenção',
    fornecedor_cnpj: '04.887.112/0001-44',
    fornecedor_ie: '906.441.980-33',
    fornecedor_cidade_uf: 'Santo Antônio da Platina/PR',
    fornecedor_chave_pix: 'vendas@nortepecasagro.com.br',
    fornecedor_telefone: '(43) 3534-1900',
    item_descricao: 'Rolamentos Blindados, Mancais e Correias Dentadas para Linha de Ralação',
    categoria: 'Manutenção & Peças',
    quantidade: 12,
    unidade_medida: 'Unidades',
    valor_unitario: 280.00,
    valor_total: 3360.00,
    status_pedido: 'Programado',
    forma_pagamento: 'PIX',
    observacoes: 'Entrega programada para a parada técnica de sábado.'
  },
  // 7. Orçamento de Químicos para Amido
  {
    id: 'ped_007',
    data: '05/03/2026',
    tipo_parceiro: 'FORNECEDOR',
    fornecedor_id: 'forn_005',
    fornecedor_nome: 'Química Industrial Bandeirantes Ltda',
    fornecedor_fantasia: 'Bandeirantes Químicos',
    fornecedor_cnpj: '45.190.432/0001-18',
    fornecedor_ie: '634.881.002.341',
    fornecedor_cidade_uf: 'Itu/SP',
    fornecedor_chave_pix: 'financeiro@bandeirantesquimica.com.br',
    fornecedor_telefone: '(11) 4022-9911',
    item_descricao: 'Ácido Cítrico Grau Alimentício 25kg e Aditivos de Purificação',
    categoria: 'Químicos & Laboratório',
    quantidade: 20,
    unidade_medida: 'Sacos',
    valor_unitario: 320.00,
    valor_total: 6400.00,
    status_pedido: 'Orçamento',
    forma_pagamento: 'Boleto Bancário',
    observacoes: 'Cotação em análise pelo setor de qualidade.'
  }
];

const STORAGE_KEY_PEDIDOS_COMPRA = 'grupo_eno_pedidos_compra_v2';

export function carregarPedidosCompra(): PedidoCompraGeral[] {
  if (typeof window === 'undefined') return PEDIDOS_COMPRA_INICIAIS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PEDIDOS_COMPRA);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PEDIDOS_COMPRA, JSON.stringify(PEDIDOS_COMPRA_INICIAIS));
      return PEDIDOS_COMPRA_INICIAIS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return PEDIDOS_COMPRA_INICIAIS;
  }
}

export function salvarPedidosCompra(pedidos: PedidoCompraGeral[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_PEDIDOS_COMPRA, JSON.stringify(pedidos));
  window.dispatchEvent(new Event('pedidos_compra_updated'));
}

/**
 * Confirma o Pedido de Compra (sem alteração de produto ou valor)
 * Move para 'Confirmado' e gera automaticamente uma despesa no Financeiro:
 * - Mandioca -> 'Matéria-Prima Mandioca'
 * - Embalagens -> 'Embalagens'
 * - Insumos (Químicos, Aditivos, Insumos Agrícolas) -> 'Insumos'
 * - Outros (Mercado, Manutenção, Combustível, Limpeza, Outros) -> 'Outros'
 */
export function confirmarPedidoCompraELancarDespesa(pedidoId: string): { sucesso: boolean; mensagem: string; categoriaFinanceiro: string } {
  if (typeof window === 'undefined') return { sucesso: false, mensagem: 'Janela indisponível', categoriaFinanceiro: '' };

  const pedidos = carregarPedidosCompra();
  const index = pedidos.findIndex(p => p.id === pedidoId);
  if (index === -1) return { sucesso: false, mensagem: 'Pedido não encontrado', categoriaFinanceiro: '' };

  const pedido = pedidos[index];
  
  // 1. Determina a categoria financeira exata conforme regra do Grupo ENO
  let categoriaFinanceiro: 'Matéria-Prima Mandioca' | 'Insumos' | 'Embalagens' | 'Outros' = 'Outros';
  let setorFinanceiro: 'Fábrica & Moagem' | 'Secador & Caldeira' | 'Frotas & Logística' | 'Administrativo & TI' | 'Qualidade & Laboratório' = 'Fábrica & Moagem';

  const descLower = pedido.item_descricao.toLowerCase();
  const catOriginal = pedido.categoria;

  if (catOriginal === 'Mandioca / Matéria-Prima' || descLower.includes('mandioca') || descLower.includes('raiz')) {
    categoriaFinanceiro = 'Matéria-Prima Mandioca';
    setorFinanceiro = 'Fábrica & Moagem';
  } else if (catOriginal === 'Embalagens' || descLower.includes('saco') || descLower.includes('big bag') || descLower.includes('embalag')) {
    categoriaFinanceiro = 'Embalagens';
    setorFinanceiro = 'Fábrica & Moagem';
  } else if (
    catOriginal === 'Químicos & Laboratório' ||
    catOriginal === 'Insumos Agrícolas' ||
    descLower.includes('quimic') ||
    descLower.includes('ácido') ||
    descLower.includes('aditivo') ||
    descLower.includes('insumo')
  ) {
    categoriaFinanceiro = 'Insumos';
    setorFinanceiro = 'Qualidade & Laboratório';
  } else {
    categoriaFinanceiro = 'Outros';
    if (catOriginal === 'Combustível & Lubrificantes') setorFinanceiro = 'Frotas & Logística';
    else if (catOriginal === 'Mercado / Cozinha / Copa' || catOriginal === 'Limpeza & Escritório') setorFinanceiro = 'Administrativo & TI';
    else if (catOriginal === 'Manutenção & Peças') setorFinanceiro = 'Fábrica & Moagem';
    else setorFinanceiro = 'Administrativo & TI';
  }

  // 2. Atualiza o status do pedido de compra para Confirmado
  pedido.status_pedido = 'Confirmado';
  pedidos[index] = pedido;
  salvarPedidosCompra(pedidos);

  // 3. Lança a Despesa Operacional no Financeiro
  try {
    const rawDespesas = localStorage.getItem('grupo_eno_financeiro_despesas_v1');
    const despesas = rawDespesas ? JSON.parse(rawDespesas) : [];
    const parceiroNome = pedido.tipo_parceiro === 'AGRICULTOR' 
      ? (pedido.agricultor_nome || 'Produtor Rural') 
      : (pedido.fornecedor_nome || 'Fornecedor');

    const novaDespesa = {
      id: `desp_auto_pc_${pedido.id}_${Date.now()}`,
      data: pedido.data || new Date().toLocaleDateString('pt-BR'),
      categoria: categoriaFinanceiro,
      descricao: `[Pedido de Compra Confirmado] ${pedido.item_descricao} - Fornecido por: ${parceiroNome}`,
      valor: pedido.valor_total,
      setor: setorFinanceiro,
      responsavel: 'Gestão de Suprimentos / Fecularia',
      forma_pagamento: pedido.forma_pagamento || 'PIX',
      comprovante_anexo: true
    };

    despesas.unshift(novaDespesa);
    localStorage.setItem('grupo_eno_financeiro_despesas_v1', JSON.stringify(despesas));

    // 4. Lança também no Contas a Pagar do Financeiro
    const rawPagar = localStorage.getItem('grupo_eno_financeiro_pagar_v1');
    const titulosPagar = rawPagar ? JSON.parse(rawPagar) : [];
    const novoTituloPagar = {
      id: `pag_auto_pc_${pedido.id}_${Date.now()}`,
      pedido_compra_id: pedido.id,
      numero_documento: `PC-${pedido.id.toUpperCase()}`,
      favorecido_nome: parceiroNome,
      tipo_favorecido: pedido.tipo_parceiro === 'AGRICULTOR' ? 'Agricultor' : 'Fornecedor',
      categoria: categoriaFinanceiro === 'Matéria-Prima Mandioca' ? 'Mandioca / Matéria-Prima' : categoriaFinanceiro === 'Embalagens' ? 'Embalagens' : 'Mandioca / Matéria-Prima',
      valor: pedido.valor_total,
      data_emissao: pedido.data || new Date().toLocaleDateString('pt-BR'),
      data_vencimento: new Date(Date.now() + 7 * 86400000).toLocaleDateString('pt-BR'),
      status: 'A_PAGAR',
      forma_pagamento: pedido.forma_pagamento || 'PIX',
      chave_pix: pedido.agricultor_chave_pix || pedido.fornecedor_chave_pix,
      observacoes: `Origem: Pedido de compra confirmado (${pedido.item_descricao} - Qtd: ${pedido.quantidade} ${pedido.unidade_medida})`
    };

    titulosPagar.unshift(novoTituloPagar);
    localStorage.setItem('grupo_eno_financeiro_pagar_v1', JSON.stringify(titulosPagar));

    // Notifica o app de que o financeiro foi atualizado
    window.dispatchEvent(new Event('financeiro_updated'));
  } catch (err) {
    console.error('Erro ao integrar com financeiro:', err);
  }

  return {
    sucesso: true,
    mensagem: `Pedido de Compra confirmado com sucesso! Lançado automaticamente no Financeiro como "${categoriaFinanceiro}".`,
    categoriaFinanceiro
  };
}

