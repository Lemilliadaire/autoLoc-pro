// src/Pages/Admin/AdminDashboardPage.tsx
import React from 'react';
import { Row, Col, Card, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CarFrontFill, Building, CollectionFill, PeopleFill, CalendarCheck, ArrowRight } from 'react-bootstrap-icons';
import AdminDashboardStats from '../../Components/AdminDashboardStats';

const AdminDashboardPage: React.FC = () => {
  const adminSections = [
    {
      title: "Voitures",
      description: "Gérer le parc automobile",
      link: "/admin/voitures",
      icon: <CarFrontFill size={32} className="text-primary" />,
      color: "primary",
      count: "Gestion"
    },
    {
      title: "Agences",
      description: "Gérer les points de location",
      link: "/admin/agences",
      icon: <Building size={32} className="text-success" />,
      color: "success",
      count: "Réseau"
    },
    {
      title: "Catégories",
      description: "Gérer les types de véhicules",
      link: "/admin/categories",
      icon: <CollectionFill size={32} className="text-info" />,
      color: "info",
      count: "Offres"
    },
    {
      title: "Clients",
      description: "Gérer la base utilisateurs",
      link: "/admin/clients",
      icon: <PeopleFill size={32} className="text-warning" />,
      color: "warning",
      count: "CRM"
    },
    {
      title: "Réservations",
      description: "Suivi des locations",
      link: "/admin/reservations",
      icon: <CalendarCheck size={32} className="text-danger" />,
      color: "danger",
      count: "Booking"
    }
  ];

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Tableau de Bord</h1>
          <p className="text-muted mb-0">Bienvenue dans votre espace d'administration</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/reservations">
            <Button variant="outline-primary" size="sm">
              <CalendarCheck className="me-2" />
              Planning
            </Button>
          </Link>
          <Link to="/admin/voitures">
            <Button variant="primary" size="sm">
              <CarFrontFill className="me-2" />
              Nouvelle Voiture
            </Button>
          </Link>
        </div>
      </div>

      {/* Section des statistiques et graphiques */}
      <div className="mb-5">
        <AdminDashboardStats />
      </div>

      <h4 className="mb-4 fw-bold text-secondary">Accès Rapide</h4>
      <Row xs={1} md={2} lg={3} xl={5} className="g-3">
        {adminSections.map((section, index) => (
          <Col key={index}>
            <Card className="h-100 border-0 shadow-sm card-hover">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className={`p-2 rounded-3 bg-${section.color} bg-opacity-10`}>
                    {section.icon}
                  </div>
                  <span className={`badge bg-${section.color} bg-opacity-10 text-${section.color}`}>
                    {section.count}
                  </span>
                </div>

                <h5 className="fw-bold mb-1">{section.title}</h5>
                <p className="text-muted small mb-3">{section.description}</p>

                <Link to={section.link} className="text-decoration-none stretched-link">
                  <div className="d-flex align-items-center text-primary small fw-semibold">
                    Accéder <ArrowRight className="ms-2" />
                  </div>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default AdminDashboardPage;