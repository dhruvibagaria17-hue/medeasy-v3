import { motion } from 'framer-motion';
import { Heart, Shield, Users, Lightbulb } from 'lucide-react';

const AboutUs = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto py-12 px-4 sm:px-6"
    >
      <div className="text-center mb-16">
        <h1 className="text-3xl sm:text-5xl font-black text-textPrimary mb-6 tracking-tight">About Us</h1>
        <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-8" />
      </div>

      <div className="prose prose-lg max-w-none text-textSecondary space-y-8">
        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-accent1/10">
          <p className="leading-relaxed mb-6 font-medium">
            We started this platform with a simple, honest problem: medicines are confusing and for many, uncomfortable, intimidating, or even unpleasant to take.
          </p>
          <p className="leading-relaxed mb-6">
            Like many others, I have struggled with taking medicines, not just because of taste or texture, but because of the uncertainty around them. What exactly am I putting into my body? Why this medicine and not another? What should I expect?
          </p>
          <p className="leading-relaxed">
            Existing resources often answer these questions, but in language that feels clinical, dense, and inaccessible. This website was built to change that. We simplify medicine information so that it's clear, practical, and actually useful in everyday life. No unnecessary jargon. No overwhelming walls of text. Just straightforward explanations about what a medicine does, when to take it, what to watch out for, and how it might feel.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8">
          <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10">
            <h3 className="text-xl font-bold text-textPrimary mb-4 flex items-center gap-2">
              <Users className="text-primary" /> Our Background
            </h3>
            <p className="text-base leading-relaxed">
              This platform is also shaped by a background in public health and research. With experience in epidemiology, nutrition, and health systems, we understand both the science behind medicines and the importance of communicating that science in a way people can truly understand.
            </p>
          </div>
          <div className="bg-secondary/5 p-8 rounded-[2rem] border border-secondary/10">
            <h3 className="text-xl font-bold text-textPrimary mb-4 flex items-center gap-2">
              <Heart className="text-secondary" /> Our Philosophy
            </h3>
            <p className="text-base leading-relaxed">
              We believe that access to information is not enough, it has to be accessible. Our goal is not to replace doctors or pharmacists, but to empower you to feel more informed, less anxious, and more in control of your health decisions.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-black text-textPrimary mb-8">What We Believe</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Clarity over complexity", desc: "Health information should be easy to understand, not harder.", icon: Lightbulb, color: "bg-amber-100 text-amber-600" },
              { title: "Informed, not overwhelmed", desc: "You deserve to know what you're taking without feeling buried in details.", icon: Shield, color: "bg-blue-100 text-blue-600" },
              { title: "Respect for real experiences", desc: "Discomfort with medicines is valid and deserves attention.", icon: Heart, color: "bg-red-100 text-red-600" },
              { title: "Bridging science and everyday life", desc: "Good health communication sits at the intersection of evidence and empathy.", icon: Users, color: "bg-green-100 text-green-600" }
            ].map((belief, i) => (
              <motion.div key={i} variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-accent1/10 flex gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${belief.color}`}>
                  <belief.icon size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-textPrimary mb-1">{belief.title}</h4>
                  <p className="text-sm leading-relaxed">{belief.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <p className="text-center text-lg italic font-medium py-12 text-textPrimary/60">
          "If you’ve ever hesitated before taking a pill, googled a medicine and felt more confused, or just wished someone would explain things simply, you’re exactly why this exists."
        </p>
      </div>
    </motion.div>
  );
};

export default AboutUs;
