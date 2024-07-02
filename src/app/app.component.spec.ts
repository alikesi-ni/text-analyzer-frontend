import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  it('should handle same upper and lower case consonant', () => {
    component.inputText = 'Dedalus';
    component.letterType = 'consonants';
    component.analyzeOffline();

    const result = component.lastResult;
    expect(result).toBeTruthy();
    expect(result?.letterCountList.find(([key]) => key === 'D')?.[1]).toBe(2);
  });

  it('should handle same upper and lower case vowel', () => {
    component.inputText = 'Information';
    component.letterType = 'vowels';
    component.analyzeOffline();

    const result = component.lastResult;
    expect(result).toBeTruthy();
    expect(result?.letterCountList.find(([key]) => key === 'I')?.[1]).toBe(2);
  });

  it('should handle Eszett', () => {
    component.inputText = 'Straße STRAẞE';
    component.letterType = 'consonants';
    component.analyzeOffline();

    const result = component.lastResult;
    expect(result).toBeTruthy();
    expect(result?.nonAttributableCharacters).toContain('ß');
    expect(result?.nonAttributableCharacters).toContain('ẞ');
    expect(result?.letterCountList.find(([key]) => key === 'S')?.[1]).toBe(2);
  });

  it('should handle Umlauts', () => {
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

  it('should handle non-Latin characters', () => {
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

  it('should display table when result is present', () => {
    component.inputText = 'Dedalus';
    component.letterType = 'consonants';
    component.analyzeOffline();

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

  it('should display nonAttributableCharacters if present', () => {
    component.inputText = '?Dedalus!';
    component.letterType = 'consonants';
    component.analyzeOffline();

    fixture.detectChanges(); // Trigger change detection

    const compiled = fixture.nativeElement as HTMLElement;
    const nonAttributableCharactersDiv = compiled.querySelector('.text-info');
    expect(nonAttributableCharactersDiv).toBeTruthy(); // Check if the div is present
    expect(nonAttributableCharactersDiv?.textContent).toContain(
      'The following characters could not be attributed to any category:'
    );
    expect(nonAttributableCharactersDiv?.textContent).toContain(
      component.lastResult?.nonAttributableCharacters.join(' ')
    );
  });

  it('should not display nonAttributableCharacters if none are present', () => {
    component.inputText = 'Dedalus';
    component.letterType = 'consonants';
    component.analyzeOffline();

    fixture.detectChanges(); // Trigger change detection

    const compiled = fixture.nativeElement as HTMLElement;
    const nonAttributableCharactersDiv = compiled.querySelector('.text-info');
    expect(nonAttributableCharactersDiv).toBeNull(); // Ensure the div is not present as there are no non-attributable characters
  });

  it('should display "Consonant" in the table header if letterType is consonants for analyzeOffline', () => {
    component.inputText = 'Dedalus';
    component.letterType = 'consonants';
    component.analyzeOffline();

    fixture.detectChanges(); // Trigger change detection

    const compiled = fixture.nativeElement as HTMLElement;
    const tableHeader = compiled.querySelector('th');
    expect(tableHeader).toBeTruthy(); // Ensure the table header is present
    expect(tableHeader?.textContent).toContain('Consonant'); // Check if "Consonant" is displayed in the header
  });

  it('should display "Vowel" in the table header if letterType is vowels for analyzeOffline', () => {
    component.inputText = 'Dedalus';
    component.letterType = 'vowels';
    component.analyzeOffline();

    fixture.detectChanges(); // Trigger change detection

    const compiled = fixture.nativeElement as HTMLElement;
    const tableHeader = compiled.querySelector('th');
    expect(tableHeader).toBeTruthy(); // Ensure the table header is present
    expect(tableHeader?.textContent).toContain('Vowel'); // Check if "Vowel" is displayed in the header
  });


});
