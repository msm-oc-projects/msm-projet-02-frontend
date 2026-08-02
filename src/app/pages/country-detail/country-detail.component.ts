import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
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
  status: 'loading' | 'error' | 'success';
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
  private readonly dataService = inject(DataService);

  readonly viewModel$: Observable<CountryViewModel> = this.route.paramMap.pipe(
    map((params) => Number(params.get('id'))),
    switchMap((id) => {
      if (!Number.isInteger(id) || id <= 0) {
        return of(this.errorState('The country identifier is invalid.'));
      }

      return this.dataService.getOlympicById(id).pipe(
        map((olympic) =>
          olympic
            ? this.successState(olympic)
            : this.errorState('No country matches this identifier.'),
        ),
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
}
