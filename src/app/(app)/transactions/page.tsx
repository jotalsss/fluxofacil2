
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  addTransaction, 
  getTransactions, 
  updateTransaction, 
  deleteTransaction 
} from '@/lib/firebase/firestoreService';
import { useAuth } from '@/hooks/useAuth'; // Importar useAuth

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth(); // Obter o usuário autenticado

  const fetchTransactions = useCallback(async () => {
    if (!user) { // Não buscar se não houver usuário
      setTransactions([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const fetchedTransactions = await getTransactions();
      setTransactions(fetchedTransactions);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar transações",
        description: "Não foi possível carregar as transações do banco de dados.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user]); // Adicionar user como dependência

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Omit<Transaction, 'id' | 'date' | 'userId' | 'amount'> & { amount: number, month: string, year: string }
  // A função onSubmit do TransactionForm agora tem 'id?' e 'tags: string[]' como definido no form
  const handleAddTransaction = async (data: Omit<Transaction, 'id' | 'date' | 'userId' | 'amount'> & { amount: number, month: string, year: string, tags: string[] }) => {
    if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Usuário não autenticado." });
      return;
    }
    const transactionDate = new Date(parseInt(data.year), parseInt(data.month) - 1, 1);
    // userId será adicionado pelo firestoreService
    const newTransactionData = {
      date: transactionDate,
      description: data.description,
      amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount),
      type: data.type,
      category: data.category,
      tags: data.tags, 
    };
    try {
      await addTransaction(newTransactionData);
      toast({ title: "Transação adicionada!", description: `"${data.description}" foi adicionada.` });
      fetchTransactions(); 
      setIsFormOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar transação",
        description: "Não foi possível salvar a nova transação.",
      });
    }
  };
  
  // Omit<Transaction, 'id' | 'date' | 'userId' | 'amount'> & { id: string, amount: number, month: string, year: string, tags: string[] }
  const handleEditTransaction = async (data: Omit<Transaction, 'date' | 'userId' | 'amount'> & { id: string, amount: number, month: string, year: string, tags: string[] }) => {
    if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Usuário não autenticado." });
      return;
    }
    const transactionDate = new Date(parseInt(data.year), parseInt(data.month) - 1, 1);
    // userId não é passado para updateTransaction; firestoreService não o altera.
    // As regras do Firestore devem garantir que o usuário só edite suas próprias transações.
    const updatedTransactionData = {
      date: transactionDate,
      description: data.description,
      amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount),
      type: data.type,
      category: data.category,
      tags: data.tags,
    };
    try {
      await updateTransaction(data.id, updatedTransactionData);
      toast({ title: "Transação atualizada!", description: `"${data.description}" foi atualizada.` });
      fetchTransactions(); 
      setIsFormOpen(false);
      setEditingTransaction(undefined);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar transação",
        description: "Não foi possível salvar as alterações.",
      });
    }
  };

  const openFormForNew = () => {
    setEditingTransaction(undefined);
    setIsFormOpen(true);
  };

  const openFormForEdit = (transaction: Transaction) => {
    // Não é mais necessário criar formInitialData, pois o TransactionForm espera Transaction
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };
  
  const handleDeleteRequest = (transactionId: string) => {
    setTransactionToDelete(transactionId);
  };

  const confirmDelete = async () => {
    if (transactionToDelete) {
      try {
        await deleteTransaction(transactionToDelete);
        toast({ title: "Transação excluída", description: "A transação foi excluída com sucesso." });
        fetchTransactions(); 
        setTransactionToDelete(null);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Erro ao excluir transação",
          description: "Não foi possível excluir a transação.",
        });
        setTransactionToDelete(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground">Gerencie suas receitas e despesas.</p>
        </div>
        <Button onClick={openFormForNew} className="shadow-md">
          <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Transação
        </Button>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-10">Carregando transações...</p>
      ) : (
        <TransactionList
          transactions={transactions}
          onEdit={openFormForEdit}
          onDelete={handleDeleteRequest}
          onAddTransaction={openFormForNew}
        />
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => { if(!open) { setIsFormOpen(false); setEditingTransaction(undefined); } else { setIsFormOpen(true); }}}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTransaction ? "Editar Transação" : "Adicionar Nova Transação"}</DialogTitle>
            <DialogDescription>
              {editingTransaction ? "Atualize os detalhes da sua transação." : "Insira os detalhes da sua nova transação."}
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
            initialData={editingTransaction} 
            onClose={() => { setIsFormOpen(false); setEditingTransaction(undefined);}}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!transactionToDelete} onOpenChange={(open) => {if(!open) setTransactionToDelete(null)}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir esta transação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a transação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
