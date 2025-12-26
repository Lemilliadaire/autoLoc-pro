// src/Pages/Public/ConfidentialitePage.tsx
import React from 'react';
import { Container, Card } from 'react-bootstrap';

const ConfidentialitePage: React.FC = () => {
    return (
        <div className="py-5 bg-light min-h-screen">
            <Container>
                <div className="text-center mb-5">
                    <h1 className="fw-bold text-gradient">Politique de Confidentialité</h1>
                    <p className="text-muted">Comment nous protégeons vos données personnelles</p>
                </div>

                <Card className="border-0 shadow-sm p-4 p-md-5">
                    <section className="mb-5">
                        <h2 className="h4 fw-bold text-primary mb-3">1. Collecte des Données</h2>
                        <p>Nous collectons les informations que vous nous fournissez lors de votre inscription, notamment : nom, prénom, adresse e-mail, numéro de téléphone et informations relatives au permis de conduire.</p>
                    </section>

                    <section className="mb-5">
                        <h2 className="h4 fw-bold text-primary mb-3">2. Utilisation des Données</h2>
                        <p>Vos données sont utilisées pour :</p>
                        <ul>
                            <li>Gérer vos réservations de véhicules</li>
                            <li>Vérifier votre éligibilité à la location</li>
                            <li>Vous envoyer des confirmations et mises à jour</li>
                            <li>Améliorer nos services</li>
                        </ul>
                    </section>

                    <section className="mb-5">
                        <h2 className="h4 fw-bold text-primary mb-3">3. Protection des Données</h2>
                        <p>AutoLoc Pro met en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données contre tout accès non autorisé, altération ou divulgation.</p>
                    </section>

                    <section className="mb-5">
                        <h2 className="h4 fw-bold text-primary mb-3">4. Cookies</h2>
                        <p>Notre site utilise des cookies pour améliorer votre expérience utilisateur et analyser le trafic. Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela pourrait limiter certaines fonctionnalités.</p>
                    </section>

                    <section>
                        <h2 className="h4 fw-bold text-primary mb-3">5. Vos Droits</h2>
                        <p>Conformément aux lois sur la protection des données, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Pour exercer ces droits, contactez-nous à l'adresse email : privacy@autoloc-pro.com.</p>
                    </section>
                </Card>
            </Container>
        </div>
    );
};

export default ConfidentialitePage;
