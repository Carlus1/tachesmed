import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('');
    const [isResetMode, setIsResetMode] = useState(false);
    const [isSignUpMode, setIsSignUpMode] = useState(false);
    const [debugInfo, setDebugInfo] = useState<any>(null);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Debug: Vérifier la configuration Supabase
    useEffect(() => {
        const checkSupabaseConfig = () => {
            const config = {
                url: import.meta.env.VITE_SUPABASE_URL,
                key: import.meta.env.VITE_SUPABASE_ANON_KEY,
                urlExists: !!import.meta.env.VITE_SUPABASE_URL,
                keyExists: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
                urlLength: import.meta.env.VITE_SUPABASE_URL?.length || 0,
                keyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0
            };
            setDebugInfo(config);
            console.log('Configuration Supabase:', config);
        };
        checkSupabaseConfig();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setStatus('');

        if (!email || !password) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        try {
            setLoading(true);

            // Debug: Vérifier la configuration avant la requête
            console.log('Tentative de connexion avec:', {
                email: email.toLowerCase(),
                supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
                hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
                keyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0
            });

            if (isResetMode) {
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
                if (resetError) {
                    console.error('Erreur de réinitialisation:', resetError);
                    throw resetError;
                }
                setStatus('Email de réinitialisation envoyé');
                return;
            }

            if (isSignUpMode) {
                console.log('Tentative d\'inscription...');
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email: email.toLowerCase(),
                    password,
                    options: {
                        data: {
                            full_name: email.split('@')[0]
                        }
                    }
                });

                console.log('Réponse d\'inscription:', { data, error: signUpError });

                if (signUpError) {
                    console.error('Erreur d\'inscription:', signUpError);
                    throw signUpError;
                }

                if (data.user && !data.session) {
                    setStatus('Compte créé ! Vérifiez votre email pour confirmer votre compte.');
                } else {
                    setStatus('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
                    setIsSignUpMode(false);
                }
                return;
            }

            // Tentative de connexion
            console.log('Tentative de connexion...');
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: email.toLowerCase(),
                password
            });

            console.log('Réponse de connexion:', { data, error: signInError });

            if (signInError) {
                console.error('Erreur de connexion:', signInError);

                // Messages d'erreur plus spécifiques
                if (signInError.message.includes('Invalid login credentials')) {
                    throw new Error('Email ou mot de passe incorrect');
                } else if (signInError.message.includes('Email not confirmed')) {
                    throw new Error('Veuillez confirmer votre email avant de vous connecter');
                } else if (signInError.message.includes('Too many requests')) {
                    throw new Error('Trop de tentatives. Veuillez attendre quelques minutes.');
                } else if (signInError.message.includes('Invalid API key')) {
                    throw new Error('Erreur de configuration Supabase. Contactez l\'administrateur.');
                } else {
                    throw signInError;
                }
            }

            if (data.user) {
                console.log('Connexion réussie:', data.user);

                // Forcer le rôle owner si nécessaire
                if (email.toLowerCase() === 'carl.frenee@gmail.com') {
                    try {
                        const { error: rpcError } = await supabase.rpc('force_owner_role', {
                            target_email: email.toLowerCase()
                        });

                        if (rpcError) {
                            console.error('Erreur lors de la définition du rôle owner:', rpcError);
                        }
                    } catch (rpcError) {
                        console.error('Erreur RPC:', rpcError);
                    }
                }
            }

            // La redirection sera gérée par App.tsx
        } catch (error: any) {
            console.error('Erreur d\'authentification complète:', error);
            setError(error.message || 'Une erreur est survenue lors de la connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 to-accent-100">
            <div className="w-full max-w-md px-6">
                <div className="bg-surface rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-primary-700 mb-2">
                            🏥 TachesMed
                        </h1>
                        <p className="text-primary-400">
                            {isResetMode ? 'Réinitialiser le mot de passe' :
                                isSignUpMode ? 'Créer un compte' :
                                    'Connexion à votre compte'}
                        </p>
                    </div>

                    {/* Debug Info (seulement en développement) */}
                    {debugInfo && (
                        <div className="mb-4 p-3 bg-primary-100 rounded text-xs">
                            <details>
                                <summary className="cursor-pointer font-medium">Debug Info</summary>
                                <div className="mt-2 space-y-1">
                                    <div>URL configurée: {debugInfo.urlExists ? '✅' : '❌'}</div>
                                    <div>Clé configurée: {debugInfo.keyExists ? '✅' : '❌'}</div>
                                    <div>URL: {debugInfo.url?.substring(0, 30)}...</div>
                                    <div>Longueur clé: {debugInfo.keyLength}</div>
                                </div>
                            </details>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-primary-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                required
                                autoComplete="email"
                                disabled={loading}
                                placeholder="votre@email.com"
                            />
                        </div>

                        {!isResetMode && (
                            <div>
                                <label className="block text-sm font-medium text-primary-700 mb-2">
                                    Mot de passe
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    required
                                    autoComplete={isSignUpMode ? 'new-password' : 'current-password'}
                                    disabled={loading}
                                    minLength={6}
                                    placeholder="••••••••"
                                />
                                {!isSignUpMode && (
                                    <button
                                        type="button"
                                        onClick={() => setIsResetMode(true)}
                                        className="text-sm text-primary-600 hover:text-primary-800 mt-2 transition-colors"
                                    >
                                        Mot de passe oublié ?
                                    </button>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-error-100 border border-error-200 rounded-lg">
                                <p className="text-sm text-error-700">{error}</p>
                            </div>
                        )}

                        {status && (
                            <div className="p-4 bg-success-100 border border-success-200 rounded-lg">
                                <p className="text-sm text-success-700">{status}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Chargement...
                                </div>
                            ) : (
                                isResetMode ? 'Envoyer le lien' :
                                    isSignUpMode ? 'Créer le compte' :
                                        'Se connecter'
                            )}
                        </button>

                        {!isResetMode && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUpMode(!isSignUpMode);
                                    setError(null);
                                    setStatus('');
                                }}
                                className="w-full border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-medium py-3 px-4 rounded-lg transition-all"
                            >
                                {isSignUpMode ? 'Retour à la connexion' : 'Créer un compte'}
                            </button>
                        )}

                        {isResetMode && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsResetMode(false);
                                    setError(null);
                                    setStatus('');
                                }}
                                className="w-full border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-medium py-3 px-4 rounded-lg transition-all"
                            >
                                Retour à la connexion
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}