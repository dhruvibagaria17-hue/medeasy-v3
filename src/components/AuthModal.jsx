import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [info, setInfo] = useState('');
  const { validatePassword, signInWithGoogle, signUpWithEmail, signInWithEmail, resetPassword } = useAuth();

  const handleGoogleSignIn = () => {
    setIsLinking(true);
    setError('');
    setInfo('');

    signInWithGoogle()
      .then(() => onClose())
      .catch((e) => {
        setError(e?.message || 'Google sign-in failed. Please try again.');
      })
      .finally(() => setIsLinking(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!isLogin) {
      const passError = validatePassword(formData.password);
      if (passError) {
        setError(passError);
        return;
      }
    }

    try {
      if (isLogin) {
        await signInWithEmail({ email: formData.email, password: formData.password });
      } else {
        await signUpWithEmail({ email: formData.email, password: formData.password, name: formData.name });
      }
      onClose();
    } catch (e) {
      setError(e?.message || 'Authentication failed. Please try again.');
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setInfo('');
    if (!formData.email) {
      setError('Enter your email above, then click “Forgot password?”');
      return;
    }
    try {
      await resetPassword(formData.email);
      setInfo('Password reset email sent. Please check your inbox.');
    } catch (e) {
      setError(e?.message || 'Could not send reset email. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 sm:p-8">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-background transition-colors"
          >
            <X className="w-5 h-5 text-textSecondary" />
          </button>

          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-textPrimary mb-3">
              {isLogin ? 'Welcome Back!' : 'Join Medeasy'}
            </h2>
            <p className="text-textSecondary text-sm leading-relaxed px-4">
              {isLogin ? 'Sign in to access your account.' : 'Create an account to access our enhanced features.'}
            </p>
          </div>

          <div className="flex bg-background p-1 rounded-xl mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${isLogin ? 'bg-white shadow-sm text-primary' : 'text-textSecondary'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${!isLogin ? 'bg-white shadow-sm text-primary' : 'text-textSecondary'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-textPrimary ml-1">Full Name</label>
                <div className="relative">
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border-none focus:ring-2 focus:ring-primary/50 outline-none text-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textPrimary ml-1">Email Address</label>
              <div className="relative">
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border-none focus:ring-2 focus:ring-primary/50 outline-none text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textPrimary ml-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border-none focus:ring-2 focus:ring-primary/50 outline-none pr-10 text-sm"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-[10px] text-textSecondary ml-1">
                  Min 12 chars, 1 capital, 1 symbol
                </p>
              )}
            </div>

            {isLogin && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] font-bold text-primary hover:underline ml-1"
              >
                Forgot password?
              </button>
            )}

            {error && (
              <p className="text-accent2 text-[11px] font-medium ml-1">{error}</p>
            )}
            {info && (
              <p className="text-secondary text-[11px] font-medium ml-1">{info}</p>
            )}

            <button 
              type="submit"
              className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all mt-2"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-accent1/10"></div>
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="px-3 bg-white text-textSecondary font-medium uppercase tracking-wider">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button 
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLinking}
              className="flex items-center justify-center gap-3 py-3 rounded-xl border border-accent1/10 hover:bg-background transition-all font-bold text-sm disabled:opacity-50 shadow-sm"
            >
              {isLinking ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;
