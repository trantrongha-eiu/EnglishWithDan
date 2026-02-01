/**
 * Script để thêm dữ liệu IELTS Reading Test vào MongoDB
 * Chạy: node scripts/addReadingTest.js
 */

const mongoose = require('mongoose');
const ReadingTest = require('../models/ReadingTest');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/englishwithdan', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Dữ liệu mẫu IELTS Reading Test
const sampleReadingTests = [
  {
    title: "IELTS Reading Practice Test 1 - Academic",
    testType: "Academic",
    difficulty: "Medium",
    timeLimit: 60,
    passages: [
      {
        passageNumber: 1,
        title: "The History of the Telephone",
        text: `The invention of the telephone revolutionized communication in the 19th century. Alexander Graham Bell is widely credited as the inventor of the telephone, though several other inventors were working on similar devices around the same time. Bell's telephone was patented in 1876, and it rapidly became one of the most important inventions in human history.

The first telephone call was made on March 10, 1876, when Bell spoke to his assistant, Thomas Watson, saying the famous words: "Mr. Watson, come here, I want to see you." This simple message marked the beginning of a new era in human communication. Within a few years, telephone networks began to spread across cities, connecting businesses and homes.

By the early 20th century, the telephone had become a common feature in urban households throughout the developed world. The invention transformed not only personal communication but also business practices, emergency services, and social interactions. Today, with the advent of mobile phones and smartphones, the original vision of the telephone has evolved far beyond what Bell could have imagined.`,
        questions: [
          {
            questionNumber: 1,
            questionType: "Multiple Choice",
            question: "Who is credited as the inventor of the telephone?",
            options: [
              "Thomas Watson",
              "Alexander Graham Bell",
              "Thomas Edison",
              "Nikola Tesla"
            ],
            correctAnswer: "Alexander Graham Bell",
            explanation: "Đoạn đầu tiên nói rõ: 'Alexander Graham Bell is widely credited as the inventor of the telephone'"
          },
          {
            questionNumber: 2,
            questionType: "True/False/Not Given",
            question: "The first telephone call was made in 1876.",
            options: ["True", "False", "Not Given"],
            correctAnswer: "True",
            explanation: "Đoạn 2 nói: 'The first telephone call was made on March 10, 1876'"
          },
          {
            questionNumber: 3,
            questionType: "Multiple Choice",
            question: "What were the first words spoken on the telephone?",
            options: [
              "Hello, can you hear me?",
              "Mr. Watson, come here, I want to see you.",
              "The telephone is working!",
              "This is a historic moment."
            ],
            correctAnswer: "Mr. Watson, come here, I want to see you.",
            explanation: "Câu nói được trích dẫn chính xác trong đoạn văn"
          },
          {
            questionNumber: 4,
            questionType: "True/False/Not Given",
            question: "Telephone networks spread across cities within a few years of the first call.",
            options: ["True", "False", "Not Given"],
            correctAnswer: "True",
            explanation: "Đoạn 2 kết: 'Within a few years, telephone networks began to spread across cities'"
          },
          {
            questionNumber: 5,
            questionType: "Short-answer Questions",
            question: "In which century did the telephone become common in urban households?",
            options: [],
            correctAnswer: "20th century",
            explanation: "Đoạn 3: 'By the early 20th century, the telephone had become a common feature'"
          }
        ]
      },
      {
        passageNumber: 2,
        title: "Climate Change and Biodiversity",
        text: `Climate change poses one of the greatest threats to biodiversity in the 21st century. As global temperatures rise, ecosystems around the world are experiencing unprecedented changes. Species that cannot adapt quickly enough face extinction, while others may migrate to new habitats in search of suitable living conditions.

The impact of climate change on biodiversity is multifaceted. Rising temperatures affect the timing of natural events such as flowering, migration, and breeding. This can disrupt the delicate balance of ecosystems, where species have evolved to depend on each other. For example, if flowers bloom earlier due to warmer springs, but pollinators have not adjusted their life cycles accordingly, both species may suffer.

Coral reefs are particularly vulnerable to climate change. Ocean warming and acidification caused by increased carbon dioxide absorption have led to widespread coral bleaching events. These colorful marine ecosystems, which support approximately 25% of all marine species despite covering less than 1% of the ocean floor, are under severe threat.

Conservation efforts are crucial in mitigating the effects of climate change on biodiversity. Protected areas, wildlife corridors, and restoration projects can help species adapt to changing conditions. However, scientists warn that without significant reductions in greenhouse gas emissions, many of these efforts may prove insufficient to prevent mass extinctions in the coming decades.`,
        questions: [
          {
            questionNumber: 6,
            questionType: "Multiple Choice",
            question: "According to the passage, what is one way species respond to climate change?",
            options: [
              "They become extinct immediately",
              "They migrate to new habitats",
              "They stop reproducing",
              "They change their physical appearance"
            ],
            correctAnswer: "They migrate to new habitats",
            explanation: "Đoạn 1: 'others may migrate to new habitats in search of suitable living conditions'"
          },
          {
            questionNumber: 7,
            questionType: "True/False/Not Given",
            question: "Climate change only affects temperature and has no impact on timing of natural events.",
            options: ["True", "False", "Not Given"],
            correctAnswer: "False",
            explanation: "Đoạn 2 nói rõ: 'Rising temperatures affect the timing of natural events such as flowering, migration, and breeding'"
          },
          {
            questionNumber: 8,
            questionType: "Multiple Choice",
            question: "What percentage of marine species do coral reefs support?",
            options: [
              "1%",
              "10%",
              "25%",
              "50%"
            ],
            correctAnswer: "25%",
            explanation: "Đoạn 3: 'support approximately 25% of all marine species'"
          },
          {
            questionNumber: 9,
            questionType: "Matching Information",
            question: "Which paragraph discusses the vulnerability of coral reefs?",
            options: ["Paragraph 1", "Paragraph 2", "Paragraph 3", "Paragraph 4"],
            correctAnswer: "Paragraph 3",
            explanation: "Paragraph 3 nói chi tiết về coral reefs và ocean warming"
          },
          {
            questionNumber: 10,
            questionType: "Yes/No/Not Given",
            question: "The author believes conservation efforts alone can prevent mass extinctions.",
            options: ["Yes", "No", "Not Given"],
            correctAnswer: "No",
            explanation: "Đoạn cuối: 'without significant reductions in greenhouse gas emissions, many of these efforts may prove insufficient'"
          }
        ]
      },
      {
        passageNumber: 3,
        title: "The Psychology of Decision Making",
        text: `Decision making is a complex cognitive process that has fascinated psychologists for decades. Every day, humans make thousands of decisions, ranging from trivial choices like what to eat for breakfast to life-changing decisions such as choosing a career or life partner. Understanding how we make decisions can help us improve our judgment and avoid common pitfalls.

One influential theory in decision-making psychology is the dual-process theory, which suggests that humans use two distinct systems when making decisions. System 1 is fast, automatic, and intuitive, relying on mental shortcuts and past experiences. System 2 is slower, more deliberate, and analytical, requiring conscious effort and logical reasoning. Most of our daily decisions are made using System 1, which is efficient but can lead to cognitive biases.

Cognitive biases are systematic errors in thinking that affect our decisions and judgments. The confirmation bias, for instance, leads people to favor information that confirms their existing beliefs while ignoring contradictory evidence. The availability heuristic causes individuals to overestimate the likelihood of events that are easily recalled, often because they are recent or emotionally charged. Understanding these biases is the first step toward making better decisions.

Emotional factors also play a significant role in decision making. Research has shown that emotions can both help and hinder the decision-making process. Positive emotions can enhance creativity and lead to more flexible thinking, while negative emotions might cause people to be more cautious and analytical. However, intense emotions can cloud judgment and lead to impulsive choices that one might later regret.

The environment in which decisions are made also matters. Studies have demonstrated that factors such as time pressure, the number of options available, and even the physical state of the decision-maker (such as hunger or fatigue) can significantly influence choices. This has important implications for situations ranging from consumer behavior to medical decisions.

Finally, cultural background influences decision-making styles. Western cultures tend to emphasize individual autonomy and analytical thinking, while Eastern cultures often prioritize collective harmony and holistic reasoning. These cultural differences can lead to varied approaches when faced with the same decision-making scenario.`,
        questions: [
          {
            questionNumber: 11,
            questionType: "Multiple Choice",
            question: "According to dual-process theory, System 1 is characterized by:",
            options: [
              "Slow and analytical processing",
              "Fast and intuitive processing",
              "Conscious logical reasoning",
              "Deliberate decision making"
            ],
            correctAnswer: "Fast and intuitive processing",
            explanation: "Đoạn 2: 'System 1 is fast, automatic, and intuitive'"
          },
          {
            questionNumber: 12,
            questionType: "True/False/Not Given",
            question: "Most daily decisions are made using System 2.",
            options: ["True", "False", "Not Given"],
            correctAnswer: "False",
            explanation: "Đoạn 2 nói: 'Most of our daily decisions are made using System 1'"
          },
          {
            questionNumber: 13,
            questionType: "Matching Features",
            question: "Match the cognitive bias with its description: Confirmation bias",
            options: [
              "Favoring information that confirms existing beliefs",
              "Overestimating likelihood of easily recalled events",
              "Making decisions based on emotions",
              "Following group decisions"
            ],
            correctAnswer: "Favoring information that confirms existing beliefs",
            explanation: "Đoạn 3 định nghĩa confirmation bias rõ ràng"
          },
          {
            questionNumber: 14,
            questionType: "Yes/No/Not Given",
            question: "Emotions always negatively affect decision making.",
            options: ["Yes", "No", "Not Given"],
            correctAnswer: "No",
            explanation: "Đoạn 4: 'emotions can both help and hinder the decision-making process'"
          },
          {
            questionNumber: 15,
            questionType: "Multiple Choice",
            question: "According to the passage, which factor does NOT influence decision making?",
            options: [
              "Time pressure",
              "Physical state",
              "Astrological signs",
              "Number of options"
            ],
            correctAnswer: "Astrological signs",
            explanation: "Đoạn 5 liệt kê các yếu tố, không bao gồm astrological signs"
          },
          {
            questionNumber: 16,
            questionType: "Sentence Completion",
            question: "Western cultures tend to emphasize _____ and analytical thinking.",
            options: [],
            correctAnswer: "individual autonomy",
            explanation: "Đoạn cuối: 'Western cultures tend to emphasize individual autonomy and analytical thinking'"
          }
        ]
      }
    ]
  }
];

// Hàm thêm dữ liệu vào database
async function addReadingTests() {
  try {
    // Xóa dữ liệu cũ (nếu cần)
    // await ReadingTest.deleteMany({});
    
    // Thêm dữ liệu mới
    for (let testData of sampleReadingTests) {
      const test = new ReadingTest(testData);
      await test.save();
      console.log(`✅ Đã thêm: ${test.title}`);
    }
    
    console.log('\n🎉 Hoàn thành! Đã thêm tất cả bài test vào database.');
    
    // Hiển thị thống kê
    const count = await ReadingTest.countDocuments();
    console.log(`📊 Tổng số bài test trong database: ${count}`);
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Chạy script
addReadingTests();