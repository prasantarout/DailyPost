/**

 * @param {string} message - Success message to send.
 * @param {number} statusCode - HTTP status code.
 * @param {Object} data - Additional data to include in the response.
 * @returns {Object} - Standardized success response.
 */
const successResponse = (message, statusCode, data = {}) => {
    return {
      success: true,
      message,
      data,
      statusCode,
    };
  };
  
  module.exports = successResponse;
  