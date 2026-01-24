import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { supabase } from '../supabase';
import RoleBadge from './RoleBadge';
import { useTranslation } from '../i18n/LanguageContext';

interface ModernSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function ModernSidebar({ isOpen = false, onClose }: ModernSidebarProps) {
    const { t } = useTranslation();
    const baseClass = 'flex items-center px-3 py-2 rounded-lg transition-colors';
    const activeClass = 'text-primary-700 bg-primary-100';
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const loadRole = async () => {
            try {
                const { data: authData } = await supabase.auth.getUser();
                const userId = authData?.user?.id;
                if (!userId) return;
                const { data, error } = await supabase.from('users').select('role').eq('id', userId).maybeSingle();
                if (error) throw error;
                if (mounted) setRole(data?.role || 'user');
            } catch (_e) {
                if (mounted) setRole('user');
            }
        };
        loadRole();
        return () => { mounted = false; };
    }, []);

    return (
        <aside className={`bg-surface dark:bg-surface-dark border-r border-border dark:border-surface p-4 transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0 fixed z-40 left-0 top-16 h-[calc(100vh-64px)] w-64' : 'hidden md:block w-80 relative h-[calc(100vh-64px)]'}`}>
            <div className="flex flex-col h-full">
                <nav className="space-y-1">
                    <NavLink to="/" className={({ isActive }) => `${baseClass} ${isActive ? activeClass : 'text-primary-700 hover:bg-surface'}`}>
                        {t.nav.dashboard}
                    </NavLink>
                    <NavLink to="/calendar" className={({ isActive }) => `${baseClass} ${isActive ? activeClass : 'text-primary-700 hover:bg-surface'}`}>
                        {t.nav.calendar}
                    </NavLink>
                    <NavLink to="/tasks" className={({ isActive }) => `${baseClass} ${isActive ? activeClass : 'text-primary-700 hover:bg-surface'}`}>
                        {t.nav.tasks}
                    </NavLink>
                    <NavLink to="/groups" className={({ isActive }) => `${baseClass} ${isActive ? activeClass : 'text-primary-700 hover:bg-surface'}`}>
                        {t.nav.groups}
                    </NavLink>
                    <NavLink to="/reports" className={({ isActive }) => `${baseClass} ${isActive ? activeClass : 'text-primary-700 hover:bg-surface'}`}>
                        {t.nav.reports}
                    </NavLink>
                </nav>

                {role && (
                    <div className="mt-4 px-3">
                        <RoleBadge role={role} />
                    </div>
                )}

                <div className="mt-auto">
                    <NavLink to="/settings" className={({ isActive }) => `${baseClass} ${isActive ? activeClass : 'text-primary-700 hover:bg-surface'}`}>
                        <Settings className="w-5 h-5" />
                        <span>{t.nav.settings}</span>
                    </NavLink>
                    <button onClick={() => onClose?.()} className="mt-2 w-full text-left px-3 py-2 text-primary-700 dark:text-surface rounded-lg hover:bg-surface dark:hover:bg-surface transition-colors">
                        {t.common.close}
                    </button>
                </div>
            </div>
        </aside>
    );
}