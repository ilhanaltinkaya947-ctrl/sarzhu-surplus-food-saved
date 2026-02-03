// Strict content moderation utility
// Filters profanity, sexual content, and inappropriate language

// Comprehensive list of blocked words (obfuscated variations included)
const blockedPatterns = [
  // Profanity (English)
  /\bf+u+c+k+/gi, /\bs+h+i+t+/gi, /\ba+s+s+h+o+l+e/gi, /\bb+i+t+c+h/gi,
  /\bd+a+m+n/gi, /\bc+u+n+t/gi, /\bd+i+c+k/gi, /\bc+o+c+k/gi,
  /\bp+u+s+s+y/gi, /\bw+h+o+r+e/gi, /\bs+l+u+t/gi, /\bb+a+s+t+a+r+d/gi,
  /\bp+r+i+c+k/gi, /\bt+w+a+t/gi, /\bn+i+g+g/gi, /\bf+a+g+/gi,
  /\br+e+t+a+r+d/gi, /\bc+r+a+p/gi, /\bh+e+l+l\b/gi, /\ba+s+s\b/gi,
  
  // Sexual content
  /\bs+e+x+y*\b/gi, /\bp+o+r+n/gi, /\bn+u+d+e/gi, /\bn+a+k+e+d/gi,
  /\bx+x+x/gi, /\bb+o+o+b/gi, /\bt+i+t+s*/gi, /\bp+e+n+i+s/gi,
  /\bv+a+g+i+n+a/gi, /\bo+r+g+a+s+m/gi, /\be+r+o+t+i+c/gi,
  /\bh+o+r+n+y/gi, /\bb+o+n+e+r/gi, /\bc+u+m+\b/gi, /\bj+i+z+z/gi,
  /\bb+l+o+w+j+o+b/gi, /\bh+a+n+d+j+o+b/gi, /\bf+e+l+l+a+t+i+o/gi,
  
  // Hate speech
  /\bk+i+l+l\s*(your)?s+e+l+f/gi, /\bh+a+t+e\s*(you|u)/gi,
  /\bd+i+e\b/gi, /\bs+u+i+c+i+d+e/gi,
  
  // Russian profanity
  /\bбля/gi, /\bхуй/gi, /\bпизд/gi, /\bсук/gi, /\bеб/gi,
  /\bмуд/gi, /\bжоп/gi, /\bдерьм/gi, /\bгавн/gi, /\bтвар/gi,
  
  // Leetspeak variations
  /\bf+[uo0]+[ck]+/gi, /\bs+h+[i1]+[t7]+/gi, /\ba+[s5$]+[s5$]+/gi,
  /\bb+[i1]+[t7]+c+h+/gi, /\bp+[o0]+r+n+/gi,
  
  // Phone/contact solicitation patterns
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // Phone numbers
  /whatsapp/gi, /telegram/gi, /snapchat/gi, /onlyfans/gi,
];

// Check if content contains blocked words/patterns
export function containsInappropriateContent(text: string): boolean {
  if (!text) return false;
  
  const normalizedText = text
    .toLowerCase()
    .replace(/[0@]/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[4@]/g, 'a')
    .replace(/[5$]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[8]/g, 'b')
    .replace(/[\s_.-]+/g, '');
  
  for (const pattern of blockedPatterns) {
    if (pattern.test(text) || pattern.test(normalizedText)) {
      return true;
    }
  }
  
  return false;
}

// Sanitize text by replacing inappropriate content with asterisks
export function sanitizeContent(text: string): string {
  if (!text) return text;
  
  let sanitized = text;
  
  for (const pattern of blockedPatterns) {
    sanitized = sanitized.replace(pattern, (match) => '*'.repeat(match.length));
  }
  
  return sanitized;
}

// Validate review content - returns error message or null if valid
export function validateReviewContent(comment: string): string | null {
  if (!comment || comment.trim().length === 0) {
    return null; // Empty comments are allowed
  }
  
  if (comment.length > 1000) {
    return "Comment must be under 1000 characters";
  }
  
  if (containsInappropriateContent(comment)) {
    return "Your review contains inappropriate language. Please revise and try again.";
  }
  
  // Check for excessive caps (shouting)
  const capsRatio = (comment.match(/[A-Z]/g) || []).length / comment.length;
  if (comment.length > 10 && capsRatio > 0.7) {
    return "Please avoid using excessive capital letters.";
  }
  
  // Check for spam patterns (repeated characters)
  if (/(.)\1{4,}/.test(comment)) {
    return "Please avoid using repeated characters.";
  }
  
  return null;
}

// Validate reply content (for shop owners)
export function validateReplyContent(reply: string): string | null {
  if (!reply || reply.trim().length === 0) {
    return "Reply cannot be empty";
  }
  
  if (reply.length > 500) {
    return "Reply must be under 500 characters";
  }
  
  if (containsInappropriateContent(reply)) {
    return "Your reply contains inappropriate language. Please revise.";
  }
  
  return null;
}
