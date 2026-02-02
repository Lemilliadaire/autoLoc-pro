// src/Components/UserDashboardStats.tsx
import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { CalendarCheck, Clock, CheckCircle, Wallet2 } from 'react-bootstrap-icons';
import { getReservations } from '../services/reservation';
import { useAuth } from '../hooks/useAuth';
import type { Reservation } from '../types/api';

interface UserStats {
    reservationsActives: number;
    reservationsPassees: number;
    prochaineReservation: string | null;
    totalDepense: number;
}

const UserDashboardStats: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<UserStats>({
        reservationsActives: 0,
        reservationsPassees: 0,
        prochaineReservation: null,
        totalDepense: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchUserStats();
        }
    }, [user]);

    const fetchUserStats = async () => {
        try {
            const res = await getReservations();
            const data = Array.isArray(res) ? res : (res as any).data || [];

            // Filtrer pour l'utilisateur courant
            const myReservations = data.filter((r: Reservation) =>
                r.client_id === user?.client?.id || r.user_id === user?.id
            );

            const now = new Date();

            // Stats calculation
            const actives = myReservations.filter((r: Reservation) =>
                ['en_cours', 'confirmee'].includes(r.statut)
            ).length;

            const passees = myReservations.filter((r: Reservation) =>
                ['terminee'].includes(r.statut) || (new Date(r.date_fin) < now && r.statut !== 'annulee')
            ).length;

            // Prochaine résa (la plus proche dans le futur)
            const futurReservations = myReservations.filter((r: Reservation) =>
                new Date(r.date_debut) > now && ['confirmee', 'en_attente'].includes(r.statut)
            ).sort((a: Reservation, b: Reservation) => new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime());

            const nextResa = futurReservations.length > 0 ? futurReservations[0].date_debut : null;

            // Total dépensé (approximatif sur bse de statut terminé/confirmé)
            const total = myReservations.filter((r: Reservation) =>
                ['terminee', 'confirmee', 'en_cours'].includes(r.statut)
            ).reduce((acc: number, curr: Reservation) => acc + (parseFloat(curr.prix_total?.toString() || '0')), 0);

            setStats({
                reservationsActives: actives,
                reservationsPassees: passees,
                prochaineReservation: nextResa,
                totalDepense: total
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'En cours / À venir',
            value: stats.reservationsActives,
            icon: <CalendarCheck size={28} />,
            color: 'primary',
            bgColor: '#e7f1ff', // Light Primary
        },
        {
            title: 'Locations Terminées',
            value: stats.reservationsPassees,
            icon: <CheckCircle size={28} />,
            color: 'success',
            bgColor: '#d1e7dd', // Light Success
        },
        {
            title: 'Prochain Départ',
            value: stats.prochaineReservation
                ? new Date(stats.prochaineReservation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                : '-',
            icon: <Clock size={28} />,
            color: 'info',
            bgColor: '#cff4fc', // Light Info
        },
        {
            title: 'Total Dépensé',
            value: `${stats.totalDepense.toLocaleString()} F`,
            icon: <Wallet2 size={28} />,
            color: 'warning',
            bgColor: '#fff3cd', // Light Warning
        }
    ];

    if (loading) {
        return (
            <div className="d-flex justify-content-center py-4">
                <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
            </div>
        );
    }

    return (
        <Row className="g-3 mb-4">
            {statCards.map((card, index) => (
                <Col key={index} xs={12} sm={6} xl={3}>
                    <Card className="h-100 border-0 shadow-sm overflow-hidden card-hover">
                        <Card.Body className="position-relative">
                            <div className="d-flex align-items-center mb-3">
                                <div className={`rounded-circle p-3 me-3 d-flex align-items-center justify-content-center`} style={{ backgroundColor: card.bgColor, color: `var(--bs-${card.color})` }}>
                                    {card.icon}
                                </div>
                                <div>
                                    <h3 className="mb-0 fw-bold">{card.value}</h3>
                                    <div className="text-muted small fw-medium">{card.title}</div>
                                </div>
                            </div>
                            {/* Decorative generic shape could go here */}
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default UserDashboardStats;
