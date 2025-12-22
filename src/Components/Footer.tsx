// src/Components/Footer.tsx
import React from 'react';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
    CarFrontFill,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    GeoAlt,
    Telephone,
    Envelope
} from 'react-bootstrap-icons';

const Footer: React.FC = () => {
    return (
        <footer className="bg-dark text-light pt-5 pb-3 mt-auto">
            <Container>
                <Row className="g-4 mb-5">
                    {/* Brand Section */}
                    <Col lg={4} md={6}>
                        <div className="d-flex align-items-center mb-3">
                            <CarFrontFill className="text-primary me-2" size={32} />
                            <h4 className="fw-bold mb-0">AutoLoc Pro</h4>
                        </div>
                        <p className="text-secondary mb-4">
                            Votre partenaire de confiance pour la location de voitures.
                            Profitez d'une expérience de conduite premium avec notre flotte diverse et nos services sur mesure.
                        </p>
                        <div className="d-flex gap-3">
                            <a href="#" className="text-light opacity-50 hover-opacity-100 transition">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="text-light opacity-50 hover-opacity-100 transition">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="text-light opacity-50 hover-opacity-100 transition">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="text-light opacity-50 hover-opacity-100 transition">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </Col>

                    {/* Quick Links */}
                    <Col lg={2} md={6}>
                        <h5 className="fw-bold mb-4">Navigation</h5>
                        <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                            <li>
                                <Link to="/" className="text-secondary text-decoration-none hover-text-primary">Accueil</Link>
                            </li>
                            <li>
                                <Link to="/voitures-public" className="text-secondary text-decoration-none hover-text-primary">Nos Voitures</Link>
                            </li>
                            <li>
                                <Link to="/agences-public" className="text-secondary text-decoration-none hover-text-primary">Agences</Link>
                            </li>
                            <li>
                                <Link to="/categories-public" className="text-secondary text-decoration-none hover-text-primary">Catégories</Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-secondary text-decoration-none hover-text-primary">Contact</Link>
                            </li>
                        </ul>
                    </Col>

                    {/* Contact Info */}
                    <Col lg={3} md={6}>
                        <h5 className="fw-bold mb-4">Contact</h5>
                        <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
                            <li className="d-flex align-items-center text-secondary">
                                <GeoAlt className="me-2 text-primary" />
                                123 Avenue de la République, Dakar
                            </li>
                            <li className="d-flex align-items-center text-secondary">
                                <Telephone className="me-2 text-primary" />
                                +221 33 123 45 67
                            </li>
                            <li className="d-flex align-items-center text-secondary">
                                <Envelope className="me-2 text-primary" />
                                contact@autoloc-pro.com
                            </li>
                        </ul>
                    </Col>

                    {/* Newsletter */}
                    <Col lg={3} md={6}>
                        <h5 className="fw-bold mb-4">Newsletter</h5>
                        <p className="text-secondary small mb-3">
                            Inscrivez-vous pour recevoir nos offres exclusives et actualités.
                        </p>
                        <Form onSubmit={(e) => e.preventDefault()}>
                            <InputGroup className="mb-3">
                                <Form.Control
                                    placeholder="Votre email"
                                    aria-label="Email"
                                    className="bg-dark text-light border-secondary"
                                    style={{ borderRight: 'none' }}
                                />
                                <Button variant="primary" className="border-secondary border-start-0">
                                    OK
                                </Button>
                            </InputGroup>
                        </Form>
                    </Col>
                </Row>

                <hr className="border-secondary opacity-25" />

                <Row className="pt-3">
                    <Col md={6} className="text-center text-md-start mb-2 mb-md-0">
                        <p className="text-secondary small mb-0">
                            &copy; {new Date().getFullYear()} AutoLoc Pro. Tous droits réservés.
                        </p>
                    </Col>
                    <Col md={6} className="text-center text-md-end">
                        <ul className="list-inline mb-0 small">
                            <li className="list-inline-item">
                                <a href="#" className="text-secondary text-decoration-none hover-text-primary">Mentions Légales</a>
                            </li>
                            <li className="list-inline-item mx-2 text-secondary">•</li>
                            <li className="list-inline-item">
                                <a href="#" className="text-secondary text-decoration-none hover-text-primary">Confidentialité</a>
                            </li>
                        </ul>
                    </Col>
                </Row>
            </Container>

            <style>{`
                .hover-opacity-100:hover {
                    opacity: 1 !important;
                }
                .hover-text-primary:hover {
                    color: var(--bs-primary) !important;
                }
                .transition {
                    transition: all 0.2s ease-in-out;
                }
            `}</style>
        </footer>
    );
};

export default Footer;
