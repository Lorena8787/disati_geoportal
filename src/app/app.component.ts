import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { MainSidebarComponent } from "./components/main-sidebar/main-sidebar.component";
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatSidenavModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    MainSidebarComponent,
],   
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {

  public title = 'DISATI';

  constructor() { }

}
