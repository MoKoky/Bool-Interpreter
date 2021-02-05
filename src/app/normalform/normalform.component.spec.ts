import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalformComponent } from './normalform.component';

describe('NormalformComponent', () => {
  let component: NormalformComponent;
  let fixture: ComponentFixture<NormalformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NormalformComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NormalformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
