import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AdvancedEditor } from "./components/advanced-editor";
import { getSubjectWithSlides } from "../../actions/presentation-actions";

interface Props {
  params: {
    subjectId: string;
  };
}

export default async function AdvancedEditorPage({ params }: Props) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { subject, slides } = await getSubjectWithSlides(params.subjectId);

  if (!subject) {
    redirect("/presentations");
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50">
      <AdvancedEditor subject={subject} slides={slides} />
    </div>
  );
}
