// src/pages/ClientsPage.tsx
import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import ClientForm from "../../Components/ClientForm";
import ClientTable from "../../Components/ClientTable";
import { Alert, Card } from "react-bootstrap";

const ClientsPage: React.FC = () => {
  const { token } = useAuth();
  // Clé pour forcer le rafraîchissement de la table après un ajout
  const [refreshKey, setRefreshKey] = useState(0);

  const handleClientAdded = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  if (!token) {
    return <Alert variant="danger">Vous devez être connecté pour accéder à cette page.</Alert>;
  }

  return (
    <div>
      <h1>Gestion des clients 👥</h1>
      <Card className="shadow-sm mb-4">
        <Card.Body><Card.Title as="h5" className="mb-3">Ajouter un nouveau client</Card.Title><ClientForm token={token} onClientAdded={handleClientAdded} /></Card.Body>
      </Card>
      <hr className="my-4" />
      <h2 className="mb-3">Liste des clients</h2>
      <ClientTable token={token} key={refreshKey} />
    </div>
  );
};

export default ClientsPage;
