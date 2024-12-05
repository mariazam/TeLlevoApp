import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomePasajeroPage } from './home-pasajero.page';

describe('HomePasajeroPage', () => {
  let component: HomePasajeroPage;
  let fixture: ComponentFixture<HomePasajeroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePasajeroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
