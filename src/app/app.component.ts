import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
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

  constructor(private http: HttpClient) {}

  analyzeText() {
    this.flush()
    if (this.online) {
      console.log('Online analyzing', this.letterType);
      this.analyzeOnline();
    } else {
      console.log('Offline analyzing', this.letterType);
      this.analyzeOffline();
    }
  }

  analyzeOnline() {
    const url = 'http://localhost:8080/api/analyze';
    const request: AnalyzeTextRequest = {
      input: this.inputText,
      letterType: this.letterType,
    };

    console.log('Request:', request);

    this.http.post<AnalyzeText200Response>(url, request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.errorMessage = `The backend returned an unsuccessful response:
        Status: ${error.status}; Status text: ${error.statusText}.
        Please use the offline mode instead or try again later.`;
        console.error('Error:', error);
        return of(null);
      })
    ).subscribe(response => {
      console.log('Response:', response);
      if (response === null || response.characterCount == null) {
        this.errorMessage = 'Invalid response received from the server.';
        console.error('Error:', this.errorMessage);
        return;
      }
      const tempSortedLetterCount = Object.entries(response.characterCount)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
      const tempNonAttributableCharacters = response.nonAttributableCharacters ? response.nonAttributableCharacters : [];
      const result = new AnalysisResult(
        this.inputText,
        this.letterType,
        this.online,
        tempSortedLetterCount,
        tempNonAttributableCharacters
      );
      this.lastResult = result;
    });
  }

  private static readonly UPPER_CASE_VOWELS: string = 'AEIOU';
  private static readonly UPPER_CASE_CONSONANTS: string = 'BCDFGHJKLMNPQRSTVWXYZ';
  private static readonly ATTRIBUTABLE_CHARACTERS: string = AppComponent.UPPER_CASE_CONSONANTS + AppComponent.UPPER_CASE_CONSONANTS.toLowerCase() +
    AppComponent.UPPER_CASE_VOWELS + AppComponent.UPPER_CASE_VOWELS.toLowerCase();

  analyzeOffline() {
    const letterCount: Map<string, number> = new Map();
    const nonAttributableCharacters: Set<string> = new Set();

    const lettersToCheckAgainst: string = this.letterType === 'consonants'
      ? AppComponent.UPPER_CASE_CONSONANTS
      : AppComponent.UPPER_CASE_VOWELS;

    const input: string = this.inputText;

    for (let i = 0; i < input.length; i++) {
      const c: string = input.charAt(i);
      const lowerCaseCharacter: string = c.toLowerCase();
      if (AppComponent.ATTRIBUTABLE_CHARACTERS.indexOf(c) !== -1) {
        const index: number = lettersToCheckAgainst.toLowerCase().indexOf(lowerCaseCharacter);
        if (index !== -1) {
          const upperCaseCharacter: string = lettersToCheckAgainst.charAt(index);
          letterCount.set(upperCaseCharacter, (letterCount.get(upperCaseCharacter) || 0) + 1);
        }
      } else {
        nonAttributableCharacters.add(c);
      }
    }
    this.lastResult = new AnalysisResult(
      input,
      this.letterType,
      this.online,
      Array.from(letterCount.entries()).sort(([a], [b]) => a.localeCompare(b)),
      Array.from(nonAttributableCharacters)
    );
  }

  private flush() {
    this.lastResult = null;
    this.errorMessage = '';
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

  getDisplayableCharacters(characters: string[]): string[] {
    // Filter out whitespace characters and create a new array
    return characters.filter(character => character.trim().length > 0);
  }

}
