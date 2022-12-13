import { UniqueConstraintError, ValidationError, AggregateError } from 'sequelize';
import { APIError } from '../utils/api-errors.js'

export default (error, req, res) => {

    // catch api error
    if (error instanceof APIError) {
        return res.status(error.status).send({
        error: {
            code: error.status,
            message: error.message
        }
        });
    }

    // catch db error
    if (error instanceof UniqueConstraintError) {
        return res.status(400).send({
        error: {
            code: 400,
            message: `duplicate_${error.parent.constraint}`
        }
        });
    }
    if (error instanceof ValidationError) {
        return res.status(400).send({
        error: {
            code: 400,
            message: error.message
        }
        });
    }
    if (error instanceof AggregateError) {
        return res.status(400).send({
        error: {
            code: 400,
            message: error.errors[0].errors.errors[0].message
        }
        });
    }
    
    // connect all errors
    return res.status(500).send({
        error: {
        code: 500,
        message: error.message
        }
    });
};