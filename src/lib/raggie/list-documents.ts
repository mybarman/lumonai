import { ListDocumentsResponse } from "ragie/models/operations";
import ragie from "./client";

export async function listDocuments(
  pageSize: number = 100,
  cursor: string | undefined = undefined
): Promise<ListDocumentsResponse> {
  return await ragie.documents.list({
    pageSize,
    cursor,
  });
}
