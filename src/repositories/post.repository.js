const { Op, fn, col, where } = require('sequelize');
const Post = require('../models/post.model');

class PostRepository {
  async create(payload) {
    return Post.create(payload);
  }

  async findAll({ search, postType, postStatus, limit, offset, sortBy, sortDir, priorityFirst = false }) {
    const filters = {};

    if (postType) filters.postType = postType;
    if (postStatus) filters.postStatus = postStatus;

    if (search) {
      const searchFilters = [
        { postTitle: { [Op.like]: search } },
        { department: { [Op.like]: search } },
        { organization: { [Op.like]: search } },
        { qualification: { [Op.like]: search } },
        { stateName: { [Op.like]: search } },
      ];
      filters[Op.or] = searchFilters;
    }

    return Post.findAndCountAll({
      where: filters,
      limit,
      offset,
      order: [
        ...(priorityFirst ? [['priorityScore', 'ASC']] : []),
        [sortBy, sortDir],
        ['createdAt', 'DESC'],
      ],
      distinct: true,
    });
  }

  async findByPostId(postId) {
    return Post.findOne({ where: { postId } });
  }

  async findBySlug(postSlug) {
    return Post.findOne({ where: { postSlug } });
  }

  async findByTitleIgnoreCase(postTitle) {
    return Post.findOne({
      where: where(fn('LOWER', col('post_title')), postTitle.toLowerCase()),
    });
  }

  async update(post, payload) {
    return post.update(payload);
  }

  async delete(post) {
    return post.destroy();
  }
}

module.exports = PostRepository;
