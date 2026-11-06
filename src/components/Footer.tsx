import React from 'react';

interface FooterProps {
  onNavigate?: (view: string, tab?: 'sale' | 'rent') => void;
  onOpenAppraisal?: () => void;
}

/**
 * Footer component - removed per user request (CSS selector: footer > div:nth-of-type(1))
 */
export const Footer: React.FC<FooterProps> = () => {
  return null;
};
