export const metadata = {
  title: "Privacy Policy — PCScout",
};

export default function PrivacyPage() {
  return (
    <div className="prose prose-invert max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-white">Privacy Policy</h1>
      <p className="text-sm text-graphite-500">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-graphite-300">
        <p>
          PCScout ("the app") is a personal inventory and resale-tracking tool. This page
          explains what information the app collects and how it is used.
        </p>

        <h2 className="mt-4 font-display text-base font-semibold text-white">Information we collect</h2>
        <p>When you sign in with Google, we receive and store:</p>
        <ul className="list-disc pl-5">
          <li>Your name</li>
          <li>Your email address</li>
          <li>Your Google profile picture</li>
          <li>A unique Google account identifier</li>
        </ul>
        <p>
          We also store the data you create while using the app — parts, builds, bundles, sale
          records, and any listing text you paste in for analysis.
        </p>

        <h2 className="mt-4 font-display text-base font-semibold text-white">How we use it</h2>
        <p>
          Your account information is used solely to identify you within the app and to
          associate your data (builds, parts, sales) with your account. We do not sell your
          data, and we do not use it for advertising.
        </p>
        <p>
          Listing text you paste into the Estimate tool may be sent to a third-party AI provider
          (Google's Gemini API) to extract part information and estimate prices. This text is
          processed to generate a response and is not used by us for any other purpose.
        </p>

        <h2 className="mt-4 font-display text-base font-semibold text-white">Data storage</h2>
        <p>
          Your data is stored using Supabase (a hosted PostgreSQL database and file storage
          provider). We take reasonable measures to keep it secure, but no method of storage or
          transmission is 100% secure.
        </p>

        <h2 className="mt-4 font-display text-base font-semibold text-white">Data sharing</h2>
        <p>
          We do not share your personal information with third parties except where necessary to
          operate the app (e.g. Google for authentication, Supabase for storage, Google's Gemini
          API for AI-assisted parsing).
        </p>

        <h2 className="mt-4 font-display text-base font-semibold text-white">Your choices</h2>
        <p>
          You can sign out at any time from Settings. To request deletion of your account and
          associated data, contact us using the details below.
        </p>

        <h2 className="mt-4 font-display text-base font-semibold text-white">Contact</h2>
        <p>
          Questions about this policy can be sent to: <strong>mainstone.thomas@gmail.com</strong>
        </p>

        <p className="mt-6 text-xs text-graphite-600">
          This is a template policy intended for a small personal/hobby project and is not a
          substitute for legal advice. Review and adapt it (especially the contact details and
          data-handling specifics) before relying on it, particularly for Google OAuth
          verification purposes.
        </p>
      </div>
    </div>
  );
}