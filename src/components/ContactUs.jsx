import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, User, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    contactPreference: 'email'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // In a real app, you'd send this to a backend
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '', contactPreference: 'email' });
    }, 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-textPrimary mb-4">Got Questions? Ask us!</h1>
        <p className="text-textSecondary text-lg max-w-2xl mx-auto">
          We appreciate your voice. Our team is eagerly looking forward to hearing your questions, suggestions and more.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="md:col-span-1 space-y-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-[2rem] border border-accent1/20 shadow-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-150" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-xl flex items-center justify-center text-secondary shadow-inner shrink-0">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Mail className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="font-bold text-textPrimary text-base leading-tight">Reach us faster through mail</h3>
              </div>
              <div className="space-y-1 pl-16">
                <p className="text-sm text-textSecondary hover:text-secondary transition-colors cursor-pointer font-medium">support@medeasy.com</p>
                <p className="text-sm text-textSecondary hover:text-secondary transition-colors cursor-pointer font-medium">info@medeasy.com</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-[2rem] border border-accent1/20 shadow-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-150" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center text-primary shadow-inner shrink-0">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <MessageSquare className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="font-bold text-textPrimary text-base leading-tight">Try our chat box for even faster resolution</h3>
              </div>
              <div className="space-y-1 text-sm text-textSecondary pl-16">
                <p className="flex items-center gap-2 font-medium"><span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> Available Mon-Fri</p>
                <p className="opacity-70">9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Form */}
        <div className="md:col-span-2">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form
                key="contact-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-3xl border border-accent1/20 shadow-md space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-textPrimary flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" /> Name
                    </label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-accent1/20 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-textPrimary flex items-center gap-2">
                      <Mail className="w-4 h-4 text-secondary" /> Email
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-accent1/20 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-textPrimary block">
                    How would you like us to reach out to you?
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {['email', 'call', 'SMS'].map((method) => (
                      <label key={method} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="contactPreference"
                          value={method}
                          checked={formData.contactPreference === method}
                          onChange={handleChange}
                          className="w-4 h-4 text-primary focus:ring-primary border-accent1/40"
                        />
                        <span className="text-sm text-textSecondary group-hover:text-textPrimary capitalize transition-colors">
                          {method}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-textPrimary">Subject</label>
                  <input
                    required
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-accent1/20 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-textPrimary">Message</label>
                  <textarea
                    required
                    rows="4"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-accent1/20 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-opacity-80 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-primary/20 active:scale-[0.98]"
                >
                  <span>Send Message</span>
                  <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success-message"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-12 rounded-3xl border border-primary/20 shadow-md text-center flex flex-col items-center justify-center h-full min-h-[400px]"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold text-textPrimary mb-2">Message Sent!</h2>
                <p className="text-textSecondary">
                  Thank you for reaching out. We've received your query and will get back to you shortly.
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="mt-8 text-primary font-semibold hover:underline"
                >
                  Send another message
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
