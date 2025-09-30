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
import ChartDataLabels from 'chartjs-plugin-datalabels';

import MeasurementChart from '@/components/measurement-chart';
import { IUserWithMeasurements } from '@/types/user';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

interface UserMeasurementsProps {
  user: IUserWithMeasurements;
}

export default function UserMeasurements({ user }: UserMeasurementsProps) {
  const currentYear = new Date().getFullYear();
  const [years, setYears] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [weightMeasurements, setWeightMeasurements] = useState<(number | null)[]>([]);
  const [waterPercentageMeasurements, setWaterPercentageMeasurements] = useState<(number | null)[]>(
    [],
  );
  const [rightArmMeasurements, setRightArmMeasurements] = useState<(number | null)[]>([]);
  const [leftArmMeasurements, setLeftArmMeasurements] = useState<(number | null)[]>([]);
  const [rightLegMeasurements, setRightLegMeasurements] = useState<(number | null)[]>([]);
  const [leftLegMeasurements, setLeftLegMeasurements] = useState<(number | null)[]>([]);

  const getMonthlyMeasurements = () => {
    const months = getMonthsNumbers('es-CR');
    const measurements = user.measurements.map((measurement) => {
      const { yearMonth, weight, waterPercentage, rightArm, leftArm, rightLeg, leftLeg } =
        measurement;
      const month = yearMonth.split('/')[0];
      return { month, weight, waterPercentage, rightArm, leftArm, rightLeg, leftLeg };
    });
    const measurementsByMonth = months.map((month) => {
      const measurementByMonth = measurements.find((measurement) => {
        return measurement.month === month;
      });
      if (measurementByMonth) {
        const { month, weight, waterPercentage, rightArm, leftArm, rightLeg, leftLeg } =
          measurementByMonth;
        return { month, weight, waterPercentage, rightArm, leftArm, rightLeg, leftLeg };
      }
      return {
        month,
        weight: null,
        waterPercentage: null,
        rightArm: null,
        leftArm: null,
        rightLeg: null,
        leftLeg: null,
      };
    });
    setWeightMeasurements(measurementsByMonth.map(({ weight }) => weight));
    setWaterPercentageMeasurements(
      measurementsByMonth.map(({ waterPercentage }) => waterPercentage),
    );
    setRightArmMeasurements(measurementsByMonth.map(({ rightArm }) => rightArm));
    setLeftArmMeasurements(measurementsByMonth.map(({ leftArm }) => leftArm));
    setRightLegMeasurements(measurementsByMonth.map(({ rightLeg }) => rightLeg));
    setLeftLegMeasurements(measurementsByMonth.map(({ leftLeg }) => leftLeg));
  };

  const getMonthsNumbers = (locale: string) => {
    const format = new Intl.DateTimeFormat(locale, { month: '2-digit' });
    const months = [];
    for (let month = 0; month < 12; month++) {
      const date = new Date(currentYear, month, 1, 0, 0, 0);
      months.push(format.format(date));
    }
    return months.map((month) => {
      return month;
    });
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

  useEffect(() => {
    getMonthlyMeasurements();
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
        <MeasurementChart labels={labels} label="Peso" data={weightMeasurements} />
        <MeasurementChart labels={labels} label="Peso" data={waterPercentageMeasurements} />
        <MeasurementChart labels={labels} label="Brazo derecho" data={rightArmMeasurements} />
        <MeasurementChart labels={labels} label="Brazo izquierdo" data={leftArmMeasurements} />
        <MeasurementChart labels={labels} label="Pierna derecha" data={rightLegMeasurements} />
        <MeasurementChart labels={labels} label="Pierna izquierda" data={leftLegMeasurements} />
      </div>
    </>
  );
}
