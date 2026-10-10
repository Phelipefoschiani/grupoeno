// Store e Definições de Pedidos de Venda do Grupo ENO
// Unifica o ciclo de vida comercial da fecularia:
// Orçamentos -> Em Produção -> A Faturar -> Faturados -> Entregues -> Relatórios

import { carregarEstoqueProdutos, ProdutoEstoque } from './produtosData';
import { integrarConclusaoProducao, integrarFaturamentoPedidoVenda } from './pipelineIntegrado';

export type EtapaPedidoVenda = 
  | 'ORCAMENTO' 
  | 'EM_PRODUCAO' 
  | 'A_FATURAR' 
  | 'FATURADO' 
  | 'ENTREGUE';

export interface ItemPedidoVenda {
  produto_id: string;
  produto_nome: string;
  tipo_embalagem: 'Saco 25kg' | 'Big Bag 1000kg' | 'Fardo 10x1kg' | 'Caixa' | 'Granel' | string;
  quantidade: number;
  quantidade_produzida?: number; // Qtd de embalagens (sacos/fardos) já finalizadas
  peso_unitario_kg: number;
  peso_total_kg: number;
  preco_unitario: number;
  subtotal: number;
  lote_producao?: string;
  unidades_por_fardo?: number; // Para conversão Fardo <-> Unitário
}

export interface ApontamentoProducao {
  id: string;
  data: string;
  produto_id?: string;
  produto_nome?: string;
  tipo_embalagem?: string;
  quantidade_produzida_embalagens?: number;
  quantidade_produzida_kg: number;
  operador: string;
  lote?: string;
  observacao?: string;
}

export interface PedidoVenda {
  id: string;
  numero_pedido: string;
  tipo: 'ORCAMENTO' | 'PEDIDO_VENDA';
  etapa: EtapaPedidoVenda;
  // Cliente vinculado
  cliente_id: string;
  cliente_nome: string;
  cliente_cnpj_cpf: string;
  cliente_cidade_uf: string;
  cliente_limite_credito?: number;
  cliente_status_credito?: 'Liberado' | 'Em Análise' | 'Bloqueado';
  // RCA vinculado
  rca_id: string;
  rca_nome: string;
  comissao_percentual: number;
  comissao_valor: number;
  // Datas
  data_emissao: string; // YYYY-MM-DD
  data_validade_orcamento?: string; // YYYY-MM-DD
  data_previsao_entrega: string; // YYYY-MM-DD
  data_inicio_producao?: string;
  data_conclusao_producao?: string;
  data_faturamento?: string;
  data_entrega_realizada?: string;
  // Produção Industrial e Lote
  lote_producao?: string;
  data_fabricacao?: string;
  data_vencimento?: string;
  apontamentos_producao?: ApontamentoProducao[];
  quantidade_produzida_acumulada_kg?: number;
  // Itens & Valores
  itens: ItemPedidoVenda[];
  peso_total_kg: number;
  valor_total: number;
  // Saldo a faturar vs faturado
  valor_faturado?: number;
  saldo_a_faturar?: number;
  // Condições Comerciais
  forma_pagamento: string;
  prazo_pagamento: string;
  tipo_frete: 'FOB (Retira na Fábrica)' | 'CIF (Entrega Grupo ENO)';
  transportadora?: string;
  placa_veiculo?: string;
  motorista_nome?: string;
  // Programação e Comprovante de Entrega
  programacao_entrega?: {
    data_programada: string;
    transportadora: string;
    motorista: string;
    telefone_motorista?: string;
    placa: string;
    status_rota: 'AGUARDANDO_COLETA' | 'EM_TRANSITO' | 'ENTREGUE';
    recebedor_nome?: string;
    recebedor_documento?: string;
    data_hora_entrega?: string;
  };
  // Dados Fiscais (Importação e Guarda de NF externa - sem conexão SEFAZ)
  nota_fiscal?: {
    numero: string;
    serie: string;
    chave_acesso: string;
    data_emissao: string;
    xml_importado?: boolean;
    nome_arquivo_xml?: string;
    arquivo_anexado?: string;
    tipo_arquivo?: 'XML' | 'PDF';
    valor_nota?: number;
    observacao_fiscal?: string;
    arquivo_conteudo?: string;
  };
  observacoes?: string;
  origem: 'Venda Direta' | 'RCA' | 'Portal Portfólio VIP' | 'Sugestão Reposição';
  subtipo_venda?: 'Orçamento' | 'Pedido Sugestivo' | 'Pedido';
  modo_exibicao_padrao?: 'FARDO' | 'UNITARIO';
}

