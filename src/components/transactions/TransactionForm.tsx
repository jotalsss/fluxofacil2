
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import React, { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const currentFullYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentFullYear - 5 + i); // 5 anos passados e 5 futuros
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
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

type SubmitHandlerData = Omit<Transaction, 'id' | 'date' | 'amount' | 'userId' > & { 
    id?: string; 
    amount: number; 
    month: string; 
    year: string;
    tags: string[]; 
};


interface TransactionFormProps {
  onSubmit: (data: SubmitHandlerData) => void;
  initialData?: Transaction; 
  onClose: () => void;
}

export function TransactionForm({ onSubmit, initialData, onClose }: TransactionFormProps) {
  const { toast } = useToast();

  const defaultMonth = initialData?.date ? String(initialData.date.getUTCMonth() + 1) : String(new Date().getMonth() + 1);
  const defaultYear = initialData?.date ? String(initialData.date.getUTCFullYear()) : String(new Date().getFullYear());

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      month: defaultMonth,
      year: defaultYear,
      description: initialData?.description || "",
      amount: initialData?.amount ? Math.abs(initialData.amount) : 0,
      type: initialData?.type || "expense",
      category: initialData?.category || "",
      tags: initialData?.tags?.join(", ") || "",
    },
  });

  useEffect(() => {
    const currentMonth = initialData?.date ? String(initialData.date.getUTCMonth() + 1) : String(new Date().getMonth() + 1);
    const currentYear = initialData?.date ? String(initialData.date.getUTCFullYear()) : String(new Date().getFullYear());
    
    form.reset({
        month: currentMonth,
        year: currentYear,
        description: initialData?.description || "",
        amount: initialData?.amount ? Math.abs(initialData.amount) : 0,
        type: initialData?.type || "expense",
        category: initialData?.category || "",
        tags: initialData?.tags?.join(", ") || "",
    });
  }, [initialData, form]);


  const handleFormSubmit = (data: TransactionFormValues) => {
    const submitData: SubmitHandlerData = {
      ...(initialData?.id && { id: initialData.id }), 
      month: data.month,
      year: data.year,
      description: data.description,
      amount: data.amount, 
      type: data.type,
      category: data.category,
      tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()).filter(tag => tag) : [],
    };
    onSubmit(submitData);
    toast({ title: "Transação salva!", description: `Transação "${data.description}" foi salva.` });
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 p-1">
        <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mês</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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
                  <FormLabel>Ano</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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
                <Input placeholder="ex: Café com amigos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4 pt-2"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="income" />
                      </FormControl>
                      <FormLabel className="font-normal">Receita</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="expense" />
                      </FormControl>
                      <FormLabel className="font-normal">Despesa</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <div className="flex items-center gap-2">
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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
                <Input placeholder="ex: trabalho, pessoal, importante" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar Transação</Button>
        </div>
      </form>
    </Form>
  );
}
