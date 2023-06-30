export const docsFilter = (queryString: any) => {
  // a) exclude "sort", "fields", "keyword", "page", "limit" from query params
  const queryObject = {...queryString};
  const excludesFields = ["sort", "fields", "keyword", "page", "limit"];
  excludesFields.forEach((field) => delete queryObject[field]);
  // b) filter by [$gte,$gt,$lte,$lt] operators
  let queryStr = JSON.stringify(queryObject);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  return JSON.parse(queryStr);
};

interface Pagination {
  currentPage?: number;
  numOfItemsPerPage?: number;
  numOfPages?: number;
  nextPage?: number;
  previousPage?: number;
}

export default class APIFeatures {
  public paginationStatus!: Pagination;

  constructor(public query: any, public queryString: any) {}
  // 1) FILTERING
  filter() {
    this.query = this.query.find(docsFilter(this.queryString));

    // To chain other methods
    return this;
  }

  // 2) SORTING
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      // DEFAULT SORTING (Newest First)
      this.query = this.query.sort("-createdAt");
    }
    // To chain other methods
    return this;
  }

  // 3) LIMIT FIELDS
  fields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    // To chain other methods
    return this;
  }

  // 5) PAGINATION
  paginate(totalNumOfDocs: number) {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 30;
    const skip = (page - 1) * limit;

    // PAGINATION_STATUS (nextPage,previousPage,numOfPages,currentPage, numOfItemsPerPage)

    let pagination: Pagination = {};

    pagination.currentPage = page;
    pagination.numOfItemsPerPage = limit;
    /*  ex: totalNumOfDocs = 19,
            limit = 3,
            numOfPages = totalNumOfDocs / limit = 19 / 3 = 6.333
            numOfPages = 7 pages
    */
    pagination.numOfPages = Math.ceil(totalNumOfDocs / limit);

    const lastItemIdxInPage = page * limit;
    // Q: when nextPage is exist?
    if (lastItemIdxInPage < totalNumOfDocs) {
      pagination.nextPage = page + 1;
    }
    // Q: when previousPage is exist?
    if (skip > 0) {
      pagination.previousPage = page - 1;
    }
    this.query = this.query.skip(skip).limit(limit);
    this.paginationStatus = pagination;

    // To chain other methods
    return this;
  }
}
