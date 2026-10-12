import React from 'react';

interface RoleDashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export const RoleDashboardShell: React.FC<RoleDashboardShellProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-4 max-w-7xl mx-auto pb-12 animate-fade-in ${className}`}>
      {children}
    </div>
  );
};
