import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Registration } from '../models/shared.models';
import {environment} from "../../environment";

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private baseUrl = environment.apiUrl; // Cambia con la tua URL base
  private defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  constructor(private http: HttpClient) {}

  // Metodo GET generico
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.defaultHeaders,
      params: params
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // Metodo POST generico
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.defaultHeaders
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // Metodo PUT generico
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.defaultHeaders
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

// Metodo DELETE generico migliorato
delete<T>(endpoint: string, options?: {
  params?: { [param: string]: string | number | boolean },
  headers?: HttpHeaders
}): Observable<T> {
  return this.http.delete<T>(`${this.baseUrl}${endpoint}`, {
    headers: options?.headers || this.defaultHeaders,
    params: options?.params
  }).pipe(
    retry(1),
    catchError(this.handleError)
  );
}


  // Metodo PATCH generico
  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.defaultHeaders
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // Metodo per upload file
  uploadFile<T>(endpoint: string, file: File, additionalData?: any): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const headers = new HttpHeaders();
    // Non impostare Content-Type per FormData, lascia che il browser lo gestisca

    return this.http.post<T>(`${this.baseUrl}${endpoint}`, formData, {
      headers: headers
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // Metodo per impostare token di autenticazione
  setAuthToken(token: string): void {
    this.defaultHeaders = this.defaultHeaders.set('Authorization', `Bearer ${token}`);
  }

  // Metodo per rimuovere token di autenticazione
  removeAuthToken(): void {
    this.defaultHeaders = this.defaultHeaders.delete('Authorization');
  }

  // Metodo per aggiungere header personalizzati
  addHeader(key: string, value: string): void {
    this.defaultHeaders = this.defaultHeaders.set(key, value);
  }

  // Metodo per rimuovere header
  removeHeader(key: string): void {
    this.defaultHeaders = this.defaultHeaders.delete(key);
  }

  // Gestione degli errori
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Si è verificato un errore sconosciuto';

    if (error.error instanceof ErrorEvent) {
      // Errore lato client
      errorMessage = `Errore: ${error.error.message}`;
    } else {
      // Errore lato server
      switch (error.status) {
        case 400:
          errorMessage = 'Richiesta non valida';
          break;
        case 401:
          errorMessage = 'Non autorizzato';
          break;
        case 403:
          errorMessage = 'Accesso negato';
          break;
        case 404:
          errorMessage = 'Risorsa non trovata';
          break;
        case 500:
          errorMessage = 'Errore interno del server';
          break;
        default:
          errorMessage = `Errore: ${error.status} - ${error.message}`;
      }
    }

    console.error('HttpService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Metodo per creare parametri HTTP
  createHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });

    return httpParams;
  }

  // Metodo per ottenere la URL completa
  getFullUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }
}
