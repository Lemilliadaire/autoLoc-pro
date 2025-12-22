import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import api from '../services/api'; 

/**
 * Interface pour l'état géré par le hook useFetch.
 * @template T Le type de données attendu de l'API.
 */
interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: AxiosError | null;
}

/**
 * Un hook personnalisé pour récupérer des données depuis l'API.
 * Il gère l'état de chargement, les erreurs et les données.
 * 
 * @param url L'endpoint de l'API à interroger.
 * @returns Un objet contenant les données, l'état de chargement et une éventuelle erreur.
 */
export function useFetch<T>(url: string) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      // Réinitialise l'état à chaque nouvel appel
      setState({ data: null, loading: true, error: null });

      try {
        const response = await api.get<T>(url, {
          signal: controller.signal,
        });
        setState({ data: response.data, loading: false, error: null });
      } catch (err) {
        // On s'assure que l'erreur n'est pas due à l'annulation du composant
        if (err instanceof AxiosError && err.name !== 'CanceledError') {
          setState({ data: null, loading: false, error: err });
        }
      }
    };

    fetchData();

    // Fonction de nettoyage pour annuler la requête si le composant est démonté
    return () => {
      controller.abort();
    };
  }, [url]); // Le hook se ré-exécute si l'URL change

  return state;
}