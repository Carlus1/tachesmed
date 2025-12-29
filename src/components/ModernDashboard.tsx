import { useState, useEffect } from 'react';
import type { User } from '@supabase/gotrue-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import DashboardLayout from './DashboardLayout';

interface ModernDashboardProps {
    user: User;
}

export default function ModernDashboard({ user }: ModernDashboardProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            navigate('/login');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return <DashboardLayout user={user} onSignOut={handleSignOut} />;
}