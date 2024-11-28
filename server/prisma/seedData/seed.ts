import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
const prisma = new PrismaClient();



/**
 * Retrieve a Prisma model by name.
 * @param modelName - Name of the Prisma model.
 * @returns - The Prisma model or undefined if it doesn't exist.
 */
function getModel(modelName: string): unknown {
  const modelKey = Object.keys(prisma).find(
    (key) => key.toLowerCase() === modelName.toLowerCase()
  ) as keyof typeof prisma;

  if (modelKey && typeof prisma[modelKey] === "object") {
    return prisma[modelKey];
  }

  console.error(`Model '${modelName}' not found in Prisma Client.`);
  return undefined;
}

/**
 * Deletes all data from the models in the specified order.
 * @param orderedFileNames - List of JSON filenames representing models.
 */
async function deleteAllData(orderedFileNames: string[]) {
  const modelNames = orderedFileNames.map((fileName) =>
    path.basename(fileName, path.extname(fileName))
  );

  for (const modelName of modelNames) {
    const model = getModel(modelName);
    if (model && typeof (model as { deleteMany: () => Promise<void> }).deleteMany === "function") {
      try {
        await (model as { deleteMany: () => Promise<void> }).deleteMany();
        console.log(`Cleared data from ${modelName}`);
      } catch (error) {
        console.error(
          `Error clearing data from ${modelName}: ${(error as Error).message}`
        );
      }
    } else {
      console.error(
        `Model ${modelName} not found or does not support deleteMany.`
      );
    }
  }
}

/**
 * Main function to seed data into the database.
 */
async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  // List of JSON files to seed data in order
  const orderedFileNames = [
    "products.json",
    "expenseSummary.json",
    "sales.json",
    "salesSummary.json",
    "purchases.json",
    "purchaseSummary.json",
    "users.json",
    "expenses.json",
    "expenseByCategory.json",
  ];

  // Clear all existing data
  await deleteAllData(orderedFileNames);

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }

    let jsonData: unknown;
    try {
      jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (error) {
      console.error(`Invalid JSON in file ${fileName}: ${(error as Error).message}`);
      continue;
    }

    if (!Array.isArray(jsonData)) {
      console.error(`File ${fileName} does not contain a valid array.`);
      continue;
    }

    const modelName = path.basename(fileName, path.extname(fileName));
    const model = getModel(modelName);

    if (!model || typeof (model as { createMany: (args: { data: unknown[] }) => Promise<void> }).createMany !== "function") {
      console.error(
        `Model ${modelName} not found or does not support createMany.`
      );
      continue;
    }

    try {
      await (model as { createMany: (args: { data: unknown[] }) => Promise<void> }).createMany({
        data: jsonData,
      });
      console.log(`Seeded ${modelName} with data from ${fileName}`);
    } catch (error) {
      console.error(`Error seeding ${modelName}: ${(error as Error).message}`);
    }
  }

  console.log("Data seeding completed.");
}

// Execute the main function
main()
  .catch((e) => {
    console.error(`An error occurred: ${e.message}`);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
