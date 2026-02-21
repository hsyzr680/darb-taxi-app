"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { generateInvoicePDF } from "@/services/invoiceService";
import type { Ride } from "@/types/database";

interface InvoiceButtonProps {
  ride: Ride;
  riderName?: string;
}

export function InvoiceButton({ ride, riderName }: InvoiceButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (ride.status !== "completed") return;
    setLoading(true);
    try {
      const { url } = await generateInvoicePDF(ride, riderName);
      const a = document.createElement("a");
      a.href = url;
      a.download = `darb-invoice-${ride.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (ride.status !== "completed") return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={loading}
    >
      <FileText className="h-4 w-4 mr-2" />
      {loading ? "..." : "Download Invoice"}
    </Button>
  );
}
