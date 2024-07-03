import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {AnalyzeText200Response} from "./api-client";

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: any;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, CommonModule, AppComponent], // Add AppComponent to imports
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify(); // Verify that there are no outstanding HTTP requests.
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should start analyzeOnline when online toggle is on and Analyze button is clicked', () => {
    const analyzeOnlineSpy = spyOn(component, 'analyzeOnline').and.callThrough();
    component.inputText = 'Dedalus';
    component.letterType = 'consonants';
    component.online = true;

    component.analyzeText();
    expect(analyzeOnlineSpy).toHaveBeenCalled();

    // Handle the HTTP request to avoid an open request error
    const request = httpTestingController.expectOne('http://localhost:8080/api/analyze');
    request.flush({
      characterCount: { 'D': 2, 'L': 1, 'S': 1 },
      nonAttributableCharacters: []
    } as AnalyzeText200Response);
  });

  it('should start analyzeOffline when online toggle is off and Analyze button is clicked', () => {
    const analyzeOfflineSpy = spyOn(component, 'analyzeOffline').and.callThrough();
    component.inputText = 'Dedalus';
    component.letterType = 'consonants';
    component.online = false;

    component.analyzeText();
    expect(analyzeOfflineSpy).toHaveBeenCalled();
  });

// Offline Tests
  it('should not display nonAttributableCharacters if they only contain whitespace characters offline', () => {
    component.inputText = 'a b\tc\nd'; // Input with whitespace characters
    component.letterType = 'consonants';
    component.analyzeOffline();

    fixture.detectChanges(); // Trigger change detection

    const compiled = fixture.nativeElement as HTMLElement;
    const nonAttributableCharactersDiv = compiled.querySelector('.text-info');
    expect(nonAttributableCharactersDiv).toBeNull(); // Ensure the div is not present as there are no non-whitespace non-attributable characters
  });

  it('should handle same upper and lower case consonant offline', () => {
    component.inputText = 'Dedalus';
    component.letterType = 'consonants';
    component.analyzeOffline();

    const result = component.lastResult;
    expect(result).toBeTruthy();
    expect(result?.letterCountList.find(([key]) => key === 'D')?.[1]).toBe(2);
  });

  it('should handle same upper and lower case vowel offline', () => {
    component.inputText = 'Information';
    component.letterType = 'vowels';
    component.analyzeOffline();

    const result = component.lastResult;
    expect(result).toBeTruthy();
    expect(result?.letterCountList.find(([key]) => key === 'I')?.[1]).toBe(2);
  });

  it('should handle Eszett offline', () => {
    component.inputText = 'Straße STRAẞE';
    component.letterType = 'consonants';
    component.analyzeOffline();

    const result = component.lastResult;
    expect(result).toBeTruthy();
    expect(result?.nonAttributableCharacters).toContain('ß');
    expect(result?.nonAttributableCharacters).toContain('ẞ');
    expect(result?.letterCountList.find(([key]) => key === 'S')?.[1]).toBe(2);
  });

  it('should handle Umlauts offline', () => {
    component.inputText = 'ÄÖÜäöü';
    component.letterType = 'vowels';
    component.analyzeOffline();

    const result = component.lastResult;
    expect(result).toBeTruthy();
    expect(result?.nonAttributableCharacters).toContain('Ä');
    expect(result?.nonAttributableCharacters).toContain('Ö');
    expect(result?.nonAttributableCharacters).toContain('Ü');
    expect(result?.letterCountList.find(([key]) => key === 'Ä')).toBeUndefined();
    expect(result?.letterCountList.find(([key]) => key === 'Ö')).toBeUndefined();
    expect(result?.letterCountList.find(([key]) => key === 'Ü')).toBeUndefined();
  });

  it('should handle non-Latin characters offline', () => {
    component.inputText = '我Ђ\u200Eओض';
    component.letterType = 'consonants';
    component.analyzeOffline();

    const result = component.lastResult;
    expect(result).toBeTruthy();
    const nonAttributableCharacters = result?.nonAttributableCharacters ?? [];
    expect(nonAttributableCharacters).toContain('我');
    expect(nonAttributableCharacters).toContain('Ђ');
    expect(nonAttributableCharacters).toContain('\u200E');
    expect(nonAttributableCharacters).toContain('ओ');
    expect(nonAttributableCharacters).toContain('ض');

    for (const character of nonAttributableCharacters) {
      expect(result?.letterCountList.find(([key]) => key === character)).toBeUndefined();
    }
  });

  it('should display "Consonant" in the table header if letterType is consonants offline', () => {
    component.inputText = 'Dedalus';
    component.letterType = 'consonants';
    component.analyzeOffline();

    fixture.detectChanges(); // Trigger change detection

    const compiled = fixture.nativeElement as HTMLElement;
    const tableHeader = compiled.querySelector('th');
    expect(tableHeader).toBeTruthy(); // Ensure the table header is present
    expect(tableHeader?.textContent).toContain('Consonant'); // Check if "Consonant" is displayed in the header
  });

  it('should display "Vowel" in the table header if letterType is vowels offline', () => {
    component.inputText = 'Dedalus';
    component.letterType = 'vowels';
    component.analyzeOffline();

    fixture.detectChanges(); // Trigger change detection

    const compiled = fixture.nativeElement as HTMLElement;
    const tableHeader = compiled.querySelector('th');
    expect(tableHeader).toBeTruthy(); // Ensure the table header is present
    expect(tableHeader?.textContent).toContain('Vowel'); // Check if "Vowel" is displayed in the header
  });

  // Online Tests
  it('should not display nonAttributableCharacters if they only contain whitespace characters online', () => {
    component.inputText = 'a b\tc\nd'; // Input with whitespace characters
    component.letterType = 'consonants';
    component.online = true;

    component.analyzeText();

    // Handle the HTTP request
    const request = httpTestingController.expectOne('http://localhost:8080/api/analyze');
    request.flush({
      characterCount: { 'A': 1, 'B': 1, 'C': 1, 'D': 1 },
      nonAttributableCharacters: [' ', '\t', '\n']
    } as AnalyzeText200Response);

    fixture.detectChanges(); // Trigger change detection

    const compiled = fixture.nativeElement as HTMLElement;
    const nonAttributableCharactersDiv = compiled.querySelector('.text-info');
    expect(nonAttributableCharactersDiv).toBeNull(); // Ensure the div is not present as there are no non-whitespace non-attributable characters
  });

  it('should handle same upper and lower case consonant online', () => {
    component.inputText = 'Dedalus';
    component.letterType = 'consonants';
    component.online = true;
    component.analyzeText();

    const request = httpTestingController.expectOne('http://localhost:8080/api/analyze');
    expect(request.request.method).toEqual('POST');
    request.flush({
      characterCount: { 'D': 2, 'L': 1, 'S': 1 },
      nonAttributableCharacters: []
    } as AnalyzeText200Response);

    const result = component.lastResult;
    expect(result).toBeTruthy();
    expect(result?.letterCountList.find(([key]) => key === 'D')?.[1]).toBe(2);
  });

  it('should handle same upper and lower case vowel online', () => {
    component.inputText = 'Information';
    component.letterType = 'vowels';
    component.online = true;
    component.analyzeText();

    const request = httpTestingController.expectOne('http://localhost:8080/api/analyze');
    expect(request.request.method).toEqual('POST');
    request.flush({
      characterCount: { 'I': 2, 'N': 1, 'T': 1 },
      nonAttributableCharacters: []
    } as AnalyzeText200Response);

    const result = component.lastResult;
    expect(result).toBeTruthy();
    expect(result?.letterCountList.find(([key]) => key === 'I')?.[1]).toBe(2);
  });

  it('should handle Eszett online', () => {
    component.inputText = 'Straße STRAẞE';
    component.letterType = 'consonants';
    component.online = true;
    component.analyzeText();

    const request = httpTestingController.expectOne('http://localhost:8080/api/analyze');
    expect(request.request.method).toEqual('POST');
    request.flush({
      characterCount: { 'S': 2 },
      nonAttributableCharacters: ['ß', 'ẞ']
    } as AnalyzeText200Response);

    const result = component.lastResult;
    expect(result).toBeTruthy();
    expect(result?.nonAttributableCharacters).toContain('ß');
    expect(result?.nonAttributableCharacters).toContain('ẞ');
    expect(result?.letterCountList.find(([key]) => key === 'S')?.[1]).toBe(2);
  });

  it('should handle Umlauts online', () => {
    component.inputText = 'ÄÖÜäöü';
    component.letterType = 'vowels';
    component.online = true;
    component.analyzeText();

    const request = httpTestingController.expectOne('http://localhost:8080/api/analyze');
    expect(request.request.method).toEqual('POST');
    request.flush({
      characterCount: {},
      nonAttributableCharacters: ['Ä', 'Ö', 'Ü']
    } as AnalyzeText200Response);

    const result = component.lastResult;
    expect(result).toBeTruthy();
    expect(result?.nonAttributableCharacters).toContain('Ä');
    expect(result?.nonAttributableCharacters).toContain('Ö');
    expect(result?.nonAttributableCharacters).toContain('Ü');
    expect(result?.letterCountList.find(([key]) => key === 'Ä')).toBeUndefined();
    expect(result?.letterCountList.find(([key]) => key === 'Ö')).toBeUndefined();
    expect(result?.letterCountList.find(([key]) => key === 'Ü')).toBeUndefined();
  });

  it('should handle non-Latin characters online', () => {
    component.inputText = '我Ђ\u200Eओض';
    component.letterType = 'consonants';
    component.online = true;
    component.analyzeText();

    const request = httpTestingController.expectOne('http://localhost:8080/api/analyze');
    expect(request.request.method).toEqual('POST');
    request.flush({
      characterCount: {},
      nonAttributableCharacters: ['我', 'Ђ', '\u200E', 'ओ', 'ض']
    } as AnalyzeText200Response);

    const result = component.lastResult;
    expect(result).toBeTruthy();
    const nonAttributableCharacters = result?.nonAttributableCharacters ?? [];
    expect(nonAttributableCharacters).toContain('我');
    expect(nonAttributableCharacters).toContain('Ђ');
    expect(nonAttributableCharacters).toContain('\u200E');
    expect(nonAttributableCharacters).toContain('ओ');
    expect(nonAttributableCharacters).toContain('ض');

    for (const character of nonAttributableCharacters) {
      expect(result?.letterCountList.find(([key]) => key === character)).toBeUndefined();
    }
  });

  it('should display table when result is present offline', () => {
    component.inputText = 'Dedalus';
    component.letterType = 'consonants';
    component.analyzeOffline();

    fixture.detectChanges(); // Trigger change detection

    const compiled = fixture.nativeElement as HTMLElement;
    const table = compiled.querySelector('table');
    expect(table).toBeTruthy(); // Check if the table is present

    const rows = table?.querySelectorAll('tbody tr');
    expect(rows?.length).toBeGreaterThan(0); // Check if there are rows in the table
  });

  it('should display table when result is present even if nonAttributableCharacters is not sent in the response', () => {
    component.inputText = 'Dedalus';
    component.letterType = 'consonants';
    component.online = true;
    component.analyzeText();

    const request = httpTestingController.expectOne('http://localhost:8080/api/analyze');
    expect(request.request.method).toEqual('POST');
    request.flush({
      characterCount: { 'D': 2, 'L': 1, 'S': 1 }
      // nonAttributableCharacters is not sent
    } as AnalyzeText200Response);

    fixture.detectChanges(); // Trigger change detection

    const compiled = fixture.nativeElement as HTMLElement;
    const table = compiled.querySelector('table');
    expect(table).toBeTruthy(); // Check if the table is present

    const rows = table?.querySelectorAll('tbody tr');
    expect(rows?.length).toBeGreaterThan(0); // Check if there are rows in the table

    const firstRowCells = rows?.[0].querySelectorAll('td');
    expect(firstRowCells?.[0].textContent).toContain('D');
    expect(firstRowCells?.[1].textContent).toContain('2');
  });

  it('should display error message if characterCount is null in the response', () => {
    component.inputText = 'Dedalus';
    component.letterType = 'consonants';
    component.online = true;
    component.analyzeText();

    const request = httpTestingController.expectOne('http://localhost:8080/api/analyze');
    expect(request.request.method).toEqual('POST');

    // Simulate a response with null characterCount
    request.flush({
      characterCount: null,
      nonAttributableCharacters: ['!']
    } as unknown as AnalyzeText200Response);

    fixture.detectChanges(); // Trigger change detection

    const compiled = fixture.nativeElement as HTMLElement;
    const errorMessageDiv = compiled.querySelector('#errorDiv');
    expect(errorMessageDiv).toBeTruthy(); // Check if the error message div is present
    expect(errorMessageDiv?.textContent).toContain('Invalid response received from the server.');
  });

  it('should display error message if an unrelated response is sent', () => {
    component.inputText = 'Dedalus';
    component.letterType = 'consonants';
    component.online = true;
    component.analyzeText();

    const request = httpTestingController.expectOne('http://localhost:8080/api/analyze');
    expect(request.request.method).toEqual('POST');

    // Simulate an unrelated XML response
    request.flush('<response><message>Unexpected response</message></response>', { status: 200, statusText: 'OK' });

    fixture.detectChanges(); // Trigger change detection

    const compiled = fixture.nativeElement as HTMLElement;
    const errorMessageDiv = compiled.querySelector('#errorDiv');
    expect(errorMessageDiv).toBeTruthy(); // Check if the error message div is present
    expect(errorMessageDiv?.textContent).toContain('Invalid response received from the server.');
  });

});
