/**
 * Hooks Barrel Export
 */

// Figma File hooks
export {
  useFigmaFiles,
  useFigmaFile,
  useCreateFigmaFile,
  useUpdateFigmaFile,
  useDeleteFigmaFile,
  useBulkCreateFigmaFiles,
  figmaFileKeys,
  apiToUiFigmaFile,
  type FigmaFile,
  // Legacy aliases
  useRepositories,
  useRepository,
  useCreateRepository,
  useUpdateRepository,
  useDeleteRepository,
  useBulkCreateRepositories,
  repositoryKeys,
  apiToUiRepository,
  type Repository,
} from './useRepositories';

// Tag hooks
export {
  useTags,
  useTag,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  tagKeys,
} from './useTags';

// Metadata hooks
export {
  useMetadata,
  useMetadataItem,
  useCreateMetadata,
  useUpdateMetadata,
  useDeleteMetadata,
  metadataKeys,
} from './useMetadata';

// Form hooks
export { useFigmaFileForm, useRepositoryForm } from './useRepositoryForm';
export { useTagForm } from './useTagForm';
export { useMetadataForm } from './useMetadataForm';
