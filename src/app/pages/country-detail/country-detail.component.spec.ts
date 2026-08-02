import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { DataService } from '../../services/data.service';
import { CountryDetailComponent } from './country-detail.component';

describe('CountryDetailComponent', () => {
  it('creates the page', async () => {
    await TestBed.configureTestingModule({
      declarations: [CountryDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: '1' })) },
        },
        {
          provide: DataService,
          useValue: { getOlympicById: () => of(undefined) },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    const fixture = TestBed.createComponent(CountryDetailComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
