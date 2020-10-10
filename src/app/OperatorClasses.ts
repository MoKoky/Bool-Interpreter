export abstract class Operator {
  abstract evaluate(): boolean;
}

export class Variable extends Operator{
  value = false;

  constructor() {
    super();
  }

  public setValue(newValue: boolean): void{
    this.value = newValue;
  }

  evaluate(): boolean {
    return this.value;
  }
}

export class NOTOperator extends Operator{
  operator1: Operator;

  constructor(op1: Operator) {
    super();
    this.operator1 = op1;
  }

  evaluate(): boolean {
    return !this.operator1.evaluate();
  }
}

export class NANDOperator extends Operator{
  operator1: Operator;
  operator2: Operator;

  constructor(op1: Operator, op2: Operator) {
    super();
    this.operator1 = op1;
    this.operator2 = op2;
  }

  evaluate(): boolean {
    return !(this.operator1.evaluate() && this.operator2.evaluate());
  }
}

export class ANDOperator extends Operator{
  operator1: Operator;
  operator2: Operator;

  constructor(op1: Operator, op2: Operator) {
    super();
    this.operator1 = op1;
    this.operator2 = op2;
  }

  evaluate(): boolean {
    return (this.operator1.evaluate() && this.operator2.evaluate());
  }
}

export class NOROperator extends Operator{
  operator1: Operator;
  operator2: Operator;

  constructor(op1: Operator, op2: Operator) {
    super();
    this.operator1 = op1;
    this.operator2 = op2;
  }

  evaluate(): boolean {
    return !(this.operator1.evaluate() || this.operator2.evaluate());
  }
}

export class OROperator extends Operator{
  operator1: Operator;
  operator2: Operator;

  constructor(op1: Operator, op2: Operator) {
    super();
    this.operator1 = op1;
    this.operator2 = op2;
  }

  evaluate(): boolean {
    return (this.operator1.evaluate() || this.operator2.evaluate());
  }
}

export class XOROperator extends Operator{
  operator1: Operator;
  operator2: Operator;

  constructor(op1: Operator, op2: Operator) {
    super();
    this.operator1 = op1;
    this.operator2 = op2;
  }

  evaluate(): boolean {
    return ((this.operator1.evaluate() || this.operator2.evaluate()) && (this.operator1.evaluate() !== this.operator2.evaluate()));
  }
}

export class IMPLICATION1Operator extends Operator{
  operator1: Operator;
  operator2: Operator;

  constructor(op1: Operator, op2: Operator) {
    super();
    this.operator1 = op1;
    this.operator2 = op2;
  }

  evaluate(): boolean {
    return !this.operator1.evaluate() || this.operator2.evaluate();
  }
}

export class IMPLICATION2Operator extends Operator{
  operator1: Operator;
  operator2: Operator;

  constructor(op1: Operator, op2: Operator) {
    super();
    this.operator1 = op1;
    this.operator2 = op2;
  }

  evaluate(): boolean {
    return this.operator1.evaluate() || !this.operator2.evaluate();
  }
}

export class EQUIVALENCEOperator extends Operator{
  operator1: Operator;
  operator2: Operator;

  constructor(op1: Operator, op2: Operator) {
    super();
    this.operator1 = op1;
    this.operator2 = op2;
  }

  evaluate(): boolean {
    return ((this.operator1.evaluate() && this.operator2.evaluate()) || (!this.operator1.evaluate() && !this.operator2.evaluate()));
  }
}

