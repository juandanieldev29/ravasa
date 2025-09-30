'use client';

import { useState, useEffect, useContext } from 'react';

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

import { LoadingContext } from '@/contexts/loading-context';
import { UserContext } from '@/contexts/user-context';
import MeasurementChart from '@/components/measurement-chart';
import { LoadingAction } from '@/enums/loading-action';
import { IUserWithMeasurements } from '@/types/user';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

interface UserMeasurementsProps {
  user: IUserWithMeasurements;
}

export default function UserMeasurements({ user }: UserMeasurementsProps) {
  const currentYear = new Date().getFullYear();
  const [userWithMeasurements, setUserWithMeasurements] = useState<IUserWithMeasurements>(user);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [years, setYears] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [weightMeasurements, setWeightMeasurements] = useState<(number | null)[]>([]);
  const [fatPercentageMeasurements, setFatPercentageMeasurements] = useState<(number | null)[]>([]);
  const [bodyMassIndexMeasurements, setBodyMassIndexMeasurements] = useState<(number | null)[]>([]);
  const [visceralFatMeasurements, setVisceralFatMeasurements] = useState<(number | null)[]>([]);
  const [muscleMassMeasurements, setMuscleMassMeasurements] = useState<(number | null)[]>([]);
  const [waterPercentageMeasurements, setWaterPercentageMeasurements] = useState<(number | null)[]>(
    [],
  );
  const [metabolicAgeMeasurements, setMetabolicAgeMeasurements] = useState<(number | null)[]>([]);
  const [session] = useContext(UserContext);
  const { dispatch } = useContext(LoadingContext);

  const fetchUser = async () => {
    try {
      dispatch({ type: LoadingAction.INCREASE_HTTP_REQUEST_COUNT });
      if (!session?.tokens?.idToken) {
        return;
      }
      const idToken = session.tokens.idToken.toString();
      const response = await fetch(
        `https://api-dev.ravasa.net/user/${userWithMeasurements.sub}?year=${selectedYear}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          credentials: 'same-origin',
          cache: 'no-store',
        },
      );
      const fetchedUser: IUserWithMeasurements = await response.json();
      setUserWithMeasurements(fetchedUser);
    } catch (err) {
      console.log(err);
    } finally {
      dispatch({ type: LoadingAction.DECREASE_HTTP_REQUEST_COUNT });
    }
  };

  const getMonthlyMeasurements = () => {
    const months = getMonthsNumbers('es-CR');
    const measurements = userWithMeasurements.measurements.map((measurement) => {
      const {
        yearMonth,
        weight,
        fatPercentage,
        bodyMassIndex,
        visceralFat,
        muscleMass,
        waterPercentage,
        metabolicAge,
      } = measurement;
      const month = yearMonth.split('/')[1];
      return {
        month,
        weight,
        fatPercentage,
        bodyMassIndex,
        visceralFat,
        muscleMass,
        waterPercentage,
        metabolicAge,
      };
    });
    const measurementsByMonth = months.map((month) => {
      const measurementByMonth = measurements.find((measurement) => {
        return measurement.month === month;
      });
      if (measurementByMonth) {
        const {
          month,
          weight,
          fatPercentage,
          bodyMassIndex,
          visceralFat,
          muscleMass,
          waterPercentage,
          metabolicAge,
        } = measurementByMonth;
        return {
          month,
          weight,
          fatPercentage,
          bodyMassIndex,
          visceralFat,
          muscleMass,
          waterPercentage,
          metabolicAge,
        };
      }
      return {
        month,
        weight: null,
        fatPercentage: null,
        bodyMassIndex: null,
        visceralFat: null,
        muscleMass: null,
        waterPercentage: null,
        metabolicAge: null,
      };
    });
    setWeightMeasurements(measurementsByMonth.map(({ weight }) => weight));
    setFatPercentageMeasurements(measurementsByMonth.map(({ fatPercentage }) => fatPercentage));
    setBodyMassIndexMeasurements(measurementsByMonth.map(({ bodyMassIndex }) => bodyMassIndex));
    setVisceralFatMeasurements(measurementsByMonth.map(({ visceralFat }) => visceralFat));
    setMuscleMassMeasurements(measurementsByMonth.map(({ muscleMass }) => muscleMass));
    setWaterPercentageMeasurements(
      measurementsByMonth.map(({ waterPercentage }) => waterPercentage),
    );
    setMetabolicAgeMeasurements(measurementsByMonth.map(({ metabolicAge }) => metabolicAge));
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

  const onSelectYear = (selectedYear: string) => {
    setSelectedYear(Number.parseInt(selectedYear, 10));
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
  }, [userWithMeasurements]);

  useEffect(() => {
    if (selectedYear) {
      fetchUser();
    }
  }, [selectedYear]);

  return (
    <>
      <form className="max-w-sm mx-auto mt-4">
        <label htmlFor="year">Selecciona un año</label>
        <select
          id="year"
          className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
          defaultValue={currentYear}
          onChange={(event) => onSelectYear(event.target.value)}
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
        <MeasurementChart
          labels={labels}
          label="Porcentaje de grasa"
          data={fatPercentageMeasurements}
        />
        <MeasurementChart
          labels={labels}
          label="Índice de Masa Corporal"
          data={bodyMassIndexMeasurements}
        />
        <MeasurementChart labels={labels} label="Grasa visceral" data={visceralFatMeasurements} />
        <MeasurementChart labels={labels} label="Masa muscular" data={muscleMassMeasurements} />
        <MeasurementChart labels={labels} label="Agua" data={waterPercentageMeasurements} />
        <MeasurementChart labels={labels} label="Edad metabólica" data={metabolicAgeMeasurements} />
      </div>
    </>
  );
}
