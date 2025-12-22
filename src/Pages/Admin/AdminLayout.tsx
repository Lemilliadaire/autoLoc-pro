// src/Pages/Admin/AdminLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import AdminSidebar from '../../Components/AdminSidebar';

const AdminLayout: React.FC = () => {
  return (
    <Container fluid className="mb-5">
      <Row>
        <Col md={3} lg={2} className="d-none d-md-block p-0"><AdminSidebar /></Col>
        <Col md={9} lg={10} className="p-4"><Outlet /></Col>
      </Row>
    </Container>
  );
};

export default AdminLayout;