import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KvdiagramComponent } from './kvdiagram.component';

describe('KvdiagramComponent', () => {
  let component: KvdiagramComponent;
  let fixture: ComponentFixture<KvdiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KvdiagramComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KvdiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
