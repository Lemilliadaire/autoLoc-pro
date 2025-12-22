import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Alert, Nav, Tab, Button } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import ClientForm from '../../Components/ClientForm';
import { getReservations } from '../../services/reservation';
import type { Reservation } from '../../types/api';
import {
    PersonCircle,
    CalendarCheck,
    ClockHistory,
    ShieldCheck,
    Envelope,
    Telephone,
    GeoAlt,
    CardText,
    CreditCard,
    Bell,
    Gear
} from 'react-bootstrap-icons';
import LoadingSpinner from '../../Components/LoadingSpinner';

const ProfilPage: React.FC = () => {
    const { user, token, refreshUser } = useAuth();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loadingResa, setLoadingResa] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        // Refresh user data to ensure we have the latest client info
        refreshUser();

        // Fetch reservations
        if (user) {
            fetchReservations();
        }
    }, []);

    const fetchReservations = async () => {
        try {
            const response = await getReservations();
            const data = Array.isArray(response) ? response : (response as any).data || [];
            // Filter for current user's reservations
            const myReservations = data.filter((res: Reservation) =>
                res.client_id === user?.client?.id || res.user_id === user?.id
            );
            // Sort by date descending
            myReservations.sort((a, b) => new Date(b.date_debut).getTime() - new Date(a.date_debut).getTime());

            setReservations(myReservations);
        } catch (err) {
            console.error("Erreur récupération réservations", err);
        } finally {
            setLoadingResa(false);
        }
    };

    const handlClientUpdate = () => {
        setIsEditing(false);
        refreshUser();
    };

    if (!user) return null;

    return (
        <div className="py-5 bg-light" style={{ minHeight: '100vh' }}>
            <Container>
                {/* Header Section with User Info */}
                <div className="mb-5">
                    <Row className="align-items-center g-4">
                        <Col xs="auto">
                            <div className="position-relative">
                                {user.photo ? (
                                    <img
                                        src={user.photo}
                                        alt={user.name}
                                        className="rounded-circle shadow-sm object-fit-cover"
                                        style={{ width: '100px', height: '100px', border: '4px solid white' }}
                                    />
                                ) : (
                                    <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                                        style={{ width: '100px', height: '100px', border: '4px solid white' }}>
                                        <PersonCircle size={50} className="text-primary opacity-50" />
                                    </div>
                                )}
                                <span className="position-absolute bottom-0 end-0 p-2 bg-success border border-white rounded-circle"></span>
                            </div>
                        </Col>
                        <Col>
                            <h1 className="fw-bold mb-1">{user.name} {user.lastname}</h1>
                            <div className="d-flex align-items-center text-muted gap-3 flex-wrap">
                                <span className="d-flex align-items-center gap-2">
                                    <Envelope /> {user.email}
                                </span>
                                {user.telephone && (
                                    <span className="d-flex align-items-center gap-2">
                                        <Telephone /> {user.telephone}
                                    </span>
                                )}
                                <Badge bg="primary" className="rounded-pill px-3 py-2">
                                    <ShieldCheck className="me-2" />
                                    {user.role === 'admin' ? 'Administrateur' : 'Client Vérifié'}
                                </Badge>
                            </div>
                        </Col>
                    </Row>
                </div>

                <Row className="g-4">
                    {/* Main Content Column */}
                    <Col lg={8}>
                        <Tab.Container defaultActiveKey="profil">
                            <Card className="border-0 shadow-sm overflow-hidden">
                                <Card.Header className="bg-white border-0 p-0">
                                    <Nav variant="tabs" className="px-4 pt-4 border-bottom-0">
                                        <Nav.Item>
                                            <Nav.Link eventKey="profil" className="fw-medium px-4 py-3 border-bottom-0">
                                                <PersonCircle className="me-2" />Mon Profil
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="reservations" className="fw-medium px-4 py-3 border-bottom-0">
                                                <ClockHistory className="me-2" />Historique
                                            </Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Card.Header>

                                <Card.Body className="p-4 bg-white">
                                    <Tab.Content>
                                        <Tab.Pane eventKey="profil">
                                            <div className="d-flex justify-content-between align-items-start mb-4">
                                                <div>
                                                    <h4 className="fw-bold mb-2">Informations Client</h4>
                                                    <p className="text-muted mb-0">
                                                        Données nécessaires pour vos contrats de location.
                                                    </p>
                                                </div>
                                                {!isEditing && (
                                                    <Button
                                                        variant="outline-primary"
                                                        className="rounded-pill px-4 fw-bold shadow-sm"
                                                        onClick={() => setIsEditing(true)}
                                                    >
                                                        <PencilSquare className="me-2" />
                                                        {user.client ? 'Modifier' : 'Compléter'}
                                                    </Button>
                                                )}
                                            </div>

                                            {isEditing ? (
                                                <div className="bg-light p-4 rounded-4 border">
                                                    {token && (
                                                        <ClientForm
                                                            token={token}
                                                            initialData={user.client}
                                                            onClientAdded={handlClientUpdate}
                                                            onCancel={() => setIsEditing(false)}
                                                        />
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="row g-4">
                                                    {user.client ? (
                                                        <>
                                                            <Col md={6}>
                                                                <div className="p-3 border rounded-3 bg-light bg-opacity-50">
                                                                    <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Numéro de Permis</label>
                                                                    <div className="fw-bold fs-5"><PersonBadge className="me-2 text-primary" />{user.client.numero_permis}</div>
                                                                </div>
                                                            </Col>
                                                            <Col md={6}>
                                                                <div className="p-3 border rounded-3 bg-light bg-opacity-50">
                                                                    <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Téléphone</label>
                                                                    <div className="fw-bold fs-5"><Telephone className="me-2 text-primary" />{user.client.telephone}</div>
                                                                </div>
                                                            </Col>
                                                            <Col md={6}>
                                                                <div className="p-3 border rounded-3 bg-light bg-opacity-50">
                                                                    <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Date de Naissance</label>
                                                                    <div className="fw-bold fs-5"><CalendarDate className="me-2 text-primary" />{new Date(user.client.date_naissance).toLocaleDateString()}</div>
                                                                </div>
                                                            </Col>
                                                            <Col md={12}>
                                                                <div className="p-3 border rounded-3 bg-light bg-opacity-50">
                                                                    <label className="text-muted small fw-bold text-uppercase mb-1 d-block">Adresse</label>
                                                                    <div className="fw-bold fs-5"><GeoAlt className="me-2 text-primary" />{user.client.adresse}</div>
                                                                </div>
                                                            </Col>
                                                        </>
                                                    ) : (
                                                        <Col md={12}>
                                                            <div className="text-center py-5 bg-light rounded-4 border border-dashed text-muted">
                                                                <FileEarmarkPerson size={48} className="mb-3 opacity-25" />
                                                                <p className="mb-0">Votre profil client n'est pas encore complété.</p>
                                                            </div>
                                                        </Col>
                                                    )}
                                                </div>
                                            )}
                                        </Tab.Pane>

                                        <Tab.Pane eventKey="reservations">
                                            <div className="d-flex justify-content-between align-items-center mb-4">
                                                <h4 className="fw-bold mb-0">Historique des locations</h4>
                                                <Badge bg="light" text="dark" className="rounded-pill border">
                                                    {reservations.length} réservations
                                                </Badge>
                                            </div>

                                            {loadingResa ? (
                                                <LoadingSpinner />
                                            ) : reservations.length > 0 ? (
                                                <div className="vstack gap-3">
                                                    {reservations.map(resa => (
                                                        <div key={resa.id} className="d-flex p-3 rounded-3 border bg-light align-items-center">
                                                            <div className="p-3 bg-white rounded-circle shadow-sm me-3 text-primary">
                                                                <CarFrontFill size={24} />
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <div className="d-flex justify-content-between mb-1">
                                                                    <h6 className="fw-bold mb-0">
                                                                        {resa.voiture ? `${resa.voiture.marque} ${resa.voiture.modele}` : 'Véhicule supprimé'}
                                                                    </h6>
                                                                    <Badge
                                                                        bg={
                                                                            resa.statut === 'confirmée' ? 'success' :
                                                                                resa.statut === 'en attente' ? 'warning' : 'secondary'
                                                                        }
                                                                    >
                                                                        {resa.statut}
                                                                    </Badge>
                                                                </div>
                                                                <div className="text-muted small">
                                                                    <CalendarCheck className="me-2" />
                                                                    Du {new Date(resa.date_debut).toLocaleDateString()} au {new Date(resa.date_fin).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                            <div className="ms-3 text-end">
                                                                <div className="fw-bold fs-5 text-dark">{resa.prix_total} €</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-5">
                                                    <ClockHistory size={40} className="text-muted opacity-50 mb-3" />
                                                    <p className="text-muted">Aucune réservation pour le moment.</p>
                                                </div>
                                            )}
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Card.Body>
                            </Card>
                        </Tab.Container>
                    </Col>

                    {/* Sidebar Column */}
                    <Col lg={4}>
                        {/* Quick Stats/Summary */}
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-4">Récapitulatif</h5>
                                <div className="vstack gap-3">
                                    <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3">
                                        <div className="d-flex align-items-center">
                                            <div className="p-2 bg-white rounded-circle me-3 text-success">
                                                <CheckCircleFill />
                                            </div>
                                            <div>
                                                <small className="text-muted d-block">Statut du compte</small>
                                                <span className="fw-bold text-success">Actif</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3">
                                        <div className="d-flex align-items-center">
                                            <div className="p-2 bg-white rounded-circle me-3 text-primary">
                                                <CarFrontFill />
                                            </div>
                                            <div>
                                                <small className="text-muted d-block">Total locations</small>
                                                <span className="fw-bold">{reservations.length}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Help Card */}
                        <Card className="border-0 shadow-sm bg-primary text-white">
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-3">Besoin d'aide ?</h5>
                                <p className="opacity-75 small mb-4">
                                    Si vous rencontrez des problèmes avec votre profil ou vos réservations, n'hésitez pas à nous contacter.
                                </p>
                                <Nav.Link href="/contact" className="btn btn-light w-100 fw-bold text-primary">
                                    Contactez le support
                                </Nav.Link>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <style>{`
        .nav-tabs .nav-link {
          color: #6c757d;
          border: none;
          position: relative;
          transition: all 0.2s;
        }
        .nav-tabs .nav-link:hover {
          color: #0d6efd;
          background: rgba(13, 110, 253, 0.05);
        }
        .nav-tabs .nav-link.active {
          color: #0d6efd;
          background: transparent;
          font-weight: bold;
        }
        .nav-tabs .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background-color: #0d6efd;
          border-radius: 3px 3px 0 0;
        }
      `}</style>
        </div>
    );
};

// Missing imports fix - adding icons that might be missing in imports
import {
    CarFrontFill,
    CheckCircleFill,
    PencilSquare,
    PersonBadge,
    CalendarDate,
    FileEarmarkPerson
} from 'react-bootstrap-icons';

export default ProfilPage;
