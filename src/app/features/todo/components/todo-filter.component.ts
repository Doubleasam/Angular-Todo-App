import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoFilter } from '../../../core/models/todo.model';

@Component({
  selector: 'app-todo-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex border-b border-system-black">
      @for (option of options; track option.value) {
        <button 
          (click)="filterChange.emit(option.value)"
          [class.bg-system-black]="activeFilter === option.value"
          [class.text-system-white]="activeFilter === option.value"
          class="flex-1 py-2 text-xs uppercase tracking-widest font-bold hover:bg-system-grey-100 transition-colors"
          [class.hover:bg-system-grey-900]="activeFilter === option.value"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoFilterComponent {
  @Input({ required: true }) activeFilter: TodoFilter = 'all';
  @Output() filterChange = new EventEmitter<TodoFilter>();

  options: { label: string, value: TodoFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Done', value: 'completed' }
  ];
}
