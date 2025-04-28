"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { createTransaction, updateTransaction } from "@/actions/transaction";
import { transactionSchema } from "@/app/lib/schema";
import { ReceiptScanner } from "./recipt-scanner";
import { cn } from "@/lib/utils";
import { Loader2, Wallet, Laptop, TrendingUp, Building, Home, Plus, Car, ShoppingBag, Zap, Film, UtensilsCrossed, HeartPulse, GraduationCap, Smile, Plane, Shield, Gift, Receipt, MoreHorizontal, ChevronDown } from "lucide-react";

interface Account {
  id: string;
  name: string;
  balance: string;
  isDefault?: boolean;
}

interface Category {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
}

interface TransactionResult {
  success: boolean;
  data: {
    id: string;
    accountId: string;
    amount: number;
  };
}

interface TransactionFormData {
  type: "EXPENSE" | "INCOME";
  amount: string;
  description?: string;
  accountId: string;
  category: string;
  date: Date;
  isRecurring: boolean;
  recurringInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
}

interface TransactionFormProps {
  accounts: Account[];
  categories: Category[];
  editMode?: boolean;
  initialData?: null | {
    type: string;
    amount: number;
    description: string;
    accountId: string;
    category: string;
    date: string;
    isRecurring: boolean;
    recurringInterval?: string;
  };
}

// Icon mapping
const iconMap = {
  Wallet,
  Laptop,
  TrendingUp,
  Building,
  Home,
  Plus,
  Car,
  ShoppingBag,
  Zap,
  Film,
  UtensilsCrossed,
  HeartPulse,
  GraduationCap,
  Smile,
  Plane,
  Shield,
  Gift,
  Receipt,
  MoreHorizontal,
};

export function AddTransactionForm({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}: TransactionFormProps) {
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type as "EXPENSE" | "INCOME",
            amount: initialData.amount.toString(),
            description: initialData.description || "",
            accountId: initialData.accountId,
            category: initialData.category,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | undefined,
            }),
          }
        : {
            type: "EXPENSE" as const,
            amount: "",
            description: "",
            accountId: accounts.find((ac) => ac.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
          },
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const onSubmit = (data: TransactionFormData) => {
    const formData = {
      type: data.type,
      amount: parseFloat(data.amount),
      description: data.description ?? "",
      accountId: data.accountId,
      category: data.category,
      date: data.date.toISOString(),
      isRecurring: data.isRecurring,
      ...(data.recurringInterval && { recurringInterval: data.recurringInterval }),
    };

    if (editMode) {
      transactionFn(editId, formData);
    } else {
      transactionFn(formData);
    }
  };

  const handleScanComplete = (scannedData: { amount: number; date: string; description?: string; category?: string }) => {
    if (scannedData) {
      setValue("amount", scannedData.amount.toString());
      setValue("date", new Date(scannedData.date));
      if (scannedData.description) {
        setValue("description", scannedData.description);
      }
      if (scannedData.category) {
        setValue("category", scannedData.category);
      }
      toast.success("Receipt scanned successfully");
    }
  };

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(
        editMode
          ? "Transaction updated successfully"
          : "Transaction created successfully"
      );
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading, editMode, reset, router]);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const selectedCategory = categories.find(cat => cat.id === getValues("category"));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Receipt Scanner - Only show in create mode */}
      {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

      {/* Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <Select
          onValueChange={(value) => setValue("type", value as "EXPENSE" | "INCOME")}
          defaultValue={type}
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      {/* Amount and Account */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount")}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Account</label>
          <Select
            onValueChange={(value) => setValue("accountId", value)}
            defaultValue={getValues("accountId")}
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} (${parseFloat(account.balance).toFixed(2)})
                </SelectItem>
              ))}
              <CreateAccountDrawer>
                <Button
                  variant="ghost"
                  className="relative flex w-full cursor-default select-none items-center rounded-sm
                  py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                >
                  Create Account
                </Button>
              </CreateAccountDrawer>
            </SelectContent>
          </Select>
          {errors.accountId && (
            <p className="text-sm text-red-500">{errors.accountId.message}</p>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <button
          type="button"
          onClick={() => setIsCategoryModalOpen(true)}
          className="cursor-pointer w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="flex items-center gap-2">
            {selectedCategory ? (
              <>
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: selectedCategory.color }}
                >
                  {iconMap[selectedCategory.icon as keyof typeof iconMap] && 
                    React.createElement(iconMap[selectedCategory.icon as keyof typeof iconMap], {
                      className: "w-3 h-3 text-white"
                    })
                  }
                </div>
                <span>{selectedCategory.name}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Select category</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Category</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-4">
            {filteredCategories.map((category) => {
              const IconComponent = iconMap[category.icon as keyof typeof iconMap];
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setValue("category", category.id);
                    setIsCategoryModalOpen(false);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-lg border transition-all",
                    "hover:border-primary hover:bg-primary/5",
                    getValues("category") === category.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mb-1"
                    style={{ backgroundColor: category.color }}
                  >
                    {IconComponent && <IconComponent className="w-4 h-4 text-white" />}
                  </div>
                  <span className="text-xs text-center">{category.name}</span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <div className="flex flex-col gap-1">
          <DatePicker
            selected={date}
            onChange={(newDate) => newDate && setValue("date", newDate)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent 
            file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
            focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            dateFormat="MMMM d, yyyy"
            maxDate={new Date()}
            minDate={new Date("1900-01-01")}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            popperPlacement="bottom-start"
            placeholderText=""
          />
        </div>
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Input placeholder="Enter description" {...register("description")} />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Recurring Toggle */}
      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <label className="text-base font-medium">Recurring Transaction</label>
          <div className="text-sm text-muted-foreground">
            Set up a recurring schedule for this transaction
          </div>
        </div>
        <Switch
          checked={isRecurring}
          onCheckedChange={(checked) => setValue("isRecurring", checked)}
          className="cursor-pointer"
        />
      </div>

      {/* Recurring Interval */}
      {isRecurring && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Recurring Interval</label>
          <Select
            onValueChange={(value) => setValue("recurringInterval", value as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | undefined)}
            defaultValue={getValues("recurringInterval")}
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.recurringInterval && (
            <p className="text-sm text-red-500">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex w-full justify-between mx-auto gap-4">
        <Button
          type="button"
          variant="outline"
          className="w-1/2 cursor-pointer"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" className="w-1/2 cursor-pointer" disabled={!!transactionLoading}>
          {transactionLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editMode ? "Updating..." : "Creating..."}
            </>
          ) : editMode ? (
            "Update Transaction"
          ) : (
            "Create Transaction"
          )}
        </Button>
      </div>
    </form>
  );
}
