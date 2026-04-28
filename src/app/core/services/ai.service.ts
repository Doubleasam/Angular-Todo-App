import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly http = inject(HttpClient);

  generateTasks(prompt: string): Observable<string[]> {
    return this.http.post<any>('/api/ai', {
      model: 'meta/llama-3.1-8b-instruct',
      messages: [
        {
          role: 'system',
          content: 'You are a task generator. Given a user prompt, return ONLY a JSON array of concise task strings. No explanation, no markdown, just the raw JSON array. Example: ["Task 1", "Task 2"]'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 300
    }).pipe(
      map(res => {
        const content: string = res.choices?.[0]?.message?.content ?? '[]';
        const match = content.match(/\[[\s\S]*?\]/);
        try { return match ? JSON.parse(match[0]) : []; }
        catch { return []; }
      })
    );
  }
}
