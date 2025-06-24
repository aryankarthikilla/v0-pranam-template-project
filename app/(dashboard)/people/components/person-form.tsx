"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createPerson,
  updatePerson,
  type Person,
} from "../actions/people-actions";
import { toast } from "sonner";

interface PersonFormProps {
  person?: Person;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PersonForm({ person, onSuccess, onCancel }: PersonFormProps) {
  const [formState, setFormState] = useState({
    first_name: person?.first_name || "",
    last_name: person?.last_name || "",
    sur_name: person?.sur_name || "",
    primary_phone: person?.primary_phone || "",
    secondary_phone: person?.secondary_phone || "",
    email: person?.email || "",
    address: person?.address || "",
    location: person?.location || "",
    state: person?.state || "",
    country: person?.country || "",
    relation: person?.relation || "",
    notes: person?.notes || "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (person) {
        await updatePerson({ id: person.id, ...formState });
        toast.success("Person updated successfully");
      } else {
        await createPerson(formState);
        toast.success("Person created successfully");
      }
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to save person");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>First Name</Label>
          <Input
            name="first_name"
            value={formState.first_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>Last Name</Label>
          <Input
            name="last_name"
            value={formState.last_name}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Sur Name</Label>
          <Input
            name="sur_name"
            value={formState.sur_name}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Primary Phone</Label>
          <Input
            name="primary_phone"
            value={formState.primary_phone}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Secondary Phone</Label>
          <Input
            name="secondary_phone"
            value={formState.secondary_phone}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            name="email"
            value={formState.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Address</Label>
          <Input
            name="address"
            value={formState.address}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>Location</Label>
          <Input
            name="location"
            value={formState.location}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label>State</Label>
          <Input name="state" value={formState.state} onChange={handleChange} />
        </div>
        <div>
          <Label>Country</Label>
          <Input
            name="country"
            value={formState.country}
            onChange={handleChange}
          />
        </div>
        <div className="md:col-span-2">
          <Label>Relation</Label>
          <Input
            name="relation"
            value={formState.relation}
            onChange={handleChange}
          />
        </div>
        <div className="md:col-span-2">
          <Label>Notes</Label>
          <Textarea
            name="notes"
            value={formState.notes}
            onChange={handleChange}
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : person ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
