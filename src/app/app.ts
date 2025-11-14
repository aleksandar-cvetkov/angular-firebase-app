import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatMenuModule} from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatMenuModule, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('angular-firebase-app');
}
