import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  ParamMap,
  Router,
  convertToParamMap,
} from '@angular/router';
import {
  BehaviorSubject,
  filter,
  firstValueFrom,
  of,
  throwError,
} from 'rxjs';
import { Olympic } from '../../models/olympic.model';
import { DataService } from '../../services/data.service';
import { CountryDetailComponent } from './country-detail.component';

describe('CountryDetailComponent', () => {
  let fixture: ComponentFixture<CountryDetailComponent>;
  let routeParams: BehaviorSubject<ParamMap>;
  let dataService: jasmine.SpyObj<DataService>;
  let router: jasmine.SpyObj<Router>;

  const italy: Olympic = {
    id: 1,
    country: 'Italy',
    participations: [
      {
        id: 1,
        year: 2016,
        city: 'Rio de Janeiro',
        medalsCount: 28,
        athleteCount: 375,
      },
      {
        id: 2,
        year: 2020,
        city: 'Tokyo',
        medalsCount: 40,
        athleteCount: 381,
      },
    ],
  };

  beforeEach(async () => {
    routeParams = new BehaviorSubject(convertToParamMap({ id: '1' }));
    dataService = jasmine.createSpyObj<DataService>('DataService', [
      'getOlympicById',
    ]);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    dataService.getOlympicById.and.returnValue(of(italy));

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [CountryDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: routeParams.asObservable() },
        },
        { provide: DataService, useValue: dataService },
        { provide: Router, useValue: router },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  function createComponent(): CountryDetailComponent {
    fixture = TestBed.createComponent(CountryDetailComponent);
    return fixture.componentInstance;
  }

  it('loads the selected country and builds its indicators', async () => {
    const component = createComponent();
    const viewModel = await firstValueFrom(
      component.viewModel$.pipe(filter((state) => state.status === 'success')),
    );

    expect(dataService.getOlympicById).toHaveBeenCalledOnceWith(1);
    expect(viewModel.olympic).toEqual(italy);
    expect(viewModel.indicators).toEqual([
      { label: 'Number of entries', value: 2 },
      { label: 'Total number of medals', value: 68 },
      { label: 'Total number of athletes', value: 756 },
    ]);
  });

  it('redirects an invalid identifier to the error page', () => {
    routeParams.next(convertToParamMap({ id: 'invalid' }));
    const subscription = createComponent().viewModel$.subscribe();

    expect(router.navigate).toHaveBeenCalledWith(['/not-found'], {
      replaceUrl: true,
    });
    expect(dataService.getOlympicById).not.toHaveBeenCalled();
    subscription.unsubscribe();
  });

  it('redirects an unknown country to the error page', () => {
    dataService.getOlympicById.and.returnValue(of(undefined));
    const subscription = createComponent().viewModel$.subscribe();

    expect(router.navigate).toHaveBeenCalledWith(['/not-found'], {
      replaceUrl: true,
    });
    subscription.unsubscribe();
  });

  it('shows a clear state when participation data is missing', async () => {
    dataService.getOlympicById.and.returnValue(
      of({ ...italy, participations: [] }),
    );
    const component = createComponent();
    const viewModel = await firstValueFrom(
      component.viewModel$.pipe(filter((state) => state.status === 'empty')),
    );

    expect(viewModel.message).toBe(
      'No participation data is available for this country.',
    );
  });

  it('shows a recoverable error when loading fails', async () => {
    dataService.getOlympicById.and.returnValue(
      throwError(() => new Error('Network error')),
    );
    const component = createComponent();
    const viewModel = await firstValueFrom(
      component.viewModel$.pipe(filter((state) => state.status === 'error')),
    );

    expect(viewModel.message).toBe(
      'Unable to load this country. Please try again later.',
    );
  });
});
