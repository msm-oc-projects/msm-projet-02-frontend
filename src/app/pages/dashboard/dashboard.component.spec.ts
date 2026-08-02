import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { lastValueFrom, of } from 'rxjs';
import { Olympic } from '../../models/olympic.model';
import { DataService } from '../../services/data.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
  const olympics: readonly Olympic[] = [
    {
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
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [DashboardComponent],
      providers: [
        {
          provide: DataService,
          useValue: { getOlympics: () => of(olympics) },
        },
        { provide: Router, useValue: router },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    router.navigate.calls.reset();
  });

  it('creates the page', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('navigates to a country by identifier', () => {
    fixture.componentInstance.openCountry(2);

    expect(router.navigate).toHaveBeenCalledWith(['/country', 2]);
  });

  it('builds the dashboard indicators without template business logic', async () => {
    const viewModel = await lastValueFrom(
      fixture.componentInstance.viewModel$,
    );

    expect(viewModel.status).toBe('success');
    expect(viewModel.indicators).toEqual([
      { label: 'Number of JOs', value: 2 },
      { label: 'Number of countries', value: 1 },
    ]);
  });

  it('renders the introductory text', () => {
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.introduction')?.textContent).toContain(
      'Explore the Olympic medal totals for each country.',
    );
  });
});
