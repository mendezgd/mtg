"use client";

import React from "react";
import SwissTournamentManager from "@/components/SwissTournamentManager";

const TournamentPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <SwissTournamentManager />
    </div>
  );
};

export default TournamentPage; 