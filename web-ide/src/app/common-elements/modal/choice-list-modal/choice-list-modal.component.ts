import { Component, OnInit } from '@angular/core';
import { ModalLauncher } from '../modal-launcher';
import { ChoiceListModalInput } from 'src/app/data-models/modal/choice-list-modal-input';
import { ChoiceListModalOutput } from 'src/app/data-models/modal/choice-list-modal-output';
import { ChoiceListModalOption } from 'src/app/data-models/modal/choice-list-modal-option';

@Component({
  selector: 'aq4w-choice-list-modal',
  templateUrl: './choice-list-modal.component.html',
  styleUrls: ['./choice-list-modal.component.scss']
})
export class ChoiceListModalComponent implements OnInit, ModalLauncher<ChoiceListModalInput, ChoiceListModalOutput> {

  public view = {
    isOpen: false,
    title: '',
    body: '',
    cancelButtonCaption: '',
    choices: new Array<ChoiceListModalOption>()
  }

  public on = {
    clickedNo: () => {
      this.closeModal();
    },
    clickedChoice: (value: string) => {
      this.closeModal(value);
    },
    backdropClicked: () => {
      //TODO
    }
  }

  public launch(data: ChoiceListModalInput, decision: (output: ChoiceListModalOutput) => void): void {
    this.view.title = data.title;
    this.view.body = data.body;
    this.view.cancelButtonCaption = data.cancelButtonCaption || 'Cancel';
    this.view.choices = data.choices;
    
    this._decision = (output) => {
      decision(output);
    }
    this.view.isOpen = true;
  }

  constructor() { }

  ngOnInit() {
  }

  private closeModal(value?: string): void {
    this.view.isOpen = false;
    const affirmative = !!value;
    this._decision({ affirmative: affirmative, choice: affirmative ? value : undefined });

    this.view.title = '';
    this.view.body = '';
    this.view.cancelButtonCaption = '';
    this.view.choices = [];
    this.view.isOpen = false;
    this._decision = undefined;
  }

  private _decision: ((output: ChoiceListModalOutput) => void) | undefined = undefined;

}
