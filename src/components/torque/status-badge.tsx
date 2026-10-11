import type { LeadStatus, VehicleStatus } from "@/db/schema";
import { LEAD_STATUS, VEHICLE_STATUS } from "@/lib/format";
import { cn } from "@/lib/utils";

const VEHICLE_TONE: Record<VehicleStatus, string> = {
  available: "bg-emerald-100 text-emerald-800",
  reserved: "bg-amber-100 text-amber-800",
  sold: "bg-neutral-200 text-neutral-700",
};

const LEAD_TONE: Record<LeadStatus, string> = {
  new: "bg-red-100 text-red-800",
  in_progress: "bg-sky-100 text-sky-800",
  won: "bg-emerald-100 text-emerald-800",
  lost: "bg-neutral-200 text-neutral-600",
};

const base = "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap";

export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  return <span className={cn(base, VEHICLE_TONE[status])}>{VEHICLE_STATUS[status]}</span>;
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <span className={cn(base, LEAD_TONE[status])}>{LEAD_STATUS[status]}</span>;
}
