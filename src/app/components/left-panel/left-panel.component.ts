import { Component, Input, Output, EventEmitter, ChangeDetectorRef, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';  
import { FormsModule } from '@angular/forms'; 

import { Fill, Stroke, Style } from 'ol/style';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { MapService } from '../../services/map.service';
import VectorLayer from 'ol/layer/Vector';

@Component({
  selector: 'app-left-panel',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatButtonModule, 
    MatIconModule, 
    MatTooltipModule,
    MatSlideToggleModule
  ],
  templateUrl: './left-panel.component.html',
  styleUrl: './left-panel.component.scss'
})
export class LeftPanelComponent implements OnChanges{
  
  @Input() activeContent: string = '';
  @Output() closePanelOutput = new EventEmitter<void>();

  public baseMaps: any[] = [];
  public filterAppat!: boolean;
  public filterCpci!: boolean;
  public layers: { name: string, layer: VectorLayer<any> }[] = [];
  public wmsLayers: any;
  
  constructor(
    private mapService: MapService,
    private cdr: ChangeDetectorRef,  
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeContent']) {
      this.panelOptions(changes['activeContent'].currentValue);
    }
  }

  public closePanel(): void {
    this.closePanelOutput.emit();
  }

  private panelOptions(menu: string): void {
      this.cdr.detectChanges();  // Asegura que la vista esté actualizada
      if (menu === 'layers') {
        setTimeout(() => { 
          this.mapService.updateLayerList();
          this.wmsLayers = this.mapService.wmsLayers;
        }, 0);
      } else if (menu == 'basemaps') {
        this.baseMaps = this.mapService.addBaseMaps();
      } else if (menu == 'filters') {
        this.layers = this.mapService.layers;
        
        this.filterAppat = this.mapService.checkFilters()[0];
        this.filterCpci = this.mapService.checkFilters()[1];
      } 
  }

  // Para el panel de mapas base
  public changeBaseMap(baseMap: any) {
    // Desactivar todas las capas del mapa
    this.mapService.map.getLayers().forEach((layer) => {
      if (layer && layer.getZIndex() !== 2) {
        layer.setVisible(false);
      }
    });
    // Desactivar todas las capas de mapas base
    this.baseMaps.forEach(map => {
      map.layer.setVisible(false);
      map.active = false;
    });
    // Activar la capa de mapa base seleccionada
    baseMap.layer.setVisible(true);
    baseMap.active = true;

    if (baseMap.name == 'ESRISatellite') {
      this.baseMaps.forEach(map2 => {
        if (map2.name == 'ESRISatelliteBoundaries') {
          map2.layer.setVisible(true);
          map2.active = true;
        }
      });
    } else {
      this.baseMaps.forEach(map2 => {
        if (map2.name == 'ESRISatelliteBoundaries') {
          map2.layer.setVisible(false);
          map2.active = false;
        }
      });
    }
  }

  // Para el panel de filtros
  public toggleFilter(type: string, event: any): void {
    if (type === 'appat') {
      this.filterAppat = event.checked;
    } else if (type === 'cpci') {
      this.filterCpci = event.checked;
    }
    this.mapService.applyFilters(this.filterAppat, this.filterCpci);
  }

  public isGroupVisible(groupName: string): any {
    if (this.mapService.wmsLayers.some(layer => layer.name == groupName && !layer.layer.state_.visible)) {
      return false;
    } else if (this.mapService.wmsLayers.filter(layer => layer.name == groupName).every(layer => layer.layer.state_.visible)) {
      return true;
    }
  }

  public isLayerVisible(selectedLayer: string): any {
    if (!this.mapService.wmsLayers.find((layer:any) => layer == selectedLayer).layer.state_.visible) {
      return false;
    } else if (this.mapService.wmsLayers.find((layer:any) => layer == selectedLayer).layer.state_.visible) {
      return true;
    }
  }

  public toggleGroupVisibility(event: Event, labelGroup:string): void {
    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked; // Este es el nuevo estado del checkbox (true si está marcado, false si no lo está)

    if (isChecked) {
      this.mapService.wmsLayers.filter(layer => layer.name === labelGroup).forEach((layer:any) => {
        layer.layer.setVisible(true);
      })
    } else {
      this.mapService.wmsLayers.filter(layer => layer.name === labelGroup).forEach((layer:any) => {
        layer.layer.setVisible(false);
      })
    }
  }

  public toggleLayerVisibility(selectedLayer: any): void {
    if (this.mapService.wmsLayers.find((layer:any) => layer == selectedLayer).layer.state_.visible) {
      this.mapService.wmsLayers.find((layer:any) => layer == selectedLayer).layer.setVisible(false);
    } else {
      this.mapService.wmsLayers.find((layer:any) => layer == selectedLayer).layer.setVisible(true);
    }
  }

  public zoomToGroup(group: any): void {
    if (group == 'catastroBogota') {
      this.mapService.map.getView().animate({
        center: [-8248945,514944],
        zoom: 14, 
        duration: 1000 // Duración en milisegundos
      });
    } else if (group == 'catastroEspaña') {
      this.mapService.map.getView().animate({
        center: [-41955, 4788465],
        zoom: 14, 
        duration: 1000 
      });
    }
  }
  
}
