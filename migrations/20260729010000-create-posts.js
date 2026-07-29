'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('posts', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      post_id: {
        type: Sequelize.STRING(40),
        allowNull: false,
        unique: true,
      },
      post_title: {
        type: Sequelize.STRING(180),
        allowNull: false,
      },
      post_slug: {
        type: Sequelize.STRING(200),
        allowNull: false,
        unique: true,
      },
      content_html: {
        type: Sequelize.TEXT('medium'),
        allowNull: false,
      },
      application_id: Sequelize.STRING(60),
      department: Sequelize.STRING(120),
      organization: Sequelize.STRING(140),
      qualification: Sequelize.STRING(120),
      image_urls: Sequelize.TEXT,
      vacancies: Sequelize.INTEGER.UNSIGNED,
      start_date: Sequelize.DATEONLY,
      end_date: Sequelize.DATEONLY,
      state_name: Sequelize.STRING(80),
      seo_title: Sequelize.STRING(180),
      seo_description: Sequelize.STRING(320),
      seo_focus_keyword: Sequelize.STRING(160),
      faq_schema_json: Sequelize.TEXT,
      post_status: {
        type: Sequelize.ENUM('DRAFT', 'PENDING_REVIEW', 'SCHEDULED', 'PUBLISHED'),
        allowNull: false,
      },
      scheduled_at: Sequelize.DATE,
      post_type: {
        type: Sequelize.ENUM(
          'JOB',
          'ADMIT',
          'EXAM',
          'RESULT',
          'ADMISSION',
          'SYLLABUS',
          'ANSWER_KEY',
        ),
        allowNull: false,
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      priority_score: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('posts', ['post_type'], { name: 'idx_posts_type' });
    await queryInterface.addIndex('posts', ['post_status'], { name: 'idx_posts_status' });
    await queryInterface.addIndex('posts', ['created_at'], { name: 'idx_posts_created' });
    await queryInterface.addIndex('posts', ['post_type', 'post_status', 'created_at'], {
      name: 'idx_posts_type_status_created',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('posts');
  },
};
