
export interface IOtp {
    smsStatus: string,
    phone_number: string,
    to: string,
    pinId: string,
    pin_id: string,
    status: string
}

export interface IData {
  api_key: string;
  message_type: "NUMERIC" | "ALPHANUMERIC";
  to: string;
  from: string;
  channel: "generic" | "dnd";
  pin_attempts: number;
  pin_time_to_live: number;
  pin_length: number;
  pin_placeholder: string;
  message_text: string;
  pin_type: "NUMERIC" | "ALPHANUMERIC";
}

export interface IVerify {
  verified: boolean,
  pinId: string,
  msisdn: string,
  attemptsRemaining: number
}