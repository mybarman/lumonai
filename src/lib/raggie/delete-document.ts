import { DocumentDelete } from "ragie/models/components";
import ragie from "./client";
export async function deleteDocument(
  documentId: string,
  partition?: string
): Promise<DocumentDelete> {
  return await ragie.documents.delete({
    documentId,
    partition,
  });
}
