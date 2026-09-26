import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/products/:id - Update product
export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updateData: {
      name?: string;
      sku?: string | null;
      quantity?: number;
    } = {};

    // Validate name if provided
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim() === "") {
        return NextResponse.json(
          { error: "Product name cannot be empty" },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim();
    }

    // Validate SKU if provided
    if (body.sku !== undefined) {
      updateData.sku =
        typeof body.sku === "string" && body.sku.trim().length > 0
          ? body.sku.trim()
          : null;
    }

    // Validate quantity if provided
    if (body.quantity !== undefined) {
      const parsedQty = Number(body.quantity);
      if (!Number.isInteger(parsedQty) || parsedQty < 0) {
        return NextResponse.json(
          { error: "Quantity must be an integer of 0 or greater" },
          { status: 400 }
        );
      }
      updateData.quantity = parsedQty;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("PUT /api/products/:id error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/:id - Delete product
export async function DELETE(
  _request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Product deleted successfully",
      id,
    });
  } catch (error) {
    console.error("DELETE /api/products/:id error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
