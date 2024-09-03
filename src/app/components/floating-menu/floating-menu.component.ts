import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChangeDetectorRef } from '@angular/core';

import { MapService } from '../../services/map.service';

@Component({
  selector: 'app-floating-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './floating-menu.component.html',
  styleUrl: './floating-menu.component.scss'
})
export class FloatingMenuComponent {

  isPanelVisible: boolean = false;

  public selectedMenu: 'info' | null = null;

  constructor(private cdr: ChangeDetectorRef,
    private mapService: MapService) { }


  // Menú de botones flotantes
  public toggleFloatingPanel(menu: 'info'): void {
    this.isPanelVisible = !this.isPanelVisible;
    if (this.selectedMenu === menu) {
      this.selectedMenu = null; // Cerrar el panel si se hace clic en el mismo botón
    } else {
      this.selectedMenu = menu;
      this.cdr.detectChanges();  // Asegurar que la vista esté actualizada
      if (menu === 'info') {
      }
    }
  }

  // Click en el boton Home - Zoom a vista inicial
  public resetMap(): void {
    this.mapService.map.getView().animate({
      //center: [-35.3, -4.2],
      center: [-2519117, -1161798], //EPSG:3857
      zoom: 2.8,
      duration: 500 // 500 ms
    });
  }

  // Para abrir enlace disati - botón saber más 
  public abrirEnlace(): void {
    window.open('https://ccasat.webs.upv.es/2023/11/28/disati-diagnostico-sobre-la-situacion-del-sistema-del-territorio-en-iberoamerica/', '_blank');
  }

}
