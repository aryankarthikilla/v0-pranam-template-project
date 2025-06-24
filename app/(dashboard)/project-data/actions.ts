// app/(dashboard)/project-data/actions.ts

const API_BASE_URL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    : "";

export async function getProjects() {
  const res = await fetch(`${API_BASE_URL}/api/project-data`, {
    cache: "no-store", // to ensure fresh data
  });
  return res.json();
}

export async function addProject(project: any) {
  const res = await fetch(`${API_BASE_URL}/api/project-data`, {
    method: "POST",
    body: JSON.stringify(project),
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}

export async function updateProject(id: string, updates: any) {
  return fetch(`${API_BASE_URL}/api/project-data`, {
    method: "PUT",
    body: JSON.stringify({ id, ...updates }),
    headers: { "Content-Type": "application/json" },
  });
}

export async function deleteProject(id: string) {
  return fetch(`${API_BASE_URL}/api/project-data`, {
    method: "DELETE",
    body: JSON.stringify({ id }),
    headers: { "Content-Type": "application/json" },
  });
}
