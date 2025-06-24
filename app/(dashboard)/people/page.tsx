import { getPeople } from "./actions/people-actions";
import { PersonCard } from "./components/person-card";
import { CreatePersonModal } from "./components/create-person-modal";

export default async function PeoplePage() {
  const people = await getPeople();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">People</h1>
        <CreatePersonModal />
      </div>

      {people.length === 0 ? (
        <p className="text-muted-foreground">No people found. Add one above.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {people.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      )}
    </div>
  );
}
