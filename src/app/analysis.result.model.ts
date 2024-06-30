import {Observable, ObservedValueOf} from "rxjs";

export class AnalysisResult {
  constructor(
    public input: string,
    public letterType: 'consonants' | 'vowels',
    public online: boolean,
    public letterOccurenceList: [string, number][]
  ) {}
}
