// Pipeline Integrado do Grupo ENO Agroindustrial
// Interliga: Matéria-Prima -> Custo Produto -> Orçamento -> Venda -> Produção -> Despesas -> Financeiro

import { 
  carregarMateriaPrima, 
  salvarMateriaPrima, 
  carregarEstoqueProdutos, 
  salvarEstoqueProdutos,
  carregarReceitas,
  ProdutoEstoque
} from './produtosData';

import { 
  carregarTitulosReceber, 
  salvarTitulosReceber, 
  carregarTitulosPagar, 
  salvarTitulosPagar, 
  carregarDespesas, 
  salvarDespesas, 
  carregarNotasSaida, 
  salvarNotasSaida,
  carregarNotasEntrada,
  salvarNotasEntrada,
  TituloReceber,
  TituloPagar,
  DespesaOperacional,
  NotaFiscalSaida,
  NotaFiscalEntrada
} from './financeiroData';

import { 
  carregarPedidosVenda, 
  salvarPedidosVenda, 
  PedidoVenda 
} from './pedidosVendaData';

import { 
  carregarPedidosCompra, 
  salvarPedidosCompra, 
  PedidoCompraGeral 
} from './mockStore';

import { 
  carregarControleSitio, 
  salvarControleSitio, 
  DespesaSitio 
} from './sitioControleData';

/**
 * 1. MATÉRIA-PRIMA: Dá entrada de matéria-prima no estoque e lança no Financeiro (Contas a Pagar + NF Entrada)
 */
export function integrarEntradaMateriaPrima(params: {
  descricaoItem: string;
  quantidade: number;
  unidade: string;
  valorTotal: number;
  fornecedorNome: string;
  fornecedorCpfCnpj?: string;
  numeroNF?: string;
  chavePix?: string;
  data?: string;
}): void {
  const dataHoje = params.data || new Date().toLocaleDateString('pt-BR');
  const descLower = params.descricaoItem.toLowerCase();

  // 1. Atualiza estoque de matéria-prima
  const materias = carregarMateriaPrima();
  let encontrada = false;

  const atualizadas = materias.map(mat => {
    const matNomeLower = mat.nome.toLowerCase();
    if (
      (descLower.includes('mandioca') || descLower.includes('raiz')) && 
      (matNomeLower.includes('mandioca') || matNomeLower.includes('raiz'))
    ) {
      encontrada = true;
      // Normaliza para Toneladas se necessário
      const qtdTon = params.unidade === 'KG' ? params.quantidade / 1000 : params.quantidade;
      return {
        ...mat,
        estoque_atual: parseFloat((mat.estoque_atual + qtdTon).toFixed(2))
      };
    }
    if (
      (descLower.includes('saco') || descLower.includes('ráfia') || descLower.includes('embalag')) && 
      matNomeLower.includes('saco')
    ) {
      encontrada = true;
      return {
        ...mat,
        estoque_atual: mat.estoque_atual + params.quantidade
      };
    }
    if (
      (descLower.includes('lenha') || descLower.includes('biomassa')) && 
      matNomeLower.includes('lenha')
    ) {
      encontrada = true;
      return {
        ...mat,
        estoque_atual: mat.estoque_atual + params.quantidade
      };
    }
    return mat;
  });

  if (encontrada) {
    salvarMateriaPrima(atualizadas);
  }

  // 2. Registra Nota Fiscal de Entrada
  try {
    const notasEntrada = carregarNotasEntrada();
    const novaNfe: NotaFiscalEntrada = {
      id: `nfe_ent_${Date.now()}`,
      numero: params.numeroNF || `00${Math.floor(1000 + Math.random() * 9000)}`,
      serie: '1',
      chave_acesso: `412603${(params.fornecedorCpfCnpj || '00000000000000').replace(/\D/g, '').padEnd(14, '0')}5500100000${Math.floor(1000 + Math.random() * 9000)}1098`,
      parceiro_nome: params.fornecedorNome,
      tipo_parceiro: descLower.includes('mandioca') ? 'Agricultor' : 'Fornecedor',
      cnpj_cpf: params.fornecedorCpfCnpj || '00.000.000/0000-00',
      produto_descricao: params.descricaoItem,
      peso_liquido_kg: params.unidade === 'TON' ? params.quantidade * 1000 : params.quantidade,
      valor_total: params.valorTotal,
      data_emissao: dataHoje,
      status_sefaz: 'AUTORIZADA'
    };
    notasEntrada.unshift(novaNfe);
    salvarNotasEntrada(notasEntrada);
  } catch (err) {
    console.error('Erro ao integrar NF de entrada:', err);
  }
}

