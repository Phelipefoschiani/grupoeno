// Módulo de Dados de Produtos, Formulações, Custos e Estoques do Grupo ENO

export interface ItemMateriaPrimaReceita {
  materia_prima_id: string;
  materia_prima_nome: string;
  quantidade: number; // Quanto usa nesta matéria-prima
  unidade_medida: string; // 'KG' | 'TON' | 'UN' | 'LITRO' | 'ESTÉREO (m³)'
  custo_unitario?: number;
  custo_total?: number;
}

export interface ReceitaIndustrial {
  id: string;
  codigo: string;
  nome: string; // Nome da receita (ex: "Mandioca Gourmet")
  produto_nome?: string;
  tipo_embalagem?: 'Saco 25kg' | 'Big Bag 1000kg' | 'Fardo 10x1kg' | 'Pacote 1kg' | 'Caixa' | 'Granel' | string;
  rendimento_pacotes: number; // Quantos pacotes rende a receita
  peso_por_pacote_kg?: number; // Peso líquido de cada pacote (ex: 1kg ou 25kg)
  rendimento_total_kg?: number; // Total produzido em kg
  materias_primas: ItemMateriaPrimaReceita[]; // Matérias-primas e quantidades selecionadas
  custo_total_materias_primas?: number;
  custo_por_pacote?: number;
  tempo_processamento_horas?: number;
  observacoes_tecnicas?: string;
  data_criacao?: string;
  // Parâmetros técnicos complementares
  rendimento_amido_percentual?: number;
  kg_mandioca_por_kg_produto?: number;
  agua_m3_por_ton?: number;
  perda_destopo_casca_percentual?: number;
  bagaço_umido_gerado_kg?: number;
  aditivos_permitidos?: string;
}

export interface ConfiguracaoCusto {
  id: string;
  produto_id: string;
  produto_nome: string;
  custo_materia_prima_kg: number; // baseada na cotação da raiz
  custo_energia_lenha_kg: number; // biomassa caldeira e eletricidade moagem
  custo_embalagem_unit: number; // saco 25kg ráfia ou liner big bag
  custo_mao_obra_kg: number;
  custo_operacional_fixo_kg: number;
  custo_total_producao_kg: number;
  margem_lucro_alvo_percentual: number;
  preco_sugerido_venda_kg: number;
  preco_sugerido_saco_25kg: number;
  ultima_atualizacao: string;
}

export interface ProdutoEstoque {
  id: string;
  codigo: string;
  nome: string;
  categoria: 'Féculas Nativas' | 'Féculas Especiais' | 'Polvilhos' | 'Tapiocas' | 'Farinhas' | 'Mandioca Gourmet' | string;
  tipo_embalagem: 'Saco 25kg' | 'Big Bag 1000kg' | 'Fardo 10x1kg' | 'Pacote 1kg' | 'Caixa' | string;
  peso_unitario_kg: number;
  estoque_atual_sacos: number;
  estoque_atual_kg: number;
  estoque_minimo_kg: number;
  localizacao_galpao: string;
  preco_unitario_venda: number;
  lote_recente: string;
  status: 'EM_ESTOQUE' | 'ESTOQUE_BAIXO' | 'CRITICO';
  // Vínculo com a Receita e Custos:
  receita_id?: string;
  receita_nome?: string;
  custo_materia_prima?: number; // Custo dos insumos vindo direto da receita
  impostos_percentual?: number; // % Impostos (ex: 8%)
  impostos_valor?: number; // R$ Impostos
  custo_operacional?: number; // Outros custos operacionais (mão de obra, energia)
  custo_total?: number; // Custo Total = Insumos + Impostos + Operacional
  tipo_acondicionamento?: 'Fardo' | 'Caixa' | 'Saco' | 'Avulso' | string; // se é Fardo ou Caixa
  unidades_por_acondicionamento?: number; // quantos que vai (ex: 10 ou 12)
  preco_venda_acondicionamento?: number; // Preço do fardo ou caixa fechada
  margem_lucro_percentual?: number; // Margem bruta (%)
}

export interface MateriaPrimaEstoque {
  id: string;
  codigo: string;
  nome: string;
  categoria: 'Raiz In Natura' | 'Biomassa / Lenha' | 'Embalagens' | 'Insumos Industriais';
  unidade_medida: 'KG' | 'TON' | 'ESTÉREO (m³)' | 'UN' | 'LITRO';
  estoque_atual: number;
  estoque_minimo: number;
  custo_medio_unitario: number;
  fornecedor_principal: string;
  localizacao_patio: string;
  status: 'NORMAL' | 'REPOSICAO_NECESSARIA' | 'CRITICO';
}

export interface ItemFichaTecnica {
  id?: string;
  item_nome: string; // O que o usuário quer colocar (livre)
  quantidade: string; // A quantidade que o usuário quer colocar (livre)
}

