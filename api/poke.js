import { handleOptions, setCommonHeaders } from './_store.js';

const EMAILJS_URL = 'https://api.emailjs.com/api/v1.0/email/send';

export default async function handler(req, res) {
  setCommonHeaders(res, 'POST, OPTIONS');
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    EMAILJS_PUBLIC_KEY,
    EMAILJS_PRIVATE_KEY,
    POKE_TO_EMAIL,
    POKE_FROM_NAME = '媚媚',
  } = process.env;

  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || !POKE_TO_EMAIL) {
    return res.status(500).json({ error: 'Missing email configuration' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const timeStr = typeof body.timeStr === 'string' ? body.timeStr : '';
  const mood = typeof body.mood === 'string' && body.mood.trim()
    ? body.mood.trim()
    : '（没有留言，只是轻轻敲了你一下）';
  const weatherLocation = typeof body.weatherLocation === 'string' ? body.weatherLocation : '';
  const weatherTemp = typeof body.weatherTemp === 'string' ? body.weatherTemp : '';
  const weatherDesc = typeof body.weatherDesc === 'string' ? body.weatherDesc : '';

  const templateParams = {
    to_email: POKE_TO_EMAIL,
    from_name: POKE_FROM_NAME,
    send_time: timeStr,
    mood,
    weather_loc: weatherLocation,
    weather_now: `${weatherTemp} ${weatherDesc}`.trim(),
    message: `时间：${timeStr}\n位置天气：${weatherLocation} ${weatherTemp} ${weatherDesc}\n\n她说：${mood}`,
  };

  try {
    const payload = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: templateParams,
    };

    if (EMAILJS_PRIVATE_KEY) {
      payload.accessToken = EMAILJS_PRIVATE_KEY;
    }

    const emailRes = await fetch(EMAILJS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!emailRes.ok) {
      const text = await emailRes.text();
      return res.status(502).json({ error: 'Email send failed', detail: text });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
