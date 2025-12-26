// src/Components/Navbar.tsx
import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Navbar as BootstrapNavbar, Container, Nav, NavDropdown, Button, Badge } from 'react-bootstrap';
import {
  BoxArrowRight,
  PersonCircle,
  Speedometer2,
  Wrench,
  BoxArrowInRight,
  PersonPlusFill,
  CarFrontFill,
  GeoAltFill,
  CollectionFill,
  CalendarCheck,
  EnvelopeFill
} from 'react-bootstrap-icons';

const Navbar: React.FC = () => {
  const { user, logoutUser, isAdmin } = useAuth();

  const getPhotoUrl = (photo: string | undefined) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    // If the path already starts with '/storage/' or 'storage/', remove it to avoid duplication
    // when prepending the full base URL.
    const cleanPath = photo.startsWith('/storage/') ? photo.substring(9) :
      photo.startsWith('storage/') ? photo.substring(8) : photo;
    return `http://127.0.0.1:8000/storage/${cleanPath}`;
  };

  return (
    <BootstrapNavbar bg="white" expand="lg" className="shadow-sm py-2" sticky="top">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center fw-bold text-primary fs-5">
          <CarFrontFill className="me-2" size={24} />
          AutoLoc Pro
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />

        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto mb-2 mb-lg-0 fw-medium">
            <Nav.Link as={NavLink} to="/" className="px-2">Accueil</Nav.Link>
            <Nav.Link as={NavLink} to="/voitures-public" className="px-2">
              <CarFrontFill className="me-1 text-muted" size={14} /> Voitures
            </Nav.Link>
            <Nav.Link as={NavLink} to="/agences-public" className="px-2">
              <GeoAltFill className="me-1 text-muted" size={14} /> Agences
            </Nav.Link>
            <Nav.Link as={NavLink} to="/categories-public" className="px-2">
              <CollectionFill className="me-1 text-muted" size={14} /> Catégories
            </Nav.Link>
            <Nav.Link as={NavLink} to="/contact" className="px-2">
              <EnvelopeFill className="me-1 text-muted" size={14} /> Contact
            </Nav.Link>
          </Nav>

          <Nav className="align-items-center gap-2">
            {user ? (
              <>
                <NavDropdown
                  title={
                    <div className="d-inline-flex align-items-center border rounded-pill px-2 py-1 bg-light">
                      {user.photo ? (
                        <img
                          src={`${getPhotoUrl(user.photo)}?t=${new Date().getTime()}`}
                          alt="Profile"
                          className="rounded-circle me-2"
                          style={{ width: '24px', height: '24px', objectFit: 'cover' }}
                        />
                      ) : (
                        <PersonCircle className="me-2 text-primary" size={18} />
                      )}
                      <span className="fw-semibold text-dark small">{user.name}</span>
                    </div>
                  }
                  id="user-dropdown"
                  align="end"
                  className="no-arrow"
                >
                  <div className="px-3 py-2 text-center border-bottom mb-2">
                    <small className="text-muted d-block">Connecté en tant que</small>
                    <strong>{user.email}</strong>
                    <div className="mt-1">
                      <Badge bg={isAdmin ? "danger" : "primary"}>
                        {isAdmin ? "Administrateur" : "Client"}
                      </Badge>
                    </div>
                  </div>


                  {isAdmin && (
                    <>
                      <NavDropdown.Divider />
                      <NavDropdown.Header>Administration</NavDropdown.Header>
                      <NavDropdown.Item as={Link} to="/admin" className="py-2">
                        <Wrench className="me-2 text-danger" />
                        Panel Admin
                      </NavDropdown.Item>
                    </>
                  )}

                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logoutUser} className="text-danger py-2">
                    <BoxArrowRight className="me-2" />
                    Déconnexion
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login">
                  <Button variant="outline-primary" size="sm" className="fw-semibold px-3 rounded-pill">
                    <BoxArrowInRight className="me-2" />
                    Connexion
                  </Button>
                </Link>
                <Link to="/register">
                  {/* <Button variant="primary" size="sm" className="fw-semibold px-3 rounded-pill shadow-sm">
                    <PersonPlusFill className="me-2" />
                    Inscription
                  </Button> */}
                </Link>
              </div>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>

      <style>{`
        .navbar-nav .nav-link.active {
          color: var(--bs-primary) !important;
          font-weight: 600;
        }
        .no-arrow .dropdown-toggle::after {
          display: none;
        }
      `}</style>
    </BootstrapNavbar>
  );
};

export default Navbar;
