import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function SkillRadarChart({ categories, studentScores, benchmarkScores }) {
  const data = {
    labels: categories && categories.length > 0 ? categories : ["Technical", "Soft", "Domain", "Ayush & Health", "Management"],
    datasets: [
      {
        label: 'My Skill Profile',
        data: studentScores && studentScores.length > 0 ? studentScores : [4.0, 4.0, 3.0, 2.0, 3.0],
        backgroundColor: 'rgba(56, 189, 248, 0.25)',
        borderColor: '#38bdf8',
        borderWidth: 2,
        pointBackgroundColor: '#38bdf8',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#38bdf8',
      },
      {
        label: 'Industry Benchmark',
        data: benchmarkScores && benchmarkScores.length > 0 ? benchmarkScores : [4.0, 4.0, 4.0, 4.0, 4.0],
        backgroundColor: 'rgba(52, 211, 153, 0.15)',
        borderColor: '#34d399',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointBackgroundColor: '#34d399',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.15)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        pointLabels: {
          color: '#cbd5e1',
          font: {
            size: 12,
            family: 'Outfit, sans-serif',
            weight: '600'
          },
        },
        ticks: {
          color: '#64748b',
          backdropColor: 'transparent',
          stepSize: 1,
          min: 0,
          max: 5,
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#f8fafc',
          font: {
            family: 'Inter, sans-serif',
            size: 13,
          },
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#38bdf8',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(56, 189, 248, 0.3)',
        borderWidth: 1,
        padding: 12,
      },
    },
  };

  return (
    <div style={{ height: '340px', width: '100%', position: 'relative' }}>
      <Radar data={data} options={options} />
    </div>
  );
}
