export const metadata = {
  title: "Terms of Service — PC Scout",
};

export default function TermsPage() {
  return (
    <div className="prose prose-invert max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-white">Terms of Service</h1>
      <p className="text-sm text-graphite-500">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-graphite-300">
        <p>
          By using PC Scout ("the app"), you agree to the following terms. If you do not agree,
          please do not use the app.
        </p>

        <h2 className="mt-4 font-display text-base font-semibold text-white">What the app does</h2>
        <p>
          PC Scout is a tool for tracking PC parts inventory, assembling builds, estimating
          resale value, and managing sales. It is provided as-is for personal use.
        </p>

        <h2 className="mt-4 font-display text-base font-semibold text-white">Accounts</h2>
        <p>
          You sign in using your Google account. You are responsible for keeping your account
          secure. We may suspend or remove access for accounts used to abuse or attack the
          service.
        </p>

        <h2 className="mt-4 font-display text-base font-semibold text-white">Your content</h2>
        <p>
          Any data you enter (parts, builds, listing text, prices) remains yours. You're
          responsible for the accuracy of what you enter and for any listings or offers you make
          based on the app's output.
        </p>

        <h2 className="mt-4 font-display text-base font-semibold text-white">
          No guarantee on estimates
        </h2>
        <p>
          Price estimates, offer suggestions, and AI-generated part analysis are provided for
          convenience only. They are not guaranteed to be accurate or current, and should not be
          relied on as your sole basis for buying or selling decisions. Always verify pricing
          independently before making an offer or accepting one.
        </p>

        <h2 className="mt-4 font-display text-base font-semibold text-white">
          Third-party services
        </h2>
        <p>
          The app uses Google (for sign-in), Supabase (for data storage), and Google's Gemini API
          (for AI-assisted listing analysis). Your use of the app is also subject to those
          providers' own terms where applicable.
        </p>

        <h2 className="mt-4 font-display text-base font-semibold text-white">Limitation of liability</h2>
        <p>
          The app is provided "as is" without warranties of any kind. We are not liable for any
          loss arising from your use of the app, including financial loss from buying or selling
          decisions made using its estimates.
        </p>

        <h2 className="mt-4 font-display text-base font-semibold text-white">Changes</h2>
        <p>
          These terms may be updated from time to time. Continued use of the app after changes
          means you accept the updated terms.
        </p>

        <h2 className="mt-4 font-display text-base font-semibold text-white">Contact</h2>
        <p>
          Questions about these terms can be sent to: <strong>mainstone.thomas@gmail.com</strong>
        </p>

        <p className="mt-6 text-xs text-graphite-600">
          This is a template intended for a small personal/hobby project and is not a substitute
          for legal advice. Review and adapt it before relying on it, particularly for Google
          OAuth verification purposes.
        </p>
      </div>
    </div>
  );
}