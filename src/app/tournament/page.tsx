"use client";

import React from "react";
import SwissTournamentManager from "@/components/SwissTournamentManager";

const TournamentPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-white">
      <SwissTournamentManager />
    </div>
  );
};

export default TournamentPage; 