// Dados e Lógica do Portal de Controle do Sítio
// Foco em: Controle de Combustível de Tratores, Litros Disponíveis, Despesas Situacionais e Notas Fiscais

export interface ItemNotaFiscal {
  descricao: string;
  quantidade: number;
  unidade: string;
  precoUnitario: number;
  total: number;
}

export interface NotaFiscalDespesa {
  numero: string; // Ex: '048.291'
  serie: string; // '1'
  chaveAcesso: string; // 44 dígitos
  dataEmissao: string;
  emitente: string; // Ex: 'Posto Rota do Agronegócio Ltda'
  cnpjEmitente: string;
  destinatario: string;
  cnpjDestinatario: string;
  formaPagamento: string;
  itens: ItemNotaFiscal[];
  observacoes?: string;
}

export interface DespesaSitio {
  id: string;
  data: string; // YYYY-MM-DD
  nomeDespesa: string; // Ex: 'Abastecimento Trator Valtra', 'Troca de Óleo e Filtros'
  tipo: 'COMBUSTIVEL' | 'PECA' | 'MANUTENCAO' | 'LUBRIFICANTE' | 'OUTROS';
  produto: string; // Ex: 'Diesel S10', 'Gasolina Comum', 'Filtro de Óleo Lubrificante'
  quantidade: number; // 120, 2, 1
  unidade: string; // 'L' (litros) ou 'UN' (unidades), 'JG', 'CX'
  valorUnitario: number;
  valorTotal: number;
  maquinaTrator: string; // Ex: 'Trator Valtra A950', 'Trator Massey Ferguson 4292'
  responsavel: string; // Ex: 'Zé do Trator (Operador)'
  notaFiscal: NotaFiscalDespesa;
}

export interface ControleSitioState {
  totalLitrosDisponivel: number; // Litros atualmente disponíveis no tanque de reserva do sítio
  capacidadeTanqueLitros: number; // Capacidade total do tanque do sítio
  despesas: DespesaSitio[];
}

