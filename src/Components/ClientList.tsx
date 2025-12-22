// src/components/ClientList.tsx
import React, { useEffect, useState } from "react";
import { getClients, deleteClient } from "../services/client";
import type { Client } from "../types/api";

const ClientList: React.FC<{ token: string }> = ({ token }) => {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    getClients(token)
      .then(setClients)
      .catch(err => console.error(err));
  }, [token]);

  const handleDelete = async (id: number) => {
    await deleteClient(id, token);
    setClients(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div>
      <h2>Liste des clients</h2>
      <ul>
        {clients.map(client => (
          <li key={client.id}>
            {client.user?.name} - {client.numero_permis} - {client.telephone}
            <button onClick={() => handleDelete(client.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClientList;
