import { ApplicationConfig, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LucideAngularModule, Trash2, CheckCircle, Circle, GripVertical, Plus, Loader2, Info, Sparkles, Mic, MicOff, Loader } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideAnimations(),
    importProvidersFrom(
      LucideAngularModule.pick({ Trash2, CheckCircle, Circle, GripVertical, Plus, Loader2, Info, Sparkles, Mic, MicOff, Loader })
    )
  ]
};