export const PRODUTOS_VENDA_DISPONIVEIS = [
  {
    id: 'prod_mandioca_gourmet_1kg',
    nome: 'Mandioca Gourmet Palito Congelada (Pacote 1kg)',
    tipo_embalagem: 'Caixa' as const,
    peso_unitario_kg: 1,
    preco_unitario: 12.50, // R$ 12,50/unidade de 1kg
    unidades_por_fardo: 10, // Caixa c/ 10 pacotes
    categoria: 'Mandioca Gourmet'
  },
  {
    id: 'prod_fecula_doce_25kg',
    nome: 'Fécula de Mandioca Doce Padrão Industrial',
    tipo_embalagem: 'Saco 25kg' as const,
    peso_unitario_kg: 25,
    preco_unitario: 87.50, // R$ 3,50/kg
    unidades_por_fardo: 25, // 25 kg
    categoria: 'Féculas Nativas'
  },
  {
    id: 'prod_fecula_doce_bigbag',
    nome: 'Fécula de Mandioca Doce Padrão Industrial (Big Bag)',
    tipo_embalagem: 'Big Bag 1000kg' as const,
    peso_unitario_kg: 1000,
    preco_unitario: 3500.00, // R$ 3,50/kg
    unidades_por_fardo: 1000,
    categoria: 'Féculas Nativas'
  },
  {
    id: 'prod_fecula_modificada_25kg',
    nome: 'Fécula de Mandioca Modificada Grau Alimentício',
    tipo_embalagem: 'Saco 25kg' as const,
    peso_unitario_kg: 25,
    preco_unitario: 125.00, // R$ 5,00/kg
    unidades_por_fardo: 25,
    categoria: 'Féculas Especiais'
  },
  {
    id: 'prod_polvilho_azedo_25kg',
    nome: 'Polvilho Azedo Especial de Alta Expansão',
    tipo_embalagem: 'Saco 25kg' as const,
    peso_unitario_kg: 25,
    preco_unitario: 112.50, // R$ 4,50/kg
    unidades_por_fardo: 25,
    categoria: 'Polvilhos'
  },
  {
    id: 'prod_tapioca_fardo',
    nome: 'Goma de Tapioca Hidratada Gourmet (Fardo 10x1kg)',
    tipo_embalagem: 'Fardo 10x1kg' as const,
    peso_unitario_kg: 10,
    preco_unitario: 58.00, // R$ 5,80/unidade de 1kg
    unidades_por_fardo: 10, // 10 unidades de 1kg
    categoria: 'Tapiocas'
  },
  {
    id: 'prod_farinha_biju_25kg',
    nome: 'Farinha de Mandioca Torrada Especial Biju',
    tipo_embalagem: 'Saco 25kg' as const,
    peso_unitario_kg: 25,
    preco_unitario: 97.50, // R$ 3,90/kg
    unidades_por_fardo: 25,
    categoria: 'Farinhas'
  },
  {
    id: 'prod_tapioca_caixa_display',
    nome: 'Goma de Tapioca Pronta (Caixa Display 12x1kg)',
    tipo_embalagem: 'Caixa' as const,
    peso_unitario_kg: 12,
    preco_unitario: 72.00,
    unidades_por_fardo: 12, // 12 unidades de 1kg
    categoria: 'Tapiocas'
  },
  {
    id: 'prod_farinha_caixa_varejo',
    nome: 'Farinha de Mandioca Torrada (Caixa 24x500g)',
    tipo_embalagem: 'Caixa' as const,
    peso_unitario_kg: 12,
    preco_unitario: 84.00,
    unidades_por_fardo: 24, // 24 pacotes de 500g
    categoria: 'Farinhas'
  }
];

