export interface SurveyQuestion {
  text: string;
  options: string[];
}

export interface SurveyData {
  title: string;
  description: string;
  reward: number;
  questions: SurveyQuestion[];
}

export const SURVEY_QUESTIONS: Record<string, SurveyData> = {
  "1": {
    title: "Nairobi Market Trends 2026",
    description: "Consumer shopping habits in Nairobi retail outlets",
    reward: 50,
    questions: [
      { text: "How often do you shop at physical retail stores in Nairobi?", options: ["Daily", "Weekly", "Monthly", "Rarely", "Never"] },
      { text: "What type of products do you most frequently purchase in-store?", options: ["Groceries", "Clothing", "Electronics", "Household items", "Other"] },
      { text: "What factors most influence your shopping location choice?", options: ["Price", "Proximity to home", "Product variety", "Store atmosphere", "Customer service"] },
      { text: "How has your shopping frequency changed compared to 2024?", options: ["Increased significantly", "Increased slightly", "No change", "Decreased slightly", "Decreased significantly"] }
    ]
  },
  "2": {
    title: "Digital Payments in Kenya",
    description: "Mobile money and banking apps adoption feedback",
    reward: 80,
    questions: [
      { text: "Which mobile money service do you use most frequently?", options: ["M-Pesa", "Airtel Money", "T-Kash", "Equitel", "Bank app only"] },
      { text: "What is your biggest concern when using digital payments?", options: ["Security/Fraud", "Transaction fees", "Network downtime", "Poor customer service", "No concerns"] },
      { text: "How many digital payment transactions do you make weekly?", options: ["0-5", "6-20", "21-50", "50+", "Don't track"] },
      { text: "Have you ever lost money due to digital payment issues?", options: ["Yes, significant amount", "Yes, small amount", "No", "Not sure"] }
    ]
  },
  "3": {
    title: "Food Delivery Preferences",
    description: "Food delivery app choice factors",
    reward: 60,
    questions: [
      { text: "Which food delivery service do you use most?", options: ["Glovo", "Uber Eats", "Bolt Food", "Jumia Food", "None"] },
      { text: "What is the most important factor when choosing delivery?", options: ["Delivery speed", "Food quality", "Price", "Restaurant variety", "Promotions"] },
      { text: "How often do you order food delivery?", options: ["Daily", "2-3 times/week", "Weekly", "Monthly", "Rarely"] },
      { text: "What discourages you from ordering more frequently?", options: ["High fees", "Slow delivery", "Poor quality", "No good options", "Nothing"] }
    ]
  },
  "4": {
    title: "High-Value Real Estate",
    description: "Property investment preferences",
    reward: 1200,
    questions: [
      { text: "What is your investment budget for real estate?", options: ["Under 5M KES", "5-20M KES", "20-50M KES", "50-100M KES", "100M+ KES"] },
      { text: "Which property type interests you most?", options: ["Residential apartments", "Commercial offices", "Retail space", "Industrial", "Land"] },
      { text: "Preferred location for investment properties?", options: ["Nairobi CBD", "Westlands/Langata", "Kiambu/Ruaka", "Kilimani/Kileleshwa", "Other counties"] },
      { text: "What is your expected annual ROI?", options: ["5-8%", "8-12%", "12-18%", "18%+", "Not sure"] }
    ]
  },
  // Add more for other IDs...
  "default": {
    title: "General Market Research",
    description: "Consumer behavior survey",
    reward: 50,
    questions: [
      { text: "How often do you use mobile money apps?", options: ["Daily", "Weekly", "Monthly", "Rarely"] },
      { text: "Which is your primary mobile network provider?", options: ["Safaricom", "Airtel", "Telkom", "Equitel"] },
      { text: "What is your main concern when using digital financial tools?", options: ["Security", "Transaction Fees", "Network Reliability", "Ease of Use"] },
      { text: "Would you recommend these services to friends and family?", options: ["Definitely", "Probably", "Not sure", "Never"] }
    ]
  }
};

// Export function to get survey by ID
export const getSurveyById = (id: string): SurveyData => {
  return SURVEY_QUESTIONS[id as keyof typeof SURVEY_QUESTIONS] || SURVEY_QUESTIONS["default"];
};

