import { Component } from '@angular/core';
import { TodoContainerComponent } from './features/todo/todo.container';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TodoContainerComponent],
  template: `<app-todo-container></app-todo-container>`
})
export class AppComponent {}
