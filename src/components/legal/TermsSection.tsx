
import React from "react";

interface TermsSectionProps {
  title: string;
  children: React.ReactNode;
}

const TermsSection: React.FC<TermsSectionProps> = ({ title, children }) => {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      {children}
    </section>
  );
};

export default TermsSection;
