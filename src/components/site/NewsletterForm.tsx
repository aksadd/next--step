import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { subscribeToNewsletter } from "@/lib/content.functions";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [consent, setConsent] = useState(false);
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      subscribeToNewsletter({ data: { email, first_name: firstName, consent: true as const } }),
    onSuccess: () => {
      setDone(true);
      setEmail("");
      setFirstName("");
      setConsent(false);
      toast.success("You're on the list. Talk soon.");
    },
    onError: (error: Error) => toast.error(error.message || "Something went wrong."),
  });

  if (done) {
    return (
      <p className="text-sm font-medium">
        Thank you — you'll hear from Next Step when the next episode lands.
      </p>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!consent) {
          toast.error("Please tick the consent box so we can email you.");
          return;
        }
        mutation.mutate();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="newsletter-first-name">First name (optional)</Label>
          <Input
            id="newsletter-first-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="given-name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="newsletter-email">Email</Label>
          <Input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </div>
      </div>
      <div className="flex items-start gap-2">
        <Checkbox
          id="newsletter-consent"
          checked={consent}
          onCheckedChange={(value) => setConsent(value === true)}
        />
        <Label htmlFor="newsletter-consent" className="text-sm font-normal leading-snug text-muted-foreground">
          Yes, email me when a new episode is out. I can unsubscribe any time.
        </Label>
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Adding you…" : "Keep me posted"}
      </Button>
    </form>
  );
}
