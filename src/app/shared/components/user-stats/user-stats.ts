import { Component, computed, input } from '@angular/core';
import { UserProfile } from '../../../core/interface/user-profile.interface';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-user-stats',
  imports: [MatCardModule],
  templateUrl: './user-stats.html',
  styleUrl: './user-stats.scss',
})
export class UserStats {
  profile = input.required<UserProfile | null>();

  // 1. Пресметка на комплетност на профил
  completionPercentage = computed(() => {
    const u = this.profile();
    if (!u) return 0;

    const fields = [u.firstName, u.lastName, u.profession, u.bio, u.location, u.photoUrl];
    const filledFields = fields.filter(field => field !== null && field !== undefined && field !== '').length;
    
    return Math.round((filledFields / fields.length) * 100);
  });

  // 2. Пресметка на денови поминати како член
  daysAsMember = computed(() => {
    const u = this.profile();
    if (!u || !u.createdAt) return 0;

    const registrationDate = new Date(u.createdAt.seconds * 1000); // Претворање од Firestore Timestamp во JavaScript Date
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - registrationDate.getTime());
    
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  });
}
