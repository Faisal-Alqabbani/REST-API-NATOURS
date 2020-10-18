class APIFeatuers {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObj = { ...this.queryString };
    const excludeFeild = ['page', 'sort', 'limit', 'fields'];
    excludeFeild.forEach((el) => delete queryObj[el]);
    // 1B)Advanced Filtering
    // { difficulty: 'easy', duration: { $gte: '5' } }
    // { difficulty: 'easy', duration: { gte: '5' } }
    // gte,gt,lte ,lt, eq

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query.find(JSON.parse(queryStr));
    return this;
    // let query = Tour.find(JSON.parse(queryStr));
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
      //localhost:3000/api/v1/tours?sort=-price,-ratingsAverage
      // query = query.sort(req.query.sort);
      // Sort price ratingsAvrage
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      //localhost:3000/api/v1/tours?fields=-name,-duration maens include evrey thing exapt name and dutaion
      //localhost:3000/api/v1/tours?fields=name,duration body include only the name and the duation
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
      // query = fields.select('name price something anything')
    } else {
      // Display all fields exaprt __v. exculde this feild
      this.query = this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    // page=3&limit=10, 1-10 , 11,20 21,30 page 3
    return this;
  }
}
module.exports = APIFeatuers;
