// app/api/create-order/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔥 Incoming request body:", JSON.stringify(body, null, 2));

    const { userId, addressId, products, notes = {} } = body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      console.log("❌ Invalid products:", products);
      return NextResponse.json({ error: "Products list is required" }, { status: 400 });
    }
    if (!userId) {
      console.log("❌ Missing userId");
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // 🧩 Fetch product details from DB
    const productIds = products.map((p: any) => p.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, discount: true },
    });
    console.log("📦 Fetched products from DB:", dbProducts);

    if (dbProducts.length !== products.length) {
      console.log("❌ Some products not found in DB");
      return NextResponse.json({ error: "Some products not found" }, { status: 404 });
    }

    // 💰 Calculate totals
    let total = 0;
    let discount = 0;
    const shipping = 0;
    const tax = 0;

    for (const item of products) {
      const product = dbProducts.find((p) => p.id === item.productId);
      if (!product) continue;

      const price = Number(product.price) || 0;
      const disc = Number(product.discount) || 0;
      const qty = Number(item.quantity) || 1;

      total += price * qty;
      discount += disc * qty;
    }

    const payable = total - discount + tax + shipping;
    const amountInPaise = Math.round(payable * 100);

    console.log("💰 Totals:", { total, discount, shipping, tax, payable, amountInPaise });

    if (!amountInPaise || amountInPaise < 100) {
      console.log("❌ Invalid payable amount:", amountInPaise);
      return NextResponse.json({ error: "Amount must be at least ₹1.00" }, { status: 400 });
    }

    // 🔐 Razorpay credentials
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    console.log("🔑 Razorpay Keys Present?", !!key_id, !!key_secret);

    if (!key_id || !key_secret) {
      throw new Error("Missing Razorpay credentials in environment variables");
    }

    const auth = Buffer.from(`${key_id}:${key_secret}`).toString("base64");
    const receiptNumber = `receipt#${Math.floor(Math.random() * 1000000)}`;

    // 🪄 Create Razorpay Order
    console.log("🪄 Creating Razorpay order...");
    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: receiptNumber,
        notes,
      }),
    });

    const razorpayData = await razorpayRes.json();
    console.log("🧾 Razorpay Response:", JSON.stringify(razorpayData, null, 2));

    if (!razorpayRes.ok) {
      console.log("❌ Razorpay 400 Error:", razorpayData);
      return NextResponse.json(
        { error: "Failed to create Razorpay order", details: razorpayData },
        { status: 400 }
      );
    }

    // ✅ Success
    return NextResponse.json({
      success: true,
      razorpayOrder: razorpayData,
    });
  } catch (err: any) {
    console.error("❌ Error creating order:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}