export interface FichaTecnica {
  id: string;
  produto_id?: string;
  produto_nome: string;
  codigo?: string;
  descricao_padrao?: string;
  itens_especificacao?: ItemFichaTecnica[]; // Lista dinâmica onde o usuário coloca o que quer e a quantidade
  umidade_maxima_percentual?: number;
  acidez_maxima_cm3?: number;
  ph_faixa?: string;
  cinzas_maximas_percentual?: number;
  aspecto_cor?: string;
  viscosidade_brookfield_cp?: number;
  prazo_validade_meses?: number;
  armazenamento?: string;
  aplicacoes_industriais?: string;
  registro_sif_mapa?: string;
}

export interface TabelaPreco {
  id: string;
  codigo: string;
  nome: string;
  tipo: 'Atacado / Distribuidor' | 'Grandes Indústrias (Carga Fechada)' | 'Varejo / Padarias' | 'Pagamento à Vista (FOB)';
  desconto_padrao_percentual: number;
  prazo_padrao: string;
  frete_tipo: 'FOB (Retira Fábrica)' | 'CIF (Entrega Grupo ENO)';
  vigencia_inicio: string;
  vigencia_fim: string;
  status: 'VIGENTE' | 'PROGRAMADA' | 'ARQUIVADA';
}

// DADOS INICIAIS DE RECEITAS INDUSTRIAIS
export const RECEITAS_INICIAIS: ReceitaIndustrial[] = [
  {
    id: 'rec_000',
    codigo: 'REC-MAND-01',
    nome: 'Receita Mandioca Gourmet Palito Congelada (Pacote 1kg)',
    produto_nome: 'Mandioca Gourmet Congelada',
    tipo_embalagem: 'Pacote 1kg',
    rendimento_pacotes: 500, // 500 pacotes de 1kg
    peso_por_pacote_kg: 1,
    rendimento_total_kg: 500,
    materias_primas: [
      {
        materia_prima_id: 'mat_001',
        materia_prima_nome: 'Raiz de Mandioca In Natura Lavada',
        quantidade: 0.75,
        unidade_medida: 'TON',
        custo_unitario: 600.00,
        custo_total: 450.00
      },
      {
        materia_prima_id: 'mat_pac_1kg',
        materia_prima_nome: 'Embalagem Stand-Up Pouch Impressa Mandioca Gourmet 1kg',
        quantidade: 500,
        unidade_medida: 'UN',
        custo_unitario: 0.65,
        custo_total: 325.00
      },
      {
        materia_prima_id: 'mat_fardo_film',
        materia_prima_nome: 'Caixa de Papelão Transporte 10x1kg',
        quantidade: 50,
        unidade_medida: 'UN',
        custo_unitario: 2.80,
        custo_total: 140.00
      }
    ],
    custo_total_materias_primas: 915.00,
    custo_por_pacote: 1.83,
    tempo_processamento_horas: 2.0,
    observacoes_tecnicas: 'Seleção das raízes de mesa mais tenras, descascamento, corte palito e congelamento IQF imediato.',
    data_criacao: '01/03/2026'
  },
  {
    id: 'rec_001',
    codigo: 'REC-FEC-01',
    nome: 'Receita Fécula de Mandioca Doce Padrão (Batelada 400 Sacos)',
    produto_nome: 'Fécula de Mandioca Doce Padrão Industrial',
    tipo_embalagem: 'Saco 25kg',
    rendimento_pacotes: 400, // 400 sacos
    peso_por_pacote_kg: 25,
    rendimento_total_kg: 10000, // 10 Toneladas
    materias_primas: [
      {
        materia_prima_id: 'mat_001',
        materia_prima_nome: 'Raiz de Mandioca In Natura Lavada',
        quantidade: 37.7,
        unidade_medida: 'TON',
        custo_unitario: 600.00,
        custo_total: 22620.00
      },
      {
        materia_prima_id: 'mat_003',
        materia_prima_nome: 'Sacos de Ráfia Valvulados 25kg Impressos Grupo ENO',
        quantidade: 400,
        unidade_medida: 'UN',
        custo_unitario: 3.20,
        custo_total: 1280.00
      },
      {
        materia_prima_id: 'mat_002',
        materia_prima_nome: 'Lenha de Eucalipto Reflorestado (Caldeira)',
        quantidade: 14.5,
        unidade_medida: 'ESTÉREO (m³)',
        custo_unitario: 110.00,
        custo_total: 1595.00
      },
      {
        materia_prima_id: 'mat_005',
        materia_prima_nome: 'Filme Stretch Virgem 500mm para Paletização',
        quantidade: 20,
        unidade_medida: 'KG',
        custo_unitario: 18.50,
        custo_total: 370.00
      }
    ],
    custo_total_materias_primas: 25865.00,
    custo_por_pacote: 64.66,
    tempo_processamento_horas: 4.5,
    rendimento_amido_percentual: 26.5,
    kg_mandioca_por_kg_produto: 3.77,
    agua_m3_por_ton: 3.2,
    perda_destopo_casca_percentual: 6.2,
    bagaço_umido_gerado_kg: 710,
    aditivos_permitidos: 'Nenhum (100% natural sem aditivos)',
    observacoes_tecnicas: 'Moagem com lavagem em contra-corrente, centrifugação horizontal e secagem contínua em secador pneumático Flash Dryer.',
    data_criacao: '15/01/2026'
  },
  {
    id: 'rec_002',
    codigo: 'REC-MOD-02',
    nome: 'Receita Fécula de Mandioca Modificada (Batelada 200 Sacos)',
    produto_nome: 'Fécula de Mandioca Modificada Grau Alimentício',
    tipo_embalagem: 'Saco 25kg',
    rendimento_pacotes: 200,
    peso_por_pacote_kg: 25,
    rendimento_total_kg: 5000,
    materias_primas: [
      {
        materia_prima_id: 'mat_001',
        materia_prima_nome: 'Raiz de Mandioca In Natura Lavada',
        quantidade: 20.15,
        unidade_medida: 'TON',
        custo_unitario: 600.00,
        custo_total: 12090.00
      },
      {
        materia_prima_id: 'mat_003',
        materia_prima_nome: 'Sacos de Ráfia Valvulados 25kg Impressos Grupo ENO',
        quantidade: 200,
        unidade_medida: 'UN',
        custo_unitario: 3.20,
        custo_total: 640.00
      },
      {
        materia_prima_id: 'mat_ins_01',
        materia_prima_nome: 'Hipoclorito de Sódio Tamponado (Reagente)',
        quantidade: 85,
        unidade_medida: 'LITRO',
        custo_unitario: 8.50,
        custo_total: 722.50
      },
      {
        materia_prima_id: 'mat_002',
        materia_prima_nome: 'Lenha de Eucalipto Reflorestado (Caldeira)',
        quantidade: 9.0,
        unidade_medida: 'ESTÉREO (m³)',
        custo_unitario: 110.00,
        custo_total: 990.00
      }
    ],
    custo_total_materias_primas: 14442.50,
    custo_por_pacote: 72.21,
    tempo_processamento_horas: 6.0,
    rendimento_amido_percentual: 24.8,
    kg_mandioca_por_kg_produto: 4.03,
    agua_m3_por_ton: 4.0,
    perda_destopo_casca_percentual: 6.5,
    bagaço_umido_gerado_kg: 725,
    aditivos_permitidos: 'Agentes oxidantes alimentícios grau USP (Hipoclorito de Sódio tamponado)',
    observacoes_tecnicas: 'Reação sob controle rigoroso de temperatura e pH no reator de modificação antes do desaguamento.',
    data_criacao: '20/01/2026'
  },
  {
    id: 'rec_003',
    codigo: 'REC-POL-03',
    nome: 'Receita Polvilho Azedo Especial (Batelada 100 Sacos)',
    produto_nome: 'Polvilho Azedo Especial de Alta Expansão',
    tipo_embalagem: 'Saco 25kg',
    rendimento_pacotes: 100,
    peso_por_pacote_kg: 25,
    rendimento_total_kg: 2500,
    materias_primas: [
      {
        materia_prima_id: 'mat_001',
        materia_prima_nome: 'Raiz de Mandioca In Natura Lavada',
        quantidade: 10.0,
        unidade_medida: 'TON',
        custo_unitario: 600.00,
        custo_total: 6000.00
      },
      {
        materia_prima_id: 'mat_003',
        materia_prima_nome: 'Sacos de Ráfia Valvulados 25kg Impressos Grupo ENO',
        quantidade: 100,
        unidade_medida: 'UN',
        custo_unitario: 3.20,
        custo_total: 320.00
      },
      {
        materia_prima_id: 'mat_002',
        materia_prima_nome: 'Lenha de Eucalipto Reflorestado (Caldeira)',
        quantidade: 4.5,
        unidade_medida: 'ESTÉREO (m³)',
        custo_unitario: 110.00,
        custo_total: 495.00
      }
    ],
    custo_total_materias_primas: 6815.00,
    custo_por_pacote: 68.15,
    tempo_processamento_horas: 168.0, // Fermentação 7 dias
    rendimento_amido_percentual: 25.0,
    kg_mandioca_por_kg_produto: 4.00,
    agua_m3_por_ton: 3.5,
    perda_destopo_casca_percentual: 6.0,
    bagaço_umido_gerado_kg: 715,
    aditivos_permitidos: 'Fermentação biológica natural láctica em tanques de alvenaria impermeabilizados.',
    observacoes_tecnicas: 'Secagem ao sol combinada com acabamento em estufa quente para atingir a expansão volumétrica de pão de queijo.',
    data_criacao: '05/02/2026'
  },
  {
    id: 'rec_004',
    codigo: 'REC-TAP-04',
    nome: 'Receita Goma de Tapioca Hidratada Gourmet (Batelada 500 Fardos)',
    produto_nome: 'Goma de Tapioca Hidratada Gourmet',
    tipo_embalagem: 'Fardo 10x1kg',
    rendimento_pacotes: 500, // 500 fardos = 5.000 pacotes de 1kg
    peso_por_pacote_kg: 10,
    rendimento_total_kg: 5000,
    materias_primas: [
      {
        materia_prima_id: 'mat_001',
        materia_prima_nome: 'Raiz de Mandioca In Natura Lavada',
        quantidade: 14.0,
        unidade_medida: 'TON',
        custo_unitario: 600.00,
        custo_total: 8400.00
      },
      {
        materia_prima_id: 'mat_pac_1kg',
        materia_prima_nome: 'Embalagem Plástica Impressa 1kg Tapioca',
        quantidade: 5000,
        unidade_medida: 'UN',
        custo_unitario: 0.35,
        custo_total: 1750.00
      },
      {
        materia_prima_id: 'mat_fardo_film',
        materia_prima_nome: 'Fardo Plástico Termoencolhível 10x1kg',
        quantidade: 500,
        unidade_medida: 'UN',
        custo_unitario: 1.20,
        custo_total: 600.00
      },
      {
        materia_prima_id: 'mat_sorbato',
        materia_prima_nome: 'Conservante Sorbato de Potássio INS 202',
        quantidade: 2.5,
        unidade_medida: 'KG',
        custo_unitario: 65.00,
        custo_total: 162.50
      }
    ],
    custo_total_materias_primas: 10912.50,
    custo_por_pacote: 21.83,
    tempo_processamento_horas: 3.0,
    rendimento_amido_percentual: 26.5,
    kg_mandioca_por_kg_produto: 2.80,
    agua_m3_por_ton: 1.5,
    perda_destopo_casca_percentual: 1.0,
    bagaço_umido_gerado_kg: 0,
    aditivos_permitidos: 'Conservante INS 202 (Sorbato de Potássio 0,05%)',
    observacoes_tecnicas: 'Peneiramento fino em malha 60 mesh e envase automatizado sob atmosfera protetora.',
    data_criacao: '10/02/2026'
  }
];

