# Hostinger Deployment Guide for mtgpox.com

## Prerequisites
- Your Next.js app has been built with static export
- You have a Hostinger hosting account for mtgpox.com
- Access to your hosting control panel

## Build Process

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **The static files will be generated in the `out/` directory**

## Upload to Hostinger

### Method 1: Using File Manager (Recommended)

1. **Log into your Hostinger control panel**
2. **Navigate to File Manager**
3. **Go to your domain's public_html directory**
4. **Upload all contents from the `out/` folder to `public_html/`**

### Method 2: Using FTP

1. **Use an FTP client (FileZilla, WinSCP, etc.)**
2. **Connect to your Hostinger FTP server**
3. **Navigate to the `public_html` directory**
4. **Upload all contents from the `out/` folder**

## Important Notes

### File Structure
Make sure your `public_html` directory contains:
- `index.html` (main entry point)
- `_next/` folder (static assets)
- `images/` folder (your images)
- `.htaccess` file (routing configuration)
- All other HTML files and assets

### CORS Issues
Since we removed the API proxy for static export, external images (like Scryfall) might have CORS issues. If you encounter this:

1. **Option 1:** Use a CORS proxy service
2. **Option 2:** Download and host images locally
3. **Option 3:** Contact the external service to enable CORS

### Troubleshooting 403 Errors

If you still get 403 errors:

1. **Check file permissions:**
   - Files: 644
   - Directories: 755

2. **Verify .htaccess is uploaded:**
   - Make sure the `.htaccess` file is in your `public_html` directory
   - Ensure it's not hidden or corrupted

3. **Check Hostinger settings:**
   - Ensure mod_rewrite is enabled
   - Verify your hosting plan supports .htaccess

4. **Test with a simple file:**
   - Create a simple `test.html` file to verify basic access

### Performance Optimization

The `.htaccess` file includes:
- Gzip compression
- Browser caching
- Security headers
- Client-side routing support

## Verification

After upload:
1. Visit https://www.mtgpox.com
2. Test all pages and functionality
3. Check browser console for errors
4. Verify images load correctly
5. Test the test page at https://www.mtgpox.com/test.html

## Support

If you continue to have issues:
1. Check Hostinger's error logs
2. Contact Hostinger support
3. Verify your hosting plan supports all required features
