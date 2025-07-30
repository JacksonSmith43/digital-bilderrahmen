import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { environment } from '../environments/environment';
import { NavbarComponent } from "./navbar/navbar.component";

@Component({
  selector: 'app-root',
  imports: [RouterModule, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  isProd = environment.prod; // Is it the production environment. 
}

