import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SwitchUserRoleService {

  private currentUserRoleSubject = new BehaviorSubject<string>('');

  setCurrentUserRole(role: string) {
    console.log('Hi triggered me', role);
    this.currentUserRoleSubject.next(role);
  }

  getCurrentUserRole$(): Observable<string> {
    return this.currentUserRoleSubject.asObservable();
  }
}
