import { db } from "./index";
import * as schema from "@shared/schema";

async function seed() {
  try {
    // Check if we already have users
    const existingUsers = await db.select().from(schema.users);
    
    if (existingUsers.length === 0) {
      // Create a demo user for testing
      await db.insert(schema.users).values({
        username: "demo_user",
        password: "password123",  // In a real app, this would be hashed
      });
      
      console.log("Created demo user");
    }
    
    // In a production environment, you'd create more sophisticated seed data
    // such as example analyses, but we'll keep it minimal for this app
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
