import {
  ANDOperator, EQUIVALENCEOperator,
  IMPLICATION1Operator, IMPLICATION2Operator,
  NANDOperator,
  NOROperator,
  NOTOperator,
  Operator,
  OROperator,
  Variable,
  XOROperator
} from './OperatorClasses';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InterpreterService {

  notOperator = '¬';
  openBracket = '(';
  closeBracket = ')';
  operatorPriorityList = ['⊼', '∧', '⊽', '∨', '⊻', '→', '←', '↔'];
  variableRegex = '[A-Za-z]';

  // Restricts the amount of loops (to prevent possible endless iterations)
  maxLoop = 1000;

  // Test formula
  // a∧b∨¬c↔(a∨b)∧¬c

  constructor() { }

  public calculate(formula: string): any {
     formula =  this.priorityOperators(formula);
     console.log('Applied priority: ' + formula);
     formula = this.removeDoubleBrackets(formula);
     console.log('Removed double brackets: ' + formula);
     const formulaTree = this.buildTree(formula);
     console.log(formulaTree);
     return formulaTree;
  }

  private buildTree(formula: string): any {
    const variableMap = this.collectVariables(formula);
    return {
      tree: this.buildTreeRecursive(formula, variableMap),
      map: variableMap
    };
  }

  private buildTreeRecursive(formula: string, variableMap: Map<string, Variable>): Operator{

    // check if the formula has the form (a) and remove the brackets
    if (formula.length === 3 && formula.charAt(0) === this.openBracket){
      formula = formula.charAt(1);
    }

    // check if the formula is only a variable and return it (abortion of recursion)
    if (formula.length === 1){
      return variableMap.get(formula);
    }

    let bracketCount = 0;
    // start at index 1 because each formula has brackets around it
    let index = 1;

    // iterate till the first formula block is closed
    do {
      const char = formula.charAt(index);
      if (char === this.openBracket){
        bracketCount = bracketCount + 1;
      } else if (char === this.closeBracket){
        bracketCount = bracketCount - 1;
      }
      index = index + 1;
    } while (bracketCount !== 0 && index < formula.length);

    const currentOperator = formula.charAt(index);
    if (currentOperator.match(this.variableRegex) || currentOperator === this.openBracket){
      // if the operator is not only call the formula behind it recursively
      return new NOTOperator(this.buildTreeRecursive(formula.substring(2, formula.length - 1), variableMap));
    } else {
      // if the operator is not the not Operator get the correct class and call the recursion on the right and left side of the operator
      const operatorLeft = this.buildTreeRecursive(formula.substring(1, index), variableMap);
      const operatorRight = this.buildTreeRecursive(formula.substring(index + 1, formula.length - 1), variableMap);

      let newOperator: Operator;

      switch (currentOperator){
        case this.operatorPriorityList[0]: newOperator = new NANDOperator(operatorLeft, operatorRight); break;
        case this.operatorPriorityList[1]: newOperator = new ANDOperator(operatorLeft, operatorRight); break;
        case this.operatorPriorityList[2]: newOperator = new NOROperator(operatorLeft, operatorRight); break;
        case this.operatorPriorityList[3]: newOperator = new OROperator(operatorLeft, operatorRight); break;
        case this.operatorPriorityList[4]: newOperator = new XOROperator(operatorLeft, operatorRight); break;
        case this.operatorPriorityList[5]: newOperator = new IMPLICATION1Operator(operatorLeft, operatorRight); break;
        case this.operatorPriorityList[6]: newOperator = new IMPLICATION2Operator(operatorLeft, operatorRight); break;
        case this.operatorPriorityList[7]: newOperator = new EQUIVALENCEOperator(operatorLeft, operatorRight); break;
      }

      return newOperator;

    }

  }

  // Get all variables that are in the formula and create a Map containing all off them
  private collectVariables(formula: string): Map<string, Variable> {
    const variableMap = new Map();
    for (let i = 0; i < formula.length; i++){
      const char = formula.charAt(i);
      if (char.match(this.variableRegex)){
        if (!variableMap.has(char)){
          variableMap.set(char, new Variable());
        }
      }
    }

    return variableMap;
  }

  // Returns a correctly bracketed term to set each priority of each operator
  private priorityOperators(formula: string): string{

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

  // removes all double brackets
  // For example ((a)) --> (a)
  private removeDoubleBrackets(formula: string): string {
    // Iterate through complete string
    for (let i = 0; i < formula.length; i++){
      // when you find two open braces after another check if they are double occurrence (could be ((a∧b)∨(¬c)) which is valid)
      if (formula.charAt(i) === this.openBracket && formula.charAt(i + 1) === this.openBracket){
        let bracketCount = 0;
        let loop = 0;
        // start at last bracket because, do while adds one in the beginning and we want to start after the double brackets
        let index = i + 1;

        // Iterate through potential sub Brackets
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

        // Walk over operator and variables
        while (true){
          if (formula.charAt(index + 1) === this.openBracket){
            break;
          } else if (formula.charAt(index + 1) === this.closeBracket){
            break;
          }
          index = index + 1;
        }

        // If another bracket expression comes after the operator walk over it again
        if (formula.charAt(index + 1) === this.openBracket){

          bracketCount = 0;
          loop = 0;

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
        }

        // Remove the two unnecessary brackets and reduce i, to account for the missing brace in front
        if (formula.charAt(index + 1) === this.closeBracket && formula.charAt(index + 2) === this.closeBracket){
          formula = formula.substring(0, i) + formula.substring(i + 1, index + 1) + formula.substring(index + 2);
          i = i - 1;
        }
      }
    }

    return formula;
  }
}
