import { Component } from '@angular/core';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  // Para abrir enlace disati - botón saber más 
  openURL() {
    window.open('https://ccasat.webs.upv.es/2023/11/28/disati-diagnostico-sobre-la-situacion-del-sistema-del-territorio-en-iberoamerica/', '_blank');
  }

}
