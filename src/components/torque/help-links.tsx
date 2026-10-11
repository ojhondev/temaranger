"use client";

import { ChevronRight, CirclePlay, MessageSquareText } from "lucide-react";

import { useTour } from "./tour";

export function HelpLinks() {
  const { startTour, openHelp } = useTour();
  const row = "flex w-full items-center gap-2 py-2 text-left text-[13px] hover:text-primary";
  return (
    <div className="mt-1">
      <button type="button" onClick={() => startTour("boas-vindas")} className={row}>
        <CirclePlay className="size-4" /> <span className="flex-1">Fazer o tour guiado</span> <ChevronRight className="size-4" />
      </button>
      <button type="button" onClick={openHelp} className={row}>
        <MessageSquareText className="size-4" /> <span className="flex-1">Central de ajuda</span> <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
