import { Component } from '@angular/core';
import {InterpreterService} from '../interpreter.service';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-bool-table',
  templateUrl: './bool-table.component.html',
  styleUrls: ['./bool-table.component.css']
})
export class BoolTableComponent {

  formControl = new FormControl('', [
    Validators.required
  ]);

  displayedColumns: string[] = [];
  dataSource = [];

  constructor(private interpreterService: InterpreterService) {
  }

  // Calculate formula and display table
  calculate(): void{
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
        entry[this.formControl.value] = '1';
      } else {
        entry[this.formControl.value] = '0';
      }
      // add the current case to the list of all cases
      possibilityList.push(entry);
    }

    // set the finished list to be displayed in the table
    this.dataSource = possibilityList;
    // Set the labels of the table
    keys.push(this.formControl.value);
    this.displayedColumns = keys;
  }



}
