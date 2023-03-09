import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'aq4w-top-section',
  templateUrl: './top-section.component.html',
  styleUrls: ['./top-section.component.scss']
})
export class TopSectionComponent implements OnInit {

  @Output('mobileToggleSidebar')
  public readonly mobileToggleSidebar = new EventEmitter<void>();
  
  constructor() { }

  ngOnInit() {
  }

}
