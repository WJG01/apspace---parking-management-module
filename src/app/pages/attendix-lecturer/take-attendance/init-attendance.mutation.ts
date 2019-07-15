import { Injectable } from '@angular/core';
import { Mutation } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root'
})
export class InitAttendanceMutation extends Mutation {
  document = gql`
    mutation initAttendance($schedule: String!) {
      initAttendance(schedule: $schedule) {
        secret
      }
    }
  `;
}
