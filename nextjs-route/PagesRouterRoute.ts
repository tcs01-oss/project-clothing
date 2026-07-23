import { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenAI, Type } from "@google/genai";
import { promises as fs } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import formidable from "formidable";

// Disable Next.js body parsing to allow formidable to stream/parse file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

function sanitize(str: string): string {
  if (!str) return "default";
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured." });
    }

    // Parse the multipart form data using formidable
    const form = formidable({ multiples: false });
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fieldsParsed, filesParsed) => {
        if (err) reject(err);
        resolve([fieldsParsed, filesParsed]);
      });
    });

    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
    const contextField = Array.isArray(fields.context) ? fields.context[0] : fields.context;

    if (!imageFile) {
      return res.status(400).json({ error: "A product image file under the 'image' form field is required." });
    }

    if (!contextField) {
      return res.status(400).json({ error: "Context details are required for the AI Auto-Lister." });
    }

    // Read the temporary file parsed by formidable into a buffer
    const imageBuffer = await fs.readFile(imageFile.filepath);
    const base64Image = imageBuffer.toString("base64");

    // Vision Analysis with Gemini
    const systemInstruction = `You are an expert fashion merchandiser and seasoned retail catalog data architect.
Your job is to analyze the uploaded apparel product image and combine it with the provided context text.
You will output a highly structured JSON object representing a new parent Product and its first ProductVariant, conforming to an e-commerce catalog database schema.

Independently analyze and generate:
1. name: A catchy, elegant, and highly SEO-optimized display title. Connect deeply with the style, fabric texture, or aesthetic.
2. description: An eloquent, evocative description of the garment detailing its drape, material quality, and design highlights.
3. category: Map to our clean standard collections. Standard e-commerce categories (e.g., "Loomed Shirts", "T-Shirts", "Outerwear", "Loomed Pants", "Artisan Robes", "Artisan Coats").
4. genderPreference: The target demographic based on fit and design. Must be one of: "Men", "Women", or "Unisex".
5. price: Use the price from the context if provided, or estimate a realistic price based on e-commerce standards. Must be a clean number.
6. sizes: Standard sizing array (e.g., ["S", "M", "L", "XL"]). Use sizes specified in the context or fallback to standard sizes if not specified.
7. variant:
   - color: Mapped variant color matching the image (e.g. Desert Beige, Indigo Charcoal, Alabaster White).
   - design: A short description of the graphic, pattern, print, or solid design (e.g. "Solid Raw Knit", "Botanical Block Print").
   - topFitStyle: Description of the style/fit of the top (or set), such as "Oversized, drop-shoulder" or "Classic regular fit".
   - bottomFitStyle: Description of the style/fit of the bottom (if applicable), or "N/A" if it's a top-only piece.
   - stock: Set a standard initial stock amount (e.g., 50).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: imageFile.mimetype || "image/jpeg",
            data: base64Image,
          },
        },
        {
          text: `Context hints from manager: "${contextField}"`,
        },
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Elegant display name of the garment." },
            description: { type: Type.STRING, description: "Detailed description of the style and weave." },
            category: { type: Type.STRING, description: "Category name." },
            genderPreference: { type: Type.STRING, description: "One of: Men, Women, Unisex" },
            price: { type: Type.NUMBER, description: "Product price as a positive float number." },
            sizes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Available sizes.",
            },
            variant: {
              type: Type.OBJECT,
              properties: {
                color: { type: Type.STRING, description: "Primary color of this specific variant." },
                design: { type: Type.STRING, description: "Design/Pattern description." },
                topFitStyle: { type: Type.STRING, description: "Fit and style detail of the upper." },
                bottomFitStyle: { type: Type.STRING, description: "Fit and style detail of the lower/trousers." },
                stock: { type: Type.INTEGER, description: "Initial quantity." },
              },
              required: ["color", "design", "topFitStyle", "bottomFitStyle", "stock"],
            },
          },
          required: [
            "name",
            "description",
            "category",
            "genderPreference",
            "price",
            "sizes",
            "variant",
          ],
        },
        temperature: 0.2,
      },
    });

    const aiText = response.text;
    if (!aiText) {
      throw new Error("Failed to receive a valid response from the Gemini Vision API.");
    }

    const aiData = JSON.parse(aiText.trim());
    const productId = `prod-${Date.now()}`;

    // Step 2: Strict Image URL Construction (CRITICAL)
    const catSlug = sanitize(aiData.category);
    const nameSlug = sanitize(aiData.name);
    const colorSlug = sanitize(aiData.variant.color);
    const priceStr = Math.round(aiData.price).toString();
    const sizesStr = aiData.sizes.map((s: string) => sanitize(s)).join("-");
    const genderSlug = sanitize(aiData.genderPreference);

    // Apply the requested filename string template:
    const finalFileName = `${productId}_${nameSlug}_${catSlug}_${colorSlug}_${priceStr}_${sizesStr}_${genderSlug}_variant.jpg`;
    const dbImageUrl = `/assets/catalog/${catSlug}/${finalFileName}`;

    // Save to the public assets directory on the filesystem
    const targetFolder = path.join(process.cwd(), "public", "assets", "catalog", catSlug);
    await fs.mkdir(targetFolder, { recursive: true });
    await fs.writeFile(path.join(targetFolder, finalFileName), imageBuffer);

    // Clean up the temporary file created by formidable
    try {
      await fs.unlink(imageFile.filepath);
    } catch (cleanupErr) {
      console.warn("Could not delete temporary formidable file:", cleanupErr);
    }

    // Step 3: Database Injection using Prisma Client Transaction
    const databaseResult = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          id: productId,
          name: aiData.name,
          description: aiData.description,
          price: aiData.price,
          category: aiData.category,
          genderPreference: aiData.genderPreference,
          sizes: aiData.sizes,
          colors: [aiData.variant.color],
          tags: ["ai-auto-listed", catSlug],
        },
      });

      const variant = await tx.productVariant.create({
        data: {
          productId: product.id,
          color: aiData.variant.color,
          design: aiData.variant.design,
          topFitStyle: aiData.variant.topFitStyle,
          bottomFitStyle: aiData.variant.bottomFitStyle,
          stock: aiData.variant.stock,
          images: [dbImageUrl],
        },
      });

      return { product, variant };
    });

    return res.status(200).json({
      success: true,
      message: "Product auto-listed successfully by Gemini Vision.",
      data: {
        productId: databaseResult.product.id,
        name: databaseResult.product.name,
        category: databaseResult.product.category,
        constructedImageUrl: dbImageUrl,
        dbRecord: databaseResult,
      },
    });

  } catch (error: any) {
    console.error("[AI Auto-Lister Pages API Error]:", error);
    return res.status(500).json({
      error: "Internal server error during listing.",
      details: error.message || String(error),
    });
  }
}
