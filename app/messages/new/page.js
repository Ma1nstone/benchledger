"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Users } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { MARKETPLACES } from "@/lib/constants";
import { MESSAGE_TOPICS, getTopicConfig } from "@/lib/messageTopics";

const DEFAULT_TOPIC = Object.keys(MESSAGE_TOPICS)[0];

export default function NewMessagePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState(DEFAULT_TOPIC);
  const [linkedBuildId, setLinkedBuildId] = useState("");
  const [listingInfo, setListingInfo] = useState("");
  const [myBuilds, setMyBuilds] = useState([]);
  const [audience, setAudience] = useState("everyone"); // "everyone" | "specific"
  const [otherUsers, setOtherUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Message Seller specific fields
  const [msMarketplace, setMsMarketplace] = useState(MARKETPLACES[0]);
  const [msListingUrl, setMsListingUrl] = useState("");
  const [msSellerName, setMsSellerName] = useState("");
  const [msSellerLocation, setMsSellerLocation] = useState("");
  const [msListingPrice, setMsListingPrice] = useState("");
  const [msFirstOffer, setMsFirstOffer] = useState("");
  const [msCounterOffer, setMsCounterOffer] = useState("");
  const [msNotes, setMsNotes] = useState("");

  const isMessageSeller = topic === "message_seller";

  useEffect(() => {
    if (!user) return;
    supabase
      .from("builds")
      .select("id, name")
      .eq("owner_id", user.id)
      .then(({ data }) => setMyBuilds(data || []));

    supabase
      .from("profiles")
      .select("id, name, email")
      .neq("id", user.id)
      .then(({ data }) => setOtherUsers(data || []));
  }, [user]);

  function toggleUser(id) {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;

    if (!title.trim() || !description.trim()) {
      setErrorMsg("Title and description are required.");
      return;
    }
    if (audience === "specific" && selectedUserIds.size === 0) {
      setErrorMsg("Pick at least one person, or switch to \u201cEveryone\u201d.");
      return;
    }
    if (
      isMessageSeller &&
      (!msListingUrl.trim() ||
        !msSellerName.trim() ||
        !msSellerLocation.trim() ||
        msListingPrice === "" ||
        msFirstOffer === "")
    ) {
      setErrorMsg(
        "Marketplace, listing URL, seller name, seller location, listing price, and first offer are all required for Message Seller."
      );
      return;
    }

    setSaving(true);
    setErrorMsg("");

    // Message Seller gets a structured metadata shape, seeded with the
    // negotiation timeline's first entry — Step 9 renders and advances this.
    const metadata = isMessageSeller
      ? {
          marketplace: msMarketplace,
          listing_url: msListingUrl.trim(),
          seller_name: msSellerName.trim(),
          seller_location: msSellerLocation.trim(),
          listing_price: Number(msListingPrice),
          first_offer: Number(msFirstOffer),
          counter_offer: msCounterOffer === "" ? null : Number(msCounterOffer),
          notes: msNotes.trim() || null,
          negotiation: [
            { id: "n1", type: "question", label: "Is this still available?", status: "pending" },
          ],
        }
      : listingInfo.trim()
      ? { listing_info: listingInfo.trim() }
      : {};

    const { data, error } = await supabase
      .from("site_messages")
      .insert({
        creator_id: user.id,
        topic,
        title: title.trim(),
        description: description.trim(),
        linked_build_id: linkedBuildId || null,
        metadata,
        recipient_ids: audience === "specific" ? Array.from(selectedUserIds) : [],
      })
      .select()
      .single();

    setSaving(false);
    if (error) {
      setErrorMsg(error.message);
      return;
    }

    router.push(`/messages/${data.id}`);
  }

  if (!user) {
    return (
      <div>
        <h1 className="mb-4 font-display text-2xl font-bold text-white">Create Message</h1>
        <p className="text-sm text-graphite-500">Sign in to create a message.</p>
      </div>
    );
  }

  const activeTopic = getTopicConfig(topic);

  return (
    <div className="w-full">
      <h1 className="mb-6 font-display text-2xl font-bold text-white">Create Message</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <label className="mb-1 block text-xs text-graphite-500">Topic</label>
          <div className="flex flex-wrap gap-2">
            {Object.values(MESSAGE_TOPICS).map((t) => {
              const selected = t.key === topic;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTopic(t.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ring-1 transition ${
                    selected
                      ? `${t.bg} ${t.text} ${t.ring}`
                      : "bg-graphite-800 text-graphite-500 ring-graphite-700 hover:text-graphite-300"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-graphite-500">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's this message about?"
            className="w-full rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-sm text-white placeholder:text-graphite-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-graphite-500">
            Linked build <span className="text-graphite-600">(optional)</span>
          </label>
          <select
            value={linkedBuildId}
            onChange={(e) => setLinkedBuildId(e.target.value)}
            className="w-full rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-sm text-white"
          >
            <option value="">None</option>
            {myBuilds.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <label className="mb-1 block text-xs text-graphite-500">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Details..."
            className="w-full rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-sm text-white placeholder:text-graphite-500"
          />
        </div>

        {isMessageSeller ? (
          <div className="lg:col-span-2 rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-400">
              Message Seller details
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-graphite-500">Marketplace platform</label>
                <select
                  value={msMarketplace}
                  onChange={(e) => setMsMarketplace(e.target.value)}
                  className="w-full rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-sm text-white"
                >
                  {MARKETPLACES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-graphite-500">Listing URL</label>
                <input
                  value={msListingUrl}
                  onChange={(e) => setMsListingUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-sm text-white placeholder:text-graphite-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-graphite-500">Seller name</label>
                <input
                  value={msSellerName}
                  onChange={(e) => setMsSellerName(e.target.value)}
                  className="w-full rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-graphite-500">Seller location</label>
                <input
                  value={msSellerLocation}
                  onChange={(e) => setMsSellerLocation(e.target.value)}
                  placeholder="e.g. Manchester"
                  className="w-full rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-sm text-white placeholder:text-graphite-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-graphite-500">Listing price (£)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={msListingPrice}
                  onChange={(e) => setMsListingPrice(e.target.value)}
                  className="w-full rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-graphite-500">First offer (£)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={msFirstOffer}
                  onChange={(e) => setMsFirstOffer(e.target.value)}
                  className="w-full rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-graphite-500">
                  Counter offer (£) <span className="text-graphite-600">(optional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={msCounterOffer}
                  onChange={(e) => setMsCounterOffer(e.target.value)}
                  className="w-full rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs text-graphite-500">Notes</label>
                <textarea
                  value={msNotes}
                  onChange={(e) => setMsNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-graphite-600">
              This automatically starts a negotiation timeline on the message, beginning with
              &ldquo;Is this still available?&rdquo;
            </p>
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-xs text-graphite-500">
              Listing information <span className="text-graphite-600">(optional)</span>
            </label>
            <input
              value={listingInfo}
              onChange={(e) => setListingInfo(e.target.value)}
              placeholder="Listing URL or other details"
              className="w-full rounded-lg border border-graphite-700 bg-graphite-800 px-3 py-2 text-sm text-white placeholder:text-graphite-500"
            />
          </div>
        )}

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs text-graphite-500">
            <Users size={13} />
            Send to
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAudience("everyone")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ring-1 transition ${
                audience === "everyone"
                  ? "bg-trace-500/15 text-trace-400 ring-trace-500/40"
                  : "bg-graphite-800 text-graphite-500 ring-graphite-700 hover:text-graphite-300"
              }`}
            >
              Everyone
            </button>
            <button
              type="button"
              onClick={() => setAudience("specific")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ring-1 transition ${
                audience === "specific"
                  ? "bg-trace-500/15 text-trace-400 ring-trace-500/40"
                  : "bg-graphite-800 text-graphite-500 ring-graphite-700 hover:text-graphite-300"
              }`}
            >
              Specific people
            </button>
          </div>
        </div>

        {audience === "specific" && (
          <div className="lg:col-span-2 rounded-lg border border-graphite-700 bg-graphite-800/60 p-3">
            {otherUsers.length === 0 ? (
              <p className="text-sm text-graphite-500">No other users yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {otherUsers.map((u) => (
                  <label
                    key={u.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-graphite-300 hover:bg-graphite-800"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserIds.has(u.id)}
                      onChange={() => toggleUser(u.id)}
                      className="h-4 w-4 rounded border-graphite-600 bg-graphite-800 accent-trace-500"
                    />
                    {u.name || u.email}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {errorMsg && (
          <p className="lg:col-span-2 rounded-lg border border-signal-red/40 bg-signal-red/10 px-3 py-2 text-xs text-signal-red">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`lg:col-span-2 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${activeTopic.bg} ${activeTopic.text} ring-1 ${activeTopic.ring} hover:brightness-110`}
        >
          <Send size={16} />
          {saving ? "Sending…" : "Send Message"}
        </button>
      </form>
    </div>
  );
}