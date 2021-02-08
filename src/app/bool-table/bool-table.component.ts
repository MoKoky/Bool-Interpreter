import { Component } from '@angular/core';
import {InterpreterService} from '../interpreter.service';
import {AbstractControl, FormControl, ValidatorFn, Validators} from '@angular/forms';

@Component({
  selector: 'app-bool-table',
  templateUrl: './bool-table.component.html',
  styleUrls: ['./bool-table.component.css']
})
export class BoolTableComponent {

  formControl = new FormControl('', [
    Validators.required,
    this.convertOperators(),
    this.forbiddenNameValidator(),
  ]);

  displayedColumns: string[] = [];
  displayedColumnsAll: string[] = [];
  dataSource = [];
  formulaString = '';

  constructor(private interpreterService: InterpreterService) {
  }

  // check if the input formula is valid
  private forbiddenNameValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const correct = this.interpreterService.checkIfFormulaIsValid(control.value);
      return !correct ? {forbiddenName: {value: control.value}} : null;
    };
  }

  private convertOperators(): ValidatorFn {
    return (c: AbstractControl): {[key: string]: any} | null => {
      if (c && c.value) {

        let newValue = c.value.replace(/nand/gi, '⊼');
        newValue = newValue.replace(/and/gi, '∧');
        newValue = newValue.replace(/nor/gi, '⊽');
        newValue = newValue.replace(/xor/gi, '⊻');
        newValue = newValue.replace(/or/gi, '∨');
        newValue = newValue.replace(/impr/gi, '→');
        newValue = newValue.replace(/impl/gi, '←');
        newValue = newValue.replace(/equ/gi, '↔');
        newValue = newValue.replace(/not/gi, '¬');

        // This check is needed. Otherwise the validator will update every frame to remove whitespaces!!!
        if (newValue !== c.value){
          c.setValue(newValue, {emitEvent: false});
        }
      }
      return null;
    };
  }

  // Calculate formula and display table
  calculate(): any {

    if (this.formControl.invalid){
      return;
    }

    // Get Formula tree
    this.interpreterService.calculate(this.formControl.value);
    const evaluatedFormula = this.interpreterService.getEvaluatedFormula();
    this.dataSource = evaluatedFormula.possibilityList;
    this.formulaString = evaluatedFormula.formulaString;
    // evaluatedFormula.keys.push(evaluatedFormula.formulaString);
    this.displayedColumns = evaluatedFormula.keys;
    this.displayedColumnsAll = [...evaluatedFormula.keys];
    this.displayedColumnsAll.unshift(this.formulaString);
    this.displayedColumnsAll.push('index');

    console.log(this.dataSource);
    console.log(this.formulaString);
    console.log(this.displayedColumns);

  }

  /*
  Add selected symbol to the input field (behind the last character)
   */
  updateInput(symbol): void {
    let currentInput = this.formControl.value;
    currentInput = currentInput + symbol;
    this.formControl.setValue(currentInput);
  }

  // Return Error Messages for the formula input field
  public getErrorMessage(): string {
    if (this.formControl.hasError('required')){
      return 'Please enter a formula';
    } else {
      return 'Enter a correct formula';
    }
  }

}




