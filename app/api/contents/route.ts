import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  const appDir = path.join(process.cwd(), "app");
  const pages: { name: string; path: string }[] = [];
  const seenPaths = new Set<string>();

  async function scanDir(dir: string, routeBase: string = "") {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip dynamic or layout folders like (dashboard), (public), etc.
      if (entry.isDirectory() && !entry.name.startsWith("[")) {
        await scanDir(fullPath, path.join(routeBase, entry.name));
      }

      if (entry.name === "page.tsx") {
        const route = routeBase.replace(/\\/g, "/");

        // Filter out dynamic segments, layout folders, etc.
        const cleanParts = route
          .split("/")
          .filter(
            (part) =>
              part &&
              !part.startsWith("[") &&
              !(part.startsWith("(") && part.endsWith(")"))
          );

        // Don't add if there's nothing valid to show
        if (cleanParts.length === 0) continue;

        const pathStr = "/" + cleanParts.join("/");
        if (seenPaths.has(pathStr)) continue;
        seenPaths.add(pathStr);

        const lastPart = cleanParts.at(-1) ?? "Dashboard";
        const name = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);

        pages.push({
          name,
          path: pathStr,
        });
      }
    }
  }

  await scanDir(appDir);
  return Response.json(pages);
}
