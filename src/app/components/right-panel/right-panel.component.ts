import { Component, Input, Output, EventEmitter, ViewChild, OnInit } from '@angular/core';
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
import { MatButtonModule } from '@angular/material/button';
import { MatDrawer } from '@angular/material/sidenav';


@Component({
  selector: 'app-right-panel',
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
    MatButtonModule
  ],
  templateUrl: './right-panel.component.html',
  styleUrl: './right-panel.component.scss'
})
export class RightPanelComponent implements OnInit {
  @Input() drawerOpened: boolean = false;
  @Input() selectedProperties: any;
  @Input() formattedData: any;
  @Input() aditionalData: any;

  @Output() drawerClosed = new EventEmitter<void>();
  @ViewChild('drawer') drawer: MatDrawer | undefined;

  constructor() { }

  ngOnInit(): void { }

  public closePanel(): void {
    this.drawerOpened = false;
    this.drawerClosed.emit();
  }

  capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
