import { motion } from 'framer-motion';
import { Database, ShieldCheck, AlertTriangle, ExternalLink } from 'lucide-react';

const DataSources = () => {
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
        <h1 className="text-3xl sm:text-5xl font-black text-textPrimary mb-6 tracking-tight">Data Sources</h1>
        <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-8" />
      </div>

      <div className="prose prose-lg max-w-none text-textSecondary space-y-8">
        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-accent1/10 mb-8">
          <p className="leading-relaxed mb-6 font-medium">
            Our platform sources its medicines information from the Electronic Medicines Compendium (emc), a trusted and authoritative database of licensed medicines in the United Kingdom.
          </p>
          <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10">
            <h3 className="text-xl font-bold text-textPrimary mb-4 flex items-center gap-2">
              <Database className="text-primary" /> About the Source
            </h3>
            <p className="text-base leading-relaxed">
              The emc is managed by Datapharm Ltd and provides up to date, regulated, and clinically approved information on medicines. All content available on emc is reviewed and authorised by official regulatory bodies such as the Medicines and Healthcare products Regulatory Agency (MHRA) and the European Medicines Agency (EMA).
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2rem] border border-accent1/10 shadow-sm">
            <h3 className="text-xl font-bold text-textPrimary mb-4 flex items-center gap-2">
              <ShieldCheck className="text-secondary" /> Nature of the Data
            </h3>
            <ul className="text-base space-y-3">
              <li className="flex gap-2">
                <span className="text-secondary">•</span>
                <span>Summaries of Product Characteristics (SmPCs): Detailed technical guidance for healthcare professionals.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-secondary">•</span>
                <span>Patient Information Leaflets (PILs): Simplified medicine information for patients.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-secondary">•</span>
                <span>Safety updates and risk minimisation materials.</span>
              </li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-accent1/10 shadow-sm">
            <h3 className="text-xl font-bold text-textPrimary mb-4 flex items-center gap-2">
              <Database className="text-primary" /> Data Reliability
            </h3>
            <p className="text-base leading-relaxed">
              The emc is widely regarded as a reliable and authoritative source for medicines information. Content is regularly updated, typically within days of regulatory approval of any changes to ensure accuracy and relevance.
            </p>
          </div>
        </section>

        <section className="bg-amber-50 p-8 rounded-[2rem] border border-amber-200 mt-12">
          <h3 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-amber-600" /> Important Disclaimer
          </h3>
          <p className="text-amber-800 text-base leading-relaxed font-medium">
            While we rely on high-quality, regulated sources, this platform is intended for informational purposes only and does not replace professional medical advice. Users are encouraged to consult qualified healthcare professionals for clinical decisions.
          </p>
        </section>

        <p className="text-center text-sm py-12 text-textSecondary flex items-center justify-center gap-2">
          Visit the source: <a href="https://www.medicines.org.uk/emc" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline flex items-center gap-1">Electronic Medicines Compendium <ExternalLink size={14} /></a>
        </p>
      </div>
    </motion.div>
  );
};

export default DataSources;
