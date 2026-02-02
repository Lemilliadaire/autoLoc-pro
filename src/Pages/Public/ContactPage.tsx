// src/Pages/Public/ContactPage.tsx
import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { GeoAltFill, TelephoneFill, EnvelopeFill, SendFill } from 'react-bootstrap-icons';

const ContactPage: React.FC = () => {
    const [validated, setValidated] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();

        if (form.checkValidity()) {
            // Simulation d'un envoi
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 5000);
            form.reset();
            setValidated(false);
        } else {
            setValidated(true);
        }
    };

    return (
        <Container className="py-5">
            {/* Fil d'ariane */}

            <div className="text-center mb-5">
                <h1 className="fw-bold mb-3">Une question ? Un projet ?</h1>
                <p className="text-muted lead">
                    N'hésitez pas à nous contacter par email ou via le formulaire ci-dessous.
                    <br />Notre équipe vous répondra dans les plus brefs délais.
                </p>
            </div>

            <Row className="g-4">
                {/* Informations de contact */}
                <Col lg={5}>
                    <Card className="h-100 border-0 shadow-sm bg-primary text-white">
                        <Card.Body className="p-4 p-lg-5 d-flex flex-column justify-content-between">
                            <div>
                                <h3 className="fw-bold mb-4">Informations</h3>

                                <div className="d-flex align-items-start mb-4">
                                    <div className="p-2 bg-white bg-opacity-25 rounded-circle me-3">
                                        <GeoAltFill size={24} />
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-1">Notre Adresse</h6>
                                        <p className="mb-0 opacity-75">123 Avenue de la République,<br />Lomé, TOGO</p>
                                    </div>
                                </div>

                                <div className="d-flex align-items-start mb-4">
                                    <div className="p-2 bg-white bg-opacity-25 rounded-circle me-3">
                                        <TelephoneFill size={24} />
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-1">Téléphone</h6>
                                        <p className="mb-0 opacity-75">+228 90 12 45 67<br />+228 79 23 45 67</p>
                                    </div>
                                </div>

                                <div className="d-flex align-items-start mb-4">
                                    <div className="p-2 bg-white bg-opacity-25 rounded-circle me-3">
                                        <EnvelopeFill size={24} />
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-1">Email</h6>
                                        <p className="mb-0 opacity-75">contact@autoloc-pro.com<br />support@autoloc-pro.com</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <h6 className="fw-bold mb-3">Horaires d'ouverture</h6>
                                <p className="mb-0 opacity-75 small">
                                    Lundi - Vendredi: 08h00 - 18h00<br />
                                    Samedi: 09h00 - 13h00<br />
                                    Dimanche: Fermé
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Formulaire de contact */}
                <Col lg={7}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="p-4 p-lg-5">
                            <h3 className="fw-bold mb-4">Envoyez-nous un message</h3>

                            {submitted && (
                                <Alert variant="success" onClose={() => setSubmitted(false)} dismissible>
                                    Votre message a bien été envoyé ! Nous vous répondrons très vite.
                                </Alert>
                            )}

                            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group controlId="formName">
                                            <Form.Label>Nom complet</Form.Label>
                                            <Form.Control required type="text" placeholder="Votre nom" />
                                            <Form.Control.Feedback type="invalid">
                                                Merci de renseigner votre nom.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group controlId="formEmail">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control required type="email" placeholder="nom@exemple.com" />
                                            <Form.Control.Feedback type="invalid">
                                                Merci de renseigner un email valide.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12}>
                                        <Form.Group controlId="formSubject">
                                            <Form.Label>Sujet</Form.Label>
                                            <Form.Select required defaultValue="">
                                                <option value="" disabled>Choisir un sujet...</option>
                                                <option value="reservation">Question sur une réservation</option>
                                                <option value="partnership">Proposition de partenariat</option>
                                                <option value="support">Support technique</option>
                                                <option value="other">Autre demande</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12}>
                                        <Form.Group controlId="formMessage">
                                            <Form.Label>Message</Form.Label>
                                            <Form.Control required as="textarea" rows={5} placeholder="Comment pouvons-nous vous aider ?" />
                                            <Form.Control.Feedback type="invalid">
                                                Merci d'écrire votre message.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12}>
                                        <Button variant="primary" type="submit" size="lg" className="w-100 w-md-auto px-5">
                                            <SendFill className="me-2" />
                                            Envoyer le message
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Map (Placeholder) */}
                <Col xs={12}>
                    <Card className="border-0 shadow-sm overflow-hidden">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d1.2255863!3d6.1319222!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1023e1d6c56b4e1f%3A0x2e2c4e6c3e6c4e1f!2sLom%C3%A9%2C%20Togo!5e0!3m2!1sfr!2stg!4v1700000000000!5m2!1sfr!2stg"
                            width="100%"
                            height="400"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Carte de localisation"
                        />
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ContactPage;