/**
 * 2. PRODUÇÃO: Ao finalizar a ordem de produção:
 * - Alimenta o estoque de produtos acabados
 * - Consome a matéria-prima (mandioca e sacaria)
 */
export function integrarConclusaoProducao(pedido: PedidoVenda): void {
  // 1. Alimenta o estoque de produtos acabados
  const produtos = carregarEstoqueProdutos();
  let houveAlteracaoProduto = false;

  pedido.itens.forEach(item => {
    const prodIdx = produtos.findIndex(p => p.id === item.produto_id || p.nome === item.produto_nome);
    const qtdPacotes = item.quantidade_produzida || item.quantidade;
    const pesoKg = qtdPacotes * (item.peso_unitario_kg || 25);

    if (prodIdx >= 0) {
      houveAlteracaoProduto = true;
      produtos[prodIdx] = {
        ...produtos[prodIdx],
        estoque_atual_sacos: produtos[prodIdx].estoque_atual_sacos + qtdPacotes,
        estoque_atual_kg: produtos[prodIdx].estoque_atual_kg + pesoKg,
        lote_recente: pedido.lote_producao || produtos[prodIdx].lote_recente,
        status: (produtos[prodIdx].estoque_atual_kg + pesoKg) >= produtos[prodIdx].estoque_minimo_kg ? 'EM_ESTOQUE' : 'ESTOQUE_BAIXO'
      };
    }
  });

  if (houveAlteracaoProduto) {
    salvarEstoqueProdutos(produtos);
  }

  // 2. Consome matéria-prima do estoque (mandioca e sacaria)
  const materias = carregarMateriaPrima();
  const pesoTotalMandiocaConsumidaTon = (pedido.peso_total_kg * 3.7) / 1000; // ~3.7kg mandioca in natura por kg de fécula
  const sacosConsumidos = pedido.itens.reduce((acc, it) => acc + (it.quantidade_produzida || it.quantidade), 0);

  const materiasAtualizadas = materias.map(mat => {
    const nomeLower = mat.nome.toLowerCase();
    if (nomeLower.includes('mandioca') || nomeLower.includes('raiz')) {
      return {
        ...mat,
        estoque_atual: Math.max(0, parseFloat((mat.estoque_atual - pesoTotalMandiocaConsumidaTon).toFixed(2)))
      };
    }
    if (nomeLower.includes('saco') || nomeLower.includes('ráfia')) {
      return {
        ...mat,
        estoque_atual: Math.max(0, mat.estoque_atual - sacosConsumidos)
      };
    }
    return mat;
  });

  salvarMateriaPrima(materiasAtualizadas);
}

/**
 * 3. FATURAMENTO & VENDA: Ao faturar pedido de venda:
 * - Dá baixa no estoque de produto acabado
 * - Gera Contas a Receber (Título Financeiro)
 * - Gera Nota Fiscal de Saída (NF-e)
 */
