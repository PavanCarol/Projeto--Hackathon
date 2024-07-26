import { Calendar } from '@fullcalendar/core';
import { Component, OnInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendario',
  standalone: false,
  templateUrl: './calendario.component.html',
  styleUrl: './calendario.component.scss',
})
export class CalendarioComponent implements OnInit {
  ngOnInit(): void {
    let calendarEl: HTMLElement = document.getElementById('calendar')!;
    let calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin],
      // options here
    });
    calendar.render();
  }
}
