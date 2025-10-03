'use client';

import { useState, useEffect, useContext } from 'react';

import { LoadingContext } from '@/contexts/loading-context';
import { UserContext } from '@/contexts/user-context';
import { LoadingAction } from '@/enums/loading-action';

interface NewUserMeasurementsProps {
  userId: string;
}

export default function NewUserMeasurements({ userId }: NewUserMeasurementsProps) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const format = new Intl.DateTimeFormat('es-CR', { month: '2-digit' });
  const [session] = useContext(UserContext);
  const { dispatch } = useContext(LoadingContext);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(format.format(currentDate));
  const [years, setYears] = useState<number[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [monthsNumbers, setMonthsNumbers] = useState<string[]>([]);
  const [weight, setWeight] = useState<number | null>(null);
  const [fatPercentage, setFatPercentage] = useState<number | null>(null);
  const [bodyMass, setBodyMass] = useState<number | null>(null);
  const [visceralFat, setVisceralFat] = useState<number | null>(null);
  const [muscleMass, setMuscleMass] = useState<number | null>(null);
  const [waterPercentage, setWaterPercentage] = useState<number | null>(null);
  const [metabolicAge, setMetabolicAge] = useState<number | null>(null);

  const onSelectYear = (selectedYear: string) => {
    setSelectedYear(Number.parseInt(selectedYear, 10));
  };

  const onSelectMonth = (selectedMonth: string) => {
    setSelectedMonth(selectedMonth);
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
    const format = new Intl.DateTimeFormat(locale, { month: 'long' });
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

  const onSaveMeasurement = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      dispatch({ type: LoadingAction.INCREASE_HTTP_REQUEST_COUNT });
      if (!session?.tokens?.idToken) {
        return;
      }
      const idToken = session.tokens.idToken.toString();
      const payload = {
        userId: userId,
        yearMonth: `${selectedYear}/${selectedMonth}`,
        weight: weight,
        fatPercentage: fatPercentage,
        bodyMassIndex: bodyMass,
        visceralFat: visceralFat,
        muscleMass: muscleMass,
        waterPercentage: waterPercentage,
        metabolicAge: metabolicAge,
      };
      const response = await fetch('https://api-dev.ravasa.net/measurement', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        console.log('Record saved');
      }
    } catch (err) {
      console.log(err);
    } finally {
      dispatch({ type: LoadingAction.DECREASE_HTTP_REQUEST_COUNT });
    }
  };

  useEffect(() => {
    setYears([currentYear - 1, currentYear - 2, currentYear]);
  }, []);

  useEffect(() => {
    const months = getMonthsForLocale('es-CR');
    setMonths(months);
  }, []);

  useEffect(() => {
    const months = getMonthsNumbers('es-CR');
    setMonthsNumbers(months);
  }, []);

  return (
    <form className="max-w-sm mx-auto mt-4" onSubmit={onSaveMeasurement}>
      {!!years && !!years.length && (
        <>
          <label htmlFor="year">Selecciona un año</label>
          <select
            id="year"
            name="year"
            className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 mb-2"
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
        </>
      )}
      {!!months && !!months.length && (
        <>
          <label htmlFor="month">Selecciona un mes</label>
          <select
            id="month"
            name="month"
            className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 mb-2"
            defaultValue={selectedMonth}
            onChange={(event) => onSelectMonth(event.target.value)}
          >
            {months.map((month, i) => {
              return (
                <option key={month} value={monthsNumbers[i]}>
                  {month}
                </option>
              );
            })}
          </select>
        </>
      )}
      <label htmlFor="weight">Peso</label>
      <input
        id="weight"
        type="number"
        required
        name="weight"
        className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 mb-2"
        min={0}
        step="0.1"
        onChange={({ target }) => setWeight(Number.parseInt(target.value, 10))}
      />
      <label htmlFor="fatPercentage">Porcentaje de grasa</label>
      <input
        id="fatPercentage"
        type="number"
        required
        name="fatPercentage"
        className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 mb-2"
        min={0}
        step="0.1"
        onChange={({ target }) => setFatPercentage(Number.parseInt(target.value, 10))}
      />
      <label htmlFor="bodyMass">Índice de Masa Corporal</label>
      <input
        id="bodyMass"
        type="number"
        required
        name="bodyMass"
        className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 mb-2"
        min={0}
        step="0.1"
        onChange={({ target }) => setBodyMass(Number.parseInt(target.value, 10))}
      />
      <label htmlFor="visceralFat">Grasa visceral</label>
      <input
        id="visceralFat"
        type="number"
        required
        name="visceralFat"
        className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 mb-2"
        min={0}
        step="0.1"
        onChange={({ target }) => setVisceralFat(Number.parseInt(target.value, 10))}
      />
      <label htmlFor="muscleMass">Masa muscular</label>
      <input
        id="muscleMass"
        type="number"
        required
        name="muscleMass"
        className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 mb-2"
        min={0}
        step="0.1"
        onChange={({ target }) => setMuscleMass(Number.parseInt(target.value, 10))}
      />
      <label htmlFor="waterPercentage">Agua</label>
      <input
        id="waterPercentage"
        type="number"
        required
        name="waterPercentage"
        className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 mb-2"
        min={0}
        step="0.1"
        onChange={({ target }) => setWaterPercentage(Number.parseInt(target.value, 10))}
      />
      <label htmlFor="metabolicAge">Edad metabólica</label>
      <input
        id="metabolicAge"
        type="number"
        required
        name="metabolicAge"
        className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 mb-2"
        min={0}
        onChange={({ target }) => setMetabolicAge(Number.parseInt(target.value, 10))}
      />
      <button
        type="submit"
        className="cursor-pointer bg-slate-900 text-white p-2 mt-4 mx-auto block"
      >
        Guardar
      </button>
    </form>
  );
}
