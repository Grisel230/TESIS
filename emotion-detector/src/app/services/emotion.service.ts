import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmotionPrediction {
  emotion: string;
  confidence: number;
  all_predictions: { [key: string]: number };
  box?: [number, number, number, number];
}

@Injectable({
  providedIn: 'root'
})
export class EmotionService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) { }

  predictEmotion(imageData: string): Observable<EmotionPrediction[]> {
    return this.http.post<EmotionPrediction[]>(`${this.apiUrl}/predict`, { image: imageData });
  }
} 