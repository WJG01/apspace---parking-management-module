import gql from 'graphql-tag';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
};




export type Attendance = {
   __typename?: 'Attendance',
  schedule: Schedule,
  secret: Scalars['String'],
  markedBy: Scalars['String'],
  lecturer: Scalars['String'],
  created: Scalars['String'],
  modified?: Maybe<Scalars['String']>,
  startTime: Scalars['String'],
  endTime: Scalars['String'],
  validUntil: Scalars['String'],
  classCode: Scalars['String'],
  classType?: Maybe<Scalars['String']>,
  students: Array<Status>,
};

export type Mutation = {
   __typename?: 'Mutation',
  initAttendance: Attendance,
  markAttendance: Status,
  updateAttendance: Status,
};


export type MutationInitAttendanceArgs = {
  schedule: ScheduleInput
};


export type MutationMarkAttendanceArgs = {
  schedule: ScheduleInput,
  student: Scalars['String'],
  attendance: Scalars['String']
};


export type MutationUpdateAttendanceArgs = {
  otp: Scalars['String']
};

export type Query = {
   __typename?: 'Query',
  attendance?: Maybe<Attendance>,
};


export type QueryAttendanceArgs = {
  schedule: ScheduleInput
};

export type Schedule = {
   __typename?: 'Schedule',
  classcode: Scalars['String'],
  date: Scalars['String'],
  startTime: Scalars['String'],
  endTime: Scalars['String'],
  classType: Scalars['String'],
};

export type ScheduleInput = {
  classcode: Scalars['String'],
  date: Scalars['String'],
  startTime: Scalars['String'],
  endTime: Scalars['String'],
  classType: Scalars['String'],
};

export type Schema = {
   __typename?: 'schema',
  query?: Maybe<Query>,
  mutation?: Maybe<Mutation>,
  subscription?: Maybe<Subscription>,
};

export type Status = {
   __typename?: 'Status',
  id: Scalars['String'],
  name: Scalars['String'],
  userArn: Scalars['String'],
  attendance: Scalars['String'],
  lastModified: Scalars['String'],
  modifiedBy: Scalars['String'],
  internalIP: Scalars['String'],
  externalIP: Scalars['String'],
  schedule: Schedule,
};

export type Subscription = {
   __typename?: 'Subscription',
  newStatus?: Maybe<Status>,
};


export type SubscriptionNewStatusArgs = {
  schedule: ScheduleInput
};
export type AttendanceQueryVariables = {
  schedule: ScheduleInput
};


export type AttendanceQuery = (
  { __typename?: 'Query' }
  & { attendance: Maybe<(
    { __typename?: 'Attendance' }
    & Pick<Attendance, 'secret'>
    & { students: Array<(
      { __typename?: 'Status' }
      & Pick<Status, 'id' | 'name' | 'attendance'>
    )> }
  )> }
);

export type InitAttendanceMutationVariables = {
  schedule: ScheduleInput
};


export type InitAttendanceMutation = (
  { __typename?: 'Mutation' }
  & { attendance: (
    { __typename?: 'Attendance' }
    & Pick<Attendance, 'secret'>
    & { students: Array<(
      { __typename?: 'Status' }
      & Pick<Status, 'id' | 'name' | 'attendance'>
    )> }
  ) }
);

export type MarkAttendanceMutationVariables = {
  schedule: ScheduleInput,
  student: Scalars['String'],
  attendance: Scalars['String']
};


export type MarkAttendanceMutation = (
  { __typename?: 'Mutation' }
  & { markAttendance: (
    { __typename?: 'Status' }
    & Pick<Status, 'id'>
    & { schedule: (
      { __typename?: 'Schedule' }
      & Pick<Schedule, 'classcode' | 'date' | 'startTime' | 'endTime' | 'classType'>
    ) }
  ) }
);

export type NewStatusSubscriptionVariables = {
  schedule: ScheduleInput
};


export type NewStatusSubscription = (
  { __typename?: 'Subscription' }
  & { newStatus: Maybe<(
    { __typename?: 'Status' }
    & Pick<Status, 'id'>
  )> }
);

export type UpdateAttendanceMutationVariables = {
  otp: Scalars['String']
};


export type UpdateAttendanceMutation = (
  { __typename?: 'Mutation' }
  & { updateAttendance: (
    { __typename?: 'Status' }
    & Pick<Status, 'id'>
    & { schedule: (
      { __typename?: 'Schedule' }
      & Pick<Schedule, 'classcode' | 'date' | 'startTime' | 'endTime' | 'classType'>
    ) }
  ) }
);

export const AttendanceDocument = gql`
    query attendance($schedule: ScheduleInput!) {
  attendance(schedule: $schedule) {
    secret
    students {
      id
      name
      attendance
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class AttendanceGQL extends Apollo.Query<AttendanceQuery, AttendanceQueryVariables> {
    document = AttendanceDocument;

  }
export const InitAttendanceDocument = gql`
    mutation initAttendance($schedule: ScheduleInput!) {
  attendance: initAttendance(schedule: $schedule) {
    secret
    students {
      id
      name
      attendance
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class InitAttendanceGQL extends Apollo.Mutation<InitAttendanceMutation, InitAttendanceMutationVariables> {
    document = InitAttendanceDocument;

  }
export const MarkAttendanceDocument = gql`
    mutation markAttendance($schedule: ScheduleInput!, $student: String!, $attendance: String!) {
  markAttendance(schedule: $schedule, student: $student, attendance: $attendance) {
    id
    schedule {
      classcode
      date
      startTime
      endTime
      classType
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class MarkAttendanceGQL extends Apollo.Mutation<MarkAttendanceMutation, MarkAttendanceMutationVariables> {
    document = MarkAttendanceDocument;

  }
export const NewStatusDocument = gql`
    subscription NewStatus($schedule: ScheduleInput!) {
  newStatus(schedule: $schedule) {
    id
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class NewStatusGQL extends Apollo.Subscription<NewStatusSubscription, NewStatusSubscriptionVariables> {
    document = NewStatusDocument;

  }
export const UpdateAttendanceDocument = gql`
    mutation updateAttendance($otp: String!) {
  updateAttendance(otp: $otp) {
    id
    schedule {
      classcode
      date
      startTime
      endTime
      classType
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class UpdateAttendanceGQL extends Apollo.Mutation<UpdateAttendanceMutation, UpdateAttendanceMutationVariables> {
    document = UpdateAttendanceDocument;

  }