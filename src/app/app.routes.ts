import { Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { MainViewComponent } from './components/main-view/main-view.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { HelpComponent } from './components/help/help.component';

export const routes: Routes = [
    {path: 'inicio', component: HomeComponent},
    {path: 'geoportal-disati', component: MainViewComponent},
    {path: 'sobre-nosotros', component: AboutUsComponent},
    {path: 'ayuda', component: HelpComponent},
    {path: '', redirectTo: '/geoportal-disati', pathMatch: 'full'},
];
