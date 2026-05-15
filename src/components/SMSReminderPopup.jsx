import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  X, 
  MessageCircle, 
  Smartphone,
  Check,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const SMSReminderPopup = ({ isOpen, onClose, drugName }) => {
  const [step, setStep] = useState(1);
  const [time, setTime] = useState('09:00');
  const [frequency, setFrequency] = useState('Daily');
  const [customMessage, setCustomMessage] = useState(`Hi! It's time for your ${drugName}. Stay healthy!`);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
      setStep(1);
      setIsSuccess(false);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-primary/30 backdrop-blur-xl"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, rotate: -2 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.8, opacity: 0, rotate: 2 }}
        className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden border-4 border-white"
      >
        {/* Vibrant Header Decoration */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-br from-secondary via-primary to-accent2 opacity-20 blur-2xl -z-10" />
        <div className="absolute top-10 right-10 w-32 h-32 bg-accent2/20 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl -z-10" />

        <div className="p-10">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2 rounded-full hover:bg-background transition-colors"
          >
            <X className="w-6 h-6 text-textSecondary" />
          </button>

          {!isSuccess ? (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-accent2 to-accent2/80 rounded-2xl flex items-center justify-center shadow-lg shadow-accent2/30 rotate-3">
                  <Bell className="w-8 h-8 text-white animate-bounce" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-textPrimary tracking-tight">Stay on track!</h2>
                  <p className="text-textSecondary font-bold flex items-center gap-2">
                    Set a reminder for <span className="text-accent2 capitalize">{drugName}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-accent2 w-full' : 'bg-background w-1/4'}`} />
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <label className="text-lg font-bold text-textPrimary flex items-center gap-2">
                          <Clock className="w-5 h-5 text-secondary" /> When should we notify you?
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-background border-2 border-transparent focus:border-secondary focus:bg-white text-xl font-bold transition-all outline-none"
                          />
                          <div className="w-full px-6 py-4 rounded-2xl bg-secondary/10 flex items-center justify-center gap-2 text-secondary font-black text-xl border-2 border-secondary/20">
                            <Sparkles className="w-5 h-5" />
                            Good choice!
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full bg-textPrimary text-white py-5 rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        Next step <ChevronRight className="w-6 h-6" />
                      </button>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <label className="text-lg font-bold text-textPrimary flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-primary" /> How often?
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {['Daily', 'Every 12h', 'Every 8h', 'Weekly'].map((freq) => (
                            <button
                              key={freq}
                              type="button"
                              onClick={() => setFrequency(freq)}
                              className={`px-4 py-4 rounded-2xl font-black text-sm transition-all border-2 ${frequency === freq ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-background text-textSecondary border-transparent hover:bg-accent1/10'}`}
                            >
                              {freq}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="px-8 py-5 rounded-2xl font-black text-xl text-textSecondary bg-background hover:bg-accent1/20 transition-all"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="flex-1 bg-textPrimary text-white py-5 rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                          Last step <ChevronRight className="w-6 h-6" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <label className="text-lg font-bold text-textPrimary flex items-center gap-2">
                          <MessageCircle className="w-5 h-5 text-accent2" /> Your custom SMS message
                        </label>
                        <div className="relative group">
                          <textarea
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            rows="4"
                            className="w-full px-6 py-5 rounded-[2rem] bg-background border-2 border-transparent focus:border-accent2 focus:bg-white font-bold transition-all outline-none resize-none"
                          />
                          <div className="absolute top-4 right-4 text-accent2 opacity-40">
                            <Smartphone className="w-10 h-10" />
                          </div>
                        </div>
                        <p className="text-xs text-textSecondary italic font-medium px-4">This message will be sent to your registered number at the scheduled time.</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="px-8 py-5 rounded-2xl font-black text-xl text-textSecondary bg-background hover:bg-accent1/20 transition-all"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-accent2 text-white py-5 rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-accent2/30 flex items-center justify-center gap-2"
                        >
                          Activate Reminder <Check className="w-6 h-6" strokeWidth={3} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-32 h-32 bg-secondary rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-secondary/40 relative">
                <CheckCircle2 className="w-20 h-20 text-white" strokeWidth={3} />
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-secondary rounded-full"
                />
              </div>
              <h2 className="text-4xl font-black text-textPrimary mb-4">You're all set!</h2>
              <p className="text-xl text-textSecondary font-bold mb-2">SMS Reminder activated for {drugName}.</p>
              <p className="text-sm text-textSecondary font-medium">We'll send you a message at {time} {frequency.toLowerCase()}.</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SMSReminderPopup;
