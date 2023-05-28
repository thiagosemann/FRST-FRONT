import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiberacaoMaquinasComponent } from './liberacao-maquinas.component';

describe('LiberacaoMaquinasComponent', () => {
  let component: LiberacaoMaquinasComponent;
  let fixture: ComponentFixture<LiberacaoMaquinasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LiberacaoMaquinasComponent]
    });
    fixture = TestBed.createComponent(LiberacaoMaquinasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
