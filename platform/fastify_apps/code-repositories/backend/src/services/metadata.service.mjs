/**
 * Metadata Service
 * Business logic for CodeRepositoryMetadata CRUD operations
 */

/**
 * Create metadata service with database models
 */
export function createMetadataService(db) {
  const { CodeRepository, CodeRepositoryMetadata } = db;

  /**
   * List metadata for a repository
   */
  async function listByRepository(repositoryId) {
    return CodeRepositoryMetadata.findAll({
      where: { repository_id: repositoryId },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Get metadata by ID
   */
  async function getById(id) {
    return CodeRepositoryMetadata.findByPk(id);
  }

  /**
   * Create new metadata
   */
  async function create(repositoryId, data) {
    // Verify repository exists
    const repository = await CodeRepository.findByPk(repositoryId);
    if (!repository) {
      return { error: 'Repository not found', metadata: null };
    }

    const metadata = await CodeRepositoryMetadata.create({
      ...data,
      repository_id: repositoryId,
    });

    return { error: null, metadata };
  }

  /**
   * Update existing metadata
   */
  async function update(id, data) {
    const metadata = await CodeRepositoryMetadata.findByPk(id);
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
    const metadata = await CodeRepositoryMetadata.findByPk(id);
    if (!metadata) {
      return false;
    }
    await metadata.destroy();
    return true;
  }

  return {
    listByRepository,
    getById,
    create,
    update,
    remove,
  };
}
