import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { DefaultMarkdownRenderer } from "./ReactMarkdown";

interface DocumentContentModalProps {
  documentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentContentModal({
  documentId,
  open,
  onOpenChange,
}: DocumentContentModalProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      if (!documentId || !open) return;

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/documents/${documentId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setContent(data.content.content);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch document content"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [documentId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Document Content</DialogTitle>
        </DialogHeader>
        <div className="mt-4 max-h-[calc(80vh-8rem)] overflow-y-auto">
          {loading && <div>Loading content...</div>}
          {error && <div className="text-red-500">Error: {error}</div>}
          {content && <DefaultMarkdownRenderer text={content} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
