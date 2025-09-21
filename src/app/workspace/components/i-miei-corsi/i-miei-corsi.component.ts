import {Component, computed, inject, OnInit} from '@angular/core';
import { Aula, Registration } from '../../../shared/models/shared.models';
import { InscriptionsService } from '../../../shared/services/inscriptions.service';
import { UserService } from '../../../shared/services/user.service';
import { DatePipe, SlicePipe } from "@angular/common";
import {UserStateService} from "../../../auth/services/user-state.service";

@Component({
  selector: 'app-i-miei-corsi',
  templateUrl: './i-miei-corsi.component.html',
  standalone: true,
  imports: [
    DatePipe,
    SlicePipe
],
  styleUrl: './i-miei-corsi.component.css'
})
export class IMieiCorsiComponent implements OnInit{

  allClassrooms: Aula[] = [];

  private userState = inject(UserStateService);
  private profile = this.userState.profile;
  currentUserId = computed(() => this.profile()?.id!);

   private userService = inject(UserService)
  private inscriptionsService = inject(InscriptionsService)

  ngOnInit(): void {
    this.loadClassrooms();
  }

  loadClassrooms(){
    console.log('test')
    this.userService.getClassroomsByUserId(this.currentUserId()).subscribe({
      next: (aule) =>{

        // this.allClassrooms = aule;

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        this.allClassrooms = aule.filter(aula =>
        aula.isActive && new Date(aula.date) >= now )
      }
    })
  }

  unsubscribe(aula: Aula): void {
      var registrationRequest: Registration
      registrationRequest = {
        userId: this.currentUserId(),
        classroomId: aula.id
      };
      this.inscriptionsService.unregisterUserToClassroom(registrationRequest).subscribe({
        next: () => {

          this.loadClassrooms();
        },
        error: (err) => {
          console.error('Errore eliminazione:', err);
        }
      })
    }
}
