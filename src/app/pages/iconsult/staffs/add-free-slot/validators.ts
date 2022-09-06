import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

export function duplicateFromTime(control: AbstractControl): { [key: string]: boolean } | null {
  const parent: FormGroup = control.parent as FormGroup;

  if (!parent || !parent.parent || !parent.parent.parent) {
    return null;
  }

  const selectedTime = parent.get('slotsTime').value;
  const timeSlots = parent.parent.parent.get('time') as FormArray;
  // Initialise to false
  let isDuplicated = false;
  if (selectedTime !== '') {
    const checkDuplicationArray = timeSlots.controls
      .map(ts => ts.get('slotsTime').value)
      .filter((mappedTimeSlot, index, mappedTimeSlots) =>
        mappedTimeSlots.indexOf(mappedTimeSlot) !== index && mappedTimeSlot !== null
      );

    if (checkDuplicationArray.length > 0) {
      isDuplicated = true;
    }
  }

  return isDuplicated ? { isDuplicated: true } : null;
}
