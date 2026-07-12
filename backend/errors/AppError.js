'use strict';

// Base class for expected/handled errors — anything thrown as an AppError
// (or subclass) is safe to show `message` for directly to the client,
// unlike an unexpected programming error where the generic "Lỗi server"
// message must be shown instead (see errorHandler.js).
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Không tìm thấy') { super(message, 404); }
}

class ValidationError extends AppError {
  constructor(message = 'Dữ liệu không hợp lệ') { super(message, 400); }
}

class AuthenticationError extends AppError {
  constructor(message = 'Vui lòng đăng nhập') { super(message, 401); }
}

class AuthorizationError extends AppError {
  constructor(message = 'Không có quyền truy cập') { super(message, 403); }
}

// For failures calling out to Cloudinary/Gemini/OpenRouter/Resend/etc.
class ExternalServiceError extends AppError {
  constructor(message = 'Lỗi dịch vụ bên ngoài') { super(message, 502); }
}

class DatabaseError extends AppError {
  constructor(message = 'Lỗi cơ sở dữ liệu') { super(message, 500); }
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  ExternalServiceError,
  DatabaseError,
};
