
// @ts-nocheck remove this ts-nocheck comment when you have fixed all the errors
"use client";

import React, { useState, useEffect } from 'react';
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
} from "@/components/ui/alert-dialog"

const MOCK_TRANSACTIONS: Transaction[] = [
    { id: '1', date: new Date('2024-07-01'), description: 'Salário Mensal', amount: 5000, type: 'income', category: 'salary', tags: ['trabalho', 'folha de pagamento'] },
    { id: '2', date: new Date('2024-07-01'), description: 'Compras no Supermercado', amount: -150.75, type: 'expense', category: 'groceries', tags: ['comida', 'casa'] },
    { id: '3', date: new Date('2024-06-01'), description: 'Jantar com Amigos', amount: -85.50, type: 'expense', category: 'food_dining', tags: ['social', 'lazer'] },
    { id: '4', date: new Date('2024-06-01'), description: 'Conta de Luz', amount: -120.00, type: 'expense', category: 'utilities', tags: ['casa', 'contas'] },
    { id: '5', date: new Date('2024-05-01'), description: 'Pagamento Projeto Freelance', amount: 750, type: 'income', category: 'salary', tags: ['trabalho', 'freelance'] },
];


export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedTransactions = localStorage.getItem('fluxoFacilTransactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions).map((t: any) => ({...t, date: new Date(t.date)})));
    } else {
      setTransactions(MOCK_TRANSACTIONS);
    }
  }, []);

  useEffect(() => {
    if (transactions.length > 0 || localStorage.getItem('fluxoFacilTransactions')) { 
        localStorage.setItem('fluxoFacilTransactions', JSON.stringify(transactions));
    }
  }, [transactions]);


  const handleAddTransaction = (data: Omit<Transaction, 'id' | 'amount'> & { amount: number, month: string, year: string }) => {
    const transactionDate = new Date(parseInt(data.year), parseInt(data.month) - 1, 1);
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      date: transactionDate,
      description: data.description,
      amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount),
      type: data.type,
      category: data.category,
      tags: data.tags || [],
    };
    setTransactions((prev) => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsFormOpen(false);
  };

  const handleEditTransaction = (data: Omit<Transaction, 'id' | 'amount'> & { id: string, amount: number, month: string, year: string }) => {
    const transactionDate = new Date(parseInt(data.year), parseInt(data.month) - 1, 1);
    const updatedTransaction: Transaction = {
      id: data.id,
      date: transactionDate,
      description: data.description,
      amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount),
      type: data.type,
      category: data.category,
      tags: data.tags || [],
    };
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t)).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    setIsFormOpen(false);
    setEditingTransaction(undefined);
  };

  const openFormForNew = () => {
    setEditingTransaction(undefined);
    setIsFormOpen(true);
  };

  const openFormForEdit = (transaction: Transaction) => {
    // Pass the full transaction object to the form
    // The form will handle extracting month/year from the date for its own state
    const formInitialData = { 
        ...transaction, 
        amount: Math.abs(transaction.amount) // form expects positive amount
    };
    setEditingTransaction(formInitialData);
    setIsFormOpen(true);
  };
  
  const handleDeleteRequest = (transactionId: string) => {
    setTransactionToDelete(transactionId);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      setTransactions((prev) => prev.filter((t) => t.id !== transactionToDelete));
      toast({ title: "Transação excluída", description: "A transação foi excluída com sucesso." });
      setTransactionToDelete(null);
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

      <TransactionList
        transactions={transactions}
        onEdit={openFormForEdit}
        onDelete={handleDeleteRequest}
        onAddTransaction={openFormForNew}
      />

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
            initialData={editingTransaction} // Pass the full transaction for editing
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