export function integrarFaturamentoPedidoVenda(pedido: PedidoVenda): void {
  const dataHoje = pedido.data_faturamento || new Date().toLocaleDateString('pt-BR');

  // 1. Baixa do estoque de produto acabado
  const produtos = carregarEstoqueProdutos();
  let houveBaixa = false;

  pedido.itens.forEach(item => {
    const prodIdx = produtos.findIndex(p => p.id === item.produto_id || p.nome === item.produto_nome);
    const qtdPacotes = item.quantidade;
    const pesoKg = qtdPacotes * (item.peso_unitario_kg || 25);

    if (prodIdx >= 0) {
      houveBaixa = true;
      const novoSacos = Math.max(0, produtos[prodIdx].estoque_atual_sacos - qtdPacotes);
      const novoKg = Math.max(0, produtos[prodIdx].estoque_atual_kg - pesoKg);
      produtos[prodIdx] = {
        ...produtos[prodIdx],
        estoque_atual_sacos: novoSacos,
        estoque_atual_kg: novoKg,
        status: novoKg <= 0 ? 'CRITICO' : novoKg < produtos[prodIdx].estoque_minimo_kg ? 'ESTOQUE_BAIXO' : 'EM_ESTOQUE'
      };
    }
  });

  if (houveBaixa) {
    salvarEstoqueProdutos(produtos);
  }

  // 2. Gera Título a Receber no Financeiro
  try {
    const titulosReceber = carregarTitulosReceber();
    const jaExiste = titulosReceber.some(t => t.pedido_venda_id === pedido.id);

    if (!jaExiste) {
      const numDoc = pedido.nota_fiscal?.numero 
        ? `FAT-${pedido.nota_fiscal.numero}` 
        : `FAT-${pedido.numero_pedido.replace(/\D/g, '')}`;

      const novoTitulo: TituloReceber = {
        id: `rec_auto_${pedido.id}_${Date.now()}`,
        pedido_venda_id: pedido.id,
        numero_documento: numDoc,
        cliente_nome: pedido.cliente_nome,
        cliente_cnpj: pedido.cliente_cnpj_cpf,
        valor: pedido.valor_total,
        data_emissao: dataHoje,
        data_vencimento: pedido.data_previsao_entrega || new Date(Date.now() + 28 * 86400000).toLocaleDateString('pt-BR'),
        status: 'EM_ABERTO',
        forma_pagamento: pedido.prazo_pagamento || pedido.forma_pagamento || 'Boleto Bancário 28 Dias',
        banco_emissor: 'Banco do Brasil S.A. (Ag. 0048)',
        observacoes: `Faturamento automático do Pedido ${pedido.numero_pedido}. Lote: ${pedido.lote_producao || 'Geral'}.`
      };

      titulosReceber.unshift(novoTitulo);
      salvarTitulosReceber(titulosReceber);
    }
  } catch (err) {
    console.error('Erro ao gerar contas a receber:', err);
  }

  // 3. Gera Nota Fiscal de Saída (NF-e)
  try {
    const notasSaida = carregarNotasSaida();
    const nfNumero = pedido.nota_fiscal?.numero || `00${Math.floor(4900 + Math.random() * 50)}`;
    const jaExisteNf = notasSaida.some(n => n.numero === nfNumero);

    if (!jaExisteNf) {
      const novaNfSaida: NotaFiscalSaida = {
        id: `nfe_sai_auto_${pedido.id}_${Date.now()}`,
        numero: nfNumero,
        serie: pedido.nota_fiscal?.serie || '1',
        chave_acesso: pedido.nota_fiscal?.chave_acesso || `412603${pedido.cliente_cnpj_cpf.replace(/\D/g, '').padEnd(14, '0')}5500100000${nfNumero.replace(/\D/g, '')}1098`,
        cliente_nome: pedido.cliente_nome,
        cnpj_cpf: pedido.cliente_cnpj_cpf,
        valor_total: pedido.valor_total,
        peso_liquido_kg: pedido.peso_total_kg,
        data_emissao: `${dataHoje} 11:00`,
        status_sefaz: 'AUTORIZADA',
        transportadora: pedido.transportadora || 'Expresso Próprio Grupo ENO',
        placa: pedido.placa_veiculo || 'PRX-1842'
      };

      notasSaida.unshift(novaNfSaida);
      salvarNotasSaida(notasSaida);
    }
  } catch (err) {
    console.error('Erro ao gerar NF de saída:', err);
  }
}

/**
 * 4. SÍTIO & COMBUSTÍVEL: Integra despesas do sítio ao financeiro do Grupo ENO
 */
export function integrarDespesaSitioAoFinanceiro(despesa: DespesaSitio): void {
  try {
    // 1. Lança como Despesa Operacional
    const despesas = carregarDespesas();
    const novaDespesa: DespesaOperacional = {
      id: `desp_sitio_${despesa.id}_${Date.now()}`,
      data: despesa.data,
      categoria: despesa.tipo === 'COMBUSTIVEL' ? 'Combustível & Abastecimento' : 'Manutenção Mecânica & Peças',
      descricao: `[Controle do Sítio] ${despesa.nomeDespesa} (${despesa.produto}) - ${despesa.quantidade} ${despesa.unidade}`,
      valor: despesa.valorTotal,
      setor: 'Frotas & Logística',
      responsavel: despesa.responsavel,
      forma_pagamento: despesa.notaFiscal?.formaPagamento || 'Boleto / À Vista',
      comprovante_anexo: true
    };
    despesas.unshift(novaDespesa);
    salvarDespesas(despesas);

    // 2. Lança como Título a Pagar
    const titulosPagar = carregarTitulosPagar();
    const novoPagar: TituloPagar = {
      id: `pag_sitio_${despesa.id}_${Date.now()}`,
      numero_documento: despesa.notaFiscal?.numero || `NF-SITIO-${Date.now().toString().slice(-4)}`,
      favorecido_nome: despesa.notaFiscal?.emitente || 'Distribuidora Agro',
      tipo_favorecido: 'Fornecedor',
      categoria: despesa.tipo === 'COMBUSTIVEL' ? 'Manutenção Mecânica' : 'Manutenção Mecânica',
      valor: despesa.valorTotal,
      data_emissao: despesa.data,
      data_vencimento: new Date(Date.now() + 14 * 86400000).toLocaleDateString('pt-BR'),
      status: 'A_PAGAR',
      forma_pagamento: despesa.notaFiscal?.formaPagamento || 'Boleto',
      observacoes: `Operação do Sítio: ${despesa.maquinaTrator} - ${despesa.produto}`
    };
    titulosPagar.unshift(novoPagar);
    salvarTitulosPagar(titulosPagar);
  } catch (err) {
    console.error('Erro ao integrar despesa do sítio ao financeiro:', err);
  }
}