// Carrega os produtos de venda dinamicamente a partir do estoque e custos configurados
export function obterProdutosVendaDisponiveis() {
  if (typeof window !== 'undefined') {
    try {
      const produtosEstoque = carregarEstoqueProdutos();
      if (produtosEstoque && produtosEstoque.length > 0) {
        return produtosEstoque.map(p => {
          const emb = (p.tipo_acondicionamento === 'Caixa' ? 'Caixa' : p.tipo_acondicionamento === 'Fardo' ? 'Fardo 10x1kg' : p.tipo_embalagem) as any;
          const unidades = p.unidades_por_acondicionamento || (p.tipo_acondicionamento === 'Fardo' ? 10 : p.tipo_acondicionamento === 'Caixa' ? 10 : 1);
          // Preço do fardo ou caixa fechada:
          const precoAcond = p.preco_venda_acondicionamento || (p.preco_unitario_venda * unidades);
          
          return {
            id: p.id,
            nome: p.nome,
            codigo: p.codigo,
            tipo_embalagem: emb,
            peso_unitario_kg: p.peso_unitario_kg,
            preco_unitario: precoAcond, // Preço da embalagem de expedição (fardo/caixa/saco)
            preco_unitario_avulso: p.preco_unitario_venda, // Preço unitário do pacote individual
            unidades_por_fardo: unidades,
            tipo_acondicionamento: p.tipo_acondicionamento || 'Caixa',
            categoria: p.categoria,
            custo_total: p.custo_total
          };
        });
      }
    } catch (e) {
      // Fallback
    }
  }
  return PRODUTOS_VENDA_DISPONIVEIS;
}

export const CLIENTES_LOOKUP = [
  {
    id: 'cli_001',
    nome: 'Supermercados Alvorada Ltda',
    cnpj: '14.285.901/0001-44',
    cidade_uf: 'Mogi Guaçu/SP',
    limite_credito: 120000,
    status_credito: 'Liberado' as const,
    rca_id: 'rca_001',
    rca_nome: 'Marcos Vinicius Silveira',
    comissao: 2.5,
    prazo: 'Boleto Bancário 28 Dias'
  },
  {
    id: 'cli_002',
    nome: 'Distribuidora de Alimentos Vale Verde S.A.',
    cnpj: '08.774.321/0001-89',
    cidade_uf: 'Cotia/SP',
    limite_credito: 250000,
    status_credito: 'Liberado' as const,
    rca_id: 'rca_002',
    rca_nome: 'Aline de Cássia Nogueira',
    comissao: 2.5,
    prazo: '30 / 60 Dias (2x)'
  },
  {
    id: 'cli_003',
    nome: 'Panificadora & Confeitaria Estrela do Sul',
    cnpj: '22.841.902/0001-30',
    cidade_uf: 'Londrina/PR',
    limite_credito: 45000,
    status_credito: 'Liberado' as const,
    rca_id: 'rca_003',
    rca_nome: 'Ricardo Antunes Fagundes',
    comissao: 3.0,
    prazo: 'Boleto Bancário 21 Dias'
  },
  {
    id: 'cli_004',
    nome: 'Indústria de Biscoitos & Massas Paulista S.A.',
    cnpj: '51.902.441/0001-77',
    cidade_uf: 'Campinas/SP',
    limite_credito: 400000,
    status_credito: 'Liberado' as const,
    rca_id: 'rca_001',
    rca_nome: 'Marcos Vinicius Silveira',
    comissao: 2.0,
    prazo: 'Boleto Bancário 35 Dias'
  },
  {
    id: 'cli_005',
    nome: 'Atacadão de Cereais & Féculas Triângulo',
    cnpj: '02.418.990/0001-12',
    cidade_uf: 'Uberlândia/MG',
    limite_credito: 180000,
    status_credito: 'Em Análise' as const,
    rca_id: 'rca_003',
    rca_nome: 'Ricardo Antunes Fagundes',
    comissao: 2.5,
    prazo: 'Boleto Bancário 28 Dias'
  }
];

export const RCAS_LOOKUP = [
  { id: 'rca_001', nome: 'Marcos Vinicius Silveira', regiao: 'SP Interior / Campinas' },
  { id: 'rca_002', nome: 'Aline de Cássia Nogueira', regiao: 'Grande SP e Litoral' },
  { id: 'rca_003', nome: 'Ricardo Antunes Fagundes', regiao: 'Norte do Paraná / MG' },
  { id: 'rca_004', nome: 'Diretoria Comercial Grupo ENO', regiao: 'Contas Nacionais / Grandes Indústrias' }
];

