// src/pages/CategoriesPage.tsx
import React, { useState, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import CategorieForm from "../../Components/CategorieForm";
import CategorieTable from "../../Components/CategorieTable";
import { createCategorie } from "../../services/categorie";
import { Alert } from "react-bootstrap";

const CategoriesPage: React.FC = () => {
  const { token } = useAuth();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSubmit = async (
    data: { nom: string; description: string; prix_journalier: number },
    resetForm: () => void
  ) => {
    if (!token) {
      setFeedback({ type: 'error', message: "Vous n'êtes pas authentifié." });
      return;
    }
    setFeedback(null);
    try {
      console.log("Envoi des données:", data);
      const response = await createCategorie(data, token);
      console.log("Réponse du serveur:", response);
      setFeedback({ type: 'success', message: response.message || "Catégorie créée avec succès !" });
      resetForm();
      // Force le rafraîchissement du tableau en changeant la clé
      setRefreshKey(prevKey => prevKey + 1);
    } catch (err: any) {
      console.error("Erreur complète:", err);
      console.error("Réponse d'erreur:", err.response?.data);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || "Erreur lors de la création de la catégorie."
      });
    }
  };

  if (!token) {
    return <p>Vous devez être connecté pour voir cette page.</p>;
  }

  return (
    <div>
      <h1>Gestion des catégories 📂 (Admin)</h1>
      {feedback && <Alert variant={feedback.type} onClose={() => setFeedback(null)} dismissible>{feedback.message}</Alert>}
      <CategorieForm onSubmit={handleSubmit} />
      <CategorieTable token={token} key={refreshKey} />
    </div>
  );
};

export default CategoriesPage;
