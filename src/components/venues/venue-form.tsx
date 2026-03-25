"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Venue } from "@/lib/venues/types";

interface VenueFormProps {
  venue?: Venue;
  onSuccess: (venueId: string) => void;
}

export function VenueForm({ venue, onSuccess }: VenueFormProps) {
  const isEdit = !!venue;

  const [name, setName] = useState(venue?.name ?? "");
  const [address, setAddress] = useState(venue?.address ?? "");
  const [contactPerson, setContactPerson] = useState(
    venue?.contact_person ?? ""
  );
  const [contactEmail, setContactEmail] = useState(
    venue?.contact_email ?? ""
  );
  const [contactPhone, setContactPhone] = useState(
    venue?.contact_phone ?? ""
  );
  const [parking, setParking] = useState(venue?.parking ?? "");
  const [powerAccess, setPowerAccess] = useState(venue?.power_access ?? "");
  const [loadInRestrictions, setLoadInRestrictions] = useState(
    venue?.load_in_restrictions ?? ""
  );
  const [kitchenFacilities, setKitchenFacilities] = useState(
    venue?.kitchen_facilities ?? ""
  );
  const [notes, setNotes] = useState(venue?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Venue name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const body = {
      name,
      address,
      contact_person: contactPerson,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      parking,
      power_access: powerAccess,
      load_in_restrictions: loadInRestrictions,
      kitchen_facilities: kitchenFacilities,
      notes,
    };

    const url = isEdit ? `/api/venues/${venue.id}` : "/api/venues";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setIsSubmitting(false);
      return;
    }

    onSuccess(isEdit ? venue.id : data.id);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Venue name *</Label>
        <Input
          id="name"
          placeholder="e.g. The Grand Hall"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          placeholder="Full address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={isSubmitting}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactPerson">Contact person</Label>
        <Input
          id="contactPerson"
          placeholder="e.g. John Smith"
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input
            id="contactEmail"
            type="email"
            placeholder="venue@example.com"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPhone">Contact phone</Label>
          <Input
            id="contactPhone"
            placeholder="+44 7700 900000"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Practical details */}
      <div className="space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Practical details
        </h3>

        <div className="space-y-2">
          <Label htmlFor="parking">Parking</Label>
          <Textarea
            id="parking"
            placeholder="e.g. On-site car park, 20 spaces. Additional street parking available."
            value={parking}
            onChange={(e) => setParking(e.target.value)}
            disabled={isSubmitting}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="powerAccess">Power access</Label>
          <Textarea
            id="powerAccess"
            placeholder="e.g. 32A supply in the kitchen area. Extension leads needed for the marquee."
            value={powerAccess}
            onChange={(e) => setPowerAccess(e.target.value)}
            disabled={isSubmitting}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="loadInRestrictions">Load-in restrictions</Label>
          <Textarea
            id="loadInRestrictions"
            placeholder="e.g. Rear access only. Low clearance (2.1m). Loading bay available 7am-10am."
            value={loadInRestrictions}
            onChange={(e) => setLoadInRestrictions(e.target.value)}
            disabled={isSubmitting}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="kitchenFacilities">Kitchen facilities</Label>
          <Textarea
            id="kitchenFacilities"
            placeholder="e.g. Full commercial kitchen with 6-burner range, double oven, walk-in fridge."
            value={kitchenFacilities}
            onChange={(e) => setKitchenFacilities(e.target.value)}
            disabled={isSubmitting}
            rows={2}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any other notes about this venue..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSubmitting}
          rows={3}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="h-16 sm:hidden" />

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 p-3 backdrop-blur sm:static sm:inset-auto sm:z-auto sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none dark:border-zinc-800 dark:bg-zinc-950/95 sm:dark:bg-transparent">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting
            ? isEdit ? "Saving..." : "Creating..."
            : isEdit ? "Save changes" : "Create venue"}
        </Button>
      </div>
    </form>
  );
}
