import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InterpreterService {

  constructor() { }

  public Add(x: number, y: number): number {
    return x + y;
  }
}
