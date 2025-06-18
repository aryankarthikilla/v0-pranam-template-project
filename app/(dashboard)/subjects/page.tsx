import { getSubjects } from "./actions/subjects-actions";
import { SubjectCard } from "./components/subject-card";
import { CreateSubjectModal } from "./components/create-subject-modal";

export default async function SubjectsPage() {
  const subjects = await getSubjects();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Subjects</h1>
        <CreateSubjectModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
        {subjects.length === 0 && (
          <p className="text-sm text-muted-foreground">No subjects found.</p>
        )}
      </div>
    </div>
  );
}
