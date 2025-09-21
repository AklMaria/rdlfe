import { Inject, Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';




@Injectable({
  providedIn: 'root',
})
export class CalendarService {

  private firebaseUrl = 'URL_Firebase';
  private http = inject(HttpClient);
  
  

  // Ottieni tutte le task da Firebase
  // getMeetings(): Observable<Meetings> {
  //   const userId = this.authService.getUserId();
  //   const url = `${this.firebaseUrl}/tasks.json?auth=${this.authService._user!.token}`;

  //   return this.http.get<{ [date: string]: Task[] }>(url).pipe(
  //     map((data) => {
  //       if (!data) {
  //         return {};
  //       }
  //       // Filtra solo le task dell'utente attivo
  //       return Object.keys(data).reduce((result: Meetings, date: string) => {
  //         const tasks = (data[date] as Task[]).filter(
  //           (task: Task) => task.userId === userId
  //         );
  //         if (tasks.length) {
  //           result[date] = tasks;
  //         }
  //         return result;
  //       }, {});
  //     })
  //   );
  // }

  // Aggiungi una nuova task
  // addTask(date: string, task: Task): Observable<any> {
  //   const url = `${this.firebaseUrl}/tasks/${date}.json`;
  //   return this.http.post(url, task);
  // }

  // Aggiorna lo stato di completamento di una task
  // updateTask(date: string, taskId: string, completed: boolean): Observable<any> {
  //   const url = `${this.firebaseUrl}/tasks/${date}/${taskId}.json`;
  //   return this.http.patch(url, { completed });
  // }
}
