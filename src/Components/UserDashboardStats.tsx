// src/Components/UserDashboardStats.tsx
import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { CalendarCheck, Clock, CheckCircle } from 'react-bootstrap-icons';

interface UserStats {
    reservationsActives: number;
    reservationsPassees: number;
    prochaineReservation: string | null;
}

const UserDashboardStats: React.FC = () => {
    const [stats, setStats] = useState<UserStats>({
        reservationsActives: 0,
        reservationsPassees: 0,
        prochaineReservation: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserStats();
    }, []);

    const fetchUserStats = async () => {
        try {
            // TODO: Implémenter l'appel API pour récupérer les statistiques de l'utilisateur
            // const response = await api.get(`/clients/${user?.client?.id}/reservations`);

            // Données simulées pour l'instant
            setStats({
                reservationsActives: 2,
                reservationsPassees: 5,
                prochaineReservation: '2025-01-15'
            });
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Réservations Actives',
            value: stats.reservationsActives,
            icon: <CalendarCheck size={32} />,
            color: 'primary',
            bgColor: 'rgba(13, 110, 253, 0.1)'
        },
        {
            title: 'Locations Terminées',
            value: stats.reservationsPassees,
            icon: <CheckCircle size={32} />,
            color: 'success',
            bgColor: 'rgba(25, 135, 84, 0.1)'
        },
        {
            title: 'Prochaine Réservation',
            value: stats.prochaineReservation
                ? new Date(stats.prochaineReservation).toLocaleDateString('fr-FR')
                : 'Aucune',
            icon: <Clock size={32} />,
            color: 'info',
            bgColor: 'rgba(13, 202, 240, 0.1)'
        }
    ];

    if (loading) {
        return <div className="text-center py-3">Chargement...</div>;
    }

    return (
        <Row className="g-4 mb-4">
            {statCards.map((card, index) => (
                <Col key={index} xs={12} md={4}>
                    <Card className="shadow-sm h-100 border-0">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted mb-1 small">{card.title}</p>
                                    <h4 className="mb-0 fw-bold">{card.value}</h4>
                                </div>
                                <div
                                    className={`text-${card.color} rounded-circle p-3`}
                                    style={{ backgroundColor: card.bgColor }}
                                >
                                    {card.icon}
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default UserDashboardStats;
