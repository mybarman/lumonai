"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { Document } from "ragie/models/components";
import { CodaSyncModal } from "@/components/CodaSyncModal";
import { DocumentContentModal } from "@/components/DocumentContentModal";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const [showContentModal, setShowContentModal] = useState(false);

  const fetchDocuments = async (currentCursor?: string) => {
    try {
      const response = await fetch(
        `/api/documents${currentCursor ? `?cursor=${currentCursor}` : ""}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      const { result } = await response.json();

      // Append new documents if we're paginating, otherwise replace
      setDocuments((prev) =>
        currentCursor ? [...prev, ...result.documents] : result.documents
      );
      setCursor(result.pagination?.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocs(new Set(documents.map((doc) => doc.id)));
    } else {
      setSelectedDocs(new Set());
    }
  };

  const handleSelectDoc = (docId: string, checked: boolean) => {
    const newSelected = new Set(selectedDocs);
    if (checked) {
      newSelected.add(docId);
    } else {
      newSelected.delete(docId);
    }
    setSelectedDocs(newSelected);
  };

  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    try {
      const deletePromises = Array.from(selectedDocs).map(async (docId) => {
        const response = await fetch("/api/documents", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ documentId: docId }),
        });
        if (!response.ok) {
          throw new Error(`Failed to delete document ${docId}`);
        }
        return docId;
      });

      const deletedIds = await Promise.all(deletePromises);

      // Remove deleted documents from state
      setDocuments((prev) =>
        prev.filter((doc) => !deletedIds.includes(doc.id))
      );
      setSelectedDocs(new Set());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete documents"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading documents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <h1 className="text-2xl font-bold">Documents Synced</h1>
          <Button
            variant="outline"
            onClick={() => setShowSyncModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Sync Coda Doc
          </Button>
        </div>
        {selectedDocs.size > 0 && (
          <Button
            variant="destructive"
            onClick={handleDeleteSelected}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting
              ? "Deleting..."
              : `Delete Selected (${selectedDocs.size})`}
          </Button>
        )}
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 transition-colors">
              <th className="h-12 px-4 text-left align-middle font-medium">
                <Checkbox
                  checked={selectedDocs.size === documents.length}
                  onCheckedChange={(checked) =>
                    handleSelectAll(checked as boolean)
                  }
                />
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Name
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Status
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Created By
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Updated By
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Created At
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Updated At
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Chunks
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Pages
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="border-b transition-colors hover:bg-muted/50"
              >
                <td className="p-4 align-middle">
                  <Checkbox
                    checked={selectedDocs.has(doc.id)}
                    onCheckedChange={(checked) =>
                      handleSelectDoc(doc.id, checked as boolean)
                    }
                  />
                </td>
                <td className="p-4 align-middle">
                  <div
                    className="font-medium cursor-pointer hover:text-blue-600"
                    onClick={() => {
                      setSelectedDocumentId(doc.id);
                      setShowContentModal(true);
                    }}
                  >
                    {doc.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {doc.metadata.source_url && (
                      <a
                        href={doc.metadata.source_url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {doc.metadata.source_url}
                      </a>
                    )}
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                      doc.status === "ready"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {doc.status}
                  </span>
                </td>
                <td className="p-4 align-middle">{doc.metadata.created_by}</td>
                <td className="p-4 align-middle">{doc.metadata.updated_by}</td>
                <td className="p-4 align-middle">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 align-middle">
                  {new Date(doc.updatedAt).toLocaleDateString()}
                </td>
                <td className="p-4 align-middle">{doc.chunkCount}</td>
                <td className="p-4 align-middle">
                  {doc.pageCount?.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cursor && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchDocuments(cursor)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      <CodaSyncModal open={showSyncModal} onOpenChange={setShowSyncModal} />
      <DocumentContentModal
        documentId={selectedDocumentId}
        open={showContentModal}
        onOpenChange={setShowContentModal}
      />
    </div>
  );
}
