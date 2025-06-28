# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in the OTP Verification System, please report it by emailing **ashishchaurasiya128@gmail.com**.

**Please do NOT report security vulnerabilities through public GitHub issues.**

### What to Include

When reporting a vulnerability, please include:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if any)
- Your contact information

### Response Time

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week  
- **Fix Timeline**: Varies based on severity

### Disclosure Policy

- We will acknowledge receipt of your vulnerability report
- We will provide an estimated timeline for a fix
- We will notify you when the vulnerability is fixed
- We will publicly disclose the vulnerability after a fix is available (with proper attribution if desired)

## Security Best Practices

When using this OTP verification system:

1. **Always use HTTPS** in production environments
2. **Set proper CORS origins** - don't use wildcards
3. **Use strong email authentication** (App passwords for Gmail)
4. **Monitor failed OTP attempts** and implement account lockout
5. **Set appropriate rate limits** based on your use case
6. **Keep dependencies updated** regularly
7. **Use environment variables** for sensitive configuration
8. **Implement proper logging** for security events

## Security Features

This system includes:

- ✅ Rate limiting to prevent brute force attacks
- ✅ Input validation and sanitization
- ✅ OTP expiration (default: 5 minutes)
- ✅ Secure random OTP generation
- ✅ Email validation
- ✅ CORS protection
- ✅ Error message standardization (no information leakage)

## Contact

**Author**: Ashish Chaurasiya  
**Email**: ashishchaurasiya128@gmail.com

For security issues: Email directly  
For general bugs: Use GitHub Issues
- Potential impact
- Suggested fix (if any)

### Response Timeline

- We will acknowledge receipt of your vulnerability report within 48 hours
- We will provide a detailed response within 7 days
- We will work on a fix and release timeline based on severity

### Security Best Practices

When using this OTP system:

1. **Environment Variables**: Always use environment variables for sensitive data
2. **HTTPS**: Only use in production with HTTPS
3. **Rate Limiting**: Configure appropriate rate limits for your use case
4. **Email Security**: Use app-specific passwords, not regular passwords
5. **OTP Expiry**: Keep OTP expiry times reasonable (5-10 minutes)
6. **Input Validation**: Always validate inputs on both client and server side

### Known Security Features

- Rate limiting to prevent brute force attacks
- OTP expiry to limit window of vulnerability
- Input sanitization and validation
- Secure random OTP generation
- Memory cleanup to prevent data leaks
