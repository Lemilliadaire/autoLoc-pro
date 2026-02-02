import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Image, Alert } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import UserDashboardStats from '../../Components/UserDashboardStats';
import { Link, useNavigate } from 'react-router-dom';
import {
  JournalCheck,
  PencilSquare,
  CarFront,
  PersonCircle,
  CalendarEvent,
  ArrowRight,
  ClockHistory,
  GeoAlt
} from 'react-bootstrap-icons';
import { getReservations } from '../../services/reservation';
import type { Reservation } from '../../types/api';

const UserDashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const res = await getReservations();
      const data = Array.isArray(res) ? res : (res as any).data || [];
      const myRes = data.filter((r: Reservation) => r.client_id === user?.client?.id || r.user_id === user?.id);

      // Sort by date desc
      myRes.sort((a: Reservation, b: Reservation) => new Date(b.created_at || b.date_debut).getTime() - new Date(a.created_at || a.date_debut).getTime());

      setRecentReservations(myRes.slice(0, 3)); // Take 3 most recent
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\/?storage\//, '');
    return `http://localhost:8000/storage/${cleanPath}`;
  };

  if (!user) return null;

  const currentHour = new Date().getHours();
  let greeting = 'Bonjour';
  if (currentHour >= 18) greeting = 'Bonsoir';

  return (
    <div className="bg-light min-vh-100 py-5">
      <Container>
        {/* Hero Header */}
        <div className="mb-5 d-flex flex-column flex-md-row align-items-center justify-content-between gap-4 bg-white p-4 rounded-4 shadow-sm border-0">
          <div className="d-flex align-items-center gap-4">
            <div className="position-relative">
              {user.photo ? (
                <Image
                  src={getPhotoUrl(user.photo)!}
                  className="object-fit-cover rounded-circle border border-4 border-white shadow-sm"
                  width={100} height={100}
                  alt={user.name}
                />
              ) : (
                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border border-4 border-white shadow-sm" style={{ width: 100, height: 100 }}>
                  <PersonCircle size={50} className="text-secondary opacity-50" />
                </div>
              )}
              <div className="position-absolute bottom-0 end-0 p-1 bg-success border border-2 border-white rounded-circle indicator"></div>
            </div>
            <div>
              <h5 className="text-muted mb-1 small text-uppercase fw-bold tracking-wide">{greeting},</h5>
              <h1 className="fw-bold mb-1">{user.name} {user.lastname}</h1>
              <div className="d-flex align-items-center gap-2">
                <Badge bg={user.role === 'admin' ? 'danger' : 'primary'} className="rounded-pill px-3 fw-normal">
                  {user.role === 'admin' ? 'Administrateur' : 'Client Membre'}
                </Badge>
                {!user.client && <Badge bg="warning" text="dark" className="rounded-pill px-3 fw-normal">Profil incomplet</Badge>}
              </div>
            </div>
          </div>
          <div>
            <Button variant="primary" size="lg" className="px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2" onClick={() => navigate('/voitures-public')}>
              <CarFront /> Louer un véhicule
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <UserDashboardStats />

        <Row className="g-4">
          {/* Recent Activity */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm h-100 rounded-4 overflow-hidden">
              <Card.Header className="bg-white border-0 py-4 px-4 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0">Activité Récente</h5>
                <Link to="/mes-reservations" className="text-decoration-none small fw-bold">Voir tout <ArrowRight /></Link>
              </Card.Header>
              <Card.Body className="p-0">
                {loading ? (
                  <div className="text-center py-5 text-muted">Chargement...</div>
                ) : recentReservations.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {recentReservations.map(res => (
                      <div key={res.id} className="list-group-item p-4 border-0 border-bottom d-flex align-items-center gap-3 hover-bg-light transition-all">
                        <div className={`p-3 rounded-circle bg-opacity-10 text-${res.statut === 'confirmee' ? 'success' : res.statut === 'en_cours' ? 'primary' : 'secondary'} bg-${res.statut === 'confirmee' ? 'success' : res.statut === 'en_cours' ? 'primary' : 'secondary'}`}>
                          <CalendarEvent size={24} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <h6 className="fw-bold mb-0 text-dark">
                              {res.voiture ? `${res.voiture.marque} ${res.voiture.modele}` : 'Véhicule indisponible'}
                            </h6>
                            <span className="fw-bold text-primary">{res.prix_total} FCFA</span>
                          </div>
                          <div className="d-flex align-items-center gap-3 text-muted small">
                            <span><ClockHistory className="me-1" /> {new Date(res.date_debut).toLocaleDateString()} - {new Date(res.date_fin).toLocaleDateString()}</span>
                            {res.voiture?.agence && <span><GeoAlt className="me-1" /> {res.voiture.agence.nom}</span>}
                          </div>
                        </div>
                        <Badge bg={res.statut === 'confirmee' ? 'success' : res.statut === 'en_cours' ? 'primary' : 'secondary'} pill>
                          {res.statut}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div className="mb-3 opacity-25">
                      <JournalCheck size={48} />
                    </div>
                    <p className="text-muted fw-medium">Aucune activité récente.</p>
                    <Button variant="outline-primary" size="sm" onClick={() => navigate('/voitures-public')}>Commencer une réservation</Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Quick Actions & Support */}
          <Col lg={4}>
            <div className="vstack gap-4">
              <Card className="border-0 shadow-sm rounded-4 bg-primary text-white overflow-hidden position-relative">
                <div className="position-absolute top-0 end-0 p-5 opacity-10">
                  <CarFront size={120} />
                </div>
                <Card.Body className="p-4 position-relative">
                  <h4 className="fw-bold mb-2">Mon Profil</h4>
                  <p className="opacity-75 mb-4">Gérez vos informations personnelles, permis et préférences de contact.</p>
                  <Button variant="light" className="text-primary fw-bold w-100" onClick={() => navigate('/profil')}>
                    <PencilSquare className="me-2" /> Editer mon profil
                  </Button>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-3">Besoin d'aide ?</h5>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="p-2 bg-light rounded-circle"><PersonCircle size={24} /></div>
                    <div>
                      <div className="fw-bold">Service Client</div>
                      <div className="small text-muted">+228 90 12 45 67</div>
                    </div>
                  </div>
                  <Button variant="outline-secondary" className="w-100" onClick={() => navigate('/contact')}>Contacter le support</Button>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
      <style>{`
                .hover-bg-light:hover { background-color: #f8f9fa; }
                .transition-all { transition: all 0.2s ease; }
            `}</style>
    </div>
  );
};

export default UserDashboardPage;