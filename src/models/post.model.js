const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { POST_TYPES, POST_STATUSES } = require('../constants/post.constants');

const Post = sequelize.define(
  'Post',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    postId: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
    },
    postTitle: {
      type: DataTypes.STRING(180),
      allowNull: false,
    },
    postSlug: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
    },
    contentHtml: {
      type: DataTypes.TEXT('medium'),
      allowNull: false,
    },
    applicationId: DataTypes.STRING(60),
    department: DataTypes.STRING(120),
    organization: DataTypes.STRING(140),
    qualification: DataTypes.STRING(120),
    imageUrls: DataTypes.TEXT,
    vacancies: DataTypes.INTEGER.UNSIGNED,
    startDate: DataTypes.DATEONLY,
    endDate: DataTypes.DATEONLY,
    stateName: DataTypes.STRING(80),
    seoTitle: DataTypes.STRING(180),
    seoDescription: DataTypes.STRING(320),
    seoFocusKeyword: DataTypes.STRING(160),
    faqSchemaJson: DataTypes.TEXT,
    postStatus: {
      type: DataTypes.ENUM(...POST_STATUSES),
      allowNull: false,
    },
    scheduledAt: DataTypes.DATE,
    postType: {
      type: DataTypes.ENUM(...POST_TYPES),
      allowNull: false,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    priorityScore: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'posts',
    timestamps: true,
    indexes: [
      { name: 'idx_posts_type', fields: ['post_type'] },
      { name: 'idx_posts_status', fields: ['post_status'] },
      { name: 'idx_posts_created', fields: ['created_at'] },
      {
        name: 'idx_posts_type_status_created',
        fields: ['post_type', 'post_status', 'created_at'],
      },
    ],
  },
);

module.exports = Post;
