// src/pages/VoituresAdminPage.tsx
import React from "react";
import { useAuth } from "../../hooks/useAuth";
import VoitureForm from "../../Components/VoitureForm";
import VoitureTable from "../../Components/VoitureTable";

const VoituresAdminPage: React.FC = () => {
  const { token } = useAuth();

  if (!token) {
    return <p>Vous devez être connecté pour voir cette page.</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Gestion des voitures 🚘 (Admin)</h1>
      <VoitureForm token={token!} />
      <VoitureTable token={token!} />
    </div>
  );
};

export default VoituresAdminPage;
