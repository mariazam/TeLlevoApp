import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarrerasEnProcesoPage } from './carreras-en-proceso.page';

describe('CarrerasEnProcesoPage', () => {
  let component: CarrerasEnProcesoPage;
  let fixture: ComponentFixture<CarrerasEnProcesoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CarrerasEnProcesoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
