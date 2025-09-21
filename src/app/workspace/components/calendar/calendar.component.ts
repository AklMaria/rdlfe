import {Component, computed, EventEmitter, inject, OnInit, Output, signal} from '@angular/core';
import { Aula } from '../../../shared/models/shared.models';
import { ClassroomsService } from '../../../shared/services/classrooms.service';
import { UserService } from '../../../shared/services/user.service';
import {CommonModule, NgClass} from "@angular/common";
import {UserStateService} from "../../../auth/services/user-state.service";


@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  standalone: true,
  imports: [
    CommonModule,
    NgClass
],
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit{

  @Output() daySelected = new EventEmitter<{day: Date, aule: Aula[]}>();

  constructor(
    private classRoomService: ClassroomsService,
    private userService: UserService
  ){}
  ngOnInit(): void {
    this.loadUserClassrooms();
  }

  trackDate(index: number, day: Date): number {
    return day.getTime();
  }

  trackHour(index: number, hour: Date): number {
    return hour.getHours(); // The hour is unique within a day
  }

  trackAula(index: number, aula: { id: string | number; name: string }): string | number {
    return aula.id;
  }

  trackWeekday(index: number, weekDay: string): string {
    return weekDay;
  }

  userClassrooms: Aula[] = [];
  private userState = inject(UserStateService);
  private profile = this.userState.profile;
  currentUserId = computed(() => this.profile()?.id!);
  isDataLoaded: boolean = false;

  selectedClasses: Aula[] = [];
  private view: 'month' | 'week' | 'day' = 'month';
  private offcanvasInstance: any = null;
  _activeDay: Date = new Date();

  ngAfterViewInit() {
    // Inizializza l'offcanvas dopo che la view è stata caricata
    this.initializeOffcanvas();
  }

  private initializeOffcanvas() {
    // Ottieni riferimento all'elemento offcanvas
    const offcanvasElement = document.getElementById('dayDetailsOffcanvas');

    if (offcanvasElement) {
      // Crea l'istanza dell'offcanvas Bootstrap
      this.offcanvasInstance = new (window as any).bootstrap.Offcanvas(offcanvasElement);
    }
  }

  loadUserClassrooms(){
    this.userService.getClassroomsByUserId(this.currentUserId()).subscribe({
      next: (aule) =>{
        this.userClassrooms = aule; // Non serve più filtrare, il BE restituisce già le aule dell'utente
        console.log('aule:', this.userClassrooms)
        this.isDataLoaded = true;
      }

      // Carica anche le lezioni per questo utente
    });
  }

  hasClassOnDay(day: Date): boolean {
  const dayString = this.formatDateToLocalString(day);
  return this.userClassrooms.some(aula => (aula.date as any) === dayString);
}

// Metodo helper che formatta la data senza conversione UTC
private formatDateToLocalString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

  activeDay(): Date {
    return new Date(this._activeDay.getTime());
  }

  setActiveDay(day: Date) {
    this._activeDay = new Date(day.getTime());
  }

  setView(view: 'month' | 'week' | 'day') {
    this.view = view;
  }

  currentView(): 'month' | 'week' | 'day' {
    return this.view;
  }

  currentMonthName(): string {
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    return this._activeDay.toLocaleDateString('it-IT', options);
  }

  goToToday() {
    this.setActiveDay(new Date());
  }

  goToPreviousPeriod() {
    if (this.view === 'month') {
      this.setActiveDay(new Date(this._activeDay.getFullYear(), this._activeDay.getMonth() - 1, 1));
    } else if (this.view === 'week') {
      const prevWeek = new Date(this._activeDay);
      prevWeek.setDate(prevWeek.getDate() - 7);
      this.setActiveDay(prevWeek);
    } else if (this.view === 'day') {
      const prevDay = new Date(this._activeDay);
      prevDay.setDate(prevDay.getDate() - 1);
      this.setActiveDay(prevDay);
    }
  }

  goToNextPeriod() {
    if (this.view === 'month') {
      this.setActiveDay(new Date(this._activeDay.getFullYear(), this._activeDay.getMonth() + 1, 1));
    } else if (this.view === 'week') {
      const nextWeek = new Date(this._activeDay);
      nextWeek.setDate(nextWeek.getDate() + 7);
      this.setActiveDay(nextWeek);
    } else if (this.view === 'day') {
      const nextDay = new Date(this._activeDay);
      nextDay.setDate(nextDay.getDate() + 1);
      this.setActiveDay(nextDay);
    }
  }

  weekDays(): string[] {
    return ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  }

  startOfWeek(date: Date): Date {
    const day = date.getDay();
    const diff = (day === 0) ? -6 : 1 - day;
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + diff);
    return start;
  }

  daysOfMonth(): Date[] {
    const year = this._activeDay.getFullYear();
    const month = this._activeDay.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startDate = this.startOfWeek(firstDayOfMonth);

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      days.push(d);
    }

    return days;
  }

  daysOfWeek(): Date[] {
    const start = this.startOfWeek(this._activeDay);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }

  hoursOfDay(): Date[] {
    const hours: Date[] = [];
    const baseDate = this.activeDay();
    for (let h = 9; h <= 18; h++) {
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), h);
      hours.push(date);
    }
    return hours;
  }

  sameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear()
      && d1.getMonth() === d2.getMonth()
      && d1.getDate() === d2.getDate();
  }

  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return date.toLocaleDateString('it-IT', options);
  }

  isActiveDay(day: Date): boolean {
    return this.activeDay()?.toDateString() === day.toDateString();
  }

  isInactiveDay(day: Date): boolean {
    return day.getMonth() !== this._activeDay.getMonth();
  }

  onDayClick(day: Date) {
    this.setActiveDay(day);
  }

  openSidebar(day: Date): void {
  const dateString = this.formatDateToLocalString(day);
  const auleForDay = this.userClassrooms.filter(aula => {
    const aulaDateString = typeof aula.date === 'string' ? aula.date : this.formatDateToLocalString(aula.date);
    return aulaDateString === dateString;
  });

  this.daySelected.emit({
    day: day,
    aule: auleForDay
  });
}

  closeSidebar(): void {
    if (this.offcanvasInstance) {
      this.offcanvasInstance.hide();
    }
  }

  // Metodo per ottenere le aule in una specifica ora di un giorno
