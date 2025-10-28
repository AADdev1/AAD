import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ✅ 1. Create or find Brand
  const brand = await prisma.brand.upsert({
    where: { title: "Aad Wheels" },
    update: {},
    create: {
      title: "Aad Wheels",
      description:
        "Premium 3D-printed Hot Wheels accessories and display stands for collectors.",
      logo: "/logo/aadwheels.png",
    },
  });

  // ✅ 2. Create or find Category
  const category = await prisma.category.upsert({
    where: { title: "Display Accessories" },
    update: {},
    create: {
      title: "Display Accessories",
      description:
        "Stands, ramps, and bases to showcase Hot Wheels and diecast collections.",
    },
  });

  // ✅ 3. Products array
  const products = [
    {
      title: "MiniGrip Car Stand",
      images: [
        "/PRD1(1.2).jpg",
        "/PRD1(1).jpg",
        "/PRD1(2).jpg",
        "/PRD1(3).jpg",
        "/PRD1(4).jpg",
        "/PRD1(5).jpg",
      ],
      keywords: [
        "hot wheels",
        "car stand",
        "diecast display",
        "wheel stopper",
        "mini car holder",
      ],
      price: 5,
    },
    {
      title: "AngleGrip Display Ramp",
      images: ["/PRD2(1).jpg", "/PRD2(2).jpg"],
      keywords: [
        "hot wheels",
        "display ramp",
        "diecast stand",
        "car showcase",
        "collector accessory",
      ],
      price: 100,
    },
    {
      title: "DualLift Display Ramp",
      images: ["/PRD3 (8).jpg", "/PRD3 (9).jpg", "/PRD3 (10).jpg", "/PRD3 (11).jpg"],
      keywords: [
        "hot wheels",
        "display ramp",
        "diecast stand",
        "car elevation ramp",
        "collector accessory",
      ],
      price: 80,
    },
    {
      title: "CardStand Pro Display Base",
      images: [
        "/PRD3 (2).jpg",
        "/PRD3 (3).jpg",
        "/PRD3 (4).jpg",
        "/PRD3 (5).jpg",
        "/PRD3 (6).jpg",
        "/PRD3 (7).jpg",
      ],
      keywords: [
        "hot wheels",
        "display stand",
        "blister pack stand",
        "collector base",
        "carded car holder",
      ],
      price: 300,
    },
    {
      title: "PegMount Display Stand",
      images: [
        "/PRD5(1).jpg",
        "/PRD5(2).jpg",
        "/PRD5(3).jpg",
        "/PRD5(4).jpg",
        "/PRD5(5).jpg",
        "/PRD5(6).jpg",
      ],
      keywords: [
        "hot wheels",
        "ikea pegboard",
        "display stand",
        "wall mount",
        "diecast showcase",
        "car holder",
      ],
      price: 150,
    },
    {
      title: "RallyStage Display Base",
      images: ["/PRD5(3).jpg", "/PRD5(4).jpg", "/PRD5(5).jpg"],
      keywords: [
        "hot wheels",
        "rally display",
        "diecast stand",
        "mini car showcase",
        "collector base",
      ],
      price: 100,
    },
    {
      title: "MiniCard Display Stand",
      images: ["/PRD4(1).jpg", "/PRD4(2).jpg", "/PRD4(3).jpg"],
      keywords: [
        "hot wheels",
        "mini stand",
        "blister pack stand",
        "card display",
        "collector accessory",
      ],
      price: 60,
    },
  ];

  // ✅ 4. Create all products
  for (const product of products) {
    await prisma.product.upsert({
      where: { title: product.title },
      update: {},
      create: {
        title: product.title,
        images: product.images,
        keywords: product.keywords,
        price: product.price,
        brandId: brand.id,
        categories: { connect: [{ id: category.id }] },
      },
    });
  }

  console.log("✅ All products seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
