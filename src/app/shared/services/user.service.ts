import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Aula, Utente } from '../models/shared.models';
import { HttpService } from './http.service';
import {HttpParams} from "@angular/common/http";

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

  doesUserExist(email: string): Observable<Boolean> {
    let params = new HttpParams().set('email', email);
    return this.httpService.get<Boolean>('/users/exist', params);
  }
}
