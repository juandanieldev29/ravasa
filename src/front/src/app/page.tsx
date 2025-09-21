import Card from '@/components/card';

export default function Home() {
  return (
    <div className="grid lg:grid-cols-4 gap-4">
      <Card
        title="¿Quienes somos?"
        text="Ravasa nacio en el 2019, iniciamos unicamente con funcionales y actualmente tenemos varias maquinas de gimnasio y alrededor de 60 clientes"
      />
      <Card title="Ubicación" text="Estamos ubicados en el salon comunal de Sucre" />
      <Card title="¿Que ofrecemos?" text="Somos un gimnasio semipersonalizado" />
      <Card
        title="Mediciones"
        text="Puedes consultar tus mediciones desde la comodidad de tu casa"
      />
    </div>
  );
}
