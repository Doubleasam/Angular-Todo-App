export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

export type TodoFilter = 'all' | 'active' | 'completed';

export interface TodoState {
  todos: Todo[];
  filter: TodoFilter;
  loading: boolean;
  error: string | null;
}
