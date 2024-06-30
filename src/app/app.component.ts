import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { catchError, of } from "rxjs";
import { CommonModule } from '@angular/common';
import {AnalysisResult} from "./analysis.result.model";
import {AnalyzeText200Response, AnalyzeTextRequest} from "./api-client";

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
  letterType: 'consonants' | 'vowels' = 'vowels';
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

  analyzeOnline(letterType: AnalyzeTextRequest.LetterTypeEnum) {
    const url = 'http://localhost:8080/api/analyze';
    const request: AnalyzeTextRequest = {
      input: this.inputText,
      letterType: this.letterType,
    };

    console.log('Request:', request);

    this.http.post<AnalyzeText200Response>(url, request).pipe(
      catchError(error => {
        this.errorMessage = 'An error occurred: ' + error.message;
        console.error('Error:', error);
        return of({} as AnalyzeText200Response);
      })
    ).subscribe(response => {
      console.log('Response:', response);
      const sortedList = Object.entries(response.characterCount)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
      const result = new AnalysisResult(
        this.inputText,
        this.letterType,
        this.online,
        sortedList
      );
      this.lastResult = result;
    });
  }

  getLetterTypeDisplay(letterType: 'consonants' | 'vowels'): string {
    if (letterType === 'consonants') {
      return 'Consonant';
    }
    else if (letterType === 'vowels') {
      return 'Vowel';
    }
    else {
      // this should never be accessed
      return 'Unknown';
    }
  }
}
