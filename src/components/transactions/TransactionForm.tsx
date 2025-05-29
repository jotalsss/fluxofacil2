
// @ts-nocheck remove this ts-nocheck comment when you have fixed all the errors
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn }  from "@/lib/utils";
import { CalendarIcon, Sparkles, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import type { Transaction } from "@/lib/types";
import { DEFAULT_CATEGORIES, CATEGORIES_MAP } from "@/lib/constants";
import { suggestTransactionCategory } from "@/ai/flows/suggest-transaction-category";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const transactionFormSchema = z.object({
  date: z.date({
    required_error: "A data é obrigatória.",
  }),
  description: z.string().min(1, "A descrição é obrigatória."),
  amount: z.coerce.number().positive("O valor deve ser positivo."),
  type: z.enum(["income", "expense"], {
    required_error: "O tipo da transação é obrigatório.",
  }),
  category: z.string().min(1, "A categoria é obrigatória."),
  tags: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  onSubmit: (data: Transaction) => void;
  initialData?: Partial<Transaction>;
  onClose: () => void;
}

export function TransactionForm({ onSubmit, initialData, onClose }: TransactionFormProps) {
  const { toast } = useToast();
  const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      date: initialData?.date || new Date(),
      description: initialData?.description || "",
      amount: initialData?.amount || 0,
      type: initialData?.type || "expense",
      category: initialData?.category || "",
      tags: initialData?.tags?.join(", ") || "",
    },
  });

  const handleFormSubmit = (data: TransactionFormValues) => {
    const transactionData: Transaction = {
      id: initialData?.id || crypto.randomUUID(),
      ...data,
      amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount),
      tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()).filter(tag => tag) : [],
    };
    onSubmit(transactionData);
    toast({ title: "Transação salva!", description: `Transação "${data.description}" foi salva.` });
    onClose();
  };

  const handleSuggestCategory = async () => {
    const description = form.getValues("description");
    if (!description) {
      toast({ title: "Falha na Sugestão", description: "Por favor, insira uma descrição primeiro.", variant: "destructive" });
      return;
    }
    setIsSuggestingCategory(true);
    setSuggestedCategory(null);
    try {
      const result = await suggestTransactionCategory({ transactionDescription: description });
      if (result.suggestedCategory) {
        const validCategory = DEFAULT_CATEGORIES.find(cat => cat.name.toLowerCase() === result.suggestedCategory.toLowerCase() || cat.id.toLowerCase() === result.suggestedCategory.toLowerCase());
        if (validCategory) {
            setSuggestedCategory(validCategory.id); 
            toast({ title: "Sugestão da IA", description: `Categoria sugerida: ${validCategory.name} (Confiança: ${Math.round(result.confidence * 100)}%)` });
        } else {
            toast({ title: "Sugestão da IA", description: `Sugerido: ${result.suggestedCategory}. Não está na lista predefinida.`, variant: "default" });
        }
      }
    } catch (error) {
      console.error("Erro ao sugerir categoria:", error);
      toast({ title: "Falha na Sugestão", description: "Não foi possível obter a sugestão da IA.", variant: "destructive" });
    } finally {
      setIsSuggestingCategory(false);
    }
  };

  const applySuggestedCategory = () => {
    if (suggestedCategory) {
      form.setValue("category", suggestedCategory, { shouldValidate: true });
      setSuggestedCategory(null); 
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Escolha uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

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
                <Button type="button" variant="outline" size="icon" onClick={handleSuggestCategory} disabled={isSuggestingCategory} aria-label="Sugerir Categoria">
                  {isSuggestingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                </Button>
              </div>
              {suggestedCategory && CATEGORIES_MAP.has(suggestedCategory) && (
                 <div className="mt-2 text-sm text-muted-foreground">
                    IA Sugere: <Button variant="link" className="p-0 h-auto" onClick={applySuggestedCategory}>{CATEGORIES_MAP.get(suggestedCategory)?.name}</Button>
                 </div>
              )}
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
