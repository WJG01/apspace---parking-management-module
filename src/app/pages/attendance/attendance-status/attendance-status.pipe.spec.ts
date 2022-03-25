import { AttendanceStatusPipe } from './attendance-status.pipe';

describe('AttendanceStatusPipe', () => {
  it('create an instance', () => {
    const pipe = new AttendanceStatusPipe();
    expect(pipe).toBeTruthy();
  });
});
