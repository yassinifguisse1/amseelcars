/**
 * Extracts FAQ questions and answers from article HTML content.
 * Supports multilingual FAQ headings and common Q/A markup patterns.
 */
export function extractFAQs(content: string): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];

  const faqStartRegex =
    /<h2>\s*(?:Foire\s+aux\s+questions|FAQ|Frequently\s+Asked\s+Questions|Preguntas\s+frecuentes|Häufige\s+Fragen|Najczęściej\s+zadawane\s+pytania|Pytania\s+i\s+odpowiedzi)\s*<\/h2>/i;
  const faqStartMatch = content.match(faqStartRegex);

  if (!faqStartMatch) {
    return faqs;
  }

  const possibleEndMarkers = [
    /<h2>\s*Conclusion\s*<\/h2>/i,
    /<h2>\s*En\s+résumé\s*<\/h2>/i,
    /<h2>\s*Résumé\s*<\/h2>/i,
    /<h2>\s*Summary\s*<\/h2>/i,
    /<h2>\s*Resumen\s*<\/h2>/i,
    /<h2>\s*Zusammenfassung\s*<\/h2>/i,
    /<h2>\s*Podsumowanie\s*<\/h2>/i,
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

  const faqSection = content.substring(faqStartMatch.index!, faqEndIndex);

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

  for (let i = 0; i < questions.length; i++) {
    const questionEndIndex = questions[i].endIndex;
    const answerStart = faqSection.indexOf("<p>", questionEndIndex);

    if (answerStart === -1) continue;

    let answerEnd = faqSection.length;
    if (i + 1 < questions.length) {
      answerEnd = questions[i + 1].index;
    } else {
      const h2Match = faqSection.substring(answerStart).match(/<h2>/i);
      if (h2Match) {
        answerEnd = answerStart + h2Match.index!;
      }
    }

    let answer = faqSection.substring(answerStart, answerEnd);
    answer = answer.replace(/<\/?p>/g, "").trim();

    const question = questions[i].question
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    answer = answer
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (question && answer && answer.length > 10) {
      faqs.push({ question, answer });
    }
  }

  const dlPattern = /<dl>([\s\S]*?)<\/dl>/i;
  const dlMatch = faqSection.match(dlPattern);

  if (dlMatch) {
    const dlContent = dlMatch[1];
    const dtDdPattern =
      /<dt>([^<]+)<\/dt>\s*<dd>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/dd>/gi;

    let dtDdMatch;
    while ((dtDdMatch = dtDdPattern.exec(dlContent)) !== null) {
      const question = dtDdMatch[1].trim();
      let answer = dtDdMatch[2].trim();

      answer = answer
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (question && answer) {
        faqs.push({
          question: question.replace(/&nbsp;/g, " ").trim(),
          answer,
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
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: `<p>${faq.answer}</p>`,
      },
    })),
  };
}