/**
 * 5. CONSOLIDAÇÃO GERAL: Calcula indicadores consolidados de ponta a ponta
 */
export function obterConsolidadoGeral() {
  const pedidosVenda = carregarPedidosVenda();
  const titulosReceber = carregarTitulosReceber();
  const despesas = carregarDespesas();
  const titulosPagar = carregarTitulosPagar();
  const produtosEstoque = carregarEstoqueProdutos();
  const materiasPrimas = carregarMateriaPrima();
  const controleSitio = carregarControleSitio();

  // Faturamento real
  const faturamentoVendas = pedidosVenda
    .filter(p => p.etapa === 'FATURADO' || p.etapa === 'ENTREGUE')
    .reduce((acc, p) => acc + (p.valor_total || 0), 0);

  const faturamentoReceber = titulosReceber.reduce((acc, t) => acc + (t.valor || 0), 0);
  const faturamentoTotal = Math.max(faturamentoVendas, faturamentoReceber);

  // Despesas totais (operacionais + compras + combustível)
  const totalDespesasOperacionais = despesas.reduce((acc, d) => acc + (d.valor || 0), 0);
  const totalContasPagar = titulosPagar.reduce((acc, p) => acc + (p.valor || 0), 0);
  const totalDespesas = Math.max(totalDespesasOperacionais, totalContasPagar);

  // Lucro líquido
  const lucroLiquido = faturamentoTotal - totalDespesas;
  const margemLucroLiquido = faturamentoTotal > 0 ? (lucroLiquido / faturamentoTotal) * 100 : 0;

  // Estoque produtos acabados
  const totalSacosEstoque = produtosEstoque.reduce((acc, p) => acc + (p.estoque_atual_sacos || 0), 0);
  const totalKgEstoque = produtosEstoque.reduce((acc, p) => acc + (p.estoque_atual_kg || 0), 0);
  const valorEstoqueProdutos = produtosEstoque.reduce((acc, p) => acc + (p.estoque_atual_sacos * (p.preco_unitario_venda || 0)), 0);

  // Estoque matéria-prima
  const totalMateriaPrimaTon = materiasPrimas.reduce((acc, m) => acc + (m.unidade_medida === 'TON' ? m.estoque_atual : m.unidade_medida === 'KG' ? m.estoque_atual / 1000 : 0), 0);
  const valorEstoqueMateriaPrima = materiasPrimas.reduce((acc, m) => acc + (m.estoque_atual * (m.custo_medio_unitario || 0)), 0);

  return {
    faturamentoTotal,
    totalDespesas,
    lucroLiquido,
    margemLucroLiquido,
    totalSacosEstoque,
    totalKgEstoque,
    valorEstoqueProdutos,
    totalMateriaPrimaTon,
    valorEstoqueMateriaPrima,
    totalLitrosCombustivelSitio: controleSitio.totalLitrosDisponivel,
    pedidosEmProducao: pedidosVenda.filter(p => p.etapa === 'EM_PRODUCAO').length,
    pedidosAFaturar: pedidosVenda.filter(p => p.etapa === 'A_FATURAR').length,
    pedidosFaturados: pedidosVenda.filter(p => p.etapa === 'FATURADO').length,
    pedidosEntregues: pedidosVenda.filter(p => p.etapa === 'ENTREGUE').length
  };
}
