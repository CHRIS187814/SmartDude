import { useState } from 'react';
import { Plus, FolderKanban, Trash2, Calendar } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { cn, formatDate } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';

const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'];

export default function Projects() {
  const { projects, loading, createProject, deleteProject } = useProjects();
  const { tasks } = useTasks();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(colors[0]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createProject(name, description, color);
    setName(''); setDescription(''); setColor(colors[0]);
    setCreateOpen(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> New project</button>
      </div>

      {projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects yet" description="Organize your tasks into projects to keep things structured." action={<button onClick={() => setCreateOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> New project</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => {
            const projectTasks = tasks.filter((t) => t.project_id === p.id);
            const done = projectTasks.filter((t) => t.completed).length;
            const total = projectTasks.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={p.id} className="card p-5 card-hover group">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${p.color}20` }}>
                    <FolderKanban className="w-5 h-5" style={{ color: p.color }} />
                  </div>
                  <button onClick={() => deleteProject(p.id)} className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-error-500 p-1 transition"><Trash2 className="w-4 h-4" /></button>
                </div>
                <h3 className="font-semibold mt-3">{p.name}</h3>
                {p.description && <p className="text-sm text-ink-500 dark:text-ink-400 mt-1 line-clamp-2">{p.description}</p>}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-ink-400 mb-1.5">
                    <span>{done}/{total} tasks</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                  </div>
                </div>
                {p.due_date && (
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-ink-400">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(p.due_date)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New project">
        <div className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" autoFocus />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[60px] resize-y" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this project about?" />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((c) => (
                <button key={c} onClick={() => setColor(c)} className={cn('w-8 h-8 rounded-lg transition', color === c && 'ring-2 ring-offset-2 ring-ink-400 dark:ring-offset-ink-900')} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} className="btn-primary"><Plus className="w-4 h-4" /> Create</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
