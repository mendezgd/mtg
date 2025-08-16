# Domain Checklist for mtgpox.com

## ✅ Pre-Deployment Checklist

### Domain Configuration
- [ ] Domain `mtgpox.com` is registered and active
- [ ] DNS is properly configured to point to Hostinger
- [ ] SSL certificate is enabled for HTTPS
- [ ] www subdomain is configured (www.mtgpox.com)

### Hostinger Setup
- [ ] Hosting plan supports .htaccess files
- [ ] mod_rewrite is enabled
- [ ] File permissions are set correctly (644 for files, 755 for directories)

### Files Updated for Domain
- [x] `src/app/layout.tsx` - Updated metadataBase and OpenGraph URLs
- [x] `public/robots.txt` - Updated sitemap URL
- [x] `public/sitemap.xml` - Updated all URLs to mtgpox.com
- [x] `out/.htaccess` - Created for proper routing
- [x] `out/test.html` - Created for testing

## 📁 Files to Upload

Upload **ALL contents** from the `out/` directory to your Hostinger `public_html` folder:

```
out/
├── index.html                    ← Main entry point
├── .htaccess                     ← CRITICAL: Routing configuration
├── test.html                     ← Test page
├── _next/                        ← Static assets
├── images/                       ← Your images
├── deck-builder/
├── game/
├── life-counter/
├── timer/
├── tournament/
├── robots.txt                    ← SEO configuration
├── sitemap.xml                   ← SEO sitemap
├── site.webmanifest             ← PWA manifest
└── [favicon files...]
```

## 🔍 Post-Deployment Testing

### Basic Functionality
- [ ] https://www.mtgpox.com loads correctly
- [ ] https://www.mtgpox.com/test.html shows success message
- [ ] All pages are accessible (deck-builder, game, tournament, etc.)
- [ ] No 403 or 404 errors

### SEO & Metadata
- [ ] OpenGraph tags work correctly on social media
- [ ] Favicon displays properly
- [ ] Sitemap is accessible at https://www.mtgpox.com/sitemap.xml
- [ ] Robots.txt is accessible at https://www.mtgpox.com/robots.txt

### Performance
- [ ] Images load correctly
- [ ] CSS and JavaScript files load
- [ ] Page load times are acceptable
- [ ] No console errors

### CORS Issues (Expected)
- [ ] External Scryfall images may not load due to CORS
- [ ] Local images should work fine
- [ ] Consider implementing a CORS proxy if needed

## 🚨 Troubleshooting

### If you get 403 errors:
1. Check that `.htaccess` file is uploaded
2. Verify file permissions (644 for files, 755 for directories)
3. Ensure mod_rewrite is enabled in Hostinger
4. Test with the test.html file first

### If images don't load:
1. Check browser console for CORS errors
2. Verify image paths are correct
3. Consider using a CORS proxy for external images

### If routing doesn't work:
1. Verify `.htaccess` file is in the root directory
2. Check that mod_rewrite is enabled
3. Test direct file access vs. routing

## 📞 Support

If issues persist:
1. Check Hostinger error logs
2. Contact Hostinger support
3. Verify your hosting plan supports all required features
4. Test with a simple HTML file to isolate issues
