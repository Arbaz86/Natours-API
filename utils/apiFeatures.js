class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1A) Filtering
    // Create a shallow copy of queryString object
    let queryObj = { ...this.queryString };
    // Exclude fields that are not needed for filtering
    let excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced Filtering
    // Convert queryObj to a string and replace operators (gte, gt, lte, lt) with MongoDB syntax ($gte, $gt, $lte, $lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // Use find() method to filter data using the modified query string
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    // 2 Sorting
    // If there is a "sort" query parameter, use it to sort the data; otherwise sort by "createdAt" field in descending order
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  limitFields() {
    // 3) Limiting Fields
    // If there is a "fields" query parameter, use it to select the fields to be returned; otherwise exclude the "__v" field
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate() {
    // 4) Pagination
    // Set default values for page and limit if not provided in query; calculate skip based on page and limit
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
    const skip = (page - 1) * limit;

    // Use skip() and limit() methods to implement pagination
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
