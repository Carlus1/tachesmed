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

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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

      if (isResetMode) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
        if (resetError) throw resetError;
        setStatus('Email de réinitialisation envoyé');
        return;
      }

      if (isSignUpMode) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.toLowerCase(),
          password,
          options: {
            data: {
              full_name: email.split('@')[0]
            }
          }
        });

        if (signUpError) throw signUpError;
        setStatus('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        setIsSignUpMode(false);
        return;
      }

      // Tentative de connexion
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password
      });

      if (signInError) throw signInError;

      // Attendre que le profil utilisateur soit créé
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Forcer le rôle owner si nécessaire
      if (email.toLowerCase() === 'carl.frenee@gmail.com') {
        const { error: rpcError } = await supabase.rpc('force_owner_role', {
          target_email: email.toLowerCase()
        });
        
        if (rpcError) {
          console.error('Erreur lors de la définition du rôle owner:', rpcError);
        }
      }

      // La redirection sera gérée par App.tsx
    } catch (error: any) {
      console.error('Erreur d\'authentification:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md px-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🏥 TachesMed
            </h1>
            <p className="text-gray-600">
              {isResetMode ? 'Réinitialiser le mot de passe' : 
               isSignUpMode ? 'Créer un compte' : 
               'Connexion à votre compte'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                autoComplete="email"
                disabled={loading}
                placeholder="votre@email.com"
              />
            </div>

            {!isResetMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    className="text-sm text-blue-600 hover:text-blue-800 mt-2 transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {status && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{status}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium py-3 px-4 rounded-lg transition-all"
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
                className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium py-3 px-4 rounded-lg transition-all"
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