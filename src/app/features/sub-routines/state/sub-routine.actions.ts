import { SubRoutine } from '@features/sub-routines/interfaces/sub-routine.interface';

export class GetSubRoutines {
  static readonly type = '[User] Get Routines';
  constructor(
    public readonly payload: {
      page: number;
      pageSize: number;
      searchQ?: string;
    },
  ) {}
}

export class GetSubRoutine {
  static readonly type = '[SubRoutine] Get SubRoutine';
  constructor(public readonly id: string) {}
}

export class SetSelectedSubRoutine {
  static readonly type = '[SubRoutine] Set Selected SubRoutine';
  constructor(public readonly subRoutine: SubRoutine | null) {}
}

export class SetSubRoutines {
  static readonly type = '[SubRoutine] Set SubRoutines';
  constructor(public readonly subRoutines: SubRoutine[]) {}
}

export class UpdateSubRoutine {
  static readonly type = '[SubRoutine] Update SubRoutine';
  constructor(
    public readonly id: string,
    public readonly subRoutine: SubRoutine,
  ) {}
}

export class DeleteSubRoutine {
  static readonly type = '[SubRoutine] Delete SubRoutine';
  constructor(public readonly id: string) {}
}

export class CreateSubRoutine {
  static readonly type = '[User] Create SubRoutine';
  constructor(public readonly subRoutine: SubRoutine) {}
}

export class UpdateSelectedSubRoutine {
  static readonly type = '[SubRoutine] Update Selected SubRoutine';
  constructor(public readonly subRoutine: SubRoutine) {}
}
