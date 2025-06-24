"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, User } from "lucide-react";
import type { Person } from "../actions/people-actions";

interface PersonCardProps {
  person: Person;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PersonCard({ person, onEdit, onDelete }: PersonCardProps) {
  return (
    <Card className="border border-border bg-card hover:bg-accent/50 transition-colors">
      <CardHeader className="flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-lg">
            {person.first_name} {person.last_name || ""} {person.sur_name || ""}
          </CardTitle>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <Button size="icon" variant="ghost" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {person.email && <p>Email: {person.email}</p>}
        {person.primary_phone && <p>Primary Phone: {person.primary_phone}</p>}
        {person.secondary_phone && (
          <p>Secondary Phone: {person.secondary_phone}</p>
        )}
        {person.address && <p>Address: {person.address}</p>}
        {person.location && <p>Location: {person.location}</p>}
        {person.state && <p>State: {person.state}</p>}
        {person.country && <p>Country: {person.country}</p>}
        {person.relation && <p>Relation: {person.relation}</p>}
        {person.notes && (
          <p className="whitespace-pre-wrap">Notes: {person.notes}</p>
        )}

        <div className="flex gap-2 pt-2 text-xs">
          {person.created_at && (
            <span className="text-muted-foreground">
              Created: {new Date(person.created_at).toLocaleString()}
            </span>
          )}
          {person.updated_at && person.updated_at !== person.created_at && (
            <span className="text-muted-foreground">
              • Updated: {new Date(person.updated_at).toLocaleString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
