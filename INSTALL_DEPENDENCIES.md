# Additional Dependencies to Install

## For Certificate Download Feature

Run this command in the frontend directory:

```bash
cd bridgeher-frontend
npm install html2canvas
```

This package is needed for the certificate download functionality to convert the certificate HTML to an image.

## All Dependencies Summary

The following packages should be installed:

### Frontend
- html2canvas (for certificate download)
- All other dependencies are already in package.json

### Backend
- All dependencies are already in package.json

## Verification

After installing, verify by running:
```bash
npm list html2canvas
```

You should see the package listed in the output.
