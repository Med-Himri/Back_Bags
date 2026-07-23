const applyToJSONTransform = (schema) => {
    schema.set("toJSON", {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    });
  };
  
  module.exports = applyToJSONTransform;
  