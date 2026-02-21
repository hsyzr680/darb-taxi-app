"use client";

import { jsPDF } from "jspdf";
import type { Ride } from "@/types/database";

function generateInvoiceNumber(): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `DARB-${y}${m}-${random}`;
}

export async function generateInvoicePDF(ride: Ride, riderName?: string) {
  const doc = new jsPDF();
  const invNum = generateInvoiceNumber();

  doc.setFontSize(22);
  doc.text("Darb", 20, 25);
  doc.setFontSize(10);
  doc.text("درب - Taxi Receipt", 20, 32);
  doc.text(`Invoice #${invNum}`, 20, 40);
  doc.text(`Date: ${new Date(ride.created_at).toLocaleString()}`, 20, 47);

  doc.setDrawColor(200, 200, 200);
  doc.line(20, 52, 190, 52);

  doc.setFontSize(12);
  doc.text("Trip Details", 20, 62);
  doc.setFontSize(10);
  doc.text(`Pickup: ${ride.pickup_address}`, 20, 70);
  doc.text(`Dropoff: ${ride.dropoff_address}`, 20, 77);
  if (riderName) doc.text(`Rider: ${riderName}`, 20, 84);

  doc.line(20, 90, 190, 90);

  const price = (ride.final_price ?? ride.base_price * ride.surge_multiplier).toFixed(2);
  doc.setFontSize(14);
  doc.text(`Total: ${price} SAR`, 20, 102);

  doc.setFontSize(8);
  doc.text("Thank you for using Darb. Safe travels!", 20, 115);
  doc.text("شكراً لاستخدام درب. رحلة آمنة!", 20, 121);

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  return { url, invoiceNumber: invNum };
}
