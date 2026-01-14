import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavMenu } from './core/layout/nav-menu/nav-menu';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavMenu],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('angular-firebase-app');
}
