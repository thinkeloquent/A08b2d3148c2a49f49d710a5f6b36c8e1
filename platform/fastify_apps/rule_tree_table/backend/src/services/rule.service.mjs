/**
 * Rule Service
 * Business logic for RuleTree and RuleItem CRUD operations
 */

import { Op } from 'sequelize';
import { buildTree, flattenTree, countRules } from '../utils/tree-helpers.mjs';

/**
 * Create rule service with database models
 * @param {object} db - Database object with { sequelize, RuleTree, RuleItem }
 */
export function createRuleService(db) {
  const { sequelize, RuleTree, RuleItem } = db;

  /**
   * List all rule trees with optional stats
   */
  async function listTrees(options = {}) {
    const { page = 1, limit = 20, search, is_active, graph_type, language } = options;
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    if (graph_type) {
      where.graph_type = graph_type;
    }

    if (language) {
      where.language = language;
    }

    const { count, rows } = await RuleTree.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const trees = rows.map((tree) => {
      const plain = tree.get({ plain: true });
      plain.stats = {
        total: plain.stats_total,
        groups: plain.stats_groups,
        conditions: plain.stats_conditions,
        folders: plain.stats_folders,
        enabled: plain.stats_enabled,
      };
      delete plain.stats_total;
      delete plain.stats_groups;
      delete plain.stats_conditions;
      delete plain.stats_folders;
      delete plain.stats_enabled;
      return plain;
    });

    return {
      trees,
      total: count,
      page,
      limit,
    };
  }

  /**
   * Get a single tree by ID with its nested rule items
   */
  async function getTree(id) {
    const tree = await RuleTree.findByPk(id);
    if (!tree) return null;

    const items = await RuleItem.findAll({
      where: { rule_tree_id: id },
      order: [['sort_order', 'ASC']],
    });

    const plain = tree.get({ plain: true });
    plain.rules = buildTree(items);
    plain.stats = countRules(items);

    // Self-heal stored stats
    tree.update({
      stats_total: plain.stats.total,
      stats_groups: plain.stats.groups,
      stats_conditions: plain.stats.conditions,
      stats_folders: plain.stats.folders,
      stats_enabled: plain.stats.enabled,
    }).catch(() => {});

    delete plain.stats_total;
    delete plain.stats_groups;
    delete plain.stats_conditions;
    delete plain.stats_folders;
    delete plain.stats_enabled;

    return plain;
  }

  /**
   * Create a new rule tree
   */
  async function createTree(data) {
    const transaction = await sequelize.transaction();

    try {
      const tree = await RuleTree.create(
        {
          name: data.name,
          description: data.description || '',
          is_active: data.is_active !== false,
          repo_url: data.repo_url || null,
          branch: data.branch || null,
          commit_sha: data.commit_sha || null,
          git_tag: data.git_tag || null,
          graph_type: data.graph_type || 'conditional_logic',
          language: data.language || '',
        },
        { transaction },
      );

      // If initial rules provided, save them
      let flatItems = [];
      if (data.rules) {
        flatItems = flattenTree(data.rules, tree.id);
        if (flatItems.length > 0) {
          await RuleItem.bulkCreate(flatItems, { transaction });
        }
      }

      // Store pre-computed stats
      const stats = countRules(flatItems);
      await tree.update({
        stats_total: stats.total,
        stats_groups: stats.groups,
        stats_conditions: stats.conditions,
        stats_folders: stats.folders,
        stats_enabled: stats.enabled,
      }, { transaction });

      await transaction.commit();
      return getTree(tree.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Update a rule tree's metadata
   */
  async function updateTree(id, data) {
    const tree = await RuleTree.findByPk(id);
    if (!tree) return null;

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.repo_url !== undefined) updateData.repo_url = data.repo_url;
    if (data.branch !== undefined) updateData.branch = data.branch;
    if (data.commit_sha !== undefined) updateData.commit_sha = data.commit_sha;
    if (data.git_tag !== undefined) updateData.git_tag = data.git_tag;
    if (data.graph_type !== undefined) updateData.graph_type = data.graph_type;
    if (data.language !== undefined) updateData.language = data.language;

    if (Object.keys(updateData).length > 0) {
      await tree.update(updateData);
    }

    // Save rules if provided
    if (data.rules !== undefined) {
      await saveRules(id, data.rules);
    }

    return getTree(id);
  }

  /**
   * Delete a rule tree and all its items
   */
  async function deleteTree(id) {
    const transaction = await sequelize.transaction();

    try {
      const tree = await RuleTree.findByPk(id, { transaction });
      if (!tree) {
        await transaction.rollback();
        return false;
      }

      // Delete all items first (FK constraint)
      await RuleItem.destroy({
        where: { rule_tree_id: id },
        transaction,
      });

      await tree.destroy({ transaction });
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get rules for a specific tree (flat items from DB, returned as nested tree)
   */
  async function getRules(treeId) {
    const tree = await RuleTree.findByPk(treeId);
    if (!tree) return null;

    const items = await RuleItem.findAll({
      where: { rule_tree_id: treeId },
      order: [['sort_order', 'ASC']],
    });

    const nestedRules = buildTree(items);
    const stats = countRules(items);

    // Self-heal stored stats
    tree.update({
      stats_total: stats.total,
      stats_groups: stats.groups,
      stats_conditions: stats.conditions,
      stats_enabled: stats.enabled,
    }).catch(() => {});

    return {
      rules: nestedRules,
      stats,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Save rules for a tree (replace entire rule set)
   */
  async function saveRules(treeId, rules) {
    const transaction = await sequelize.transaction();

    try {
      const tree = await RuleTree.findByPk(treeId, { transaction });
      if (!tree) {
        await transaction.rollback();
        return null;
      }

      // Delete existing items
      await RuleItem.destroy({
        where: { rule_tree_id: treeId },
        transaction,
      });

      // Flatten and insert new items
      const flatItems = flattenTree(rules, treeId);
      if (flatItems.length > 0) {
        await RuleItem.bulkCreate(flatItems, { transaction });
      }

      // Store pre-computed stats
      const stats = countRules(flatItems);
      await tree.update({
        stats_total: stats.total,
        stats_groups: stats.groups,
        stats_conditions: stats.conditions,
        stats_folders: stats.folders,
        stats_enabled: stats.enabled,
      }, { transaction });

      await transaction.commit();

      // Return updated rules
      return getRules(treeId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  return {
    listTrees,
    getTree,
    createTree,
    updateTree,
    deleteTree,
    getRules,
    saveRules,
  };
}
