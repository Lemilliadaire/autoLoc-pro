// src/Pages/Admin/ClientsAdminPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
    Container, Row, Col, Card, Table, Button, Badge,
    Form, InputGroup, Modal, Alert, Spinner
} from 'react-bootstrap';
import {
    Search, PersonPlus, Eye, Pencil, Trash,
    FunnelFill, XCircle, GeoAlt, Phone
} from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { getClients, deleteClient, updateClient, createClient } from '../../services/client';
import { getReservations } from '../../services/reservation';
import type { Client, ClientWithStats, Reservation } from '../../types/api';

const ClientsAdminPage: React.FC = () => {
    const { token } = useAuth();
    const [clients, setClients] = useState<ClientWithStats[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [villeFilter, setVilleFilter] = useState('');
    const [reservationsFilter, setReservationsFilter] = useState<'all' | 'none' | 'low' | 'high'>('all');

    // Modals
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<ClientWithStats | null>(null);

    // Form data for edit/create
    const [formData, setFormData] = useState({
        numero_permis: '',
        adresse: '',
        telephone: '',
        date_naissance: '',
        user_id: 0,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        if (!token) return;

        try {
            setLoading(true);
            const [clientsData, reservationsData] = await Promise.all([
                getClients(token),
                getReservations()
            ]);

            setReservations(reservationsData);

            // Calculate stats for each client
            const clientsWithStats: ClientWithStats[] = clientsData.map(client => {
                const clientReservations = reservationsData.filter(r => r.client_id === client.id);
                const totalSpent = clientReservations.reduce((sum, r) => sum + r.prix_total, 0);
                const lastReservation = clientReservations.length > 0
                    ? clientReservations.sort((a, b) =>
                        new Date(b.date_depart).getTime() - new Date(a.date_depart).getTime()
                    )[0]
                    : null;

                return {
                    ...client,
                    reservations_count: clientReservations.length,
                    total_spent: totalSpent,
                    last_reservation_date: lastReservation?.date_depart,
                    reservations: clientReservations
                };
            });

            setClients(clientsWithStats);
            setLoading(false);
        } catch (err) {
            console.error('Erreur lors du chargement des données:', err);
            setError('Impossible de charger les données');
            setLoading(false);
        }
    };

    // Filtered and searched clients
    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            // Search filter
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm ||
                client.user?.name?.toLowerCase().includes(searchLower) ||
                client.user?.lastname?.toLowerCase().includes(searchLower) ||
                client.user?.email?.toLowerCase().includes(searchLower) ||
                client.telephone?.toLowerCase().includes(searchLower) ||
                client.numero_permis?.toLowerCase().includes(searchLower);

            // Ville filter
            const matchesVille = !villeFilter ||
                client.adresse?.toLowerCase().includes(villeFilter.toLowerCase());

            // Reservations count filter
            const count = client.reservations_count || 0;
            const matchesReservations =
                reservationsFilter === 'all' ||
                (reservationsFilter === 'none' && count === 0) ||
                (reservationsFilter === 'low' && count > 0 && count <= 5) ||
                (reservationsFilter === 'high' && count > 5);

            return matchesSearch && matchesVille && matchesReservations;
        });
    }, [clients, searchTerm, villeFilter, reservationsFilter]);

    // Statistics
    const stats = useMemo(() => {
        const total = clients.length;
        const activeClients = clients.filter(c => (c.reservations_count || 0) > 0).length;
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);

        return {
            total,
            active: activeClients,
            inactive: total - activeClients,
        };
    }, [clients]);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;
        if (!token) return;

        try {
            await deleteClient(id, token);
            setClients(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
            setError('Impossible de supprimer le client');
        }
    };

    const handleShowDetails = (client: ClientWithStats) => {
        setSelectedClient(client);
        setShowDetailsModal(true);
    };

    const handleShowEdit = (client: ClientWithStats) => {
        setSelectedClient(client);
        setFormData({
            numero_permis: client.numero_permis,
            adresse: client.adresse,
            telephone: client.telephone,
            date_naissance: client.date_naissance,
            user_id: client.user_id,
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedClient || !token) return;

        try {
            await updateClient(selectedClient.id, formData, token);
            await fetchData();
            setShowEditModal(false);
            setSelectedClient(null);
        } catch (err) {
            console.error('Erreur lors de la mise à jour:', err);
            setError('Impossible de mettre à jour le client');
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setVilleFilter('');
        setReservationsFilter('all');
    };

    const getReservationsBadgeColor = (count: number) => {
        if (count === 0) return 'secondary';
        if (count <= 5) return 'info';
        return 'success';
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
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Chargement des clients...</p>
            </div>
        );
    }

    return (
        <Container fluid className="py-4">
            <h1 className="mb-4">Gestion des Clients</h1>

            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

            {/* Statistics Cards */}
            <Row className="mb-4 g-3">
                <Col md={4}>
                    <Card className="shadow-sm border-0" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                    }}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-1 opacity-75">Total Clients</h6>
                                    <h2 className="mb-0 fw-bold">{stats.total}</h2>
                                </div>
                                <div style={{ fontSize: '3rem', opacity: 0.3 }}>👥</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0" style={{
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white'
                    }}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-1 opacity-75">Clients Actifs</h6>
                                    <h2 className="mb-0 fw-bold">{stats.active}</h2>
                                </div>
                                <div style={{ fontSize: '3rem', opacity: 0.3 }}>✓</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0" style={{
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: 'white'
                    }}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-1 opacity-75">Sans Réservation</h6>
                                    <h2 className="mb-0 fw-bold">{stats.inactive}</h2>
                                </div>
                                <div style={{ fontSize: '3rem', opacity: 0.3 }}>⏸</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Search and Filters */}
            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <Row className="g-3">
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <Search />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Rechercher par nom, email, téléphone, permis..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={6}>
                            <div className="d-flex gap-2">
                                <Button
                                    variant={showFilters ? "primary" : "outline-primary"}
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <FunnelFill className="me-2" />
                                    Filtres
                                </Button>
                                {(searchTerm || villeFilter || reservationsFilter !== 'all') && (
                                    <Button variant="outline-secondary" onClick={clearFilters}>
                                        <XCircle className="me-2" />
                                        Réinitialiser
                                    </Button>
                                )}
                            </div>
                        </Col>
                    </Row>

                    {showFilters && (
                        <Row className="mt-3 g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small text-muted">
                                        <GeoAlt className="me-1" />
                                        Ville
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Filtrer par ville..."
                                        value={villeFilter}
                                        onChange={(e) => setVilleFilter(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small text-muted">Nombre de réservations</Form.Label>
                                    <Form.Select
                                        value={reservationsFilter}
                                        onChange={(e) => setReservationsFilter(e.target.value as any)}
                                    >
                                        <option value="all">Tous</option>
                                        <option value="none">Aucune réservation</option>
                                        <option value="low">1-5 réservations</option>
                                        <option value="high">Plus de 5 réservations</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    )}
                </Card.Body>
            </Card>

            {/* Clients Table */}
            <Card className="shadow-sm">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">
                            Liste des clients
                            <Badge bg="secondary" className="ms-2">{filteredClients.length}</Badge>
                        </h5>
                    </div>

                    {filteredClients.length === 0 ? (
                        <Alert variant="info">Aucun client trouvé.</Alert>
                    ) : (
                        <div className="table-responsive">
                            <Table hover>
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Nom Complet</th>
                                        <th>Email</th>
                                        <th>Téléphone</th>
                                        <th>N° Permis</th>
                                        <th>Réservations</th>
                                        <th>Total Dépensé</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredClients.map((client, index) => (
                                        <tr key={client.id}>
                                            <td className="align-middle">{index + 1}</td>
                                            <td className="align-middle">
                                                <div className="fw-bold">
                                                    {client.user?.name} {client.user?.lastname}
                                                </div>
                                            </td>
                                            <td className="align-middle">
                                                <small className="text-muted">{client.user?.email}</small>
                                            </td>
                                            <td className="align-middle">
                                                <Phone size={14} className="me-1 text-muted" />
                                                {client.telephone}
                                            </td>
                                            <td className="align-middle">
                                                <code className="small">{client.numero_permis}</code>
                                            </td>
                                            <td className="align-middle">
                                                <Badge bg={getReservationsBadgeColor(client.reservations_count || 0)} pill>
                                                    {client.reservations_count || 0}
                                                </Badge>
                                            </td>
                                            <td className="align-middle">
                                                <strong className="text-success">
                                                    {client.total_spent?.toLocaleString('fr-FR') || 0} FCFA
                                                </strong>
                                            </td>
                                            <td className="align-middle">
                                                <div className="d-flex gap-1 justify-content-center">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        title="Voir détails"
                                                        onClick={() => handleShowDetails(client)}
                                                    >
                                                        <Eye />
                                                    </Button>
                                                    <Button
                                                        variant="outline-warning"
                                                        size="sm"
                                                        title="Modifier"
                                                        onClick={() => handleShowEdit(client)}
                                                    >
                                                        <Pencil />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        title="Supprimer"
                                                        onClick={() => handleDelete(client.id)}
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
                    <Modal.Title>
                        Détails du Client - {selectedClient?.user?.name} {selectedClient?.user?.lastname}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedClient && (
                        <>
                            {/* Personal Info */}
                            <Card className="mb-3">
                                <Card.Header className="bg-primary text-white">
                                    <h6 className="mb-0">Informations Personnelles</h6>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={6}>
                                            <p><strong>Nom complet:</strong> {selectedClient.user?.name} {selectedClient.user?.lastname}</p>
                                            <p><strong>Email:</strong> {selectedClient.user?.email}</p>
                                            <p><strong>Téléphone:</strong> {selectedClient.telephone}</p>
                                        </Col>
                                        <Col md={6}>
                                            <p><strong>N° Permis:</strong> {selectedClient.numero_permis}</p>
                                            <p><strong>Date de naissance:</strong> {new Date(selectedClient.date_naissance).toLocaleDateString('fr-FR')}</p>
                                            <p><strong>Adresse:</strong> {selectedClient.adresse}</p>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Statistics */}
                            <Card className="mb-3">
                                <Card.Header className="bg-success text-white">
                                    <h6 className="mb-0">Statistiques</h6>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="text-center">
                                        <Col md={4}>
                                            <h3 className="text-primary">{selectedClient.reservations_count || 0}</h3>
                                            <small className="text-muted">Réservations</small>
                                        </Col>
                                        <Col md={4}>
                                            <h3 className="text-success">{(selectedClient.total_spent || 0).toLocaleString('fr-FR')} FCFA</h3>
                                            <small className="text-muted">Total Dépensé</small>
                                        </Col>
                                        <Col md={4}>
                                            <h3 className="text-info">
                                                {selectedClient.reservations_count && selectedClient.total_spent
                                                    ? Math.round(selectedClient.total_spent / selectedClient.reservations_count).toLocaleString('fr-FR')
                                                    : 0} FCFA
                                            </h3>
                                            <small className="text-muted">Moyenne par Résa</small>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Reservation History */}
                            <Card>
                                <Card.Header className="bg-info text-white">
                                    <h6 className="mb-0">Historique des Réservations</h6>
                                </Card.Header>
                                <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {selectedClient.reservations && selectedClient.reservations.length > 0 ? (
                                        <div className="timeline">
                                            {selectedClient.reservations
                                                .sort((a, b) => {
                                                    const dateA = new Date(a.date_depart || a.date_debut).getTime();
                                                    const dateB = new Date(b.date_depart || b.date_debut).getTime();
                                                    return dateB - dateA;
                                                })
                                                .map((reservation) => (
                                                    <Card key={reservation.id} className="mb-3 border-start border-primary border-3">
                                                        <Card.Body>
                                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                                <div>
                                                                    <h6 className="mb-1">
                                                                        {reservation.voiture?.marque} {reservation.voiture?.modele}
                                                                    </h6>
                                                                    <small className="text-muted">
                                                                        Réservation #{reservation.id}
                                                                    </small>
                                                                </div>
                                                                {getStatusBadge(reservation.statut)}
                                                            </div>
                                                            <Row className="small">
                                                                <Col md={6}>
                                                                    <p className="mb-1">
                                                                        <strong>Départ:</strong> {new Date(reservation.date_depart || reservation.date_debut).toLocaleDateString('fr-FR')}
                                                                    </p>
                                                                    <p className="mb-1">
                                                                        <strong>Retour:</strong> {new Date(reservation.date_retour || reservation.date_fin).toLocaleDateString('fr-FR')}
                                                                    </p>
                                                                </Col>
                                                                <Col md={6}>
                                                                    <p className="mb-1">
                                                                        <strong>Agence:</strong> {reservation.agence_retrait?.nom || reservation.agence_depart?.nom || reservation.voiture?.agence?.nom || 'N/A'}
                                                                    </p>
                                                                    <p className="mb-1">
                                                                        <strong>Prix:</strong> <span className="text-success fw-bold">{reservation.prix_total} FCFA</span>
                                                                    </p>
                                                                </Col>
                                                            </Row>
                                                        </Card.Body>
                                                    </Card>
                                                ))}
                                        </div>
                                    ) : (
                                        <Alert variant="info">Aucune réservation pour ce client.</Alert>
                                    )}
                                </Card.Body>
                            </Card>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                        Fermer
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Modifier le Client</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Numéro de Permis</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.numero_permis}
                                onChange={(e) => setFormData({ ...formData, numero_permis: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Adresse</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.adresse}
                                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Téléphone</Form.Label>
                            <Form.Control
                                type="tel"
                                value={formData.telephone}
                                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Date de Naissance</Form.Label>
                            <Form.Control
                                type="date"
                                value={formData.date_naissance}
                                onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="primary" onClick={handleSaveEdit}>
                        Enregistrer
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ClientsAdminPage;
