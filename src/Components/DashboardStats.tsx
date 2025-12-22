// src/Components/Admin/DashboardStats.tsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import { Row, Col, Card } from 'react-bootstrap';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardStats: React.FC = () => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        font: {
          size: 16,
        },
      },
    },
  };

  const labels = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet'];

  const lineChartData = {
    labels,
    datasets: [
      {
        label: 'Nouvelles locations',
        data: labels.map(() => faker.number.int({ min: 10, max: 100 })),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Nouveaux clients',
        data: labels.map(() => faker.number.int({ min: 5, max: 50 })),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const doughnutChartData = {
    labels: ['Disponibles', 'En location', 'En maintenance'],
    datasets: [
      {
        label: 'Statut des voitures',
        data: [12, 19, 3],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(255, 99, 132, 0.7)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Row className="g-4 mb-5">
      <Col lg={8}>
        <Card className="shadow-sm h-100">
          <Card.Body><Line options={{...options, plugins: {...options.plugins, title: {...options.plugins.title, text: 'Activité des 7 derniers mois'}} }} data={lineChartData} /></Card.Body>
        </Card>
      </Col>
      <Col lg={4}>
        <Card className="shadow-sm h-100">
          <Card.Body><Doughnut options={{...options, plugins: {...options.plugins, title: {...options.plugins.title, text: 'Répartition du parc automobile'}} }} data={doughnutChartData} /></Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default DashboardStats;