// DADOS DE CONFIGURAÇÃO DE CUSTO
export const CONFIGURACOES_CUSTO_INICIAIS: ConfiguracaoCusto[] = [
  {
    id: 'custo_001',
    produto_id: 'prod_fecula_doce_25kg',
    produto_nome: 'Fécula de Mandioca Doce (Saco 25kg)',
    custo_materia_prima_kg: 2.26, // 3.77kg mandioca @ R$ 0.60
    custo_energia_lenha_kg: 0.28,
    custo_embalagem_unit: 3.20, // saco de ráfia valvulado
    custo_mao_obra_kg: 0.22,
    custo_operacional_fixo_kg: 0.19,
    custo_total_producao_kg: 3.08,
    margem_lucro_alvo_percentual: 13.6,
    preco_sugerido_venda_kg: 3.50,
    preco_sugerido_saco_25kg: 87.50,
    ultima_atualizacao: '28/03/2026'
  },
  {
    id: 'custo_002',
    produto_id: 'prod_fecula_doce_bigbag',
    produto_nome: 'Fécula de Mandioca Doce (Big Bag 1000kg)',
    custo_materia_prima_kg: 2.26,
    custo_energia_lenha_kg: 0.28,
    custo_embalagem_unit: 45.00, // big bag reforçado c/ liner
    custo_mao_obra_kg: 0.18,
    custo_operacional_fixo_kg: 0.17,
    custo_total_producao_kg: 2.94,
    margem_lucro_alvo_percentual: 19.0,
    preco_sugerido_venda_kg: 3.50,
    preco_sugerido_saco_25kg: 3500.00,
    ultima_atualizacao: '28/03/2026'
  },
  {
    id: 'custo_003',
    produto_id: 'prod_fecula_modificada_25kg',
    produto_nome: 'Fécula de Mandioca Modificada (Saco 25kg)',
    custo_materia_prima_kg: 2.42,
    custo_energia_lenha_kg: 0.42,
    custo_embalagem_unit: 3.50,
    custo_mao_obra_kg: 0.35,
    custo_operacional_fixo_kg: 0.25,
    custo_total_producao_kg: 3.58,
    margem_lucro_alvo_percentual: 39.6,
    preco_sugerido_venda_kg: 5.00,
    preco_sugerido_saco_25kg: 125.00,
    ultima_atualizacao: '28/03/2026'
  },
  {
    id: 'custo_004',
    produto_id: 'prod_polvilho_azedo_25kg',
    produto_nome: 'Polvilho Azedo Especial (Saco 25kg)',
    custo_materia_prima_kg: 2.40,
    custo_energia_lenha_kg: 0.35,
    custo_embalagem_unit: 3.20,
    custo_mao_obra_kg: 0.30,
    custo_operacional_fixo_kg: 0.22,
    custo_total_producao_kg: 3.40,
    margem_lucro_alvo_percentual: 32.3,
    preco_sugerido_venda_kg: 4.50,
    preco_sugerido_saco_25kg: 112.50,
    ultima_atualizacao: '28/03/2026'
  }
];

