import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Aula, ClassroomRegistration, Registration, Utente } from '../models/shared.models';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class InscriptionsService {

  constructor(private httpService: HttpService) { }

 registerUserToClassroom( registration : Registration) {
    return this.httpService.post<void>('/inscriptions', registration);
  }

unregisterUserToClassroom(registration: Registration) {
  return this.httpService.delete<void>('/inscriptions', {
    params: {
      userId: registration.userId,
      classroomId: registration.classroomId
    }
  });
}

  
  
}