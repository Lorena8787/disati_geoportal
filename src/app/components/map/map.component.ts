import { Component, Renderer2, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';

import { MapService } from '../../services/map.service';
import { PlataformService } from '../../services/plataform.service';
import { DataproviderService } from '../../services/dataprovider.service';

import { FloatingMenuComponent } from '../floating-menu/floating-menu.component';
import { RightPanelComponent } from '../right-panel/right-panel.component';
import { LoadingComponent } from "../loading/loading.component";

import { AppatMiembros } from '../../interfaces/appat-miembros';
import { CpciMiembros } from '../../interfaces/cpci-miembros';
import { CpciObservadores } from '../../interfaces/cpci-observadores';
import { DatosEncuesta } from '../../interfaces/datos-encuesta';

import ScaleLine from 'ol/control/ScaleLine';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatProgressSpinnerModule,
    MatIconModule,
    FormsModule,
    MatFormField,
    MatLabel,
    MatTooltipModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatTabsModule,
    FloatingMenuComponent,
    RightPanelComponent,
    LoadingComponent
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, AfterViewInit {

  public baseMaps: any[] = [];
  public loadingData: boolean = true;
  public drawerOpened: boolean = false;
  public cursorCoordinates: string = '';

  public aditionalData: any;
  public formattedData: any;
  public selectedProperties: any;

  constructor(
    private dataProviderService: DataproviderService,
    private plataformService: PlataformService,
    private mapService: MapService,
    private renderer: Renderer2,
    private elementRef: ElementRef,
  ) { }

  ngOnInit(): void {
    this.mapService.moreDataLoaded.subscribe((data: { paisid: number, selectedProperties: any }) => {
      if (data.paisid) {
        this.getMoreData(data.paisid);
        this.selectedProperties = data.selectedProperties;
      }
    });
  }

  ngAfterViewInit(): void {

    if (this.plataformService.isBrowser) {
      this.mapService.initializeMap();
      this.mapService.addVectorLayer();
      this.mapService.addOverlay();

      this.addCoordinates();
      this.addScale();
    }

  }

  private addScale() {
    // Escala barra lineal simple
    let scaleLineControl = new ScaleLine();
    this.mapService.map.addControl(scaleLineControl);
  }

  // Añade las coordenadas del mapa
  private addCoordinates(): void {
    this.mapService.map.on('pointermove', (event) => {
      let coordinates = this.mapService.map.getEventCoordinate(event.originalEvent);
      let [x, y] = coordinates;
      this.cursorCoordinates = `X: ${x.toFixed(0)}  Y: ${y.toFixed(0)}`;
    });
  }

  // Datos del para el panel derecho según elemento seleccionado
  private getMoreData(paisId: number): void {
    this.dataProviderService.getDataById(paisId).subscribe((data: {
      appat_miembros: AppatMiembros[], cpci_miembros: CpciMiembros[],
      cpci_observadores: CpciObservadores[], datos_encuesta: DatosEncuesta[]
    }) => {
      this.aditionalData = data;
      this.drawerOpened = true;
      this.formatData();
    })
  }

  // Mostrar la información en el panel derecho
  private formatData(): void {
    let datosEncuesta = this.aditionalData.datos_encuesta;
    let ordenesValidos = [1, 4, 7, 8, 15, 19, 40, 42, 110, 111, 112, 121, 122, 123, 124, 125, 131];
    let groupedData: { [key: number]: any } = {};

    datosEncuesta.forEach((miembro: any) => {
      if (ordenesValidos.includes(miembro.orden)) {
        if (!groupedData[miembro.orden]) {
          groupedData[miembro.orden] = {
            enunciado: miembro.enunciado,
            entidades: {}
          };
        }

        if (!groupedData[miembro.orden].entidades[miembro.nombre_entidad]) {
          groupedData[miembro.orden].entidades[miembro.nombre_entidad] = [];
        }

        if (miembro.respuesta) {
          groupedData[miembro.orden].entidades[miembro.nombre_entidad].push(miembro.respuesta);
        }
      }
    });

    this.formattedData = Object.keys(groupedData).map((orden: any) => {
      return {
        orden: parseInt(orden, 10),
        enunciado: groupedData[orden].enunciado,
        entidades: Object.keys(groupedData[orden].entidades).map(entidad => {
          return {
            entidad: entidad,
            respuestas: groupedData[orden].entidades[entidad]
          };
        })
      };
    });
  }

  // Accion de panel derecho cerrado
  public onDrawerClosed(): void {
    this.drawerOpened = false;
    this.mapService.resetFeatureStyle();
  }

  // Poner en mayúscula la primera letra
  public capitalizeFirstLetter(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

}
