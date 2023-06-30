import asyncHandler from "express-async-handler";
import APIError from "./ApiError";
import {CREATED, NOT_FOUND, NO_CONTENT, OK} from "http-status";
import {RequestHandler} from "express";
import {ParamIsMongoIdDto} from "../middlewares/validation/validators";
import {PopulateOptions} from "mongoose";
import APIFeatures, {docsFilter} from "./ApiFeatures";

export default class CRUDController<CreateT, UpdateT> {
  constructor(
    public Model: any,
    public populationOpts?: PopulateOptions | (PopulateOptions | string)[]
  ) {}

  createOne: RequestHandler<unknown, unknown, CreateT> = asyncHandler(
    async (req, res, next) => {
      const doc = await this.Model.create(req.body);
      res.status(CREATED).json({
        status: "success",
        data: {
          doc,
        },
      });
    }
  );

  getOne: RequestHandler<ParamIsMongoIdDto> = asyncHandler(
    async (req, res, next) => {
      const {id} = req.params;
      let query = this.Model.findById(id).select("-__v");
      if (this.populationOpts) {
        query = query.populate(this.populationOpts);
      }
      const doc = await query;
      if (!doc) {
        return next(
          new APIError(`There is no document match this id: ${id}`, NOT_FOUND)
        );
      }
      res.status(OK).json({
        status: "success",
        data: {
          doc,
        },
      });
    }
  );

  updateOne: RequestHandler<ParamIsMongoIdDto, unknown, UpdateT> = asyncHandler(
    async (req, res, next) => {
      const {id} = req.params;

      const doc = await this.Model.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!doc) {
        return next(
          new APIError(`There is no document match this id : ${id}`, NOT_FOUND)
        );
      }
      res.status(OK).json({
        status: "success",
        data: {
          doc,
        },
      });
    }
  );

  deleteOne: RequestHandler<ParamIsMongoIdDto> = asyncHandler(
    async (req, res, next) => {
      const {id} = req.params;
      const doc = await this.Model.findByIdAndDelete(id);
      if (!doc) {
        return next(
          new APIError(`There is no snack match this id : ${id}`, NOT_FOUND)
        );
      }
      res.status(NO_CONTENT).json({
        status: "success",
      });
    }
  );

  deleteAll: RequestHandler = asyncHandler(async (req, res, next) => {
    await this.Model.deleteMany();
    res.status(NO_CONTENT).json({
      status: "success",
    });
  });

  getAll: RequestHandler = asyncHandler(async (req, res, next) => {
    //_TOTAL_NUM_OF_DOCUMENTS_//
    const totalNumOfDocs = await this.Model.countDocuments(
      docsFilter(req.query)
    );

    // Build query
    const apiFeatures = new APIFeatures(this.Model.find({}), req.query)
      .filter()
      .sort()
      .fields()
      .paginate(totalNumOfDocs);

    const {query, paginationStatus} = apiFeatures;

    //Execute query
    const docs = await query;

    res.status(OK).json({
      status: "success",
      totalNumOfDocs,
      paginationStatus,
      data: {
        docs,
      },
    });
  });
}
