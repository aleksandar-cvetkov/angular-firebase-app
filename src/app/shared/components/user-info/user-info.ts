import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { UserProfile } from '../../../core/interface/user-profile.interface';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-user-info',
  imports: [MatCardModule, RouterModule, MatButtonModule],
  templateUrl: './user-info.html',
  styleUrl: './user-info.scss',
})
export class UserInfo {
  profile = input.required<UserProfile | null>();
  isOwner = input.required<boolean>();
}
