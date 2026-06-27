import { db } from "../db/drizzle"
import { organization, promotionCodes } from "../db/schema"

async function seed() {
  console.log("🌱 Seeding mock coupons...")
  
  // 1. Get first organization
  const org = await db.query.organization.findFirst()
  if (!org) {
    console.log("❌ No organization found. Please create an organization first.")
    process.exit(1)
  }
  
  console.log(`🏢 Found organization: ${org.name} (${org.id})`)
  
  const mockCoupons = [
    {
      code: "SUMMER20",
      externalId: "promo_summer20",
      stripeCouponId: "co_summer20",
      provider: "stripe" as const,
      isActive: true,
      discountType: "PERCENTAGE" as const,
      discountValue: "20.00",
      commissionType: "PERCENTAGE" as const,
      commissionValue: "10.00",
      organizationId: org.id,
    },
    {
      code: "WELCOME10",
      externalId: "promo_welcome10",
      stripeCouponId: "co_welcome10",
      provider: "stripe" as const,
      isActive: true,
      discountType: "FLAT_FEE" as const,
      discountValue: "10.00",
      commissionType: "PERCENTAGE" as const,
      commissionValue: "5.00",
      organizationId: org.id,
    },
    {
      code: "BLACKFRIDAY50",
      externalId: "promo_bf50",
      stripeCouponId: "co_bf50",
      provider: "stripe" as const,
      isActive: true,
      discountType: "PERCENTAGE" as const,
      discountValue: "50.00",
      commissionType: "FLAT_FEE" as const,
      commissionValue: "25.00",
      organizationId: org.id,
    },
  ]
  
  for (const coupon of mockCoupons) {
    await db
      .insert(promotionCodes)
      .values(coupon)
      .onConflictDoUpdate({
        target: [promotionCodes.externalId, promotionCodes.organizationId],
        set: {
          isActive: coupon.isActive,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          commissionType: coupon.commissionType,
          commissionValue: coupon.commissionValue,
          updatedAt: new Date(),
        },
      })
    console.log(`✅ Coupon synced: ${coupon.code}`)
  }
  
  console.log("🎉 Seeding complete!")
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seeding failed:", err)
    process.exit(1)
  })