export const PEDIDOS_VENDA_INICIAIS: PedidoVenda[] = [
  // 1. Orçamento / Sugestivo
  {
    id: 'ped_venda_001',
    numero_pedido: 'ORC-2026-1048',
    tipo: 'ORCAMENTO',
    etapa: 'ORCAMENTO',
    cliente_id: 'cli_001',
    cliente_nome: 'Supermercados Alvorada Ltda',
    cliente_cnpj_cpf: '14.285.901/0001-44',
    cliente_cidade_uf: 'Mogi Guaçu/SP',
    cliente_limite_credito: 120000,
    cliente_status_credito: 'Liberado',
    rca_id: 'rca_001',
    rca_nome: 'Marcos Vinicius Silveira',
    comissao_percentual: 2.5,
    comissao_valor: 1312.50,
    data_emissao: '2026-03-27',
    data_validade_orcamento: '2026-04-03',
    data_previsao_entrega: '2026-04-10',
    itens: [
      {
        produto_id: 'prod_fecula_doce_25kg',
        produto_nome: 'Fécula de Mandioca Doce Padrão Industrial',
        tipo_embalagem: 'Saco 25kg',
        quantidade: 400, // 400 sacos = 10.000 kg
        peso_unitario_kg: 25,
        peso_total_kg: 10000,
        preco_unitario: 87.50,
        subtotal: 35000.00,
        unidades_por_fardo: 25
      },
      {
        produto_id: 'prod_tapioca_fardo',
        produto_nome: 'Goma de Tapioca Hidratada Gourmet (Fardo 10x1kg)',
        tipo_embalagem: 'Fardo 10x1kg',
        quantidade: 300,
        peso_unitario_kg: 10,
        peso_total_kg: 3000,
        preco_unitario: 58.00,
        subtotal: 17400.00,
        unidades_por_fardo: 10
      }
    ],
    peso_total_kg: 13000,
    valor_total: 52400.00,
    forma_pagamento: 'Boleto Bancário',
    prazo_pagamento: '28 Dias',
    tipo_frete: 'CIF (Entrega Grupo ENO)',
    transportadora: 'Transportes Rodoviários Vale do Paranapanema',
    origem: 'RCA',
    subtipo_venda: 'Orçamento',
    modo_exibicao_padrao: 'FARDO',
    observacoes: 'Orçamento com tabela especial para rede de supermercados parceira.'
  },
  {
    id: 'ped_venda_002',
    numero_pedido: 'SUG-2026-1049',
    tipo: 'ORCAMENTO',
    etapa: 'ORCAMENTO',
    cliente_id: 'cli_003',
    cliente_nome: 'Panificadora & Confeitaria Estrela do Sul',
    cliente_cnpj_cpf: '22.841.902/0001-30',
    cliente_cidade_uf: 'Londrina/PR',
    cliente_limite_credito: 45000,
    cliente_status_credito: 'Liberado',
    rca_id: 'rca_003',
    rca_nome: 'Ricardo Antunes Fagundes',
    comissao_percentual: 3.0,
    comissao_valor: 675.00,
    data_emissao: '2026-03-28',
    data_validade_orcamento: '2026-04-05',
    data_previsao_entrega: '2026-04-08',
    itens: [
      {
        produto_id: 'prod_polvilho_azedo_25kg',
        produto_nome: 'Polvilho Azedo Especial de Alta Expansão',
        tipo_embalagem: 'Saco 25kg',
        quantidade: 200,
        peso_unitario_kg: 25,
        peso_total_kg: 5000,
        preco_unitario: 112.50,
        subtotal: 22500.00,
        unidades_por_fardo: 25
      }
    ],
    peso_total_kg: 5000,
    valor_total: 22500.00,
    forma_pagamento: 'Boleto Bancário',
    prazo_pagamento: '21 Dias',
    tipo_frete: 'FOB (Retira na Fábrica)',
    origem: 'Sugestão Reposição',
    subtipo_venda: 'Pedido Sugestivo',
    modo_exibicao_padrao: 'FARDO',
    observacoes: 'Sugestão automática gerada com base no consumo quinzenal de polvilho azedo.'
  },

  // 2. Em Produção
  {
    id: 'ped_venda_003',
    numero_pedido: 'PED-2026-1045',
    tipo: 'PEDIDO_VENDA',
    etapa: 'EM_PRODUCAO',
    cliente_id: 'cli_004',
    cliente_nome: 'Indústria de Biscoitos & Massas Paulista S.A.',
    cliente_cnpj_cpf: '51.902.441/0001-77',
    cliente_cidade_uf: 'Campinas/SP',
    cliente_limite_credito: 400000,
    cliente_status_credito: 'Liberado',
    rca_id: 'rca_001',
    rca_nome: 'Marcos Vinicius Silveira',
    comissao_percentual: 2.0,
    comissao_valor: 2450.00,
    data_emissao: '2026-03-24',
    data_inicio_producao: '2026-03-25',
    data_previsao_entrega: '2026-04-02',
    itens: [
      {
        produto_id: 'prod_fecula_doce_bigbag',
        produto_nome: 'Fécula de Mandioca Doce Padrão Industrial (Big Bag)',
        tipo_embalagem: 'Big Bag 1000kg',
        quantidade: 35, // 35 Big Bags = 35.000 kg
        peso_unitario_kg: 1000,
        peso_total_kg: 35000,
        preco_unitario: 3500.00,
        subtotal: 122500.00,
        lote_producao: 'LOTE-ENO-260324-A'
      }
    ],
    peso_total_kg: 35000,
    valor_total: 122500.00,
    forma_pagamento: 'Boleto Bancário',
    prazo_pagamento: '35 Dias',
    tipo_frete: 'CIF (Entrega Grupo ENO)',
    transportadora: 'TransGrãos Logística Cargas Pesadas',
    origem: 'Venda Direta',
    observacoes: 'Produção em lote dedicado. Amostras de retenção enviadas ao laboratório.'
  },
  {
    id: 'ped_venda_004',
    numero_pedido: 'PED-2026-1046',
    tipo: 'PEDIDO_VENDA',
    etapa: 'EM_PRODUCAO',
    cliente_id: 'cli_002',
    cliente_nome: 'Distribuidora de Alimentos Vale Verde S.A.',
    cliente_cnpj_cpf: '08.774.321/0001-89',
    cliente_cidade_uf: 'Cotia/SP',
    cliente_limite_credito: 250000,
    cliente_status_credito: 'Liberado',
    rca_id: 'rca_002',
    rca_nome: 'Aline de Cássia Nogueira',
    comissao_percentual: 2.5,
    comissao_valor: 1531.25,
    data_emissao: '2026-03-25',
    data_inicio_producao: '2026-03-26',
    data_previsao_entrega: '2026-04-03',
    itens: [
      {
        produto_id: 'prod_fecula_modificada_25kg',
        produto_nome: 'Fécula de Mandioca Modificada Grau Alimentício',
        tipo_embalagem: 'Saco 25kg',
        quantidade: 300,
        peso_unitario_kg: 25,
        peso_total_kg: 7500,
        preco_unitario: 125.00,
        subtotal: 37500.00,
        lote_producao: 'LOTE-MOD-260325'
      },
      {
        produto_id: 'prod_farinha_biju_25kg',
        produto_nome: 'Farinha de Mandioca Torrada Especial Biju',
        tipo_embalagem: 'Saco 25kg',
        quantidade: 244,
        peso_unitario_kg: 25,
        peso_total_kg: 6100,
        preco_unitario: 97.50,
        subtotal: 23790.00,
        lote_producao: 'LOTE-FAR-260325'
      }
    ],
    peso_total_kg: 13600,
    valor_total: 61290.00,
    forma_pagamento: 'Boleto Bancário',
    prazo_pagamento: '30 / 60 Dias (2x)',
    tipo_frete: 'CIF (Entrega Grupo ENO)',
    transportadora: 'Transportes Paulínia Cargas Fracionadas',
    origem: 'RCA',
    observacoes: 'Linha de ensaque finalizando a paletização com filme stretch protetor.'
  },

  // 3. A Faturar
  {
    id: 'ped_venda_005',
    numero_pedido: 'PED-2026-1043',
    tipo: 'PEDIDO_VENDA',
    etapa: 'A_FATURAR',
    cliente_id: 'cli_001',
    cliente_nome: 'Supermercados Alvorada Ltda',
    cliente_cnpj_cpf: '14.285.901/0001-44',
    cliente_cidade_uf: 'Mogi Guaçu/SP',
    cliente_limite_credito: 120000,
    cliente_status_credito: 'Liberado',
    rca_id: 'rca_001',
    rca_nome: 'Marcos Vinicius Silveira',
    comissao_percentual: 2.5,
    comissao_valor: 1750.00,
    data_emissao: '2026-03-22',
    data_conclusao_producao: '2026-03-27',
    data_previsao_entrega: '2026-03-31',
    itens: [
      {
        produto_id: 'prod_fecula_doce_25kg',
        produto_nome: 'Fécula de Mandioca Doce Padrão Industrial',
        tipo_embalagem: 'Saco 25kg',
        quantidade: 800, // 20.000 kg
        peso_unitario_kg: 25,
        peso_total_kg: 20000,
        preco_unitario: 87.50,
        subtotal: 70000.00,
        lote_producao: 'LOTE-ENO-260322-B'
      }
    ],
    peso_total_kg: 20000,
    valor_total: 70000.00,
    forma_pagamento: 'Boleto Bancário',
    prazo_pagamento: '28 Dias',
    tipo_frete: 'CIF (Entrega Grupo ENO)',
    transportadora: 'Expresso Alvorada Logística',
    placa_veiculo: 'AYZ-4G82',
    motorista_nome: 'Vanderlei Custódio',
    origem: 'RCA',
    observacoes: 'Carga pesada na balança rodoviária da portaria. Aguardando emissão da NF-e e GNRE.'
  },

  // 4. Faturados
  {
    id: 'ped_venda_006',
    numero_pedido: 'PED-2026-1040',
    tipo: 'PEDIDO_VENDA',
    etapa: 'FATURADO',
    cliente_id: 'cli_005',
    cliente_nome: 'Atacadão de Cereais & Féculas Triângulo',
    cliente_cnpj_cpf: '02.418.990/0001-12',
    cliente_cidade_uf: 'Uberlândia/MG',
    cliente_limite_credito: 180000,
    cliente_status_credito: 'Liberado',
    rca_id: 'rca_003',
    rca_nome: 'Ricardo Antunes Fagundes',
    comissao_percentual: 2.5,
    comissao_valor: 2625.00,
    data_emissao: '2026-03-18',
    data_faturamento: '2026-03-26',
    data_previsao_entrega: '2026-03-30',
    itens: [
      {
        produto_id: 'prod_fecula_doce_bigbag',
        produto_nome: 'Fécula de Mandioca Doce Padrão Industrial (Big Bag)',
        tipo_embalagem: 'Big Bag 1000kg',
        quantidade: 30,
        peso_unitario_kg: 1000,
        peso_total_kg: 30000,
        preco_unitario: 3500.00,
        subtotal: 105000.00,
        lote_producao: 'LOTE-ENO-260318-BB'
      }
    ],
    peso_total_kg: 30000,
    valor_total: 105000.00,
    forma_pagamento: 'Boleto Bancário',
    prazo_pagamento: '28 Dias',
    tipo_frete: 'FOB (Retira na Fábrica)',
    transportadora: 'Transportadora Triângulo Mineiro Ltda',
    placa_veiculo: 'NKL-9921',
    motorista_nome: 'Carlos Donizete Ramos',
    nota_fiscal: {
      numero: '004.891',
      serie: '1',
      chave_acesso: '41260308774321000189550010000048911048912340',
      data_emissao: '26/03/2026 14:15'
    },
    origem: 'RCA',
    observacoes: 'Caminhão carregado e lacrado. Danfe impresso acompanhando o Manifesto Eletrônico (MDF-e).'
  },

  // 5. Entregues
  {
    id: 'ped_venda_007',
    numero_pedido: 'PED-2026-1035',
    tipo: 'PEDIDO_VENDA',
    etapa: 'ENTREGUE',
    cliente_id: 'cli_004',
    cliente_nome: 'Indústria de Biscoitos & Massas Paulista S.A.',
    cliente_cnpj_cpf: '51.902.441/0001-77',
    cliente_cidade_uf: 'Campinas/SP',
    cliente_limite_credito: 400000,
    cliente_status_credito: 'Liberado',
    rca_id: 'rca_001',
    rca_nome: 'Marcos Vinicius Silveira',
    comissao_percentual: 2.0,
    comissao_valor: 2975.00,
    data_emissao: '2026-03-10',
    data_faturamento: '2026-03-15',
    data_previsao_entrega: '2026-03-18',
    data_entrega_realizada: '2026-03-18 10:45',
    itens: [
      {
        produto_id: 'prod_fecula_doce_bigbag',
        produto_nome: 'Fécula de Mandioca Doce Padrão Industrial (Big Bag)',
        tipo_embalagem: 'Big Bag 1000kg',
        quantidade: 42,
        peso_unitario_kg: 1000,
        peso_total_kg: 42000,
        preco_unitario: 3500.00,
        subtotal: 147000.00,
        lote_producao: 'LOTE-ENO-260310-IND'
      },
      {
        produto_id: 'prod_fecula_modificada_25kg',
        produto_nome: 'Fécula de Mandioca Modificada Grau Alimentício',
        tipo_embalagem: 'Saco 25kg',
        quantidade: 14,
        peso_unitario_kg: 25,
        peso_total_kg: 350,
        preco_unitario: 125.00,
        subtotal: 1750.00,
        lote_producao: 'LOTE-MOD-260310'
      }
    ],
    peso_total_kg: 42350,
    valor_total: 148750.00,
    forma_pagamento: 'Boleto Bancário',
    prazo_pagamento: '35 Dias',
    tipo_frete: 'CIF (Entrega Grupo ENO)',
    transportadora: 'TransGrãos Logística Cargas Pesadas',
    placa_veiculo: 'PRX-1842',
    motorista_nome: 'Gilberto Santana',
    nota_fiscal: {
      numero: '004.872',
      serie: '1',
      chave_acesso: '41260351902441000177550010000048721048721190',
      data_emissao: '15/03/2026 16:30'
    },
    origem: 'Venda Direta',
    observacoes: 'Recebimento conferido pelo setor de almoxarifado fabril. Canhoto assinado e arquivado.'
  },
  {
    id: 'ped_venda_008',
    numero_pedido: 'PED-2026-1031',
    tipo: 'PEDIDO_VENDA',
    etapa: 'ENTREGUE',
    cliente_id: 'cli_002',
    cliente_nome: 'Distribuidora de Alimentos Vale Verde S.A.',
    cliente_cnpj_cpf: '08.774.321/0001-89',
    cliente_cidade_uf: 'Cotia/SP',
    cliente_limite_credito: 250000,
    cliente_status_credito: 'Liberado',
    rca_id: 'rca_002',
    rca_nome: 'Aline de Cássia Nogueira',
    comissao_percentual: 2.5,
    comissao_valor: 1980.00,
    data_emissao: '2026-03-05',
    data_faturamento: '2026-03-11',
    data_previsao_entrega: '2026-03-14',
    data_entrega_realizada: '2026-03-14 15:20',
    itens: [
      {
        produto_id: 'prod_fecula_doce_25kg',
        produto_nome: 'Fécula de Mandioca Doce Padrão Industrial',
        tipo_embalagem: 'Saco 25kg',
        quantidade: 600,
        peso_unitario_kg: 25,
        peso_total_kg: 15000,
        preco_unitario: 87.50,
        subtotal: 52500.00,
        lote_producao: 'LOTE-ENO-260305'
      },
      {
        produto_id: 'prod_tapioca_fardo',
        produto_nome: 'Goma de Tapioca Hidratada Gourmet (Fardo 10x1kg)',
        tipo_embalagem: 'Fardo 10x1kg',
        quantidade: 460,
        peso_unitario_kg: 10,
        peso_total_kg: 4600,
        preco_unitario: 58.00,
        subtotal: 26680.00,
        lote_producao: 'LOTE-TAP-260305'
      }
    ],
    peso_total_kg: 19600,
    valor_total: 79180.00,
    forma_pagamento: 'Boleto Bancário',
    prazo_pagamento: '30 / 60 Dias (2x)',
    tipo_frete: 'CIF (Entrega Grupo ENO)',
    transportadora: 'Transportes Paulínia Cargas Fracionadas',
    placa_veiculo: 'BWE-3310',
    motorista_nome: 'Marcos Aurelio Prates',
    nota_fiscal: {
      numero: '004.855',
      serie: '1',
      chave_acesso: '41260308774321000189550010000048551048558832',
      data_emissao: '11/03/2026 09:40'
    },
    origem: 'RCA',
    observacoes: 'Primeira parcela do boleto liquidada com sucesso.'
  }
];

