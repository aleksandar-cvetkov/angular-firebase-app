import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserProfile } from '../../core/interface/user-profile.interface';
import { UserProfileService } from '../../core/service/user-profile.service';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './profile-view.html',
  styleUrl: './profile-view.scss'
})
export class ProfileView implements OnInit {
  userProfile$!: Observable<UserProfile | null>;

  private _userProfileService = inject(UserProfileService);

  ngOnInit(): void {
    this.userProfile$ = this._userProfileService.getCurrentUserProfile();

    this.userProfile$.subscribe(value => {
      console.log('userProfile value:', value);
    });
  }
}
