
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, List, CalendarDays, Loader2, PieChart as PieChartIcon } from "lucide-react";
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
import { useAuth } from '@/hooks/useAuth';

import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "@/components/ui/chart";
import { cn } from '@/lib/utils';


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
  const { user } = useAuth();

  const [pieChartData, setPieChartData] = useState<any[]>([]);
  const [pieChartConfig, setPieChartConfig] = useState<ChartConfig>({});


  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchAndSetTransactions = useCallback(async () => {
    if (!user) {
      setAllTransactions([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const fetchedTransactions = await getTransactions();
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
  }, [toast, user]);

  useEffect(() => {
    if (isClient && user) { 
      fetchAndSetTransactions();
    } else if (!user && isClient) {
      setIsLoading(false); // No user, stop loading
      setAllTransactions([]);
    }
  }, [isClient, user, fetchAndSetTransactions]);


  const applyFiltersAndRecalculate = useCallback(() => {
    if (!allTransactions.length && !isLoading) { 
      setFilteredTransactions([]);
      setCurrentTotalIncome(0);
      setCurrentTotalExpenses(0);
      setCurrentBalance(0);
      return;
    }

    const monthToFilter = parseInt(selectedMonth, 10);
    const yearToFilter = parseInt(selectedYear, 10);

    const newFilteredTransactions = allTransactions.filter(transaction => {
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
    setCurrentBalance(newTotalIncome + newTotalExpenses);
  }, [allTransactions, selectedMonth, selectedYear, isLoading]);


  useEffect(() => {
    if (isClient && !isLoading && !isInitialFilterDone && (allTransactions.length > 0 || !user)) {
      applyFiltersAndRecalculate();
      setIsInitialFilterDone(true);
    } else if (isClient && !isLoading && allTransactions.length === 0 && !isInitialFilterDone && user) {
      setFilteredTransactions([]);
      setCurrentTotalIncome(0);
      setCurrentTotalExpenses(0);
      setCurrentBalance(0);
      setIsInitialFilterDone(true);
    }
  }, [isClient, isLoading, allTransactions, applyFiltersAndRecalculate, isInitialFilterDone, user]);

  useEffect(() => {
    if (filteredTransactions.length > 0) {
      const expenseByCategory = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, transaction) => {
          const categoryId = transaction.category;
          const categoryName = CATEGORIES_MAP.get(categoryId)?.name || categoryId;
          const currentAmount = acc[categoryId]?.value || 0;
          acc[categoryId] = {
            name: categoryName,
            value: currentAmount + Math.abs(transaction.amount),
            id: categoryId,
          };
          return acc;
        }, {} as Record<string, { name: string, value: number, id: string }>);
  
      const chartData = Object.values(expenseByCategory).sort((a,b) => b.value - a.value); // Sort for consistent color assignment
      setPieChartData(chartData);
  
      const newChartConfig = chartData.reduce((config, item, index) => {
        config[item.id] = {
          label: item.name,
          color: `hsl(var(--chart-${(index % 5) + 1}))`, // Cycle through 5 chart colors
        };
        return config;
      }, {} as ChartConfig);
      setPieChartConfig(newChartConfig);
  
    } else {
      setPieChartData([]);
      setPieChartConfig({});
    }
  }, [filteredTransactions]);


  const handleFilterButtonClick = () => {
    if (isLoading && user) { // only show toast if user is logged in and loading
        toast({ title: "Aguarde", description: "Carregando transações..."});
        return;
    }
    applyFiltersAndRecalculate();
  };

  if (isLoading && isClient && user) { 
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                   {(!user && !isLoading) ? "Faça login para ver suas transações." : "Nenhuma transação para este período."}
                </p>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 ease-in-out hover:shadow-lg flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="mr-2 h-5 w-5 text-primary" />
              Visão Geral dos Gastos
            </CardTitle>
            <CardDescription>Representação visual dos seus hábitos de consumo por categoria.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-4">
            {pieChartData.length > 0 ? (
              <ChartContainer config={pieChartConfig} className="h-[300px] w-full">
                <RechartsPieChart accessibilityLayer>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel nameKey="name" indicator="dot" />}
                  />
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name" // Used by ChartTooltipContent
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    labelLine={false}
                  >
                    {pieChartData.map((entry) => (
                      <Cell key={`cell-${entry.id}`} fill={`var(--color-${entry.id})`} />
                    ))}
                  </Pie>
                   {/* @ts-ignore TODO: Fix ChartLegendContent type or props */}
                  <ChartLegend content={<ChartLegendContent nameKey="name"/>} />
                </RechartsPieChart>
              </ChartContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <PieChartIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {(!user && !isLoading) ? "Faça login para ver seus gastos." : "Nenhum gasto para exibir no gráfico neste período."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

