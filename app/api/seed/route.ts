export async function GET() {
  try {
    // Dynamically import the seed function
    const { seedTransactions } = await import("@/actions/seed");
    const result = await seedTransactions();
    return Response.json(result);
  } catch (error) {
    console.error("Error in seed route:", error);
    return Response.json({ error: "Failed to seed data" }, { status: 500 });
  }
}
