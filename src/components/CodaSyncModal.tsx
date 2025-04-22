"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CodaPage } from "@/lib/connectors/coda/utils";
import { toast } from "sonner";

interface CodaSyncModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CodaSyncModal({ open, onOpenChange }: CodaSyncModalProps) {
  const [step, setStep] = useState<"select-doc" | "select-pages">("select-doc");
  const [docUrl, setDocUrl] = useState("");
  const [pages, setPages] = useState<CodaPage[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<CodaPage>>(new Set());
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<
    Array<{ id: string; name: string; href: string }>
  >([]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await fetch("/api/coda/docs");
        if (!response.ok) throw new Error("Failed to fetch docs");
        const data = await response.json();
        setDocs(data);
      } catch (error) {
        console.error("Error fetching docs:", error);
      }
    };
    fetchDocs();
  }, []);

  const handleDocSubmit = async () => {
    setLoading(true);
    try {
      // Extract doc ID from the href
      const docId = docUrl.split("/").pop();
      const response = await fetch(`/api/coda/doc/${docId}/pages`);

      if (!response.ok) throw new Error("Failed to fetch pages");

      const data = (await response.json()) as CodaPage[];
      setPages(data);
      setStep("select-pages");
    } catch (error) {
      console.error("Error fetching pages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      // Extract doc ID from the URL
      const docId = docUrl.split("/").pop();

      // Prepare request body based on selection
      const requestBody =
        selectedPages.size === pages.length
          ? { docId }
          : {
              docId,
              pageIds: Array.from(selectedPages).map((page) => page.id),
            };

      const response = await fetch("/api/coda/docs/ragie-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to sync document");
      }

      toast.success("Document sync started successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error syncing:", error);
      toast.error("Failed to sync document");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPages(new Set(pages));
    } else {
      setSelectedPages(new Set());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {step === "select-doc" ? "Select Coda Document" : "Choose Pages"}
          </DialogTitle>
        </DialogHeader>

        {step === "select-doc" ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="docUrl">Select Document</Label>
              <Select value={docUrl} onValueChange={setDocUrl}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a document" />
                </SelectTrigger>
                <SelectContent>
                  {docs.map((doc) => (
                    <SelectItem key={doc.id} value={doc.href}>
                      {doc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleDocSubmit} disabled={!docUrl || loading}>
              {loading ? "Loading..." : "Next"}
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="selectAll"
                checked={selectedPages.size === pages.length}
                onCheckedChange={(checked) =>
                  handleSelectAll(checked as boolean)
                }
              />
              <Label htmlFor="selectAll">Select All Pages</Label>
            </div>
            <div className="max-h-[200px] overflow-y-auto">
              {pages.map((page) => (
                <div key={page.id} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={page.id}
                    checked={selectedPages.has(page)}
                    onCheckedChange={(checked) => {
                      const newSelected = new Set(selectedPages);
                      if (checked) {
                        newSelected.add(page);
                      } else {
                        newSelected.delete(page);
                      }
                      setSelectedPages(newSelected);
                    }}
                  />
                  <Label htmlFor={page.id}>{page.name}</Label>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("select-doc");
                  setSelectedPages(new Set());
                }}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleSync}
                disabled={selectedPages.size === 0 || loading}
              >
                {loading ? "Syncing..." : "Sync Selected Pages"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
