import Joi from "joi";

class BaseDTO {
  // we are not sure who will use this
  // we can override this schema and validate it
  // default empty schema
  // child classes will override this
  static schema = Joi.object({});

  static validate(data) {
    const { error, value } = this.schema.validate(data, {
      abortEarly: false, // do not stop at first error, return all errors
      stripUnknown: true, // if any unknowd data ignore it
    });

    if (error) {
      const errors = error.details.map((details) => details.message);
      return { errors, value: null };
    }
    return { errors: null, value };
  }
}

export default BaseDTO;
