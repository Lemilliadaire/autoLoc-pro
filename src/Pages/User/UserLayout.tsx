// src/Pages/User/UserLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import UserSidebar from '../../Components/UserSidebar';

const UserLayout: React.FC = () => {
    return (
        <Container fluid>
            <Row>
                <Col md={3} lg={2} className="d-none d-md-block p-0"><UserSidebar /></Col>
                <Col md={9} lg={10} className="p-4"><Outlet /></Col>
            </Row>
        </Container>
    );
};

export default UserLayout;
