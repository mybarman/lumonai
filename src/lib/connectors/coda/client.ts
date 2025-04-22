import { Coda } from "coda-js";

export const coda = new Coda(process.env.CODA_API_KEY as string); // insert your token
