import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";
import * as esbuild from "https://deno.land/x/esbuild@v0.20.1/mod.js";

const PORT = 8000;

// Initialize esbuild
await esbuild.initialize({});

Deno.serve({ port: PORT }, async (req) => {
  const url = new URL(req.url);
  
  // Handle TypeScript files - transpile to JavaScript using esbuild
  if (url.pathname.endsWith('.ts')) {
    try {
      const filePath = `./public${url.pathname}`;
      const code = await Deno.readTextFile(filePath);
      
      // Transpile TypeScript to JavaScript using esbuild
      const result = await esbuild.transform(code, {
        loader: 'ts',
        target: 'esnext',
        format: 'esm',
      });
      
      return new Response(result.code, {
        headers: {
          "content-type": "application/javascript; charset=utf-8",
          "access-control-allow-origin": "*",
        },
      });
    } catch (error) {
      console.error("Error transpiling TypeScript:", error);
      return new Response(`Error transpiling TypeScript: ${(error as Error).message}`, {
        status: 500,
      });
    }
  }
  
  // Serve other files normally
  return serveDir(req, {
    fsRoot: "public",
    showDirListing: true,
    enableCors: true,
  });
});

console.log(`🗺️  Map Game Server running at http://localhost:${PORT}/`);
console.log(`📂 Serving files from ./public directory`);
console.log(`✨ TypeScript files will be transpiled on-the-fly using esbuild`);

// Made with Bob
