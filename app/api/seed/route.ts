import { seedTransactions } from "@/actions/seed";
import "@/lib/prisma-init";

export async function GET() {
  const result = await seedTransactions();
  return Response.json(result);
}
