
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Info, Loader2 } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const currentFullYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentFullYear - 5 + i);
const months = [
  { value: "1", label: "Janeiro" }, { value: "2", label: "Fevereiro" }, { value: "3", label: "Março" },
  { value: "4", label: "Abril" }, { value: "5", label: "Maio" }, { value: "6", label: "Junho" },
  { value: "7", label: "Julho" }, { value: "8", label: "Agosto" }, { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" }, { value: "11", label: "Novembro" }, { value: "12", label: "Dezembro" }
];

const transactionFormSchema = z.object({
  month: z.string().min(1, "O mês é obrigatório."),
  year: z.string().min(4, "O ano é obrigatório."),
  description: z.string().min(1, "A descrição é obrigatória."),
  amount: z.coerce.number().positive("O valor deve ser positivo."),
  type: z.enum(["income", "expense"], {
    required_error: "O tipo da transação é obrigatório.",
  }),
  category: z.string().min(1, "A categoria é obrigatória."),
  tags: z.string().optional(),
  isInstallmentPurchase: z.boolean().default(false).optional(),
  numberOfInstallments: z.coerce.number().optional(),
}).refine(data => {
  if (data.isInstallmentPurchase && data.type === 'expense') {
    return !!data.numberOfInstallments && data.numberOfInstallments >= 2;
  }
  return true;
}, {
  message: "Número de parcelas é obrigatório para despesa parcelada e deve ser no mínimo 2.",
  path: ["numberOfInstallments"],
}).refine(data => {
    if (data.isInstallmentPurchase && data.type === 'income') {
        return false;
    }
    return true;
}, {
    message: "Não é possível parcelar receitas.",
    path: ["isInstallmentPurchase"],
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export type TransactionFormSubmitData = Omit<Transaction, 'id' | 'date' | 'userId' | 'amount' | 'isInstallment' | 'installmentNumber' | 'totalInstallments' | 'originalPurchaseId' | 'totalPurchaseAmount'> & {
    id?: string;
    amount: number;
    month: string;
    year: string;
    tags: string[];
    isInstallmentPurchase?: boolean;
    numberOfInstallments?: number;
};


interface TransactionFormProps {
  onSubmit: (data: TransactionFormSubmitData) => Promise<void>;
  initialData?: Transaction;
  onClose: () => void;
}

const getNextMonthYear = () => {
  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() + 1);
  return {
    month: String(currentDate.getMonth() + 1), // getMonth is 0-indexed, +1 for 1-indexed month
    year: String(currentDate.getFullYear()),
  };
};

export function TransactionForm({ onSubmit, initialData, onClose }: TransactionFormProps) {
  const { toast } = useToast();
  const [calculatedInstallmentAmount, setCalculatedInstallmentAmount] = useState<number | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const defaultNewTransactionDate = getNextMonthYear();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      month: initialData?.date ? String(initialData.date.getUTCMonth() + 1) : defaultNewTransactionDate.month,
      year: initialData?.date ? String(initialData.date.getUTCFullYear()) : defaultNewTransactionDate.year,
      description: initialData?.description || "",
      amount: initialData?.isInstallment && initialData.totalPurchaseAmount
                ? Math.abs(initialData.totalPurchaseAmount)
                : (initialData?.amount ? String(Math.abs(initialData.amount)) : ""),
      type: initialData?.type || "expense",
      category: initialData?.category || "",
      tags: initialData?.tags?.join(", ") || "",
      isInstallmentPurchase: initialData?.isInstallment || false,
      numberOfInstallments: initialData?.totalInstallments ? String(initialData.totalInstallments) : "",
    },
  });

  const watchIsInstallmentPurchase = form.watch("isInstallmentPurchase");
  const watchAmount = form.watch("amount");
  const watchNumberOfInstallments = form.watch("numberOfInstallments");
  const watchType = form.watch("type");


  useEffect(() => {
    if (watchIsInstallmentPurchase && watchType === 'expense' && Number(watchAmount) > 0 && Number(watchNumberOfInstallments) >= 2) {
      setCalculatedInstallmentAmount(Number(watchAmount) / Number(watchNumberOfInstallments));
    } else {
      setCalculatedInstallmentAmount(null);
    }
  }, [watchIsInstallmentPurchase, watchAmount, watchNumberOfInstallments, watchType]);

  useEffect(() => {
    const isEditingInstallment = !!initialData?.isInstallment;
    const nextMonthDate = getNextMonthYear();

    let monthToSet: string;
    let yearToSet: string;

    if (initialData?.date) {
      monthToSet = String(initialData.date.getUTCMonth() + 1);
      yearToSet = String(initialData.date.getUTCFullYear());
    } else {
      monthToSet = nextMonthDate.month;
      yearToSet = nextMonthDate.year;
    }

    let amountToSet: string | number = "";
     if (initialData) {
        if (initialData.isInstallment && initialData.totalPurchaseAmount) {
            amountToSet = Math.abs(initialData.totalPurchaseAmount);
        } else if (initialData.amount) { 
            amountToSet = Math.abs(initialData.amount);
        }
    }

    const installmentsToSet = initialData?.totalInstallments ? String(initialData.totalInstallments) : "";

    let descriptionToSet = initialData?.description || "";
    if (isEditingInstallment && initialData) {
        const pattern = / \(Parcela \d+\/\d+\)$/;
        descriptionToSet = initialData.description.replace(pattern, '');
    }

    form.reset({
        month: monthToSet,
        year: yearToSet,
        description: descriptionToSet,
        amount: amountToSet === "" ? "" : Number(amountToSet),
        type: initialData?.type || "expense",
        category: initialData?.category || "",
        tags: initialData?.tags?.join(", ") || "",
        isInstallmentPurchase: !!(initialData?.isInstallment),
        numberOfInstallments: installmentsToSet === "" ? "" : Number(installmentsToSet),
    });
  }, [initialData, form]);


  const handleFormSubmit = async (data: TransactionFormValues) => {
    setIsSubmittingForm(true);
    const submitData: TransactionFormSubmitData = {
      ...(initialData?.id && { id: initialData.id }),
      month: data.month,
      year: data.year,
      description: data.description,
      amount: Number(data.amount),
      type: data.type,
      category: data.category,
      tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()).filter(tag => tag) : [],
      isInstallmentPurchase: data.isInstallmentPurchase && data.type === 'expense',
      numberOfInstallments: (data.isInstallmentPurchase && data.type === 'expense' && data.numberOfInstallments) ? Number(data.numberOfInstallments) : undefined,
    };
    try {
        await onSubmit(submitData);
        onClose();
    } catch (error) {
        console.error("Erro no formulário:", error);
    } finally {
        setIsSubmittingForm(false);
    }
  };

  const isEditingThisInstallment = !!initialData?.isInstallment;

  return (
    <TooltipProvider>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 p-1">
        <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Tipo de Transação</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                        type="button"
                        variant={field.value === 'income' ? 'default' : 'outline'}
                        onClick={() => {
                        if (isEditingThisInstallment) return;
                        field.onChange('income');
                        form.setValue("isInstallmentPurchase", false, {shouldValidate: true});
                        form.setValue("numberOfInstallments", undefined);
                        }}
                        disabled={isEditingThisInstallment}
                        className="w-full"
                    >
                        Receita
                    </Button>
                    <Button
                        type="button"
                        variant={field.value === 'expense' ? 'default' : 'outline'}
                        onClick={() => {
                          if (isEditingThisInstallment) return;
                          field.onChange('expense');
                        }}
                        disabled={isEditingThisInstallment}
                        className="w-full"
                    >
                        Despesa
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mês Início/Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} value={String(field.value)} disabled={isEditingThisInstallment}>
                    <FormControl>
                      <SelectTrigger>
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                        <SelectValue placeholder="Selecione o mês" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ano Início/Pagamento</FormLabel>
                   <Select onValueChange={field.onChange} value={String(field.value)} disabled={isEditingThisInstallment}>
                    <FormControl>
                      <SelectTrigger>
                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                        <SelectValue placeholder="Selecione o ano" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="ex: Netflix, Compra de Geladeira, Salário" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchType === 'expense' && (
        <FormField
          control={form.control}
          name="isInstallmentPurchase"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (!checked) {
                      form.setValue("numberOfInstallments", undefined);
                      setCalculatedInstallmentAmount(null);
                    }
                  }}
                  disabled={isEditingThisInstallment}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className={cn(isEditingThisInstallment && "text-muted-foreground")}>
                  É uma compra parcelada?
                </FormLabel>
                {isEditingThisInstallment && <p className="text-xs text-muted-foreground">Não é possível alterar o parcelamento de uma transação existente através da edição de uma parcela.</p>}
              </div>
            </FormItem>
          )}
        />)}

        {watchIsInstallmentPurchase && watchType === 'expense' && !isEditingThisInstallment && (
          <FormField
            control={form.control}
            name="numberOfInstallments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Parcelas</FormLabel>
                <FormControl>
                  <Input type="number" placeholder={"Ex: 12"} {...field} min="2" value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
         {isEditingThisInstallment && initialData?.totalInstallments && (
            <FormField
                control={form.control}
                name="numberOfInstallments"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Número de Parcelas (Total)</FormLabel>
                    <FormControl>
                    <Input type="number" {...field} disabled value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        )}


        <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  {watchIsInstallmentPurchase && watchType === 'expense'
                    ? "Valor Total da Compra (R$)"
                    : "Valor (R$)"
                  }
                   {watchIsInstallmentPurchase && watchType === 'expense' && (
                     <Tooltip>
                       <TooltipTrigger asChild><button type="button" tabIndex={-1}><Info className="ml-1 h-3 w-3 text-muted-foreground cursor-help" /></button></TooltipTrigger>
                       <TooltipContent side="top"><p>Informe o valor total da compra. As parcelas serão calculadas.</p></TooltipContent>
                     </Tooltip>
                   )}
                </FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} disabled={isEditingThisInstallment} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

         {watchIsInstallmentPurchase && calculatedInstallmentAmount !== null && watchType === 'expense' && !isEditingThisInstallment && (
          <div className="mt-2 text-sm text-muted-foreground bg-secondary p-2 rounded-md">
            Valor de cada parcela: R$ {calculatedInstallmentAmount.toFixed(2)} (aproximadamente)
          </div>
        )}
         {isEditingThisInstallment && initialData?.amount && initialData.isInstallment && (
            <div className="mt-2 text-sm text-muted-foreground bg-secondary p-2 rounded-md">
                Valor desta parcela: R$ {Math.abs(initialData.amount).toFixed(2)}
            </div>
        )}


        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <div className="flex items-center gap-2">
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center">
                          {cat.icon && <cat.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (separadas por vírgula)</FormLabel>
              <FormControl>
                <Input placeholder="ex: urgente, streaming, casa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmittingForm}>Cancelar</Button>
            <Button type="submit" disabled={isSubmittingForm || (isEditingThisInstallment && !initialData?.id) }>
              {isSubmittingForm && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditingThisInstallment ? "Salvar Alterações" : "Salvar Transação"}
            </Button>
        </div>
        {isEditingThisInstallment && <p className="text-sm text-muted-foreground text-right pt-2">Edição de parcelas individuais permite alterar descrição, categoria e tags. Para alterar valor ou número de parcelas da compra original, exclua todas as ocorrências e adicione novamente.</p>}
      </form>
    </Form>
    </TooltipProvider>
  );
}

    