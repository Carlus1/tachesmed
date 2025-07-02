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
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Tâches à venir</h2>
                <button
                    onClick={onAddTask}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                    Ajouter
                </button>
            </div>
            <div className="divide-y divide-gray-200">
                {tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-medium text-gray-900">{task.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                {getPriorityText(task.priority)}
                            </span>
                        </div>
                        <div className="flex items-center mt-3 text-sm text-gray-500">
                            <span>
                                {format(new Date(task.start_date), 'dd/MM/yyyy')} — {format(new Date(task.start_date), 'HH:mm')}-{format(new Date(task.end_date), 'HH:mm')}
                            </span>
                        </div>
                    </div>
                ))}
                {tasks.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                        <p>Aucune tâche à venir</p>
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Voir toutes les tâches →
                </a>
            </div>
        </div>
    );
}