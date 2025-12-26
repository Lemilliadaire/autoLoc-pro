// src/pages/AgencesAdminPage.tsx
import React, { useState } from "react";
import AgenceForm from "../../Components/AgenceForm";
import AgenceTable from "../../Components/AgenceTable";
import { useAuth } from "../../hooks/useAuth";
import { createAgence } from "../../services/agence";
import { Alert } from "react-bootstrap";

const AgencesAdminPage: React.FC = () => {
  const { token } = useAuth();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Pour forcer le re-rendu de la table

  const handleSubmit = async (formData: FormData, resetForm: () => void) => {
    if (!token) {
      setFeedback({ type: 'error', message: "Vous n'êtes pas authentifié." });
      return;
    }
    setFeedback(null);
    try {
      await createAgence(formData, token);
      setFeedback({ type: 'success', message: "Agence enregistrée avec succès !" });
      resetForm(); // Vide le formulaire
      setRefreshKey(prevKey => prevKey + 1); // Rafraîchit la table
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: "Erreur lors de l'enregistrement de l'agence." });
    }
  };

  if (!token) {
    return <p>Vous devez être connecté pour voir cette page.</p>;
  }

  return (
    <div>
      <h1>Gestion des agences (Admin)</h1>
      {feedback && <Alert variant={feedback.type} onClose={() => setFeedback(null)} dismissible>{feedback.message}</Alert>}
      <AgenceForm onSubmit={handleSubmit} />
      <AgenceTable token={token} key={refreshKey} />
    </div>
  );
};

export default AgencesAdminPage;
