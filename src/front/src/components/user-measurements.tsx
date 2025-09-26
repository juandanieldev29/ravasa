'use client';

import { useState, useEffect } from 'react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export default function UserMeasurements() {
  const currentYear = new Date().getFullYear();
  const [years, setYears] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
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
  const data = {
    labels,
    datasets: [
      {
        label: 'Peso',
        data: [69, 75, 82, 73, 74.5, 79, 77],
      },
    ],
  };

  const getMonthsForLocale = (locale: string) => {
    const format = new Intl.DateTimeFormat(locale, { month: 'short' });
    const months = [];
    for (let month = 0; month < 12; month++) {
      const date = new Date(currentYear, month, 1, 0, 0, 0);
      months.push(format.format(date));
    }
    return months.map((month) => {
      return capitalizeFirstLetter(month);
    });
  };

  const capitalizeFirstLetter = (word: string) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  useEffect(() => {
    const months = getMonthsForLocale('es-CR');
    setLabels(months);
  }, []);

  useEffect(() => {
    setYears([currentYear, currentYear - 1, currentYear - 2]);
  }, []);

  return (
    <>
      <form className="max-w-sm mx-auto mt-4">
        <label htmlFor="countries">Selecciona un año</label>
        <select
          id="year"
          className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
          defaultValue={currentYear}
        >
          {years.map((year) => {
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
      </form>
      <div className="grid xl:grid-cols-2 gap-4">
        <div>
          <Bar options={options} data={data} className="min-h-48 w-full" />
        </div>
        <div>
          <Bar options={options} data={data} className="min-h-48 w-full" />
        </div>
      </div>
    </>
  );
}
