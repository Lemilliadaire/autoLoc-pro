// src/components/RegisterForm.tsx
import React, { useState } from "react";
import { register } from "../services/auth";
import { Link, useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert, Row, Col, InputGroup } from "react-bootstrap";
import { Person, Telephone, Envelope, Lock, PersonPlus } from "react-bootstrap-icons";
import { isAxiosError } from "axios";

const RegisterForm: React.FC = () => {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirm, setPasswordConfirm] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await register(name, lastname, phone, email, password, password_confirm);
      setFeedback({ type: "success", message: "Inscription réussie ! Redirection..." });
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      let errorMessage = "Erreur lors de l'inscription.";
      if (isAxiosError(error) && error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          const firstErrorKey = Object.keys(validationErrors)[0];
          errorMessage = validationErrors[firstErrorKey][0];
        }
      }
      setFeedback({ type: "error", message: errorMessage });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light py-5">
      <Container style={{ maxWidth: '500px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">Créez votre compte 🚀</h2>
          <p className="text-muted">Rejoignez-nous pour louer simplement.</p>
        </div>
        <Card className="shadow-lg border-0 rounded-4">
          <Card.Body className="p-4 p-md-5">
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="name">
                    <Form.Label className="small fw-semibold text-secondary">Nom</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-white border-end-0 text-muted"><Person /></InputGroup.Text>
                      <Form.Control className="border-start-0 ps-0 shadow-none border-left-0" type="text" placeholder="Nom" required autoFocus value={name} onChange={(e) => setName(e.target.value)} />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="lastname">
                    <Form.Label className="small fw-semibold text-secondary">Prénom</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-white border-end-0 text-muted"><Person /></InputGroup.Text>
                      <Form.Control className="border-start-0 ps-0 shadow-none" type="text" placeholder="Prénom" required value={lastname} onChange={(e) => setLastname(e.target.value)} />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3" controlId="phone">
                <Form.Label className="small fw-semibold text-secondary">Téléphone</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0 text-muted"><Telephone /></InputGroup.Text>
                  <Form.Control className="border-start-0 ps-0 shadow-none" type="tel" placeholder="06 12 34 56 78" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label className="small fw-semibold text-secondary">Email</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0 text-muted"><Envelope /></InputGroup.Text>
                  <Form.Control className="border-start-0 ps-0 shadow-none" type="email" placeholder="exemple@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </InputGroup>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label className="small fw-semibold text-secondary">Mot de passe</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-white border-end-0 text-muted"><Lock /></InputGroup.Text>
                      <Form.Control className="border-start-0 ps-0 shadow-none" type="password" placeholder="******" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4" controlId="password_confirm">
                    <Form.Label className="small fw-semibold text-secondary">Confirmer</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-white border-end-0 text-muted"><Lock /></InputGroup.Text>
                      <Form.Control className="border-start-0 ps-0 shadow-none" type="password" placeholder="******" required value={password_confirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>

              {feedback && (
                <Alert variant={feedback.type === 'success' ? 'success' : 'danger'} className="mb-4 small border-0 bg-opacity-10">
                  {feedback.message}
                </Alert>
              )}

              <div className="d-grid">
                <Button variant="primary" size="lg" type="submit" disabled={isSubmitting} className="rounded-3 fw-semibold">
                  {isSubmitting ? "Inscription..." : <><PersonPlus className="me-2" /> S'inscrire</>}
                </Button>
              </div>
            </Form>
          </Card.Body>
          <Card.Footer className="bg-white border-0 text-center py-3 rounded-bottom-4">
            <p className="text-muted small mb-0">
              Déjà un compte ? <Link to="/login" className="fw-bold text-primary text-decoration-none">Connectez-vous</Link>
            </p>
          </Card.Footer>
        </Card>
      </Container>
    </div>
  );
};

export default RegisterForm;
