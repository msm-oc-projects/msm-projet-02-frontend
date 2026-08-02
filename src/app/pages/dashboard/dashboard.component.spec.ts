import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { DataService } from '../../services/data.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  const router = jasmine.createSpyObj<Router>('Router', ['navigate']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [
        {
          provide: DataService,
          useValue: { getOlympics: () => of([]) },
        },
        { provide: Router, useValue: router },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
  });

  it('creates the page', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('navigates to a country by identifier', () => {
    fixture.componentInstance.openCountry(2);

    expect(router.navigate).toHaveBeenCalledWith(['/country', 2]);
  });
});
