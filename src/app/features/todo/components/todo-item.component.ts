import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Todo } from '../../../core/models/todo.model';
import { LucideAngularModule, Trash2, CheckCircle, Circle, GripVertical } from 'lucide-angular';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div 
      class="group flex items-center gap-4 p-4 border-b border-system-black hover:bg-system-grey-100 transition-colors bg-system-white"
    >
      <div class="cursor-grab active:cursor-grabbing text-system-grey-400 group-hover:text-system-black transition-colors">
        <lucide-icon [name]="GripVertical" [size]="18"></lucide-icon>
      </div>

      <button 
        (click)="toggle.emit(todo.id)"
        class="flex-shrink-0 transition-transform active:scale-90"
      >
        @if (todo.completed) {
          <lucide-icon [name]="CheckCircle" class="text-system-black" [size]="20"></lucide-icon>
        } @else {
          <lucide-icon [name]="Circle" class="text-system-grey-400" [size]="20"></lucide-icon>
        }
      </button>

      <span 
        [class.line-through]="todo.completed"
        [class.text-system-grey-500]="todo.completed"
        class="flex-1 text-sm font-medium transition-all"
      >
        {{ todo.title }}
      </span>

      <button 
        (click)="delete.emit(todo.id)"
        class="opacity-0 group-hover:opacity-100 text-system-grey-400 hover:text-system-black transition-all p-1"
      >
        <lucide-icon [name]="Trash2" [size]="18"></lucide-icon>
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoItemComponent {
  @Input({ required: true }) todo!: Todo;
  @Output() toggle = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  readonly Trash2 = Trash2;
  readonly CheckCircle = CheckCircle;
  readonly Circle = Circle;
  readonly GripVertical = GripVertical;
}
