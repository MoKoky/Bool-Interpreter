import { Component } from '@angular/core';
import {InterpreterService} from '../interpreter.service';
import {AbstractControl, FormControl, ValidatorFn, Validators} from '@angular/forms';

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}

@Component({
  selector: 'app-bool-table',
  templateUrl: './bool-table.component.html',
  styleUrls: ['./bool-table.component.css']
})
export class BoolTableComponent {

  formControl = new FormControl('', [
    Validators.required,
    this.forbiddenNameValidator(),
    this.removeSpaces()
  ]);

  displayedColumns: string[] = [];
  displayedColumnsAll: string[] = [];
  dataSource = [];
  tiles: Tile[] = [];
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

  // Remove spaces from the input
  private removeSpaces(): ValidatorFn {
    return (c: AbstractControl): {[key: string]: any} | null => {
      if (c && c.value) {
        const removedSpaces = c.value.split(' ').join('');
        // This check is needed. Otherwise the validator will update every frame to remove whitespaces!!!
        if (removedSpaces !== c.value){
          c.setValue(removedSpaces, {emitEvent: false});
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


  /*printKV(): void {
    //get formula tree
    const possibilityList = this.calculate();
    let numFields = possibilityList.length;
    if (numFields == 4) {

      for (let i = 0; i < numFields; i++) {
        let color;
        //set color for current tile
        if(possibilityList[i][this.formControl.value] == 1) {
          //green
          color = '#4CAF50';
        }
        else {
          //red
          color = '#FF5252';
        }

        let fieldName = '';
        //generate name for current tile
        for (let j = 0; j < Math.sqrt(numFields); j ++) {
          if (possibilityList[i][this.displayedColumns[j]] == 1) {
            fieldName = fieldName + this.displayedColumns[j];
          }
          else {
            fieldName = fieldName + '¬' + this.displayedColumns[j];
          }
        }
        //create tiles
        if (i < 2) {
          this.tiles[i] = {text: i.toString() + "    " + fieldName + "    ->   " +
          possibilityList[i][this.formControl.value], cols: 1, rows: 1, color: color};
        }
        else {
          this.tiles[i] = {text: i.toString() + "    " + fieldName + "    ->   " +
          possibilityList[i][this.formControl.value], cols: 1, rows: 1, color: color};
        }

      }
    }


  }*/

  // Return Error Messages for the formula input field
  public getErrorMessage(): string {
    if (this.formControl.hasError('requried')){
      return 'Please enter a formula';
    } else {
      return 'Enter a correct formula';
    }
  }

}




