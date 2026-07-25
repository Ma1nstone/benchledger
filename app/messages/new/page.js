"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
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
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("builds")
      .select("id, name")
      .eq("owner_id", user.id)
      .then(({ data }) => setMyBuilds(data || []));
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !description.trim()) {
      setErrorMsg("Title and description are required.");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("site_messages")
      .insert({
        creator_id: user.id,
        topic,
        title: title.trim(),
        description: description.trim(),
        linked_build_id: linkedBuildId || null,
        metadata: listingInfo.trim() ? { listing_info: listingInfo.trim() } : {},
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
      <div className="max-w-lg">
        <h1 className="mb-4 font-display text-2xl font-bold text-white">Create Message</h1>
        <p className="text-sm text-graphite-500">Sign in to create a message.</p>
      </div>
    );
  }

  const activeTopic = getTopicConfig(topic);

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 font-display text-2xl font-bold text-white">Create Message</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
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
          <label className="mb-1 block text-xs text-graphite-500">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Details..."
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

        {errorMsg && (
          <p className="rounded-lg border border-signal-red/40 bg-signal-red/10 px-3 py-2 text-xs text-signal-red">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${activeTopic.bg} ${activeTopic.text} ring-1 ${activeTopic.ring} hover:brightness-110`}
        >
          <Send size={16} />
          {saving ? "Sending…" : "Send Message"}
        </button>
      </form>
    </div>
  );
}