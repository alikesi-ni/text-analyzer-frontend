import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [FormsModule]
})
export class AppComponent {
  inputText: string = '';
  online: boolean = false;
  letterType: string = 'Vowels';

  constructor(private http: HttpClient) {}

  analyzeText() {
    console.log('Online status:', this.online, 'Letter type:', this.letterType);
    if (this.online) {
      console.log('Analyzing online...');
      this.analyzeOnline(this.letterType);
    } else {
      console.log('Analyzing offline...');
    }
  }

  analyzeOnline(letterType: string) {
    const url = 'http://localhost:8080/api/analyze';  // Replace with your backend URL
    const payload = {
      input: this.inputText,
      letterType: letterType
    };

    this.http.post(url, payload).subscribe(response => {
      console.log('Response:', response);
    });
  }
}