// ESTOQUE DE PRODUTOS ACABADOS
export const ESTOQUE_PRODUTOS_INICIAIS: ProdutoEstoque[] = [
  {
    id: 'prod_est_00',
    codigo: 'PRD-MAND-01',
    nome: 'Mandioca Gourmet Palito Congelada (Pacote 1kg)',
    categoria: 'Mandioca Gourmet',
    tipo_embalagem: 'Pacote 1kg',
    peso_unitario_kg: 1,
    estoque_atual_sacos: 1500,
    estoque_atual_kg: 1500,
    estoque_minimo_kg: 400,
    localizacao_galpao: 'Galpão C - Câmara Fria / Congelados',
    preco_unitario_venda: 12.50,
    lote_recente: 'LOTE-MAND-260329',
    status: 'EM_ESTOQUE',
    receita_id: 'rec_000',
    receita_nome: 'Receita Mandioca Gourmet Palito Congelada (Pacote 1kg)',
    custo_materia_prima: 1.83,
    impostos_percentual: 8.0,
    impostos_valor: 1.00,
    custo_operacional: 0.85,
    custo_total: 3.68,
    tipo_acondicionamento: 'Caixa',
    unidades_por_acondicionamento: 10,
    preco_venda_acondicionamento: 125.00,
    margem_lucro_percentual: 70.5
  },
  {
    id: 'prod_est_01',
    codigo: 'PRD-FEC-25',
    nome: 'Fécula de Mandioca Doce Padrão Industrial',
    categoria: 'Féculas Nativas',
    tipo_embalagem: 'Saco 25kg',
    peso_unitario_kg: 25,
    estoque_atual_sacos: 2400,
    estoque_atual_kg: 60000, // 60 Toneladas
    estoque_minimo_kg: 20000,
    localizacao_galpao: 'Galpão A - Paletes 01 ao 12',
    preco_unitario_venda: 87.50,
    lote_recente: 'LOTE-ENO-260327-A',
    status: 'EM_ESTOQUE',
    receita_id: 'rec_001',
    receita_nome: 'Receita Fécula de Mandioca Doce Padrão (Batelada 400 Sacos)',
    custo_materia_prima: 64.66,
    impostos_percentual: 5.5,
    impostos_valor: 4.81,
    custo_operacional: 7.50,
    custo_total: 76.97,
    tipo_acondicionamento: 'Saco',
    unidades_por_acondicionamento: 1,
    preco_venda_acondicionamento: 87.50,
    margem_lucro_percentual: 12.0
  },
  {
    id: 'prod_est_02',
    codigo: 'PRD-FEC-BB',
    nome: 'Fécula de Mandioca Doce Padrão Industrial (Big Bag)',
    categoria: 'Féculas Nativas',
    tipo_embalagem: 'Big Bag 1000kg',
    peso_unitario_kg: 1000,
    estoque_atual_sacos: 45,
    estoque_atual_kg: 45000, // 45 Toneladas
    estoque_minimo_kg: 15000,
    localizacao_galpao: 'Galpão A - Área Big Bags',
    preco_unitario_venda: 3500.00,
    lote_recente: 'LOTE-ENO-260326-BB',
    status: 'EM_ESTOQUE',
    receita_id: 'rec_001',
    receita_nome: 'Receita Fécula de Mandioca Doce Padrão (Batelada 400 Sacos)',
    custo_materia_prima: 2586.50,
    impostos_percentual: 5.5,
    impostos_valor: 192.50,
    custo_operacional: 161.00,
    custo_total: 2940.00,
    tipo_acondicionamento: 'Saco',
    unidades_por_acondicionamento: 1,
    preco_venda_acondicionamento: 3500.00,
    margem_lucro_percentual: 16.0
  },
  {
    id: 'prod_est_03',
    codigo: 'PRD-MOD-25',
    nome: 'Fécula de Mandioca Modificada Grau Alimentício',
    categoria: 'Féculas Especiais',
    tipo_embalagem: 'Saco 25kg',
    peso_unitario_kg: 25,
    estoque_atual_sacos: 650,
    estoque_atual_kg: 16250,
    estoque_minimo_kg: 10000,
    localizacao_galpao: 'Galpão B - Câmara Desumidificada',
    preco_unitario_venda: 125.00,
    lote_recente: 'LOTE-MOD-260325',
    status: 'EM_ESTOQUE',
    receita_id: 'rec_002',
    receita_nome: 'Receita Fécula de Mandioca Modificada (Batelada 200 Sacos)',
    custo_materia_prima: 72.21,
    impostos_percentual: 6.0,
    impostos_valor: 7.50,
    custo_operacional: 9.80,
    custo_total: 89.51,
    tipo_acondicionamento: 'Saco',
    unidades_por_acondicionamento: 1,
    preco_venda_acondicionamento: 125.00,
    margem_lucro_percentual: 28.4
  },
  {
    id: 'prod_est_04',
    codigo: 'PRD-POL-25',
    nome: 'Polvilho Azedo Especial de Alta Expansão',
    categoria: 'Polvilhos',
    tipo_embalagem: 'Saco 25kg',
    peso_unitario_kg: 25,
    estoque_atual_sacos: 320,
    estoque_atual_kg: 8000,
    estoque_minimo_kg: 12000,
    localizacao_galpao: 'Galpão B - Setor Polvilho',
    preco_unitario_venda: 112.50,
    lote_recente: 'LOTE-POL-260324',
    status: 'ESTOQUE_BAIXO',
    receita_id: 'rec_003',
    receita_nome: 'Receita Polvilho Azedo Especial (Batelada 100 Sacos)',
    custo_materia_prima: 68.15,
    impostos_percentual: 5.5,
    impostos_valor: 6.19,
    custo_operacional: 10.66,
    custo_total: 85.00,
    tipo_acondicionamento: 'Saco',
    unidades_por_acondicionamento: 1,
    preco_venda_acondicionamento: 112.50,
    margem_lucro_percentual: 24.4
  },
  {
    id: 'prod_est_05',
    codigo: 'PRD-TAP-10',
    nome: 'Goma de Tapioca Hidratada Gourmet (Fardo 10x1kg)',
    categoria: 'Tapiocas',
    tipo_embalagem: 'Fardo 10x1kg',
    peso_unitario_kg: 10,
    estoque_atual_sacos: 850,
    estoque_atual_kg: 8500,
    estoque_minimo_kg: 5000,
    localizacao_galpao: 'Galpão C - Área de Fracionamento',
    preco_unitario_venda: 5.80,
    lote_recente: 'LOTE-TAP-260328',
    status: 'EM_ESTOQUE',
    receita_id: 'rec_004',
    receita_nome: 'Receita Goma de Tapioca Hidratada Gourmet (Batelada 500 Fardos)',
    custo_materia_prima: 2.18,
    impostos_percentual: 7.0,
    impostos_valor: 0.41,
    custo_operacional: 0.50,
    custo_total: 3.09,
    tipo_acondicionamento: 'Fardo',
    unidades_por_acondicionamento: 10,
    preco_venda_acondicionamento: 58.00,
    margem_lucro_percentual: 46.7
  },
  {
    id: 'prod_est_06',
    codigo: 'PRD-FAR-25',
    nome: 'Farinha de Mandioca Torrada Especial Biju',
    categoria: 'Farinhas',
    tipo_embalagem: 'Saco 25kg',
    peso_unitario_kg: 25,
    estoque_atual_sacos: 180,
    estoque_atual_kg: 4500,
    estoque_minimo_kg: 6000,
    localizacao_galpao: 'Galpão C - Setor Farinhas',
    preco_unitario_venda: 97.50,
    lote_recente: 'LOTE-FAR-260320',
    status: 'ESTOQUE_BAIXO',
    custo_materia_prima: 58.00,
    impostos_percentual: 5.5,
    impostos_valor: 5.36,
    custo_operacional: 8.50,
    custo_total: 71.86,
    tipo_acondicionamento: 'Saco',
    unidades_por_acondicionamento: 1,
    preco_venda_acondicionamento: 97.50,
    margem_lucro_percentual: 26.3
  }
];

