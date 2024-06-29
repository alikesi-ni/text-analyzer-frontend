import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { catchError, Observable, ObservedValueOf, of } from "rxjs";
import { CommonModule } from '@angular/common';
import {AnalysisResult} from "./analysis.result.model";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class AppComponent {
  inputText: string = '';
  online: boolean = false;
  letterType: string = 'vowels';
  lastResult: AnalysisResult | null = null;
  errorMessage: string = '';
  sortedEntries: [string, number][] = [];

  constructor(private http: HttpClient) {}

  analyzeText() {
    if (this.online) {
      console.log('Online analyzing', this.letterType);
      this.analyzeOnline(this.letterType);
    } else {
      console.log('Offline analyzing', this.letterType);
    }
  }

  analyzeOnline(letterType: string) {
    const url = 'http://localhost:8080/api/analyze';
    const payload = {
      input: this.inputText,
      letterType: letterType
    };

    console.log('Request:', payload);

    this.http.post<{ [key: string]: number }>(url, payload).pipe(
      catchError(error => {
        this.errorMessage = 'An error occurred: ' + error.message;
        console.error('Error:', error);
        return of({});
      })
    ).subscribe(
      response => {
        console.log('Response:', response);
        const sortedEntries = Object.entries(response).sort((a, b) => a[0].localeCompare(b[0]));
        const result = new AnalysisResult(
          this.inputText,
          this.letterType,
          this.online,
          sortedEntries
        );
        this.lastResult = result;
      }
    );
  }

  getLetterTypeDisplay(letterType: string): string {
    if (letterType === 'consonants') {
      return 'Consonants';
    }
    else if (letterType === 'vowels') {
      return 'Vowels';
    }
    else {
      return 'Unknown';
    }
  }
}
