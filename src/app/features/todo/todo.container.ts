import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoStore } from '../../core/state/todo.store';
import { TodoInputComponent } from './components/todo-input.component';
import { TodoItemComponent } from './components/todo-item.component';
import { TodoFilterComponent } from './components/todo-filter.component';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { LucideAngularModule, Loader2, Info } from 'lucide-angular';

@Component({
  selector: 'app-todo-container',
  standalone: true,
  imports: [
    CommonModule,
    TodoInputComponent,
    TodoItemComponent,
    TodoFilterComponent,
    DragDropModule,
    LucideAngularModule
  ],
  template: `
    <div class="max-w-xl mx-auto py-12 px-6">
      <header class="mb-12">
        <h1 class="text-4xl font-black uppercase tracking-tighter border-b-4 border-system-black inline-block mb-2">
          Tasks
        </h1>
        <p class="text-system-grey-500 font-medium text-sm">Systemized Productivity</p>
      </header>

      <app-todo-input (add)="store.addTodo($event)" class="block mb-8"></app-todo-input>

      <div class="border-2 border-system-black bg-system-white">
        <app-todo-filter 
          [activeFilter]="store.filter()" 
          (filterChange)="store.setFilter($event)"
        ></app-todo-filter>

        <div 
          cdkDropList 
          (cdkDropListDropped)="onDrop($event)"
          class="min-h-[200px]"
        >
          @if (store.loading()) {
            <div class="flex flex-col items-center justify-center py-16 gap-3">
              <lucide-icon [name]="Loader2" class="animate-spin text-system-black" [size]="24"></lucide-icon>
              <span class="text-xs font-bold uppercase tracking-widest">Loading...</span>
            </div>
          } @else if (store.filteredTodos().length === 0) {
            <div class="flex flex-col items-center justify-center py-16 text-system-grey-400 gap-3">
              <lucide-icon [name]="Info" [size]="24"></lucide-icon>
              <span class="text-xs font-bold uppercase tracking-widest italic">No tasks found</span>
            </div>
          } @else {
            @for (todo of store.filteredTodos(); track todo.id) {
              <app-todo-item 
                cdkDrag 
                [todo]="todo"
                (toggle)="store.toggleTodo($event)"
                (delete)="store.deleteTodo($event)"
              ></app-todo-item>
            }
          }
        </div>

        <div class="p-4 bg-system-grey-100 flex items-center justify-between border-t border-system-black">
          <span class="text-[10px] font-bold uppercase tracking-widest text-system-grey-500">
            {{ store.stats().active }} Items Remaining
          </span>
          <button 
            (click)="store.clearCompleted()"
            class="text-[10px] font-black uppercase tracking-widest hover:underline"
          >
            Clear Completed
          </button>
        </div>
      </div>

      @if (store.error()) {
        <div class="mt-6 p-4 bg-system-black text-system-white text-xs font-bold uppercase tracking-widest text-center animate-bounce">
          {{ store.error() }}
        </div>
      }
    </div>
  `
})
export class TodoContainerComponent implements OnInit {
  readonly store = inject(TodoStore);
  readonly Loader2 = Loader2;
  readonly Info = Info;

  ngOnInit() {
    this.store.loadTodos();
  }

  onDrop(event: CdkDragDrop<string[]>) {
    const todos = [...this.store.todos()];
    moveItemInArray(todos, event.previousIndex, event.currentIndex);
    
    // Update local state and persist order
    const reordered = todos.map((t, i) => ({ ...t, order: i }));
    this.store.updateOrder(reordered);
  }
}
