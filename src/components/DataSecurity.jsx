import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Database, KeyRound, Trash2 } from 'lucide-react';

const DataSecurity = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const cards = [
    {
      title: 'Authentication',
      icon: KeyRound,
      color: 'bg-blue-50 border-blue-100 text-blue-800',
      points: [
        'Sign in uses Google OAuth or email + password.',
        'Passwords are never stored by Medeasy in plaintext.',
        'Passwords are handled by a dedicated authentication provider and stored as salted, hashed credentials.'
      ]
    },
    {
      title: 'Data Storage',
      icon: Database,
      color: 'bg-green-50 border-green-100 text-green-800',
      points: [
        'User data (e.g., saved medicines/folders) is stored per-account.',
        'Only the minimum data needed for the app to work is stored.',
        'Data access is restricted using server-side security rules.'
      ]
    },
    {
      title: 'Encryption',
      icon: Lock,
      color: 'bg-amber-50 border-amber-100 text-amber-800',
      points: [
        'Data is encrypted in transit (HTTPS).',
        'Modern platforms typically encrypt stored data at rest on the server side.',
        'Sensitive operations require an authenticated session.'
      ]
    },
    {
      title: 'Privacy & Control',
      icon: Trash2,
      color: 'bg-purple-50 border-purple-100 text-purple-800',
      points: [
        'You can sign out at any time.',
        'Your saved medicines remain tied to your account.',
        'You can request deletion of your stored account data.'
      ]
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto py-12 px-4 sm:px-6"
    >
      <div className="text-center mb-16">
        <h1 className="text-3xl sm:text-5xl font-black text-textPrimary mb-6 tracking-tight">Data Security</h1>
        <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-8" />
        <p className="text-textSecondary text-base max-w-2xl mx-auto leading-relaxed">
          Medeasy is designed to be safe by default. This page explains how sign-in data and user activity (like saved
          medicines) is protected.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <motion.div
            key={card.title}
            variants={itemVariants}
            className={`p-8 rounded-[2rem] border shadow-sm ${card.color}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center border border-white/60">
                <card.icon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black tracking-tight">{card.title}</h2>
            </div>

            <div className="space-y-3">
              {card.points.map((p) => (
                <div key={p} className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-current mt-2 shrink-0 opacity-40" />
                  <p className="text-[13px] font-medium leading-relaxed opacity-90">{p}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 bg-white p-8 rounded-[2rem] border border-accent1/10 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-black text-textPrimary">Important Disclaimer</h3>
        </div>
        <p className="text-textSecondary text-[13px] leading-relaxed font-medium">
          This website is for informative purposes only and does not replace professional medical advice. Always consult
          a qualified healthcare professional for diagnosis and treatment decisions.
        </p>
      </div>
    </motion.div>
  );
};

export default DataSecurity;
