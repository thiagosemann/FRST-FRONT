import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComprarCreditoComponent } from './comprar-credito.component';

describe('ComprarCreditoComponent', () => {
  let component: ComprarCreditoComponent;
  let fixture: ComponentFixture<ComprarCreditoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ComprarCreditoComponent]
    });
    fixture = TestBed.createComponent(ComprarCreditoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
