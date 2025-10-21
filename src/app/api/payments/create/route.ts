import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      razorpay_payment_id,
      orderId,
      userId,
      providerId,
      payable,
      fee,
      isSuccessful = true,
      products = []
    } = body;

    if (!razorpay_payment_id || !orderId || !userId || !providerId || !payable) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ✅ Step 1: Create Payment record
    const payment = await prisma.payment.create({
      data: {
        refId: razorpay_payment_id,
        status: isSuccessful ? "Paid" : "Failed",
        isSuccessful,
        payable: Number(payable),
        fee: fee ? Number(fee) : null,
        providerId,
        userId,
        orderId,
      },
    });

    // ✅ Step 2: Update Order as Paid
    if (isSuccessful) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          isPaid: true,
          status: "Paid",
          razorpayId: razorpay_payment_id,
        },
      });
    }

    // ✅ Step 3: If products are provided, update inventory & cart
    if (isSuccessful && products.length > 0) {
      for (const item of products) {
        const { productId, quantity } = item;

        // Decrease product stock
        await prisma.product.update({
          where: { id: productId },
          data: {
            stock: { decrement: quantity },
          },
        });

        // Remove or decrement item from cart
        const existingCartItem = await prisma.cartItem.findUnique({
          where: {
            UniqueCartItem: { cartId: userId, productId },
          },
        });

        if (existingCartItem) {
          if (existingCartItem.count > quantity) {
            // Reduce count
            await prisma.cartItem.update({
              where: {
                UniqueCartItem: { cartId: userId, productId },
              },
              data: { count: { decrement: quantity } },
            });
          } else {
            // Remove item if quantity matches or exceeds
            await prisma.cartItem.delete({
              where: {
                UniqueCartItem: { cartId: userId, productId },
              },
            });
          }
        }
      }
    }

    return NextResponse.json(
      {
        message: "Payment recorded and stock/cart updated successfully",
        payment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment", details: error.message },
      { status: 500 }
    );
  }
}
