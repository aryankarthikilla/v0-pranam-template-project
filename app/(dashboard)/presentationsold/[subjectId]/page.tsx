import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

import { PresentationsPageClient } from "./components/presentations-page-client";
import { getSubjects } from "./actions/presentation-actions";

export default async function PresentationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const subjects = await getSubjects();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Presentations
          </h1>
          <p className="text-muted-foreground">
            Create and manage your training presentations
          </p>
        </div>
      </div>

      <PresentationsPageClient initialSubjects={subjects} />
    </div>
  );
}
