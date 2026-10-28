import React from 'react';
import { LoanRepaymentCalculator, LoanRepaymentCalculatorProps } from './LoanRepaymentCalculator';

export type MortgageCalculatorProps = LoanRepaymentCalculatorProps;

export const MortgageCalculator: React.FC<MortgageCalculatorProps> = (props) => {
  return <LoanRepaymentCalculator {...props} />;
};

export { LoanRepaymentCalculator };