// ESTOQUE DE MATÉRIAS-PRIMAS E INSUMOS
export const MATERIAS_PRIMAS_INICIAIS: MateriaPrimaEstoque[] = [
  {
    id: 'mat_001',
    codigo: 'MAT-RAIZ-IND',
    nome: 'Raiz de Mandioca In Natura Lavada',
    categoria: 'Raiz In Natura',
    unidade_medida: 'TON',
    estoque_atual: 420.5, // 420 Toneladas no pátio/silos de recepção
    estoque_minimo: 180.0,
    custo_medio_unitario: 600.00, // R$ 600/ton (R$ 0,60/kg)
    fornecedor_principal: 'Cooperativa dos Mandiocultores do Paranapanema',
    localizacao_patio: 'Pátio de Descarga & Silo Hidráulico 1 e 2',
    status: 'NORMAL'
  },
  {
    id: 'mat_002',
    codigo: 'MAT-LENHA-CALD',
    nome: 'Lenha de Eucalipto Reflorestado (Caldeira)',
    categoria: 'Biomassa / Lenha',
    unidade_medida: 'ESTÉREO (m³)',
    estoque_atual: 185.0,
    estoque_minimo: 80.0,
    custo_medio_unitario: 110.00,
    fornecedor_principal: 'Biomassa Florestal & Cavacos Brasil',
    localizacao_patio: 'Pátio de Lenha Coberto - Setor Caldeira',
    status: 'NORMAL'
  },
  {
    id: 'mat_003',
    codigo: 'MAT-SAC-RAF25',
    nome: 'Sacos de Ráfia Valvulados 25kg Impressos Grupo ENO',
    categoria: 'Embalagens',
    unidade_medida: 'UN',
    estoque_atual: 14500,
    estoque_minimo: 5000,
    custo_medio_unitario: 3.20,
    fornecedor_principal: 'Ráfia & Embalagens Industriais Paulista',
    localizacao_patio: 'Almoxarifado Central - Prateleira D-02',
    status: 'NORMAL'
  },
  {
    id: 'mat_004',
    codigo: 'MAT-BIG-BAG',
    nome: 'Big Bags 1.000kg com Liner Plástico Antiumidade',
    categoria: 'Embalagens',
    unidade_medida: 'UN',
    estoque_atual: 120,
    estoque_minimo: 150,
    custo_medio_unitario: 45.00,
    fornecedor_principal: 'Ráfia & Embalagens Industriais Paulista',
    localizacao_patio: 'Almoxarifado Central - Prateleira D-05',
    status: 'REPOSICAO_NECESSARIA'
  },
  {
    id: 'mat_005',
    codigo: 'MAT-STRETCH-FILM',
    nome: 'Filme Stretch Virgem 500mm para Paletização',
    categoria: 'Embalagens',
    unidade_medida: 'KG',
    estoque_atual: 380,
    estoque_minimo: 200,
    custo_medio_unitario: 18.50,
    fornecedor_principal: 'Plásticos & Embalagens do Sul',
    localizacao_patio: 'Almoxarifado Central - Prateleira C-01',
    status: 'NORMAL'
  }
];

