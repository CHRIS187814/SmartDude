import { useMemo, useState } from 'react';
import { Plus, CheckCircle2, Search, Filter, Calendar, Flag, Trash2, ListTodo, X } from 'lucide-react';
import { useTasks, useSubtasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { cn, isToday, isOverdue, formatDate, formatTime, priorityColors, priorityDot } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import type { Task, Priority } from '@/types';

type FilterType = 'all' | 'today' | 'overdue' | 'completed' | 'high';

export default function Tasks() {
  const { tasks, loading, createTask, updateTask, deleteTask, toggleComplete } = useTasks();
  const { projects } = useProjects();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDueTime, setNewDueTime] = useState('');
  const [newProject, setNewProject] = useState('');

  const filtered = useMemo(() => {
    let result = tasks;
    if (filter === 'today') result = result.filter((t) => !t.completed && (isToday(t.due_date) || isToday(t.reminder_at)));
    else if (filter === 'overdue') result = result.filter((t) => !t.completed && t.due_date && isOverdue(t.due_date) && !isToday(t.due_date));
    else if (filter === 'completed') result = result.filter((t) => t.completed);
    else if (filter === 'high') result = result.filter((t) => !t.completed && (t.priority === 'high' || t.priority === 'urgent'));
    if (search) result = result.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
    return result;
  }, [tasks, filter, search]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await createTask({
      title: newTitle,
      priority: newPriority,
      due_date: newDueDate || null,
      due_time: newDueTime || null,
      project_id: newProject || null,
    });
    setNewTitle(''); setNewPriority('medium'); setNewDueDate(''); setNewDueTime(''); setNewProject('');
    setCreateOpen(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">{tasks.filter((t) => !t.completed).length} active · {tasks.filter((t) => t.completed).length} completed</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary self-start">
          <Plus className="w-4 h-4" /> New task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks…" className="input pl-10" />
          </div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {([
            { id: 'all', label: 'All' },
            { id: 'today', label: 'Today' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'high', label: 'High' },
            { id: 'completed', label: 'Done' },
          ] as { id: FilterType; label: string }[]).map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={cn('chip whitespace-nowrap', filter === f.id ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300')}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <EmptyState icon={ListTodo} title="No tasks found" description={search ? 'Try a different search.' : 'Create your first task to get started.'} action={<button onClick={() => setCreateOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> New task</button>} />
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} projects={projects} onToggle={() => toggleComplete(task)} onEdit={() => setEditingTask(task)} onDelete={() => deleteTask(task.id)} />
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New task">
        <div className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="What needs to be done?" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleCreate()} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Due date</label>
              <input type="date" className="input" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Due time</label>
              <input type="time" className="input" value={newDueTime} onChange={(e) => setNewDueTime(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Priority</label>
              <select className="input" value={newPriority} onChange={(e) => setNewPriority(e.target.value as Priority)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="label">Project</label>
              <select className="input" value={newProject} onChange={(e) => setNewProject(e.target.value)}>
                <option value="">None</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} className="btn-primary"><Plus className="w-4 h-4" /> Create task</button>
          </div>
        </div>
      </Modal>

      {/* Edit modal */}
      {editingTask && (
        <TaskEditModal task={editingTask} projects={projects} onClose={() => setEditingTask(null)} onSave={async (patch) => { await updateTask(editingTask.id, patch); setEditingTask(null); }} onDelete={async () => { await deleteTask(editingTask.id); setEditingTask(null); }} />
      )}
    </div>
  );
}

function TaskCard({ task, projects, onToggle, onEdit, onDelete }: { task: Task; projects: { id: string; name: string; color: string }[]; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  const project = projects.find((p) => p.id === task.project_id);
  const overdue = task.due_date && isOverdue(task.due_date) && !task.completed && !isToday(task.due_date);
  return (
    <div className="card p-4 card-hover group cursor-pointer" onClick={onEdit}>
      <div className="flex items-start gap-3">
        <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition', task.completed ? 'bg-accent-500 border-accent-500' : 'border-ink-300 dark:border-ink-600 hover:border-primary-500')}>
          {task.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className={cn('text-sm font-medium', task.completed && 'line-through text-ink-400')}>{task.title}</div>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className={cn('badge text-xs', priorityColors[task.priority])}>
              <span className={cn('w-1.5 h-1.5 rounded-full', priorityDot[task.priority])} /> {task.priority}
            </span>
            {task.due_date && (
              <span className={cn('text-xs flex items-center gap-1', overdue ? 'text-error-500 font-medium' : 'text-ink-400')}>
                <Calendar className="w-3 h-3" /> {formatDate(task.due_date)}{task.due_time ? ` · ${formatTime(task.due_time)}` : ''}
              </span>
            )}
            {project && (
              <span className="text-xs flex items-center gap-1 text-ink-500">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: project.color }} /> {project.name}
              </span>
            )}
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-error-500 p-1 transition">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function TaskEditModal({ task, projects, onClose, onSave, onDelete }: { task: Task; projects: { id: string; name: string; color: string }[]; onClose: () => void; onSave: (patch: Partial<Task>) => Promise<void>; onDelete: () => Promise<void> }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [dueDate, setDueDate] = useState(task.due_date ?? '');
  const [dueTime, setDueTime] = useState(task.due_time ?? '');
  const [projectId, setProjectId] = useState(task.project_id ?? '');
  const { subtasks, createSubtask, toggleSubtask, deleteSubtask } = useSubtasks(task.id);
  const [newSubtask, setNewSubtask] = useState('');

  const save = () => {
    onSave({
      title,
      description,
      priority,
      due_date: dueDate || null,
      due_time: dueTime || null,
      project_id: projectId || null,
    });
  };

  return (
    <Modal open onClose={onClose} title="Edit task" size="lg">
      <div className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[80px] resize-y" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details…" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Priority</label>
            <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="label">Due date</label>
            <input type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Due time</label>
            <input type="time" className="input" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Project</label>
          <select className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">None</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* Subtasks */}
        <div>
          <label className="label">Subtasks</label>
          <div className="space-y-1.5">
            {subtasks.map((s) => (
              <div key={s.id} className="flex items-center gap-2 group">
                <button onClick={() => toggleSubtask(s.id, !s.completed)} className={cn('w-4 h-4 rounded border-2 flex items-center justify-center shrink-0', s.completed ? 'bg-accent-500 border-accent-500' : 'border-ink-300 dark:border-ink-600')}>
                  {s.completed && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                </button>
                <span className={cn('text-sm flex-1', s.completed && 'line-through text-ink-400')}>{s.title}</span>
                <button onClick={() => deleteSubtask(s.id)} className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-error-500"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (newSubtask.trim()) { createSubtask(newSubtask); setNewSubtask(''); } }} className="flex gap-2 mt-2">
            <input className="input text-sm" value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} placeholder="Add subtask…" />
            <button type="submit" className="btn-secondary px-3"><Plus className="w-4 h-4" /></button>
          </form>
        </div>

        <div className="flex justify-between pt-2">
          <button onClick={onDelete} className="btn-danger"><Trash2 className="w-4 h-4" /> Delete</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button onClick={save} className="btn-primary">Save changes</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
