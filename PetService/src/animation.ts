import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
export const fadeState = trigger('fadeState', [
  state(
    'hide',
    style({
      opacity: '0',
    })
  ),
  state(
    'show',
    style({
      opacity: '1',
    })
  ),
  transition('show => hide', animate('600ms ease-out')),
  transition('hide => show', animate('1000ms ease-in')),
]);
