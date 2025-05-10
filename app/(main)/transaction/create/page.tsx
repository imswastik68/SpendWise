import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";
import { getTransaction } from "@/actions/transaction";

interface SearchParams {
  edit?: string;
}

interface Transaction {
  type: string;
  amount: number;
  description: string;
  accountId: string;
  category: string;
  date: string;
  isRecurring: boolean;
  recurringInterval?: string;
}

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function CreateTransactionPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const accounts = (await getUserAccounts()) || [];
  const editId = resolvedParams?.edit;

  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    if (transaction) {
      initialData = {
        type: (transaction as Transaction).type || '',
        amount: transaction.amount || 0,
        description: (transaction as Transaction).description || '',
        accountId: (transaction as Transaction).accountId || '',
        category: (transaction as Transaction).category || '',
        date: (transaction as Transaction).date || '',
        isRecurring: (transaction as Transaction).isRecurring || false,
        recurringInterval: (transaction as Transaction).recurringInterval || undefined,
      };
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-5">
      <div className="flex justify-center md:justify-normal mb-8">
        <h1 className="text-5xl gradient-title ">Add Transaction</h1>
      </div>
      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  );
}
