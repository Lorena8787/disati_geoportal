import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CatastrosIbero } from '../interfaces/catastros-ibero';
import { PaisesIbero } from '../interfaces/paises-ibero';
import { DatosEncuesta } from '../interfaces/datos-encuesta';
import { CpciObservadores } from '../interfaces/cpci-observadores';
import { CpciMiembros } from '../interfaces/cpci-miembros';
import { AppatMiembros } from '../interfaces/appat-miembros';

import { environment } from '../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class DataproviderService {

  private apiUrl = environment.apiUrl;


  constructor( private http: HttpClient ) { }
  
  public getCatastrosIberoamerica(): Observable<CatastrosIbero[]> {
    let url = this.apiUrl + 'catastros_iberoamerica/'
    return this.http.get<any[]>(url);
  }

  public getPaisesIberoamerica(): Observable<PaisesIbero[]> {
    let url = this.apiUrl + 'paises_iberoamerica/'
    return this.http.get<any[]>(url);
  }

  public getDataById(id:number): Observable<{appat_miembros: AppatMiembros[], cpci_miembros: CpciMiembros[], 
                                            cpci_observadores: CpciObservadores[], datos_encuesta: DatosEncuesta[]}> {
    let url = this.apiUrl + `datos/${id}/`;
    return this.http.get<{appat_miembros: AppatMiembros[], cpci_miembros: CpciMiembros[], 
      cpci_observadores: CpciObservadores[], datos_encuesta: DatosEncuesta[]}>(url);
  }

}