getAuleForHour(day: Date, hour: number): Aula[] {
  const dateString = this.formatDateToLocalString(day);
  return this.userClassrooms.filter(aula => {
    // Gestisce sia Date che string
    const aulaDateString = typeof aula.date === 'string'
      ? aula.date
      : this.formatDateToLocalString(aula.date);

    if (aulaDateString !== dateString) return false;

    // Parsing dell'orario
    const orario = aula.time; // 👈 time, non date
    let startHour: number;

    if (orario.toString().includes('-')) {
      const [start] = orario.toString().split('-');
      startHour = parseInt(start.split(':')[0]);
    } else {
      startHour = parseInt(orario.toString().split(':')[0]);
    }

    return startHour === hour;
  });
}

// Metodo per verificare se un giorno ha aule (per la vista settimanale)
hasAuleOnDay(day: Date): boolean {
   const dateString = this.formatDateToLocalString(day);
  return this.userClassrooms.some(aula => aula.date === day);
}

// Metodo per ottenere tutte le aule di un giorno (per la vista settimanale)
getAuleForDay(day: Date): Aula[] {
  const dateString = this.formatDateToLocalString(day);
  return this.userClassrooms.filter(aula => aula.date === day);
}

// Metodo per gestire il click sulla vista settimanale
onWeekDayClick(day: Date): void {
  const auleForDay = this.getAuleForDay(day);
  this.daySelected.emit({
    day: day,
    aule: auleForDay
  });
}

}
