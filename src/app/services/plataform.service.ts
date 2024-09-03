import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlataformService {

  isBrowser: boolean;

  constructor() {
    this.isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
  }
}
