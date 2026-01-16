import { inject, Injectable, NgZone } from "@angular/core";
import { NotificationService } from "../services/notification.service";
import { getFirebaseErrorMessage } from "../utils/firebase-error-mapper";

@Injectable()
export class GlobalErrorHandler  {
    private _notificationService = inject(NotificationService);
    private _zone = inject(NgZone);

    handleError(error: any): void {
        // 1. Log the error for developers
        console.error('Global Error Caught:', error);

        // 2. Extract a user-friendly message
        const message = getFirebaseErrorMessage(error);

        // 3. UI updates must run inside NgZone to ensure the SnackBar shows up
        this._zone.run(() => {
            this._notificationService.showError(message);
        });
    }
}