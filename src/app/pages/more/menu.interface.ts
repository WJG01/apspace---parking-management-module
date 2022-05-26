import { Role } from '../../interfaces';
import { menuItems } from './menu';

// MenuID to allow type checked ID is part of menus
// cycle type MenuItem -> ids -> menusRaw x> MenuItem
// ids become never if it is 'string' (missing `as const`)
export type MenuID = string extends (typeof menuItems[number])['id']
  ? never : (typeof menuItems[number]['id']);

export interface MenuItem {
  id: MenuID;
  title: string;
  group: string;
  url: string;
  img: string;
  role: Role;
  attachTicket?: boolean; // set to true if the service needs a service ticket
  canAccess?: boolean;
  tags: string[];
  parents: MenuID[]; // hierarchy to reach page referring id of other item
}

