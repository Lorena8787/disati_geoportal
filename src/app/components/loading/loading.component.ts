import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatProgressBarModule } from '@angular/material/progress-bar';

import { MapService } from '../../services/map.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {
  
  public loadingData: boolean = true;

  constructor(private mapService: MapService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.mapService.dataLoaded.subscribe((isLoaded: boolean) => {
      this.loadingData = !isLoaded;
      this.cdr.detectChanges();  // Fuerza la detección de cambios
    });
  }
}
