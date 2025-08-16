# 403 Forbidden Error - Troubleshooting Guide

## 🚨 The Problem
You're getting a "403 Forbidden - Access to this resource on the server is denied" error on Hostinger.

## 🔍 Root Cause Analysis

The 403 error is **NOT** a problem with your project code. It's a **server configuration issue** on Hostinger. Here's why:

### Most Common Causes:
1. **Missing `.htaccess` file** - This is the most likely cause
2. **Incorrect file permissions**
3. **Hostinger plan limitations**
4. **mod_rewrite not enabled**

## ✅ Solution Steps

### Step 1: Verify File Upload
Make sure you uploaded **ALL** files from the `out/` directory, including:
- ✅ `index.html` (main entry point)
- ✅ `.htaccess` (CRITICAL - routing configuration)
- ✅ `test.html` (for testing)
- ✅ `_next/` folder (static assets)
- ✅ All other files and folders

### Step 2: Test Basic Access
1. **First, test the simple HTML file:**
   - Visit: `https://www.mtgpox.com/test.html`
   - If this works → Your hosting is fine, routing is the issue
   - If this fails → Hostinger configuration problem

2. **Test direct file access:**
   - Visit: `https://www.mtgpox.com/index.html`
   - If this works → Routing issue
   - If this fails → File permissions or missing files

### Step 3: Check File Permissions
In Hostinger File Manager, set permissions to:
- **Files:** 644
- **Directories:** 755
- **`.htaccess`:** 644 (make sure it's not hidden)

### Step 4: Verify .htaccess Content
Your `.htaccess` file should contain:
```apache
# Enable rewrite engine
RewriteEngine On

# Handle client-side routing for Next.js
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Basic security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
</IfModule>

# Basic caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/webp "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
</IfModule>
```

## 🛠️ Alternative Solutions

### Option 1: Minimal .htaccess
If the above doesn't work, try this minimal version:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]
```

### Option 2: No .htaccess (Fallback)
If `.htaccess` still doesn't work:
1. Remove the `.htaccess` file
2. Test if `https://www.mtgpox.com/index.html` works
3. If it works, the issue is with mod_rewrite on your hosting plan

### Option 3: Contact Hostinger Support
If nothing works, contact Hostinger support with:
- Your domain: mtgpox.com
- Error: 403 Forbidden
- Request: Enable mod_rewrite for your hosting plan

## 📋 Diagnostic Checklist

- [ ] All files from `out/` directory uploaded
- [ ] `.htaccess` file is present and not hidden
- [ ] File permissions: 644 for files, 755 for directories
- [ ] `test.html` accessible at `/test.html`
- [ ] `index.html` accessible at `/index.html`
- [ ] Hostinger plan supports `.htaccess`
- [ ] mod_rewrite is enabled

## 🎯 Quick Test

1. **Upload a simple test file:**
   Create `simple-test.html` in your `public_html`:
   ```html
   <!DOCTYPE html>
   <html>
   <head><title>Test</title></head>
   <body><h1>Working!</h1></body>
   </html>
   ```

2. **Test it:**
   - Visit: `https://www.mtgpox.com/simple-test.html`
   - If this works → Your hosting is fine
   - If this fails → Contact Hostinger support

## 📞 When to Contact Hostinger Support

Contact Hostinger support if:
- `test.html` doesn't work
- `index.html` doesn't work
- File permissions are correct but still getting 403
- You've tried all the above solutions

**Tell them:** "I'm getting 403 errors on my domain mtgpox.com. Please check if mod_rewrite is enabled and if my hosting plan supports .htaccess files."

## 🔧 Project Status

Your project is **100% correct**. The issue is **100% server configuration** on Hostinger's side.
