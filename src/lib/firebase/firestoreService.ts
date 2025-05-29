
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
  type PartialWithFieldValue,
} from "firebase/firestore";
import { db, auth } from "./config"; 
import type { Transaction } from "@/lib/types";

const TRANSACTIONS_COLLECTION = "transactions";

export async function addTransaction(
  transactionData: Omit<Transaction, "id" | "userId"> 
): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    console.error("Erro: Usuário não autenticado tentando adicionar transação.");
    throw new Error("Usuário não autenticado.");
  }

  const dataToSave = {
    ...transactionData,
    userId: user.uid, 
    date: Timestamp.fromDate(transactionData.date),
  };

  try {
    const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), dataToSave);
    return docRef.id;
  } catch (e) {
    console.error("Erro ao adicionar transação: ", e);
    throw new Error("Não foi possível adicionar a transação.");
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  const user = auth.currentUser;
  if (!user) {
    return []; 
  }

  try {
    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where("userId", "==", user.uid), 
      orderBy("date", "desc"), 
      orderBy("description", "asc") 
    );
    const querySnapshot = await getDocs(q);
    const transactions: Transaction[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      transactions.push({
        id: docSnap.id,
        userId: data.userId,
        date: (data.date as Timestamp).toDate(),
        description: data.description,
        amount: data.amount,
        type: data.type,
        category: data.category,
        tags: data.tags || [],
        isInstallment: data.isInstallment || false,
        installmentNumber: data.installmentNumber,
        totalInstallments: data.totalInstallments,
        originalPurchaseId: data.originalPurchaseId,
        totalPurchaseAmount: data.totalPurchaseAmount,
      } as Transaction); 
    });
    return transactions;
  } catch (e: any) {
    console.error("Erro ao buscar transações: ", e);
    if (e.code === 'failed-precondition' && e.message.includes('Query requires an index')) {
        throw new Error("Índice do Firestore ausente. Por favor, crie o índice composto: 'transactions' -> 'userId (asc)', 'date (desc)', 'description (asc)'. O link para criação geralmente é fornecido no console de erro do navegador/Firebase.");
    }
    throw new Error("Não foi possível buscar as transações.");
  }
}

export async function updateTransaction(
  id: string,
  transactionData: Partial<Omit<Transaction, "id" | "userId" | "date">> & { date?: Date } // Permite atualização parcial, data opcional
): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    console.error("Erro: Usuário não autenticado tentando atualizar transação.");
    throw new Error("Usuário não autenticado.");
  }
  
  try {
    const transactionDoc = doc(db, TRANSACTIONS_COLLECTION, id);
    
    const dataToUpdate: PartialWithFieldValue<Transaction> = { ...transactionData };
    if (transactionData.date) {
      dataToUpdate.date = Timestamp.fromDate(transactionData.date);
    }

    await updateDoc(transactionDoc, dataToUpdate);
  } catch (e) {
    console.error("Erro ao atualizar transação: ", e);
    throw new Error("Não foi possível atualizar a transação.");
  }
}

export async function deleteTransaction(id: string): Promise<void> {
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
