import { FormEvent, useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { api } from '../services/api';

type Metrics = { total: number; completed: number; failed: number; processing: number };

type Video = {
  id: string;
  originalName: string;
  taskType: string;
  status: string;
  createdAt: string;
  result?: { providerUsed: string; confidenceScore: number };
};

export const DashboardPage = () => {
  const [metrics, setMetrics] = useState<Metrics>({ total: 0, completed: 0, failed: 0, processing: 0 });
  const [videos, setVideos] = useState<Video[]>([]);
  const [taskType, setTaskType] = useState('TRANSCRIPTION');
  const [file, setFile] = useState<File | null>(null);

  const load = async () => {
    const [m, v] = await Promise.all([api.get('/videos/metrics'), api.get('/videos')]);
    setMetrics(m.data);
    setVideos(v.data);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  const onUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const form = new FormData();
    form.append('video', file);
    form.append('taskType', taskType);
    await api.post('/videos/upload', form);
    setFile(null);
    await load();
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="mx-auto grid max-w-6xl gap-6 p-4">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(metrics).map(([k, v]) => (
            <article key={k} className="rounded border border-slate-800 bg-slate-900 p-4">
              <p className="text-sm uppercase text-slate-400">{k}</p>
              <p className="text-2xl font-bold">{v}</p>
            </article>
          ))}
        </section>

        <section className="rounded border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-4 text-lg font-semibold">Subir video</h2>
          <form onSubmit={onUpload} className="flex flex-col gap-3 sm:flex-row">
            <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="rounded bg-slate-800 p-2" />
            <select value={taskType} onChange={(e) => setTaskType(e.target.value)} className="rounded bg-slate-800 p-2">
              <option value="TRANSCRIPTION">Transcripción</option>
              <option value="OBJECT_DETECTION">Detección de objetos</option>
              <option value="FACE_RECOGNITION">Reconocimiento facial</option>
            </select>
            <button className="rounded bg-cyan-600 px-4 py-2 font-semibold">Procesar</button>
          </form>
        </section>

        <section className="rounded border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-4 text-lg font-semibold">Histórico de videos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400">
                  <th>Nombre</th>
                  <th>Tarea</th>
                  <th>Estado</th>
                  <th>Proveedor</th>
                  <th>Confianza</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr key={video.id} className="border-t border-slate-800">
                    <td className="py-2">{video.originalName}</td>
                    <td>{video.taskType}</td>
                    <td>{video.status}</td>
                    <td>{video.result?.providerUsed || '-'}</td>
                    <td>{video.result?.confidenceScore ? `${Math.round(video.result.confidenceScore * 100)}%` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};
