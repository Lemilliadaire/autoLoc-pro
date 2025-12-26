// src/Pages/Public/MentionsLegalesPage.tsx
import React from 'react';
import { Container, Card } from 'react-bootstrap';

const MentionsLegalesPage: React.FC = () => {
    return (
        <div className="py-5 bg-light min-h-screen">
            <Container>
                <div className="text-center mb-5">
                    <h1 className="fw-bold text-gradient">Mentions Légales</h1>
                    <p className="text-muted">Informations obligatoires concernant AutoLoc Pro</p>
                </div>

                <Card className="border-0 shadow-sm p-4 p-md-5">
                    <section className="mb-5">
                        <h2 className="h4 fw-bold text-primary mb-3">1. Éditeur du Site</h2>
                        <p>Le site <strong>AutoLoc Pro</strong> est édité par la société <strong>AutoLoc Pro S.A.R.L</strong>.</p>
                        <p>
                            Siège social : 123 Avenue de la République, Lomé, Togo<br />
                            Capital social : 1.000.000 FCFA<br />
                            Immatriculation : RCCM TG-LOM 2024 B 1234
                        </p>
                    </section>

                    <section className="mb-5">
                        <h2 className="h4 fw-bold text-primary mb-3">2. Directeur de la Publication</h2>
                        <p>Le directeur de la publication est M. Jean Dupont, en sa qualité de Gérant.</p>
                    </section>

                    <section className="mb-5">
                        <h2 className="h4 fw-bold text-primary mb-3">3. Hébergement</h2>
                        <p>Le site est hébergé par : Vercel Inc.<br />
                            Adresse : 440 N Barranca Ave #4133 Covina, CA 91723</p>
                    </section>

                    <section className="mb-5">
                        <h2 className="h4 fw-bold text-primary mb-3">4. Propriété Intellectuelle</h2>
                        <p>L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.</p>
                    </section>

                    <section>
                        <h2 className="h4 fw-bold text-primary mb-3">5. Contact</h2>
                        <p>
                            E-mail : contact@autoloc-pro.com<br />
                            Téléphone : +228 79 80 89 15
                        </p>
                    </section>
                </Card>
            </Container>
        </div>
    );
};

export default MentionsLegalesPage;
