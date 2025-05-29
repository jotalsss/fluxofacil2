
"use client"; 

import { useState, useEffect } from 'react';
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

// Dummy data for now
const totalIncome = 5000;
const totalExpenses = 2500;
const balance = totalIncome - totalExpenses;

const staticRecentTransactions = [
  { id: '1', description: 'Salary Deposit', amount: 3000, type: 'income', date: '2024-07-25', category: 'Salary' },
  { id: '2', description: 'Groceries', amount: 75, type: 'expense', date: '2024-07-24', category: 'Groceries' },
  { id: '3', description: 'Netflix Subscription', amount: 15, type: 'expense', date: '2024-07-23', category: 'Entertainment' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
const months = [
  { value: 1, label: "Janeiro" }, { value: 2, label: "Fevereiro" }, { value: 3, label: "Março" },
  { value: 4, label: "Abril" }, { value: 5, label: "Maio" }, { value: 6, label: "Junho" },
  { value: 7, label: "Julho" }, { value: 8, label: "Agosto" }, { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" }, { value: 11, label: "Novembro" }, { value: 12, label: "Dezembro" }
];

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth() + 1 + "");
  const [selectedYear, setSelectedYear] = useState<string>(currentYear + "");

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handler for filter changes (can be expanded later)
  const handleFilterChange = () => {
    console.log("Filtrar por:", selectedMonth, selectedYear);
    // Future: Implement actual data filtering logic here
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
          <Button onClick={handleFilterChange} className="shadow-md">Filtrar</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R${totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+10% do último mês</p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+5% do último mês</p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R${balance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Saldo atual da conta</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="transition-all duration-300 ease-in-out hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <List className="h-5 w-5 mr-2 text-primary" />
              Transações Recentes
            </CardTitle>
            <CardDescription>Últimas transações registradas.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {staticRecentTransactions.map((transaction) => (
                <li key={transaction.id} className="flex justify-between items-center p-3 bg-secondary/30 rounded-md shadow-sm transition-all duration-200 ease-in-out hover:bg-secondary/60">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.category} - {isClient ? new Date(transaction.date).toLocaleDateString() : '...'}
                    </p>
                  </div>
                  <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}R${transaction.amount.toFixed(2)}
                  </p>
                </li>
              ))}
               {staticRecentTransactions.length === 0 && (
                <p className="text-muted-foreground text-center py-4">Nenhuma transação recente.</p>
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

