import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCreditComponent } from './add-credit.component';

describe('AddCreditComponent', () => {
  let component: AddCreditComponent;
  let fixture: ComponentFixture<AddCreditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddCreditComponent]
    });
    fixture = TestBed.createComponent(AddCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
