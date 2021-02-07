import { Component, OnInit } from '@angular/core';
import {EvaluatedFormula, InterpreterService} from '../interpreter.service';


export interface Tile {
  color: string;
  index: string;
  value: string;
}

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

    // calculate how many flips of the table are needed
    const amountOfFlips = Math.log2(evaluatedFormula.possibilityList.length);
    // dimensions of kv-diagram
    const colNumber = this.columnCount;
    const rowNumber = evaluatedFormula.possibilityList.length / colNumber;

    // init grid for kv-diagram
    const tileGrid = [];
    for (let i = 0; i < rowNumber; i++){
      tileGrid[i] = [];
    }

    tileGrid[0][0] = 0;

    let currentFlip = 1;

    // do the following for each flip
    while (currentFlip < amountOfFlips + 1){

      // calculate the underlying power of the flip (like, 2, 4, 8, 16,...)
      const flipPower = Math.pow(2, currentFlip - 1);
      // calculate the position of the flip in the table
      const flipPos = Math.pow(2, Math.floor((currentFlip + 1) / 2) - 1);

      // Differentiate between horizontal and vertical flips
      if (currentFlip % 2 === 1){

        // lookup the mirrored cell and add itÄs amount to the flip power to get the filed
        for (let i = 0; i < flipPos; i++){
          for (let j = 0; j < flipPos; j++){
              tileGrid[j][i + flipPos] = tileGrid[j][flipPos - i - 1] + flipPower;
          }
        }

      } else {
        // lookup the mirrored cell and add itÄs amount to the flip power to get the filed
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
        const newValue = evaluatedFormula.possibilityList[tileGrid[i][j]][evaluatedFormula.formulaString];
        const color = newValue === '1' ? 'green' : 'red';
        tileList.push({index: tileGrid[i][j], value: newValue, color});
      }
    }

    this.tiles = tileList;
  }

}
