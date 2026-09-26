import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with initial products...");

  // Clear existing products to make seed idempotent
  await prisma.product.deleteMany();

  const products = [
    {
      name: "Ergonomic Mechanical Keyboard",
      sku: "KB-MECH-01",
      quantity: 24,
    },
    {
      name: "Ultra-Wide Gaming Monitor 34\"",
      sku: "MON-34-UW",
      quantity: 12,
    },
    {
      name: "Wireless Noise-Cancelling Headphones",
      sku: "AUD-NC-700",
      quantity: 8,
    },
    {
      name: "USB-C Multi-Port Docking Station",
      sku: "ACC-DOCK-10",
      quantity: 3,
    },
    {
      name: "Precision Optical Mouse",
      sku: "MOU-OPT-05",
      quantity: 0,
    },
  ];

  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    });
    console.log(`Created product: ${created.name} (${created.sku || "No SKU"}) - Qty: ${created.quantity}`);
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
