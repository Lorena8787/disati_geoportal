import { Component } from '@angular/core';

import { MapComponent } from '../map/map.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { LoadingComponent } from "../loading/loading.component";

@Component({
  selector: 'app-main-view',
  standalone: true,
  imports: [
    MapComponent,
    SidebarComponent,
    LoadingComponent
  ],
  templateUrl: './main-view.component.html',
  styleUrl: './main-view.component.scss'
})
export class MainViewComponent {

}
