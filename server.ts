import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

const PORT = 8000;

Deno.serve({ port: PORT }, (req) => {
  return serveDir(req, {
    fsRoot: "public",
    showDirListing: true,
    enableCors: true,
  });
});

console.log(`🗺️  Map Game Server running at http://localhost:${PORT}/`);
console.log(`📂 Serving files from ./public directory`);

// Made with Bob
