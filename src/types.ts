export interface Message {
  username: string;
  content: string;
}

export interface User {
  username: string;
}

export interface UserInfo extends User {
  password: string;
}
