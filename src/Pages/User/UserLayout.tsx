import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import UserSidebar from '../../Components/UserSidebar';
import { ArrowLeft } from 'react-bootstrap-icons';

const UserLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Détermine si on est sur la page principale du dashboard
    const isDashboardRoot = location.pathname === '/dashboard';

    return (
        <Container fluid>
            <Row>
                <Col md={3} lg={2} className="d-none d-md-block p-0"><UserSidebar /></Col>
                <Col md={9} lg={10} className="p-4">
                    {!isDashboardRoot && (
                        <Button
                            variant="light"
                            className="mb-3 d-flex align-items-center text-muted px-0 border-0 bg-transparent"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="me-2" /> Retour
                        </Button>
                    )}
                    <Outlet />
                </Col>
            </Row>
        </Container>
    );
};

export default UserLayout;
