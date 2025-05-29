
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, List, CalendarDays } from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CATEGORIES_MAP } from '@/lib/constants';
import type { Transaction } from '@/lib/types';
import { getTransactions } from '@/lib/firebase/firestoreService';
import { useToast } from '@/hooks/use-toast';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
const months = [
  { value: "1", label: "Janeiro" }, { value: "2", label: "Fevereiro" }, { value: "3", label: "Março" },
  { value: "4", label: "Abril" }, { value: "5", label: "Maio" }, { value: "6", label: "Junho" },
  { value: "7", label: "Julho" }, { value: "8", label: "Agosto" }, { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" }, { value: "11", label: "Novembro" }, { value: "12", label: "Dezembro" }
];

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => (new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState<string>(() => new Date().getFullYear().toString());

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [currentTotalIncome, setCurrentTotalIncome] = useState(0);
  const [currentTotalExpenses, setCurrentTotalExpenses] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialFilterDone, setIsInitialFilterDone] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchAndSetTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedTransactions = await getTransactions();
      // getTransactions já deve retornar datas como objetos Date
      setAllTransactions(fetchedTransactions);
    } catch (error) {
      console.error("Erro ao buscar transações para o dashboard:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível buscar as transações do banco de dados.",
      });
      setAllTransactions([]); 
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isClient) {
      fetchAndSetTransactions();
    }
  }, [isClient, fetchAndSetTransactions]);


  const applyFiltersAndRecalculate = useCallback(() => {
    if (!allTransactions.length && !isLoading) { // Não filtrar se não há transações ou se ainda está carregando
      setFilteredTransactions([]);
      setCurrentTotalIncome(0);
      setCurrentTotalExpenses(0);
      setCurrentBalance(0);
      return;
    }

    const monthToFilter = parseInt(selectedMonth, 10);
    const yearToFilter = parseInt(selectedYear, 10);

    const newFilteredTransactions = allTransactions.filter(transaction => {
      // transaction.date já deve ser um objeto Date
      const transactionDate = transaction.date; 
      return transactionDate.getUTCMonth() + 1 === monthToFilter && transactionDate.getUTCFullYear() === yearToFilter;
    });

    setFilteredTransactions(newFilteredTransactions);

    const newTotalIncome = newFilteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const newTotalExpenses = newFilteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0); 

    setCurrentTotalIncome(newTotalIncome);
    setCurrentTotalExpenses(newTotalExpenses); 
    setCurrentBalance(newTotalIncome + newTotalExpenses); // Soma de income (positivo) e expenses (negativo)
  }, [allTransactions, selectedMonth, selectedYear, isLoading]);


  useEffect(() => {
    if (isClient && !isLoading && !isInitialFilterDone) {
      applyFiltersAndRecalculate();
      setIsInitialFilterDone(true);
    }
  }, [isClient, isLoading, allTransactions, applyFiltersAndRecalculate, isInitialFilterDone]);


  const handleFilterButtonClick = () => {
    if (isLoading) {
        toast({ title: "Aguarde", description: "Carregando transações..."});
        return;
    }
    applyFiltersAndRecalculate();
  };

  if (isLoading && isClient && !allTransactions.length) { // Mostrar carregando apenas se não houver transações ainda
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground text-lg">Carregando dados do dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Visão Geral</h2>
        <div className="flex items-center space-x-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[130px] shadow-sm">
              <CalendarDays className="h-4 w-4 mr-2 opacity-70" />
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month.value} value={String(month.value)}>{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px] shadow-sm">
               <CalendarDays className="h-4 w-4 mr-2 opacity-70" />
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleFilterButtonClick} className="shadow-md">Filtrar</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R${currentTotalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R${Math.abs(currentTotalExpenses).toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R${currentBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Saldo atual filtrado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="transition-all duration-300 ease-in-out hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <List className="h-5 w-5 mr-2 text-primary" />
              Transações Recentes (Filtradas)
            </CardTitle>
            <CardDescription>Transações registradas para o período selecionado.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(!isLoading && filteredTransactions.length > 0) ? filteredTransactions.map((transaction) => {
                const categoryDetails = CATEGORIES_MAP.get(transaction.category);
                const CategoryIcon = categoryDetails?.icon;
                // transaction.date já deve ser um objeto Date
                const transactionDate = transaction.date;
                return (
                <li key={transaction.id} className="flex justify-between items-center p-3 bg-secondary/30 rounded-md shadow-sm transition-all duration-200 ease-in-out hover:bg-secondary/60">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {categoryDetails?.name || transaction.category} - {isClient ? format(transactionDate, 'MMMM/yyyy', { locale: ptBR }) : '...'}
                    </p>
                  </div>
                  <p className={`font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount >= 0 ? '+' : ''}R${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </li>
              )}) : (
                <p className="text-muted-foreground text-center py-4">
                  {isLoading && !allTransactions.length ? "Carregando transações..." : "Nenhuma transação para este período."}
                </p>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center transition-all duration-300 ease-in-out hover:shadow-lg">
          <CardHeader>
            <CardTitle>Visão Geral dos Gastos</CardTitle>
            <CardDescription>Representação visual dos seus hábitos de consumo.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center w-full">
             <Image
                src="https://placehold.co/600x400.png"
                alt="Gráfico de exemplo da visão geral de gastos"
                width={600}
                height={400}
                data-ai-hint="finance chart"
                className="rounded-md object-cover"
              />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

