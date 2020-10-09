import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InterpreterService {

  notOperator = '¬';
  openBracket = '(';
  closeBracket = ')';
  operatorPriorityList = ['⊼', '∧', '⊽', '∨', '⊻', '→', '←', '↔'];

  // Restricts the amount of loops (to prevent possible endless iterations)
  maxLoop = 1000;

  // Test formula
  // a∧b∨¬c↔(a∨b)∧¬c

  constructor() { }

  public calculate(formula: string): void {
    const newform = this.priorityOperators(formula);
    console.log(newform);
  }

  // Returns a correctly bracketed term to set each priority of each operator
  private priorityOperators(formula: string): string{
    console.log('called');

    // Special case for the not-Operator, Bracket can always placed directly in front of the operator
    for (let i = 0; i < formula.length; i++){
      if (formula.charAt(i) === this.notOperator){
       formula = formula.substring(0, i) + this.openBracket + formula.substring(i);
       // This is needed, to take into account the newly added bracket
       i = i + 1;
       formula = this.closeBracketFormulaFromIndex(formula, i);
      }
    }

    // Case for all other operators
    for (const symbol of this.operatorPriorityList){
      for (let i = 0; i < formula.length; i++){
        if (formula.charAt(i) === symbol){
          formula = this.openBracketFormulaFromIndex(formula, i);
          // This is needed, to take into account the newly added bracket
          i = i + 1;
          formula = this.closeBracketFormulaFromIndex(formula, i);
        }
      }
    }

    return formula;
  }

  // Add an open bracket in front of the left side of the operator
  // For example a∧b --> (a∧b or (a∧b)∧c --> ((a∧b)∧c (for second ∧)
  private openBracketFormulaFromIndex(formula: string, index: number): string{
    // Count current open brackets
    let bracketCount = 0;
    // Not needed, only to make sure loop terminates if there is an endless loop
    let loop = 0;

    do {
      index = index - 1;
      const character = formula.charAt(index);
      if (character === this.openBracket){
        bracketCount = bracketCount + 1;
      } else if (character === this.closeBracket){
        bracketCount = bracketCount - 1;
      }
      // console.log('open: ' + character + ' ' + index + ' ' + bracketCount + ' ' + formula);
      loop = loop + 1;
    } while (bracketCount !== 0 && loop < this.maxLoop);
    return formula.substring(0, index) + this.openBracket + formula.substring(index);
  }

  // Add a close bracket at the end of the right side of the operator
  // For example a∧b --> a∧b) or (a∧b)∧c --> (a∧b)∧c) (for second ∧)
  private closeBracketFormulaFromIndex(formula: string, index: number): string{
    // Count current open brackets
    let bracketCount = 0;
    // Not needed, only to make sure loop terminates if there is an endless loop
    let loop = 0;

    do {
      index = index + 1;
      const character = formula.charAt(index);
      if (character === this.openBracket){
        bracketCount = bracketCount + 1;
      } else if (character === this.closeBracket){
        bracketCount = bracketCount - 1;
      }
      loop = loop + 1;
    } while (bracketCount !== 0 && loop < this.maxLoop);
    return formula.substring(0, index + 1) + this.closeBracket + formula.substring(index + 1);
  }
}
