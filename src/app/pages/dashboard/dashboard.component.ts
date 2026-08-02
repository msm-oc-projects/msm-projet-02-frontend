import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { Indicator } from '../../models/indicator.model';
import { Olympic } from '../../models/olympic.model';
import { DataService } from '../../services/data.service';

interface DashboardViewModel {
  status: 'loading' | 'empty' | 'error' | 'success';
  olympics: readonly Olympic[];
  indicators: readonly Indicator[];
  message?: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly dataService = inject(DataService);
  private readonly router = inject(Router);

  readonly viewModel$: Observable<DashboardViewModel> =
    this.dataService.getOlympics().pipe(
      map((olympics) => this.toViewModel(olympics)),
      startWith(this.state('loading')),
      catchError(() =>
        of(
          this.state(
            'error',
            'Unable to load Olympic data. Please try again later.',
          ),
        ),
      ),
    );

  openCountry(id: number): void {
    void this.router.navigate(['/country', id]);
  }

  private toViewModel(olympics: readonly Olympic[]): DashboardViewModel {
    if (olympics.length === 0) {
      return this.state('empty', 'No Olympic data is available.');
    }

    const olympicYears = new Set(
      olympics.flatMap((olympic) =>
        olympic.participations.map((participation) => participation.year),
      ),
    );

    return {
      status: 'success',
      olympics,
      indicators: [
        { label: 'Number of countries', value: olympics.length },
        { label: 'Number of JOs', value: olympicYears.size },
      ],
    };
  }

  private state(
    status: DashboardViewModel['status'],
    message?: string,
  ): DashboardViewModel {
    return { status, olympics: [], indicators: [], message };
  }
}
