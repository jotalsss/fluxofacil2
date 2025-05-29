
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  query,
  orderBy,
  where,
  // WriteBatch, // Não está sendo usado
  // writeBatch, // Não está sendo usado
} from "firebase/firestore";
import { db, auth } from "./config"; // Importar auth
import type { Transaction } from "@/lib/types";

const TRANSACTIONS_COLLECTION = "transactions";

export async function addTransaction(
  transactionData: Omit<Transaction, "id" | "date" | "userId"> & { date: Date }
): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    console.error("Erro: Usuário não autenticado tentando adicionar transação.");
    throw new Error("Usuário não autenticado.");
  }

  try {
    const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
      ...transactionData,
      userId: user.uid, // Adicionar userId do usuário logado
      date: Timestamp.fromDate(transactionData.date),
    });
    return docRef.id;
  } catch (e) {
    console.error("Erro ao adicionar transação: ", e);
    throw new Error("Não foi possível adicionar a transação.");
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  const user = auth.currentUser;
  if (!user) {
    // Se não houver usuário logado, retorna array vazio.
    // As páginas protegidas não devem permitir chegar aqui sem usuário.
    return []; 
  }

  try {
    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where("userId", "==", user.uid), // Filtrar por userId do usuário logado
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    const transactions: Transaction[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        ...data,
        date: (data.date as Timestamp).toDate(),
      } as Transaction); // O 'as Transaction' já considera o userId
    });
    return transactions;
  } catch (e) {
    console.error("Erro ao buscar transações: ", e);
    throw new Error("Não foi possível buscar as transações.");
  }
}

export async function updateTransaction(
  id: string,
  transactionData: Omit<Transaction, "id" | "date" | "userId"> & { date: Date }
): Promise<void> {
  // As regras do Firestore garantirão que apenas o proprietário possa atualizar.
  // O userId não deve ser alterado aqui.
  const user = auth.currentUser;
  if (!user) {
    console.error("Erro: Usuário não autenticado tentando atualizar transação.");
    throw new Error("Usuário não autenticado.");
  }
  // Poderíamos adicionar uma verificação aqui para garantir que a transação pertence ao usuário antes de tentar atualizar,
  // mas as regras do Firestore são a principal camada de segurança.
  try {
    const transactionDoc = doc(db, TRANSACTIONS_COLLECTION, id);
    await updateDoc(transactionDoc, {
      ...transactionData,
      // userId: user.uid, // NÃO ATUALIZE O userId AQUI para evitar que um usuário se aproprie da transação de outro.
                         // A regra de update do Firestore deve impedir a alteração do userId.
      date: Timestamp.fromDate(transactionData.date),
    });
  } catch (e) {
    console.error("Erro ao atualizar transação: ", e);
    throw new Error("Não foi possível atualizar a transação.");
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  // As regras do Firestore garantirão que apenas o proprietário possa deletar.
  const user = auth.currentUser;
  if (!user) {
    console.error("Erro: Usuário não autenticado tentando deletar transação.");
    throw new Error("Usuário não autenticado.");
  }
  try {
    const transactionDoc = doc(db, TRANSACTIONS_COLLECTION, id);
    await deleteDoc(transactionDoc);
  } catch (e) {
    console.error("Erro ao deletar transação: ", e);
    throw new Error("Não foi possível deletar a transação.");
  }
}
