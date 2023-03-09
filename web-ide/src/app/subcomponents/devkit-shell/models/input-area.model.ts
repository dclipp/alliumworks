import { HistoryQueryMatchModel } from './history-query-match.model';
import { Autocompleter } from './autocompleter.model';

export interface InputAreaModel {
    readonly viewKey: string;
    readonly textboxValue: string;
    readonly latestInput: string;
    readonly historyInputString: string;
    readonly historyInputRawBuffer: string;
    readonly autocompleter?: Autocompleter;
    readonly view: {
        showHistory: boolean,
        historyQueryMatches: Array<HistoryQueryMatchModel>,
        historySearch: string,
        selectedHistoryIndex: number,
        suggestedCompletion: string
    };
}

// showHistory: false,
//     // historicEntries: new Array<HistoricEntryModel>(),
//     historyQueryMatches: new Array<HistoryQueryMatchModel>(),
//     historySearch: '',
//     selectedHistoryIndex: 0,
//     suggestedCompletion: {
//       whitespaceBefore: false,
//       literal: ''
//     }
// history: {
//     left: 0,
//     top: 0
//   },
//   textboxInput: {
//     width: 2
//   },
//   suggestedCompletion: {
//     marginLeft: 0
//   }
// private readonly _latestInput = new BehaviorSubject<string>('');
// private readonly _scheduleSuggestion = new BehaviorSubject<number>(0);
// // private readonly _entries = new BehaviorSubject<Array<{
// //   readonly content: string;
// //   readonly timestamps: Array<number>
// // }>>([]);
// private readonly _historyInputString = new BehaviorSubject<string>('');
// private readonly _historyInputRawBuffer = new BehaviorSubject<string>('');
