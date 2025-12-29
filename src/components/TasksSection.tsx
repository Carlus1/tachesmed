import { format } from 'date-fns';

interface Task {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    start_date: string;
    end_date: string;
    group?: {
        name: string;
    };
}

interface TasksSectionProps {
    tasks: Task[];
    onAddTask: () => void;
}

export default function TasksSection({ tasks, onAddTask }: TasksSectionProps) {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-error-100 text-error-800 border-error-200';
            case 'medium': return 'bg-warning-100 text-warning-800 border-warning-200';
            case 'low': return 'bg-success-100 text-success-800 border-success-200';
            default: return 'bg-primary-100 text-primary-700 border-border';
        }
    };

    const getPriorityText = (priority: string) => {
        switch (priority) {
            case 'high': return 'Haute';
            case 'medium': return 'Moyenne';
            case 'low': return 'Basse';
            default: return priority;
        }
    };

    return (
        <div className="bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-primary-700">Tâches à venir</h2>
                <button
                    onClick={onAddTask}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                >
                    Ajouter
                </button>
            </div>
            <div className="divide-y divide-border">
                {tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="p-4 hover:bg-surface transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-medium text-primary-700">{task.title}</h3>
                                <p className="text-sm text-primary-400 mt-1">{task.description}</p>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                {getPriorityText(task.priority)}
                            </span>
                        </div>
                        <div className="flex items-center mt-3 text-sm text-primary-400">
                            <span>
                                {format(new Date(task.start_date), 'dd/MM/yyyy')} — {format(new Date(task.start_date), 'HH:mm')}-{format(new Date(task.end_date), 'HH:mm')}
                            </span>
                        </div>
                    </div>
                ))}
                {tasks.length === 0 && (
                    <div className="p-6 text-center text-primary-400">
                        <p>Aucune tâche à venir</p>
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-border bg-background">
                <a href="#" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Voir toutes les tâches →
                </a>
            </div>
        </div>
    );
}