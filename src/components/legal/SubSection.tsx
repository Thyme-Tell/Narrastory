
import React from "react";

interface SubSectionProps {
  title: string;
  children: React.ReactNode;
}

const SubSection: React.FC<SubSectionProps> = ({ title, children }) => {
  return (
    <>
      <h3 className="text-xl font-semibold mb-2 mt-6">{title}</h3>
      {children}
    </>
  );
};

export default SubSection;
