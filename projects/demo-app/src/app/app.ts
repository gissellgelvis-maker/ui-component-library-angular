import { Component } from '@angular/core';
import { Explorer } from './explorer/explorer';

@Component({
  imports: [Explorer],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
