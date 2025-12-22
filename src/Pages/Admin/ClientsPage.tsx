// src/pages/ClientsPage.tsx
import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import ClientForm from "../../Components/ClientForm";
import ClientTable from "../../Components/ClientTable";
import { Alert } from "react-bootstrap";

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
      {/* <h1>Gestion des clients</h1> */}
      {/* <ClientForm token={token} onClientAdded={handleClientAdded} /> */}
      <hr className="my-4" />
      <h2 className="mb-3">Liste des clients</h2>
      <ClientTable token={token} key={refreshKey} />
    </div>
  );
};

export default ClientsPage;
