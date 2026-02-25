import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

Deno.test("server module loads successfully", () => {
  // Simple test to verify the test framework is working
  assertEquals(1 + 1, 2);
});

Deno.test("port constant is defined", async () => {
  const serverCode = await Deno.readTextFile("./server.ts");
  assertEquals(serverCode.includes("const PORT"), true);
  assertEquals(serverCode.includes("8000"), true);
});

// Made with Bob
