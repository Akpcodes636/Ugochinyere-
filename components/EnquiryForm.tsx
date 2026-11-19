'use client';

/* Enquiry form: validated in the browser, then sent to Web3Forms (emails the enquiry to you). */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { BOOKING_URL, BUDGETS, SERVICES, TIMELINES, WEB3FORMS_ACCESS_KEY } from '@/lib/enquiry';
import { CONTACT_EMAIL } from '@/lib/format';

type Iti = {
  getNumber: () => string; setNumber: (n: string) => void; isValidNumber: () => boolean | null; destroy: () => void;
};

type Values = {
  name: string; email: string; phone: string; business: string; links: string;
  services: string[]; challenge: string; budget: string; timeline: string;
};
type Key = keyof Values;
type Errors = Partial<Record<Key, string>>;

const EMPTY: Values = { name: '', email: '', phone: '', business: '', links: '', services: [], challenge: '', budget: '', timeline: '' };
const ORDER: Key[] = ['name', 'email', 'phone', 'business', 'links', 'services', 'challenge', 'budget', 'timeline'];
const CHALLENGE_MIN = 20;
const IDS: Record<Key, string> = {
  name: 'full-name', email: 'email-address', phone: 'phone-number', business: 'business-type', links: 'online-links',
  services: 'service-0', challenge: 'challenge', budget: 'budget', timeline: 'start-time',
};

function validate(v: Values, iti: Iti | null): Errors {
  const e: Errors = {};
  const name = v.name.trim();
  if (!name) e.name = 'Please enter your full name.';
  else if (name.length < 2 || !/\p{L}/u.test(name)) e.name = 'Please enter a valid name.';

  const email = v.email.trim();
  if (!email) e.email = 'Please enter your email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = 'Please enter a valid email, e.g. you@example.com.';

  if (v.phone.trim()) {
    const ok = iti?.isValidNumber?.();
    const digits = v.phone.replace(/\D/g, '').length;
    if (ok === false || (ok == null && (digits < 7 || digits > 15))) e.phone = 'Please enter a valid phone number, or leave it empty.';
  }

  if (v.business.trim().length < 2) e.business = 'Please tell me what type of business you run.';

  const links = v.links.trim();
  if (!links) e.links = 'Please share at least one link. No website yet? Type “none”.';
  else if (!/^(none|n\/?a|no)\.?$/i.test(links) && !/(https?:\/\/|www\.|[a-z0-9-]+\.[a-z]{2,}|@[\w.]{2,})/i.test(links))
    e.links = 'Please add a link (e.g. www.yourbusiness.com) or a handle (e.g. @yourbusiness).';

  if (!v.services.length) e.services = 'Please choose at least one service.';

  const challenge = v.challenge.trim();
  if (!challenge) e.challenge = 'Please describe the main challenge.';
  else if (challenge.length < CHALLENGE_MIN) e.challenge = `Please add a little more detail (at least ${CHALLENGE_MIN} characters).`;

  if (!v.budget) e.budget = 'Please choose a budget range.';
  if (!v.timeline) e.timeline = 'Please choose when you would like to start.';
  return e;
}