// FICHAS TÉCNICAS INDUSTRIAIS
export const FICHAS_TECNICAS_INICIAIS: FichaTecnica[] = [
  {
    id: 'ft_000',
    produto_id: 'prod_est_00',
    produto_nome: 'Mandioca Gourmet Palito Congelada (Pacote 1kg)',
    codigo: 'FT-MAND-01',
    descricao_padrao: 'Mandioca de mesa selecionada, higienizada, descascada e cortada em formato palito uniforme, congelada rapidamente pelo método IQF para máxima retenção de sabor e maciez.',
    itens_especificacao: [
      { item_nome: 'Mandioca In Natura Lavada e Descascada', quantidade: '1 kg' },
      { item_nome: 'Corte Padrão', quantidade: 'Palito 15x80 mm' },
      { item_nome: 'Umidade Natural', quantidade: '62%' },
      { item_nome: 'Embalagem Pouch Polietileno', quantidade: '1 unidade (1kg)' },
      { item_nome: 'Temperatura de Conservação', quantidade: '-18°C' },
      { item_nome: 'Prazo de Validade', quantidade: '12 meses' }
    ],
    registro_sif_mapa: 'MAPA/DIPOA nº 0055/2026'
  },
  {
    id: 'ft_001',
    produto_id: 'prod_fecula_doce_25kg',
    produto_nome: 'Fécula de Mandioca Doce Padrão Industrial',
    codigo: 'FT-FEC-01',
    descricao_padrao: 'Amido de mandioca nativo extraído industrialmente de raízes frescas selecionadas, submetido a rigorosa lavagem, purificação centrífuga e secagem rápida Flash Dryer.',
    itens_especificacao: [
      { item_nome: 'Amido Puro de Mandioca (Base Seca)', quantidade: 'Mínimo 86.5%' },
      { item_nome: 'Umidade Máxima', quantidade: 'Máximo 13.5%' },
      { item_nome: 'Potencial Hidrogeniônico (pH)', quantidade: '5.5 a 6.5' },
      { item_nome: 'Acidez Titulável', quantidade: 'Máximo 1.5 cm³' },
      { item_nome: 'Viscosidade Brookfield', quantidade: '780 cP' },
      { item_nome: 'Prazo de Validade', quantidade: '24 meses' }
    ],
    registro_sif_mapa: 'MAPA/DIPOA nº 0048/2024'
  },
  {
    id: 'ft_002',
    produto_id: 'prod_fecula_modificada_25kg',
    produto_nome: 'Fécula de Mandioca Modificada Grau Alimentício',
    codigo: 'FT-FEC-02',
    descricao_padrao: 'Amido de mandioca quimicamente modificado por oxidação controlada, conferindo alta estabilidade a ciclos de congelamento/descongelamento e formação de pasta límpida.',
    itens_especificacao: [
      { item_nome: 'Fécula de Mandioca Modificada', quantidade: 'Mínimo 87.5%' },
      { item_nome: 'Umidade Máxima', quantidade: 'Máximo 12.5%' },
      { item_nome: 'Faixa de pH', quantidade: '5.0 a 6.0' },
      { item_nome: 'Teor de Cinzas', quantidade: 'Máximo 0.20%' },
      { item_nome: 'Prazo de Validade', quantidade: '24 meses' }
    ],
    registro_sif_mapa: 'MAPA/DIPOA nº 0049/2024'
  }
];

