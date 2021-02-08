import {Component, OnInit} from '@angular/core';
import {InterpreterService} from '../interpreter.service';

@Component({
  selector: 'app-normalform',
  templateUrl: './normalform.component.html',
  styleUrls: ['./normalform.component.css']
})
export class NormalformComponent implements OnInit {

  public dnf;
  public knf;
  public nandForm;
  public norForm;

  constructor(private interpreterService: InterpreterService) { }

  ngOnInit(): any{

    this.interpreterService.getFormulaChangedEmitter().subscribe(() => {this.updateView(); });

  }

  private updateView(): void{
    this.dnf = this.interpreterService.getDnf();
    this.knf = this.interpreterService.getKnf();
    this.norForm = this.interpreterService.getNor();
    this.nandForm = this.interpreterService.getNand();
  }

}
