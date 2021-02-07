import { Component, OnInit } from '@angular/core';
import {Tile} from '../bool-table/bool-table.component';
import {EvaluatedFormula, InterpreterService} from '../interpreter.service';

@Component({
  selector: 'app-kvdiagram',
  templateUrl: './kvdiagram.component.html',
  styleUrls: ['./kvdiagram.component.css']
})
export class KvdiagramComponent implements OnInit {


  tiles: Tile[] = [];
  columnCount = 0;

  constructor(private interpreterService: InterpreterService) { }

  ngOnInit(): void {
    this.interpreterService.getFormulaChangedEmitter().subscribe(() => {this.printKV(); });
  }

  private printKV(): void {
    const evaluatedFormula = this.interpreterService.getEvaluatedFormula();
    const possibilityList = evaluatedFormula.possibilityList;

    // calculate the root of the numbers of entries in the table
    // if the root is not a whole number double the number and calculate again to get the correct number of columns
    const root = Math.sqrt(possibilityList.length);
    if (root % 1 === 0){
      this.columnCount = root;
    } else {
      this.columnCount = Math.sqrt(possibilityList.length * 2);
    }

    // create tiles
    this.GenerateTiles(evaluatedFormula);
  }

  /*currentAddAmountX = Math.pow(2, Math.floor(Math.log2(j)) * 2);
}
if (i !== 0){
  currentAddAmountY = Math.pow(2, Math.floor(Math.log2(i)) * 2 + 1);*/

  private GenerateTiles(evaluatedFormula: EvaluatedFormula): void{

    const amountOfFlips = Math.log2(evaluatedFormula.possibilityList.length);
    const colNumber = this.columnCount;
    const rowNumber = evaluatedFormula.possibilityList.length / colNumber;

    const tileGrid = [];
    for (let i = 0; i < rowNumber; i++){
      tileGrid[i] = [];
    }

    tileGrid[0][0] = 0;

    let currentFlip = 1;

    while (currentFlip < amountOfFlips + 1){

      const flipPower = Math.pow(2, currentFlip - 1);
      const flipPos = Math.pow(2, Math.floor((currentFlip + 1) / 2) - 1);

      if (currentFlip % 2 === 1){

        for (let i = 0; i < flipPos; i++){
          for (let j = 0; j < flipPos; j++){
              tileGrid[j][i + flipPos] = tileGrid[j][flipPos - i - 1] + flipPower;
          }
        }

      } else {

        for (let i = 0; i < flipPos * 2; i++){
          for (let j = 0; j < flipPos; j++){
            tileGrid[j + flipPos][i] = tileGrid[flipPos - j - 1][i] + flipPower;
          }
        }


      }

      currentFlip++;
    }

    console.log(tileGrid);

    const tileList = [];
    for (let i = 0; i < rowNumber; i++){
      for (let j = 0; j < colNumber; j++){
        tileList.push({text: tileGrid[i][j], cols: 3, rows: 1, color: 'lightblue'});
      }
    }

    this.tiles = tileList;




  }

  /*private printKV(): void {
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

}
