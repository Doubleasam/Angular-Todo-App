import { Injectable, computed, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Todo, TodoFilter, TodoState } from '../models/todo.model';
import { TodoRepository } from '../repositories/todo.repository';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TodoStore {
  private readonly repository = inject(TodoRepository);
  private readonly platformId = inject(PLATFORM_ID);

  private get isLocal(): boolean {
    return isPlatformBrowser(this.platformId) && window.location.hostname === 'localhost';
  }

  // Initialize synchronously from localStorage — no flash, no spinner
  private readonly state = signal<TodoState>({
    todos: isPlatformBrowser(inject(PLATFORM_ID)) ? inject(TodoRepository).getTodosSync() : [],
    filter: 'all',
    loading: false,
    error: null
  });

  // Selectors
  readonly todos = computed(() => this.state().todos);
  readonly filter = computed(() => this.state().filter);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  readonly filteredTodos = computed(() => {
    const todos = this.state().todos;
    const filter = this.state().filter;

    switch (filter) {
      case 'active':
        return todos.filter(t => !t.completed);
      case 'completed':
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  });

  readonly stats = computed(() => {
    const todos = this.state().todos;
    return {
      total: todos.length,
      active: todos.filter(t => !t.completed).length,
      completed: todos.filter(t => t.completed).length
    };
  });

  // Actions
  loadTodos() {
    if (!this.isLocal) return; // already loaded synchronously from localStorage
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.repository.getTodos()
      .pipe(finalize(() => this.state.update(s => ({ ...s, loading: false }))))
      .subscribe({
        next: (todos) => this.state.update(s => ({ ...s, todos })),
        error: () => this.state.update(s => ({ ...s, error: 'Failed to load todos' }))
      });
  }

  addTodo(title: string) {
    const currentTodos = this.state().todos;
    const maxOrder = currentTodos.length > 0 ? Math.max(...currentTodos.map(t => t.order)) : -1;
    
    this.repository.addTodo(title, maxOrder + 1).subscribe({
      next: (newTodo) => this.state.update(s => ({ 
        ...s, 
        todos: [...s.todos, newTodo] 
      })),
      error: () => this.state.update(s => ({ ...s, error: 'Failed to add todo' }))
    });
  }

  toggleTodo(id: string) {
    const todo = this.state().todos.find(t => t.id === id);
    if (!todo) return;

    // Optimistic Update
    const previousTodos = this.state().todos;
    this.state.update(s => ({
      ...s,
      todos: s.todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));

    this.repository.updateTodo(id, { completed: !todo.completed }).subscribe({
      error: () => {
        this.state.update(s => ({ ...s, todos: previousTodos, error: 'Failed to update todo' }));
      }
    });
  }

  deleteTodo(id: string) {
    const previousTodos = this.state().todos;
    this.state.update(s => ({
      ...s,
      todos: s.todos.filter(t => t.id !== id)
    }));

    this.repository.deleteTodo(id).subscribe({
      error: () => {
        this.state.update(s => ({ ...s, todos: previousTodos, error: 'Failed to delete todo' }));
      }
    });
  }

  setFilter(filter: TodoFilter) {
    this.state.update(s => ({ ...s, filter }));
  }

  clearCompleted() {
    const completedIds = this.state().todos.filter(t => t.completed).map(t => t.id);
    this.state.update(s => ({ ...s, todos: s.todos.filter(t => !t.completed) }));
    completedIds.forEach(id => this.repository.deleteTodo(id).subscribe());
  }

  updateOrder(todos: Todo[]) {
    this.state.update(s => ({ ...s, todos }));
  }
}