export default function EnquiryForm() {
  const phoneRef = useRef<HTMLInputElement>(null);
  const itiRef = useRef<Iti | null>(null);
  const [values, setValues] = useState<Values>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<Key, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

  // Phone input with country code
  useEffect(() => {
    let cancelled = false;
    import('intl-tel-input').then(({ default: intlTelInput }) => {
      if (cancelled || !phoneRef.current) return;
      itiRef.current = intlTelInput(phoneRef.current, {
        initialCountry: 'auto',
        nationalMode: true,
        separateDialCode: true,
        geoIpLookup: (cb: (c: string) => void) => {
          fetch('https://ipapi.co/json')
            .then((r) => r.json())
            .then((d) => cb(((d && d.country_code) || 'ng').toLowerCase()))
            .catch(() => cb('ng'));
        },
        loadUtils: () => import('intl-tel-input/utils'),
      } as Parameters<typeof intlTelInput>[1]) as unknown as Iti;
    });
    return () => {
      cancelled = true;
      itiRef.current?.destroy();
      itiRef.current = null;
    };
  }, []);

  const errors = validate(values, itiRef.current);
  // Show an error once the visitor has left the field, or after they press Submit.
  const show = (k: Key) => (submitted || touched[k] ? errors[k] : undefined);

  const set = <K extends Key>(k: K, v: Values[K]) => { setValues((cur) => ({ ...cur, [k]: v })); setServerError(''); };
  const blur = (k: Key) => () => setTouched((t) => ({ ...t, [k]: true }));
  const toggleService = (s: string) =>
    set('services', values.services.includes(s) ? values.services.filter((x) => x !== s) : [...values.services, s]);

  /** Shared props for a text-like control: value, change, blur and accessible error wiring. */
  const control = (k: Exclude<Key, 'services'>) => ({
    id: IDS[k],
    value: values[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(k, e.target.value),
    onBlur: blur(k),
    'aria-invalid': !!show(k),
    'aria-describedby': show(k) ? IDS[k] + '-error' : undefined,
  });
  const fieldClass = (k: Key, full = false) => 'field' + (full ? ' full' : '') + (show(k) ? ' has-error' : '');
  const Err = ({ k }: { k: Key }) =>
    show(k) ? <span className="field-error" id={IDS[k] + '-error'} role="alert">{show(k)}</span> : null;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setSubmitted(true);
    const errs = validate(values, itiRef.current);
    const first = ORDER.find((k) => errs[k]);
    if (first) {
      const el = document.getElementById(IDS[first]);
      el?.focus();
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!WEB3FORMS_ACCESS_KEY) {
      setServerError(`The enquiry form is not connected yet. Please email ${CONTACT_EMAIL} directly.`);
      return;
    }

    const botcheck = (e.currentTarget.elements.namedItem('botcheck') as HTMLInputElement | null)?.checked;
    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `New website enquiry from ${values.name.trim()} — The Digital PM`,
      from_name: 'The Digital PM website',
      replyto: values.email.trim(),
      botcheck: botcheck ? true : '',
      'Full name': values.name.trim(),
      'Email address': values.email.trim(),
      'Phone number': values.phone.trim() ? itiRef.current?.getNumber?.() || values.phone.trim() : 'Not given',
      'Business type': values.business.trim(),
      'Website and social media links': values.links.trim(),
      'Services selected': values.services.join(', '),
      'Main challenge': values.challenge.trim(),
      'Estimated budget': values.budget,
      'Preferred start timeline': values.timeline,
    };

    setSending(true);
    setServerError('');
    try {
      const r = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok || !body.success) throw new Error(body.message || 'Submission failed');
      setSent(true);
      setValues(EMPTY);
      setTouched({});
      setSubmitted(false);
      itiRef.current?.setNumber?.('');
    } catch (err) {
      console.error(err);
      setServerError(`Sorry, something went wrong sending your enquiry. Please try again or email ${CONTACT_EMAIL}.`);
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="questionnaire enquiry-success" role="status">
        <div className="success-icon" aria-hidden="true">✓</div>
        <h3>Thank you, your enquiry has been sent.</h3>
        <p>I will review your answers before we speak. The next step is to book your discovery call.</p>
        {BOOKING_URL && (
          <a className="button" target="_blank" rel="noopener" href={BOOKING_URL}>Book a Discovery Call</a>
        )}
        <button type="button" className="link-button" onClick={() => setSent(false)}>Send another enquiry</button>
      </div>
    );
  }

  const errorCount = submitted ? ORDER.filter((k) => errors[k]).length : 0;
  const challengeLen = values.challenge.trim().length;

  return (
    <form className="questionnaire" id="business-enquiry" noValidate onSubmit={onSubmit}>
      <h3>Tell me about your business</h3>
      <p className="hint">
        It takes about 3 minutes and helps me understand your needs before we speak. Fields marked <span className="required">*</span> are required.
      </p>

      <div className="form-group">
        <div className="group-title"><span>1</span> About you</div>
        <div className="fields">
          <div className={fieldClass('name')}>
            <label htmlFor={IDS.name}>Full name <span className="required">*</span></label>
            <input {...control('name')} name="name" autoComplete="name" placeholder="Your full name" />
            <Err k="name" />
          </div>
          <div className={fieldClass('email')}>
            <label htmlFor={IDS.email}>Email address <span className="required">*</span></label>
            <input {...control('email')} name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" />
            <Err k="email" />
          </div>
          <div className={fieldClass('phone')}>
            <label htmlFor={IDS.phone}>Phone number <span className="optional">(optional)</span></label>
            <input {...control('phone')} name="phone" type="tel" autoComplete="tel" placeholder="Your phone number" ref={phoneRef} />
            <Err k="phone" />
          </div>
          <div className={fieldClass('business')}>
            <label htmlFor={IDS.business}>What type of business do you run? <span className="required">*</span></label>
            <input {...control('business')} name="business" placeholder="e.g. Consulting, retail, catering" />
            <Err k="business" />
          </div>
          <div className={fieldClass('links', true)}>
            <label htmlFor={IDS.links}>Your website or social media links <span className="required">*</span></label>
            <textarea {...control('links')} name="links" rows={2}
              placeholder="e.g. www.yourbusiness.com, instagram.com/yourbusiness. No website yet? Type “none”" />
            <Err k="links" />
          </div>
        </div>
      </div>

      <div className="form-group">
        <div className="group-title"><span>2</span> Your project</div>
        <div className="fields">
          <div className={fieldClass('services', true)}>
            <fieldset aria-describedby={show('services') ? 'service-0-error' : undefined}>
              <legend>What would you like help with? <span className="required">*</span> <span className="optional">Choose all that apply</span></legend>
              <div className="checks" id="services-options">
                {SERVICES.map((s, i) => (
                  <label key={s} className={values.services.includes(s) ? 'checked' : undefined}>
                    <input type="checkbox" id={'service-' + i} name="services" value={s}
                      checked={values.services.includes(s)} onChange={() => toggleService(s)} onBlur={blur('services')} />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <Err k="services" />
          </div>
          <div className={fieldClass('challenge', true)}>
            <label htmlFor={IDS.challenge}>What is the main challenge you want help with? <span className="required">*</span></label>
            <textarea {...control('challenge')} name="challenge" rows={4}
              placeholder="Tell me what is happening in your business and what you would like to improve" />
            <div className="field-foot">
              <Err k="challenge" />
              <span className={'counter' + (challengeLen >= CHALLENGE_MIN ? ' ok' : '')}>
                {challengeLen < CHALLENGE_MIN ? `${CHALLENGE_MIN - challengeLen} more characters` : '✓'}
              </span>
            </div>
          </div>
          <div className={fieldClass('budget')}>
            <label htmlFor={IDS.budget}>Estimated budget <span className="required">*</span></label>
            <select {...control('budget')} name="budget">
              <option value="">Select a budget range</option>
              {BUDGETS.map((o) => <option key={o}>{o}</option>)}
            </select>
            <Err k="budget" />
          </div>
          <div className={fieldClass('timeline')}>
            <label htmlFor={IDS.timeline}>When would you like to start? <span className="required">*</span></label>
            <select {...control('timeline')} name="timeline">
              <option value="">Select a timeline</option>
              {TIMELINES.map((o) => <option key={o}>{o}</option>)}
            </select>
            <Err k="timeline" />
          </div>
        </div>
      </div>

      <label className="hp" aria-hidden="true">Leave this empty<input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" /></label>

      {errorCount > 0 && (
        <p className="form-status error" role="alert">
          Please check the {errorCount === 1 ? 'highlighted field' : `${errorCount} highlighted fields`} above.
        </p>
      )}
      {serverError && <p className="form-status error" role="alert">{serverError}</p>}

      <button className="button" type="submit" disabled={sending} aria-busy={sending}>
        {sending ? <><span className="btn-spinner" aria-hidden="true" /> Sending…</> : 'Submit Enquiry'}
      </button>
      <p className="review-note">
        After submitting your enquiry, you can book a discovery call. All enquiries are reviewed before the meeting; if your project does not align with the services offered, the appointment may be cancelled and you will be notified.
      </p>
    </form>
  );
}
