import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import Chart from 'chart.js/auto';
import { Participation } from '../../models/participation.model';

const CHART_COLOR = '#0b868f';

@Component({
  selector: 'app-medal-evolution-chart',
  templateUrl: './medal-evolution-chart.component.html',
  styleUrls: ['./medal-evolution-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedalEvolutionChartComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() participations: readonly Participation[] = [];
  @ViewChild('chartCanvas') private chartCanvas?: ElementRef<HTMLCanvasElement>;

  private chart?: Chart<'line', number[], number>;
  private viewInitialized = false;

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['participations'] && this.viewInitialized) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private renderChart(): void {
    if (!this.chartCanvas || this.participations.length === 0) {
      return;
    }

    this.chart?.destroy();
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.participations.map((participation) => participation.year),
        datasets: [
          {
            label: 'Medals',
            data: this.participations.map(
              (participation) => participation.medalsCount,
            ),
            borderColor: CHART_COLOR,
            backgroundColor: CHART_COLOR,
            pointBackgroundColor: '#fff',
            pointBorderColor: CHART_COLOR,
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: 'Date' } },
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
            title: { display: true, text: 'Medals' },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.y} medals`,
            },
          },
        },
      },
    });
  }
}
