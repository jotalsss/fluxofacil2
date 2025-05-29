
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

// Expanded dummy data for filtering
const ALL_TRANSACTIONS_DATA = [
  { id: 't1', description: 'Salário Julho', amount: 5000, type: 'income', date: '2023-07-25', category: 'Salário', tags: ['trabalho'] },
  { id: 't2', description: 'Supermercado QLP', amount: 150, type: 'expense', date: '2023-07-24', category: 'Compras', tags: ['comida'] },
  { id: 't3', description: 'Assinatura Streaming', amount: 45, type: 'expense', date: '2023-07-23', category: 'Entretenimento', tags: ['lazer'] },
  { id: 't4', description: 'Aluguel Maio', amount: 1200, type: 'expense', date: '2023-05-05', category: 'Moradia', tags: ['moradia'] },
  { id: 't5', description: 'Salário Maio', amount: 5200, type: 'income', date: '2023-05-01', category: 'Salário', tags: ['trabalho'] },
  { id: 't6', description: 'Restaurante Jan', amount: 180, type: 'expense', date: '2024-01-10', category: 'Alimentação', tags: ['lazer', 'jantar'] },
  { id: 't7', description: 'Freelance Jan', amount: 800, type: 'income', date: '2024-01-12', category: 'Salário', tags: ['trabalho', 'freela'] },
  { id: 't8', description: 'Conta de Luz Julho', amount: 120, type: 'expense', date: '2023-07-15', category: 'Contas', tags: ['casa'] },
  { id: 't9', description: 'Presente Aniversário Maio', amount: 100, type: 'expense', date: '2023-05-20', category: 'Presentes', tags: ['social'] },
  { id: 't10', description: 'Investimento Jan', amount: 500, type: 'expense', date: '2024-01-05', category: 'Investimentos', tags: ['finanças'] },
];

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

  const [allTransactions, setAllTransactions] = useState<Array<any & { date: Date }>>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Array<any & { date: Date }>>([]);
  const [currentTotalIncome, setCurrentTotalIncome] = useState(0);
  const [currentTotalExpenses, setCurrentTotalExpenses] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [isInitialFilterDone, setIsInitialFilterDone] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const transactionsWithDateObjects = ALL_TRANSACTIONS_DATA.map(t => ({
        ...t,
        date: new Date(t.date), // Parses YYYY-MM-DD as UTC midnight
      }));
      setAllTransactions(transactionsWithDateObjects);
    }
  }, [isClient]);

  const applyFiltersAndRecalculate = useCallback(() => {
    if (!allTransactions.length) return;

    const monthToFilter = parseInt(selectedMonth, 10);
    const yearToFilter = parseInt(selectedYear, 10);

    const newFilteredTransactions = allTransactions.filter(transaction => {
      // Use getUTCMonth() and getUTCFullYear() for consistent date part extraction
      return transaction.date.getUTCMonth() + 1 === monthToFilter && transaction.date.getUTCFullYear() === yearToFilter;
    });

    setFilteredTransactions(newFilteredTransactions);

    const newTotalIncome = newFilteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const newTotalExpenses = newFilteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0); // Amounts are positive in source data

    setCurrentTotalIncome(newTotalIncome);
    setCurrentTotalExpenses(newTotalExpenses); // Display as positive
    setCurrentBalance(newTotalIncome - newTotalExpenses);
  }, [allTransactions, selectedMonth, selectedYear]);

  // Effect for initial data load and initial filtering
  useEffect(() => {
    if (isClient && allTransactions.length > 0 && !isInitialFilterDone) {
      applyFiltersAndRecalculate();
      setIsInitialFilterDone(true);
    }
  }, [isClient, allTransactions, applyFiltersAndRecalculate, isInitialFilterDone]);


  const handleFilterButtonClick = () => {
    applyFiltersAndRecalculate();
  };

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
            {/* <p className="text-xs text-muted-foreground">+10% do último mês</p> */}
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R${currentTotalExpenses.toFixed(2)}</div>
            {/* <p className="text-xs text-muted-foreground">+5% do último mês</p> */}
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
              {filteredTransactions.length > 0 ? filteredTransactions.map((transaction) => (
                <li key={transaction.id} className="flex justify-between items-center p-3 bg-secondary/30 rounded-md shadow-sm transition-all duration-200 ease-in-out hover:bg-secondary/60">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.category} - {isClient ? transaction.date.toLocaleDateString() : '...'}
                    </p>
                  </div>
                  <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}R${transaction.amount.toFixed(2)}
                  </p>
                </li>
              )) : (
                <p className="text-muted-foreground text-center py-4">Nenhuma transação para este período.</p>
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
                alt="Placeholder chart for spending overview"
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

    