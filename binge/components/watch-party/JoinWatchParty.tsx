"use client";

import { FormEvent, useState } from "react";
import { LogIn, PartyPopper } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinWatchParty } from "@/services/watchParty.service";

const JoinWatchParty = () => {
  const router = useRouter();

  const [partyCode, setPartyCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const normalizedCode = partyCode
      .trim()
      .toUpperCase();

    if (!normalizedCode) {
      toast.error("Enter a Watch Party code");
      return;
    }

    if (normalizedCode.length !== 8) {
      toast.error("Watch Party code must be 8 characters");
      return;
    }

    try {
      setLoading(true);

      await joinWatchParty(normalizedCode);

      toast.success("Joined Watch Party successfully");

      router.push(`/watch-party/${normalizedCode}`);
    } catch (error: any) {
      console.error(
        "Failed to join watch party:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to join Watch Party",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <PartyPopper className="h-7 w-7 text-red-500" />
        </div>

        <h2 className="text-xl font-bold text-foreground">
          Join a Watch Party
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Enter the party code shared by your friend.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5 space-y-3"
      >
        <Input
          value={partyCode}
          onChange={(event) =>
            setPartyCode(
              event.target.value
                .toUpperCase()
                .replace(/\s/g, "")
                .slice(0, 8),
            )
          }
          placeholder="Enter party code"
          maxLength={8}
          autoComplete="off"
          className="h-11 border-border bg-background text-center font-semibold tracking-[0.2em] text-foreground placeholder:font-normal placeholder:tracking-normal"
        />

        <Button
          type="submit"
          disabled={loading || !partyCode.trim()}
          className="h-11 w-full rounded-full bg-red-500 text-white hover:bg-red-600"
        >
          {loading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Joining...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Join Watch Party
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default JoinWatchParty;