// src/Pages/User/UserDashboardPage.tsx
import React from 'react';
import { Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import UserDashboardStats from '../../Components/UserDashboardStats';
import { Link } from 'react-router-dom';
import {
  JournalCheck,
  PencilSquare,
  CarFront,
  Star,
  PersonCircle
} from 'react-bootstrap-icons';

const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <>
      {/* En-tête */}
      <div className="mb-4">
        <div className="d-flex align-items-center mb-3">
          <PersonCircle size={50} className="text-primary me-3" />
          <div>
            <h1 className="mb-1">Bonjour, {user.name} ! 👋</h1>
            <p className="text-muted mb-0">
              <Badge bg="primary" className="me-2">Client</Badge>
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Message de bienvenue */}
      <Card className="mb-4 border-0 shadow-sm bg-gradient-primary">
        <Card.Body className="text-white p-4">
          <h4 className="mb-2">🎉 Bienvenue sur votre espace personnel !</h4>
          <p className="mb-0 opacity-75">
            Gérez vos réservations, consultez votre historique et découvrez nos véhicules disponibles.
          </p>
        </Card.Body>
      </Card>

      {/* Statistiques utilisateur */}
      <UserDashboardStats />

      {/* Actions rapides */}
      <h3 className="mb-4 mt-5">
        <Star className="me-2 text-warning" />
        Actions rapides
      </h3>
      <Row xs={1} md={2} lg={3} className="g-4">
        <Col>
          <Card className="h-100 border-0 shadow-sm card-hover">
            <Card.Body className="text-center p-4">
              <div className="mb-3 p-3 rounded-circle d-inline-flex" style={{ backgroundColor: 'rgba(13, 110, 253, 0.1)' }}>
                <JournalCheck size={40} className="text-primary" />
              </div>
              <Card.Title as="h5" className="mb-2">Mes Réservations</Card.Title>
              <Card.Text className="text-muted mb-3">
                Consultez et gérez toutes vos réservations en cours et passées
              </Card.Text>
              <Link to="/mes-reservations" className="text-decoration-none">
                <Button variant="primary" className="w-100">
                  Voir mes réservations
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="h-100 border-0 shadow-sm card-hover">
            <Card.Body className="text-center p-4">
              <div className="mb-3 p-3 rounded-circle d-inline-flex" style={{ backgroundColor: 'rgba(25, 135, 84, 0.1)' }}>
                <CarFront size={40} className="text-success" />
              </div>
              <Card.Title as="h5" className="mb-2">Louer un véhicule</Card.Title>
              <Card.Text className="text-muted mb-3">
                Parcourez notre catalogue et trouvez la voiture parfaite
              </Card.Text>
              <Link to="/voitures-public" className="text-decoration-none">
                <Button variant="success" className="w-100">
                  Voir les voitures
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="h-100 border-0 shadow-sm card-hover">
            <Card.Body className="text-center p-4">
              <div className="mb-3 p-3 rounded-circle d-inline-flex" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
                <PencilSquare size={40} className="text-warning" />
              </div>
              <Card.Title as="h5" className="mb-2">Mon Profil</Card.Title>
              <Card.Text className="text-muted mb-3">
                Mettez à jour vos informations personnelles et préférences
              </Card.Text>
              <Link to="/profil" className="text-decoration-none">
                <Button variant="warning" className="w-100">
                  Modifier mon profil
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default UserDashboardPage;