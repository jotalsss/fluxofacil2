
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PlusCircle, Loader2, Download } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionForm, type TransactionFormSubmitData } from "@/components/transactions/TransactionForm";
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
import { useAuth } from '@/hooks/useAuth';
import { v4 as uuidv4 } from 'uuid';
import { CATEGORIES_MAP } from '@/lib/constants';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';


export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const fetchedTransactions = await getTransactions();
      setTransactions(fetchedTransactions);
    } catch (error: any) {
      console.error("Erro ao buscar transações:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Buscar Transações",
        description: error.message || "Não foi possível carregar as transações do banco de dados.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    } else {
      setTransactions([]);
      setIsLoading(false);
    }
  }, [fetchTransactions, user]);


  const handleAddOrEditTransaction = async (data: TransactionFormSubmitData) => {
    if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Usuário não autenticado." });
      return;
    }
    setIsSubmitting(true);

    try {
      if (data.id && editingTransaction) {
        // Edição de transação existente (incluindo parcela individual)
        const updatedTransactionData: Partial<Transaction> = {
          description: data.description,
          category: data.category,
          tags: data.tags,
        };

        // Para parcelas, não permitimos alterar valor, tipo, mês/ano diretamente aqui.
        // Apenas descrição, categoria e tags são editáveis para uma parcela individual.
        if (!editingTransaction.isInstallment) {
            const transactionDate = new Date(parseInt(data.year), parseInt(data.month) - 1, 1);
            updatedTransactionData.date = transactionDate;
            updatedTransactionData.amount = data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount);
            updatedTransactionData.type = data.type;
        }

        await updateTransaction(data.id, updatedTransactionData);
        toast({ title: "Transação atualizada!", description: `"${data.description}" foi atualizada.` });

      } else {
        // Adição de nova transação
        if (data.isInstallmentPurchase && data.numberOfInstallments && data.numberOfInstallments >= 2 && data.type === 'expense') {
          const originalPurchaseId = uuidv4();
          const totalAmountForDb = Math.abs(data.amount); // Valor total da compra
          const baseInstallmentAmount = parseFloat((totalAmountForDb / data.numberOfInstallments).toFixed(2));
          let sumOfInstallments = 0;

          for (let i = 0; i < data.numberOfInstallments; i++) {
            let currentInstallmentAmount = baseInstallmentAmount;
            if (i === data.numberOfInstallments - 1) { // Ajuste para última parcela
              currentInstallmentAmount = parseFloat((totalAmountForDb - sumOfInstallments).toFixed(2));
            }
            sumOfInstallments += currentInstallmentAmount;

            const startDate = new Date(parseInt(data.year), parseInt(data.month) - 1, 1);
            const transactionDate = new Date(startDate.setMonth(startDate.getMonth() + i));
            
            const installmentDescription = `${data.description} (Parcela ${i + 1}/${data.numberOfInstallments})`;

            const newInstallmentData: Omit<Transaction, 'id' | 'userId'> = {
              date: transactionDate,
              description: installmentDescription,
              amount: -currentInstallmentAmount, // Valor da parcela individual
              type: 'expense',
              category: data.category,
              tags: data.tags,
              isInstallment: true,
              installmentNumber: i + 1,
              totalInstallments: data.numberOfInstallments,
              originalPurchaseId: originalPurchaseId,
              totalPurchaseAmount: totalAmountForDb, // Valor total da compra original
            };
            await addTransaction(newInstallmentData);
          }
          toast({ title: `Compra parcelada adicionada!`, description: `${data.numberOfInstallments} parcelas de "${data.description}" foram criadas.` });
        } else {
          // Transação única
          const transactionDate = new Date(parseInt(data.year), parseInt(data.month) - 1, 1);
          const newTransactionData: Omit<Transaction, 'id' | 'userId'> = {
            date: transactionDate,
            description: data.description,
            amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount),
            type: data.type,
            category: data.category,
            tags: data.tags,
            isInstallment: false,
          };
          await addTransaction(newTransactionData);
          toast({ title: "Transação adicionada!", description: `"${data.description}" foi adicionada.` });
        }
      }
      fetchTransactions();
      setIsFormOpen(false);
      setEditingTransaction(undefined);
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Salvar Transação",
        description: (error as Error).message || "Não foi possível salvar a transação.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openFormForNew = () => {
    setEditingTransaction(undefined);
    setIsFormOpen(true);
  };

  const openFormForEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (transactionId: string) => {
    setTransactionToDelete(transactionId);
  };

  const confirmDelete = async () => {
    if (transactionToDelete) {
      setIsSubmitting(true);
      try {
        const transactionBeingDeleted = transactions.find(t => t.id === transactionToDelete);
        await deleteTransaction(transactionToDelete);
        toast({ title: `Transação excluída`, description: `A ${transactionBeingDeleted?.isInstallment ? 'parcela' : 'transação'} foi excluída com sucesso.` });
        fetchTransactions();
        setTransactionToDelete(null);
      } catch (error) {
        console.error("Erro ao excluir transação:", error);
        toast({
          variant: "destructive",
          title: "Erro ao Excluir Transação",
          description: (error as Error).message || "Não foi possível excluir a transação.",
        });
        setTransactionToDelete(null);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) {
      toast({
        title: "Nenhuma transação para exportar",
        description: "Adicione algumas transações antes de exportar.",
      });
      return;
    }

    const header = [
      "Data", "Descrição", "Categoria", "Tipo", "Valor (R$)", "Tags",
      "É Parcela?", "Parcela Nº", "Total Parcelas", "ID Compra Original", "Valor Total Compra (R$)"
    ];

    const rows = transactions.map(t => {
      const categoryDetails = CATEGORIES_MAP.get(t.category);
      return [
        format(t.date, "MM/yyyy", { locale: ptBR }), // Data da transação/parcela
        t.description.replace(/,/g, ';'), // Evitar problemas com vírgula na descrição
        categoryDetails?.name || t.category,
        t.type === 'income' ? 'Receita' : 'Despesa',
        t.amount.toFixed(2).replace('.', ','), // Valor da transação/parcela
        t.tags.join(' | '),
        t.isInstallment ? 'Sim' : 'Não',
        t.isInstallment && t.installmentNumber ? t.installmentNumber : '',
        t.isInstallment && t.totalInstallments ? t.totalInstallments : '',
        t.isInstallment && t.originalPurchaseId ? t.originalPurchaseId : '',
        t.isInstallment && t.totalPurchaseAmount ? t.totalPurchaseAmount.toFixed(2).replace('.', ',') : ''
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + header.join(',') + "\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transacoes_fluxofacil_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);

    toast({ title: "Exportação Concluída", description: "Suas transações foram exportadas para CSV." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground">Gerencie suas receitas e despesas, incluindo compras parceladas.</p>
        </div>
        <div className="flex items-center space-x-2">
            <Button onClick={handleExportCSV} variant="outline" className="shadow-md" disabled={isSubmitting || isLoading || transactions.length === 0}>
                <Download className="mr-2 h-5 w-5" /> Exportar CSV
            </Button>
            <Button onClick={openFormForNew} className="shadow-md" disabled={isSubmitting}>
                <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Transação
            </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64 space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-lg">Carregando transações...</p>
        </div>
      ) : (
        <TransactionList
          transactions={transactions}
          onEdit={openFormForEdit}
          onDelete={handleDeleteRequest}
          onAddTransaction={openFormForNew}
        />
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => { if(!open && !isSubmitting) { setIsFormOpen(false); setEditingTransaction(undefined); } else if(open) { setIsFormOpen(true); }}}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTransaction ? (editingTransaction.isInstallment ? `Detalhes da Parcela` : "Editar Transação") : "Adicionar Nova Transação"}</DialogTitle>
            <DialogDescription>
              {editingTransaction ? (editingTransaction.isInstallment ? `Visualizando detalhes. A edição completa de compras parceladas requer exclusão e recriação.` : "Atualize os detalhes da sua transação.") : "Insira os detalhes da sua nova transação, incluindo opções de parcelamento para despesas."}
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            onSubmit={handleAddOrEditTransaction}
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
              {transactions.find(t => t.id === transactionToDelete)?.isInstallment && (
                <span className="block mt-2 font-semibold text-yellow-400">Atenção: Esta é uma parcela. Excluir isto não afetará as outras parcelas da mesma compra original.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTransactionToDelete(null)} disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

