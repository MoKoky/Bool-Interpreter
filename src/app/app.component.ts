import {Component} from '@angular/core';
import {InterpreterService} from './interpreter.service';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Bool-Interpreter';
  sum = 0;

  xFormControl = new FormControl('', [
    Validators.required
  ]);
  yFormControl = new FormControl('', [
    Validators.required
  ]);

  constructor(private interpreterService: InterpreterService) {
  }

  public Add(): void{
    this.sum = this.interpreterService.Add(Number(this.xFormControl.value), Number(this.yFormControl.value));
  }
}
