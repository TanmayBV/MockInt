import React from 'react';
import { motion } from 'framer-motion';

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ 
        duration: 0.3, 
        ease: [0.4, 0.0, 0.2, 1],
        opacity: { duration: 0.25 }
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;
