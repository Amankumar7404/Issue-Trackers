export const getErrorMessage = (error) => {
  // No response means network/server connection problem
  if (!error.response) {
    return "Unable to connect to the server. Please try again.";
  }

  const status = error.response.status;
  const data = error.response.data;

  // Authentication error
  if (status === 401) {
    return "Invalid username or password.";
  }

  // Permission error
  if (status === 403) {
    return "You do not have permission to perform this action.";
  }

  // Not found
  if (status === 404) {
    return "The requested resource was not found.";
  }

  // Server error
  if (status >= 500) {
    return "Something went wrong on the server. Please try again later.";
  }

  // Validation / bad request
  if (status === 400) {
    if (typeof data === "object" && data !== null) {
      const messages = [];

      const extractMessages = (value) => {
        if (typeof value === "string") {
          messages.push(value);
          return;
        }

        if (Array.isArray(value)) {
          value.forEach(extractMessages);
          return;
        }

        if (typeof value === "object" && value !== null) {
          Object.values(value).forEach(extractMessages);
        }
      };

      extractMessages(data);

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }

    return "Invalid request. Please check your input.";
  }

  // Any other error
  return "Something went wrong. Please try again.";
};
