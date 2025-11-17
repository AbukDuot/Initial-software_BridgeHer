export const formatCloudinaryVideoUrl = (url) => {
  if (!url) return null;
  
 
  if (url.startsWith('http://') || url.startsWith('https://')) {
    
    if (url.includes('cloudinary.com')) {
      return url.replace('http://', 'https://');
    }
    return url;
  }
  
  
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/${url}`;
  }
  
  return url;
};