// Helper para persistência reativa no browser (localStorage)
const STORAGE_KEY = 'grupo_eno_pedidos_venda_v1';

export function carregarPedidosVenda(): PedidoVenda[] {
  if (typeof window === 'undefined') return PEDIDOS_VENDA_INICIAIS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(PEDIDOS_VENDA_INICIAIS));
      return PEDIDOS_VENDA_INICIAIS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erro ao ler pedidos do localStorage:', err);
    return PEDIDOS_VENDA_INICIAIS;
  }
}

export function salvarPedidosVenda(pedidos: PedidoVenda[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidos));
    // Dispara evento customizado para sincronizar abas e telas se estiverem montadas
    window.dispatchEvent(new Event('pedidos_venda_updated'));
  } catch (err) {
    console.error('Erro ao salvar pedidos no localStorage:', err);
  }
}

export function moverPedidoEtapa(
  pedidoId: string, 
  novaEtapa: EtapaPedidoVenda, 
  dadosExtras?: Partial<PedidoVenda>
): PedidoVenda[] {
  const atuais = carregarPedidosVenda();
  const dataHoje = new Date().toISOString().split('T')[0];

  const atualizados = atuais.map(p => {
    if (p.id === pedidoId) {
      const updated: PedidoVenda = {
        ...p,
        etapa: novaEtapa,
        ...dadosExtras
      };

      if (novaEtapa === 'EM_PRODUCAO') {
        updated.tipo = 'PEDIDO_VENDA';
        if (!updated.numero_pedido.startsWith('PED-')) {
          updated.numero_pedido = `PED-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        if (!updated.data_inicio_producao) updated.data_inicio_producao = dataHoje;
        // Inicializa quantidade_produzida em cada item se ainda não estiver definida
        updated.itens = updated.itens.map(it => ({
          ...it,
          quantidade_produzida: it.quantidade_produzida ?? 0
        }));
      } else if (novaEtapa === 'A_FATURAR') {
        if (!updated.data_conclusao_producao) updated.data_conclusao_producao = dataHoje;
        // Integração: baixa matérias-primas e alimenta estoque de produto acabado
        try {
          integrarConclusaoProducao(updated);
        } catch (e) {
          console.error('Erro na integração de produção:', e);
        }
      } else if (novaEtapa === 'FATURADO') {
        if (!updated.data_faturamento) updated.data_faturamento = dataHoje;
        if (!updated.nota_fiscal) {
          const numNf = Math.floor(4890 + Math.random() * 50);
          updated.nota_fiscal = {
            numero: `00${numNf}`,
            serie: '1',
            chave_acesso: `412603${p.cliente_cnpj_cpf.replace(/\D/g, '').padEnd(14, '0')}5500100000${numNf}10${numNf}9944`,
            data_emissao: `${dataHoje.split('-').reverse().join('/')} 10:30`
          };
        }
        // Integração: baixa estoque de produto vendido, gera Título a Receber e NF-e de Saída
        try {
          integrarFaturamentoPedidoVenda(updated);
        } catch (e) {
          console.error('Erro na integração de faturamento:', e);
        }
      } else if (novaEtapa === 'ENTREGUE') {
        if (!updated.data_entrega_realizada) {
          updated.data_entrega_realizada = `${dataHoje.split('-').reverse().join('/')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        }
      }

      return updated;
    }
    return p;
  });

  salvarPedidosVenda(atualizados);
  return atualizados;
}
