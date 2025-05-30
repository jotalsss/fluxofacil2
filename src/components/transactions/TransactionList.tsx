
"use client";

import type { Transaction } from "@/lib/types";
import { CATEGORIES_MAP } from "@/lib/constants";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit2, Trash2, PlusCircle, ArrowUpDown, Info } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
  onAddTransaction: () => void;
}

export function TransactionList({ transactions, onEdit, onDelete, onAddTransaction }: TransactionListProps) {
    const [sortConfig, setSortConfig] = React.useState<{ key: keyof Transaction | null; direction: 'ascending' | 'descending' } | null>(null);

    const sortedTransactions = React.useMemo(() => {
        let sortableItems = [...transactions];
        if (sortConfig !== null && sortConfig.key) {
          sortableItems.sort((a, b) => {
            const valA = a[sortConfig.key!];
            const valB = b[sortConfig.key!];

            if (valA === null || valA === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valB === null || valB === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;

            if (valA < valB) {
              return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (valA > valB) {
              return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
          });
        }
        return sortableItems;
    }, [transactions, sortConfig]);

    const requestSort = (key: keyof Transaction) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: keyof Transaction) => {
        if (!sortConfig || sortConfig.key !== key) {
          return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
        }
        return sortConfig.direction === 'ascending' ? '🔼' : '🔽';
    };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-semibold mb-2">Nenhuma transação ainda.</h3>
        <p className="text-muted-foreground mb-4">Comece adicionando sua primeira transação.</p>
        <Button onClick={onAddTransaction}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Transação
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
    <div className="rounded-md border shadow-sm bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer" onClick={() => requestSort('date')}>Mês/Ano {getSortIndicator('date')}</TableHead>
            <TableHead className="cursor-pointer" onClick={() => requestSort('description')}>Descrição {getSortIndicator('description')}</TableHead>
            <TableHead className="cursor-pointer" onClick={() => requestSort('category')}>Categoria {getSortIndicator('category')}</TableHead>
            <TableHead className="cursor-pointer text-right" onClick={() => requestSort('amount')}>Valor (R$) {getSortIndicator('amount')}</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTransactions.map((transaction) => {
            const categoryDetails = CATEGORIES_MAP.get(transaction.category);
            const CategoryIcon = categoryDetails?.icon;

            const displayDescription = transaction.description;

            return (
              <TableRow key={transaction.id}>
                <TableCell>{format(transaction.date, "MMMM/yyyy", { locale: ptBR })}</TableCell>
                <TableCell className="font-medium">
                  {displayDescription}
                  {transaction.isInstallment && transaction.totalPurchaseAmount && (
                     <Tooltip>
                       <TooltipTrigger asChild>
                         <button type="button" tabIndex={-1} className="align-middle">
                            <Info className="ml-1 h-3 w-3 text-muted-foreground inline-block cursor-help" />
                         </button>
                       </TooltipTrigger>
                       <TooltipContent side="top">
                         <p>
                           Valor total da compra original: R$ {transaction.totalPurchaseAmount.toFixed(2)}
                         </p>
                       </TooltipContent>
                     </Tooltip>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {CategoryIcon && <CategoryIcon className="mr-2 h-4 w-4 text-muted-foreground" />}
                    {categoryDetails?.name || transaction.category}
                  </div>
                </TableCell>
                <TableCell className={`text-right font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.amount >= 0 ? '+' : ''}R${Math.abs(transaction.amount).toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {transaction.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="font-normal">{tag}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Ações</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(transaction)} >
                        <Edit2 className="mr-2 h-4 w-4" />
                        {transaction.isInstallment ? "Editar (Detalhes)" : "Editar"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(transaction.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir {transaction.isInstallment ? 'Parcela' : ""}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
    </TooltipProvider>
  );
}
