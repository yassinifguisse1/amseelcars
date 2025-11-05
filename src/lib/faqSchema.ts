/**
 * Extracts FAQ questions and answers from article content
 * Supports two formats:
 * 1. <p><strong>Question</strong></p> followed by <p>Answer</p>
 * 2. <p><strong>Question</strong><p> followed by <p>Answer</p>
 */
export function extractFAQs(content: string): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];
  
  // Find FAQ section
  const faqStartRegex = /<h2>\s*Foire\s+aux\s+questions\s*<\/h2>/i;
  const faqStartMatch = content.match(faqStartRegex);
  
  if (!faqStartMatch) {
    return faqs; // No FAQ section found
  }
  
  // Find end of FAQ section
  const possibleEndMarkers = [
    /<h2>\s*Conclusion\s*<\/h2>/i,
    /<h2>\s*En\s+résumé\s*<\/h2>/i,
    /<h2>\s*Résumé\s*<\/h2>/i,
    /<h2>\s*Final\s*<\/h2>/i,
  ];
  
  let faqEndIndex = content.length;
  for (const endRegex of possibleEndMarkers) {
    const endMatch = content.match(endRegex);
    if (endMatch && endMatch.index! > faqStartMatch.index!) {
      faqEndIndex = endMatch.index!;
      break;
    }
  }
  
  // Extract FAQ section
  const faqSection = content.substring(faqStartMatch.index!, faqEndIndex);
  
  // Pattern to match: <p><strong>Question</strong></p> or <p><strong>Question</strong><p> followed by <p>Answer</p>
  // Split by question pattern first, then process each pair
  const questionPattern = /<p><strong>([^<]+)<\/strong><\/?p>/gi;
  const questions: Array<{ index: number; endIndex: number; question: string }> = [];
  
  let qMatch;
  while ((qMatch = questionPattern.exec(faqSection)) !== null) {
    questions.push({
      index: qMatch.index,
      endIndex: qMatch.index + qMatch[0].length,
      question: qMatch[1].trim(),
    });
  }
  
  // Process each question-answer pair
  for (let i = 0; i < questions.length; i++) {
    const questionEndIndex = questions[i].endIndex;
    const answerStart = faqSection.indexOf('<p>', questionEndIndex);
    
    if (answerStart === -1) continue;
    
    // Find where answer ends (next question, h2, or end of section)
    let answerEnd = faqSection.length;
    if (i + 1 < questions.length) {
      answerEnd = questions[i + 1].index;
    } else {
      // Look for h2 tags
      const h2Match = faqSection.substring(answerStart).match(/<h2>/i);
      if (h2Match) {
        answerEnd = answerStart + h2Match.index!;
      }
    }
    
    // Extract answer text
    let answer = faqSection.substring(answerStart, answerEnd);
    // Remove <p> tags and clean up
    answer = answer.replace(/<\/?p>/g, '').trim();
    
    // Clean up question
    let question = questions[i].question
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Clean up answer
    answer = answer
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Only add if both question and answer exist and answer is substantial
    if (question && answer && answer.length > 10) {
      faqs.push({
        question: question,
        answer: answer,
      });
    }
  }
  
  // Also handle <dl> format (definition list) for article 1
  const dlPattern = /<dl>([\s\S]*?)<\/dl>/i;
  const dlMatch = faqSection.match(dlPattern);
  
  if (dlMatch) {
    const dlContent = dlMatch[1];
    // Match <dt>Question</dt> followed by <dd>Answer</dd>
    const dtDdPattern = /<dt>([^<]+)<\/dt>\s*<dd>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/dd>/gi;
    
    let dtDdMatch;
    while ((dtDdMatch = dtDdPattern.exec(dlContent)) !== null) {
      const question = dtDdMatch[1].trim();
      let answer = dtDdMatch[2].trim();
      
      answer = answer
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (question && answer) {
        faqs.push({
          question: question.replace(/&nbsp;/g, ' ').trim(),
          answer: answer,
        });
      }
    }
  }
  
  return faqs;
}

/**
 * Generates FAQPage schema in JSON-LD format
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  if (faqs.length === 0) {
    return null;
  }
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `<p>${faq.answer}</p>`,
      },
    })),
  };
}

