import "dotenv/config";
// Note: Double-check that it is @prisma/config (with the @ symbol)
import { defineConfig } from "@prisma/config"; 

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // CHANGE THIS TO DIRECT_URL
    url: process.env.DIRECT_URL, 
  },
});