import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Todo } from '../models/todo.model';

const LS_KEY = 'todos';

const SEED: Todo[] = [
  { id: '1', title: 'Reply to emails', completed: false, order: 0 },
  { id: '2', title: 'Buy groceries', completed: false, order: 1 },
  { id: '3', title: 'Schedule dentist appointment', completed: false, order: 2 },
  { id: '4', title: 'Pay electricity bill', completed: true, order: 3 },
  { id: '5', title: 'Call mom', completed: false, order: 4 },
];

@Injectable({ providedIn: 'root' })
export class TodoRepository {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private get isLocal(): boolean {
    return isPlatformBrowser(this.platformId) && window.location.hostname === 'localhost';
  }

  private readonly apiUrl = 'http://localhost:3000/todos';

  private lsRead(): Todo[] | null {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  private lsWrite(todos: Todo[]): void {
    try { localStorage.setItem(LS_KEY, JSON.stringify(todos)); } catch {}
  }

  private lsGet(): Todo[] {
    const stored = this.lsRead();
    if (stored !== null) return stored;
    const seed = SEED.map(t => ({ ...t }));
    this.lsWrite(seed);
    return seed;
  }

  private lsUpdate(fn: (todos: Todo[]) => Todo[]): void {
    this.lsWrite(fn(this.lsGet()));
  }

  getTodosSync(): Todo[] {
    return this.lsGet();
  }

  getTodos(): Observable<Todo[]> {
    if (!this.isLocal) return of(this.lsGet());
    return this.http.get<Todo[]>(`${this.apiUrl}?_sort=order`).pipe(
      catchError(() => of(this.lsGet()))
    );
  }

  addTodo(title: string, order: number): Observable<Todo> {
    const todo: Todo = { id: crypto.randomUUID(), title, completed: false, order };
    if (!this.isLocal) {
      this.lsUpdate(todos => [...todos, todo]);
      return of(todo);
    }
    return this.http.post<Todo>(this.apiUrl, todo).pipe(
      catchError(() => { this.lsUpdate(todos => [...todos, todo]); return of(todo); })
    );
  }

  updateTodo(id: string, changes: Partial<Todo>): Observable<Todo> {
    let updated!: Todo;
    this.lsUpdate(todos => todos.map(t => {
      if (t.id === id) { updated = { ...t, ...changes }; return updated; }
      return t;
    }));
    if (!this.isLocal) return of(updated);
    return this.http.patch<Todo>(`${this.apiUrl}/${id}`, changes).pipe(
      catchError(() => of(updated))
    );
  }

  deleteTodo(id: string): Observable<void> {
    this.lsUpdate(todos => todos.filter(t => t.id !== id));
    if (!this.isLocal) return of(void 0);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(void 0))
    );
  }
}
