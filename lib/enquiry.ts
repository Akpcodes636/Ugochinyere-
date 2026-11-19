/* Enquiry form setup. Edit the choices here (they are no longer managed in the admin panel). */

/** Web3Forms access key (from web3forms.com, it is safe to expose publicly). Set it in .env.local / your host. */
export const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || '';

/** Shown after an enquiry is sent. */
export const BOOKING_URL =
  'https://calendar.google.com/calendar/appointments/schedules/AcZssZ32pDXL2ja_nU9JrW-YQ89WjRD5ostn0DaeHPJTbk-T0AjynajI9yBbZ43FPJbzrxzde9Pf9P_4?gv=true';

export const SERVICES = [
  'Website development',
  'SEO',
  'Google Business Profile setup or optimisation',
  'AI visibility (AEO and GEO)',
  'Keyword research',
  'Website SEO audit',
  'Other digital project support',
];

export const BUDGETS = ['$300–$600', '$700–$1,000', '$1,000–$2,000', '$2,000–$3,500', 'Above $3,500', 'Not sure yet'];

export const TIMELINES = ['Immediately', 'Within 2–4 weeks', 'Within 1–2 months', 'In 3 months or later', 'Just exploring'];
