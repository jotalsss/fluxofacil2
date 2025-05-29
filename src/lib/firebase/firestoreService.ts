
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
  WriteBatch,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";
import type { Transaction } from "@/lib/types";

const TRANSACTIONS_COLLECTION = "transactions";

// Nota: Idealmente, as transações seriam armazenadas sob um ID de usuário específico
// ex: /users/{userId}/transactions. Isso requer autenticação.
// Por enquanto, usaremos uma coleção de nível superior.

export async function addTransaction(
  transactionData: Omit<Transaction, "id" | "date"> & { date: Date } // date é JS Date aqui
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
      ...transactionData,
      date: Timestamp.fromDate(transactionData.date), // Converter JS Date para Firestore Timestamp
    });
    return docRef.id;
  } catch (e) {
    console.error("Erro ao adicionar transação: ", e);
    throw new Error("Não foi possível adicionar a transação.");
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const q = query(collection(db, TRANSACTIONS_COLLECTION), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    const transactions: Transaction[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({
        id: doc.id,
        ...data,
        date: (data.date as Timestamp).toDate(), // Converter Firestore Timestamp para JS Date
      } as Transaction);
    });
    return transactions;
  } catch (e) {
    console.error("Erro ao buscar transações: ", e);
    throw new Error("Não foi possível buscar as transações.");
  }
}

export async function updateTransaction(
  id: string,
  transactionData: Omit<Transaction, "id" | "date"> & { date: Date } // date é JS Date aqui
): Promise<void> {
  try {
    const transactionDoc = doc(db, TRANSACTIONS_COLLECTION, id);
    await updateDoc(transactionDoc, {
      ...transactionData,
      date: Timestamp.fromDate(transactionData.date), // Converter JS Date para Firestore Timestamp
    });
  } catch (e) {
    console.error("Erro ao atualizar transação: ", e);
    throw new Error("Não foi possível atualizar a transação.");
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  try {
    const transactionDoc = doc(db, TRANSACTIONS_COLLECTION, id);
    await deleteDoc(transactionDoc);
  } catch (e) {
    console.error("Erro ao deletar transação: ", e);
    throw new Error("Não foi possível deletar a transação.");
  }
}
