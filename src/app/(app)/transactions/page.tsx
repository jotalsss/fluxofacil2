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
    { id: '1', date: new Date('2024-07-15'), description: 'Monthly Salary', amount: 5000, type: 'income', category: 'salary', tags: ['work', 'payroll'] },
    { id: '2', date: new Date('2024-07-16'), description: 'Groceries from SuperMart', amount: -150.75, type: 'expense', category: 'groceries', tags: ['food', 'home'] },
    { id: '3', date: new Date('2024-07-17'), description: 'Dinner with Friends', amount: -85.50, type: 'expense', category: 'food_dining', tags: ['social', 'leisure'] },
    { id: '4', date: new Date('2024-07-18'), description: 'Electricity Bill', amount: -120.00, type: 'expense', category: 'utilities', tags: ['home', 'bills'] },
    { id: '5', date: new Date('2024-07-18'), description: 'Freelance Project Payment', amount: 750, type: 'income', category: 'salary', tags: ['work', 'freelance'] },
];


export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load transactions from local storage or API in a real app
    // For now, using mock data if local storage is empty
    const storedTransactions = localStorage.getItem('fluxoFacilTransactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions).map((t: Transaction) => ({...t, date: new Date(t.date)})));
    } else {
      setTransactions(MOCK_TRANSACTIONS);
    }
  }, []);

  useEffect(() => {
    if (transactions.length > 0 || localStorage.getItem('fluxoFacilTransactions')) { // Avoid writing empty MOCK_TRANSACTIONS on first load if nothing was stored
        localStorage.setItem('fluxoFacilTransactions', JSON.stringify(transactions));
    }
  }, [transactions]);


  const handleAddTransaction = (data: Transaction) => {
    setTransactions((prev) => [data, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsFormOpen(false);
  };

  const handleEditTransaction = (data: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === data.id ? data : t)).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    setIsFormOpen(false);
    setEditingTransaction(undefined);
  };

  const openFormForNew = () => {
    setEditingTransaction(undefined);
    setIsFormOpen(true);
  };

  const openFormForEdit = (transaction: Transaction) => {
    // Ensure amount is positive for the form
    const formTransaction = { ...transaction, amount: Math.abs(transaction.amount) };
    setEditingTransaction(formTransaction);
    setIsFormOpen(true);
  };
  
  const handleDeleteRequest = (transactionId: string) => {
    setTransactionToDelete(transactionId);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      setTransactions((prev) => prev.filter((t) => t.id !== transactionToDelete));
      toast({ title: "Transaction deleted", description: "The transaction has been successfully deleted." });
      setTransactionToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Manage your income and expenses.</p>
        </div>
        <Button onClick={openFormForNew} className="shadow-md">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Transaction
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
            <DialogTitle>{editingTransaction ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
            <DialogDescription>
              {editingTransaction ? "Update the details of your transaction." : "Enter the details of your new transaction."}
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
            <AlertDialogTitle>Are you sure you want to delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
