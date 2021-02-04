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
  dataSource = [];
  tiles: Tile[] = [];

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
    const formula = this.interpreterService.calculate(this.formControl.value);
    const map = formula.map;
    const tree = formula.tree;

    // get number of possibilities that are possible with the amount of variables
    const possibilities = Math.pow(2, map.size);
    // Get list of all variables
    const keys = Array.from(map.keys());
    // Save entries ofr the table here
    const possibilityList = [];

    // check if the same key as the formula is already in the table, in that case add brackets around formula to
    // prevent having the same key twice (causes error otherwise)
    let formulaString = this.formControl.value;
    if (keys.indexOf((formulaString)) > -1){
      formulaString = '(' + formulaString + ')';
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

    // set the finished list to be displayed in the table
    this.dataSource = possibilityList;

    // Set the labels of the table
    keys.push(formulaString);
    this.displayedColumns = keys;

    return possibilityList;
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




