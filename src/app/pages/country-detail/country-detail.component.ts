import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  EMPTY,
  Observable,
  catchError,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { Indicator } from '../../models/indicator.model';
import { Olympic } from '../../models/olympic.model';
import { DataService } from '../../services/data.service';

interface CountryViewModel {
  status: 'loading' | 'empty' | 'error' | 'success';
  olympic?: Olympic;
  indicators: readonly Indicator[];
  message?: string;
}

@Component({
  selector: 'app-country-detail',
  templateUrl: './country-detail.component.html',
  styleUrls: ['./country-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountryDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);

  readonly viewModel$: Observable<CountryViewModel> = this.route.paramMap.pipe(
    map((params) => Number(params.get('id'))),
    switchMap((id) => {
      if (!Number.isInteger(id) || id <= 0) {
        return this.redirectToNotFound();
      }

      return this.dataService.getOlympicById(id).pipe(
        switchMap((olympic) => {
          if (!olympic) {
            return this.redirectToNotFound();
          }

          return of(
            olympic.participations.length === 0
              ? this.emptyState(olympic)
              : this.successState(olympic),
          );
        }),
      );
    }),
    startWith<CountryViewModel>({ status: 'loading', indicators: [] }),
    catchError(() =>
      of(this.errorState('Unable to load this country. Please try again later.')),
    ),
  );

  private successState(olympic: Olympic): CountryViewModel {
    const totalMedals = olympic.participations.reduce(
      (total, participation) => total + participation.medalsCount,
      0,
    );
    const totalAthletes = olympic.participations.reduce(
      (total, participation) => total + participation.athleteCount,
      0,
    );

    return {
      status: 'success',
      olympic,
      indicators: [
        { label: 'Number of entries', value: olympic.participations.length },
        { label: 'Total number of medals', value: totalMedals },
        { label: 'Total number of athletes', value: totalAthletes },
      ],
    };
  }

  private errorState(message: string): CountryViewModel {
    return { status: 'error', indicators: [], message };
  }

  private emptyState(olympic: Olympic): CountryViewModel {
    return {
      status: 'empty',
      olympic,
      indicators: [],
      message: 'No participation data is available for this country.',
    };
  }

  private redirectToNotFound(): Observable<never> {
    void this.router.navigate(['/not-found'], { replaceUrl: true });
    return EMPTY;
  }
}
