import React from 'react';
import { LoanRepaymentCalculator, LoanRepaymentCalculatorProps } from './LoanRepaymentCalculator';

export type LoanCalculatorProps = LoanRepaymentCalculatorProps;

/**
 * Loan Calculator Component
 * Allows users to input property price, interest rate, and loan term,
 * then displays monthly repayment estimates along with detailed amortisation insights.
 */
export const LoanCalculator: React.FC<LoanCalculatorProps> = (props) => {
  return <LoanRepaymentCalculator {...props} />;
};

export { LoanRepaymentCalculator };
export default LoanCalculator;
