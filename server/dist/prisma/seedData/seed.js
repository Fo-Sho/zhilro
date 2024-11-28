"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
/**
 * Retrieve a Prisma model by name.
 * @param modelName - Name of the Prisma model.
 * @returns - The Prisma model or undefined if it doesn't exist.
 */
function getModel(modelName) {
    const modelKey = Object.keys(prisma).find((key) => key.toLowerCase() === modelName.toLowerCase());
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
function deleteAllData(orderedFileNames) {
    return __awaiter(this, void 0, void 0, function* () {
        const modelNames = orderedFileNames.map((fileName) => path_1.default.basename(fileName, path_1.default.extname(fileName)));
        for (const modelName of modelNames) {
            const model = getModel(modelName);
            if (model && typeof model.deleteMany === "function") {
                try {
                    yield model.deleteMany();
                    console.log(`Cleared data from ${modelName}`);
                }
                catch (error) {
                    console.error(`Error clearing data from ${modelName}: ${error.message}`);
                }
            }
            else {
                console.error(`Model ${modelName} not found or does not support deleteMany.`);
            }
        }
    });
}
/**
 * Main function to seed data into the database.
 */
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const dataDirectory = path_1.default.join(__dirname, "seedData");
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
        yield deleteAllData(orderedFileNames);
        for (const fileName of orderedFileNames) {
            const filePath = path_1.default.join(dataDirectory, fileName);
            if (!fs_1.default.existsSync(filePath)) {
                console.error(`File not found: ${filePath}`);
                continue;
            }
            let jsonData;
            try {
                jsonData = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
            }
            catch (error) {
                console.error(`Invalid JSON in file ${fileName}: ${error.message}`);
                continue;
            }
            if (!Array.isArray(jsonData)) {
                console.error(`File ${fileName} does not contain a valid array.`);
                continue;
            }
            const modelName = path_1.default.basename(fileName, path_1.default.extname(fileName));
            const model = getModel(modelName);
            if (!model || typeof model.createMany !== "function") {
                console.error(`Model ${modelName} not found or does not support createMany.`);
                continue;
            }
            try {
                yield model.createMany({
                    data: jsonData,
                });
                console.log(`Seeded ${modelName} with data from ${fileName}`);
            }
            catch (error) {
                console.error(`Error seeding ${modelName}: ${error.message}`);
            }
        }
        console.log("Data seeding completed.");
    });
}
// Execute the main function
main()
    .catch((e) => {
    console.error(`An error occurred: ${e.message}`);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
