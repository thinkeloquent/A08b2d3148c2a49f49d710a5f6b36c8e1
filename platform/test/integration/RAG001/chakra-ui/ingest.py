#!/usr/bin/env python3
"""
RAG Ingestion Script for Chakra UI
Indexes Chakra UI components into a ChromaDB vector store.

Source structure: pnpm monorepo
  - Primary: packages/react/src/components (116 component dirs)
  - Additional: packages/charts, packages/cli, packages/panda-preset
"""
import os
import glob
from typing import List
from multiprocessing import Pool
from tqdm import tqdm

from langchain_community.document_loaders import (
    TextLoader,
    UnstructuredMarkdownLoader,
    CSVLoader,
)
from langchain_text_splitters import RecursiveCharacterTextSplitter, Language
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document

CHROMA_SETTINGS = {}

COLLECTION_NAME = "chromadb-rag-ingest-manager"

# --- CONFIGURATION ---
REPO_ROOT = os.path.join(
    os.environ.get("DATASET_ROOT", "/Users/Shared/autoload/mta-v800/dataset/repos"),
    "chakra-ui",
)
persist_directory = os.environ.get("PERSIST_DIRECTORY", "db_chakra_ui")
source_directory = os.environ.get("SOURCE_DIRECTORY", os.path.join(REPO_ROOT, "packages"))
embeddings_model_name = os.environ.get("EMBEDDINGS_MODEL_NAME", "all-MiniLM-L6-v2")

chunk_size = 1200
chunk_overlap = 150

# --- LOADER MAPPING ---
LOADER_MAPPING = {
    ".mdx": (UnstructuredMarkdownLoader, {}),
    ".md": (UnstructuredMarkdownLoader, {}),
    ".stories.tsx": (TextLoader, {"encoding": "utf8"}),
    ".stories.jsx": (TextLoader, {"encoding": "utf8"}),
    ".tsx": (TextLoader, {"encoding": "utf8"}),
    ".jsx": (TextLoader, {"encoding": "utf8"}),
    ".ts": (TextLoader, {"encoding": "utf8"}),
    ".js": (TextLoader, {"encoding": "utf8"}),
    ".json": (TextLoader, {"encoding": "utf8"}),
    ".css": (TextLoader, {"encoding": "utf8"}),
}


def load_single_document(file_path: str) -> List[Document]:
    if os.path.getsize(file_path) == 0:
        return []

    selected_ext = None
    for ext in sorted(LOADER_MAPPING.keys(), key=len, reverse=True):
        if file_path.endswith(ext):
            selected_ext = ext
            break

    if selected_ext:
        loader_class, loader_args = LOADER_MAPPING[selected_ext]
        try:
            loader = loader_class(file_path, **loader_args)
            docs = loader.load()
            for doc in docs:
                doc.metadata["file_name"] = os.path.basename(file_path)
                doc.metadata["file_path"] = file_path
                doc.metadata["library"] = "chakra-ui"
                parts = file_path.split(os.sep)
                if "packages" in parts:
                    idx = parts.index("packages")
                    if idx + 1 < len(parts):
                        doc.metadata["package"] = parts[idx + 1]
                if "components" in parts:
                    idx = parts.index("components")
                    if idx + 1 < len(parts):
                        doc.metadata["component"] = parts[idx + 1]
            return docs
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
            return []

    return []


def load_documents(source_dir: str, ignored_files: List[str] = []) -> List[Document]:
    all_files = []
    ignore_dirs = {"node_modules", "dist", "build", ".git", "storybook-static", "__tests__", "coverage"}

    for root, dirs, files in os.walk(source_dir):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]

        for file in files:
            for ext in sorted(LOADER_MAPPING.keys(), key=len, reverse=True):
                if file.endswith(ext):
                    all_files.append(os.path.join(root, file))
                    break

    filtered_files = [f for f in all_files if f not in ignored_files]

    with Pool(processes=os.cpu_count()) as pool:
        results = []
        with tqdm(total=len(filtered_files), desc="Ingesting chakra-ui", ncols=80) as pbar:
            for docs in pool.imap_unordered(load_single_document, filtered_files):
                if docs:
                    results.extend(docs)
                pbar.update()
    return results


def process_documents(ignored_files: List[str] = []) -> List[Document]:
    print(f"Loading Chakra UI components from {source_directory}")
    documents = load_documents(source_directory, ignored_files)
    if not documents:
        print("No new components found.")
        exit(0)

    text_splitter = RecursiveCharacterTextSplitter.from_language(
        language=Language.MARKDOWN,
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )

    texts = text_splitter.split_documents(documents)
    print(f"Split into {len(texts)} chunks for the vector store.")
    return texts


def does_vectorstore_exist(persist_dir: str) -> bool:
    return os.path.exists(os.path.join(persist_dir, "chroma.sqlite3")) or os.path.exists(
        os.path.join(persist_dir, "index")
    )


def main():
    embeddings = OpenAIEmbeddings(model=embeddings_model_name)

    if does_vectorstore_exist(persist_directory):
        print(f"Updating existing index at {persist_directory}")
        db = Chroma(persist_directory=persist_directory, embedding_function=embeddings, collection_name=COLLECTION_NAME)
        collection = db.get()
        existing_files = [m["file_path"] for m in collection["metadatas"] if "file_path" in m]
        texts = process_documents(existing_files)
        if texts:
            print("Creating embeddings for new components...")
            batch_size = 5000
            for i in range(0, len(texts), batch_size):
                batch = texts[i : i + batch_size]
                print(f"  Adding batch {i // batch_size + 1} ({len(batch)} chunks)...")
                db.add_documents(batch)
    else:
        print("Creating new Chakra UI vector store")
        texts = process_documents()
        batch_size = 5000
        db = Chroma.from_documents(texts[:batch_size], embeddings, persist_directory=persist_directory, collection_name=COLLECTION_NAME)
        for i in range(batch_size, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            print(f"  Adding batch {i // batch_size + 1} ({len(batch)} chunks)...")
            db.add_documents(batch)

    print("Ingestion complete! You can now query the Chakra UI library.")


if __name__ == "__main__":
    main()
