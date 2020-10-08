import {Component} from '@angular/core';
import {InterpreterService} from './interpreter.service';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  formControl = new FormControl('', [
    Validators.required
  ]);

  constructor(private interpreterService: InterpreterService) {
  }

  calculate(): void{
    this.interpreterService.calculate(this.formControl.value);
  }
}
