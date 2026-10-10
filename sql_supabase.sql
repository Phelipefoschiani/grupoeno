-- ============================================================================
-- ARQUIVO: sql_supabase.sql
-- PROJETO: GRUPO ENO - SISTEMA DE GESTÃO AGROINDUSTRIAL
-- MÓDULO: CÁLCULO NA ROÇA & INTEGRAÇÃO COM PEDIDO DE COMPRA E FINANCEIRO
-- DESTINO: Supabase (PostgreSQL 15+)
-- DESCRIÇÃO: Estrutura DDL completa para criação das tabelas, tipos ENUM,
--            chaves estrangeiras, índices, Row Level Security (RLS), triggers
--            e dados de exemplo para execução direta no SQL Editor do Supabase.
-- ============================================================================

-- Habilitar extensões úteis do PostgreSQL no Supabase
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TIPOS ENUMERADOS (ENUMS)
-- ============================================================================

-- Tipo de parceiro fornecedor (prioritariamente AGRICULTOR)
DO $$ BEGIN
    CREATE TYPE tipo_parceiro_enum AS ENUM ('AGRICULTOR', 'FORNECEDOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Situação de pagamento no fluxo da roça
DO $$ BEGIN
    CREATE TYPE situacao_pagamento_roca_enum AS ENUM (
        'PENDENTE_DEFINICAO', 
        'JA_PAGO', 
        'A_PAGAR', 
        'ADIANTAMENTO_PARCIAL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Status global do Pedido de Compra
DO $$ BEGIN
    CREATE TYPE status_pedido_compra_enum AS ENUM (
        'A Confirmar',
        'Pendente',
        'Programado',
        'Entregue (A Pagar)',
        'Pago',
        'Cancelado'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Forma de pagamento simplificada
DO $$ BEGIN
    CREATE TYPE forma_pagamento_roca_enum AS ENUM ('PIX', 'Dinheiro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. FUNÇÃO UTILITÁRIA PARA ATUALIZAÇÃO AUTOMÁTICA DE updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. TABELAS DE APOIO DE CADASTRO (AGRICULTORES E FORNECEDORES)
-- ============================================================================

-- Tabela: agricultores (Produtores Rurais que fornecem mandioca)
CREATE TABLE IF NOT EXISTS agricultores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_interno VARCHAR(50) UNIQUE,
    nome_completo VARCHAR(255) NOT NULL,
    nome_propriedade VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(20) NOT NULL,
    ie_rural VARCHAR(30),
    telefone VARCHAR(30),
    email VARCHAR(150),
    
    -- Dados de Localização da Propriedade (preenchimento automático da roça)
    estrada_linha VARCHAR(255),
    comunidade_bairro VARCHAR(255),
    municipio VARCHAR(100) NOT NULL,
    uf VARCHAR(2) NOT NULL,
    cep VARCHAR(20),
    
    -- Dados Agronômicos
    area_hectares NUMERIC(10,2) DEFAULT 0.00,
    capacidade_estimada_safra_ton NUMERIC(10,2) DEFAULT 0.00,
    variedade_predominante VARCHAR(100),
    
    -- Dados Financeiros para Pagamento no Ato ou a Prazo
    chave_pix VARCHAR(100),
    tipo_chave_pix VARCHAR(30), -- 'CPF', 'CNPJ', 'Celular', 'E-mail', 'Aleatória'
    titular_pix VARCHAR(255),
    banco_nome VARCHAR(100),
    agencia VARCHAR(30),
    conta VARCHAR(50),
    
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE agricultores IS 'Cadastro dos agricultores parceiros e produtores rurais de mandioca.';

DROP TRIGGER IF EXISTS set_timestamp_agricultores ON agricultores;
CREATE TRIGGER set_timestamp_agricultores
BEFORE UPDATE ON agricultores
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Tabela: fornecedores (Fornecedores de insumos ou matéria-prima intermediária)
CREATE TABLE IF NOT EXISTS fornecedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_interno VARCHAR(50) UNIQUE,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(20) NOT NULL UNIQUE,
    inscricao_estadual VARCHAR(30),
    telefone VARCHAR(30),
    email VARCHAR(150),
    chave_pix VARCHAR(100),
    categoria VARCHAR(100),
    municipio VARCHAR(100) NOT NULL,
    uf VARCHAR(2) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE fornecedores IS 'Cadastro de fornecedores gerais e intermediários de matéria-prima e insumos.';

DROP TRIGGER IF EXISTS set_timestamp_fornecedores ON fornecedores;
CREATE TRIGGER set_timestamp_fornecedores
BEFORE UPDATE ON fornecedores
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================================================
-- 4. TABELA PRINCIPAL: CALCULOS NA ROÇA (CABEÇALHO DA PESAGEM)
-- ============================================================================

CREATE TABLE IF NOT EXISTS calculos_roca (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_ticket VARCHAR(50) NOT NULL UNIQUE, -- Ex: ROCA-042/26 (identificador no A4/PDF)
    data_pesagem DATE NOT NULL DEFAULT CURRENT_DATE, -- Foco na data (DD/MM/AAAA)
    hora_pesagem TIME, -- Opcional
    
    -- Vínculo com parceiro (prioritariamente AGRICULTOR)
    tipo_parceiro tipo_parceiro_enum NOT NULL DEFAULT 'AGRICULTOR',
    agricultor_id UUID REFERENCES agricultores(id) ON DELETE SET NULL,
    fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
    
    -- Snapshot dos dados do agricultor no momento da pesagem (garante integridade histórica)
    parceiro_nome VARCHAR(255) NOT NULL,
    parceiro_propriedade VARCHAR(255),
    parceiro_cidade_uf VARCHAR(100),
    parceiro_cpf_cnpj VARCHAR(20),
    parceiro_chave_pix VARCHAR(100),

    -- Dados técnicos da pesagem (local obtido automaticamente da propriedade do agricultor)
    local_pesagem VARCHAR(255) NOT NULL,
    pesador_responsavel VARCHAR(150) NOT NULL,
    
    -- Preços acordados
    preco_por_kg NUMERIC(10,4) NOT NULL DEFAULT 0.6000,
    preco_por_tonelada NUMERIC(12,2) GENERATED ALWAYS AS (preco_por_kg * 1000) STORED,
    
    -- Totais apurados com até 3 casas decimais de precisão (sem arredondamento)
    total_sacos INTEGER NOT NULL DEFAULT 0,
    peso_total_kg NUMERIC(12,3) NOT NULL DEFAULT 0.000,
    peso_medio_saco_kg NUMERIC(10,3) DEFAULT 0.000,
    valor_total_estimado NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    
    observacoes TEXT,
    
    -- Vínculo com Pedido de Compra e Financeiro
    pedido_compra_id VARCHAR(100), -- Identificador externo ou UUID vinculado
    situacao_pagamento situacao_pagamento_roca_enum NOT NULL DEFAULT 'PENDENTE_DEFINICAO',
    
    -- Detalhes da forma de pagamento (apenas PIX ou Dinheiro)
    forma_pagamento_detalhe VARCHAR(50) DEFAULT 'PIX',
    data_pagamento_ou_vencimento DATE,
    valor_pago_adiantado NUMERIC(14,2) DEFAULT 0.00,
    saldo_restante NUMERIC(14,2) DEFAULT 0.00,
    conta_bancaria_origem VARCHAR(150),
    observacao_pagamento TEXT,
    
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE calculos_roca IS 'Cabeçalho e totais das pesagens de mandioca in natura realizadas diretamente na roça do agricultor.';
COMMENT ON COLUMN calculos_roca.numero_ticket IS 'Identificador legível do romaneio de campo emitido para o agricultor.';
COMMENT ON COLUMN calculos_roca.situacao_pagamento IS 'Situação do pagamento: PENDENTE_DEFINICAO, JA_PAGO, A_PAGAR ou ADIANTAMENTO_PARCIAL.';
COMMENT ON COLUMN calculos_roca.forma_pagamento_detalhe IS 'Forma de pagamento adotada na roça: PIX ou Dinheiro.';

DROP TRIGGER IF EXISTS set_timestamp_calculos_roca ON calculos_roca;
CREATE TRIGGER set_timestamp_calculos_roca
BEFORE UPDATE ON calculos_roca
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================================================
-- 5. TABELA DE ITENS: SACOS PESADOS (PESAGEM SACO A SACO - PRECISÃO ATÉ 3 CASAS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS calculos_roca_sacos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calculo_roca_id UUID NOT NULL REFERENCES calculos_roca(id) ON DELETE CASCADE,
    numero_saco INTEGER NOT NULL,
    peso_kg NUMERIC(10,3) NOT NULL, -- Precisão de até 3 casas decimais (ex: 50.850 kg sem arredondamento)
    valor_saco NUMERIC(12,2), -- Valor monetário individual correspondente àquele saco
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Restrição: não repete o mesmo número de saco para a mesma pesagem
    CONSTRAINT unq_calculo_saco UNIQUE (calculo_roca_id, numero_saco)
);

COMMENT ON TABLE calculos_roca_sacos IS 'Pesagem detalhada saco por saco com precisão de até 3 casas decimais e valor individual por saco.';
COMMENT ON COLUMN calculos_roca_sacos.numero_saco IS 'Ordem sequencial do saco (1, 2, 3...) pesado na balança da roça.';
COMMENT ON COLUMN calculos_roca_sacos.peso_kg IS 'Peso aferido individual do saco em quilogramas com até 3 casas decimais (ex: 50.850 kg).';
COMMENT ON COLUMN calculos_roca_sacos.valor_saco IS 'Valor monetário individual correspondente àquele saco.';

-- ============================================================================
-- 6. TABELA: PEDIDOS DE COMPRA (INTEGRAÇÃO DE SUPRIMENTOS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pedidos_compra (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_pedido VARCHAR(50) NOT NULL UNIQUE,
    data_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
    
    tipo_parceiro tipo_parceiro_enum NOT NULL DEFAULT 'AGRICULTOR',
    agricultor_id UUID REFERENCES agricultores(id) ON DELETE SET NULL,
    fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
    parceiro_nome VARCHAR(255) NOT NULL,
    
    comprador_nome VARCHAR(150),
    local_compra VARCHAR(255),
    
    categoria VARCHAR(100) NOT NULL DEFAULT 'Mandioca / Matéria-Prima',
    item_descricao TEXT NOT NULL,
    quantidade NUMERIC(12,3) NOT NULL,
    unidade_medida VARCHAR(20) NOT NULL DEFAULT 'KG',
    valor_unitario NUMERIC(10,4) NOT NULL,
    valor_total NUMERIC(14,2) NOT NULL,
    
    -- Resíduo de mandioca (destopo/casca quando houver desconto)
    residuo_destopo_casca_kg NUMERIC(10,3) DEFAULT 0.000,
    
    status_pedido status_pedido_compra_enum NOT NULL DEFAULT 'A Confirmar',
    forma_pagamento VARCHAR(50) DEFAULT 'PIX',
    data_pagamento DATE,
    
    origem_roca BOOLEAN DEFAULT false,
    calculo_roca_id UUID REFERENCES calculos_roca(id) ON DELETE SET NULL,
    
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE pedidos_compra IS 'Tabela de Pedidos de Compra gerados automaticamente pela roça ou criados manualmente.';

DROP TRIGGER IF EXISTS set_timestamp_pedidos_compra ON pedidos_compra;
CREATE TRIGGER set_timestamp_pedidos_compra
BEFORE UPDATE ON pedidos_compra
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================================================
-- 7. TABELAS FINANCEIRAS DE INTEGRAÇÃO (DESPESAS E CONTAS A PAGAR)
-- ============================================================================

-- Tabela: financeiro_despesas (Saídas diretas ou Despesas Programadas vindas de Pedidos de Compra)
CREATE TABLE IF NOT EXISTS financeiro_despesas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_compra_id UUID REFERENCES pedidos_compra(id) ON DELETE CASCADE, -- Se deletar o pedido de compra, some da despesa programada automaticamente
    calculo_roca_id UUID REFERENCES calculos_roca(id) ON DELETE CASCADE,
    tipo_despesa VARCHAR(50) NOT NULL DEFAULT 'REALIZADA', -- 'REALIZADA' (quitada) ou 'PROGRAMADA' (pedido de compra a adquirir)
    status_despesa VARCHAR(50) NOT NULL DEFAULT 'PAGO', -- 'PROGRAMADA', 'PAGO', 'A_PAGAR'
    data_despesa DATE NOT NULL DEFAULT CURRENT_DATE,
    data_prevista DATE, -- Data prevista para despesas programadas
    categoria VARCHAR(100) NOT NULL DEFAULT 'Matéria-Prima Mandioca',
    descricao TEXT NOT NULL,
    valor NUMERIC(14,2) NOT NULL,
    setor VARCHAR(100) DEFAULT 'Fábrica & Moagem',
    responsavel VARCHAR(150),
    forma_pagamento VARCHAR(50) DEFAULT 'PIX',
    conta_bancaria VARCHAR(150),
    comprovante_anexo BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE financeiro_despesas IS 'Lançamentos de despesas operacionais (realizadas ou programadas a partir de pedidos de compra).';
COMMENT ON COLUMN financeiro_despesas.pedido_compra_id IS 'Vínculo com pedidos_compra. Possui ON DELETE CASCADE: se o pedido for excluído, a despesa programada é excluída automaticamente.';
COMMENT ON COLUMN financeiro_despesas.tipo_despesa IS 'Indica se é REALIZADA (já executada) ou PROGRAMADA (planejada via Pedido de Compra).';

-- Tabela: financeiro_contas_pagar (Títulos a pagar futuros ou saldos de adiantamento)
CREATE TABLE IF NOT EXISTS financeiro_contas_pagar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_compra_id UUID REFERENCES pedidos_compra(id) ON DELETE SET NULL,
    calculo_roca_id UUID REFERENCES calculos_roca(id) ON DELETE SET NULL,
    numero_documento VARCHAR(100) NOT NULL,
    favorecido_nome VARCHAR(255) NOT NULL,
    tipo_favorecido VARCHAR(50) NOT NULL,
    categoria VARCHAR(100) NOT NULL DEFAULT 'Mandioca / Matéria-Prima',
    valor NUMERIC(14,2) NOT NULL,
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_vencimento DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'A Vencer', -- 'A Vencer', 'Pago', 'Atrasado'
    forma_pagamento_prevista VARCHAR(50) DEFAULT 'PIX',
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE financeiro_contas_pagar IS 'Títulos e compromissos lançados no Contas a Pagar do Financeiro.';

-- ============================================================================
-- 8. ÍNDICES DE PERFORMANCE PARA CONSULTAS RÁPIDAS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_calculos_roca_data ON calculos_roca(data_pesagem DESC);
CREATE INDEX IF NOT EXISTS idx_calculos_roca_parceiro ON calculos_roca(parceiro_nome);
CREATE INDEX IF NOT EXISTS idx_calculos_roca_situacao_pagamento ON calculos_roca(situacao_pagamento);
CREATE INDEX IF NOT EXISTS idx_calculos_roca_sacos_calculo_id ON calculos_roca_sacos(calculo_roca_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_compra_calculo_roca ON pedidos_compra(calculo_roca_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_compra_status ON pedidos_compra(status_pedido);
CREATE INDEX IF NOT EXISTS idx_financeiro_pagar_vencimento ON financeiro_contas_pagar(data_vencimento);

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS) - CONFIGURADO PARA SUPABASE
-- ============================================================================

ALTER TABLE agricultores ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculos_roca ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculos_roca_sacos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_contas_pagar ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso irrestrito para leitura e gravação no Supabase (desenvolvimento / produção)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Acesso total agricultores" ON agricultores;
    CREATE POLICY "Acesso total agricultores" ON agricultores FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "Acesso total fornecedores" ON fornecedores;
    CREATE POLICY "Acesso total fornecedores" ON fornecedores FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "Acesso total calculos_roca" ON calculos_roca;
    CREATE POLICY "Acesso total calculos_roca" ON calculos_roca FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "Acesso total calculos_roca_sacos" ON calculos_roca_sacos;
    CREATE POLICY "Acesso total calculos_roca_sacos" ON calculos_roca_sacos FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "Acesso total pedidos_compra" ON pedidos_compra;
    CREATE POLICY "Acesso total pedidos_compra" ON pedidos_compra FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "Acesso total financeiro_despesas" ON financeiro_despesas;
    CREATE POLICY "Acesso total financeiro_despesas" ON financeiro_despesas FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "Acesso total financeiro_contas_pagar" ON financeiro_contas_pagar;
    CREATE POLICY "Acesso total financeiro_contas_pagar" ON financeiro_contas_pagar FOR ALL USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 10. VIEW DE RELATÓRIO COMPLETO (ROMANEIO DE CAMPO COM TOTAIS)
-- ============================================================================

CREATE OR REPLACE VIEW vw_relatorio_calculos_roca AS
SELECT 
    cr.id,
    cr.numero_ticket,
    cr.data_pesagem,
    cr.hora_pesagem,
    cr.parceiro_nome,
    cr.tipo_parceiro,
    cr.parceiro_propriedade,
    cr.parceiro_cidade_uf,
    cr.local_pesagem,
    cr.pesador_responsavel,
    cr.preco_por_kg,
    cr.total_sacos,
    cr.peso_total_kg,
    (cr.peso_total_kg / 1000.0) AS peso_total_toneladas,
    cr.peso_medio_saco_kg,
    cr.valor_total_estimado,
    cr.situacao_pagamento,
    cr.forma_pagamento_detalhe,
    cr.pedido_compra_id,
    cr.created_at
FROM calculos_roca cr
ORDER BY cr.data_pesagem DESC;

COMMENT ON VIEW vw_relatorio_calculos_roca IS 'Visão consolidada para listagens, exportações e relatórios de pesagem na roça.';
