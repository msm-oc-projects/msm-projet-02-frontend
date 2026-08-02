import { TestBed } from '@angular/core/testing';
import { MedalEvolutionChartComponent } from './medal-evolution-chart.component';

describe('MedalEvolutionChartComponent', () => {
  it('creates the component', async () => {
    await TestBed.configureTestingModule({
      declarations: [MedalEvolutionChartComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(MedalEvolutionChartComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
