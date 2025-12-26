// src/Components/AdminDashboardStats.tsx
import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Row, Col, Card } from 'react-bootstrap';
import { CarFrontFill, CalendarCheck, PeopleFill, CurrencyDollar } from 'react-bootstrap-icons';
import api from '../services/api';
import { getReservations } from '../services/reservation';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface Stats {
    totalVoitures: number;
    totalReservations: number;
    totalClients: number;
    revenuTotal: number;
    voituresParStatut: { disponible: number; loue: number; maintenance: number };
    revenueParMois: number[];
    moisLabels: string[];
}

const AdminDashboardStats: React.FC = () => {
    const [stats, setStats] = useState<Stats>({
        totalVoitures: 0,
        totalReservations: 0,
        totalClients: 0,
        revenuTotal: 0,
        voituresParStatut: { disponible: 0, loue: 0, maintenance: 0 },
        revenueParMois: [],
        moisLabels: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [voituresRes, clientsRes, reservationsData] = await Promise.all([
                api.get('/voitures').catch(() => ({ data: [] })),
                api.get('/clients').catch(() => ({ data: [] })),
                getReservations().catch(() => [])
            ]);

            const voitures = voituresRes.data.data || voituresRes.data || [];
            const clients = clientsRes.data || [];
            // reservationsData est directement le tableau de réservations grâce au service
            const reservations = Array.isArray(reservationsData) ? reservationsData : [];

            // Calcul des voitures par statut
            const voituresParStatut = {
                disponible: Array.isArray(voitures) ? voitures.filter((v: any) => v.statut === 'disponible').length : 0,
                loue: Array.isArray(voitures) ? voitures.filter((v: any) => v.statut === 'loue').length : 0,
                maintenance: Array.isArray(voitures) ? voitures.filter((v: any) => v.statut === 'maintenance').length : 0
            };

            // Calcul du revenu total
            const revenuTotal = reservations.reduce((acc: number, curr: any) => {
                // On s'assure que le prix est un nombre valide
                const prix = parseFloat(curr.prix_total) || 0;
                // On ne compte que les réservations confirmées, en cours ou terminées pour le revenu réel
                if (['confirmee', 'en_cours', 'terminee'].includes(curr.statut)) {
                    return acc + prix;
                }
                return acc;
            }, 0);

            // Préparation des données pour le graphique en barres (Revenus par mois)
            // On prend les 6 derniers mois
            const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
            const today = new Date();
            const last6Months = [];
            const revenuePerMonth = [];
            
            for (let i = 5; i >= 0; i--) {
                const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                last6Months.push(monthNames[d.getMonth()]);

                // Filtrer les réservations de ce mois
                const monthRevenue = reservations
                    .filter((r: any) => {
                        const dateRes = new Date(r.created_at || r.date_depart); // Utiliser created_at si dispo, sinon date_depart
                        return dateRes.getMonth() === d.getMonth() &&
                            dateRes.getFullYear() === d.getFullYear() &&
                            ['confirmee', 'en_cours', 'terminee'].includes(r.statut);
                    })
                    .reduce((acc: number, curr: any) => acc + (parseFloat(curr.prix_total) || 0), 0);

                revenuePerMonth.push(monthRevenue);
            }

            setStats({
                totalVoitures: Array.isArray(voitures) ? voitures.length : 0,
                totalReservations: reservations.length,
                totalClients: Array.isArray(clients) ? clients.length : 0,
                revenuTotal,
                voituresParStatut,
                revenueParMois: revenuePerMonth,
                moisLabels: last6Months
            });
        } catch (error) {
            console.error('Erreur stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const kpiCards = [
        {
            title: 'Total Voitures',
            value: stats.totalVoitures,
            icon: <CarFrontFill size={24} />,
            color: 'primary',
            trend: 'Flotte',
            trendUp: true
        },
        {
            title: 'Réservations',
            value: stats.totalReservations,
            icon: <CalendarCheck size={24} />,
            color: 'success',
            trend: 'Global',
            trendUp: true
        },
        {
            title: 'Clients',
            value: stats.totalClients,
            icon: <PeopleFill size={24} />,
            color: 'info',
            trend: 'Actifs',
            trendUp: true
        },
        {
            title: 'Revenus',
            value: `${stats.revenuTotal.toLocaleString()} FCFA`,
            icon: <CurrencyDollar size={24} />,
            color: 'warning',
            trend: 'Total',
            trendUp: true
        }
    ];

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
        scales: {
            x: { grid: { display: false } },
            y: {
                border: { dash: [4, 4] },
                grid: { color: '#f0f0f0' },
                ticks: {
                    callback: function (value: any) {
                        return value + ' F';
                    }
                }
            }
        },
        elements: {
            bar: { borderRadius: 4 }
        }
    };

    const barChartData = {
        labels: stats.moisLabels.length > 0 ? stats.moisLabels : ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [
            {
                label: 'Revenus',
                data: stats.revenueParMois.length > 0 ? stats.revenueParMois : [0, 0, 0, 0, 0, 0],
                backgroundColor: '#0d6efd',
                hoverBackgroundColor: '#0b5ed7',
                barPercentage: 0.6,
            }
        ],
    };

    const doughnutChartData = {
        labels: ['Disponibles', 'Loués', 'Maintenance'],
        datasets: [
            {
                data: [
                    stats.voituresParStatut.disponible,
                    stats.voituresParStatut.loue,
                    stats.voituresParStatut.maintenance
                ],
                backgroundColor: ['#198754', '#ffc107', '#dc3545'],
                borderWidth: 0,
                hoverOffset: 4
            },
        ],
    };

    if (loading) return <div className="text-center py-5 text-muted">Chargement...</div>;

    return (
        <>
            {/* KPI Cards */}
            <Row className="g-3 mb-4">
                {kpiCards.map((card, index) => (
                    <Col key={index} xs={12} sm={6} lg={3}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body className="p-3">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div className={`p-2 rounded-3 bg-${card.color} bg-opacity-10 text-${card.color}`}>
                                        {card.icon}
                                    </div>
                                    <div className={`badge bg-${card.color} bg-opacity-10 text-${card.color} d-flex align-items-center`}>
                                        {card.trend}
                                    </div>
                                </div>
                                <h3 className="fw-bold mb-1">{card.value}</h3>
                                <p className="text-muted small mb-0">{card.title}</p>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Charts */}
            <Row className="g-3">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-0 py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold mb-0">Évolution des Revenus (6 derniers mois)</h6>
                                <small className="text-muted">En FCFA</small>
                            </div>
                        </Card.Header>
                        <Card.Body style={{ height: '300px' }}>
                            <Bar options={chartOptions} data={barChartData} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-0 py-3">
                            <h6 className="fw-bold mb-0">État du Parc</h6>
                        </Card.Header>
                        <Card.Body className="d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
                            <div style={{ width: '250px', height: '250px' }}>
                                <Doughnut
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { position: 'bottom' },
                                            tooltip: {
                                                callbacks: {
                                                    label: function (context: any) {
                                                        const label = context.label || '';
                                                        const value = context.raw || 0;
                                                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                                                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                                        return `${label}: ${value} (${percentage}%)`;
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                    data={doughnutChartData}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default AdminDashboardStats;
