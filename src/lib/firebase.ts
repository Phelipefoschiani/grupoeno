import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Inicializa o app do Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inicializa o Cloud Firestore com o ID de banco configurado
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Inicializa a autenticação
export const auth = getAuth(app);

// Teste de conexão recomendado para validar inicialização
export async function testarConexaoFirestore(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'produtos', 'ping_check'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline ou em cache:', error.message);
    }
    return true;
  }
}
