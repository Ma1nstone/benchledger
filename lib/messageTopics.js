// Each topic controls how its messages are colored/labeled everywhere
// (list cards, detail page, filters). Adding a new message type later is
// just adding another entry here — nothing else needs to change.
export const MESSAGE_TOPICS = {
  message_seller: {
    key: "message_seller",
    label: "Message Seller",
    text: "text-blue-300",
    bg: "bg-blue-500/20",
    ring: "ring-blue-500/50",
  },
  share_build: {
    key: "share_build",
    label: "Share Build",
    text: "text-signal-amber",
    bg: "bg-signal-amber/10",
    ring: "ring-signal-amber/40",
  },
};

export function getTopicConfig(key) {
  return (
    MESSAGE_TOPICS[key] || {
      key,
      label: key,
      text: "text-graphite-400",
      bg: "bg-graphite-700/30",
      ring: "ring-graphite-600",
    }
  );
}