export const CONTROLE_SITIO_INICIAL: ControleSitioState = {
  totalLitrosDisponivel: 1840, // 1.840 Litros disponíveis no tanque do sítio
  capacidadeTanqueLitros: 5000,
  despesas: [
    {
      id: 'desp_01',
      data: '2026-10-09',
      nomeDespesa: 'Abastecimento Trator Valtra - Aração do Mandiocal',
      tipo: 'COMBUSTIVEL',
      produto: 'Diesel S10',
      quantidade: 140,
      unidade: 'L',
      valorUnitario: 5.89,
      valorTotal: 824.60,
      maquinaTrator: 'Trator Valtra A950',
      responsavel: 'Valdecir (Mestre de Campo)',
      notaFiscal: {
        numero: '048.291',
        serie: '1',
        chaveAcesso: '4126 1004 8291 0001 9255 0010 0004 8291 1092 8172',
        dataEmissao: '09/10/2026 08:34:21',
        emitente: 'Posto Rota do Agronegócio Ltda',
        cnpjEmitente: '14.892.102/0001-44',
        destinatario: 'Sítio Santana - Grupo ENO Agroindústria',
        cnpjDestinatario: '08.721.432/0001-90',
        formaPagamento: 'Faturado 15 Dias (Boleto)',
        itens: [
          {
            descricao: 'ÓLEO DIESEL B S10 COMUM (AGRÍCOLA)',
            quantidade: 140,
            unidade: 'L',
            precoUnitario: 5.89,
            total: 824.60
          }
        ],
        observacoes: 'Combustível retirado para operação de preparo de solo talhão 01.'
      }
    },
    {
      id: 'desp_02',
      data: '2026-10-07',
      nomeDespesa: 'Troca de Óleo e Filtros - Revisão Preventiva',
      tipo: 'PECA',
      produto: 'Filtro de Óleo Lubrificante Tecfil',
      quantidade: 2,
      unidade: 'UN',
      valorUnitario: 145.00,
      valorTotal: 290.00,
      maquinaTrator: 'Trator Massey Ferguson 4292',
      responsavel: 'Marcos Mecânico',
      notaFiscal: {
        numero: '012.844',
        serie: '2',
        chaveAcesso: '4126 1001 2844 0001 8855 0020 0001 2844 1948 2011',
        dataEmissao: '07/10/2026 14:15:00',
        emitente: 'TratorSul Peças e Implementos Agrícolas',
        cnpjEmitente: '22.341.988/0001-12',
        destinatario: 'Sítio Santana - Grupo ENO Agroindústria',
        cnpjDestinatario: '08.721.432/0001-90',
        formaPagamento: 'À Vista (PIX)',
        itens: [
          {
            descricao: 'FILTRO BLINDADO DE ÓLEO LUBRIFICANTE TECFIL PSL 962',
            quantidade: 2,
            unidade: 'UN',
            precoUnitario: 145.00,
            total: 290.00
          }
        ],
        observacoes: 'Peças aplicadas na revisão periódica de 250 horas.'
      }
    },
    {
      id: 'desp_03',
      data: '2026-10-05',
      nomeDespesa: 'Gasolina Roçadeira e Motosserra do Sítio',
      tipo: 'COMBUSTIVEL',
      produto: 'Gasolina Comum',
      quantidade: 35,
      unidade: 'L',
      valorUnitario: 6.19,
      valorTotal: 216.65,
      maquinaTrator: 'Roçadeira Husqvarna & Motosserra Stihl',
      responsavel: 'Antônio Jardineiro',
      notaFiscal: {
        numero: '099.112',
        serie: '1',
        chaveAcesso: '4126 1009 9112 0001 4455 0010 0009 9112 1109 4321',
        dataEmissao: '05/10/2026 10:20:18',
        emitente: 'Auto Posto Jacarezinho Combustíveis',
        cnpjEmitente: '09.112.443/0001-77',
        destinatario: 'Sítio Santana - Grupo ENO Agroindústria',
        cnpjDestinatario: '08.721.432/0001-90',
        formaPagamento: 'Cartão de Débito',
        itens: [
          {
            descricao: 'GASOLINA COMUM ADITIVADA 2 TEMPOS',
            quantidade: 35,
            unidade: 'L',
            precoUnitario: 6.19,
            total: 216.65
          }
        ],
        observacoes: 'Limpeza de aceiros e corte de vegetação nas divisas do sítio.'
      }
    },
    {
      id: 'desp_04',
      data: '2026-10-03',
      nomeDespesa: 'Abastecimento Trator Massey Ferguson - Gradagem',
      tipo: 'COMBUSTIVEL',
      produto: 'Diesel S10',
      quantidade: 190,
      unidade: 'L',
      valorUnitario: 5.89,
      valorTotal: 1119.10,
      maquinaTrator: 'Trator Massey Ferguson 4292',
      responsavel: 'Valdecir (Mestre de Campo)',
      notaFiscal: {
        numero: '048.110',
        serie: '1',
        chaveAcesso: '4126 1004 8110 0001 9255 0010 0004 8110 2938 4109',
        dataEmissao: '03/10/2026 07:11:00',
        emitente: 'Posto Rota do Agronegócio Ltda',
        cnpjEmitente: '14.892.102/0001-44',
        destinatario: 'Sítio Santana - Grupo ENO Agroindústria',
        cnpjDestinatario: '08.721.432/0001-90',
        formaPagamento: 'Faturado 15 Dias (Boleto)',
        itens: [
          {
            descricao: 'ÓLEO DIESEL B S10 COMUM (AGRÍCOLA)',
            quantidade: 190,
            unidade: 'L',
            precoUnitario: 5.89,
            total: 1119.10
          }
        ],
        observacoes: 'Gradagem pesada niveladora para plantio de ramas de mandioca.'
      }
    },
    {
      id: 'desp_05',
      data: '2026-10-01',
      nomeDespesa: 'Mangueira de Alta Pressão Comando Hidráulico',
      tipo: 'PECA',
      produto: 'Mangueira Hidráulica 1/2 Pol 2 Tramas com Terminais',
      quantidade: 1,
      unidade: 'UN',
      valorUnitario: 380.00,
      valorTotal: 380.00,
      maquinaTrator: 'Trator Valtra A950',
      responsavel: 'Marcos Mecânico',
      notaFiscal: {
        numero: '003.951',
        serie: '1',
        chaveAcesso: '4126 1000 3951 0001 2355 0010 0000 3951 8847 1029',
        dataEmissao: '01/10/2026 16:40:12',
        emitente: 'Hidráulica Paraná Serviços e Mangueiras',
        cnpjEmitente: '05.219.882/0001-09',
        destinatario: 'Sítio Santana - Grupo ENO Agroindústria',
        cnpjDestinatario: '08.721.432/0001-90',
        formaPagamento: 'À Vista (PIX)',
        itens: [
          {
            descricao: 'CONJUNTO MANGUEIRA HIDRÁULICA R2AT 1/2 POL 250 BAR',
            quantidade: 1,
            unidade: 'UN',
            precoUnitario: 380.00,
            total: 380.00
          }
        ],
        observacoes: 'Substituição da mangueira rompida durante levantamento da grade aradora.'
      }
    },
    {
      id: 'desp_06',
      data: '2026-09-28',
      nomeDespesa: 'Graxa Azul para Rolamentos e Cruzetas',
      tipo: 'LUBRIFICANTE',
      produto: 'Balde Graxa Azul Litio EP-2 20kg',
      quantidade: 1,
      unidade: 'UN',
      valorUnitario: 450.00,
      valorTotal: 450.00,
      maquinaTrator: 'Geral (Todos os Tratores e Carretas)',
      responsavel: 'Zé do Trator (Operador)',
      notaFiscal: {
        numero: '028.910',
        serie: '1',
        chaveAcesso: '4126 0902 8910 0001 7755 0010 0002 8910 3920 1948',
        dataEmissao: '28/09/2026 11:05:00',
        emitente: 'Distribuidora AgroLub Lubrificantes',
        cnpjEmitente: '31.902.441/0001-50',
        destinatario: 'Sítio Santana - Grupo ENO Agroindústria',
        cnpjDestinatario: '08.721.432/0001-90',
        formaPagamento: 'Faturado 30 Dias (Boleto)',
        itens: [
          {
            descricao: 'GRAXA AUTOMOTIVA MULTIPUS EP-2 LÍTIO BALDE 20KG',
            quantidade: 1,
            unidade: 'UN',
            precoUnitario: 450.00,
            total: 450.00
          }
        ],
        observacoes: 'Lubrificação semanal dos bicos graxeiros dos implementos de plantio.'
      }
    },
    {
      id: 'desp_07',
      data: '2026-09-24',
      nomeDespesa: 'Bicos Injetores e Calibragem Bomba Injetora',
      tipo: 'PECA',
      produto: 'Jogo de Bicos Injetores Bosch (4 Unidades)',
      quantidade: 1,
      unidade: 'JG',
      valorUnitario: 1150.00,
      valorTotal: 1150.00,
      maquinaTrator: 'Trator Valtra A950',
      responsavel: 'Oficina Diesel Precision',
      notaFiscal: {
        numero: '007.412',
        serie: '1',
        chaveAcesso: '4126 0900 7412 0001 0255 0010 0000 7412 4432 0918',
        dataEmissao: '24/09/2026 15:30:00',
        emitente: 'Diesel Precision Bombas e Injetores',
        cnpjEmitente: '18.441.909/0001-83',
        destinatario: 'Sítio Santana - Grupo ENO Agroindústria',
        cnpjDestinatario: '08.721.432/0001-90',
        formaPagamento: 'Faturado 30 Dias (Boleto)',
        itens: [
          {
            descricao: 'JOGO BICOS INJETORES BOSCH MOTOR AGCO POWER',
            quantidade: 1,
            unidade: 'JG',
            precoUnitario: 1150.00,
            total: 1150.00
          }
        ],
        observacoes: 'Substituição por fumaça escura e perda de rendimento no arrancamento de mandioca.'
      }
    }
  ]
};

const STORAGE_KEY_SITIO_DESPESAS = 'grupo_eno_sitio_controle_despesas_v2';

export function carregarControleSitio(): ControleSitioState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SITIO_DESPESAS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Erro ao ler controle do sítio:', e);
  }
  return CONTROLE_SITIO_INICIAL;
}

export function salvarControleSitio(dados: ControleSitioState): void {
  try {
    localStorage.setItem(STORAGE_KEY_SITIO_DESPESAS, JSON.stringify(dados));
    window.dispatchEvent(new Event('sitio_controle_despesas_updated'));
  } catch (e) {
    console.error('Erro ao salvar controle do sítio:', e);
  }
}
