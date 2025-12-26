// src/Pages/User/MesReservationsPage.tsx
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { getReservations } from '../../services/reservation';
import type { Reservation } from '../../types/api';
import { CalendarCheck, CarFrontFill, GeoAltFill, ClockHistory, CalendarX, ArrowRight } from 'react-bootstrap-icons';
import LoadingSpinner from '../../Components/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const MesReservationsPage: React.FC = () => {
    const { user } = useAuth();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Idéalement, l'API devrait filtrer par l'utilisateur connecté automatiquement.
        // Si l'endpoint retourne tout, il faudrait filtrer côté client, mais supposons que l'API gère le contexte.
        if (user) {
            fetchReservations();
        }
    }, [user]);

    const fetchReservations = async () => {
        try {
            // L'API devrait filtrer les réservations pour l'user courant si c'est un endpoint 'me' ou via le token
            // Ici, on utilise getReservations générique, en espérant que le backend filtre ou on le fera ici si besoin.
            // Note: Si getReservations est admin-only, il faudra peut-être créer un endpoint spécifique ou filtrer.
            // Pour l'instant on tente l'appel.
            const response = await getReservations();

            // Si l'API retourne toutes les résa (admin), on filtre côté client par sécurité si on reçoit tout
            // Cela dépend de l'implémentation backend. Supposons ici que response contient les résa de l'utilisateur.
            // Si data est une pagination ou un tableau direct :
            const data = Array.isArray(response) ? response : (response as any).data || [];

            // Filtrage simulé côté client si l'API renvoie tout (à adapter selon backend)
            // Si l'utilisateur est client, on ne montre que les siennes.
            const myReservations = data.filter((res: Reservation) =>
                res.client_id === user?.client?.id || res.user_id === user?.id
            );

            setReservations(myReservations);
        } catch (err) {
            console.error("Erreur récupération réservations", err);
            setError("Impossible de charger vos réservations.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'en attente': return <Badge bg="warning" text="dark">En attente</Badge>;
            case 'confirmée': return <Badge bg="success">Confirmée</Badge>;
            case 'annulée': return <Badge bg="danger">Annulée</Badge>;
            case 'terminée': return <Badge bg="secondary">Terminée</Badge>;
            default: return <Badge bg="light" text="dark">{status}</Badge>;
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="py-4">
            <div className="mb-4">
                <h1 className="fw-bold text-primary mb-2">
                    <CalendarCheck className="me-3" />
                    Mes Réservations
                </h1>
                <p className="text-muted">Retrouvez l'historique et le statut de vos locations.</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && reservations.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-4 border-2 border-dashed">
                    <CalendarX size={48} className="text-muted mb-3" />
                    <h4 className="text-muted">Aucune réservation trouvée</h4>
                    <p className="text-muted mb-4 opacity-75">Vous n'avez pas encore effectué de réservation.</p>
                    <Link to="/voitures-public">
                        <Button variant="primary" className="rounded-pill px-4 fw-semibold">
                            Louer un véhicule <ArrowRight className="ms-2" />
                        </Button>
                    </Link>
                </div>
            ) : (
                <Row xs={1} md={2} xl={3} className="g-4">
                    {reservations.map(resa => (
                        <Col key={resa.id}>
                            <Card className="h-100 border-0 shadow-sm card-hover">
                                <Card.Header className="bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center text-muted small">
                                        <ClockHistory className="me-2" />
                                        {new Date(resa.date_debut).toLocaleDateString()}
                                    </div>
                                    {getStatusBadge(resa.statut)}
                                </Card.Header>
                                <Card.Body className="p-4">
                                    <h5 className="fw-bold mb-3">
                                        {resa.voiture ? `${resa.voiture.marque} ${resa.voiture.modele}` : 'Véhicule inconnu'}
                                    </h5>

                                    <div className="vstack gap-2 mb-4">
                                        <div className="d-flex align-items-start text-muted small">
                                            <CalendarCheck className="me-2 mt-1" />
                                            <div>
                                                Du <strong>{new Date(resa.date_debut).toLocaleDateString()}</strong><br />
                                                au <strong>{new Date(resa.date_fin).toLocaleDateString()}</strong>
                                            </div>
                                        </div>
                                        {(resa.agence_retrait || resa.voiture?.agence) && (
                                            <div className="d-flex align-items-center text-muted small">
                                                <GeoAltFill className="me-2" />
                                                <span>
                                                    {resa.agence_retrait?.nom || resa.voiture?.agence?.nom || 'Agence'}
                                                    <span className="mx-1">-</span>
                                                    {resa.agence_retrait?.ville || resa.voiture?.agence?.ville || ''}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                                        <div>
                                            <span className="text-muted small d-block">Total</span>
                                            <span className="fw-bold text-primary fs-5">{resa.prix_total} €</span>
                                        </div>
                                        <Button variant="outline-dark" size="sm" className="rounded-pill">
                                            Détails
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default MesReservationsPage;
