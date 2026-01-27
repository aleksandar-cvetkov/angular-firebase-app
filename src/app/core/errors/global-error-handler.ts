import { inject, Injectable, NgZone } from "@angular/core";
import { NotificationService } from "../services/notification.service";
import { getFirebaseErrorMessage } from "../utils/firebase-error-mapper";

@Injectable()
export class GlobalErrorHandler  {
    private _notificationService = inject(NotificationService);
    private _zone = inject(NgZone);

    handleError(error: any): void {
        // 1. Логирај ја грешката за развивачите
        // console.error('Global Error Caught:', error);

        // 2. Extract a user-friendly message
        // 2. Извлечи пријателска порака за корисникот
        const message = getFirebaseErrorMessage(error);

        // 3. Ажурирањата на корисничкиот интерфејс мора да се извршуваат внатре во NgZone за да се осигура дека SnackBar ќе се прикаже
        this._zone.run(() => {
            this._notificationService.showError(message);
        });
    }
}