import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Sito } from '../models/shared.models';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class SitoService {
  
  constructor(private http: HttpService) {}

  getSites(): Observable<Sito[]> {
    return this.http.get<Sito[]>('/affiliations');
  }

  addSite(newSito: Sito): Observable<Sito> {
    return this.http.post<Sito>('/affiliations', newSito);
  }

  updateSite(id: number, updatedSito: Sito): Observable<Sito> {
    return this.http.put<Sito>(`/affiliations/${id}`, updatedSito);
  }

  deleteSite(id: number): Observable<void> {
    return this.http.delete<void>(`/affiliations/${id}`);
  }
}
