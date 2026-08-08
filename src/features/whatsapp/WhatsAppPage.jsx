import { useEffect, useState } from 'react';
import { Smartphone, CheckCircle2, XCircle, Send, Loader2, Webhook } from 'lucide-react';

import { whatsappApi } from '../../api/whatsappApi.js';

export default function WhatsAppPage() {
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState(null);

  const [testPhone, setTestPhone] = useState('');
  const [testText, setTestText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await whatsappApi.status();
        if (!cancelled) setStatusData(res.data);
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || 'Failed to load status');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSendTest = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      await whatsappApi.sendTest(testPhone, testText);
      alert('Message sent!');
      setTestText('');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const configured = statusData?.configured;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">WhatsApp</h1>
      <p className="mt-1 text-sm text-ink-500">
        WhatsApp runs through Unipile's cloud API — no QR scan needed here. Connect/reconnect the
        actual number from the Unipile dashboard; this page just shows whether the integration is
        configured and lets you send a quick test message.
      </p>

      <div className="card mt-6 flex flex-col items-center justify-center py-12 text-center">
        {loading && <Loader2 className="animate-spin" size={32} />}

        {!loading && error && (
          <>
            <XCircle size={40} className="text-red-500" />
            <p className="mt-3 text-lg font-semibold">{error}</p>
          </>
        )}

        {!loading && !error && configured && (
          <>
            <CheckCircle2 size={40} className="text-green-600" />
            <p className="mt-3 text-lg font-semibold">Unipile configured</p>
            <p className="mt-1 text-sm text-ink-500">Account ID: {statusData.accountId}</p>
            <p className="text-sm text-ink-500">DSN: {statusData.dsn}</p>
          </>
        )}

        {!loading && !error && !configured && (
          <>
            <Smartphone size={40} className="text-ink-400" />
            <p className="mt-3 text-lg font-semibold">Unipile not configured yet</p>
            <p className="mt-1 max-w-sm text-sm text-ink-500">
              Set UNIPILE_API_KEY and UNIPILE_ACCOUNT_ID on the backend, then reload this page.
            </p>
          </>
        )}
      </div>

      <div className="card mt-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Webhook size={18} />
          Inbound messages
        </h2>
        <p className="mt-2 text-sm text-ink-500">
          Register this URL in the Unipile dashboard (Webhooks → New message, source
          "messaging") so replies from leads reach the AI automatically:
        </p>
        <code className="mt-2 block break-all rounded-lg bg-ink-50 px-3 py-2 text-xs dark:bg-ink-800">
          {`${import.meta.env.VITE_API_URL || ''}/whatsapp/webhook?secret=<UNIPILE_WEBHOOK_SECRET>`}
        </code>
      </div>

      {configured && (
        <div className="card mt-6">
          <h2 className="text-lg font-semibold">Send test message</h2>
          <form onSubmit={handleSendTest} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="91XXXXXXXXXX"
              className="flex-1"
              required
            />
            <input
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Message"
              className="flex-1"
              required
            />
            <button disabled={sending} className="btn-primary flex items-center gap-2">
              <Send size={16} />
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
