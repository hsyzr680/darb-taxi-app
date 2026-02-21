"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/context/LanguageContext";
import type { RejectionReason } from "@/types/database";

const REASONS: { value: RejectionReason; labelKey: string }[] = [
  { value: "traffic", labelKey: "traffic" },
  { value: "too_far", labelKey: "too_far" },
  { value: "vehicle_issue", labelKey: "vehicle_issue" },
  { value: "personal", labelKey: "personal" },
  { value: "other", labelKey: "other" },
];

interface RejectReasonDialogProps {
  onConfirm: (reason: RejectionReason, notes?: string) => void;
  onCancel: () => void;
}

export function RejectReasonDialog({ onConfirm, onCancel }: RejectReasonDialogProps) {
  const { t } = useLanguage();
  const [reason, setReason] = useState<RejectionReason | "">("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (reason) {
      onConfirm(reason as RejectionReason, notes || undefined);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>{t("rejectReason")}</Label>
        <Select value={reason} onValueChange={(v) => setReason(v as RejectionReason)}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select reason" />
          </SelectTrigger>
          <SelectContent>
            {REASONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {t(r.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Notes (optional)</Label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Additional details"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={!reason}>
          {t("reject")}
        </Button>
      </div>
    </div>
  );
}
