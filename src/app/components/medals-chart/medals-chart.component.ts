import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import Chart from 'chart.js/auto';
import { Olympic } from '../../models/olympic.model';

const CHART_COLORS = [
  '#0b868f',
  '#adc3de',
  '#7a3c53',
  '#8f6263',
  '#e28f33',
  '#94819d',
] as const;

@Component({
  selector: 'app-medals-chart',
  templateUrl: './medals-chart.component.html',
  styleUrls: ['./medals-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedalsChartComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() olympics: readonly Olympic[] = [];
  @Output() readonly countrySelected = new EventEmitter<number>();
  @ViewChild('chartCanvas') private chartCanvas?: ElementRef<HTMLCanvasElement>;

  private chart?: Chart<'pie', number[], string>;
  private viewInitialized = false;

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['olympics'] && this.viewInitialized) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  selectCountry(id: number): void {
    this.countrySelected.emit(id);
  }

  private renderChart(): void {
    if (!this.chartCanvas || this.olympics.length === 0) {
      return;
    }

    this.chart?.destroy();
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: this.olympics.map((olympic) => olympic.country),
        datasets: [
          {
            label: 'Medals',
            data: this.olympics.map((olympic) =>
              olympic.participations.reduce(
                (total, participation) => total + participation.medalsCount,
                0,
              ),
            ),
            backgroundColor: CHART_COLORS,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (_event, elements) => {
          const selected = elements[0];
          const olympic = selected ? this.olympics[selected.index] : undefined;
          if (olympic) {
            this.selectCountry(olympic.id);
          }
        },
        plugins: {
          legend: {
            labels: { color: '#202020', padding: 16 },
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.parsed} medals`,
            },
          },
        },
      },
    });
  }
}
