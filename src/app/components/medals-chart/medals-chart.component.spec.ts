import { TestBed } from '@angular/core/testing';
import { MedalsChartComponent } from './medals-chart.component';

describe('MedalsChartComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MedalsChartComponent],
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(MedalsChartComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('emits the selected country identifier', () => {
    const component = TestBed.createComponent(
      MedalsChartComponent,
    ).componentInstance;
    const emitSpy = spyOn(component.countrySelected, 'emit');

    component.selectCountry(3);

    expect(emitSpy).toHaveBeenCalledOnceWith(3);
  });
});
