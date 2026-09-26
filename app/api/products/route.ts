import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/products - Get all products (with optional q query param)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    const products = await prisma.product.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query } },
              { sku: { contains: query } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, sku, quantity } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    const parsedQty = Number(quantity);
    if (
      quantity === undefined ||
      quantity === null ||
      !Number.isInteger(parsedQty) ||
      parsedQty < 0
    ) {
      return NextResponse.json(
        { error: "Quantity must be an integer of 0 or greater" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const cleanSku =
      typeof sku === "string" && sku.trim().length > 0 ? sku.trim() : null;

    const product = await prisma.product.create({
      data: {
        name: trimmedName,
        sku: cleanSku,
        quantity: parsedQty,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
