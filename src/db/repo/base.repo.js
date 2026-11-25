export default (model) => {
    return {
      findOne: async ({ filter, projection, options, populate }) => {
        let data = await model
          .findOne(filter, projection, options)
          .populate(populate || undefined);
        return data;
      },
  
      findById: async ({ id, projection, options, populate }) => {
        let data = await model
          .findById(id, projection, options)
          .populate(populate || undefined);
        return data;
      },
  
      findOneAndUpdate: async ({ filter, update, options, populate }) => {
        let data = await model
          .findOneAndUpdate(filter, update, {
            returnDocument: "after",
            ...options,
          })
          .populate(populate || undefined);
        return data;
      },
  
      findByIdAndUpdate: async ({ id, update, options, populate }) => {
        let data = await model
          .findByIdAndUpdate(id, update, {
            returnDocument: "after",
            ...options,
          })
          .populate(populate || undefined);
        return data;
      },
  
       findOneAndDelete : async ({ filter,populate }) => {
        let data = await model.findOneAndDelete(filter);
        return data;
      },
  
      findByIdAndDelete : async ({ id,populate }) => {
        let data = await model.findByIdAndDelete(id);
        return data;
      },
      pagination: async ({ filter, page, limit, sort = undefined, populate }) => {
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        let skip = (page - 1) * limit;
        let query = model.find(filter).skip(skip).limit(limit);
        if (sort) {
          query.sort(sort);
        }
        if (populate) {
          query.populate(populate);
        }
        let data = await query.exec();
        const count = await model.countDocuments(filter);
        
        return {  count, data };
      },


      create: async ({ data, options }) => {
        let created = await model.create(data, options);
        return created;
      },
  
      updateOne: async ({ filter, update, options }) => {
        let data = await model.updateOne(filter, update, options);
        return data;
      },
  
      updateMany: async ({ filter, update, options }) => {
        let data = await model.updateMany(filter, update, options);
        return data;
      },
  
      deleteOne: async ({ filter }) => {
        let data = await model.deleteOne(filter);
        return data;
      },
  
      deleteMany: async ({ filter }) => {
        let data = await model.deleteMany(filter);
        return data;
      },
    };
  };
  

// let findOne = async ({ model, filter, projection, options,populate }) => {
//   let data = await model.findOne(filter, projection, options).populate(populate||undefined);
//   return data;
// };

// let findById = async ({ model, id, projection, options,populate }) => {
//   let data = await model.findById(id, projection, options).populate(populate||undefined);
//   return data;
// };

// let findOneAndUpdate = async ({ model, filter, update, options,populate }) => {
//   let data = await model.findOneAndUpdate(filter, update, {
//     returnDocument: "after",
//     ...options,
//   }).populate(populate||undefined);
//   return data;
// };

// let findByIdAndUpdate = async ({ model, id, update, options,populate }) => {
//   let data = await model.findByIdAndUpdate(id, update, {
//     returnDocument: "after",
//     ...options,
//   }).populate(populate||undefined);
//   return data;
// };

// // let findOneAndDelete = async ({ model, filter,populate }) => {
// //   let data = await model.findOneAndDelete(filter);
// //   return data;
// // };

// // let findByIdAndDelete = async ({ model, id,populate }) => {
// //   let data = await model.findByIdAndDelete(id);
// //   return data;
// // };
// let pagination = async ({ model, filter, page, limit, sort=undefined,populate }) => {
//   page = Number(page) || 1;
//   limit = Number(limit) || 10;
//   let skip = (page - 1) * limit;
//   let query =  model.find(filter).skip(skip).limit(limit);
//   if (sort) {
//     query.sort(sort);
//   }
//   if (populate) {
//     query.populate(populate);
//   }
//   return await query.exec();
// };
// let create = async ({ model, data, options }) => {
//   let data = await model.create(data, options);
//   return data;
// };

// let updateOne = async ({ model, filter, update, options }) => {
//   let data = await model.updateOne(filter, update, options);
//   return data;
// };

// let updateMany = async ({ model, filter, update, options }) => {
//   let data = await model.updateMany(filter, update, options);
//   return data;
// };

// let deleteOne = async ({ model, filter }) => {
//   let data = await model.deleteOne(filter);
//   return data;
// };

// let deleteMany = async ({ model, filter }) => {
//   let data = await model.deleteMany(filter);
//   return data;
// };
