import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LeftPanelComponent } from "../left-panel/left-panel.component";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatTooltipModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    LeftPanelComponent
],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})

export class SidebarComponent {
  
  public openPanel: boolean = false;
  public currentContent: string = '';

  public isActive(content: string): boolean {
    return this.currentContent === content;
  }

  public showPanel(content: string): void {
    this.currentContent = content;
    this.openPanel = true;
  }

  public hidePanel(): void {
    this.openPanel = false;
    this.currentContent = '';
  }

}
