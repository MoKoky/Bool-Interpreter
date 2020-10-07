import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoolTableComponent } from './bool-table.component';

describe('BoolTableComponent', () => {
  let component: BoolTableComponent;
  let fixture: ComponentFixture<BoolTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoolTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoolTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
