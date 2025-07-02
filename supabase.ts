import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Configuration Supabase:', {
    url: supabaseUrl ? 'Configurée' : 'Manquante',
    key: supabaseKey ? 'Configurée' : 'Manquante',
    urlValue: supabaseUrl,
    keyLength: supabaseKey?.length || 0
});

if (!supabaseUrl || !supabaseKey) {
    console.error('Variables d\'environnement Supabase manquantes:', {
        VITE_SUPABASE_URL: supabaseUrl,
        VITE_SUPABASE_ANON_KEY: supabaseKey ? '[MASQUÉE]' : 'undefined'
    });
    throw new Error('Variables d\'environnement Supabase manquantes');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: window.localStorage
    },
    db: {
        schema: 'public'
    },
    global: {
        headers: { 'x-application-name': 'tachesmed' }
    }
});

// Test de connexion
supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
        console.error('Erreur lors du test de connexion Supabase:', error);
    } else {
        console.log('Test de connexion Supabase réussi:', data.session ? 'Session active' : 'Pas de session');
    }
});