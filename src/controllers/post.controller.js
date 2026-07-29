const { successResponse } = require('../utils/api-response');

class PostController {
  constructor(postService) {
    this.service = postService;
  }

  create = async (req, res) => {
    const post = await this.service.create(req.body);
    return successResponse(res, {
      statusCode: 201,
      message: 'Post created successfully',
      data: post,
    });
  };

  getByPostId = async (req, res) => {
    const post = await this.service.getByPostId(req.params.postId);
    return successResponse(res, {
      message: 'Post fetched successfully',
      data: post,
    });
  };

  getAll = async (req, res) => {
    const posts = await this.service.getAll(req.query);
    return successResponse(res, {
      message: 'Posts fetched successfully',
      data: posts,
    });
  };

  update = async (req, res) => {
    const post = await this.service.update(req.params.postId, req.body);
    return successResponse(res, {
      message: 'Post updated successfully',
      data: post,
    });
  };

  delete = async (req, res) => {
    await this.service.delete(req.params.postId);
    return successResponse(res, {
      message: 'Post deleted successfully',
      data: null,
    });
  };
}

module.exports = PostController;
