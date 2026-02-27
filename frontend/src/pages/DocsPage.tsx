import { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { api } from '../services/api';

export const DocsPage = () => {
  const [steps, setSteps] = useState<string[]>([]);

  useEffect(() => {
    api.get('/docs/user').then((res) => setSteps(res.data.steps));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="mx-auto max-w-4xl space-y-4 p-6">
        <h2 className="text-2xl font-bold">Documentación de uso</h2>
        <p className="text-slate-300">Guía rápida para operar la plataforma y entender estados del procesamiento.</p>
        <ol className="list-decimal space-y-2 pl-6 text-slate-200">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </main>
    </div>
  );
};
