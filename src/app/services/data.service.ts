import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { Olympic } from '../models/olympic.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly olympics$: Observable<readonly Olympic[]>;

  constructor(private readonly http: HttpClient) {
    this.olympics$ = this.http
      .get<readonly Olympic[]>(environment.olympicsUrl)
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  getOlympics(): Observable<readonly Olympic[]> {
    return this.olympics$;
  }

  getOlympicById(id: number): Observable<Olympic | undefined> {
    return this.olympics$.pipe(
      map((olympics) => olympics.find((olympic) => olympic.id === id)),
    );
  }
}
