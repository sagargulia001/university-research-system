import "dotenv/config";
import { defineConfig } from "@prisma/config"; 

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Prisma CLI commands use the direct database URL.
    url: process.env.DIRECT_URL, 
  },
});
