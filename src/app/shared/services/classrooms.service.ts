import { computed, inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Aula, ClassroomRegistration, DocumentItem, Registration, Utente } from '../models/shared.models';
import { HttpService } from './http.service';
import { HttpParams } from '@angular/common/http';
import { UserStateService } from '../../auth/services/user-state.service';

@Injectable({
  providedIn: 'root'
})
export class ClassroomsService {
  
  private userState = inject(UserStateService);
  currentUser = this.userState.profile;
  currentUserId = computed(() => this.currentUser()?.id!);

  constructor(private httpService: HttpService) { }

  // Metodi base CRUD
  getAllClassrooms(): Observable<Aula[]> {
    return this.httpService.get<Aula[]>('/classrooms');
  }

  getClassroomById(id: number): Observable<Aula> {
    return this.httpService.get<Aula>(`/classrooms/${id}`);
  }

  getAllCompletedClassroom(userId: number): Observable<Aula[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.httpService.get<Aula[]>('/classrooms/completed', params);
  } 


  createClassroom(aula: Aula): Observable<Aula> {
    return this.httpService.post<Aula>('/classrooms', aula);
  }

  updateClassroom(id: number, aula: Aula): Observable<Aula> {
    return this.httpService.put<Aula>(`/classrooms/${id}`, aula);
  }

  deleteClassroom(id: number): Observable<void> {
    return this.httpService.delete<void>(`/classrooms/${id}`);
  }

  getClassroomDocument(classroomId: number): Observable<DocumentItem[]>{
    return this.httpService.get<DocumentItem[]>(`/classrooms/${classroomId}/docs`);
  }

  downloadClassroomDocument(documentId: number): Observable<Blob> {
    return this.httpService.getBlob(`/classrooms/document/download/${documentId}`);
  }
  uploadDocument(aulaId: number, file: File): Observable<void> {
  const formData = new FormData();
  formData.append('id', aulaId.toString());
  formData.append('file', file);
  console.log(formData);

  return this.httpService.post<void>(`/classrooms/${aulaId}/doc`, formData);
}





  

  // Metodi specifici per il tuo caso d'uso

  // Ottieni aule di un utente specifico in una data specifica
  // getClassroomsByUserAndDate(userId: number, date: string): Observable<Aula[]> {
  //   return this.getAllClassrooms().pipe(
  //     map(aule => aule.filter(aula => {
  //       // Converte la data dell'aula in formato stringa per confronto
  //       const aulaDate = this.formatDateForComparison(new Date(aula.data));
  //       return aulaDate === date && aula.users.includes(userId);
  //     }))
  //   );
  // }

  // Ottieni tutte le aule disponibili in una data specifica (con posti liberi)
  // getAvailableClassroomsByDate(date: string): Observable<Aula[]> {
  //   return this.getAllClassrooms().pipe(
  //     map(aule => aule.filter(aula => {
  //       const aulaDate = this.formatDateForComparison(new Date(aula.data));
  //       return aulaDate === date && aula.users.length < aula.maxEntries;
  //     }))
  //   );
  // }

  // Ottieni aule di un utente in un intervallo di date (per il calendario)
  // getClassroomsByUserInDateRange(userId: number, startDate: string, endDate: string): Observable<Aula[]> {
  //   return this.getAllClassrooms().pipe(
  //     map(aule => aule.filter(aula => {
  //       const aulaDate = this.formatDateForComparison(new Date(aula.data));
  //       return aulaDate >= startDate && 
  //              aulaDate <= endDate && 
  //              aula.users.includes(userId);
  //     }))
  //   );
  // }

  // Iscrive un utente ad un'aula
  // subscribeUserToClassroom(aulaId: number, userId: number): Observable<Aula> {
  //   return this.getClassroomById(aulaId).pipe(
  //     map(aula => {
  //       // Controlla se l'aula ha ancora posti disponibili
  //       if (aula.users.length >= aula.maxEntries) {
  //         throw new Error('Aula al completo');
  //       }
        
  //       // Controlla se l'utente è già iscritto
  //       if (aula.users.includes(userId)) {
  //         throw new Error('Utente già iscritto a questa aula');
  //       }
        
  //       // Aggiunge l'utente all'array
  //       aula.users.push(userId);
  //       return aula;
  //     })
  //   ).pipe(
  //     // Aggiorna l'aula nel database
  //     switchMap(aulaAggiornata => this.updateClassroom(aulaId, aulaAggiornata))
  //   );
  // }

  // Disiscrive un utente da un'aula
  // unsubscribeUserFromClassroom(aulaId: number, userId: number): Observable<Aula> {
  //   return this.getClassroomById(aulaId).pipe(
  //     map(aula => {
  //       // Rimuove l'utente dall'array
  //       aula.users = aula.users.filter(id => id !== userId);
  //       return aula;
  //     })
  //   ).pipe(
  //     // Aggiorna l'aula nel database
  //     switchMap(aulaAggiornata => this.updateClassroom(aulaId, aulaAggiornata))
  //   );
  // }

  // Controlla se un utente è iscritto ad un'aula
  // isUserSubscribed(aulaId: number, userId: number): Observable<boolean> {
  //   return this.getClassroomById(aulaId).pipe(
  //     map(aula => aula.users.includes(userId))
  //   );
  // }

  // Ottieni il numero di posti liberi in un'aula
  // getAvailableSpots(aulaId: number): Observable<number> {
  //   return this.getClassroomById(aulaId).pipe(
  //     map(aula => aula.maxEntries - aula.users.length)
  //   );
  // }

  //Ottieni tutti gli utenti iscritti ad un'aula (richiede anche UserService)

  getSubscribedUsers(aulaId: number): Observable<ClassroomRegistration> {
    return this.httpService.get<ClassroomRegistration>(`/classrooms/${aulaId}/users`);
  }

  // Ottieni aule per mese
  // getClassroomsByUserAndMonth(userId: number, year: number, month: number): Observable<Aula[]> {
  //   return this.getAllClassrooms().pipe(
  //     map(aule => aule.filter(aula => {
  //       const aulaDate = new Date(aula.dateStartTime);
  //       return aulaDate.getFullYear() === year && 
  //              aulaDate.getMonth() === month - 1 && // month è 0-based
  //              aula.users.includes(userId);
  //     }))
  //   );
  // }

  // Formatta la data per il confronto
  private formatDateForComparison(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}