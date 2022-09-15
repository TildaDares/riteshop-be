import { Model, Query } from "mongoose";
import { ParsedQs } from "qs";

class APIFunctions {
  query: Query<any, any>;
  queryFields: ParsedQs;
  total: number;
  model: Model<any>;

  constructor(query: Query<any, any>, queryFields: ParsedQs, model: Model<any>) {
    this.query = query;
    this.queryFields = queryFields;
    this.model = model
    this.total = 0;
  }

  filter() {
    let queryObj = { ...this.queryFields }
    const excludedFields = ['page', 'sort', 'limit', 'fields']
    excludedFields.forEach(el => delete queryObj[el])

    // keyword for searches
    if (this.queryFields.keyword) {
      queryObj = { ...queryObj, $text: { $search: this.queryFields.keyword } };
    }

    // Advanced filtering
    let queryString = JSON.stringify(queryObj)
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
    this.query = this.model.find(JSON.parse(queryString));
    return this
  }

  sort() {
    const sortStr = this.queryFields.sort as string
    if (this.queryFields.sort) {
      const sortBy = sortStr.split(',').join(' ')
      this.query = this.query.sort(sortBy)
    } else {
      this.query = this.query.sort('-createdAt')
    }
    return this
  }

  limitFields() {
    const limitStr = this.queryFields.fields as string
    if (this.queryFields.fields) {
      const fields = limitStr.split(',').join(' ')
      this.query = this.query.select(fields)
    } else {
      this.query = this.query.select('-__v')
    }
    return this
  }

  paginate() {
    const pageStr = Number(this.queryFields.page as string)
    const limitStr = Number(this.queryFields.limit as string)
    // page=2&limit=10, 1-10 page 1, 11-20 page 2, 21-30 page 3
    const page = pageStr * 1 || 1;
    const limit = limitStr * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this
  }

  async count() {
    this.total = await this.model.countDocuments();
    return this.total;
  }
}

export default APIFunctions