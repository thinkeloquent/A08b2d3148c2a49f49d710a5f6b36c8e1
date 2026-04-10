/**
 * Metadata Service
 * Business logic for FigmaFileMetadata CRUD operations
 */

/**
 * Create metadata service with database models
 */
export function createMetadataService(db) {
  const { FigmaFile, FigmaFileMetadata } = db;

  /**
   * List metadata for a Figma file
   */
  async function listByFigmaFile(figmaFileId) {
    return FigmaFileMetadata.findAll({
      where: { figma_file_id: figmaFileId },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Get metadata by ID
   */
  async function getById(id) {
    return FigmaFileMetadata.findByPk(id);
  }

  /**
   * Create new metadata
   */
  async function create(figmaFileId, data) {
    // Verify Figma file exists
    const figmaFile = await FigmaFile.findByPk(figmaFileId);
    if (!figmaFile) {
      return { error: 'Figma file not found', metadata: null };
    }

    const metadata = await FigmaFileMetadata.create({
      ...data,
      figma_file_id: figmaFileId,
    });

    return { error: null, metadata };
  }

  /**
   * Update existing metadata
   */
  async function update(id, data) {
    const metadata = await FigmaFileMetadata.findByPk(id);
    if (!metadata) {
      return null;
    }
    await metadata.update(data);
    return metadata;
  }

  /**
   * Delete metadata
   */
  async function remove(id) {
    const metadata = await FigmaFileMetadata.findByPk(id);
    if (!metadata) {
      return false;
    }
    await metadata.destroy();
    return true;
  }

  return {
    listByFigmaFile,
    getById,
    create,
    update,
    remove,
  };
}
