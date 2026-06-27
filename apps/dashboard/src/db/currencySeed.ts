// scripts/seedExchangeRates.ts
//@ts-ignore
import currencyapi from "@everapi/currencyapi-js"
import { db } from "@/db/drizzle"
import { exchangeRate } from "@/db/schema"

const client = new currencyapi(process.env.CURRENCY_API_KEY!)

async function seedMockExchangeRates() {
  const now = new Date();
  const mockRates: Record<string, string> = {
    USD: "1.0000",
    EUR: "0.9200",
    GBP: "0.7900",
    CAD: "1.3600",
    AUD: "1.5100",
  };

  for (const [code, rate] of Object.entries(mockRates)) {
    await db
      .insert(exchangeRate)
      .values({
        baseCurrency: "USD",
        targetCurrency: code,
        rate,
        fetchedAt: now,
      })
      .onConflictDoUpdate({
        target: [exchangeRate.baseCurrency, exchangeRate.targetCurrency],
        set: {
          rate,
          fetchedAt: now,
        },
      })
  }
}

async function fetchAndStoreExchangeRates() {
  const apiKey = process.env.CURRENCY_API_KEY;
  if (!apiKey || apiKey === "placeholder" || apiKey.trim() === "") {
    console.warn("⚠️ No valid CURRENCY_API_KEY found. Seeding mock exchange rates for local development...");
    await seedMockExchangeRates();
    return;
  }

  try {
    const res = await client.latest({ base_currency: "USD", type: "fiat" })
    // Add this safety check
    if (!res || !res.meta || !res.data) {
      throw new Error(`Currency API failed: ${JSON.stringify(res)}`)
    }
    const now = new Date(res.meta.last_updated_at)

    for (const [code, info] of Object.entries(res.data)) {
      const rate = (info as { value: any }).value.toString()

      await db
        .insert(exchangeRate)
        .values({
          baseCurrency: "USD",
          targetCurrency: code,
          rate,
          fetchedAt: now,
        })
        .onConflictDoUpdate({
          target: [exchangeRate.baseCurrency, exchangeRate.targetCurrency],
          set: {
            rate,
            fetchedAt: now,
          },
        })
    }
  } catch (err: any) {
    console.warn("⚠️ Currency API request failed. Seeding mock exchange rates as fallback...", err.message);
    await seedMockExchangeRates();
  }
}

// 👇 auto-run with top-level await + try/catch
try {
  await fetchAndStoreExchangeRates()
  console.log("✅ Exchange rates seeded successfully")
  process.exit(0)
} catch (err) {
  console.error("❌ Error seeding exchange rates:", err)
  process.exit(1)
}
