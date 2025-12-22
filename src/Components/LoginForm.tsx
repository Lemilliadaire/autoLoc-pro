// src/components/LoginForm.tsx
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { Container, Card, Form, Button, Alert, InputGroup } from "react-bootstrap";
import { Envelope, Lock, BoxArrowInRight } from "react-bootstrap-icons";

const LoginForm: React.FC = () => {
  const { loginUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await loginUser(email, password);
    } catch (err) {
      console.error("Erreur de connexion :", err);
      setFeedback({
        type: "error",
        message: "Email ou mot de passe incorrect."
      });
      setIsSubmitting(false);
    }
  };


  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Container style={{ maxWidth: '400px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">Bon retour ! 👋</h2>
          <p className="text-muted">Connectez-vous pour accéder à votre espace.</p>
        </div>
        <Card className="shadow-lg border-0 rounded-4">
          <Card.Body className="p-4 p-md-5">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="email">
                <Form.Label className="small fw-semibold text-secondary">Adresse Email</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0 text-muted">
                    <Envelope />
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    placeholder="exemple@email.com"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-start-0 ps-0 shadow-none"
                    style={{ borderLeft: 'none' }}
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4" controlId="password">
                <Form.Label className="small fw-semibold text-secondary">Mot de passe</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0 text-muted">
                    <Lock />
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    placeholder="Votre mot de passe"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-start-0 ps-0 shadow-none"
                    style={{ borderLeft: 'none' }}
                  />
                </InputGroup>
              </Form.Group>

              {feedback && (
                <Alert variant={feedback.type} className="mb-4 small border-0 bg-opacity-10">
                  {feedback.message}
                </Alert>
              )}

              <div className="d-grid gap-2">
                <Button variant="primary" size="lg" type="submit" disabled={isSubmitting} className="rounded-3 fw-semibold">
                  {isSubmitting ? (
                    "Connexion..."
                  ) : (
                    <>
                      Se connecter <BoxArrowInRight className="ms-2" />
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
          <Card.Footer className="bg-white border-0 text-center py-3 rounded-bottom-4">
            <p className="text-muted small mb-0">
              Pas encore de compte ? <Link to="/register" className="fw-bold text-primary text-decoration-none">Inscrivez-vous</Link>
            </p>
          </Card.Footer>
        </Card>
      </Container>
    </div>
  );
};

export default LoginForm;
