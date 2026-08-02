import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { Olympic } from '../models/olympic.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly dataUrl = 'assets/mock/olympic.json';
  private readonly olympics$: Observable<Olympic[]>;

  constructor(private readonly http: HttpClient) {
    this.olympics$ = this.http.get<Olympic[]>(this.dataUrl).pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  getOlympics(): Observable<Olympic[]> {
    return this.olympics$;
  }

  getOlympicById(id: number): Observable<Olympic | undefined> {
    return this.olympics$.pipe(
      map((olympics) => olympics.find((olympic) => olympic.id === id)),
    );
  }
}
