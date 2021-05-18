export interface MoodleEvent {
  categoryid: number;
  courseid: number;
  description: string;
  eventtype: string;
  format: number;
  groupid: number;
  id: number;
  instance: number;
  location: string;
  modulename: string;
  name: string;
  priority: number;
  repeatid: number;
  sequence: number;
  subscriptionid: number;
  timeduration: number;
  timemodified: Date
  timesort: Date
  timestart: Date
  type: number
  userid: number
  uuid: string;
  visible: number
}