// TABELAS DE PREÇO
export const TABELAS_PRECO_INICIAIS: TabelaPreco[] = [
  {
    id: 'tab_001',
    codigo: 'TAB-DIST-01',
    nome: 'Tabela Padrão Distribuidor / RCA (28 Dias)',
    tipo: 'Atacado / Distribuidor',
    desconto_padrao_percentual: 0,
    prazo_padrao: 'Boleto Bancário 28 Dias',
    frete_tipo: 'CIF (Entrega Grupo ENO)',
    vigencia_inicio: '01/01/2026',
    vigencia_fim: '31/12/2026',
    status: 'VIGENTE'
  },
  {
    id: 'tab_002',
    codigo: 'TAB-IND-CARGA',
    nome: 'Tabela Grandes Indústrias (Carga Fechada +30 Ton)',
    tipo: 'Grandes Indústrias (Carga Fechada)',
    desconto_padrao_percentual: 7.5,
    prazo_padrao: 'Boleto Bancário 35 Dias',
    frete_tipo: 'CIF (Entrega Grupo ENO)',
    vigencia_inicio: '01/01/2026',
    vigencia_fim: '31/12/2026',
    status: 'VIGENTE'
  },
  {
    id: 'tab_003',
    codigo: 'TAB-AVISTA-FOB',
    nome: 'Tabela Especial Pagamento à Vista (FOB Fábrica)',
    tipo: 'Pagamento à Vista (FOB)',
    desconto_padrao_percentual: 10.0,
    prazo_padrao: 'PIX / TED Antecipado',
    frete_tipo: 'FOB (Retira Fábrica)',
    vigencia_inicio: '01/01/2026',
    vigencia_fim: '31/12/2026',
    status: 'VIGENTE'
  }
];

