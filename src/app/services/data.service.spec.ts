import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Olympic } from '../models/olympic.model';
import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;
  let httpController: HttpTestingController;

  const olympics: Olympic[] = [
    {
      id: 1,
      country: 'Italy',
      participations: [
        {
          id: 1,
          year: 2020,
          city: 'Tokyo',
          medalsCount: 40,
          athleteCount: 381,
        },
      ],
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DataService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpController.verify());

  it('loads the Olympic data', () => {
    service.getOlympics().subscribe((result) => expect(result).toEqual(olympics));

    httpController.expectOne(environment.olympicsUrl).flush(olympics);
  });

  it('finds a country by its identifier', () => {
    service
      .getOlympicById(1)
      .subscribe((result) => expect(result).toEqual(olympics[0]));

    httpController.expectOne(environment.olympicsUrl).flush(olympics);
  });

  it('propagates a retrieval error for the page to handle', (done) => {
    service.getOlympics().subscribe({
      next: () => fail('The request should fail'),
      error: (error: { status: number }) => {
        expect(error.status).toBe(500);
        done();
      },
    });

    httpController.expectOne(environment.olympicsUrl).flush(
      { message: 'Internal error' },
      { status: 500, statusText: 'Server Error' },
    );
  });
});
