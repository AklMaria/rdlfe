export interface Aula{
    id: number;
    name: string;
    description: string;
    maxSeats: number;
    availableSeats: number;
    date: Date;
    time : string;
    duration : number;
    isActive: boolean;
    link: string;
}
export interface Utente{
    firstName?: string;
    lastName?: string;
    id?: number;
    username?: string;
    password?: string;
    image?: string;
    email?: string;
    birthDate?: string;
    role?: string;
    state?: boolean;
    credits?: number;
}

export interface UserRegistered {
  id: number;
  username: string;
  email: string;
}

export interface ClassroomRegistration {
  classroomId: number;
  name: string;
  description: string;
  totalUsers: number;
  users: UserRegistered[];
}


export interface Registration {
  userId: number;
  classroomId : number;
}
