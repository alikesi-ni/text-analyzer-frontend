import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  analyzeText() {
    // Placeholder method for analysis
    console.log('Online status:', this.online);
  }
}
