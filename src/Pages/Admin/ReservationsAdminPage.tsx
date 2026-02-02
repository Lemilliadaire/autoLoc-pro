// src/Pages/Admin/ReservationsAdminPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
    Container, Row, Col, Card, Table, Badge, Button, Alert,
    Form, InputGroup, Modal, Spinner
} from 'react-bootstrap';
import {
    Search, FunnelFill, XCircle, Eye, CurrencyDollar,
    CheckLg, XOctagon, Trash, FileEarmarkText,
    FiletypePdf, Printer, Calendar, Building
} from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { getReservations, deleteReservation, updateReservation } from '../../services/reservation';
import { getPaiements, createPaiement } from '../../services/paiement';
import { getAgences } from '../../services/agence';
import { updateVoiture } from '../../services/voiture';
import type { Reservation, ReservationWithBalance, Paiement, Agence } from '../../types/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReservationsAdminPage: React.FC = () => {
    const { token } = useAuth();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [paiements, setPaiements] = useState<Paiement[]>([]);
    const [agences, setAgences] = useState<Agence[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [statutFilter, setStatutFilter] = useState('all');
    const [agenceFilter, setAgenceFilter] = useState('all');
    const [dateDebutFilter, setDateDebutFilter] = useState('');
    const [dateFinFilter, setDateFinFilter] = useState('');

    // Modals
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<ReservationWithBalance | null>(null);

    // Payment form
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('especes');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        if (!token) return;

        try {
            setLoading(true);
            const [reservationsData, paiementsData, agencesData] = await Promise.all([
                getReservations(),
                getPaiements(),
                getAgences()
            ]);

            setReservations(reservationsData);
            setPaiements(paiementsData);
            setAgences(agencesData);
            setLoading(false);
        } catch (err) {
            console.error('Erreur lors du chargement des données:', err);
            setError('Impossible de charger les données');
            setLoading(false);
        }
    };

    // Calculate reservations with balance
    const reservationsWithBalance: ReservationWithBalance[] = useMemo(() => {
        return reservations.map(reservation => {
            const reservationPayments = paiements.filter(p => p.reservation_id === reservation.id);
            const totalPaid = reservationPayments.reduce((sum, p) => sum + p.montant, 0);
            const balanceRemaining = reservation.prix_total - totalPaid;

            let paymentStatus: 'paid' | 'partial' | 'unpaid';
            if (balanceRemaining === 0) {
                paymentStatus = 'paid';
            } else if (totalPaid > 0) {
                paymentStatus = 'partial';
            } else {
                paymentStatus = 'unpaid';
            }

            return {
                ...reservation,
                total_paid: totalPaid,
                balance_remaining: balanceRemaining,
                payment_status: paymentStatus
            };
        });
    }, [reservations, paiements]);

    // Filtered reservations
    const filteredReservations = useMemo(() => {
        return reservationsWithBalance.filter(reservation => {
            // Search filter
            const searchLower = searchTerm.toLowerCase();
            const clientName = (reservation as any).user?.name || reservation.client?.user?.name || '';
            const clientEmail = (reservation as any).user?.email || reservation.client?.user?.email || '';
            const voitureName = reservation.voiture ? `${reservation.voiture.marque} ${reservation.voiture.modele}` : '';

            const matchesSearch = !searchTerm ||
                clientName.toLowerCase().includes(searchLower) ||
                clientEmail.toLowerCase().includes(searchLower) ||
                voitureName.toLowerCase().includes(searchLower) ||
                reservation.id.toString().includes(searchLower);

            // Status filter
            const matchesStatut = statutFilter === 'all' || reservation.statut === statutFilter;

            // Agency filter
            const agenceId = reservation.agence_retrait?.id || reservation.voiture?.agence?.id;
            const matchesAgence = agenceFilter === 'all' || agenceId?.toString() === agenceFilter;

            // Date filter
            const resaDate = new Date(reservation.date_depart || reservation.date_debut);
            const matchesDateDebut = !dateDebutFilter || resaDate >= new Date(dateDebutFilter);
            const matchesDateFin = !dateFinFilter || resaDate <= new Date(dateFinFilter);

            return matchesSearch && matchesStatut && matchesAgence && matchesDateDebut && matchesDateFin;
        });
    }, [reservationsWithBalance, searchTerm, statutFilter, agenceFilter, dateDebutFilter, dateFinFilter]);

    // Statistics
    const stats = useMemo(() => {
        const total = reservationsWithBalance.length;
        const enAttente = reservationsWithBalance.filter(r => r.statut === 'en_attente').length;

        return {
            total,
            enAttente
        };
    }, [reservationsWithBalance]);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) return;

        try {
            await deleteReservation(id);
            setReservations(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
            setError('Impossible de supprimer la réservation');
        }
    };

    const handleConfirm = async (id: number) => {
        if (!window.confirm('Voulez-vous vraiment confirmer cette réservation ?')) return;

        try {
            await updateReservation(id, { statut: 'confirmee' });

            // Also update the car status to 'loue'
            const reservation = reservations.find(r => r.id === id);
            if (reservation && reservation.voiture_id) {
                try {
                    await updateVoiture(reservation.voiture_id, { statut: 'loue' }, token!);
                } catch (vmErr) {
                    console.error("Erreur lors de la mise à jour du statut de la voiture", vmErr);
                }
            }

            setReservations(prev => prev.map(r => r.id === id ? { ...r, statut: 'confirmee' } : r));
        } catch (err) {
            console.error('Erreur lors de la confirmation:', err);
            setError('Impossible de confirmer la réservation');
        }
    };

    const handleCancel = async (id: number) => {
        if (!window.confirm('Voulez-vous vraiment annuler cette réservation ?')) return;

        try {
            await updateReservation(id, { statut: 'annulee' });
            setReservations(prev => prev.map(r => r.id === id ? { ...r, statut: 'annulee' } : r));
        } catch (err) {
            console.error('Erreur lors de l\'annulation:', err);
            setError('Impossible d\'annuler la réservation');
        }
    };

    const handleShowDetails = (reservation: ReservationWithBalance) => {
        setSelectedReservation(reservation);
        setShowDetailsModal(true);
    };

    const handleShowPayment = (reservation: ReservationWithBalance) => {
        setSelectedReservation(reservation);
        setPaymentAmount(reservation.balance_remaining.toString());
        setShowPaymentModal(true);
    };

    const handleSavePayment = async () => {
        if (!selectedReservation) return;

        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0 || amount > selectedReservation.balance_remaining) {
            setError('Montant invalide');
            return;
        }

        try {
            await createPaiement({
                reservation_id: selectedReservation.id,
                montant: amount,
                methode: paymentMethod,
                statut: 'valide',
                date_paiement: paymentDate
            });

            await fetchData();
            setShowPaymentModal(false);
            setPaymentAmount('');
        } catch (err) {
            console.error('Erreur lors de l\'enregistrement du paiement:', err);
            setError('Impossible d\'enregistrer le paiement');
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatutFilter('all');
        setAgenceFilter('all');
        setDateDebutFilter('');
        setDateFinFilter('');
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

    const getPaymentBadge = (status: 'paid' | 'partial' | 'unpaid', balance: number) => {
        if (status === 'paid') {
            return <Badge bg="success">Payé</Badge>;
        } else if (status === 'partial') {
            return <Badge bg="warning">Partiel</Badge>;
        } else {
            return <Badge bg="danger">Impayé</Badge>;
        }
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Client', 'Voiture', 'Date Départ', 'Date Retour', 'Agence', 'Prix Total', 'Statut'];
        const rows = filteredReservations.map(r => [
            r.id,
            (r as any).user?.name || r.client?.user?.name || 'N/A',
            r.voiture ? `${r.voiture.marque} ${r.voiture.modele}` : 'N/A',
            new Date(r.date_depart || r.date_debut).toLocaleDateString('fr-FR'),
            new Date(r.date_retour || r.date_fin).toLocaleDateString('fr-FR'),
            r.agence_retrait?.nom || r.voiture?.agence?.nom || 'N/A',
            r.prix_total,
            r.statut
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `reservations_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const exportToPDF = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.text('Rapport des Réservations', 14, 22);
        doc.setFontSize(11);
        doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);

        // Table
        autoTable(doc, {
            head: [['ID', 'Client', 'Voiture', 'Départ', 'Retour', 'Prix', 'Statut']],
            body: filteredReservations.map(r => [
                r.id,
                (r as any).user?.name || r.client?.user?.name || 'N/A',
                r.voiture ? `${r.voiture.marque} ${r.voiture.modele}` : 'N/A',
                new Date(r.date_depart || r.date_debut).toLocaleDateString('fr-FR'),
                new Date(r.date_retour || r.date_fin).toLocaleDateString('fr-FR'),
                `${r.prix_total} FCFA`,
                r.statut
            ]),
            startY: 35,
            styles: { fontSize: 8 }
        });

        doc.save(`reservations_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handlePrint = () => {
        window.print();
    };

    const downloadReservationPDF = (reservation: ReservationWithBalance) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(67, 126, 234); // Blue
        doc.text('DÉTAIL DE LA RÉSERVATION', 105, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Réservation #${reservation.id}`, 105, 30, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 105, 36, { align: 'center' });

        // Client Info
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Informations Client', 14, 50);
        doc.setFontSize(10);
        doc.text(`Nom: ${(reservation as any).user?.name || reservation.client?.user?.name || 'N/A'}`, 14, 58);
        doc.text(`Email: ${(reservation as any).user?.email || reservation.client?.user?.email || 'N/A'}`, 14, 64);

        // Reservation Info
        doc.setFontSize(14);
        doc.text('Détails de la Réservation', 14, 78);
        doc.setFontSize(10);
        doc.text(`Voiture: ${reservation.voiture?.marque} ${reservation.voiture?.modele}`, 14, 86);
        doc.text(`Immatriculation: ${reservation.voiture?.immatriculation || 'N/A'}`, 14, 92);
        doc.text(`Date de départ: ${new Date(reservation.date_depart || reservation.date_debut).toLocaleDateString('fr-FR')}`, 14, 98);
        doc.text(`Date de retour: ${new Date(reservation.date_retour || reservation.date_fin).toLocaleDateString('fr-FR')}`, 14, 104);
        doc.text(`Agence de départ: ${reservation.agence_retrait?.nom || reservation.voiture?.agence?.nom || 'N/A'}`, 14, 110);
        doc.text(`Agence de retour: ${reservation.agence_retour?.nom || 'Même agence'}`, 14, 116);

        // Status
        const statusLabels: Record<string, string> = {
            'en_attente': 'En attente',
            'confirmee': 'Confirmée',
            'en_cours': 'En cours',
            'terminee': 'Terminée',
            'annulee': 'Annulée'
        };
        doc.text(`Statut: ${statusLabels[reservation.statut] || reservation.statut}`, 14, 122);

        // Financial Info
        doc.setFontSize(14);
        doc.text('Informations Financières', 14, 136);
        doc.setFontSize(10);
        doc.text(`Prix Total: ${reservation.prix_total.toLocaleString('fr-FR')} FCFA`, 14, 144);
        doc.text(`Montant Payé: ${reservation.total_paid.toLocaleString('fr-FR')} FCFA`, 14, 150);

        // Payment History
        const reservationPayments = paiements.filter(p => p.reservation_id === reservation.id);
        if (reservationPayments.length > 0) {
            doc.setFontSize(14);
            doc.text('Historique des Paiements', 14, 164);

            autoTable(doc, {
                head: [['Date', 'Montant', 'Méthode', 'Statut']],
                body: reservationPayments
                    .sort((a, b) => new Date(b.date_paiement).getTime() - new Date(a.date_paiement).getTime())
                    .map(p => [
                        new Date(p.date_paiement).toLocaleDateString('fr-FR'),
                        `${p.montant.toLocaleString('fr-FR')} FCFA`,
                        p.methode,
                        p.statut
                    ]),
                startY: 170,
                styles: { fontSize: 9 },
                headStyles: { fillColor: [67, 126, 234] }
            });
        }

        // Footer
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(`Page ${i} sur ${pageCount}`, 105, 285, { align: 'center' });
        }

        doc.save(`reservation_${reservation.id}_${new Date().toISOString().split('T')[0]}.pdf`);
    };


    if (!token) {
        return <Alert variant="danger">Vous devez être connecté pour accéder à cette page.</Alert>;
    }

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Chargement des réservations...</p>
            </div>
        );
    }

    return (
        <Container fluid className="py-4">
            <h1 className="mb-4">Gestion des Réservations</h1>

            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

            {/* Statistics Cards */}
            <Row className="mb-4 g-3">
                <Col md={6}>
                    <Card className="shadow-sm border-0" style={{
                        background: 'linear-gradient(135deg, #0dcaf0 0%, #3dd5f3 100%)',
                        color: 'white'
                    }}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-1 opacity-75">Total Réservations</h6>
                                    <h2 className="mb-0 fw-bold">{stats.total}</h2>
                                </div>
                                <div style={{ fontSize: '3rem', opacity: 0.3 }}>📋</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="shadow-sm border-0" style={{
                        background: 'linear-gradient(135deg, #ffc107 0%, #ffcd39 100%)',
                        color: 'white'
                    }}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-1 opacity-75">En Attente</h6>
                                    <h2 className="mb-0 fw-bold">{stats.enAttente}</h2>
                                </div>
                                <div style={{ fontSize: '3rem', opacity: 0.3 }}>⏳</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filters and Export */}
            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <Row className="g-3 align-items-end">
                        <Col md={4}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <Search />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Rechercher par client, voiture, n°..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={4}>
                            <div className="d-flex gap-2">
                                <Button
                                    variant={showFilters ? "primary" : "outline-primary"}
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <FunnelFill className="me-2" />
                                    Filtres
                                </Button>
                                {(searchTerm || statutFilter !== 'all' || agenceFilter !== 'all' || dateDebutFilter || dateFinFilter) && (
                                    <Button variant="outline-secondary" onClick={clearFilters}>
                                        <XCircle className="me-2" />
                                        Réinitialiser
                                    </Button>
                                )}
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="d-flex gap-2 justify-content-end">
                                <Button variant="outline-success" size="sm" onClick={exportToCSV} title="Export CSV">
                                    <FileEarmarkText />
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={exportToPDF} title="Export PDF">
                                    <FiletypePdf />
                                </Button>
                                <Button variant="outline-secondary" size="sm" onClick={handlePrint} title="Imprimer">
                                    <Printer />
                                </Button>
                            </div>
                        </Col>
                    </Row>

                    {showFilters && (
                        <Row className="mt-3 g-3">
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label className="small text-muted">Statut</Form.Label>
                                    <Form.Select
                                        value={statutFilter}
                                        onChange={(e) => setStatutFilter(e.target.value)}
                                    >
                                        <option value="all">Tous</option>
                                        <option value="en_attente">En attente</option>
                                        <option value="confirmee">Confirmée</option>
                                        <option value="en_cours">En cours</option>
                                        <option value="terminee">Terminée</option>
                                        <option value="annulee">Annulée</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label className="small text-muted">
                                        <Building className="me-1" />
                                        Agence
                                    </Form.Label>
                                    <Form.Select
                                        value={agenceFilter}
                                        onChange={(e) => setAgenceFilter(e.target.value)}
                                    >
                                        <option value="all">Toutes</option>
                                        {agences.map(agence => (
                                            <option key={agence.id} value={agence.id}>{agence.nom}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label className="small text-muted">
                                        <Calendar className="me-1" />
                                        Date début
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={dateDebutFilter}
                                        onChange={(e) => setDateDebutFilter(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label className="small text-muted">
                                        <Calendar className="me-1" />
                                        Date fin
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={dateFinFilter}
                                        onChange={(e) => setDateFinFilter(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    )}
                </Card.Body>
            </Card>

            {/* Reservations Table */}
            <Card className="shadow-sm">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">
                            Liste des réservations
                            <Badge bg="secondary" className="ms-2">{filteredReservations.length}</Badge>
                        </h5>
                    </div>

                    {filteredReservations.length === 0 ? (
                        <Alert variant="info">Aucune réservation trouvée.</Alert>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Client</th>
                                        <th>Voiture</th>
                                        <th>Départ</th>
                                        <th>Retour</th>
                                        <th>Agence</th>
                                        <th>Prix Total</th>
                                        <th>Statut</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReservations.map((reservation) => (
                                        <tr key={reservation.id}>
                                            <td>{reservation.id}</td>
                                            <td>
                                                {(reservation as any).user?.name || reservation.client?.user?.name ||
                                                    <span className="text-muted fst-italic">Client inconnu</span>}
                                            </td>
                                            <td>
                                                {reservation.voiture ?
                                                    `${reservation.voiture.marque} ${reservation.voiture.modele}` :
                                                    <span className="text-muted">Véhicule supprimé</span>
                                                }
                                            </td>
                                            <td>
                                                <small>
                                                    {new Date(reservation.date_depart || reservation.date_debut).toLocaleDateString('fr-FR')}
                                                </small>
                                            </td>
                                            <td>
                                                <small>
                                                    {new Date(reservation.date_retour || reservation.date_fin).toLocaleDateString('fr-FR')}
                                                </small>
                                            </td>
                                            <td>
                                                <small>
                                                    {reservation.agence_retrait?.nom || reservation.voiture?.agence?.nom ||
                                                        <span className="text-muted">N/A</span>}
                                                </small>
                                            </td>
                                            <td className="fw-bold text-primary">
                                                {reservation.prix_total.toLocaleString('fr-FR')} FCFA
                                            </td>
                                            <td>{getStatusBadge(reservation.statut)}</td>
                                            <td>
                                                <div className="d-flex gap-1 justify-content-center flex-wrap">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        title="Voir détails"
                                                        onClick={() => handleShowDetails(reservation)}
                                                    >
                                                        <Eye />
                                                    </Button>
                                                    {reservation.balance_remaining > 0 && (
                                                        <Button
                                                            variant="outline-success"
                                                            size="sm"
                                                            title="Enregistrer paiement"
                                                            onClick={() => handleShowPayment(reservation)}
                                                        >
                                                            <CurrencyDollar />
                                                        </Button>
                                                    )}
                                                    {reservation.statut === 'en_attente' && (
                                                        <Button
                                                            variant="outline-info"
                                                            size="sm"
                                                            title="Confirmer"
                                                            onClick={() => handleConfirm(reservation.id)}
                                                        >
                                                            <CheckLg />
                                                        </Button>
                                                    )}
                                                    {reservation.statut !== 'annulee' && reservation.statut !== 'terminee' && (
                                                        <Button
                                                            variant="outline-warning"
                                                            size="sm"
                                                            title="Annuler"
                                                            onClick={() => handleCancel(reservation.id)}
                                                        >
                                                            <XOctagon />
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
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Details Modal */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Détails de la Réservation #{selectedReservation?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedReservation && (
                        <>
                            <Card className="mb-3">
                                <Card.Header className="bg-primary text-white">
                                    <h6 className="mb-0">Informations de la Réservation</h6>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={6}>
                                            <p><strong>Client:</strong> {(selectedReservation as any).user?.name || selectedReservation.client?.user?.name}</p>
                                            <p><strong>Voiture:</strong> {selectedReservation.voiture?.marque} {selectedReservation.voiture?.modele}</p>
                                            <p><strong>Date départ:</strong> {new Date(selectedReservation.date_depart || selectedReservation.date_debut).toLocaleDateString('fr-FR')}</p>
                                            <p><strong>Date retour:</strong> {new Date(selectedReservation.date_retour || selectedReservation.date_fin).toLocaleDateString('fr-FR')}</p>
                                        </Col>
                                        <Col md={6}>
                                            <p><strong>Agence départ:</strong> {selectedReservation.agence_retrait?.nom || selectedReservation.voiture?.agence?.nom}</p>
                                            <p><strong>Agence retour:</strong> {selectedReservation.agence_retour?.nom || '-'}</p>
                                            <p><strong>Statut:</strong> {getStatusBadge(selectedReservation.statut)}</p>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            <Card className="mb-3">
                                <Card.Header className="bg-success text-white">
                                    <h6 className="mb-0">Informations Financières</h6>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="text-center">
                                        <Col md={6}>
                                            <h4 className="text-primary">{selectedReservation.prix_total.toLocaleString('fr-FR')} FCFA</h4>
                                            <small className="text-muted">Prix Total</small>
                                        </Col>
                                        <Col md={6}>
                                            <h4 className="text-success">{selectedReservation.total_paid.toLocaleString('fr-FR')} FCFA</h4>
                                            <small className="text-muted">Montant Payé</small>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            <Card>
                                <Card.Header className="bg-info text-white">
                                    <h6 className="mb-0">Historique des Paiements</h6>
                                </Card.Header>
                                <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {paiements.filter(p => p.reservation_id === selectedReservation.id).length > 0 ? (
                                        <Table size="sm" hover>
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Montant</th>
                                                    <th>Méthode</th>
                                                    <th>Statut</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paiements
                                                    .filter(p => p.reservation_id === selectedReservation.id)
                                                    .sort((a, b) => new Date(b.date_paiement).getTime() - new Date(a.date_paiement).getTime())
                                                    .map((paiement) => (
                                                        <tr key={paiement.id}>
                                                            <td>{new Date(paiement.date_paiement).toLocaleDateString('fr-FR')}</td>
                                                            <td className="fw-bold text-success">{paiement.montant.toLocaleString('fr-FR')} FCFA</td>
                                                            <td>{paiement.methode}</td>
                                                            <td><Badge bg="success">{paiement.statut}</Badge></td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <Alert variant="info">Aucun paiement enregistré pour cette réservation.</Alert>
                                    )}
                                </Card.Body>
                            </Card>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={() => selectedReservation && downloadReservationPDF(selectedReservation)}
                    >
                        <FiletypePdf className="me-2" />
                        Télécharger PDF
                    </Button>
                    <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                        Fermer
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Payment Modal */}
            <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Enregistrer un Paiement</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedReservation && (
                        <>
                            <Alert variant="info">
                                <strong>Réservation #{selectedReservation.id}</strong>
                            </Alert>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Montant *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        max={selectedReservation.balance_remaining}
                                        min="0"
                                        step="0.01"
                                    />
                                    <Form.Text className="text-muted">
                                        Maximum: {selectedReservation.balance_remaining.toLocaleString('fr-FR')} FCFA
                                    </Form.Text>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Méthode de Paiement *</Form.Label>
                                    <Form.Select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    >
                                        <option value="especes">Espèces</option>
                                        <option value="carte">Carte bancaire</option>
                                        <option value="virement">Virement</option>
                                        <option value="cheque">Chèque</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Date du Paiement *</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                    />
                                </Form.Group>
                            </Form>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="primary" onClick={handleSavePayment}>
                        Enregistrer
                    </Button>
                </Modal.Footer>
            </Modal>

            <style>{`
                @media print {
                    .btn, .modal, nav, aside, .no-print {
                        display: none !important;
                    }
                    .table {
                        font-size: 10px;
                    }
                }
            `}</style>
        </Container>
    );
};

export default ReservationsAdminPage;
