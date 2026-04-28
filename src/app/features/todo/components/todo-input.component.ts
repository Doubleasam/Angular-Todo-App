import { Component, Output, EventEmitter, ChangeDetectionStrategy, signal, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Sparkles, Mic, MicOff, Loader } from 'lucide-angular';
import { AiService } from '../../../core/services/ai.service';

@Component({
  selector: 'app-todo-input',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="flex flex-col gap-2">
      <div class="relative">
        <input
          type="text"
          [(ngModel)]="title"
          (keyup.enter)="submit()"
          [placeholder]="listening() ? 'Listening...' : 'Add a task or ask AI...'"
          [class.bg-system-grey-100]="listening()"
          class="w-full bg-system-white border-2 border-system-black p-4 pr-28 text-sm font-bold placeholder:text-system-grey-400 transition-all"
        />
        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">

          <!-- Voice -->
          <button
            (click)="toggleVoice()"
            [title]="listening() ? 'Stop listening' : 'Speak a task'"
            class="p-1.5 transition-colors"
            [class.text-system-black]="listening()"
            [class.text-system-grey-400]="!listening()"
          >
            <lucide-icon [name]="listening() ? MicOff : Mic" [size]="18"></lucide-icon>
          </button>

          <!-- AI -->
          <button
            (click)="askAi()"
            [disabled]="!title.trim() || aiLoading()"
            title="Generate tasks with AI"
            class="p-1.5 text-system-grey-400 hover:text-system-black disabled:opacity-30 transition-colors"
          >
            <lucide-icon [name]="aiLoading() ? Loader : Sparkles" [size]="18" [class.animate-spin]="aiLoading()"></lucide-icon>
          </button>

          <!-- Add -->
          <button
            (click)="submit()"
            [disabled]="!title.trim()"
            class="p-1.5 bg-system-black text-system-white disabled:bg-system-grey-400 transition-colors"
          >
            <lucide-icon [name]="Plus" [size]="18"></lucide-icon>
          </button>

        </div>
      </div>

      @if (aiError()) {
        <p class="text-[10px] font-bold uppercase tracking-widest text-system-grey-500">{{ aiError() }}</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoInputComponent {
  @Output() add = new EventEmitter<string>();

  private readonly ai = inject(AiService);
  private readonly cdr = inject(ChangeDetectorRef);

  title = '';
  readonly listening = signal(false);
  readonly aiLoading = signal(false);
  readonly aiError = signal('');

  readonly Plus = Plus;
  readonly Sparkles = Sparkles;
  readonly Mic = Mic;
  readonly MicOff = MicOff;
  readonly Loader = Loader;

  private recognition: any = null;

  submit() {
    if (this.title.trim()) {
      this.add.emit(this.title.trim());
      this.title = '';
    }
  }

  askAi() {
    const prompt = this.title.trim();
    if (!prompt) return;
    this.aiLoading.set(true);
    this.aiError.set('');
    this.title = '';

    this.ai.generateTasks(prompt).subscribe({
      next: (tasks: string[]) => {
        tasks.forEach(t => this.add.emit(t));
        this.aiLoading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.aiError.set('AI unavailable. Try again.');
        this.aiLoading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  toggleVoice() {
    if (this.listening()) {
      this.listening.set(false);
      this.recognition?.stop();
      this.recognition = null;
      this.cdr.markForCheck();
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { this.aiError.set('Voice not supported.'); return; }

    this.recognition = new SR();
    this.recognition.lang = 'en-US';
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onstart = () => {
      this.listening.set(true);
      this.cdr.markForCheck();
    };

    this.recognition.onresult = (e: any) => {
      let transcript = '';
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      this.title = transcript;
      this.cdr.markForCheck();
    };

    this.recognition.onerror = (e: any) => {
      this.listening.set(false);
      this.recognition = null;
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        this.aiError.set('Voice unavailable.');
      }
      this.cdr.markForCheck();
    };

    this.recognition.onend = () => {
      this.listening.set(false);
      this.recognition = null;
      this.cdr.markForCheck();
    };

    try {
      this.recognition.start();
    } catch (err) {
      this.aiError.set('Mic access denied.');
      this.listening.set(false);
    }
  }
}