// STORAGE HELPERS
const STORAGE_KEY_PRODUTOS_ESTOQUE = 'grupo_eno_produtos_estoque_v1';
const STORAGE_KEY_MATERIA_PRIMA = 'grupo_eno_materia_prima_v1';
const STORAGE_KEY_RECEITAS = 'grupo_eno_receitas_v1';
const STORAGE_KEY_CUSTOS = 'grupo_eno_custos_v1';

export function carregarEstoqueProdutos(): ProdutoEstoque[] {
  if (typeof window === 'undefined') return ESTOQUE_PRODUTOS_INICIAIS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUTOS_ESTOQUE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PRODUTOS_ESTOQUE, JSON.stringify(ESTOQUE_PRODUTOS_INICIAIS));
      return ESTOQUE_PRODUTOS_INICIAIS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return ESTOQUE_PRODUTOS_INICIAIS;
  }
}

export function salvarEstoqueProdutos(dados: ProdutoEstoque[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_PRODUTOS_ESTOQUE, JSON.stringify(dados));
  window.dispatchEvent(new Event('produtos_updated'));
}

export function carregarMateriaPrima(): MateriaPrimaEstoque[] {
  if (typeof window === 'undefined') return MATERIAS_PRIMAS_INICIAIS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MATERIA_PRIMA);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_MATERIA_PRIMA, JSON.stringify(MATERIAS_PRIMAS_INICIAIS));
      return MATERIAS_PRIMAS_INICIAIS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return MATERIAS_PRIMAS_INICIAIS;
  }
}

export function salvarMateriaPrima(dados: MateriaPrimaEstoque[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_MATERIA_PRIMA, JSON.stringify(dados));
  window.dispatchEvent(new Event('produtos_updated'));
}

export function carregarReceitas(): ReceitaIndustrial[] {
  if (typeof window === 'undefined') return RECEITAS_INICIAIS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECEITAS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RECEITAS, JSON.stringify(RECEITAS_INICIAIS));
      return RECEITAS_INICIAIS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return RECEITAS_INICIAIS;
  }
}

export function salvarReceitas(dados: ReceitaIndustrial[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_RECEITAS, JSON.stringify(dados));
  window.dispatchEvent(new Event('receitas_updated'));
  window.dispatchEvent(new Event('produtos_updated'));
}

// STORAGE HELPERS PARA FICHAS TÉCNICAS
const STORAGE_KEY_FICHAS_TECNICAS = 'grupo_eno_fichas_tecnicas_v1';

export function carregarFichasTecnicas(): FichaTecnica[] {
  if (typeof window === 'undefined') return FICHAS_TECNICAS_INICIAIS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FICHAS_TECNICAS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_FICHAS_TECNICAS, JSON.stringify(FICHAS_TECNICAS_INICIAIS));
      return FICHAS_TECNICAS_INICIAIS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return FICHAS_TECNICAS_INICIAIS;
  }
}

export function salvarFichasTecnicas(dados: FichaTecnica[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_FICHAS_TECNICAS, JSON.stringify(dados));
  window.dispatchEvent(new Event('fichas_tecnicas_updated'));
}

// STORAGE HELPERS PARA TABELAS DE PREÇO
const STORAGE_KEY_TABELAS_PRECO = 'grupo_eno_tabelas_preco_v1';

export function carregarTabelasPreco(): TabelaPreco[] {
  if (typeof window === 'undefined') return TABELAS_PRECO_INICIAIS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TABELAS_PRECO);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TABELAS_PRECO, JSON.stringify(TABELAS_PRECO_INICIAIS));
      return TABELAS_PRECO_INICIAIS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return TABELAS_PRECO_INICIAIS;
  }
}

export function salvarTabelasPreco(dados: TabelaPreco[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_TABELAS_PRECO, JSON.stringify(dados));
  window.dispatchEvent(new Event('tabelas_preco_updated'));
}
