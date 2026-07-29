class ContactService {
  constructor(contactRepository) {
    this.repository = contactRepository;
  }

  async create(payload) {
    const contact = await this.repository.create(this.normalize(payload));

    return this.toResponse(contact);
  }

  async getAll({ page, size, sortBy, sortDir }) {
    const { rows, count } = await this.repository.findAll({
      limit: size,
      offset: page * size,
      sortBy,
      sortDir: sortDir.toUpperCase(),
    });
    const totalPages = Math.ceil(count / size);

    return {
      content: rows.map((contact) => this.toResponse(contact)),
      page,
      size,
      totalElements: count,
      totalPages,
      sort: `${sortBy},${sortDir}`,
      first: page === 0,
      last: page >= Math.max(totalPages - 1, 0),
    };
  }

  normalize(payload) {
    return {
      fullName: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      inquiryType: payload.inquiryType.trim(),
      subject: payload.subject.trim(),
      message: payload.message.trim(),
    };
  }

  toResponse(contact) {
    const value = typeof contact.toJSON === 'function' ? contact.toJSON() : contact;

    return {
      id: value.id,
      fullName: value.fullName,
      email: value.email,
      phone: value.phone,
      inquiryType: value.inquiryType,
      subject: value.subject,
      message: value.message,
      createdAt: value.createdAt,
    };
  }
}

module.exports = ContactService;
