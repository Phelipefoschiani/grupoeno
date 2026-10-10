import { collection, doc, setDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

import {
  ProdutoEstoque,
  MateriaPrimaEstoque,
  ReceitaIndustrial,
  FichaTecnica,
  TabelaPreco
} from '../data/produtosData';
import { PedidoVenda } from '../data/pedidosVendaData';
import {
  Agricultor,
  Fornecedor,
  PedidoCompraGeral,
  AGRICULTORES_CADASTRADOS,
  FORNECEDORES_CADASTRADOS
} from '../data/mockStore';
import {
  TituloReceber,
  TituloPagar,
  DespesaOperacional,
  TITULOS_RECEBER_INICIAIS,
  TITULOS_PAGAR_INICIAIS,
  DESPESAS_OPERACIONAIS_INICIAIS
} from '../data/financeiroData';

// Sincroniza todas as coleções de todos os módulos com o Firebase Firestore
export async function sincronizarTodasColecoesFirestore(dados: {
  produtos: ProdutoEstoque[];
  materias: MateriaPrimaEstoque[];
  receitas: ReceitaIndustrial[];
  fichas: FichaTecnica[];
  tabelas: TabelaPreco[];
  pedidosVenda: PedidoVenda[];
  agricultores?: Agricultor[];
  fornecedores?: Fornecedor[];
  titulosReceber?: TituloReceber[];
  titulosPagar?: TituloPagar[];
  despesas?: DespesaOperacional[];
}) {
  try {
    // 1. Produtos
    const prodSnap = await getDocs(collection(db, 'produtos'));
    if (prodSnap.empty && dados.produtos?.length > 0) {
      const batch = writeBatch(db);
      dados.produtos.forEach(p => batch.set(doc(db, 'produtos', p.id), p, { merge: true }));
      await batch.commit();
    }

    // 2. Matérias-Primas
    const matSnap = await getDocs(collection(db, 'materias_primas'));
    if (matSnap.empty && dados.materias?.length > 0) {
      const batch = writeBatch(db);
      dados.materias.forEach(m => batch.set(doc(db, 'materias_primas', m.id), m, { merge: true }));
      await batch.commit();
    }

    // 3. Receitas
    const recSnap = await getDocs(collection(db, 'receitas'));
    if (recSnap.empty && dados.receitas?.length > 0) {
      const batch = writeBatch(db);
      dados.receitas.forEach(r => batch.set(doc(db, 'receitas', r.id), r, { merge: true }));
      await batch.commit();
    }

    // 4. Fichas Técnicas
    const fichasSnap = await getDocs(collection(db, 'fichas_tecnicas'));
    if (fichasSnap.empty && dados.fichas?.length > 0) {
      const batch = writeBatch(db);
      dados.fichas.forEach(f => batch.set(doc(db, 'fichas_tecnicas', f.id), f, { merge: true }));
      await batch.commit();
    }

    // 5. Tabelas de Preço
    const tabSnap = await getDocs(collection(db, 'tabelas_preco'));
    if (tabSnap.empty && dados.tabelas?.length > 0) {
      const batch = writeBatch(db);
      dados.tabelas.forEach(t => batch.set(doc(db, 'tabelas_preco', t.id), t, { merge: true }));
      await batch.commit();
    }

    // 6. Pedidos de Venda
    const pedSnap = await getDocs(collection(db, 'pedidos_venda'));
    if (pedSnap.empty && dados.pedidosVenda?.length > 0) {
      const batch = writeBatch(db);
      dados.pedidosVenda.forEach(pv => batch.set(doc(db, 'pedidos_venda', pv.id), pv, { merge: true }));
      await batch.commit();
    }

    // 7. Agricultores
    const agSnap = await getDocs(collection(db, 'agricultores'));
    const listaAg = dados.agricultores || AGRICULTORES_CADASTRADOS;
    if (agSnap.empty && listaAg.length > 0) {
      const batch = writeBatch(db);
      listaAg.forEach(a => batch.set(doc(db, 'agricultores', a.id), a, { merge: true }));
      await batch.commit();
    }

    // 8. Fornecedores
    const fornSnap = await getDocs(collection(db, 'fornecedores'));
    const listaForn = dados.fornecedores || FORNECEDORES_CADASTRADOS;
    if (fornSnap.empty && listaForn.length > 0) {
      const batch = writeBatch(db);
      listaForn.forEach(f => batch.set(doc(db, 'fornecedores', f.id), f, { merge: true }));
      await batch.commit();
    }

    // 9. Contas a Receber
    const recFinSnap = await getDocs(collection(db, 'titulos_receber'));
    const listaRec = dados.titulosReceber || TITULOS_RECEBER_INICIAIS;
    if (recFinSnap.empty && listaRec.length > 0) {
      const batch = writeBatch(db);
      listaRec.forEach(tr => batch.set(doc(db, 'titulos_receber', tr.id), tr, { merge: true }));
      await batch.commit();
    }

    // 10. Contas a Pagar
    const pagFinSnap = await getDocs(collection(db, 'titulos_pagar'));
    const listaPag = dados.titulosPagar || TITULOS_PAGAR_INICIAIS;
    if (pagFinSnap.empty && listaPag.length > 0) {
      const batch = writeBatch(db);
      listaPag.forEach(tp => batch.set(doc(db, 'titulos_pagar', tp.id), tp, { merge: true }));
      await batch.commit();
    }

    // 11. Despesas Operacionais
    const despSnap = await getDocs(collection(db, 'despesas_operacionais'));
    const listaDesp = dados.despesas || DESPESAS_OPERACIONAIS_INICIAIS;
    if (despSnap.empty && listaDesp.length > 0) {
      const batch = writeBatch(db);
      listaDesp.forEach(d => batch.set(doc(db, 'despesas_operacionais', d.id), d, { merge: true }));
      await batch.commit();
    }

  } catch (error) {
    console.warn('Sincronização em nuvem Firestore aguardando conexão:', error);
  }
}

// Helpers para salvar documentos individuais em nuvem
export async function salvarDocumentoFirestore(colecao: string, id: string, dados: any) {
  try {
    await setDoc(doc(db, colecao, id), dados, { merge: true });
  } catch (e) {
    console.warn(`Erro ao salvar em ${colecao}:`, e);
  }
}
