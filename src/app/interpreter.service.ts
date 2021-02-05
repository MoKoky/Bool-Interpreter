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
import {Subject} from 'rxjs';

export interface TreeFormula{
  tree: Operator;
  map: Map<string, Variable>;
}

export interface EvaluatedFormula{
  possibilityList: any[];
  keys: string[];
  formulaString: string;

}

@Injectable({
  providedIn: 'root'
})
export class InterpreterService {

  private formulaChangedEmitter = new Subject<void>();

  private notOperator = '¬';
  private openBracket = '(';
  private closeBracket = ')';
  private operatorPriorityList = ['⊼', '∧', '⊽', '∨', '⊻', '→', '←', '↔'];
  private variableRegex = '[A-Za-z]';

  // Restricts the amount of loops (to prevent possible endless iterations)
  private maxLoop = 1000;

  private formulaTree: TreeFormula;
  private formulaString = '';
  private possibilityList;
  private keys;

  private dnf;
  private knf;

  // Test formula
  // a∧b∨¬c↔(a∨b)∧¬c

  constructor() { }

  public getFormulaChangedEmitter(): Subject<void>{
    return this.formulaChangedEmitter;
  }

  public getDnf(): string{
    return this.dnf;
  }

  public getKnf(): string{
    return this.knf;
  }

  public calculate(formula: string): any {
    this.formulaString = formula;
    formula =  this.priorityOperators(formula);
    console.log('Applied priority: ' + formula);
    formula = this.removeDoubleBrackets(formula);
    console.log('Removed double brackets: ' + formula);
    const formulaTree = this.buildTree(formula);
    console.log(formulaTree);
    this.formulaTree = formulaTree;
    this.evaluateFormula();

    this.calculateNormalforms();

    this.formulaChangedEmitter.next();
  }

  public checkIfFormulaIsValid(formula: string): boolean{

    // check if brackets are correct
    let openClosedCount = 0;
    for (let i = 0; i < formula.length; i++){
      const char = formula.charAt(i);
      if (char === this.openBracket){
        openClosedCount = openClosedCount + 1;
      } else if (char === this.closeBracket){
        openClosedCount = openClosedCount - 1;
      }
      if (openClosedCount < 0){
        return false;
      }
    }
    if (openClosedCount !== 0) {
      return false;
    }

    // check if all other symbols are in correct order
    let lastChar = -1;

    for (let i = 0; i < formula.length; i++){
      const char = formula.charAt(i);
      if (char === this.openBracket){

        if (lastChar === LastChar.Variable || lastChar === LastChar.ClosedBracket){
          return false;
        }
        lastChar = LastChar.OpenBracket;

      } else if (char === this.closeBracket){

        if (lastChar === LastChar.Operator || lastChar === LastChar.OpenBracket){
          return false;
        }
        lastChar = LastChar.ClosedBracket;

      } else if (this.operatorPriorityList.indexOf(char) > -1){

        if (lastChar === LastChar.Operator){
          return false;
        }
        lastChar = LastChar.Operator;

      } else if (char.match(this.variableRegex)){

        if (lastChar === LastChar.Variable){
          return false;
        }
        lastChar = LastChar.Variable;

      } else {
        return false;
      }
    }

    return true;
  }

  public getEvaluatedFormula(): EvaluatedFormula{
    const keysCopy = [...this.keys];
    const possibilityListCopy = [...this.possibilityList];
    return {possibilityList: possibilityListCopy, keys: keysCopy, formulaString: this.formulaString};
  }

  private evaluateFormula(): any{
    const map = this.formulaTree.map;
    const tree = this.formulaTree.tree;

    // get number of possibilities that are possible with the amount of variables
    const possibilities = Math.pow(2, map.size);
    // Get list of all variables
    const keys = Array.from(map.keys());
    // Save entries ofr the table here
    const possibilityList = [];

    // check if the same key as the formula is already in the table, in that case add brackets around formula to
    // prevent having the same key twice (causes error otherwise)
    let formulaString = this.formulaString;
    if (keys.indexOf((formulaString)) > -1){
      formulaString = '(' + formulaString + ')';
      this.formulaString = formulaString;
    }

    // Calculate each possibility
    for (let i = 0; i < possibilities; i++){
      // Save value to take away amounts for each bit
      let value = i;
      const entry = {};
      // Go through each variable
      for (let j = keys.length - 1; j >= 0; j--){
        // Get value at position of variable and subtract it if it fits in the value
        // By doing this we can determine if the variable is 0 or one in this case
        const power = Math.pow(2, j);
        if (value >= power){
          value = value - power;
          entry[keys[j]] = '1';
          // Set value in variable map to influence tee
          map.get(keys[j]).setValue(true);
        } else {
          entry[keys[j]] = '0';
          map.get(keys[j]).setValue(false);
        }
      }
      // Evaluate formula tree after all variables have been set for the current case
      // and save outcome for the formula
      if (tree.evaluate()){
        entry[formulaString] = '1';
      } else {
        entry[formulaString] = '0';
      }
      // add the current case to the list of all cases
      possibilityList.push(entry);
    }

    this.possibilityList = possibilityList;
    this.keys = keys;
  }




  private buildTree(formula: string): TreeFormula {
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


  private calculateNormalforms(): any{
    const minMaxTerms = this.calculateMinMaxTerm();

    const minTerm = minMaxTerms.minTerms;
    const maxTerm = minMaxTerms.maxTerms;

    let dnf = '';
    let knf = '';

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < minTerm.length; i++){
      dnf += minTerm[i] + '∨';
    }

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < maxTerm.length; i++){
      knf += maxTerm[i] + '∧';
    }

    dnf = dnf.substr(0, dnf.length - 1);
    knf = knf.substr(0, knf.length - 1);

    this.knf = knf;
    this.dnf = dnf;
  }

  private calculateMinMaxTerm(): {minTerms: any[], maxTerms: any[] }{

    const minTerms = [];
    const maxTerms = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.possibilityList.length; i++){
      const entry = this.possibilityList[i];
      let term = '(';
      if (entry[this.formulaString] === '1'){
        // Minterm
        // tslint:disable-next-line:prefer-for-of
        for (let j = 0; j < this.keys.length; j++){
          if (entry[this.keys[j]] === '0'){
            term += '¬';
          }
          term += this.keys[j] + '∧';
        }

        term = term.substr(0, term.length - 1);
        term += ')';
        minTerms.push(term);

      } else {
        // Maxterm
        // tslint:disable-next-line:prefer-for-of
        for (let j = 0; j < this.keys.length; j++){
          if (entry[this.keys[j]] === '1'){
            term += '¬';
          }
          term += this.keys[j] + '∨';
        }

        term = term.substr(0, term.length - 1);
        term += ')';
        maxTerms.push(term);

      }
    }
    return {minTerms, maxTerms};
  }

}

enum LastChar{
  OpenBracket,
  ClosedBracket,
  Variable,
  Operator
}
