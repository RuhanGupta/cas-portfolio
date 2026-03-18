import EntryCollectionPage from "@/components/EntryCollectionPage";

export default function ConversationsPage() {
  return (
    <EntryCollectionPage
      kind="conversation"
      eyebrow="Strand · CAS Conversations"
      title="Recorded checkpoints that frame the wider CAS story."
      description="This page brings together conversation logs, audio evidence, and reflective summaries that capture progress across all strands."
    />
  );
}
