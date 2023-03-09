import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

const OPTIONS: {
  readonly base10: string;
  readonly base16: string;
  readonly ascii: string;
} = {
  base10: 'base10',
  base16: 'base16',
  ascii: 'ascii'
}

@Component({
  selector: 'aq4w-memory-searcher',
  templateUrl: './memory-searcher.component.html',
  styleUrls: ['./memory-searcher.component.scss']
})
export class MemorySearcherComponent implements OnInit {

  public view = {
    searchOptions: {
      opts: [{
        label: 'Numbers (base-10)',
        value: OPTIONS.base10
      }, {
        label: 'Numbers (base-16)',
        value: OPTIONS.base16
      }, {
        label: 'ASCII strings',
        value: OPTIONS.ascii
      }],
      initial: OPTIONS.base10
    },
    selectedOption: OPTIONS.base10,
    searchInProgress: false,
    searchValue: new FormControl()
  }

  public on = {
    optionChanged: (selection: string) => {
      this.view.selectedOption = selection;
    },
    beginSearch: () => {
      this.view.searchInProgress = true;
      window.setTimeout(() => {
        this.view.searchInProgress = false;
        alert('NOT IMPLEMENTED: Memory search');
      }, 4000)// TODO
    }
  }

  constructor() { }

  ngOnInit() {
  }

}
