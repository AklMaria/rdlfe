import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { Aula, DocumentItem, Utente } from '../models/shared.models';
import { HttpService } from './http.service';
import {HttpClient, HttpParams} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private httpService: HttpService) { }

  // Metodi base CRUD
  getAllUsers(): Observable<Utente[]> {
    return this.httpService.get<Utente[]>('/users');

  }
  getUserById(id: number): Observable<Utente> {
    return this.httpService.get<Utente>(`/users/${id}`);
  }

  createUser(utente: Utente): Observable<Utente> {
    return this.httpService.post<Utente>('/users', utente);
  }

  updateUser(id: number, utente: Utente): Observable<Utente> {
    return this.httpService.put<Utente>(`/users/${id}`, utente);
  }

  deleteUser(id: number): Observable<void> {
    return this.httpService.delete<void>(`/users/${id}`);
  }

  getClassroomsByUserId(userId: number): Observable<Aula[]>{

      return this.httpService.get<Aula[]>(`/users/${userId}/classrooms`);
    }

  doesUserExist(email: string): Observable<number> {
    const params = new HttpParams().set('email', email);
    return this.httpService.get<number>('/users/exist', params).pipe(
      catchError((err) => {
        console.error('Errore controllo esistenza utente:', err);
        return of(0);
      })
    );
  }

  uploadDocument(userId: number, file: File): Observable<void> {
  const formData = new FormData();
  formData.append('userId', userId.toString());
  formData.append('file', file);
  console.log(formData);

  return this.httpService.post<void>('/docs', formData);
}

getDocumentsByUserId(userId: number): Observable<DocumentItem[]> {
  return this.httpService.get<DocumentItem[]>(`/docs/${userId}`);
}
deleteDocument(documentId: number): Observable<void> {
  return this.httpService.delete<void>(`/docs/${documentId}`);
}

downloadDocument(documentId: number): Observable<Blob> {
  return this.httpService.getBlob(`/docs/download/${documentId}`);
}

  
}
