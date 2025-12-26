// src/Pages/Admin/ReservationsAdminPage.tsx
import React, { useEffect, useState } from 'react';
import { Card, Table, Badge, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { getReservations, deleteReservation, updateReservation } from '../../services/reservation';
import type { Reservation } from '../../types/api';
import { Trash, CheckLg } from 'react-bootstrap-icons';

const ReservationsAdminPage: React.FC = () => {
    const { token } = useAuth();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            const data = await getReservations();
            setReservations(data);
            setLoading(false);
        } catch (err) {
            console.error('Erreur lors de la récupération des réservations:', err);
            setError('Impossible de charger les réservations');
            setLoading(false);
        }
    };

    const handleValidate = async (id: number) => {
        if (!window.confirm('Voulez-vous vraiment valider cette réservation ?')) {
            return;
        }

        try {
            await updateReservation(id, { statut: 'confirmee' });
            setReservations(prev => prev.map(r => r.id === id ? { ...r, statut: 'confirmee' } : r));
        } catch (err) {
            console.error('Erreur lors de la validation:', err);
            setError('Impossible de valider la réservation');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
            return;
        }

        try {
            await deleteReservation(id);
            setReservations(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
            setError('Impossible de supprimer la réservation');
        }
    };

    const getStatusBadge = (statut: string) => {
        const variants: Record<string, string> = {
            'en_attente': 'warning',
            'confirmee': 'info',
            'en_cours': 'primary',
            'terminee': 'success',
            'annulee': 'danger'
        };

        const labels: Record<string, string> = {
            'en_attente': 'En attente',
            'confirmee': 'Confirmée',
            'en_cours': 'En cours',
            'terminee': 'Terminée',
            'annulee': 'Annulée'
        };

        return <Badge bg={variants[statut] || 'secondary'}>{labels[statut] || statut}</Badge>;
    };

    if (!token) {
        return <Alert variant="danger">Vous devez être connecté pour accéder à cette page.</Alert>;
    }

    if (loading) {
        return <div className="text-center py-5">Chargement des réservations...</div>;
    }

    return (
        <>
            <h1 className="mb-4">Gestion des Réservations</h1>

            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

            <Card className="shadow-sm">
                <Card.Body>
                    {reservations.length === 0 ? (
                        <Alert variant="info">Aucune réservation trouvée.</Alert>
                    ) : (
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Client</th>
                                    <th>Voiture</th>
                                    <th>Date Départ</th>
                                    <th>Date Retour</th>
                                    <th>Agence Départ</th>
                                    <th>Agence Retour</th>
                                    <th>Prix Total</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map((reservation) => (
                                    <tr key={reservation.id}>
                                        <td>{reservation.id}</td>
                                        <td>
                                            {(reservation as any).user?.name || reservation.client?.user?.name || <span className="text-muted fst-italic">Client inconnu</span>}
                                        </td>
                                        <td>{reservation.voiture ? `${reservation.voiture.marque} ${reservation.voiture.modele}` : <span className="text-muted">Véhicule supprimé</span>}</td>
                                        <td>
                                            {new Date(reservation.date_depart || reservation.date_debut).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td>
                                            {new Date(reservation.date_retour || reservation.date_fin).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td>
                                            {reservation.agence_retrait ?
                                                `${reservation.agence_retrait.nom} - ${reservation.agence_retrait.ville}` :
                                                reservation.voiture?.agence ?
                                                    `${reservation.voiture.agence.nom} - ${reservation.voiture.agence.ville}` :
                                                    <span className="text-danger small fst-italic">Agence inconnue</span>}
                                        </td>
                                        <td>
                                            {reservation.agence_retour ?
                                                `${reservation.agence_retour.nom} - ${reservation.agence_retour.ville}` :
                                                // If return agency is missing, we don't necessarily show 'Unknown' if it implies dropping off at same location,
                                                // but for now let's be explicit or just keep the dash for return if optional.
                                                // User complained about 'empty', so let's show 'Idem départ' or '-' if logic dictates.
                                                // Let's stick to '-' for return if it's not set, as it might mean 'Same as departure' in some business logic,
                                                // BUT for Departure, it *must* be known.
                                                <span className="text-muted">-</span>}
                                        </td>
                                        <td className="fw-bold text-primary">{reservation.prix_total} FCFA</td>
                                        <td>{getStatusBadge(reservation.statut)}</td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                {reservation.statut === 'en_attente' && (
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        title="Valider la réservation"
                                                        onClick={() => handleValidate(reservation.id)}
                                                    >
                                                        <CheckLg />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    title="Supprimer"
                                                    onClick={() => handleDelete(reservation.id)}
                                                >
                                                    <Trash />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <div className="mt-3 text-muted">
                <small>Total: {reservations.length} réservation(s)</small>
            </div>
        </>
    );
};

export default ReservationsAdminPage;
