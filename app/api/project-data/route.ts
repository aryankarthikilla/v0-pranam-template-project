// app/api/project-data/route.ts

import { promises as fs } from "fs";
import path from "path";
import { NextRequest } from "next/server";

const dataPath = path.join(
  process.cwd(),
  "app/(dashboard)/project-data/project.json"
);

// Ensure file exists
async function ensureFileExists() {
  try {
    await fs.access(dataPath);
  } catch {
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, JSON.stringify([], null, 2), "utf-8");
  }
}

export async function GET() {
  await ensureFileExists();
  const data = await fs.readFile(dataPath, "utf-8");
  return new Response(data, {
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  await ensureFileExists();
  const newItem = await req.json();
  const data = JSON.parse(await fs.readFile(dataPath, "utf-8"));
  newItem.id = Date.now().toString();
  data.push(newItem);
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
  return new Response(JSON.stringify(newItem), { status: 201 });
}

export async function PUT(req: NextRequest) {
  const updatedItem = await req.json();
  const data = JSON.parse(await fs.readFile(dataPath, "utf-8"));
  const updated = data.map((item: any) =>
    item.id === updatedItem.id ? updatedItem : item
  );
  await fs.writeFile(dataPath, JSON.stringify(updated, null, 2));
  return new Response(JSON.stringify({ success: true }));
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const data = JSON.parse(await fs.readFile(dataPath, "utf-8"));
  const filtered = data.filter((item: any) => item.id !== id);
  await fs.writeFile(dataPath, JSON.stringify(filtered, null, 2));
  return new Response(JSON.stringify({ success: true }));
}
