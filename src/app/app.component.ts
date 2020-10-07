import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Bool-Interpreter';
  calc = 0;

  ngOnInit(): void {
    this.calc = 1 + 2;
  }
}
