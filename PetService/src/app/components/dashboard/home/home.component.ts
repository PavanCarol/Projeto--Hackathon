import { Component } from '@angular/core';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { MenuComponent } from '../../../menu/menu.component';
document.addEventListener('DOMContentLoaded', function () {
  let calendarEl: HTMLElement = document.getElementById('calendar')!;

  let calendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin],
    // options here
  });

  calendar.render();
});
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
