'use client';

import { Bar } from 'react-chartjs-2';

interface MeasurementChartProps {
  labels: string[];
  label: string;
  data: (number | null)[];
}

export default function MeasurementChart({ labels, label, data }: MeasurementChartProps) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Mediciones',
      },
      datalabels: {
        color: '#0f172b',
      },
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
      },
    ],
  };

  return (
    <div>
      <Bar options={options} data={chartData} className="min-h-48 w-full" />
    </div>
  );
}
