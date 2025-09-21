import {Component, OnInit, OnDestroy, signal, inject, computed} from '@angular/core';
import { Aula } from '../../../shared/models/shared.models';
import { ClassroomsService } from '../../../shared/services/classrooms.service';
import { UserService } from '../../../shared/services/user.service';
import { interval, map, startWith } from 'rxjs';
import {AsyncPipe, CommonModule, DatePipe} from "@angular/common";
import {CalendarComponent} from "../calendar/calendar.component";
import {UserStateService} from "../../../auth/services/user-state.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    CalendarComponent,
    AsyncPipe
],
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  // Se usi una singola aula “corrente” nella card/offcanvas
  aula!: {
    time: string | { hour: number; minute: number; second?: number; nano?: number };
    link?: string;
    isActive?: boolean;
    date?: string | Date;
  };

  // Ticker 1s: l'async pipe aggiorna il template automaticamente
  now$ = interval(1000).pipe(startWith(0), map(() => Date.now()));

  profile = inject(UserStateService).profile;

  // Signal per memorizzare il giorno selezionato
  selectedDay = signal<Date | null>(null);
  selectedDayAule: Aula[] = [];
  userAule: Aula[] = [];
  prossimaAula: (Aula & { dataObj: Date }) | null = null;
  currentUserId = computed(() => this.profile()?.id!); // Questo dovrebbe provenire da un servizio di autenticazione
  creditsCount: number = 0;

  // Riferimento all'offcanvas Bootstrap
  private offcanvasInstance: any = null;

  constructor(
    private classroomsService: ClassroomsService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadProssimaAula();
    this.loadUserCredits();
    this.initializeOffcanvas();
  }

  ngOnDestroy(): void {
    // nulla da pulire (niente timer manuali)
  }

  // =======================
  //  JOIN: logica di sblocco
  // =======================

  /** Ritorna il timestamp di sblocco: (giorno/orario della lezione) - 10 minuti */
  getUnlockAtMs(time: any, baseDate?: Date | string): number {
    const startMs = this.localTimeToDayMs(time, baseDate);
    return startMs - 10 * 60 * 1000;
  }

  /**
   * Converte:
   *  - "HH:mm", "HH:mm:ss", "HH:mm:ss.SSS", "HH:mm - HH:mm"
   *  - {hour, minute, second?, nano?}
   * in un timestamp ms per OGGI (o per la data passata) alle HH:mm:ss
   */
  private localTimeToDayMs(
    time: string | { hour: number; minute: number; second?: number; nano?: number },
    dateVal?: Date | string
  ): number {
    // data base: preferisci quella passata; poi selectedDay(); altrimenti oggi
    const base = dateVal
      ? (dateVal instanceof Date ? dateVal : new Date(dateVal))
      : (this.selectedDay?.() ?? new Date());

    let h: number, m: number, s = 0;

    if (typeof time === 'string') {
      const main = time.trim().split('.')[0]; // toglie .SSS / .nnnnnnnnn
      const startPart = main.includes('-') ? main.split('-')[0].trim() : main; // gestisce intervallo
      const [hh = '0', mm = '0', ss = '0'] = startPart.split(':');
      h = Number(hh); m = Number(mm); s = Number(ss);
    } else if (time && typeof time === 'object') {
      h = Number(time.hour);
      m = Number(time.minute);
      s = Number(time.second ?? 0);
    } else {
      return Number.POSITIVE_INFINITY; // niente orario → resta disabilitato
    }

    if ([h, m, s].some(Number.isNaN)) return Number.POSITIVE_INFINITY;

    return new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      h, m, s, 0
    ).getTime();
  }

  /** Click del bottone: apre solo se siamo oltre l’ora di sblocco */
  joinClass(aula: { link?: string; time: any; date?: string | Date }) {
    const unlockAt = this.getUnlockAtMs(aula.time, aula.date);
    const canJoinNow = Date.now() >= unlockAt;
    if (canJoinNow && aula.link) {
      window.open(aula.link, '_blank');
    }
  }

  // =======================
  //  Offcanvas & calendario
  // =======================

  private initializeOffcanvas() {
    const offcanvasElement = document.getElementById('dayDetailsOffcanvas');
    if (offcanvasElement) {
      this.offcanvasInstance = new (window as any).bootstrap.Offcanvas(offcanvasElement);
    }
  }

  // Chiamata quando il calendario emette l'evento
  onDaySelected(data: { day: Date; aule: Aula[] }): void {
    // Memorizza il giorno selezionato e le aule
    this.selectedDay.set(data.day);
    this.selectedDayAule = data.aule;

    console.log('Giorno selezionato:', data.day);
    console.log('Aule del giorno:', data.aule);

    // Apri l'offcanvas
    if (this.offcanvasInstance) {
      this.offcanvasInstance.show();
    } else {
      // Fallback
      const offcanvasElement = document.getElementById('dayDetailsOffcanvas');
      if (offcanvasElement) {
        const offcanvas = new (window as any).bootstrap.Offcanvas(offcanvasElement);
        offcanvas.show();
      }
    }
  }

  // =======================
  //  Dati utente / aule
  // =======================

  private loadUserCredits(): void {
    this.userService.getUserById(this.currentUserId()).subscribe({
      next: (user) => {
        this.creditsCount = user.credits || 0;
      },
      error: (err) => {
        console.error('Errore nel caricamento dei crediti dell\'utente', err);
        this.creditsCount = 0;
      }
    });
  }

  private loadProssimaAula(): void {
    this.userService.getClassroomsByUserId(this.currentUserId()).subscribe({
      next: (aule) => {
        console.log('le aule per il calend:', aule);
        const now = new Date();

        const future: Array<Aula & { dataObj: Date }> = aule
          .filter(a => a.isActive)
          .map(a => ({
            ...a,
            dataObj: this.buildStartDate(a.date, a.time) // usa la helper sotto
          }))
          .filter(a => a.dataObj > now)
          .sort((a, b) => a.dataObj.getTime() - b.dataObj.getTime());

        this.userAule = aule;
        this.prossimaAula = future[0] ?? null;
      },
      error: (err) => console.error('Errore caricando aule utente:', err)
    });
  }

  /** Costruisce la Date di inizio a partire da data + "HH:mm" o "HH:mm - HH:mm" */
  private buildStartDate(dateVal: Date | string, time: string): Date {
    const d = (dateVal instanceof Date) ? dateVal : new Date(dateVal);
    const startPart = time.includes('-') ? time.split('-')[0].trim() : time.trim();
    const [hStr, mStr] = startPart.split(':');
    const hours = Number(hStr ?? 0);
    const minutes = Number(mStr ?? 0);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes, 0, 0);
  }

  visualizzaDettagli(aulaCliccata: Aula): void {
    const dateString = aulaCliccata.date; // stringa YYYY-MM-dd

    const auleDelGiorno = this.userAule
      .filter(a => a.date === dateString)
      .sort((a, b) => {
        const timeA = a.time.split('-')[0].trim();
        const timeB = b.time.split('-')[0].trim();
        return timeA.localeCompare(timeB);
      })
      .slice(0, 1);

    const giornoSelezionato = new Date(dateString + 'T00:00:00');
    this.onDaySelected({ day: giornoSelezionato, aule: auleDelGiorno });
  }

  // =======================
  //  Utility UI
  // =======================

  closeSidebar(): void {
    if (this.offcanvasInstance) {
      this.offcanvasInstance.hide();
    }
  }

  get formattedSelectedDay(): string {
    const day = this.selectedDay();
    if (!day) return '';

    return day.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  get isSelectedDayInPast(): boolean {
    const selected = this.selectedDay();
    if (!selected) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected < today;
  }

  // Altre funzioni del dashboard...
}
