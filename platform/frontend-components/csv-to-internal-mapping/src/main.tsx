import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CsvMappingEditor } from "./CsvMappingEditor";

const root = document.getElementById("root")!;
const apiEndpoint = root.dataset.apiEndpoint;
const csvHeaders = root.dataset.csvHeaders?.split(",").filter(Boolean) ?? [];

createRoot(root).render(
  <StrictMode>
    <CsvMappingEditor apiEndpoint={apiEndpoint} csvHeaders={csvHeaders} />
  </StrictMode>,
);
