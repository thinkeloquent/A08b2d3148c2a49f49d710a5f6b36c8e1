import { mkdirSync, appendFileSync, readFileSync } from "node:fs";
import path from "node:path";

export interface StreamWriterOptions {
  outputDir: string;
  filename: string;
  toolName: string;
  toolConfig: Record<string, unknown>;
}

export interface StreamHeader {
  __stream: "header";
  tool: string;
  version: number;
  startedAt: string;
  config: Record<string, unknown>;
}

export interface StreamRecord {
  __stream: "record";
  type: string;
  seq: number;
  data: unknown;
}

export interface StreamFooter {
  __stream: "footer";
  endedAt: string;
  totalRecords: number;
  completed: boolean;
}

export interface StreamContents {
  header: StreamHeader | null;
  records: StreamRecord[];
  footer: StreamFooter | null;
}

/**
 * Crash-safe JSONL streaming writer.
 *
 * Appends each record synchronously to a `.stream.jsonl` file so that
 * data survives process crashes, OOM kills, or network timeouts.
 * The in-memory arrays used by analytics modules are unaffected.
 */
export class StreamWriter {
  private readonly filePath: string;
  private seq = 0;
  private finalized = false;

  constructor(options: StreamWriterOptions) {
    const { outputDir, filename, toolName, toolConfig } = options;

    mkdirSync(outputDir, { recursive: true });
    this.filePath = path.join(outputDir, `${filename}.stream.jsonl`);

    const safeConfig = { ...toolConfig };
    delete safeConfig.token;

    const header: StreamHeader = {
      __stream: "header",
      tool: toolName,
      version: 1,
      startedAt: new Date().toISOString(),
      config: safeConfig,
    };

    appendFileSync(this.filePath, JSON.stringify(header) + "\n");
  }

  /**
   * Append a single record to the JSONL file.
   */
  append(type: string, data: unknown): void {
    if (this.finalized) return;
    this.seq++;
    const record: StreamRecord = {
      __stream: "record",
      type,
      seq: this.seq,
      data,
    };
    appendFileSync(this.filePath, JSON.stringify(record) + "\n");
  }

  /**
   * Append a batch of records in a single `appendFileSync` call.
   */
  appendBatch(type: string, records: unknown[]): void {
    if (this.finalized || records.length === 0) return;
    let buf = "";
    for (const data of records) {
      this.seq++;
      const record: StreamRecord = {
        __stream: "record",
        type,
        seq: this.seq,
        data,
      };
      buf += JSON.stringify(record) + "\n";
    }
    appendFileSync(this.filePath, buf);
  }

  /**
   * Write a footer line indicating whether the run completed successfully.
   * No-ops if already finalized.
   */
  finalize(completed: boolean): void {
    if (this.finalized) return;
    this.finalized = true;
    const footer: StreamFooter = {
      __stream: "footer",
      endedAt: new Date().toISOString(),
      totalRecords: this.seq,
      completed,
    };
    appendFileSync(this.filePath, JSON.stringify(footer) + "\n");
  }

  getFilePath(): string {
    return this.filePath;
  }

  getCount(): number {
    return this.seq;
  }

  /**
   * Read a JSONL stream file back into structured data (for recovery).
   */
  static readRecords(filePath: string): StreamContents {
    const contents: StreamContents = {
      header: null,
      records: [],
      footer: null,
    };

    const text = readFileSync(filePath, "utf-8");
    const lines = text.split("\n").filter((l) => l.trim().length > 0);

    for (const line of lines) {
      const obj = JSON.parse(line) as
        | StreamHeader
        | StreamRecord
        | StreamFooter;
      switch (obj.__stream) {
        case "header":
          contents.header = obj;
          break;
        case "record":
          contents.records.push(obj);
          break;
        case "footer":
          contents.footer = obj;
          break;
      }
    }

    return contents;
  }
}
