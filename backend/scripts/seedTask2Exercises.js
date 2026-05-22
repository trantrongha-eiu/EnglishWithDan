/**
 * Seed script for Task2Topic collection
 * 18 topics across 12 weeks â€” 3 sample questions each (beginner + elementary + intermediate)
 * Run: node backend/scripts/seedTask2Exercises.js
 */

const topics = [
  // â”€â”€â”€ BLOCK 1: Week 1-2 â€” Advantages & Disadvantages / Technology & Media â”€â”€â”€
  {
    week: 1, block: 'advantages_disadvantages', orderIndex: 1,
    topicName: 'Technology in Education', topicEmoji: 'đŸ–¥ï¸',
    essayType: 'advantages_disadvantages',
    prompt: 'Many schools now offer online learning as an alternative to in-person classes. What are the advantages and disadvantages of this trend?',
    hintAdvantages: ['flexible schedule', 'cost-effective', 'accessible from anywhere'],
    hintDisadvantages: ['lack of face-to-face interaction', 'lower motivation', 'technical difficulties'],
    vocabularyList: [
      { term: 'online learning', definitionVi: 'há»c trá»±c tuyáº¿n', example: 'Online learning offers flexibility for working adults.' },
      { term: 'in-person classes', definitionVi: 'lá»›p há»c trá»±c tiáº¿p', example: 'Many students prefer in-person classes for better interaction.' },
      { term: 'flexible schedule', definitionVi: 'lá»‹ch há»c linh hoáº¡t', example: 'A flexible schedule allows students to study at their own pace.' },
      { term: 'self-discipline', definitionVi: 'tĂ­nh ká»· luáº­t tá»± giĂ¡c', example: 'Online learning requires strong self-discipline.' },
      { term: 'social isolation', definitionVi: 'sá»± cĂ´ láº­p xĂ£ há»™i', example: 'Studying alone can lead to social isolation.' },
      { term: 'face-to-face interaction', definitionVi: 'giao tiáº¿p máº·t Ä‘á»‘i máº·t', example: 'Face-to-face interaction helps build stronger relationships between students and teachers.' },
      { term: 'access to education', definitionVi: 'tiáº¿p cáº­n giĂ¡o dá»¥c', example: 'The internet expands access to education for people in remote areas.' },
      { term: 'remote area', definitionVi: 'vĂ¹ng sĂ¢u vĂ¹ng xa', example: 'Students in remote areas benefit greatly from online learning.' },
      { term: 'digital fatigue', definitionVi: 'má»‡t má»i vĂ¬ mĂ n hĂ¬nh sá»‘', example: 'Spending too much time online can lead to digital fatigue.' },
      { term: 'academic performance', definitionVi: 'káº¿t quáº£ há»c táº­p', example: 'Poor motivation negatively affects academic performance.' },
      { term: 'working adults', definitionVi: 'ngÆ°á»i Ä‘i lĂ m', example: 'Online learning is particularly beneficial for working adults.' },
      { term: 'cost-effective', definitionVi: 'tiáº¿t kiá»‡m chi phĂ­', example: 'Online courses are generally more cost-effective than traditional classes.' },
      { term: 'technical difficulties', definitionVi: 'sá»± cá»‘ ká»¹ thuáº­t', example: 'Students in rural areas often face technical difficulties when studying online.' },
      { term: 'digital literacy', definitionVi: 'hiá»ƒu biáº¿t vá» cĂ´ng nghá»‡ sá»‘', example: 'Digital literacy is now an essential skill for modern students.' },
      { term: 'interactive platform', definitionVi: 'ná»n táº£ng tÆ°Æ¡ng tĂ¡c', example: 'Interactive platforms make online learning more engaging.' }
    ],
    questions: [
      {
        questionId: 'w1t1_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Äá»c Ä‘á» bĂ i sau vĂ  cho biáº¿t Ä‘Ă¢y lĂ  dáº¡ng essay nĂ o?\n\n"Many schools now offer online learning as an alternative to in-person classes. What are the advantages and disadvantages of this trend?"',
        options: ['Agree or Disagree', 'Advantages & Disadvantages', 'Discuss Both Views', 'Cause & Solution'],
        correctAnswer: 'Advantages & Disadvantages',
        explanationVi: 'Keyword "advantages and disadvantages" trong cĂ¢u há»i xĂ¡c Ä‘á»‹nh ngay Ä‘Ă¢y lĂ  dáº¡ng Advantages & Disadvantages. Dáº¡ng nĂ y yĂªu cáº§u phĂ¢n tĂ­ch cáº£ hai máº·t tĂ­ch cá»±c vĂ  tiĂªu cá»±c má»™t cĂ¡ch cĂ¢n báº±ng.'
      },
      {
        questionId: 'w1t1_q02', level: 'beginner', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Äiá»n tá»« cĂ²n thiáº¿u Ä‘á»ƒ hoĂ n chá»‰nh cĂ¢u má»Ÿ bĂ i:\n\n"In recent _____, online learning has become an increasingly prominent feature of modern education."',
        correctAnswer: 'years',
        explanationVi: "CĂ´ng thá»©c má»Ÿ bĂ i chuáº©n: 'In recent years...' â€” luĂ´n dĂ¹ng 'years' (sá»‘ nhiá»u). ÄĂ¢y lĂ  cĂ¡ch báº¯t Ä‘áº§u essay há»c thuáº­t ráº¥t phá»• biáº¿n."
      },
      {
        questionId: 'w1t1_q03', level: 'beginner', orderIndex: 3,
        type: 'topic_sentence',
        questionText: 'Chá»n Thesis Statement phĂ¹ há»£p nháº¥t cho bĂ i essay dáº¡ng Advantages & Disadvantages vá» online learning:',
        options: [
          'Online learning is better than in-person classes.',
          'This essay will examine both the advantages and disadvantages of online learning.',
          'I strongly agree that online learning should replace traditional schools.',
          'The government should invest more in online education.'
        ],
        correctAnswer: 'This essay will examine both the advantages and disadvantages of online learning.',
        explanationVi: "Thesis statement cá»§a Advantages & Disadvantages essay pháº£i nĂªu rĂµ bĂ i sáº½ phĂ¢n tĂ­ch Cáº¢ HAI máº·t. CĂ¡c lá»±a chá»n khĂ¡c thá»ƒ hiá»‡n láº­p trÆ°á»ng má»™t chiá»u, khĂ´ng phĂ¹ há»£p vá»›i dáº¡ng bĂ i nĂ y."
      },
      {
        questionId: 'w1t1_q04', level: 'beginner', orderIndex: 4,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Nhiá»u trÆ°á»ng Ä‘áº¡i há»c Ä‘Ă£ báº¯t Ä‘áº§u cung cáº¥p khĂ³a há»c trá»±c tuyáº¿n Ä‘á»ƒ sinh viĂªn cĂ³ thá»ƒ há»c á»Ÿ báº¥t cá»© Ä‘Ă¢u."',
        correctAnswer: 'Many universities have started offering online learning courses so that students can study anywhere.',
        modelAnswer: 'Many universities have started offering online learning courses so that students can study anywhere.',
        fallbackKeywords: ['universities', 'online learning', 'courses', 'students', 'anywhere'],
        explanationVi: "Cáº¥u trĂºc 'so that + má»‡nh Ä‘á» má»¥c Ä‘Ă­ch' diá»…n táº£ káº¿t quáº£ mong muá»‘n. 'have started + V-ing' dĂ¹ng Present Perfect Ä‘á»ƒ nháº¥n máº¡nh sá»± thay Ä‘á»•i gáº§n Ä‘Ă¢y."
      },
      {
        questionId: 'w1t1_q05', level: 'beginner', orderIndex: 5,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Há»c trá»±c tuyáº¿n mang láº¡i lá»‹ch há»c linh hoáº¡t cho nhá»¯ng ngÆ°á»i Ä‘i lĂ m."',
        correctAnswer: 'Online learning provides a flexible schedule for working adults.',
        modelAnswer: 'Online learning provides a flexible schedule for working adults.',
        fallbackKeywords: ['online learning', 'flexible schedule', 'working adults'],
        explanationVi: "'Provide + N + for + N' lĂ  cáº¥u trĂºc diá»…n táº£ lá»£i Ă­ch. 'Working adults' = nhá»¯ng ngÆ°á»i vá»«a Ä‘i lĂ m vá»«a há»c."
      },
      {
        questionId: 'w1t1_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Há»c online cĂ³ thá»ƒ dáº«n Ä‘áº¿n thiáº¿u sá»± tÆ°Æ¡ng tĂ¡c trá»±c tiáº¿p giá»¯a há»c sinh vĂ  giĂ¡o viĂªn."',
        correctAnswer: 'Online learning can lead to a lack of face-to-face interaction between students and teachers.',
        modelAnswer: 'Online learning can lead to a lack of face-to-face interaction between students and teachers.',
        fallbackKeywords: ['online learning', 'face-to-face', 'interaction', 'students', 'teachers'],
        explanationVi: "'Lead to + N' = dáº«n Ä‘áº¿n. 'A lack of + N' = sá»± thiáº¿u há»¥t cá»§a. ÄĂ¢y lĂ  cĂ¡ch diá»…n Ä‘áº¡t nhÆ°á»£c Ä‘iá»ƒm ráº¥t chuáº©n trong IELTS."
      },
      {
        questionId: 'w1t1_q07', level: 'elementary', orderIndex: 7,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Há»c online cĂ³ thá»ƒ gĂ¢y ra sá»± cĂ´ láº­p xĂ£ há»™i vĂ¬ há»c sinh cĂ³ Ă­t cÆ¡ há»™i giao lÆ°u vá»›i báº¡n bĂ¨ hÆ¡n."',
        correctAnswer: 'Online learning may cause social isolation as students have fewer opportunities to interact with peers.',
        modelAnswer: 'Online learning may cause social isolation as students have fewer opportunities to interact with peers.',
        fallbackKeywords: ['social isolation', 'students', 'opportunities', 'peers', 'interact'],
        explanationVi: "'As + má»‡nh Ä‘á»' giáº£i thĂ­ch nguyĂªn nhĂ¢n. 'Fewer opportunities to + V' = Ă­t cÆ¡ há»™i hÆ¡n Ä‘á»ƒ lĂ m gĂ¬. 'Peers' = báº¡n cĂ¹ng trang lá»©a."
      },
      {
        questionId: 'w1t1_q08', level: 'elementary', orderIndex: 8,
        type: 'rearrange',
        questionText: 'Sáº¯p xáº¿p cĂ¡c tá»«/cá»¥m tá»« sau thĂ nh cĂ¢u hoĂ n chá»‰nh:\n[of online learning / significant / One / advantage / the / most / is / its flexibility]',
        correctAnswer: 'One of the most significant advantages of online learning is its flexibility.',
        modelAnswer: 'One of the most significant advantages of online learning is its flexibility.',
        fallbackKeywords: ['significant', 'advantages', 'online learning', 'flexibility'],
        explanationVi: "Cáº¥u trĂºc 'One of the most + adj + N + of + N + is + N' dĂ¹ng Ä‘á»ƒ nháº¥n máº¡nh má»™t Ä‘iá»ƒm ná»•i báº­t nháº¥t. 'Significant' = Ä‘Ă¡ng ká»ƒ, quan trá»ng."
      },
      {
        questionId: 'w1t1_q09', level: 'elementary', orderIndex: 9,
        type: 'error_correction',
        questionText: 'CĂ¢u sau cĂ³ lá»—i ngá»¯ phĂ¡p. HĂ£y sá»­a láº¡i:\n\n"Although online learning has many advantages, but it also has some disadvantages."',
        correctAnswer: 'Although online learning has many advantages, it also has some disadvantages.',
        modelAnswer: 'Although online learning has many advantages, it also has some disadvantages.',
        fallbackKeywords: ['although', 'online learning', 'advantages', 'disadvantages'],
        explanationVi: "Lá»—i: KhĂ´ng dĂ¹ng 'Although' vĂ  'but' cĂ¹ng lĂºc trong má»™t cĂ¢u. Chá»n má»™t: 'Although..., [no but]' hoáº·c '..., but...' (xĂ³a Although)."
      },
      {
        questionId: 'w1t1_q10', level: 'elementary', orderIndex: 10,
        type: 'topic_sentence',
        questionText: 'Chá»n topic sentence tá»‘t nháº¥t cho Ä‘oáº¡n vÄƒn vá» Æ¯U ÄIá»‚M cá»§a online learning:',
        options: [
          'Online learning is very popular nowadays.',
          'One of the main advantages of online learning is its flexibility and convenience.',
          'Online learning has some disadvantages that cannot be ignored.',
          'Many students prefer studying in traditional classrooms.'
        ],
        correctAnswer: 'One of the main advantages of online learning is its flexibility and convenience.',
        explanationVi: "Topic sentence pháº£i nĂªu rĂµ luáº­n Ä‘iá»ƒm chĂ­nh cá»§a Ä‘oáº¡n. 'One of the main advantages' giá»›i thiá»‡u trá»±c tiáº¿p ná»™i dung sáº½ phĂ¢n tĂ­ch. CĂ¡c lá»±a chá»n khĂ¡c quĂ¡ chung chung hoáº·c láº¡c Ä‘á»."
      },
      {
        questionId: 'w1t1_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Internet giĂºp má»Ÿ rá»™ng cÆ¡ há»™i tiáº¿p cáº­n giĂ¡o dá»¥c cho ngÆ°á»i dĂ¢n á»Ÿ vĂ¹ng sĂ¢u vĂ¹ng xa."',
        correctAnswer: 'The Internet helps expand access to education for people in remote areas.',
        modelAnswer: 'The Internet helps expand access to education for people in remote areas.',
        fallbackKeywords: ['internet', 'access', 'education', 'remote areas'],
        explanationVi: "'Expand access to + N' = má»Ÿ rá»™ng kháº£ nÄƒng tiáº¿p cáº­n. 'Remote areas' = vĂ¹ng sĂ¢u vĂ¹ng xa. ÄĂ¢y lĂ  láº­p luáº­n á»§ng há»™ online learning ráº¥t thuyáº¿t phá»¥c."
      },
      {
        questionId: 'w1t1_q12', level: 'intermediate', orderIndex: 12,
        type: 'paraphrase',
        questionText: 'Paraphrase cĂ¢u sau (viáº¿t láº¡i theo nghÄ©a tÆ°Æ¡ng Ä‘Æ°Æ¡ng):\n\n"Many schools now offer online learning as an alternative to in-person classes."',
        correctAnswer: 'Nowadays, an increasing number of educational institutions are providing digital instruction as a substitute for traditional face-to-face teaching.',
        modelAnswer: 'Nowadays, an increasing number of educational institutions are providing digital instruction as a substitute for traditional face-to-face teaching.',
        fallbackKeywords: ['educational institutions', 'digital', 'substitute', 'traditional', 'teaching'],
        explanationVi: "Paraphrase tá»‘t thay 'schools' â†’ 'educational institutions', 'offer' â†’ 'providing', 'alternative' â†’ 'substitute', 'in-person' â†’ 'face-to-face'. KhĂ´ng Ä‘Æ°á»£c giá»¯ nguyĂªn quĂ¡ nhiá»u tá»« gá»‘c."
      },
      {
        questionId: 'w1t1_q13', level: 'intermediate', orderIndex: 13,
        type: 'short_writing',
        questionText: 'Viáº¿t 1 Ä‘oáº¡n body paragraph (~80-100 tá»«) vá» Má»˜T Æ¯U ÄIá»‚M cá»§a online learning.\n\nDĂ¹ng cáº¥u trĂºc: Topic Sentence â†’ Explanation â†’ Example â†’ Result\nGá»£i Ă½: flexibility / working adults / self-paced learning',
        modelAnswer: 'One of the most significant advantages of online learning is its flexibility, which particularly benefits working adults. Unlike traditional classroom settings, online platforms allow students to access lectures and complete assignments at their own pace, without being constrained by fixed timetables. For example, a full-time employee can study after work hours or during weekends, making it possible to pursue higher qualifications without sacrificing their career. As a result, online learning has opened up educational opportunities for millions of people who would otherwise be unable to attend conventional classes.',
        fallbackKeywords: ['flexibility', 'online learning', 'working adults', 'own pace', 'access', 'educational opportunities'],
        explanationVi: "Cáº¥u trĂºc PEEL: Point (topic sentence) â†’ Explain (giáº£i thĂ­ch táº¡i sao) â†’ Example (vĂ­ dá»¥ cá»¥ thá»ƒ) â†’ Link (káº¿t ná»‘i láº¡i chá»§ Ä‘á»). Má»—i body paragraph chá»‰ nĂªu Má»˜T Ă½ chĂ­nh duy nháº¥t."
      },
      {
        questionId: 'w1t1_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "online learning"):\n\n"Nhiá»u trÆ°á»ng Ä‘áº¡i há»c Ä‘Ă£ báº¯t Ä‘áº§u cung cáº¥p khĂ³a há»c trá»±c tuyáº¿n Ä‘á»ƒ sinh viĂªn cĂ³ thá»ƒ há»c á»Ÿ báº¥t cá»© Ä‘Ă¢u."',
        correctAnswer: 'Many universities have started offering online learning courses so that students can study anywhere.',
        modelAnswer: 'Many universities have started offering online learning courses so that students can study anywhere.',
        fallbackKeywords: ['online learning', 'universities', 'offering', 'students', 'anywhere'],
        explanationVi: "'Online learning' lĂ  danh tá»« ghĂ©p khĂ´ng cáº§n máº¡o tá»«. Cáº¥u trĂºc 'so that + clause' diá»…n Ä‘áº¡t má»¥c Ä‘Ă­ch cá»§a hĂ nh Ä‘á»™ng."
      },
      {
        questionId: 'w1t1_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "in-person classes"):\n\n"Má»™t sá»‘ ngÆ°á»i cho ráº±ng lá»›p há»c trá»±c tiáº¿p giĂºp há»c sinh tÆ°Æ¡ng tĂ¡c hiá»‡u quáº£ hÆ¡n."',
        correctAnswer: 'Some people argue that in-person classes help students interact more effectively.',
        modelAnswer: 'Some people argue that in-person classes help students interact more effectively.',
        fallbackKeywords: ['in-person classes', 'students', 'interact', 'effectively'],
        explanationVi: "'In-person classes' = lá»›p há»c trá»±c tiáº¿p (Ä‘á»‘i láº­p vá»›i online). 'Argue that' = cho ráº±ng, láº­p luáº­n ráº±ng â€” dĂ¹ng khi trĂ¬nh bĂ y quan Ä‘iá»ƒm há»c thuáº­t."
      },
      {
        questionId: 'w1t1_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "virtual classroom"):\n\n"Trong lá»›p há»c áº£o, giĂ¡o viĂªn vĂ  há»c sinh giao tiáº¿p thĂ´ng qua cĂ¡c ná»n táº£ng trá»±c tuyáº¿n."',
        correctAnswer: 'In a virtual classroom, teachers and students communicate through online platforms.',
        modelAnswer: 'In a virtual classroom, teachers and students communicate through online platforms.',
        fallbackKeywords: ['virtual classroom', 'teachers', 'students', 'communicate', 'online platforms'],
        explanationVi: "'Virtual classroom' = lá»›p há»c áº£o. 'Communicate through' = giao tiáº¿p thĂ´ng qua â€” dĂ¹ng 'through' thay cho 'via' trong vÄƒn phong há»c thuáº­t."
      },
      {
        questionId: 'w1t1_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "distance education"):\n\n"GiĂ¡o dá»¥c tá»« xa táº¡o cÆ¡ há»™i cho nhá»¯ng ngÆ°á»i khĂ´ng thá»ƒ Ä‘áº¿n trÆ°á»ng."',
        correctAnswer: 'Distance education creates opportunities for those who are unable to attend school in person.',
        modelAnswer: 'Distance education creates opportunities for those who are unable to attend school in person.',
        fallbackKeywords: ['distance education', 'opportunities', 'unable to attend', 'in person'],
        explanationVi: "'Distance education' = giĂ¡o dá»¥c tá»« xa. 'Those who are unable to' = nhá»¯ng ngÆ°á»i khĂ´ng thá»ƒ â€” 'unable to' mang sáº¯c thĂ¡i chĂ­nh thá»©c hÆ¡n 'cannot'."
      },
      {
        questionId: 'w1t1_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "blended learning"):\n\n"Há»c káº¿t há»£p giĂºp cĂ¢n báº±ng giá»¯a sá»± linh hoáº¡t vĂ  tÆ°Æ¡ng tĂ¡c trá»±c tiáº¿p."',
        correctAnswer: 'Blended learning helps strike a balance between flexibility and face-to-face interaction.',
        modelAnswer: 'Blended learning helps strike a balance between flexibility and face-to-face interaction.',
        fallbackKeywords: ['blended learning', 'balance', 'flexibility', 'face-to-face interaction'],
        explanationVi: "'Blended learning' = há»c káº¿t há»£p online vĂ  offline. 'Strike a balance between A and B' = cĂ¢n báº±ng giá»¯a hai yáº¿u tá»‘ â€” collocation cá»‘ Ä‘á»‹nh quan trá»ng."
      },
      {
        questionId: 'w1t1_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "digital literacy"):\n\n"Sinh viĂªn cáº§n cĂ³ kháº£ nÄƒng sá»­ dá»¥ng cĂ´ng nghá»‡ sá»‘ Ä‘á»ƒ há»c hiá»‡u quáº£."',
        correctAnswer: 'Students need digital literacy skills to learn effectively in the modern era.',
        modelAnswer: 'Students need digital literacy skills to learn effectively in the modern era.',
        fallbackKeywords: ['digital literacy', 'students', 'skills', 'effectively'],
        explanationVi: "'Digital literacy' = kháº£ nÄƒng hiá»ƒu biáº¿t vĂ  sá»­ dá»¥ng cĂ´ng nghá»‡ sá»‘. 'In the modern era' = trong thá»i Ä‘áº¡i hiá»‡n Ä‘áº¡i â€” thĂªm vĂ o cuá»‘i cĂ¢u Ä‘á»ƒ nĂ¢ng tĂ­nh há»c thuáº­t."
      },
      {
        questionId: 'w1t1_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "technological advancement"):\n\n"Sá»± phĂ¡t triá»ƒn cá»§a cĂ´ng nghá»‡ hiá»‡n Ä‘áº¡i Ä‘Ă£ thay Ä‘á»•i cĂ¡ch chĂºng ta há»c táº­p."',
        correctAnswer: 'Technological advancement has transformed the way we learn.',
        modelAnswer: 'Technological advancement has transformed the way we learn.',
        fallbackKeywords: ['technological advancement', 'transformed', 'the way we learn'],
        explanationVi: "'Technological advancement' = sá»± tiáº¿n bá»™ cĂ´ng nghá»‡ (há»c thuáº­t hÆ¡n 'development'). 'Transform' máº¡nh hÆ¡n 'change' â€” thá»ƒ hiá»‡n sá»± thay Ä‘á»•i sĂ¢u sáº¯c."
      },
      {
        questionId: 'w1t1_q21', level: 'intermediate', orderIndex: 21,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "self-discipline"):\n\n"Há»c online yĂªu cáº§u ngÆ°á»i há»c cĂ³ tĂ­nh ká»· luáº­t tá»± giĂ¡c cao."',
        correctAnswer: 'Online learning requires learners to have a high level of self-discipline.',
        modelAnswer: 'Online learning requires learners to have a high level of self-discipline.',
        fallbackKeywords: ['self-discipline', 'online learning', 'requires', 'high level'],
        explanationVi: "'Require + O + to V' = yĂªu cáº§u ai lĂ m gĂ¬. 'A high level of self-discipline' = má»©c Ä‘á»™ tá»± giĂ¡c cao â€” 'level of + noun' lĂ  cáº¥u trĂºc hay dĂ¹ng trong IELTS."
      },
      {
        questionId: 'w1t1_q22', level: 'intermediate', orderIndex: 22,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "time management skills"):\n\n"Há»c sinh cáº§n rĂ¨n luyá»‡n ká»¹ nÄƒng quáº£n lĂ½ thá»i gian Ä‘á»ƒ theo ká»‹p tiáº¿n Ä‘á»™ há»c."',
        correctAnswer: 'Students need to develop time management skills to keep up with their studies.',
        modelAnswer: 'Students need to develop time management skills to keep up with their studies.',
        fallbackKeywords: ['time management skills', 'develop', 'keep up', 'studies'],
        explanationVi: "'Time management skills' = ká»¹ nÄƒng quáº£n lĂ½ thá»i gian. 'Keep up with' = theo ká»‹p â€” phrasal verb quan trá»ng trong vÄƒn phong há»c thuáº­t."
      },
      {
        questionId: 'w1t1_q23', level: 'intermediate', orderIndex: 23,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "internet connectivity"):\n\n"á» má»™t sá»‘ vĂ¹ng nĂ´ng thĂ´n, káº¿t ná»‘i Internet váº«n lĂ  má»™t thĂ¡ch thá»©c lá»›n."',
        correctAnswer: 'In some rural areas, internet connectivity remains a significant challenge.',
        modelAnswer: 'In some rural areas, internet connectivity remains a significant challenge.',
        fallbackKeywords: ['internet connectivity', 'rural areas', 'remains', 'significant challenge'],
        explanationVi: "'Internet connectivity' = kháº£ nÄƒng káº¿t ná»‘i Internet. 'Remains' thay cho 'is still' â€” lá»‹ch sá»± vĂ  há»c thuáº­t hÆ¡n. 'Significant challenge' = thĂ¡ch thá»©c Ä‘Ă¡ng ká»ƒ."
      }
    ]
  },
  {
    week: 1, block: 'advantages_disadvantages', orderIndex: 2,
    topicName: 'Mobile Devices and Communication', topicEmoji: 'đŸ“±',
    essayType: 'advantages_disadvantages',
    prompt: 'The widespread use of smartphones and tablets has changed the way people communicate. Do the advantages of this development outweigh the disadvantages?',
    hintAdvantages: ['instant communication', 'supports remote work', 'access to information'],
    hintDisadvantages: ['addiction', 'reduced face-to-face interaction', 'health issues'],
    vocabularyList: [
      { term: 'widespread', definitionVi: 'phá»• biáº¿n rá»™ng rĂ£i', example: 'The widespread use of technology has changed our lives.' },
      { term: 'digital addiction', definitionVi: 'nghiá»‡n cĂ´ng nghá»‡ sá»‘', example: 'Digital addiction is a growing problem among teenagers.' },
      { term: 'face-to-face interaction', definitionVi: 'giao tiáº¿p trá»±c tiáº¿p', example: 'Face-to-face interaction is important for building relationships.' },
      { term: 'interpersonal relationship', definitionVi: 'má»‘i quan há»‡ giá»¯a ngÆ°á»i vá»›i ngÆ°á»i', example: 'Overuse of smartphones can damage interpersonal relationships.' },
      { term: 'screen time', definitionVi: 'thá»i gian sá»­ dá»¥ng mĂ n hĂ¬nh', example: 'Excessive screen time can harm children\'s mental health.' },
      { term: 'instant communication', definitionVi: 'giao tiáº¿p tá»©c thĂ¬', example: 'Smartphones enable instant communication across the globe.' },
      { term: 'proliferation', definitionVi: 'sá»± phá»• biáº¿n rá»™ng rĂ£i', example: 'The proliferation of mobile devices has transformed daily life.' },
      { term: 'overdependence', definitionVi: 'sá»± phá»¥ thuá»™c quĂ¡ má»©c', example: 'Overdependence on technology can reduce critical thinking skills.' },
      { term: 'mental well-being', definitionVi: 'sá»©c khá»e tĂ¢m tháº§n', example: 'Excessive screen time can harm the mental well-being of children.' },
      { term: 'mobile device', definitionVi: 'thiáº¿t bá»‹ di Ä‘á»™ng', example: 'Mobile devices have become indispensable tools in modern life.' },
      { term: 'communication pattern', definitionVi: 'máº«u giao tiáº¿p', example: 'Smartphones have fundamentally altered communication patterns.' },
      { term: 'social media platform', definitionVi: 'ná»n táº£ng máº¡ng xĂ£ há»™i', example: 'Social media platforms allow users to connect worldwide.' },
      { term: 'human interaction', definitionVi: 'sá»± tÆ°Æ¡ng tĂ¡c giá»¯a con ngÆ°á»i', example: 'Excessive phone use can diminish quality human interaction.' },
      { term: 'connectivity', definitionVi: 'kháº£ nÄƒng káº¿t ná»‘i', example: 'Smartphones provide unparalleled connectivity to the internet.' },
      { term: 'distraction', definitionVi: 'sá»± phĂ¢n tĂ¢m', example: 'Smartphones are a major source of distraction in classrooms.' }
    ],
    questions: [
      {
        questionId: 'w1t2_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Äá»c Ä‘á» bĂ i: "Do the advantages of this development outweigh the disadvantages?" â€” ÄĂ¢y lĂ  dáº¡ng essay nĂ o vĂ  yĂªu cáº§u gĂ¬?',
        options: [
          'Báº¡n chá»‰ nĂªu Æ°u Ä‘iá»ƒm',
          'Báº¡n Ä‘Æ°a ra Ă½ kiáº¿n xem Æ°u Ä‘iá»ƒm hay nhÆ°á»£c Ä‘iá»ƒm nhiá»u hÆ¡n',
          'Báº¡n tháº£o luáº­n cáº£ hai quan Ä‘iá»ƒm cá»§a ngÆ°á»i khĂ¡c',
          'Báº¡n nĂªu nguyĂªn nhĂ¢n vĂ  giáº£i phĂ¡p'
        ],
        correctAnswer: 'Báº¡n Ä‘Æ°a ra Ă½ kiáº¿n xem Æ°u Ä‘iá»ƒm hay nhÆ°á»£c Ä‘iá»ƒm nhiá»u hÆ¡n',
        explanationVi: "CĂ¢u há»i 'Do the advantages outweigh?' yĂªu cáº§u báº¡n so sĂ¡nh hai máº·t vĂ  Ä‘Æ°a ra Ă½ kiáº¿n rĂµ rĂ ng vá» bĂªn nĂ o ná»•i trá»™i hÆ¡n. ÄĂ¢y lĂ  biáº¿n thá»ƒ cá»§a Advantages & Disadvantages essay cĂ³ kĂ¨m láº­p trÆ°á»ng cĂ¡ nhĂ¢n."
      },
      {
        questionId: 'w1t2_q02', level: 'beginner', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Äiá»n tá»« cĂ²n thiáº¿u:\n\n"The _____ use of smartphones has transformed the way people communicate with each other."',
        correctAnswer: 'widespread',
        explanationVi: "'Widespread' = phá»• biáº¿n rá»™ng rĂ£i. Cá»¥m 'the widespread use of + N' lĂ  collocation há»c thuáº­t quan trá»ng trong IELTS. Láº¥y trá»±c tiáº¿p tá»« Ä‘á» bĂ i â€” hĂ£y há»c thuá»™c."
      },
      {
        questionId: 'w1t2_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Nhá» cĂ³ Internet, con ngÆ°á»i cĂ³ thá»ƒ giao tiáº¿p tá»©c thá»i dĂ¹ á»Ÿ báº¥t ká»³ Ä‘Ă¢u trĂªn tháº¿ giá»›i."',
        correctAnswer: 'Thanks to the Internet, people can communicate instantly no matter where they are in the world.',
        modelAnswer: 'Thanks to the Internet, people can communicate instantly no matter where they are in the world.',
        fallbackKeywords: ['internet', 'communicate', 'instantly', 'world'],
        explanationVi: "'Thanks to + N' = nhá» cĂ³. 'No matter where' = dĂ¹ á»Ÿ báº¥t ká»³ Ä‘Ă¢u. 'Instantly' = tá»©c thĂ¬ â€” adverb quan trá»ng Ä‘á»ƒ mĂ´ táº£ giao tiáº¿p qua smartphone."
      },
      {
        questionId: 'w1t2_q04', level: 'beginner', orderIndex: 4,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Viá»‡c sá»­ dá»¥ng Ä‘iá»‡n thoáº¡i quĂ¡ má»©c cĂ³ thá»ƒ dáº«n Ä‘áº¿n nghiá»‡n cĂ´ng nghá»‡ sá»‘."',
        correctAnswer: 'Excessive use of smartphones can lead to digital addiction.',
        modelAnswer: 'Excessive use of smartphones can lead to digital addiction.',
        fallbackKeywords: ['excessive', 'smartphones', 'digital addiction'],
        explanationVi: "'Excessive use of' = viá»‡c sá»­ dá»¥ng quĂ¡ má»©c. 'Lead to + N' = dáº«n Ä‘áº¿n. 'Digital addiction' lĂ  thuáº­t ngá»¯ há»c thuáº­t phĂ¹ há»£p hÆ¡n 'phone addiction'."
      },
      {
        questionId: 'w1t2_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Viá»‡c láº¡m dá»¥ng Ä‘iá»‡n thoáº¡i cĂ³ thá»ƒ áº£nh hÆ°á»Ÿng tiĂªu cá»±c Ä‘áº¿n cĂ¡c má»‘i quan há»‡ giá»¯a ngÆ°á»i vá»›i ngÆ°á»i."',
        correctAnswer: 'Overuse of smartphones can negatively affect interpersonal relationships.',
        modelAnswer: 'Overuse of smartphones can negatively affect interpersonal relationships.',
        fallbackKeywords: ['overuse', 'smartphones', 'interpersonal relationships'],
        explanationVi: "'Overuse' = láº¡m dá»¥ng (danh tá»«/Ä‘á»™ng tá»«). 'Negatively affect' = áº£nh hÆ°á»Ÿng tiĂªu cá»±c Ä‘áº¿n. 'Interpersonal relationships' = má»‘i quan há»‡ giá»¯a ngÆ°á»i vá»›i ngÆ°á»i â€” cá»¥m tá»« há»c thuáº­t quan trá»ng."
      },
      {
        questionId: 'w1t2_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Thá»i gian sá»­ dá»¥ng mĂ n hĂ¬nh quĂ¡ nhiá»u cĂ³ thá»ƒ gĂ¢y háº¡i cho sá»©c khá»e tĂ¢m tháº§n cá»§a tráº» em."',
        correctAnswer: 'Excessive screen time can harm the mental well-being of children.',
        modelAnswer: 'Excessive screen time can harm the mental well-being of children.',
        fallbackKeywords: ['screen time', 'mental well-being', 'children', 'harm'],
        explanationVi: "'Screen time' = thá»i gian dĂ¹ng mĂ n hĂ¬nh. 'Mental well-being' = sá»©c khá»e tĂ¢m tháº§n (academic hÆ¡n 'mental health'). 'Harm' = gĂ¢y háº¡i (verb máº¡nh hÆ¡n 'affect negatively')."
      },
      {
        questionId: 'w1t2_q07', level: 'elementary', orderIndex: 7,
        type: 'rearrange',
        questionText: 'Sáº¯p xáº¿p cĂ¡c tá»«/cá»¥m tá»« sau thĂ nh cĂ¢u hoĂ n chá»‰nh:\n[smartphones / Whilst / have / many advantages, / they / also / have / serious drawbacks]',
        correctAnswer: 'Whilst smartphones have many advantages, they also have serious drawbacks.',
        modelAnswer: 'Whilst smartphones have many advantages, they also have serious drawbacks.',
        fallbackKeywords: ['smartphones', 'advantages', 'drawbacks'],
        explanationVi: "'Whilst' = trong khi (formal hÆ¡n 'while'). 'Drawbacks' = nhÆ°á»£c Ä‘iá»ƒm (academic hÆ¡n 'disadvantages'). Cáº¥u trĂºc 'Whilst X, Y' dĂ¹ng Ä‘á»ƒ thá»ƒ hiá»‡n sá»± tÆ°Æ¡ng pháº£n."
      },
      {
        questionId: 'w1t2_q08', level: 'elementary', orderIndex: 8,
        type: 'error_correction',
        questionText: 'CĂ¢u sau cĂ³ lá»—i ngá»¯ phĂ¡p. HĂ£y sá»­a láº¡i:\n\n"Mobile technology makes people to communicate faster than before."',
        correctAnswer: 'Mobile technology makes people communicate faster than before.',
        modelAnswer: 'Mobile technology makes people communicate faster than before.',
        fallbackKeywords: ['mobile technology', 'communicate', 'faster'],
        explanationVi: "Lá»—i: Sau 'make + object' dĂ¹ng bare infinitive (Ä‘á»™ng tá»« nguyĂªn thá»ƒ khĂ´ng 'to'). Cáº¥u trĂºc: 'make + O + V (bare)'. KhĂ´ng dĂ¹ng 'to' sau 'make' theo nghÄ©a causative."
      },
      {
        questionId: 'w1t2_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Con ngÆ°á»i ngĂ y cĂ ng phá»¥ thuá»™c quĂ¡ má»©c vĂ o cĂ´ng nghá»‡ trong cuá»™c sá»‘ng hĂ ng ngĂ y."',
        correctAnswer: 'People are increasingly showing overdependence on technology in their daily lives.',
        modelAnswer: 'People are increasingly showing overdependence on technology in their daily lives.',
        fallbackKeywords: ['overdependence', 'technology', 'daily lives', 'increasingly'],
        explanationVi: "'Overdependence on + N' = sá»± phá»¥ thuá»™c quĂ¡ má»©c vĂ o. 'Increasingly' = ngĂ y cĂ ng (adverb nháº¥n máº¡nh xu hÆ°á»›ng). DĂ¹ng Present Continuous nháº¥n máº¡nh xu hÆ°á»›ng Ä‘ang diá»…n ra."
      },
      {
        questionId: 'w1t2_q10', level: 'intermediate', orderIndex: 10,
        type: 'paraphrase',
        questionText: 'Paraphrase cĂ¢u sau:\n\n"The widespread use of smartphones and tablets has changed the way people communicate."',
        correctAnswer: 'The proliferation of mobile devices has fundamentally transformed human interaction and communication patterns.',
        modelAnswer: 'The proliferation of mobile devices has fundamentally transformed human interaction and communication patterns.',
        fallbackKeywords: ['proliferation', 'mobile devices', 'transformed', 'communication', 'patterns'],
        explanationVi: "'Proliferation' = sá»± phá»• biáº¿n rá»™ng rĂ£i (thay 'widespread use'). 'Fundamentally transformed' = thay Ä‘á»•i cÄƒn báº£n (máº¡nh hÆ¡n 'changed'). 'Communication patterns' = máº«u giao tiáº¿p."
      },
      {
        questionId: 'w1t2_q11', level: 'intermediate', orderIndex: 11,
        type: 'short_writing',
        questionText: 'Viáº¿t 1 Ä‘oáº¡n body paragraph (~80-100 tá»«) láº­p luáº­n ráº±ng Æ°u Ä‘iá»ƒm cá»§a smartphone VÆ¯á»¢T TRá»˜I hÆ¡n nhÆ°á»£c Ä‘iá»ƒm.\n\nGá»£i Ă½: instant communication / remote work / access to information',
        modelAnswer: 'On balance, the advantages of smartphones significantly outweigh their disadvantages. The most compelling benefit is that these devices enable instant communication across vast distances, allowing people to maintain relationships and collaborate professionally regardless of location. Furthermore, smartphones provide unprecedented access to information, education, and services, empowering individuals in both developed and developing nations. While concerns about addiction and reduced face-to-face interaction are valid, these can be managed through responsible usage habits. Overall, the transformative impact of smartphones on connectivity and productivity makes them an overwhelmingly positive development.',
        fallbackKeywords: ['advantages', 'outweigh', 'communication', 'access', 'information', 'connectivity', 'productivity'],
        explanationVi: "Dáº¡ng 'outweigh' essay cáº§n nĂªu láº­p trÆ°á»ng ngay á»Ÿ topic sentence, sau Ä‘Ă³ trĂ¬nh bĂ y lĂ½ do á»§ng há»™. CĂ³ thá»ƒ nháº¯c nhÆ°á»£c Ä‘iá»ƒm nhÆ°ng pháº£i phá»§ nháº­n hoáº·c giáº£m nháº¹ chĂºng."
      },
      {
        questionId: 'w1t2_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "widespread use"):\n\n"Viá»‡c sá»­ dá»¥ng rá»™ng rĂ£i Ä‘iá»‡n thoáº¡i thĂ´ng minh Ä‘Ă£ thay Ä‘á»•i cĂ¡ch con ngÆ°á»i giao tiáº¿p."',
        correctAnswer: 'The widespread use of smartphones has changed the way people communicate.',
        modelAnswer: 'The widespread use of smartphones has changed the way people communicate.',
        fallbackKeywords: ['widespread use', 'smartphones', 'communicate', 'the way'],
        explanationVi: "'The widespread use of + N' = viá»‡c sá»­ dá»¥ng rá»™ng rĂ£i cá»§a. ÄĂ¢y lĂ  cá»¥m danh tá»« há»c thuáº­t thÆ°á»ng gáº·p trong má»Ÿ bĂ i IELTS."
      },
      {
        questionId: 'w1t2_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "digital devices"):\n\n"Nhiá»u ngÆ°á»i dĂ nh quĂ¡ nhiá»u thá»i gian cho thiáº¿t bá»‹ ká»¹ thuáº­t sá»‘ nhÆ° Ä‘iá»‡n thoáº¡i vĂ  mĂ¡y tĂ­nh báº£ng."',
        correctAnswer: 'Many people spend too much time on digital devices such as smartphones and tablets.',
        modelAnswer: 'Many people spend too much time on digital devices such as smartphones and tablets.',
        fallbackKeywords: ['digital devices', 'smartphones', 'tablets', 'too much time'],
        explanationVi: "'Digital devices' = thiáº¿t bá»‹ ká»¹ thuáº­t sá»‘. 'Spend time on + N' = dĂ nh thá»i gian cho cĂ¡i gĂ¬. 'Such as' = vĂ­ dá»¥ nhÆ° â€” liá»‡t kĂª vĂ­ dá»¥ cá»¥ thá»ƒ."
      },
      {
        questionId: 'w1t2_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "mobile technology"):\n\n"CĂ´ng nghá»‡ di Ä‘á»™ng Ä‘Ă£ giĂºp viá»‡c liĂªn láº¡c trá»Ÿ nĂªn nhanh chĂ³ng vĂ  thuáº­n tiá»‡n hÆ¡n."',
        correctAnswer: 'Mobile technology has made communication faster and more convenient.',
        modelAnswer: 'Mobile technology has made communication faster and more convenient.',
        fallbackKeywords: ['mobile technology', 'communication', 'faster', 'convenient'],
        explanationVi: "'Make + O + adjective' = lĂ m cho cĂ¡i gĂ¬ trá»Ÿ nĂªn nhÆ° tháº¿ nĂ o. 'Faster and more convenient' = so sĂ¡nh hÆ¡n káº¿t há»£p hai tĂ­nh tá»« cĂ¹ng lĂºc."
      },
      {
        questionId: 'w1t2_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "social networking sites"):\n\n"CĂ¡c trang máº¡ng xĂ£ há»™i nhÆ° Facebook hay Instagram káº¿t ná»‘i hĂ ng triá»‡u ngÆ°á»i má»—i ngĂ y."',
        correctAnswer: 'Social networking sites such as Facebook and Instagram connect millions of people every day.',
        modelAnswer: 'Social networking sites such as Facebook and Instagram connect millions of people every day.',
        fallbackKeywords: ['social networking sites', 'Facebook', 'Instagram', 'connect', 'millions'],
        explanationVi: "'Social networking sites' = trang máº¡ng xĂ£ há»™i. 'Millions of people' = hĂ ng triá»‡u ngÆ°á»i â€” khĂ´ng dĂ¹ng 'millions people'. 'Every day' á»Ÿ cuá»‘i cĂ¢u."
      },
      {
        questionId: 'w1t2_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "virtual interaction"):\n\n"Nhiá»u ngÆ°á»i tráº» ngĂ y nay thĂ­ch tÆ°Æ¡ng tĂ¡c áº£o hÆ¡n lĂ  gáº·p gá»¡ ngoĂ i Ä‘á»i tháº­t."',
        correctAnswer: 'Many young people today prefer virtual interaction to meeting in real life.',
        modelAnswer: 'Many young people today prefer virtual interaction to meeting in real life.',
        fallbackKeywords: ['virtual interaction', 'young people', 'prefer', 'real life'],
        explanationVi: "'Prefer A to B' = thĂ­ch A hÆ¡n B â€” khĂ´ng dĂ¹ng 'prefer A than B'. 'Meeting in real life' dĂ¹ng gerund lĂ m tĂ¢n ngá»¯ sau giá»›i tá»« 'to'."
      },
      {
        questionId: 'w1t2_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "face-to-face communication"):\n\n"Tuy nhiĂªn, giao tiáº¿p trá»±c tiáº¿p váº«n quan trá»ng trong viá»‡c xĂ¢y dá»±ng má»‘i quan há»‡ sĂ¢u sáº¯c."',
        correctAnswer: 'However, face-to-face communication remains important for building deeper relationships.',
        modelAnswer: 'However, face-to-face communication remains important for building deeper relationships.',
        fallbackKeywords: ['face-to-face communication', 'remains', 'important', 'relationships'],
        explanationVi: "'Remains important' = váº«n cĂ²n quan trá»ng â€” 'remain' + adjective. 'For building' = má»¥c Ä‘Ă­ch, dĂ¹ng gerund sau giá»›i tá»« 'for'."
      },
      {
        questionId: 'w1t2_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "digital addiction"):\n\n"Viá»‡c sá»­ dá»¥ng Ä‘iá»‡n thoáº¡i quĂ¡ má»©c cĂ³ thá»ƒ dáº«n Ä‘áº¿n nghiá»‡n cĂ´ng nghá»‡."',
        correctAnswer: 'Excessive use of smartphones can lead to digital addiction.',
        modelAnswer: 'Excessive use of smartphones can lead to digital addiction.',
        fallbackKeywords: ['digital addiction', 'excessive use', 'smartphones', 'lead to'],
        explanationVi: "'Excessive use of' = viá»‡c sá»­ dá»¥ng quĂ¡ má»©c (há»c thuáº­t hÆ¡n 'too much use'). 'Lead to + N' = dáº«n Ä‘áº¿n â€” khĂ´ng Ä‘Æ°á»£c dĂ¹ng 'lead to + V-ing' cho danh tá»«."
      },
      {
        questionId: 'w1t2_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "attention span"):\n\n"Viá»‡c sá»­ dá»¥ng Ä‘iá»‡n thoáº¡i thÆ°á»ng xuyĂªn cĂ³ thá»ƒ lĂ m giáº£m kháº£ nÄƒng táº­p trung."',
        correctAnswer: "Frequent use of smartphones can reduce one's attention span.",
        modelAnswer: "Frequent use of smartphones can reduce one's attention span.",
        fallbackKeywords: ['attention span', 'frequent use', 'smartphones', 'reduce'],
        explanationVi: "'Attention span' = khoáº£ng thá»i gian táº­p trung. \"One's\" = cá»§a ai Ä‘Ă³ (Ä‘áº¡i tá»« sá»Ÿ há»¯u trung láº­p). 'Frequent use of' = viá»‡c sá»­ dá»¥ng thÆ°á»ng xuyĂªn."
      },
      {
        questionId: 'w1t2_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "interpersonal relationships"):\n\n"Viá»‡c láº¡m dá»¥ng Ä‘iá»‡n thoáº¡i cĂ³ thá»ƒ áº£nh hÆ°á»Ÿng tiĂªu cá»±c Ä‘áº¿n cĂ¡c má»‘i quan há»‡ giá»¯a ngÆ°á»i vá»›i ngÆ°á»i."',
        correctAnswer: 'Overuse of smartphones can negatively affect interpersonal relationships.',
        modelAnswer: 'Overuse of smartphones can negatively affect interpersonal relationships.',
        fallbackKeywords: ['interpersonal relationships', 'overuse', 'smartphones', 'negatively affect'],
        explanationVi: "'Overuse of + N' = viá»‡c láº¡m dá»¥ng (tiá»n tá»‘ over- = quĂ¡ má»©c). 'Negatively affect' = áº£nh hÆ°á»Ÿng tiĂªu cá»±c â€” adverb Ä‘áº·t trÆ°á»›c Ä‘á»™ng tá»« chĂ­nh."
      },
      {
        questionId: 'w1t2_q21', level: 'intermediate', orderIndex: 21,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "emotional connection"):\n\n"Giao tiáº¿p qua mĂ n hĂ¬nh thÆ°á»ng thiáº¿u Ä‘i sá»± káº¿t ná»‘i cáº£m xĂºc tháº­t sá»±."',
        correctAnswer: 'Communication through screens often lacks a genuine emotional connection.',
        modelAnswer: 'Communication through screens often lacks a genuine emotional connection.',
        fallbackKeywords: ['emotional connection', 'screens', 'lacks', 'genuine'],
        explanationVi: "'Lacks + N' = thiáº¿u cĂ¡i gĂ¬ (Ä‘á»™ng tá»«, khĂ´ng pháº£i 'lack of'). 'Genuine' = tháº­t sá»±, chĂ¢n tháº­t â€” tá»« há»c thuáº­t thá»ƒ hiá»‡n má»©c Ä‘á»™ sĂ¢u sáº¯c cá»§a káº¿t ná»‘i."
      }
    ]
  },
  {
    week: 2, block: 'advantages_disadvantages', orderIndex: 3,
    topicName: 'Influence of Social Media', topicEmoji: 'đŸ“²',
    essayType: 'advantages_disadvantages',
    prompt: 'Social media platforms have become a major source of news and information. What are the advantages and disadvantages of relying on social media for news?',
    hintAdvantages: ['fast updates', 'diverse sources', 'interactive'],
    hintDisadvantages: ['fake news', 'bias', 'lack of verification'],
    vocabularyList: [
      { term: 'misinformation', definitionVi: 'thĂ´ng tin sai lá»‡ch', example: 'Misinformation spread rapidly on social media during the pandemic.' },
      { term: 'credibility', definitionVi: 'Ä‘á»™ tin cáº­y', example: 'The credibility of online news sources is often questioned.' },
      { term: 'fake news', definitionVi: 'tin giáº£', example: 'Many people are easily deceived by fake news spreading on the internet.' },
      { term: 'fact-checking', definitionVi: 'kiá»ƒm chá»©ng thĂ´ng tin', example: 'Fact-checking is very important before sharing any post online.' },
      { term: 'echo chamber', definitionVi: 'buá»“ng vá»ng / hiá»‡u á»©ng buá»“ng vá»ng', example: 'The echo chamber effect causes users to only see opinions similar to their own.' },
      { term: 'breaking news', definitionVi: 'tin tá»©c nĂ³ng há»•i', example: 'Many people now read breaking news on social media instead of watching TV.' },
      { term: 'public opinion', definitionVi: 'dÆ° luáº­n xĂ£ há»™i', example: 'Social media can be used to manipulate public opinion.' },
      { term: 'democratization of information', definitionVi: 'dĂ¢n chá»§ hĂ³a thĂ´ng tin', example: 'Social media contributes to the democratization of information.' },
      { term: 'algorithm', definitionVi: 'thuáº­t toĂ¡n', example: 'Social media algorithms decide which news users see most often.' },
      { term: 'media literacy', definitionVi: 'hiá»ƒu biáº¿t vá» truyá»n thĂ´ng', example: 'Media literacy helps people identify fake news.' },
      { term: 'primary channel', definitionVi: 'kĂªnh chĂ­nh', example: 'Social media has become a primary channel for news distribution.' },
      { term: 'manipulation', definitionVi: 'sá»± thao tĂºng', example: 'The manipulation of public opinion through fake news is a serious problem.' },
      { term: 'viral content', definitionVi: 'ná»™i dung lan truyá»n nhanh', example: 'Viral content is not always accurate or verified.' },
      { term: 'current events', definitionVi: 'sá»± kiá»‡n thá»i sá»±', example: 'Social media keeps people informed about current events in real time.' },
      { term: 'filter bubble', definitionVi: 'bong bĂ³ng thĂ´ng tin', example: 'Filter bubbles limit exposure to diverse viewpoints.' }
    ],
    questions: [
      {
        questionId: 'w2t3_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Tá»« khĂ³a nĂ o trong Ä‘á» bĂ i xĂ¡c Ä‘á»‹nh Ä‘Ă¢y lĂ  dáº¡ng Advantages & Disadvantages?\n\n"Social media platforms have become a major source of news and information. What are the advantages and disadvantages of relying on social media for news?"',
        options: [
          'social media platforms',
          'major source of news',
          'advantages and disadvantages',
          'relying on social media'
        ],
        correctAnswer: 'advantages and disadvantages',
        explanationVi: "Keyword 'advantages and disadvantages' trá»±c tiáº¿p xĂ¡c Ä‘á»‹nh dáº¡ng bĂ i. ÄĂ¢y lĂ  dáº¥u hiá»‡u rĂµ rĂ ng nháº¥t â€” khi tháº¥y cá»¥m nĂ y, láº­p tá»©c biáº¿t cáº§n phĂ¢n tĂ­ch cáº£ hai máº·t cĂ¢n báº±ng."
      },
      {
        questionId: 'w2t3_q02', level: 'beginner', orderIndex: 2,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Nhiá»u ngÆ°á»i dá»… bá»‹ lá»«a bá»Ÿi tin giáº£ Ä‘ang lan truyá»n trĂªn Internet."',
        correctAnswer: 'Many people are easily deceived by fake news spreading on the Internet.',
        modelAnswer: 'Many people are easily deceived by fake news spreading on the Internet.',
        fallbackKeywords: ['fake news', 'deceived', 'internet', 'spreading'],
        explanationVi: "'Be deceived by' = bá»‹ lá»«a bá»Ÿi (passive voice). 'Spreading on the Internet' lĂ  participle phrase mĂ´ táº£ fake news. CĂ¢u nĂ y thá»ƒ hiá»‡n nhÆ°á»£c Ä‘iá»ƒm quan trá»ng cá»§a máº¡ng xĂ£ há»™i."
      },
      {
        questionId: 'w2t3_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Nhiá»u ngÆ°á»i hiá»‡n nay thÆ°á»ng Ä‘á»c tin tá»©c nĂ³ng trĂªn Facebook hoáº·c Twitter thay vĂ¬ xem TV."',
        correctAnswer: 'Many people now read breaking news on Facebook or Twitter instead of watching TV.',
        modelAnswer: 'Many people now read breaking news on Facebook or Twitter instead of watching TV.',
        fallbackKeywords: ['breaking news', 'facebook', 'twitter', 'television'],
        explanationVi: "'Breaking news' = tin tá»©c nĂ³ng há»•i. 'Instead of + V-ing' = thay vĂ¬ lĂ m gĂ¬. ÄĂ¢y lĂ  Æ°u Ä‘iá»ƒm cá»§a máº¡ng xĂ£ há»™i: cáº­p nháº­t tin tá»©c nhanh chĂ³ng."
      },
      {
        questionId: 'w2t3_q04', level: 'elementary', orderIndex: 4,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Viá»‡c kiá»ƒm chá»©ng thĂ´ng tin lĂ  ráº¥t quan trá»ng trÆ°á»›c khi chia sáº» báº¥t ká»³ bĂ i Ä‘Äƒng nĂ o trĂªn máº¡ng."',
        correctAnswer: 'Fact-checking is very important before sharing any post online.',
        modelAnswer: 'Fact-checking is very important before sharing any post online.',
        fallbackKeywords: ['fact-checking', 'important', 'sharing', 'online'],
        explanationVi: "'Fact-checking' = kiá»ƒm chá»©ng thĂ´ng tin (danh Ä‘á»™ng tá»« lĂ m chá»§ ngá»¯). 'Before + V-ing' = trÆ°á»›c khi lĂ m gĂ¬. ÄĂ¢y lĂ  giáº£i phĂ¡p cho váº¥n Ä‘á» tin giáº£."
      },
      {
        questionId: 'w2t3_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Hiá»‡u á»©ng buá»“ng vá»ng cĂ³ thá»ƒ khiáº¿n ngÆ°á»i dĂ¹ng chá»‰ tiáº¿p xĂºc vá»›i nhá»¯ng quan Ä‘iá»ƒm giá»‘ng quan Ä‘iá»ƒm cá»§a há»."',
        correctAnswer: 'The echo chamber effect can cause users to only encounter opinions that mirror their own.',
        modelAnswer: 'The echo chamber effect can cause users to only encounter opinions that mirror their own.',
        fallbackKeywords: ['echo chamber', 'users', 'opinions', 'mirror'],
        explanationVi: "'Cause + O + to + V' = khiáº¿n ai lĂ m gĂ¬. 'Mirror their own' = pháº£n chiáº¿u quan Ä‘iá»ƒm cá»§a chĂ­nh há». 'Echo chamber' lĂ  thuáº­t ngá»¯ há»c thuáº­t vá» hiá»‡n tÆ°á»£ng nĂ y."
      },
      {
        questionId: 'w2t3_q06', level: 'elementary', orderIndex: 6,
        type: 'error_correction',
        questionText: 'CĂ¢u sau cĂ³ lá»—i. HĂ£y sá»­a láº¡i:\n\n"Social media has become one of the most popular source of news today."',
        correctAnswer: 'Social media has become one of the most popular sources of news today.',
        modelAnswer: 'Social media has become one of the most popular sources of news today.',
        fallbackKeywords: ['social media', 'popular', 'sources', 'news'],
        explanationVi: "Lá»—i: Sau 'one of the most + adj' pháº£i dĂ¹ng danh tá»« sá»‘ NHIá»€U. 'Source' â†’ 'sources'. Cáº¥u trĂºc: 'one of the + superlative + plural noun'."
      },
      {
        questionId: 'w2t3_q07', level: 'intermediate', orderIndex: 7,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Sá»± thao tĂºng dÆ° luáº­n qua tin giáº£ Ä‘ang trá»Ÿ thĂ nh má»™t váº¥n Ä‘á» nghiĂªm trá»ng."',
        correctAnswer: 'The manipulation of public opinion through fake news is becoming a serious problem.',
        modelAnswer: 'The manipulation of public opinion through fake news is becoming a serious problem.',
        fallbackKeywords: ['manipulation', 'public opinion', 'fake news', 'serious'],
        explanationVi: "'The manipulation of + N' = sá»± thao tĂºng cá»§a. Present Continuous 'is becoming' nháº¥n máº¡nh xu hÆ°á»›ng Ä‘ang gia tÄƒng. 'Public opinion' = dÆ° luáº­n xĂ£ há»™i."
      },
      {
        questionId: 'w2t3_q08', level: 'intermediate', orderIndex: 8,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Máº¡ng xĂ£ há»™i gĂ³p pháº§n vĂ o dĂ¢n chá»§ hĂ³a thĂ´ng tin, giĂºp má»i ngÆ°á»i dá»… dĂ ng chia sáº» quan Ä‘iá»ƒm cá»§a mĂ¬nh."',
        correctAnswer: 'Social media contributes to the democratization of information, enabling everyone to share their views easily.',
        modelAnswer: 'Social media contributes to the democratization of information, enabling everyone to share their views easily.',
        fallbackKeywords: ['democratization', 'information', 'share', 'views', 'easily'],
        explanationVi: "'Contribute to + N' = gĂ³p pháº§n vĂ o. 'The democratization of information' = dĂ¢n chá»§ hĂ³a thĂ´ng tin. Participle phrase 'enabling...' bá»• nghÄ©a thĂªm há»‡ quáº£ tĂ­ch cá»±c."
      },
      {
        questionId: 'w2t3_q09', level: 'intermediate', orderIndex: 9,
        type: 'paraphrase',
        questionText: 'Paraphrase cĂ¢u sau:\n\n"Social media platforms have become a major source of news and information."',
        correctAnswer: 'Online networking sites have emerged as a primary channel through which the public accesses current events and knowledge.',
        modelAnswer: 'Online networking sites have emerged as a primary channel through which the public accesses current events and knowledge.',
        fallbackKeywords: ['networking sites', 'primary channel', 'public', 'current events', 'knowledge'],
        explanationVi: "Thay 'social media platforms' â†’ 'online networking sites', 'major source' â†’ 'primary channel', 'news' â†’ 'current events', 'information' â†’ 'knowledge'. 'Have emerged as' = Ä‘Ă£ ná»•i lĂªn thĂ nh."
      },
      {
        questionId: 'w2t3_q10', level: 'intermediate', orderIndex: 10,
        type: 'short_writing',
        questionText: 'Viáº¿t 1 Ä‘oáº¡n body paragraph (~80-100 tá»«) vá» Má»˜T NHÆ¯á»¢C ÄIá»‚M cá»§a viá»‡c phá»¥ thuá»™c vĂ o máº¡ng xĂ£ há»™i Ä‘á»ƒ Ä‘á»c tin tá»©c.\n\nGá»£i Ă½: misinformation / fake news / credibility / echo chamber',
        modelAnswer: 'One significant disadvantage of relying on social media for news is the widespread circulation of misinformation. Unlike traditional media outlets, social media platforms lack rigorous editorial standards, allowing unverified or deliberately false content to spread rapidly among millions of users. The echo chamber effect further exacerbates this problem, as algorithms prioritise content that aligns with users\' existing beliefs, reinforcing biases rather than exposing them to balanced reporting. Consequently, public opinion can be easily manipulated, undermining the credibility of journalism and eroding informed democratic debate.',
        fallbackKeywords: ['misinformation', 'social media', 'fake news', 'credibility', 'echo chamber', 'public opinion'],
        explanationVi: "Äoáº¡n vÄƒn tá»‘t cáº§n: topic sentence rĂµ rĂ ng â†’ giáº£i thĂ­ch vĂ¬ sao â†’ há»‡ quáº£ cá»¥ thá»ƒ â†’ linking word káº¿t ná»‘i. TrĂ¡nh chá»‰ liá»‡t kĂª mĂ  khĂ´ng giáº£i thĂ­ch."
      },
      {
        questionId: 'w2t3_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "social media platforms"):\n\n"NgĂ y nay, cĂ¡c ná»n táº£ng máº¡ng xĂ£ há»™i Ä‘Ă£ trá»Ÿ thĂ nh nguá»“n tin tá»©c chĂ­nh cá»§a nhiá»u ngÆ°á»i."',
        correctAnswer: 'Nowadays, social media platforms have become the primary source of news for many people.',
        modelAnswer: 'Nowadays, social media platforms have become the primary source of news for many people.',
        fallbackKeywords: ['social media platforms', 'primary source', 'news', 'many people'],
        explanationVi: "'Social media platforms' = ná»n táº£ng máº¡ng xĂ£ há»™i. 'Have become' = Present Perfect nháº¥n máº¡nh sá»± thay Ä‘á»•i Ä‘áº¿n hiá»‡n táº¡i. 'Primary source' = nguá»“n chĂ­nh â€” formal hÆ¡n 'main source'."
      },
      {
        questionId: 'w2t3_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "news consumption"):\n\n"Viá»‡c tiáº¿p nháº­n tin tá»©c qua máº¡ng xĂ£ há»™i Ä‘ang ngĂ y cĂ ng phá»• biáº¿n."',
        correctAnswer: 'News consumption through social media is becoming increasingly common.',
        modelAnswer: 'News consumption through social media is becoming increasingly common.',
        fallbackKeywords: ['news consumption', 'social media', 'increasingly common'],
        explanationVi: "'News consumption' = viá»‡c tiĂªu thá»¥/Ä‘á»c tin tá»©c. 'Is becoming increasingly' = Ä‘ang ngĂ y cĂ ng trá»Ÿ nĂªn (Present Continuous + adverb)."
      },
      {
        questionId: 'w2t3_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "reliable sources"):\n\n"KhĂ´ng pháº£i táº¥t cáº£ thĂ´ng tin trĂªn máº¡ng Ä‘á»u Ä‘áº¿n tá»« nguá»“n tin Ä‘Ă¡ng tin cáº­y."',
        correctAnswer: 'Not all information online comes from reliable sources.',
        modelAnswer: 'Not all information online comes from reliable sources.',
        fallbackKeywords: ['reliable sources', 'not all', 'information online'],
        explanationVi: "'Reliable sources' = nguá»“n Ä‘Ă¡ng tin cáº­y. 'Not all + N + V' = khĂ´ng pháº£i táº¥t cáº£ Ä‘á»u... â€” cáº¥u trĂºc phá»§ Ä‘á»‹nh tá»«ng pháº§n quan trá»ng trong IELTS."
      },
      {
        questionId: 'w2t3_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "misinformation"):\n\n"Má»™t trong nhá»¯ng váº¥n Ä‘á» lá»›n nháº¥t cá»§a máº¡ng xĂ£ há»™i lĂ  sá»± lan truyá»n cá»§a thĂ´ng tin sai lá»‡ch."',
        correctAnswer: 'One of the biggest problems with social media is the spread of misinformation.',
        modelAnswer: 'One of the biggest problems with social media is the spread of misinformation.',
        fallbackKeywords: ['misinformation', 'social media', 'spread', 'biggest problems'],
        explanationVi: "'Misinformation' = thĂ´ng tin sai lá»‡ch (khĂ´ng cá»‘ Ă½). 'One of the biggest problems with X' = má»™t trong nhá»¯ng váº¥n Ä‘á» lá»›n nháº¥t cá»§a X â€” cáº¥u trĂºc diá»…n Ä‘áº¡t nhÆ°á»£c Ä‘iá»ƒm."
      },
      {
        questionId: 'w2t3_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "media literacy"):\n\n"Há»c sinh cáº§n Ä‘Æ°á»£c dáº¡y ká»¹ nÄƒng hiá»ƒu biáº¿t truyá»n thĂ´ng Ä‘á»ƒ phĂ¢n biá»‡t tin tháº­t vĂ  tin giáº£."',
        correctAnswer: 'Students need to be taught media literacy skills to distinguish real news from fake news.',
        modelAnswer: 'Students need to be taught media literacy skills to distinguish real news from fake news.',
        fallbackKeywords: ['media literacy', 'students', 'distinguish', 'fake news'],
        explanationVi: "'Media literacy' = kháº£ nÄƒng hiá»ƒu vĂ  Ä‘Ă¡nh giĂ¡ thĂ´ng tin truyá»n thĂ´ng. 'Need to be taught' = passive infinitive â€” nháº¥n máº¡nh hĂ nh Ä‘á»™ng giáº£ng dáº¡y tá»« phĂ­a nhĂ  trÆ°á»ng."
      },
      {
        questionId: 'w2t3_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "citizen journalism"):\n\n"Nhiá»u ngÆ°á»i dĂ¢n hiá»‡n nay tham gia vĂ o bĂ¡o chĂ­ cĂ´ng dĂ¢n báº±ng cĂ¡ch Ä‘Äƒng video hoáº·c bĂ i viáº¿t vá» sá»± kiá»‡n."',
        correctAnswer: 'Many people now participate in citizen journalism by posting videos or articles about events.',
        modelAnswer: 'Many people now participate in citizen journalism by posting videos or articles about events.',
        fallbackKeywords: ['citizen journalism', 'participate', 'posting', 'videos', 'articles'],
        explanationVi: "'Citizen journalism' = bĂ¡o chĂ­ cĂ´ng dĂ¢n. 'By + V-ing' = báº±ng cĂ¡ch lĂ m gĂ¬ â€” cáº¥u trĂºc diá»…n Ä‘áº¡t phÆ°Æ¡ng tiá»‡n/phÆ°Æ¡ng cĂ¡ch."
      },
      {
        questionId: 'w2t3_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "information overload"):\n\n"NgÆ°á»i dĂ¹ng cĂ³ thá»ƒ bá»‹ choĂ¡ng ngá»£p vĂ¬ quĂ¡ táº£i thĂ´ng tin trĂªn máº¡ng xĂ£ há»™i."',
        correctAnswer: 'Users can be overwhelmed by information overload on social media.',
        modelAnswer: 'Users can be overwhelmed by information overload on social media.',
        fallbackKeywords: ['information overload', 'overwhelmed', 'users', 'social media'],
        explanationVi: "'Information overload' = quĂ¡ táº£i thĂ´ng tin (compound noun). 'Be overwhelmed by' = bá»‹ choĂ¡ng ngá»£p bá»Ÿi â€” passive voice nháº¥n máº¡nh tráº¡ng thĂ¡i bá»‹ Ä‘á»™ng cá»§a ngÆ°á»i dĂ¹ng."
      },
      {
        questionId: 'w2t3_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "credibility of news"):\n\n"Äá»™ tin cáº­y cá»§a cĂ¡c bĂ i Ä‘Äƒng thÆ°á»ng tháº¥p hÆ¡n Ä‘á»™ tin cáº­y cá»§a tin tá»©c tá»« cĂ¡c hĂ£ng truyá»n thĂ´ng lá»›n."',
        correctAnswer: 'The credibility of social media posts is often lower than that of news from major media outlets.',
        modelAnswer: 'The credibility of social media posts is often lower than that of news from major media outlets.',
        fallbackKeywords: ['credibility', 'social media posts', 'media outlets', 'lower'],
        explanationVi: "'That of' thay tháº¿ cho danh tá»« Ä‘Ă£ Ä‘á» cáº­p trÆ°á»›c Ä‘Ă³ (the credibility of). 'Media outlets' = hĂ£ng truyá»n thĂ´ng â€” há»c thuáº­t hÆ¡n 'media companies'."
      },
      {
        questionId: 'w2t3_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "algorithm-driven content"):\n\n"CĂ¡c thuáº­t toĂ¡n Ä‘iá»u hÆ°á»›ng ná»™i dung khiáº¿n ngÆ°á»i dĂ¹ng chá»‰ tháº¥y nhá»¯ng gĂ¬ há» muá»‘n tháº¥y."',
        correctAnswer: 'Algorithm-driven content means users only see what they want to see, limiting their exposure to diverse perspectives.',
        modelAnswer: 'Algorithm-driven content means users only see what they want to see, limiting their exposure to diverse perspectives.',
        fallbackKeywords: ['algorithm-driven content', 'users', 'limiting', 'diverse perspectives'],
        explanationVi: "'Algorithm-driven content' = ná»™i dung Ä‘Æ°á»£c thuáº­t toĂ¡n Ä‘iá»u hÆ°á»›ng. Má»‡nh Ä‘á» bá»• nghÄ©a 'limiting their exposure...' = participle clause nĂªu há»‡ quáº£ tiĂªu cá»±c."
      },
      {
        questionId: 'w2t3_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "echo chamber effect"):\n\n"Hiá»‡u á»©ng buá»“ng vá»ng cĂ³ thá»ƒ khiáº¿n ngÆ°á»i dĂ¹ng chá»‰ nghe nhá»¯ng Ă½ kiáº¿n giá»‘ng mĂ¬nh."',
        correctAnswer: 'The echo chamber effect can cause users to only encounter opinions that mirror their own.',
        modelAnswer: 'The echo chamber effect can cause users to only encounter opinions that mirror their own.',
        fallbackKeywords: ['echo chamber effect', 'users', 'opinions', 'mirror'],
        explanationVi: "'Echo chamber effect' = hiá»‡u á»©ng buá»“ng vá»ng. 'Mirror their own' = pháº£n chiáº¿u quan Ä‘iá»ƒm cá»§a há» â€” 'mirror' dĂ¹ng lĂ m Ä‘á»™ng tá»«."
      }
    ]
  },

  // â”€â”€â”€ BLOCK 2: Week 3-4 â€” Cause & Effect/Solution / Education â”€â”€â”€
  {
    week: 3, block: 'cause_effect', orderIndex: 4,
    topicName: 'Online Learning and Student Motivation', topicEmoji: 'đŸ“',
    essayType: 'cause_effect',
    prompt: 'Many students find it difficult to stay motivated when studying online. What are the causes of this problem, and what effects does it have on students?',
    hintAdvantages: [],
    hintDisadvantages: [],
    vocabularyList: [
      { term: 'motivation', definitionVi: 'Ä‘á»™ng lá»±c', example: 'Lack of motivation is one of the biggest challenges in online learning.' },
      { term: 'distraction', definitionVi: 'sá»± phĂ¢n tĂ¢m', example: 'Social media is a major source of distraction for online students.' },
      { term: 'procrastination', definitionVi: 'sá»± trĂ¬ hoĂ£n', example: 'Without deadlines, students tend to procrastinate.' },
      { term: 'academic burnout', definitionVi: 'kiá»‡t sá»©c há»c táº­p', example: 'Students may suffer from academic burnout if they study too much without rest.' },
      { term: 'peer interaction', definitionVi: 'sá»± tÆ°Æ¡ng tĂ¡c vá»›i báº¡n bĂ¨ cĂ¹ng trang lá»©a', example: 'The lack of peer interaction makes online studying less engaging.' },
      { term: 'digital fatigue', definitionVi: 'má»‡t má»i vĂ¬ mĂ n hĂ¬nh sá»‘', example: 'Sitting in front of a screen for too long can lead to digital fatigue.' },
      { term: 'structured learning environment', definitionVi: 'mĂ´i trÆ°á»ng há»c táº­p cĂ³ cáº¥u trĂºc', example: 'A structured learning environment helps students stay on task.' },
      { term: 'intrinsic motivation', definitionVi: 'Ä‘á»™ng lá»±c ná»™i táº¡i', example: 'Intrinsic motivation helps students maintain enthusiasm for learning.' },
      { term: 'academic performance', definitionVi: 'káº¿t quáº£ há»c táº­p', example: 'Low motivation directly impacts academic performance.' },
      { term: 'dropout rate', definitionVi: 'tá»· lá»‡ bá» há»c', example: 'Poor motivation contributes to higher dropout rates in online courses.' },
      { term: 'self-regulation', definitionVi: 'kháº£ nÄƒng tá»± Ä‘iá»u tiáº¿t', example: 'Online learning demands strong self-regulation from students.' },
      { term: 'isolation', definitionVi: 'sá»± cĂ´ láº­p', example: 'Social isolation is a common effect of prolonged online study.' },
      { term: 'engagement', definitionVi: 'sá»± gáº¯n káº¿t, tham gia tĂ­ch cá»±c', example: 'Low engagement in online classes leads to poor learning outcomes.' },
      { term: 'flexible learning', definitionVi: 'há»c táº­p linh hoáº¡t', example: 'Flexible learning can also lead to a lack of routine.' },
      { term: 'long-term', definitionVi: 'dĂ i háº¡n', example: 'Intrinsic motivation sustains learning over the long term.' }
    ],
    questions: [
      {
        questionId: 'w3t4_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Äá» bĂ i há»i: "What are the causes of this problem, and what effects does it have?" â€” Cáº¥u trĂºc bĂ i luáº­n gá»“m máº¥y pháº§n?',
        options: [
          '1 pháº§n (chá»‰ nguyĂªn nhĂ¢n)',
          '2 pháº§n: má»™t vá» nguyĂªn nhĂ¢n, má»™t vá» há»‡ quáº£',
          '2 pháº§n: quan Ä‘iá»ƒm á»§ng há»™ vĂ  pháº£n Ä‘á»‘i',
          '3 pháº§n: nguyĂªn nhĂ¢n, há»‡ quáº£, vĂ  giáº£i phĂ¡p'
        ],
        correctAnswer: '2 pháº§n: má»™t vá» nguyĂªn nhĂ¢n, má»™t vá» há»‡ quáº£',
        explanationVi: "Äá» há»i 'causes' AND 'effects' â†’ bĂ i cáº§n 2 body paragraphs riĂªng biá»‡t: BP1 vá» nguyĂªn nhĂ¢n, BP2 vá» há»‡ quáº£. KhĂ´ng cĂ³ 'solutions' nĂªn khĂ´ng cáº§n pháº§n giáº£i phĂ¡p."
      },
      {
        questionId: 'w3t4_q02', level: 'beginner', orderIndex: 2,
        type: 'essay_type_recognition',
        questionText: 'Chá»n tá»« Ä‘Ăºng Ä‘á»ƒ hoĂ n chá»‰nh cĂ¢u:\n\n"There are several _____ why students lack motivation when studying online."',
        options: ['effects', 'solutions', 'reasons', 'advantages'],
        correctAnswer: 'reasons',
        explanationVi: "'Reasons why + clause' = lĂ½ do táº¡i sao. Trong Cause & Effect essay, 'reasons' vĂ  'causes' Ä‘Æ°á»£c dĂ¹ng thay tháº¿ nhau. TrĂ¡nh nháº§m vá»›i 'effects' (há»‡ quáº£)."
      },
      {
        questionId: 'w3t4_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"á» nhĂ , cĂ³ quĂ¡ nhiá»u yáº¿u tá»‘ gĂ¢y xao nhĂ£ng khi há»c trá»±c tuyáº¿n."',
        correctAnswer: 'At home, there are too many distractions when studying online.',
        modelAnswer: 'At home, there are too many distractions when studying online.',
        fallbackKeywords: ['home', 'distractions', 'studying online'],
        explanationVi: "'Distraction' (danh tá»« Ä‘áº¿m Ä‘Æ°á»£c) = yáº¿u tá»‘ gĂ¢y phĂ¢n tĂ¢m. 'Too many + countable noun plural' = quĂ¡ nhiá»u. CĂ¢u nĂ y nĂªu má»™t nguyĂªn nhĂ¢n phá»• biáº¿n trong bĂ i Cause & Effect."
      },
      {
        questionId: 'w3t4_q04', level: 'beginner', orderIndex: 4,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Sá»± thiáº¿u tÆ°Æ¡ng tĂ¡c vá»›i báº¡n há»c khiáº¿n viá»‡c há»c trá»Ÿ nĂªn kĂ©m háº¥p dáº«n hÆ¡n."',
        correctAnswer: 'The lack of peer interaction makes studying less engaging.',
        modelAnswer: 'The lack of peer interaction makes studying less engaging.',
        fallbackKeywords: ['peer interaction', 'studying', 'engaging'],
        explanationVi: "'The lack of + N' = sá»± thiáº¿u há»¥t cá»§a. 'Make + O + adj' = khiáº¿n cho. 'Engaging' = háº¥p dáº«n, thu hĂºt. Cáº¥u trĂºc nĂ y diá»…n Ä‘áº¡t nguyĂªn nhĂ¢n ráº¥t gá»n gĂ ng."
      },
      {
        questionId: 'w3t4_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Há»c sinh cĂ³ thá»ƒ bá»‹ kiá»‡t sá»©c há»c táº­p náº¿u há»c quĂ¡ nhiá»u mĂ  khĂ´ng nghá»‰ ngÆ¡i Ä‘áº§y Ä‘á»§."',
        correctAnswer: 'Students may suffer from academic burnout if they study too much without adequate rest.',
        modelAnswer: 'Students may suffer from academic burnout if they study too much without adequate rest.',
        fallbackKeywords: ['academic burnout', 'students', 'study', 'rest'],
        explanationVi: "'Suffer from + N' = chá»‹u Ä‘á»±ng, bá»‹ máº¯c pháº£i. 'Academic burnout' = kiá»‡t sá»©c há»c táº­p. 'Adequate rest' = nghá»‰ ngÆ¡i Ä‘áº§y Ä‘á»§ (academic hÆ¡n 'enough rest')."
      },
      {
        questionId: 'w3t4_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Ngá»“i trÆ°á»›c mĂ n hĂ¬nh quĂ¡ lĂ¢u cĂ³ thá»ƒ dáº«n Ä‘áº¿n tĂ¬nh tráº¡ng má»‡t má»i ká»¹ thuáº­t sá»‘."',
        correctAnswer: 'Sitting in front of a screen for too long can lead to digital fatigue.',
        modelAnswer: 'Sitting in front of a screen for too long can lead to digital fatigue.',
        fallbackKeywords: ['screen', 'digital fatigue', 'lead to'],
        explanationVi: "Gerund 'Sitting in front of a screen' lĂ m chá»§ ngá»¯. 'For too long' = trong thá»i gian quĂ¡ lĂ¢u. 'Digital fatigue' = má»‡t má»i ká»¹ thuáº­t sá»‘ â€” há»‡ quáº£ quan trá»ng cá»§a há»c online."
      },
      {
        questionId: 'w3t4_q07', level: 'elementary', orderIndex: 7,
        type: 'rearrange',
        questionText: 'Sáº¯p xáº¿p cĂ¡c cá»¥m tá»« sau thĂ nh cĂ¢u hoĂ n chá»‰nh:\n[lack of peer interaction / As a result of / , / many students / feel isolated / and lose motivation]',
        correctAnswer: 'As a result of the lack of peer interaction, many students feel isolated and lose motivation.',
        modelAnswer: 'As a result of the lack of peer interaction, many students feel isolated and lose motivation.',
        fallbackKeywords: ['peer interaction', 'students', 'isolated', 'motivation'],
        explanationVi: "'As a result of + N' = do káº¿t quáº£ cá»§a (nĂªu nguyĂªn nhĂ¢n). Dáº¥u pháº©y sau má»‡nh Ä‘á» tráº¡ng ngá»¯ Ä‘á»©ng Ä‘áº§u cĂ¢u lĂ  báº¯t buá»™c. 'Feel isolated' = cáº£m tháº¥y bá»‹ cĂ´ láº­p."
      },
      {
        questionId: 'w3t4_q08', level: 'elementary', orderIndex: 8,
        type: 'error_correction',
        questionText: 'CĂ¢u sau cĂ³ lá»—i. HĂ£y sá»­a láº¡i:\n\n"One of the main cause of low motivation is the absence of a structured learning environment."',
        correctAnswer: 'One of the main causes of low motivation is the absence of a structured learning environment.',
        modelAnswer: 'One of the main causes of low motivation is the absence of a structured learning environment.',
        fallbackKeywords: ['causes', 'motivation', 'structured', 'learning environment'],
        explanationVi: "Lá»—i: 'one of the + superlative + plural noun' â†’ 'cause' pháº£i lĂ  'causes'. Quy táº¯c: sau 'one of the' luĂ´n dĂ¹ng danh tá»« sá»‘ nhiá»u."
      },
      {
        questionId: 'w3t4_q09', level: 'elementary', orderIndex: 9,
        type: 'topic_sentence',
        questionText: 'Chá»n linking word phĂ¹ há»£p Ä‘á»ƒ Ä‘iá»n vĂ o chá»— trá»‘ng:\n\n"Students are easily distracted at home. _____, their academic performance tends to decline."',
        options: ['However', 'In contrast', 'As a result', 'On the other hand'],
        correctAnswer: 'As a result',
        explanationVi: "'As a result' = do Ä‘Ă³, káº¿t quáº£ lĂ  â€” linking word chá»‰ há»‡ quáº£. CĂ¢u sau lĂ  Há»† QUáº¢ cá»§a cĂ¢u trÆ°á»›c (dá»… bá»‹ phĂ¢n tĂ¢m â†’ káº¿t quáº£ há»c táº­p giáº£m). 'However' chá»‰ sá»± tÆ°Æ¡ng pháº£n, khĂ´ng phĂ¹ há»£p á»Ÿ Ä‘Ă¢y."
      },
      {
        questionId: 'w3t4_q10', level: 'intermediate', orderIndex: 10,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Äá»™ng lá»±c ná»™i táº¡i giĂºp sinh viĂªn duy trĂ¬ há»©ng thĂº há»c táº­p trong thá»i gian dĂ i."',
        correctAnswer: 'Intrinsic motivation helps students maintain their enthusiasm for learning over the long term.',
        modelAnswer: 'Intrinsic motivation helps students maintain their enthusiasm for learning over the long term.',
        fallbackKeywords: ['intrinsic motivation', 'students', 'enthusiasm', 'learning', 'long term'],
        explanationVi: "'Intrinsic motivation' = Ä‘á»™ng lá»±c ná»™i táº¡i (Ä‘áº¿n tá»« bĂªn trong, khĂ´ng pháº£i pháº§n thÆ°á»Ÿng bĂªn ngoĂ i). 'Maintain enthusiasm for' = duy trĂ¬ há»©ng thĂº vá»›i. 'Over the long term' = trong thá»i gian dĂ i."
      },
      {
        questionId: 'w3t4_q11', level: 'intermediate', orderIndex: 11,
        type: 'short_writing',
        questionText: 'Viáº¿t 1 topic sentence hoĂ n chá»‰nh cho Ä‘oáº¡n Body vá» CĂC Há»† QUáº¢ cá»§a viá»‡c thiáº¿u Ä‘á»™ng lá»±c há»c online. Sau Ä‘Ă³ giáº£i thĂ­ch ngáº¯n gá»n (2-3 cĂ¢u).',
        modelAnswer: 'As a result of this lack of motivation, students\' academic performance declines significantly, which can ultimately lead to higher dropout rates. When students fail to engage with course material, they fall behind in assignments and examinations, creating a cycle of underachievement. In severe cases, persistent demotivation causes students to abandon their studies entirely, wasting both personal time and educational resources.',
        fallbackKeywords: ['academic performance', 'declines', 'dropout', 'motivation', 'underachievement'],
        explanationVi: "Topic sentence cá»§a Ä‘oáº¡n Effects pháº£i báº¯t Ä‘áº§u báº±ng linking word chá»‰ há»‡ quáº£ ('As a result', 'Consequently') vĂ  nĂªu rĂµ há»‡ quáº£ chĂ­nh."
      },
      {
        questionId: 'w3t4_q12', level: 'intermediate', orderIndex: 12,
        type: 'short_writing',
        questionText: 'Viáº¿t 1 Ä‘oáº¡n body paragraph (~80-100 tá»«) vá» CĂC NGUYĂN NHĂ‚N khiáº¿n há»c sinh thiáº¿u Ä‘á»™ng lá»±c khi há»c trá»±c tuyáº¿n.',
        modelAnswer: 'There are several key reasons why students struggle to stay motivated in an online learning environment. Firstly, the absence of a structured classroom setting means that students must rely entirely on self-discipline, which many find challenging. Secondly, the lack of face-to-face peer interaction removes the social element of learning, making it feel isolating and tedious. Additionally, the constant presence of distractions at home, such as social media and household noise, further diminishes students\' concentration, ultimately leading to declining engagement with their coursework.',
        fallbackKeywords: ['structured', 'self-discipline', 'peer interaction', 'distractions', 'concentration', 'engagement'],
        explanationVi: "Äoáº¡n Causes cáº§n dĂ¹ng listing words: 'Firstly', 'Secondly', 'Additionally'. Má»—i nguyĂªn nhĂ¢n cáº§n má»™t cĂ¢u giáº£i thĂ­ch ngáº¯n. Káº¿t thĂºc báº±ng há»‡ quáº£ tá»•ng quĂ¡t Ä‘á»ƒ chuyá»ƒn tiáº¿p."
      },
      {
        questionId: 'w3t4_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "self-discipline"):\n\n"Há»c trá»±c tuyáº¿n Ä‘Ă²i há»i sinh viĂªn pháº£i cĂ³ tĂ­nh tá»± giĂ¡c cao."',
        correctAnswer: 'Online learning demands that students possess a high level of self-discipline.',
        modelAnswer: 'Online learning demands that students possess a high level of self-discipline.',
        fallbackKeywords: ['self-discipline', 'online learning', 'demands', 'high level'],
        explanationVi: "'Demands that + S + V' (bare infinitive) = Ä‘Ă²i há»i ráº±ng â€” cáº¥u trĂºc subjunctive mood trang trá»ng. 'Possess' = cĂ³, sá»Ÿ há»¯u â€” formal hÆ¡n 'have'."
      },
      {
        questionId: 'w3t4_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "lack of motivation"):\n\n"Má»™t trong nhá»¯ng váº¥n Ä‘á» lá»›n nháº¥t lĂ  thiáº¿u Ä‘á»™ng lá»±c há»c táº­p."',
        correctAnswer: 'One of the biggest problems is a lack of motivation to study.',
        modelAnswer: 'One of the biggest problems is a lack of motivation to study.',
        fallbackKeywords: ['lack of motivation', 'biggest problems', 'study'],
        explanationVi: "'A lack of + N' = sá»± thiáº¿u há»¥t cá»§a (danh tá»«). 'Motivation to study' = Ä‘á»™ng lá»±c Ä‘á»ƒ há»c â€” 'to + V' lĂ  má»‡nh Ä‘á» má»¥c Ä‘Ă­ch bá»• nghÄ©a cho danh tá»«."
      },
      {
        questionId: 'w3t4_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "time management skills"):\n\n"Nhiá»u sinh viĂªn gáº·p khĂ³ khÄƒn trong viá»‡c quáº£n lĂ½ thá»i gian hiá»‡u quáº£."',
        correctAnswer: 'Many students struggle with managing their time effectively, lacking adequate time management skills.',
        modelAnswer: 'Many students struggle with managing their time effectively, lacking adequate time management skills.',
        fallbackKeywords: ['time management skills', 'students', 'struggle', 'effectively'],
        explanationVi: "'Struggle with + V-ing' = gáº·p khĂ³ khÄƒn trong viá»‡c. Má»‡nh Ä‘á» bá»• sung 'lacking adequate time management skills' = participle clause giáº£i thĂ­ch nguyĂªn nhĂ¢n."
      },
      {
        questionId: 'w3t4_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "distraction"):\n\n"á» nhĂ , cĂ³ quĂ¡ nhiá»u yáº¿u tá»‘ gĂ¢y xao nhĂ£ng khi há»c online."',
        correctAnswer: 'At home, there are too many sources of distraction when studying online.',
        modelAnswer: 'At home, there are too many sources of distraction when studying online.',
        fallbackKeywords: ['distraction', 'home', 'too many', 'studying online'],
        explanationVi: "'Sources of distraction' = cĂ¡c nguá»“n gĂ¢y xao nhĂ£ng. 'When + V-ing' = khi Ä‘ang lĂ m gĂ¬ â€” rĂºt gá»n má»‡nh Ä‘á» thá»i gian khi chá»§ ngá»¯ giá»‘ng nhau."
      },
      {
        questionId: 'w3t4_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "procrastination"):\n\n"Sá»± trĂ¬ hoĂ£n lĂ  nguyĂªn nhĂ¢n phá»• biáº¿n khiáº¿n sinh viĂªn khĂ´ng hoĂ n thĂ nh bĂ i táº­p Ä‘Ăºng háº¡n."',
        correctAnswer: 'Procrastination is a common reason why students fail to complete assignments on time.',
        modelAnswer: 'Procrastination is a common reason why students fail to complete assignments on time.',
        fallbackKeywords: ['procrastination', 'students', 'assignments', 'on time'],
        explanationVi: "'Procrastination' = sá»± trĂ¬ hoĂ£n (noun). 'Fail to + V' = khĂ´ng lĂ m Ä‘Æ°á»£c, khĂ´ng hoĂ n thĂ nh â€” mang sáº¯c thĂ¡i káº¿t quáº£ tiĂªu cá»±c."
      },
      {
        questionId: 'w3t4_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "academic performance"):\n\n"Há»c sinh cĂ³ xu hÆ°á»›ng giáº£m káº¿t quáº£ há»c táº­p khi thiáº¿u Ä‘á»™ng lá»±c."',
        correctAnswer: 'Students tend to experience a decline in academic performance when they lack motivation.',
        modelAnswer: 'Students tend to experience a decline in academic performance when they lack motivation.',
        fallbackKeywords: ['academic performance', 'decline', 'lack motivation', 'tend to'],
        explanationVi: "'Tend to + V' = cĂ³ xu hÆ°á»›ng lĂ m gĂ¬. 'A decline in academic performance' = sá»± sá»¥t giáº£m káº¿t quáº£ â€” dĂ¹ng 'decline in + N' thay vĂ¬ 'decrease of'."
      },
      {
        questionId: 'w3t4_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "intrinsic motivation"):\n\n"Äá»™ng lá»±c ná»™i táº¡i giĂºp sinh viĂªn duy trĂ¬ há»©ng thĂº há»c táº­p lĂ¢u dĂ i."',
        correctAnswer: 'Intrinsic motivation helps students maintain long-term interest in learning.',
        modelAnswer: 'Intrinsic motivation helps students maintain long-term interest in learning.',
        fallbackKeywords: ['intrinsic motivation', 'students', 'long-term interest', 'maintain'],
        explanationVi: "'Intrinsic motivation' = Ä‘á»™ng lá»±c ná»™i táº¡i (xuáº¥t phĂ¡t tá»« bĂªn trong). 'Maintain long-term interest in + N' = duy trĂ¬ há»©ng thĂº lĂ¢u dĂ i â€” collocation quan trá»ng."
      },
      {
        questionId: 'w3t4_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "extrinsic motivation"):\n\n"Má»™t sá»‘ sinh viĂªn chá»‰ há»c Ä‘á»ƒ Ä‘Æ°á»£c Ä‘iá»ƒm cao, Ä‘Ă³ lĂ  Ä‘á»™ng lá»±c bĂªn ngoĂ i."',
        correctAnswer: 'Some students study only to achieve high grades, which is a form of extrinsic motivation.',
        modelAnswer: 'Some students study only to achieve high grades, which is a form of extrinsic motivation.',
        fallbackKeywords: ['extrinsic motivation', 'high grades', 'form of'],
        explanationVi: "'Extrinsic motivation' = Ä‘á»™ng lá»±c bĂªn ngoĂ i (Ä‘iá»ƒm sá»‘, pháº§n thÆ°á»Ÿng). 'A form of + N' = má»™t dáº¡ng cá»§a â€” 'which is a form of' lĂ  má»‡nh Ä‘á» quan há»‡ giáº£i thĂ­ch."
      },
      {
        questionId: 'w3t4_q21', level: 'intermediate', orderIndex: 21,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "digital fatigue"):\n\n"Ngá»“i trÆ°á»›c mĂ n hĂ¬nh quĂ¡ lĂ¢u cĂ³ thá»ƒ dáº«n Ä‘áº¿n má»‡t má»i ká»¹ thuáº­t sá»‘."',
        correctAnswer: 'Spending too long in front of a screen can lead to digital fatigue.',
        modelAnswer: 'Spending too long in front of a screen can lead to digital fatigue.',
        fallbackKeywords: ['digital fatigue', 'screen', 'lead to', 'spending'],
        explanationVi: "'Digital fatigue' = má»‡t má»i do sá»­ dá»¥ng thiáº¿t bá»‹ sá»‘ quĂ¡ nhiá»u. 'Spending too long + doing' = dĂ nh quĂ¡ nhiá»u thá»i gian â€” gerund lĂ m chá»§ ngá»¯."
      },
      {
        questionId: 'w3t4_q22', level: 'intermediate', orderIndex: 22,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "mental well-being"):\n\n"Ăp lá»±c há»c online trong thá»i gian dĂ i áº£nh hÆ°á»Ÿng Ä‘áº¿n sá»©c khá»e tinh tháº§n."',
        correctAnswer: "Sustained pressure from online learning over a long period can affect students' mental well-being.",
        modelAnswer: "Sustained pressure from online learning over a long period can affect students' mental well-being.",
        fallbackKeywords: ['mental well-being', 'online learning', 'pressure', 'affect'],
        explanationVi: "'Mental well-being' = sá»©c khá»e tinh tháº§n (há»c thuáº­t hÆ¡n 'mental health'). 'Sustained pressure' = Ă¡p lá»±c kĂ©o dĂ i â€” 'sustained' = liĂªn tá»¥c, khĂ´ng giáº£m."
      }
    ]
  },
  {
    week: 3, block: 'cause_solution', orderIndex: 5,
    topicName: 'Academic Pressure on Teenagers', topicEmoji: 'đŸ«',
    essayType: 'cause_solution',
    prompt: 'Students today face more academic pressure than ever before. What are the causes of this pressure, and what can be done to reduce it?',
    hintAdvantages: [],
    hintDisadvantages: [],
    vocabularyList: [
      { term: 'academic pressure', definitionVi: 'Ă¡p lá»±c há»c táº­p', example: 'Academic pressure can lead to anxiety and depression.' },
      { term: 'exam-oriented', definitionVi: 'Ä‘á»‹nh hÆ°á»›ng thi cá»­', example: 'An exam-oriented system places too much emphasis on test scores.' },
      { term: 'counselling services', definitionVi: 'dá»‹ch vá»¥ tÆ° váº¥n tĂ¢m lĂ½', example: 'Schools should provide counselling services for stressed students.' },
      { term: 'coping strategies', definitionVi: 'chiáº¿n lÆ°á»£c Ä‘á»‘i phĂ³', example: 'Students need to learn coping strategies to manage stress effectively.' },
      { term: 'mental health', definitionVi: 'sá»©c khá»e tĂ¢m tháº§n', example: 'Unrealistic expectations from parents can harm children\'s mental health.' },
      { term: 'competitive', definitionVi: 'cáº¡nh tranh', example: 'The highly competitive job market puts enormous pressure on students.' },
      { term: 'test scores', definitionVi: 'Ä‘iá»ƒm thi', example: 'Many parents judge their children\'s worth by their test scores.' },
      { term: 'homework loads', definitionVi: 'khá»‘i lÆ°á»£ng bĂ i táº­p vá» nhĂ ', example: 'Reducing homework loads can significantly decrease student stress.' },
      { term: 'emotional support', definitionVi: 'há»— trá»£ vá» máº·t cáº£m xĂºc', example: 'Emotional support from teachers helps students cope with pressure.' },
      { term: 'unrealistic expectations', definitionVi: 'ká»³ vá»ng phi thá»±c táº¿', example: 'Unrealistic expectations from parents can negatively impact children.' },
      { term: 'curriculum reform', definitionVi: 'cáº£i cĂ¡ch chÆ°Æ¡ng trĂ¬nh há»c', example: 'Curriculum reform is needed to reduce excessive academic demands.' },
      { term: 'parental pressure', definitionVi: 'Ă¡p lá»±c tá»« cha máº¹', example: 'Parental pressure is one of the leading causes of student anxiety.' },
      { term: 'well-being', definitionVi: 'sá»©c khá»e vĂ  háº¡nh phĂºc tá»•ng thá»ƒ', example: 'Schools should prioritise students\' well-being alongside academic results.' },
      { term: 'standardised testing', definitionVi: 'kiá»ƒm tra chuáº©n hĂ³a', example: 'Standardised testing increases pressure on both students and teachers.' },
      { term: 'extracurricular activities', definitionVi: 'hoáº¡t Ä‘á»™ng ngoáº¡i khĂ³a', example: 'Extracurricular activities help students relieve academic stress.' }
    ],
    questions: [
      {
        questionId: 'w3t5_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Äá» bĂ i: "What are the causes of this pressure, and what can be done to reduce it?" â€” ÄĂ¢y lĂ  dáº¡ng essay nĂ o?',
        options: ['Cause & Effect', 'Effect & Solution', 'Cause & Solution', 'Discuss Both Views'],
        correctAnswer: 'Cause & Solution',
        explanationVi: "Keyword 'causes' káº¿t há»£p vá»›i 'what can be done' (giáº£i phĂ¡p) xĂ¡c Ä‘á»‹nh Ä‘Ă¢y lĂ  dáº¡ng Cause & Solution. KhĂ´ng cĂ³ 'effects' â†’ khĂ´ng cáº§n phĂ¢n tĂ­ch há»‡ quáº£."
      },
      {
        questionId: 'w3t5_q02', level: 'beginner', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Äiá»n tá»« cĂ²n thiáº¿u:\n\n"Firstly, _____ pressure from parents who expect their children to achieve top grades is a significant cause of student anxiety."',
        correctAnswer: 'parental',
        explanationVi: "'Parental pressure' = Ă¡p lá»±c tá»« cha máº¹. ÄĂ¢y lĂ  collocation chuáº©n. 'Parental' lĂ  adjective cá»§a 'parents'. Cá»¥m nĂ y xuáº¥t hiá»‡n ráº¥t thÆ°á»ng trong IELTS vá» giĂ¡o dá»¥c."
      },
      {
        questionId: 'w3t5_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"NgĂ y nay, há»c sinh pháº£i chá»‹u Ă¡p lá»±c há»c táº­p nhiá»u hÆ¡n bao giá» háº¿t."',
        correctAnswer: 'Nowadays, students face more academic pressure than ever before.',
        modelAnswer: 'Nowadays, students face more academic pressure than ever before.',
        fallbackKeywords: ['academic pressure', 'students', 'nowadays', 'ever before'],
        explanationVi: "'More + N + than ever before' = nhiá»u hÆ¡n bao giá» háº¿t â€” cá»¥m nháº¥n máº¡nh má»©c Ä‘á»™. 'Nowadays' Ä‘á»©ng Ä‘áº§u cĂ¢u lĂ m tráº¡ng ngá»¯ thá»i gian. Láº¥y trá»±c tiáº¿p tá»« Ä‘á» bĂ i."
      },
      {
        questionId: 'w3t5_q04', level: 'beginner', orderIndex: 4,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Ná»n giĂ¡o dá»¥c hiá»‡n nay quĂ¡ chĂº trá»ng Ä‘áº¿n Ä‘iá»ƒm sá»‘ vĂ  káº¿t quáº£ thi cá»­."',
        correctAnswer: 'The current exam-oriented education system places too much emphasis on grades and test scores.',
        modelAnswer: 'The current exam-oriented education system places too much emphasis on grades and test scores.',
        fallbackKeywords: ['exam-oriented', 'education', 'grades', 'test scores'],
        explanationVi: "'Exam-oriented' = Ä‘á»‹nh hÆ°á»›ng thi cá»­ (hyphenated adjective). 'Place emphasis on' = chĂº trá»ng Ä‘áº¿n. 'Test scores' = Ä‘iá»ƒm thi â€” quan trá»ng hÆ¡n 'scores' Ä‘Æ¡n thuáº§n."
      },
      {
        questionId: 'w3t5_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"NhĂ  trÆ°á»ng nĂªn cung cáº¥p dá»‹ch vá»¥ tÆ° váº¥n tĂ¢m lĂ½ cho nhá»¯ng há»c sinh Ä‘ang chá»‹u cÄƒng tháº³ng."',
        correctAnswer: 'Schools should provide counselling services for students who are under stress.',
        modelAnswer: 'Schools should provide counselling services for students who are under stress.',
        fallbackKeywords: ['counselling services', 'schools', 'students', 'stress'],
        explanationVi: "'Counselling services' = dá»‹ch vá»¥ tÆ° váº¥n tĂ¢m lĂ½. 'Under stress' = Ä‘ang chá»‹u cÄƒng tháº³ng (idiomatic). 'Should + V' dĂ¹ng Ä‘á»ƒ Ä‘á» xuáº¥t giáº£i phĂ¡p trong Cause & Solution essay."
      },
      {
        questionId: 'w3t5_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Há»c sinh cáº§n Ä‘Æ°á»£c dáº¡y cĂ¡c chiáº¿n lÆ°á»£c Ä‘á»‘i phĂ³ Ä‘á»ƒ quáº£n lĂ½ cÄƒng tháº³ng hiá»‡u quáº£ hÆ¡n."',
        correctAnswer: 'Students need to be taught coping strategies to manage stress more effectively.',
        modelAnswer: 'Students need to be taught coping strategies to manage stress more effectively.',
        fallbackKeywords: ['coping strategies', 'students', 'stress', 'effectively'],
        explanationVi: "'Need to be taught' = passive voice â€” há»c sinh lĂ  ngÆ°á»i Ä‘Æ°á»£c dáº¡y. 'Coping strategies' = chiáº¿n lÆ°á»£c Ä‘á»‘i phĂ³. 'More effectively' = má»™t cĂ¡ch hiá»‡u quáº£ hÆ¡n."
      },
      {
        questionId: 'w3t5_q07', level: 'elementary', orderIndex: 7,
        type: 'rearrange',
        questionText: 'Sáº¯p xáº¿p cĂ¡c tá»«/cá»¥m tá»« sau thĂ nh cĂ¢u hoĂ n chá»‰nh:\n[could / Schools / by providing / reduce pressure / emotional support / and reducing homework loads]',
        correctAnswer: 'Schools could reduce pressure by providing emotional support and reducing homework loads.',
        modelAnswer: 'Schools could reduce pressure by providing emotional support and reducing homework loads.',
        fallbackKeywords: ['schools', 'reduce pressure', 'emotional support', 'homework loads'],
        explanationVi: "Cáº¥u trĂºc: 'Subject + could + V + by + V-ing' diá»…n Ä‘áº¡t giáº£i phĂ¡p vĂ  cĂ¡ch thá»±c hiá»‡n. 'Homework loads' = khá»‘i lÆ°á»£ng bĂ i táº­p. 'Emotional support' = há»— trá»£ cáº£m xĂºc."
      },
      {
        questionId: 'w3t5_q08', level: 'elementary', orderIndex: 8,
        type: 'error_correction',
        questionText: 'CĂ¢u sau cĂ³ lá»—i. HĂ£y sá»­a láº¡i:\n\n"One solution is that schools should to offer more mental health support."',
        correctAnswer: 'One solution is that schools should offer more mental health support.',
        modelAnswer: 'One solution is that schools should offer more mental health support.',
        fallbackKeywords: ['schools', 'mental health', 'support', 'solution'],
        explanationVi: "Lá»—i: Sau modal verb 'should' KHĂ”NG dĂ¹ng 'to'. Cáº¥u trĂºc: 'should + bare infinitive'. XĂ³a 'to' trÆ°á»›c 'offer'."
      },
      {
        questionId: 'w3t5_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Ká»³ vá»ng phi thá»±c táº¿ tá»« cha máº¹ cĂ³ thá»ƒ cĂ³ tĂ¡c Ä‘á»™ng tiĂªu cá»±c Ä‘áº¿n sá»©c khá»e tĂ¢m tháº§n cá»§a tráº» em."',
        correctAnswer: 'Unrealistic expectations from parents can have a negative impact on children\'s mental health.',
        modelAnswer: 'Unrealistic expectations from parents can have a negative impact on children\'s mental health.',
        fallbackKeywords: ['unrealistic expectations', 'parents', 'negative impact', 'mental health'],
        explanationVi: "'Have a negative impact on + N' = cĂ³ tĂ¡c Ä‘á»™ng tiĂªu cá»±c lĂªn. Academic hÆ¡n 'affect negatively'. 'Unrealistic expectations' = ká»³ vá»ng phi thá»±c táº¿ â€” collocation quan trá»ng."
      },
      {
        questionId: 'w3t5_q10', level: 'intermediate', orderIndex: 10,
        type: 'short_writing',
        questionText: 'Viáº¿t 1 Ä‘oáº¡n body paragraph (~80-100 tá»«) vá» CĂC NGUYĂN NHĂ‚N gĂ¢y ra Ă¡p lá»±c há»c táº­p cho há»c sinh.\n\nGá»£i Ă½: exam-oriented system / parental pressure / competitive job market',
        modelAnswer: 'There are two primary causes of the growing academic pressure experienced by students today. The first is the exam-oriented education system, which prioritises test scores over holistic development, compelling students to spend excessive hours memorising content rather than developing practical skills. The second cause is parental pressure; many parents, driven by a desire for their children\'s success in an increasingly competitive job market, impose unrealistic expectations that generate considerable anxiety. Together, these factors create an environment in which students feel perpetually stressed and unable to meet the demands placed upon them.',
        fallbackKeywords: ['exam-oriented', 'parental pressure', 'competitive', 'unrealistic expectations', 'anxiety', 'test scores'],
        explanationVi: "Äoáº¡n Causes dĂ¹ng 'The first... The second...' hoáº·c 'Firstly... Secondly...' Ä‘á»ƒ liá»‡t kĂª. Má»—i nguyĂªn nhĂ¢n cáº§n giáº£i thĂ­ch cÆ¡ cháº¿ táº¡i sao nĂ³ gĂ¢y ra Ă¡p lá»±c."
      },
      {
        questionId: 'w3t5_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "academic pressure"):\n\n"NgĂ y nay, há»c sinh pháº£i chá»‹u Ă¡p lá»±c há»c táº­p lá»›n hÆ¡n bao giá» háº¿t."',
        correctAnswer: 'Today, students face greater academic pressure than ever before.',
        modelAnswer: 'Today, students face greater academic pressure than ever before.',
        fallbackKeywords: ['academic pressure', 'students', 'greater than ever'],
        explanationVi: "'Than ever before' = hÆ¡n bao giá» háº¿t â€” nháº¥n máº¡nh má»©c Ä‘á»™ so sĂ¡nh. 'Face + N' = pháº£i Ä‘á»‘i máº·t vá»›i, pháº£i chá»‹u Ä‘á»±ng."
      },
      {
        questionId: 'w3t5_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "parental pressure" + "high expectations"):\n\n"Cha máº¹ thÆ°á»ng Ä‘áº·t ra ká»³ vá»ng cao Ä‘á»‘i vá»›i káº¿t quáº£ há»c táº­p cá»§a con cĂ¡i."',
        correctAnswer: "Parents often place high expectations on their children's academic results, creating significant parental pressure.",
        modelAnswer: "Parents often place high expectations on their children's academic results, creating significant parental pressure.",
        fallbackKeywords: ['parental pressure', 'high expectations', 'academic results', 'children'],
        explanationVi: "'Place high expectations on' = Ä‘áº·t ká»³ vá»ng cao vĂ o (collocation: place/put expectations on). Participle clause 'creating...' = háº­u quáº£ trá»±c tiáº¿p."
      },
      {
        questionId: 'w3t5_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "exam-oriented education"):\n\n"Ná»n giĂ¡o dá»¥c hiá»‡n nay quĂ¡ chĂº trá»ng Ä‘áº¿n Ä‘iá»ƒm sá»‘ vĂ  ká»³ thi."',
        correctAnswer: 'Modern education places excessive emphasis on grades and exams, reflecting an exam-oriented education system.',
        modelAnswer: 'Modern education places excessive emphasis on grades and exams, reflecting an exam-oriented education system.',
        fallbackKeywords: ['exam-oriented education', 'grades', 'excessive emphasis'],
        explanationVi: "'Exam-oriented' = Ä‘á»‹nh hÆ°á»›ng theo ká»³ thi (compound adjective). 'Place excessive emphasis on' = quĂ¡ chĂº trá»ng Ä‘áº¿n â€” collocation há»c thuáº­t."
      },
      {
        questionId: 'w3t5_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "performance anxiety"):\n\n"Lo láº¯ng vá» thĂ nh tĂ­ch khiáº¿n nhiá»u há»c sinh khĂ´ng thá»ƒ táº­p trung há»c."',
        correctAnswer: 'Performance anxiety prevents many students from focusing on their studies.',
        modelAnswer: 'Performance anxiety prevents many students from focusing on their studies.',
        fallbackKeywords: ['performance anxiety', 'students', 'focusing', 'studies'],
        explanationVi: "'Performance anxiety' = lo láº¯ng vá» thĂ nh tĂ­ch. 'Prevent + O + from + V-ing' = ngÄƒn cáº£n ai lĂ m gĂ¬ â€” cáº¥u trĂºc quan trá»ng trong IELTS."
      },
      {
        questionId: 'w3t5_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "perfectionism"):\n\n"Chá»§ nghÄ©a cáº§u toĂ n khiáº¿n há»c sinh sá»£ máº¯c lá»—i trong há»c táº­p."',
        correctAnswer: 'Perfectionism causes students to fear making mistakes in their academic work.',
        modelAnswer: 'Perfectionism causes students to fear making mistakes in their academic work.',
        fallbackKeywords: ['perfectionism', 'students', 'fear', 'mistakes'],
        explanationVi: "'Perfectionism' = chá»§ nghÄ©a cáº§u toĂ n. 'Cause + O + to V' = khiáº¿n ai lĂ m gĂ¬. 'Fear + V-ing' = sá»£ viá»‡c lĂ m gĂ¬ (gerund sau 'fear')."
      },
      {
        questionId: 'w3t5_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "fear of failure"):\n\n"Ná»—i sá»£ tháº¥t báº¡i cĂ³ thá»ƒ khiáº¿n há»c sinh máº¥t tá»± tin."',
        correctAnswer: 'A fear of failure can cause students to lose self-confidence.',
        modelAnswer: 'A fear of failure can cause students to lose self-confidence.',
        fallbackKeywords: ['fear of failure', 'students', 'self-confidence', 'lose'],
        explanationVi: "'A fear of failure' = ná»—i sá»£ tháº¥t báº¡i (danh tá»« + of + danh tá»«). 'Cause + O + to V' = khiáº¿n ai lĂ m gĂ¬. 'Lose self-confidence' = máº¥t tá»± tin."
      },
      {
        questionId: 'w3t5_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "self-esteem"):\n\n"Ăp lá»±c há»c táº­p áº£nh hÆ°á»Ÿng tiĂªu cá»±c Ä‘áº¿n lĂ²ng tá»± trá»ng cá»§a há»c sinh."',
        correctAnswer: "Academic pressure negatively affects students' self-esteem.",
        modelAnswer: "Academic pressure negatively affects students' self-esteem.",
        fallbackKeywords: ['self-esteem', 'academic pressure', 'negatively affects'],
        explanationVi: "'Self-esteem' = lĂ²ng tá»± trá»ng/tá»± tin. 'Negatively affects' = áº£nh hÆ°á»Ÿng tiĂªu cá»±c â€” adverb Ä‘áº·t trÆ°á»›c Ä‘á»™ng tá»«. KhĂ´ng nháº§m vá»›i 'self-confidence' (tá»± tin)."
      },
      {
        questionId: 'w3t5_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "academic workload"):\n\n"Thiáº¿u ngá»§ lĂ  háº­u quáº£ phá»• biáº¿n cá»§a khá»‘i lÆ°á»£ng há»c táº­p lá»›n."',
        correctAnswer: 'Sleep deprivation is a common consequence of a heavy academic workload.',
        modelAnswer: 'Sleep deprivation is a common consequence of a heavy academic workload.',
        fallbackKeywords: ['academic workload', 'sleep deprivation', 'consequence'],
        explanationVi: "'Sleep deprivation' = thiáº¿u ngá»§ (formal, há»c thuáº­t). 'A common consequence of' = háº­u quáº£ phá»• biáº¿n cá»§a â€” 'consequence of + N' lĂ  collocation chuáº©n IELTS."
      },
      {
        questionId: 'w3t5_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "emotional support"):\n\n"Há»c sinh cáº§n Ä‘Æ°á»£c há»— trá»£ tinh tháº§n tá»« cha máº¹ vĂ  tháº§y cĂ´."',
        correctAnswer: 'Students need emotional support from their parents and teachers.',
        modelAnswer: 'Students need emotional support from their parents and teachers.',
        fallbackKeywords: ['emotional support', 'students', 'parents', 'teachers'],
        explanationVi: "'Emotional support' = há»— trá»£ vá» máº·t tinh tháº§n/cáº£m xĂºc. CĂ¢u Ä‘Æ¡n giáº£n nhÆ°ng chĂ­nh xĂ¡c â€” 'need + N + from + N' khĂ´ng cáº§n má»‡nh Ä‘á» phá»©c."
      },
      {
        questionId: 'w3t5_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "coping strategies"):\n\n"Chiáº¿n lÆ°á»£c Ä‘á»‘i phĂ³ giĂºp há»c sinh kiá»ƒm soĂ¡t cÄƒng tháº³ng hiá»‡u quáº£ hÆ¡n."',
        correctAnswer: 'Coping strategies help students manage stress more effectively.',
        modelAnswer: 'Coping strategies help students manage stress more effectively.',
        fallbackKeywords: ['coping strategies', 'students', 'manage stress', 'effectively'],
        explanationVi: "'Coping strategies' = chiáº¿n lÆ°á»£c Ä‘á»‘i phĂ³ (vá»›i cÄƒng tháº³ng). 'Help + O + V (bare infinitive)' = giĂºp ai lĂ m gĂ¬. 'More effectively' = so sĂ¡nh hÆ¡n cá»§a adverb."
      }
    ]
  },
  {
    week: 4, block: 'effect_solution', orderIndex: 6,
    topicName: 'Decline in Reading Habits', topicEmoji: 'đŸ“–',
    essayType: 'effect_solution',
    prompt: 'Young people are reading fewer books than in the past. What effects does this trend have on society, and what solutions can be implemented?',
    hintAdvantages: [],
    hintDisadvantages: [],
    vocabularyList: [
      { term: 'critical thinking', definitionVi: 'tÆ° duy pháº£n biá»‡n', example: 'Reading books enhances critical thinking skills.' },
      { term: 'literacy rate', definitionVi: 'tá»· lá»‡ biáº¿t Ä‘á»c biáº¿t viáº¿t', example: 'Countries with high literacy rates have stronger economies.' },
      { term: 'cognitive skills', definitionVi: 'ká»¹ nÄƒng nháº­n thá»©c', example: 'The decline in reading may result in a deterioration of cognitive skills.' },
      { term: 'broaden horizons', definitionVi: 'má»Ÿ rá»™ng táº§m nhĂ¬n', example: 'Reading helps broaden horizons and nurture imagination.' },
      { term: 'vocabulary range', definitionVi: 'vá»‘n tá»« vá»±ng', example: 'Declining reading habits lead to a reduced vocabulary range.' },
      { term: 'promote reading', definitionVi: 'khuyáº¿n khĂ­ch Ä‘á»c sĂ¡ch', example: 'The government should organise campaigns to promote reading.' },
      { term: 'imagination', definitionVi: 'trĂ­ tÆ°á»Ÿng tÆ°á»£ng', example: 'Books nurture children\'s imagination in ways that screens cannot.' },
      { term: 'deterioration', definitionVi: 'sá»± suy giáº£m, thoĂ¡i hĂ³a', example: 'A deterioration of reading habits weakens academic ability.' },
      { term: 'implement', definitionVi: 'thá»±c hiá»‡n, Ă¡p dá»¥ng', example: 'The government plans to implement a national reading programme.' },
      { term: 'reading programme', definitionVi: 'chÆ°Æ¡ng trĂ¬nh Ä‘á»c sĂ¡ch', example: 'A national reading programme could reverse declining literacy trends.' },
      { term: 'digital entertainment', definitionVi: 'giáº£i trĂ­ sá»‘', example: 'Digital entertainment has largely replaced reading among young people.' },
      { term: 'nurture', definitionVi: 'nuĂ´i dÆ°á»¡ng', example: 'Schools should nurture a love of reading from an early age.' },
      { term: 'concentration', definitionVi: 'kháº£ nÄƒng táº­p trung', example: 'Regular reading improves concentration and attention span.' },
      { term: 'empathy', definitionVi: 'sá»± Ä‘á»“ng cáº£m', example: 'Reading fiction develops empathy by exposing readers to different perspectives.' },
      { term: 'academic ability', definitionVi: 'nÄƒng lá»±c há»c thuáº­t', example: 'Poor reading habits directly undermine academic ability.' }
    ],
    questions: [
      {
        questionId: 'w4t6_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Äá» bĂ i: "What effects does this trend have on society, and what solutions can be implemented?" â€” ÄĂ¢y lĂ  dáº¡ng essay nĂ o?',
        options: ['Cause & Effect', 'Effect & Solution', 'Cause & Solution', 'Advantages & Disadvantages'],
        correctAnswer: 'Effect & Solution',
        explanationVi: "Äá» há»i 'effects' (há»‡ quáº£) vĂ  'solutions' (giáº£i phĂ¡p) â€” khĂ´ng há»i 'causes'. ÄĂ¢y lĂ  dáº¡ng Effect & Solution. BP1 phĂ¢n tĂ­ch há»‡ quáº£; BP2 Ä‘á» xuáº¥t giáº£i phĂ¡p."
      },
      {
        questionId: 'w4t6_q02', level: 'beginner', orderIndex: 2,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Viá»‡c khĂ´ng Ä‘á»c sĂ¡ch cĂ³ thá»ƒ lĂ m giáº£m kháº£ nÄƒng tÆ° duy pháº£n biá»‡n cá»§a há»c sinh."',
        correctAnswer: 'Not reading books may reduce students\' ability to think critically.',
        modelAnswer: 'Not reading books may reduce students\' ability to think critically.',
        fallbackKeywords: ['reading', 'students', 'critical thinking', 'reduce'],
        explanationVi: "'Ability to + V' = kháº£ nÄƒng lĂ m gĂ¬. 'Think critically' = tÆ° duy pháº£n biá»‡n (dĂ¹ng adverb). 'May + V' biá»ƒu thá»‹ kháº£ nÄƒng, phĂ¹ há»£p khi nĂªu há»‡ quáº£ khĂ´ng cháº¯c cháº¯n."
      },
      {
        questionId: 'w4t6_q03', level: 'elementary', orderIndex: 3,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"ChĂ­nh phá»§ nĂªn tá»• chá»©c cĂ¡c chiáº¿n dá»‹ch Ä‘á»ƒ khuyáº¿n khĂ­ch Ä‘á»c sĂ¡ch trong giá»›i tráº»."',
        correctAnswer: 'The government should organise campaigns to promote reading among young people.',
        modelAnswer: 'The government should organise campaigns to promote reading among young people.',
        fallbackKeywords: ['government', 'campaigns', 'promote reading', 'young people'],
        explanationVi: "'Organise campaigns to + V' = tá»• chá»©c chiáº¿n dá»‹ch Ä‘á»ƒ lĂ m gĂ¬. 'Promote reading' = khuyáº¿n khĂ­ch Ä‘á»c sĂ¡ch. 'Among young people' = trong giá»›i tráº». ÄĂ¢y lĂ  giáº£i phĂ¡p cáº¥p chĂ­nh phá»§."
      },
      {
        questionId: 'w4t6_q04', level: 'elementary', orderIndex: 4,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Äá»c sĂ¡ch giĂºp má»Ÿ rá»™ng táº§m nhĂ¬n vĂ  nuĂ´i dÆ°á»¡ng trĂ­ tÆ°á»Ÿng tÆ°á»£ng."',
        correctAnswer: 'Reading helps broaden horizons and nurture imagination.',
        modelAnswer: 'Reading helps broaden horizons and nurture imagination.',
        fallbackKeywords: ['reading', 'broaden horizons', 'imagination', 'nurture'],
        explanationVi: "'Broaden horizons' = má»Ÿ rá»™ng táº§m nhĂ¬n (idiomatic expression). 'Nurture imagination' = nuĂ´i dÆ°á»¡ng trĂ­ tÆ°á»Ÿng tÆ°á»£ng. Cáº£ hai lĂ  collocations quan trá»ng trong IELTS."
      },
      {
        questionId: 'w4t6_q05', level: 'elementary', orderIndex: 5,
        type: 'error_correction',
        questionText: 'CĂ¢u sau cĂ³ lá»—i. HĂ£y sá»­a láº¡i:\n\n"One of the effect of declining reading habits is a decrease in vocabulary range."',
        correctAnswer: 'One of the effects of declining reading habits is a decrease in vocabulary range.',
        modelAnswer: 'One of the effects of declining reading habits is a decrease in vocabulary range.',
        fallbackKeywords: ['effects', 'reading habits', 'vocabulary', 'decrease'],
        explanationVi: "Lá»—i: 'one of the + plural noun' â†’ 'effect' pháº£i lĂ  'effects'. Quy táº¯c: sau 'one of the' luĂ´n dĂ¹ng sá»‘ nhiá»u."
      },
      {
        questionId: 'w4t6_q06', level: 'intermediate', orderIndex: 6,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Sá»± suy giáº£m thĂ³i quen Ä‘á»c sĂ¡ch cĂ³ thá»ƒ dáº«n Ä‘áº¿n sá»± thoĂ¡i hĂ³a ká»¹ nÄƒng nháº­n thá»©c á»Ÿ ngÆ°á»i tráº»."',
        correctAnswer: 'The decline in reading habits may result in a deterioration of cognitive skills among young people.',
        modelAnswer: 'The decline in reading habits may result in a deterioration of cognitive skills among young people.',
        fallbackKeywords: ['decline', 'reading habits', 'cognitive skills', 'young people'],
        explanationVi: "'Result in + N' = dáº«n Ä‘áº¿n (nháº¥n máº¡nh káº¿t quáº£ trá»±c tiáº¿p hÆ¡n 'lead to'). 'A deterioration of + N' = sá»± suy thoĂ¡i cá»§a. 'Cognitive skills' = ká»¹ nÄƒng nháº­n thá»©c â€” academic term quan trá»ng."
      },
      {
        questionId: 'w4t6_q07', level: 'intermediate', orderIndex: 7,
        type: 'short_writing',
        questionText: 'Viáº¿t 1 Ä‘oáº¡n body paragraph (~80-100 tá»«) vá» Má»˜T GIáº¢I PHĂP Ä‘á»ƒ cáº£i thiá»‡n thĂ³i quen Ä‘á»c sĂ¡ch trong giá»›i tráº».\n\nGá»£i Ă½: schools / reading programmes / libraries / curriculum',
        modelAnswer: 'One effective solution is for schools to integrate regular reading sessions into the curriculum, making it a compulsory part of the school day. If students are exposed to a wide variety of books from an early age, they are more likely to develop a genuine love of reading that persists into adulthood. Furthermore, schools could establish well-stocked libraries and reading clubs that create an engaging social atmosphere around books. Evidence from countries such as Finland suggests that embedding reading culture within formal education significantly improves both literacy rates and overall academic performance.',
        fallbackKeywords: ['schools', 'reading', 'curriculum', 'literacy', 'libraries', 'academic performance'],
        explanationVi: "Giáº£i phĂ¡p tá»‘t cáº§n: nĂªu giáº£i phĂ¡p cá»¥ thá»ƒ â†’ giáº£i thĂ­ch cÆ¡ cháº¿ â†’ dáº«n chá»©ng hoáº·c vĂ­ dá»¥ â†’ liĂªn káº¿t láº¡i káº¿t quáº£ ká»³ vá»ng."
      },
      {
        questionId: 'w4t6_q08', level: 'intermediate', orderIndex: 8,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "academic pressure"):\n\n"NgĂ y nay, há»c sinh pháº£i chá»‹u Ă¡p lá»±c há»c táº­p lá»›n hÆ¡n bao giá» háº¿t."',
        correctAnswer: 'Students today face more academic pressure than ever before.',
        modelAnswer: 'Students today face more academic pressure than ever before.',
        fallbackKeywords: ['academic pressure', 'today', 'more than ever'],
        explanationVi: "'More... than ever before' = nhiá»u hÆ¡n bao giá» háº¿t. 'Students today' Ä‘áº·t 'today' sau danh tá»« â€” nháº¥n máº¡nh ngá»¯ cáº£nh hiá»‡n táº¡i."
      },
      {
        questionId: 'w4t6_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "parental expectations"):\n\n"Cha máº¹ thÆ°á»ng Ä‘áº·t ká»³ vá»ng ráº¥t cao vĂ o con cĂ¡i."',
        correctAnswer: 'Parents often place extremely high parental expectations on their children.',
        modelAnswer: 'Parents often place extremely high parental expectations on their children.',
        fallbackKeywords: ['parental expectations', 'high', 'children', 'place'],
        explanationVi: "'Parental expectations' = ká»³ vá»ng cá»§a cha máº¹. 'Place expectations on' = Ä‘áº·t ká»³ vá»ng vĂ o â€” 'place' há»c thuáº­t hÆ¡n 'put'. 'Extremely high' = cá»±c ká»³ cao."
      },
      {
        questionId: 'w4t6_q10', level: 'intermediate', orderIndex: 10,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "comparison among students"):\n\n"Viá»‡c so sĂ¡nh giá»¯a há»c sinh vá»›i nhau khiáº¿n nhiá»u em cáº£m tháº¥y tá»± ti."',
        correctAnswer: 'Comparison among students makes many of them feel inferior.',
        modelAnswer: 'Comparison among students makes many of them feel inferior.',
        fallbackKeywords: ['comparison among students', 'inferior', 'feel', 'makes'],
        explanationVi: "'Comparison among students' = sá»± so sĂ¡nh giá»¯a cĂ¡c há»c sinh. 'Make + O + feel + adj' = khiáº¿n ai cáº£m tháº¥y tháº¿ nĂ o. 'Inferior' = tá»± ti, kĂ©m cá»i hÆ¡n."
      },
      {
        questionId: 'w4t6_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "heavy workload"):\n\n"Há»c sinh pháº£i Ä‘á»‘i máº·t vá»›i khá»‘i lÆ°á»£ng bĂ i táº­p khá»•ng lá»“ má»—i ngĂ y."',
        correctAnswer: 'Students are faced with a heavy workload of assignments every single day.',
        modelAnswer: 'Students are faced with a heavy workload of assignments every single day.',
        fallbackKeywords: ['heavy workload', 'students', 'assignments', 'every day'],
        explanationVi: "'Be faced with' = pháº£i Ä‘á»‘i máº·t vá»›i â€” passive idiom. 'Every single day' = má»—i ngĂ y (nháº¥n máº¡nh hÆ¡n 'every day'). 'Heavy workload' = khá»‘i lÆ°á»£ng cĂ´ng viá»‡c náº·ng ná»."
      },
      {
        questionId: 'w4t6_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "stress and burnout"):\n\n"Ăp lá»±c há»c táº­p cĂ³ thá»ƒ gĂ¢y ra cÄƒng tháº³ng vĂ  kiá»‡t sá»©c."',
        correctAnswer: 'Academic pressure can cause both stress and burnout in students.',
        modelAnswer: 'Academic pressure can cause both stress and burnout in students.',
        fallbackKeywords: ['stress', 'burnout', 'academic pressure', 'cause'],
        explanationVi: "'Both... and...' = cáº£... láº«n... â€” nháº¥n máº¡nh hai há»‡ quáº£ cĂ¹ng lĂºc. 'Burnout' = kiá»‡t sá»©c vá» tinh tháº§n (do cÄƒng tháº³ng kĂ©o dĂ i)."
      },
      {
        questionId: 'w4t6_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "workâ€“life balance"):\n\n"Má»™t sá»‘ há»c sinh máº¥t cĂ¢n báº±ng giá»¯a há»c táº­p vĂ  nghá»‰ ngÆ¡i."',
        correctAnswer: 'Some students lose their workâ€“life balance between studying and resting.',
        modelAnswer: 'Some students lose their workâ€“life balance between studying and resting.',
        fallbackKeywords: ['work-life balance', 'studying', 'resting', 'lose'],
        explanationVi: "'Workâ€“life balance' = cĂ¢n báº±ng giá»¯a cĂ´ng viá»‡c/há»c táº­p vĂ  cuá»™c sá»‘ng. 'Between A and B' = giá»¯a A vĂ  B â€” hai gerund song song."
      },
      {
        questionId: 'w4t6_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "supportive learning environment"):\n\n"GiĂ¡o viĂªn nĂªn táº¡o mĂ´i trÆ°á»ng há»c táº­p thoáº£i mĂ¡i vĂ  há»— trá»£ hÆ¡n."',
        correctAnswer: 'Teachers should create a more comfortable and supportive learning environment.',
        modelAnswer: 'Teachers should create a more comfortable and supportive learning environment.',
        fallbackKeywords: ['supportive learning environment', 'teachers', 'comfortable', 'create'],
        explanationVi: "'Supportive learning environment' = mĂ´i trÆ°á»ng há»c táº­p há»— trá»£. 'Should create' = nĂªn táº¡o ra â€” modal verb diá»…n Ä‘áº¡t Ä‘á» xuáº¥t. 'More comfortable and supportive' = so sĂ¡nh hÆ¡n song song."
      },
      {
        questionId: 'w4t6_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "extracurricular activities" + "reduce stress"):\n\n"Viá»‡c tham gia hoáº¡t Ä‘á»™ng ngoáº¡i khĂ³a cĂ³ thá»ƒ giĂºp giáº£m cÄƒng tháº³ng."',
        correctAnswer: 'Participating in extracurricular activities can help students reduce stress.',
        modelAnswer: 'Participating in extracurricular activities can help students reduce stress.',
        fallbackKeywords: ['extracurricular activities', 'reduce stress', 'participating'],
        explanationVi: "'Extracurricular activities' = hoáº¡t Ä‘á»™ng ngoáº¡i khĂ³a. 'Participating in + N' = viá»‡c tham gia vĂ o (gerund lĂ m chá»§ ngá»¯). 'Help + O + V (bare infinitive)'."
      },
      {
        questionId: 'w4t6_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "realistic academic goals"):\n\n"Há»c sinh nĂªn há»c cĂ¡ch Ä‘áº·t má»¥c tiĂªu há»c táº­p há»£p lĂ½."',
        correctAnswer: 'Students should learn how to set realistic academic goals.',
        modelAnswer: 'Students should learn how to set realistic academic goals.',
        fallbackKeywords: ['realistic academic goals', 'students', 'set', 'learn how'],
        explanationVi: "'Realistic academic goals' = má»¥c tiĂªu há»c táº­p thá»±c táº¿/há»£p lĂ½. 'Learn how to + V' = há»c cĂ¡ch lĂ m gĂ¬ â€” cáº¥u trĂºc diá»…n Ä‘áº¡t ká»¹ nÄƒng cáº§n rĂ¨n luyá»‡n."
      },
      {
        questionId: 'w4t6_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "grades are not the only measure of success"):\n\n"XĂ£ há»™i cáº§n thay Ä‘á»•i quan Ä‘iá»ƒm ráº±ng Ä‘iá»ƒm sá»‘ lĂ  thÆ°á»›c Ä‘o duy nháº¥t cá»§a thĂ nh cĂ´ng."',
        correctAnswer: 'Society needs to change the mindset that grades are the only measure of success.',
        modelAnswer: 'Society needs to change the mindset that grades are the only measure of success.',
        fallbackKeywords: ['grades', 'only measure of success', 'mindset', 'change'],
        explanationVi: "'Mindset' = quan Ä‘iá»ƒm/tÆ° duy (há»c thuáº­t hÆ¡n 'thinking'). 'The only measure of success' = thÆ°á»›c Ä‘o duy nháº¥t cá»§a thĂ nh cĂ´ng â€” 'measure of' lĂ  collocation quan trá»ng."
      }
    ]
  },
  {
    week: 4, block: 'cause_effect', orderIndex: 7,
    topicName: 'Dropout Rates in Higher Education', topicEmoji: 'đŸ“',
    essayType: 'cause_effect',
    prompt: 'The number of students dropping out of university is increasing in many countries. What are the causes of this problem, and what effects does it have on individuals and society?',
    hintAdvantages: [],
    hintDisadvantages: [],
    vocabularyList: [
      { term: 'dropout rate', definitionVi: 'tá»· lá»‡ bá» há»c', example: 'The dropout rate has increased significantly in the past decade.' },
      { term: 'financial burden', definitionVi: 'gĂ¡nh náº·ng tĂ i chĂ­nh', example: 'University fees are a heavy financial burden for many families.' },
      { term: 'tuition fees', definitionVi: 'há»c phĂ­', example: 'High tuition fees prevent many students from continuing their studies.' },
      { term: 'unemployment', definitionVi: 'tháº¥t nghiá»‡p', example: 'High dropout rates contribute to youth unemployment.' },
      { term: 'social stability', definitionVi: 'sá»± á»•n Ä‘á»‹nh xĂ£ há»™i', example: 'High dropout rates can undermine long-term social stability.' },
      { term: 'career guidance', definitionVi: 'hÆ°á»›ng nghiá»‡p', example: 'Universities need to strengthen career guidance services.' },
      { term: 'social resources', definitionVi: 'nguá»“n lá»±c xĂ£ há»™i', example: 'High dropout rates represent a waste of social resources.' },
      { term: 'mental health support', definitionVi: 'há»— trá»£ sá»©c khá»e tĂ¢m tháº§n', example: 'Universities should provide better mental health support for struggling students.' },
      { term: 'academic pressure', definitionVi: 'Ă¡p lá»±c há»c táº­p', example: 'Academic pressure is a leading cause of university dropout.' },
      { term: 'scholarship', definitionVi: 'há»c bá»•ng', example: 'More scholarships could prevent financially disadvantaged students from dropping out.' },
      { term: 'income inequality', definitionVi: 'báº¥t bĂ¬nh Ä‘áº³ng thu nháº­p', example: 'Income inequality means poorer students are more likely to drop out.' },
      { term: 'undermine', definitionVi: 'lĂ m suy yáº¿u, phĂ¡ hoáº¡i', example: 'High dropout rates undermine investment in public education.' },
      { term: 'higher education', definitionVi: 'giĂ¡o dá»¥c Ä‘áº¡i há»c', example: 'Access to quality higher education remains unequal in many countries.' },
      { term: 'productivity', definitionVi: 'nÄƒng suáº¥t', example: 'Dropouts generally contribute less to national productivity.' },
      { term: 'vocational training', definitionVi: 'Ä‘Ă o táº¡o nghá»', example: 'Vocational training provides an alternative pathway for students who leave university.' }
    ],
    questions: [
      {
        questionId: 'w4t7_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Äá» bĂ i: "What are the causes of this problem, and what effects does it have on individuals and society?" â€” ÄĂ¢y lĂ  dáº¡ng essay nĂ o?',
        options: ['Cause & Solution', 'Cause & Effect', 'Effect & Solution', 'Opinion Essay'],
        correctAnswer: 'Cause & Effect',
        explanationVi: "Tá»« khĂ³a 'causes' vĂ  'effects' cĂ¹ng xuáº¥t hiá»‡n â†’ dáº¡ng Cause & Effect. BĂ i cáº§n BP1 phĂ¢n tĂ­ch nguyĂªn nhĂ¢n, BP2 phĂ¢n tĂ­ch há»‡ quáº£ vá»›i cĂ¡ nhĂ¢n VĂ€ xĂ£ há»™i."
      },
      {
        questionId: 'w4t7_q02', level: 'beginner', orderIndex: 2,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Má»™t trong nhá»¯ng nguyĂªn nhĂ¢n chĂ­nh lĂ  gĂ¡nh náº·ng tĂ i chĂ­nh cá»§a giĂ¡o dá»¥c Ä‘áº¡i há»c."',
        correctAnswer: 'One of the main causes is the financial burden of higher education.',
        modelAnswer: 'One of the main causes is the financial burden of higher education.',
        fallbackKeywords: ['financial burden', 'causes', 'higher education'],
        explanationVi: "'One of the main causes is + N' â€” cáº¥u trĂºc nĂªu nguyĂªn nhĂ¢n chuáº©n trong IELTS. 'Financial burden' = gĂ¡nh náº·ng tĂ i chĂ­nh â€” collocation quan trá»ng."
      },
      {
        questionId: 'w4t7_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Há»c phĂ­ cao ngÄƒn cáº£n nhiá»u sinh viĂªn tiáº¿p tá»¥c viá»‡c há»c."',
        correctAnswer: 'High tuition fees prevent many students from continuing their studies.',
        modelAnswer: 'High tuition fees prevent many students from continuing their studies.',
        fallbackKeywords: ['tuition fees', 'students', 'continuing', 'studies'],
        explanationVi: "'Prevent + O + from + V-ing' = ngÄƒn cáº£n ai lĂ m gĂ¬. 'Tuition fees' = há»c phĂ­. Cáº¥u trĂºc nĂ y ráº¥t phá»• biáº¿n trong IELTS Writing khi nĂªu trá»Ÿ ngáº¡i."
      },
      {
        questionId: 'w4t7_q04', level: 'elementary', orderIndex: 4,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Tá»· lá»‡ bá» há»c cao cÅ©ng Ä‘á»“ng nghÄ©a vá»›i sá»± lĂ£ng phĂ­ Ä‘Ă¡ng ká»ƒ nguá»“n lá»±c xĂ£ há»™i."',
        correctAnswer: 'A high dropout rate also represents a significant waste of social resources.',
        modelAnswer: 'A high dropout rate also represents a significant waste of social resources.',
        fallbackKeywords: ['dropout rate', 'waste', 'social resources'],
        explanationVi: "'Represent + N' = Ä‘áº¡i diá»‡n cho, Ä‘á»“ng nghÄ©a vá»›i. 'A significant waste of' = sá»± lĂ£ng phĂ­ Ä‘Ă¡ng ká»ƒ cá»§a. ÄĂ¢y lĂ  há»‡ quáº£ á»Ÿ cáº¥p Ä‘á»™ xĂ£ há»™i."
      },
      {
        questionId: 'w4t7_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"CĂ¡c trÆ°á»ng Ä‘áº¡i há»c cáº§n tÄƒng cÆ°á»ng dá»‹ch vá»¥ hÆ°á»›ng nghiá»‡p cho sinh viĂªn."',
        correctAnswer: 'Universities need to strengthen career guidance for students.',
        modelAnswer: 'Universities need to strengthen career guidance for students.',
        fallbackKeywords: ['universities', 'career guidance', 'students'],
        explanationVi: "'Strengthen + N' = tÄƒng cÆ°á»ng, cá»§ng cá»‘. 'Career guidance' = hÆ°á»›ng nghiá»‡p â€” giáº£i phĂ¡p phá»• biáº¿n trong essay vá» dropout. DĂ¹ng 'need to + V' Ä‘á»ƒ Ä‘á» xuáº¥t biá»‡n phĂ¡p cáº§n thiáº¿t."
      },
      {
        questionId: 'w4t7_q06', level: 'elementary', orderIndex: 6,
        type: 'error_correction',
        questionText: 'CĂ¢u sau cĂ³ lá»—i. HĂ£y sá»­a láº¡i:\n\n"Dropping out of university can leads to unemployment and low income."',
        correctAnswer: 'Dropping out of university can lead to unemployment and low income.',
        modelAnswer: 'Dropping out of university can lead to unemployment and low income.',
        fallbackKeywords: ['dropping out', 'university', 'unemployment', 'income'],
        explanationVi: "Lá»—i: Sau modal verb 'can' pháº£i dĂ¹ng bare infinitive. 'leads' â†’ 'lead' (bá» -s). Quy táº¯c: 'can/could/will/would/should + V (nguyĂªn thá»ƒ khĂ´ng to)'."
      },
      {
        questionId: 'w4t7_q07', level: 'intermediate', orderIndex: 7,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Náº¿u khĂ´ng Ä‘Æ°á»£c giáº£i quyáº¿t ká»‹p thá»i, tá»· lá»‡ bá» há»c cao cĂ³ thá»ƒ lĂ m suy yáº¿u sá»± á»•n Ä‘á»‹nh xĂ£ há»™i."',
        correctAnswer: 'If not addressed promptly, high dropout rates could undermine social stability.',
        modelAnswer: 'If not addressed promptly, high dropout rates could undermine social stability.',
        fallbackKeywords: ['dropout rates', 'social stability', 'addressed', 'undermine'],
        explanationVi: "'If not addressed promptly' = náº¿u khĂ´ng Ä‘Æ°á»£c giáº£i quyáº¿t ká»‹p thá»i (passive conditional). 'Undermine' = lĂ m suy yáº¿u, phĂ¡ hoáº¡i ngáº§m. 'Could' = kháº£ nÄƒng trong tÆ°Æ¡ng lai."
      },
      {
        questionId: 'w4t7_q08', level: 'intermediate', orderIndex: 8,
        type: 'short_writing',
        questionText: 'Viáº¿t 1 Ä‘oáº¡n body paragraph (~80-100 tá»«) vá» Há»† QUáº¢ cá»§a tá»· lá»‡ bá» há»c cao Ä‘á»‘i vá»›i XĂƒ Há»˜I.\n\nGá»£i Ă½: unemployment / social resources / productivity / social stability',
        modelAnswer: 'The rising dropout rate has several damaging consequences for society as a whole. Firstly, graduates who abandon their studies are more likely to face long-term unemployment, placing additional pressure on government welfare systems. Furthermore, public investment in higher education is essentially wasted when students fail to complete their degrees, representing a misallocation of social resources. Over time, a less educated workforce reduces national productivity and hampers economic growth. If these trends are not reversed, high dropout rates could ultimately undermine social stability and widen existing income inequalities.',
        fallbackKeywords: ['unemployment', 'social resources', 'productivity', 'economic growth', 'social stability', 'dropout'],
        explanationVi: "Äoáº¡n Effects vá» xĂ£ há»™i cáº§n bao gá»“m há»‡ quáº£ kinh táº¿, xĂ£ há»™i, vĂ  dĂ i háº¡n. DĂ¹ng 'Firstly... Furthermore... Over time...' Ä‘á»ƒ tá»• chá»©c máº¡ch láº¡c."
      },
      {
        questionId: 'w4t7_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "drop out of university"):\n\n"NgĂ y cĂ ng cĂ³ nhiá»u sinh viĂªn bá» há»c Ä‘áº¡i há»c á»Ÿ nhiá»u quá»‘c gia."',
        correctAnswer: 'An increasing number of students are choosing to drop out of university across many countries.',
        modelAnswer: 'An increasing number of students are choosing to drop out of university across many countries.',
        fallbackKeywords: ['drop out of university', 'increasing number', 'countries'],
        explanationVi: "'An increasing number of + plural N' = ngĂ y cĂ ng nhiá»u â€” trang trá»ng hÆ¡n 'more and more'. 'Across many countries' = á»Ÿ nhiá»u quá»‘c gia (across = kháº¯p)."
      },
      {
        questionId: 'w4t7_q10', level: 'intermediate', orderIndex: 10,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "university dropout rate"):\n\n"Tá»‰ lá»‡ bá» há»c Ä‘áº¡i há»c Ä‘ang tÄƒng nhanh trong tháº­p ká»· qua."',
        correctAnswer: 'The university dropout rate has been rising rapidly over the past decade.',
        modelAnswer: 'The university dropout rate has been rising rapidly over the past decade.',
        fallbackKeywords: ['university dropout rate', 'rising rapidly', 'past decade'],
        explanationVi: "'Has been rising' = Present Perfect Continuous nháº¥n máº¡nh xu hÆ°á»›ng liĂªn tá»¥c. 'Over the past decade' = trong tháº­p ká»· qua (decade = 10 nÄƒm)."
      },
      {
        questionId: 'w4t7_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "financial burden"):\n\n"Má»™t trong nhá»¯ng nguyĂªn nhĂ¢n chĂ­nh lĂ  gĂ¡nh náº·ng tĂ i chĂ­nh."',
        correctAnswer: 'One of the main causes is the financial burden placed on students and their families.',
        modelAnswer: 'One of the main causes is the financial burden placed on students and their families.',
        fallbackKeywords: ['financial burden', 'main causes', 'students'],
        explanationVi: "'Financial burden' = gĂ¡nh náº·ng tĂ i chĂ­nh. 'Placed on + N' = participle clause bá»• nghÄ©a cho 'burden', chá»‰ rĂµ Ä‘á»‘i tÆ°á»£ng chá»‹u gĂ¡nh náº·ng."
      },
      {
        questionId: 'w4t7_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "tuition fees"):\n\n"Há»c phĂ­ cao khiáº¿n nhiá»u sinh viĂªn khĂ´ng thá»ƒ tiáº¿p tá»¥c há»c."',
        correctAnswer: 'High tuition fees prevent many students from continuing their education.',
        modelAnswer: 'High tuition fees prevent many students from continuing their education.',
        fallbackKeywords: ['tuition fees', 'high', 'prevent', 'continuing', 'education'],
        explanationVi: "'Tuition fees' = há»c phĂ­. 'Prevent + O + from + V-ing' = ngÄƒn cáº£n ai lĂ m gĂ¬ â€” cáº¥u trĂºc IELTS Band 7+ quan trá»ng."
      },
      {
        questionId: 'w4t7_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "student loan debt"):\n\n"Nhiá»u sinh viĂªn pháº£i gĂ¡nh ná»£ vay lá»›n sau khi tá»‘t nghiá»‡p."',
        correctAnswer: 'Many students are burdened with significant student loan debt after graduating.',
        modelAnswer: 'Many students are burdened with significant student loan debt after graduating.',
        fallbackKeywords: ['student loan debt', 'burdened', 'significant', 'graduating'],
        explanationVi: "'Be burdened with' = bá»‹ gĂ¡nh náº·ng bá»Ÿi â€” passive idiom há»c thuáº­t. 'After graduating' = rĂºt gá»n má»‡nh Ä‘á» thá»i gian khi chá»§ ngá»¯ giá»‘ng nhau."
      },
      {
        questionId: 'w4t7_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "academic failure"):\n\n"Má»™t sá»‘ sinh viĂªn bá» há»c vĂ¬ tháº¥t báº¡i trong há»c táº­p."',
        correctAnswer: 'Some students drop out due to academic failure and an inability to meet course requirements.',
        modelAnswer: 'Some students drop out due to academic failure and an inability to meet course requirements.',
        fallbackKeywords: ['academic failure', 'drop out', 'course requirements'],
        explanationVi: "'Due to + N' = do, vĂ¬ â€” giá»›i tá»« nguyĂªn nhĂ¢n (academic hÆ¡n 'because of'). 'An inability to + V' = sá»± khĂ´ng cĂ³ kháº£ nÄƒng â€” cáº¥u trĂºc danh tá»« hĂ³a trang trá»ng."
      },
      {
        questionId: 'w4t7_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "mental health issues"):\n\n"Váº¥n Ä‘á» sá»©c khá»e tinh tháº§n khiáº¿n sinh viĂªn khĂ³ tiáº¿p tá»¥c há»c."',
        correctAnswer: 'Mental health issues make it difficult for students to continue their studies.',
        modelAnswer: 'Mental health issues make it difficult for students to continue their studies.',
        fallbackKeywords: ['mental health issues', 'students', 'continue', 'studies'],
        explanationVi: "'Make it difficult for + O + to V' = khiáº¿n viá»‡c lĂ m gĂ¬ trá»Ÿ nĂªn khĂ³ khÄƒn â€” 'it' lĂ  dummy subject. Cáº¥u trĂºc nĂ y phá»• biáº¿n hÆ¡n 'make students difficult to'."
      },
      {
        questionId: 'w4t7_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "low income" + "unemployment"):\n\n"Viá»‡c khĂ´ng cĂ³ báº±ng Ä‘áº¡i há»c cĂ³ thá»ƒ dáº«n Ä‘áº¿n thu nháº­p tháº¥p vĂ  tháº¥t nghiá»‡p."',
        correctAnswer: 'Not having a university degree can lead to low income and unemployment.',
        modelAnswer: 'Not having a university degree can lead to low income and unemployment.',
        fallbackKeywords: ['low income', 'unemployment', 'university degree', 'lead to'],
        explanationVi: "'Not having + N' = gerund phá»§ Ä‘á»‹nh lĂ m chá»§ ngá»¯. 'Lead to + N' = dáº«n Ä‘áº¿n (hai káº¿t quáº£ song song: low income and unemployment)."
      },
      {
        questionId: 'w4t7_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "academic counseling"):\n\n"ChĂ­nh phá»§ nĂªn cung cáº¥p nhiá»u chÆ°Æ¡ng trĂ¬nh tÆ° váº¥n há»c táº­p hÆ¡n cho sinh viĂªn."',
        correctAnswer: 'The government should provide more academic counseling programmes to support students.',
        modelAnswer: 'The government should provide more academic counseling programmes to support students.',
        fallbackKeywords: ['academic counseling', 'government', 'programmes', 'support'],
        explanationVi: "'Academic counseling' = tÆ° váº¥n há»c táº­p/hÆ°á»›ng nghiá»‡p. 'Should provide' = should + V (Ä‘á» xuáº¥t giáº£i phĂ¡p). 'Programmes' = spelling British English."
      },
      {
        questionId: 'w4t7_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "career guidance"):\n\n"CĂ¡c trÆ°á»ng Ä‘áº¡i há»c cáº§n tÄƒng cÆ°á»ng hÆ°á»›ng nghiá»‡p cho sinh viĂªn."',
        correctAnswer: 'Universities need to strengthen career guidance services for their students.',
        modelAnswer: 'Universities need to strengthen career guidance services for their students.',
        fallbackKeywords: ['career guidance', 'universities', 'strengthen', 'students'],
        explanationVi: "'Career guidance' = hÆ°á»›ng dáº«n nghá» nghiá»‡p. 'Strengthen' = tÄƒng cÆ°á»ng, cá»§ng cá»‘ â€” há»c thuáº­t hÆ¡n 'improve' hay 'increase'. 'Services' nháº¥n máº¡nh Ä‘Ă¢y lĂ  dá»‹ch vá»¥ thá»ƒ cháº¿."
      }
    ]
  },

  // â”€â”€â”€ BLOCK 3: Week 5-6 â€” Agree or Disagree / Work â”€â”€â”€
  {
    week: 5, block: 'agree_disagree', orderIndex: 8,
    topicName: 'Shorter Work Week', topicEmoji: 'đŸ’¼',
    essayType: 'agree_disagree',
    prompt: 'The working week should be shorter and workers should have a longer weekend. Do you agree or disagree?',
    hintAdvantages: ['reduces stress', 'increases productivity', 'better work-life balance'],
    hintDisadvantages: ['economic impact', 'reduced income', 'lower output'],
    vocabularyList: [
      { term: 'work-life balance', definitionVi: 'cĂ¢n báº±ng cĂ´ng viá»‡c vĂ  cuá»™c sá»‘ng', example: 'A shorter work week promotes a healthier work-life balance.' },
      { term: 'productivity', definitionVi: 'nÄƒng suáº¥t lao Ä‘á»™ng', example: 'Studies show that well-rested workers have higher productivity.' },
      { term: 'economic output', definitionVi: 'sáº£n lÆ°á»£ng kinh táº¿', example: 'Reducing working hours could lower economic output.' },
      { term: 'burnout', definitionVi: 'kiá»‡t sá»©c (do lĂ m viá»‡c quĂ¡ sá»©c)', example: 'Overworking for an extended period can lead to burnout.' },
      { term: 'employee well-being', definitionVi: 'sá»©c khá»e vĂ  phĂºc lá»£i nhĂ¢n viĂªn', example: 'More rest time significantly improves employee well-being.' },
      { term: 'labor productivity', definitionVi: 'nÄƒng suáº¥t lao Ä‘á»™ng', example: 'Research suggests that reducing working hours can improve labor productivity.' },
      { term: 'extended period', definitionVi: 'khoáº£ng thá»i gian dĂ i', example: 'Overworking for an extended period can damage physical health.' },
      { term: 'economic growth', definitionVi: 'tÄƒng trÆ°á»Ÿng kinh táº¿', example: 'Some argue a shorter working week may slow economic growth.' },
      { term: 'leisure time', definitionVi: 'thá»i gian giáº£i trĂ­, nghá»‰ ngÆ¡i', example: 'Workers need sufficient leisure time to recharge.' },
      { term: 'overworking', definitionVi: 'lĂ m viá»‡c quĂ¡ sá»©c', example: 'Overworking is linked to serious health conditions.' },
      { term: 'workforce', definitionVi: 'lá»±c lÆ°á»£ng lao Ä‘á»™ng', example: 'A healthier workforce is more productive in the long run.' },
      { term: 'morale', definitionVi: 'tinh tháº§n lĂ m viá»‡c', example: 'Shorter working hours can boost employee morale significantly.' },
      { term: 'output', definitionVi: 'sáº£n lÆ°á»£ng Ä‘áº§u ra', example: 'Critics worry that less work time will reduce total output.' },
      { term: 'recovery', definitionVi: 'sá»± phá»¥c há»“i', example: 'Extended weekends allow workers adequate recovery time.' },
      { term: 'stress-related illness', definitionVi: 'bá»‡nh liĂªn quan Ä‘áº¿n cÄƒng tháº³ng', example: 'Reducing hours could decrease stress-related illnesses in the workplace.' }
    ],
    questions: [
      {
        questionId: 'w5t8_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Äá»ƒ Ä‘áº¡t Band 6.5+ trong bĂ i Agree/Disagree, cáº¥u trĂºc bĂ i luáº­n nĂ o lĂ  phĂ¹ há»£p nháº¥t?',
        options: [
          'Viáº¿t 1 body Ä‘á»“ng Ă½ + 1 body khĂ´ng Ä‘á»“ng Ă½ (khĂ´ng rĂµ láº­p trÆ°á»ng)',
          'Viáº¿t rĂµ láº­p trÆ°á»ng (Ä‘á»“ng Ă½ hoáº·c khĂ´ng Ä‘á»“ng Ă½), duy trĂ¬ nháº¥t quĂ¡n suá»‘t bĂ i',
          'KhĂ´ng cáº§n nĂªu Ă½ kiáº¿n cĂ¡ nhĂ¢n trong Introduction',
          'Káº¿t luáº­n khĂ´ng cáº§n nháº¯c láº¡i láº­p trÆ°á»ng'
        ],
        correctAnswer: 'Viáº¿t rĂµ láº­p trÆ°á»ng (Ä‘á»“ng Ă½ hoáº·c khĂ´ng Ä‘á»“ng Ă½), duy trĂ¬ nháº¥t quĂ¡n suá»‘t bĂ i',
        explanationVi: "Band 6.5+ yĂªu cáº§u láº­p trÆ°á»ng rĂµ rĂ ng vĂ  nháº¥t quĂ¡n tá»« Ä‘áº§u Ä‘áº¿n cuá»‘i. Náº¿u viáº¿t 1 body Ä‘á»“ng Ă½ + 1 body khĂ´ng Ä‘á»“ng Ă½ mĂ  khĂ´ng cĂ³ láº­p trÆ°á»ng chá»§ Ä‘áº¡o, bĂ i sáº½ bá»‹ Ä‘Ă¡nh giĂ¡ 'unclear position' â†’ giáº£m Ä‘iá»ƒm Task Response."
      },
      {
        questionId: 'w5t8_q02', level: 'beginner', orderIndex: 2,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"CĂ¢n báº±ng giá»¯a cĂ´ng viá»‡c vĂ  cuá»™c sá»‘ng lĂ  yáº¿u tá»‘ quan trá»ng Ä‘á»ƒ duy trĂ¬ háº¡nh phĂºc tá»•ng thá»ƒ."',
        correctAnswer: 'Work-life balance is a crucial factor in maintaining overall happiness.',
        modelAnswer: 'Work-life balance is a crucial factor in maintaining overall happiness.',
        fallbackKeywords: ['work-life balance', 'crucial', 'happiness', 'maintaining'],
        explanationVi: "'A crucial factor in + V-ing' = yáº¿u tá»‘ quan trá»ng trong viá»‡c. 'Maintaining overall happiness' = duy trĂ¬ háº¡nh phĂºc tá»•ng thá»ƒ. 'Crucial' = quan trá»ng (máº¡nh hÆ¡n 'important')."
      },
      {
        questionId: 'w5t8_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"LĂ m viá»‡c quĂ¡ sá»©c trong thá»i gian dĂ i cĂ³ thá»ƒ dáº«n Ä‘áº¿n kiá»‡t sá»©c."',
        correctAnswer: 'Overworking for an extended period can lead to burnout.',
        modelAnswer: 'Overworking for an extended period can lead to burnout.',
        fallbackKeywords: ['overworking', 'extended period', 'burnout', 'lead to'],
        explanationVi: "'Overworking' = lĂ m viá»‡c quĂ¡ sá»©c (gerund lĂ m chá»§ ngá»¯). 'For an extended period' = trong thá»i gian dĂ i (formal hÆ¡n 'for a long time'). 'Burnout' = kiá»‡t sá»©c do cĂ´ng viá»‡c."
      },
      {
        questionId: 'w5t8_q04', level: 'beginner', orderIndex: 4,
        type: 'topic_sentence',
        questionText: 'Chá»n Thesis Statement tá»‘t nháº¥t cho bĂ i essay Äá»’NG Ă vá»›i tuáº§n lĂ m viá»‡c ngáº¯n hÆ¡n:',
        options: [
          'I will discuss both the advantages and disadvantages of a shorter working week.',
          'I strongly agree that the working week should be shorter, as this would significantly benefit both employees and the economy.',
          'Some people agree while others disagree with this idea.',
          'A shorter working week is an interesting topic to discuss.'
        ],
        correctAnswer: 'I strongly agree that the working week should be shorter, as this would significantly benefit both employees and the economy.',
        explanationVi: "'I strongly agree that...' nĂªu láº­p trÆ°á»ng rĂµ rĂ ng. 'As this would...' giáº£i thĂ­ch lĂ½ do ngay trong thesis â€” Ä‘Ă¢y lĂ  ká»¹ thuáº­t nĂ¢ng cao. Lá»±a chá»n 1 lĂ  Advantages & Disadvantages, khĂ´ng pháº£i Agree/Disagree."
      },
      {
        questionId: 'w5t8_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Khi Ä‘Æ°á»£c nghá»‰ ngÆ¡i nhiá»u hÆ¡n, sá»©c khá»e vĂ  phĂºc lá»£i cá»§a nhĂ¢n viĂªn Ä‘Æ°á»£c cáº£i thiá»‡n Ä‘Ă¡ng ká»ƒ."',
        correctAnswer: 'When given more rest time, employee well-being improves significantly.',
        modelAnswer: 'When given more rest time, employee well-being improves significantly.',
        fallbackKeywords: ['employee well-being', 'rest', 'improves', 'significantly'],
        explanationVi: "'When given + N' = khi Ä‘Æ°á»£c cho/nháº­n (passive participle clause). 'Employee well-being' = sá»©c khá»e vĂ  phĂºc lá»£i nhĂ¢n viĂªn. 'Improves significantly' = cáº£i thiá»‡n Ä‘Ă¡ng ká»ƒ."
      },
      {
        questionId: 'w5t8_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Má»™t sá»‘ ngÆ°á»i cho ráº±ng tuáº§n lĂ m viá»‡c ngáº¯n hÆ¡n cĂ³ thá»ƒ lĂ m cháº­m tÄƒng trÆ°á»Ÿng kinh táº¿."',
        correctAnswer: 'Some people argue that a shorter working week may slow down economic growth.',
        modelAnswer: 'Some people argue that a shorter working week may slow down economic growth.',
        fallbackKeywords: ['shorter working week', 'economic growth', 'slow down', 'argue'],
        explanationVi: "'Some people argue that...' = má»™t sá»‘ ngÆ°á»i cho ráº±ng â€” cĂ¡ch trĂ¬nh bĂ y quan Ä‘iá»ƒm Ä‘á»‘i láº­p mĂ  khĂ´ng máº¥t láº­p trÆ°á»ng cĂ¡ nhĂ¢n. 'Slow down' = lĂ m cháº­m."
      },
      {
        questionId: 'w5t8_q07', level: 'elementary', orderIndex: 7,
        type: 'error_correction',
        questionText: 'CĂ¢u sau cĂ³ lá»—i. HĂ£y sá»­a láº¡i:\n\n"I agree that working weeks should be shorter because workers need time to resting."',
        correctAnswer: 'I agree that working weeks should be shorter because workers need time to rest.',
        modelAnswer: 'I agree that working weeks should be shorter because workers need time to rest.',
        fallbackKeywords: ['agree', 'working weeks', 'shorter', 'workers', 'rest'],
        explanationVi: "Lá»—i: Sau 'need + time + to' pháº£i dĂ¹ng bare infinitive. 'to resting' â†’ 'to rest'. Cáº¥u trĂºc: 'need time to + V (nguyĂªn thá»ƒ)'."
      },
      {
        questionId: 'w5t8_q08', level: 'intermediate', orderIndex: 8,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"NghiĂªn cá»©u cho tháº¥y viá»‡c giáº£m giá» lĂ m thá»±c ra cĂ³ thá»ƒ cáº£i thiá»‡n nÄƒng suáº¥t lao Ä‘á»™ng."',
        correctAnswer: 'Research suggests that reducing working hours can actually improve labor productivity.',
        modelAnswer: 'Research suggests that reducing working hours can actually improve labor productivity.',
        fallbackKeywords: ['research', 'working hours', 'labor productivity', 'improve'],
        explanationVi: "'Research suggests that...' = nghiĂªn cá»©u cho tháº¥y â€” cĂ¡ch dáº«n chá»©ng há»c thuáº­t khĂ´ng cáº§n trĂ­ch nguá»“n cá»¥ thá»ƒ. 'Actually' nháº¥n máº¡nh Ä‘iá»u ngÆ°á»£c trá»±c giĂ¡c. 'Labor productivity' = nÄƒng suáº¥t lao Ä‘á»™ng."
      },
      {
        questionId: 'w5t8_q09', level: 'intermediate', orderIndex: 9,
        type: 'paraphrase',
        questionText: 'Paraphrase cĂ¢u sau:\n\n"The working week should be shorter and workers should have a longer weekend."',
        correctAnswer: 'Employees would benefit from a reduction in the number of days they work each week, allowing for extended periods of leisure and recovery.',
        modelAnswer: 'Employees would benefit from a reduction in the number of days they work each week, allowing for extended periods of leisure and recovery.',
        fallbackKeywords: ['employees', 'reduction', 'leisure', 'recovery', 'extended'],
        explanationVi: "Thay 'workers' â†’ 'employees', 'shorter' â†’ 'reduction in', 'longer weekend' â†’ 'extended periods of leisure and recovery'. 'Allowing for' = cho phĂ©p, táº¡o Ä‘iá»u kiá»‡n cho."
      },
      {
        questionId: 'w5t8_q10', level: 'intermediate', orderIndex: 10,
        type: 'short_writing',
        questionText: 'Viáº¿t 1 Ä‘oáº¡n body paragraph (~80-100 tá»«) Äá»’NG Ă ráº±ng tuáº§n lĂ m viá»‡c nĂªn ngáº¯n hÆ¡n.\n\nGá»£i Ă½: productivity / burnout / work-life balance / employee well-being',
        modelAnswer: 'I strongly believe that reducing the length of the working week would bring considerable benefits to both workers and employers. When employees are given adequate rest, they return to work with renewed energy and sharper focus, which research consistently shows leads to higher labor productivity. Moreover, a longer weekend provides valuable time for physical exercise, family activities, and personal development, all of which contribute to improved mental well-being. Countries such as Iceland have already trialled a four-day working week with overwhelmingly positive results, demonstrating that this approach is both practical and economically viable.',
        fallbackKeywords: ['productivity', 'rest', 'well-being', 'work-life balance', 'four-day', 'employees'],
        explanationVi: "Äoáº¡n Agree cáº§n: láº­p trÆ°á»ng rĂµ â†’ lĂ½ do 1 â†’ lĂ½ do 2 â†’ báº±ng chá»©ng/vĂ­ dá»¥ thá»±c táº¿. KhĂ´ng nĂªn nháº¯c nhÆ°á»£c Ä‘iá»ƒm trong Ä‘oáº¡n nĂ y."
      },
      {
        questionId: 'w5t8_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "working week"):\n\n"Nhiá»u ngÆ°á»i tin ráº±ng tuáº§n lĂ m viá»‡c nĂªn ngáº¯n hÆ¡n Ä‘á»ƒ cĂ³ nhiá»u thá»i gian nghá»‰ ngÆ¡i."',
        correctAnswer: 'Many people believe that the working week should be shorter in order to allow more time for rest.',
        modelAnswer: 'Many people believe that the working week should be shorter in order to allow more time for rest.',
        fallbackKeywords: ['working week', 'shorter', 'rest', 'allow'],
        explanationVi: "'In order to + V' = Ä‘á»ƒ (má»¥c Ä‘Ă­ch, trang trá»ng hÆ¡n 'to'). 'Allow + time for + N' = cho phĂ©p cĂ³ thá»i gian cho â€” collocation há»c thuáº­t."
      },
      {
        questionId: 'w5t8_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "productivity" + "efficiency"):\n\n"LĂ m viá»‡c Ă­t giá» hÆ¡n cĂ³ thá»ƒ giĂºp cáº£i thiá»‡n nÄƒng suáº¥t vĂ  hiá»‡u quáº£ cĂ´ng viá»‡c."',
        correctAnswer: 'Working fewer hours can help improve both productivity and overall efficiency.',
        modelAnswer: 'Working fewer hours can help improve both productivity and overall efficiency.',
        fallbackKeywords: ['productivity', 'efficiency', 'fewer hours', 'improve'],
        explanationVi: "'Fewer hours' = Ă­t giá» hÆ¡n (Ä‘áº¿m Ä‘Æ°á»£c). 'Both A and B' = cáº£ A láº«n B. 'Overall efficiency' = hiá»‡u quáº£ tá»•ng thá»ƒ â€” 'overall' nháº¥n máº¡nh pháº¡m vi rá»™ng."
      },
      {
        questionId: 'w5t8_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "workâ€“life balance"):\n\n"CĂ¢n báº±ng giá»¯a cĂ´ng viá»‡c vĂ  cuá»™c sá»‘ng lĂ  yáº¿u tá»‘ quan trá»ng Ä‘á»ƒ duy trĂ¬ háº¡nh phĂºc."',
        correctAnswer: 'Workâ€“life balance is a crucial factor in maintaining personal well-being and happiness.',
        modelAnswer: 'Workâ€“life balance is a crucial factor in maintaining personal well-being and happiness.',
        fallbackKeywords: ['work-life balance', 'crucial', 'well-being', 'happiness'],
        explanationVi: "'Crucial factor' = yáº¿u tá»‘ then chá»‘t (máº¡nh hÆ¡n 'important factor'). 'In maintaining' = trong viá»‡c duy trĂ¬ â€” gerund sau giá»›i tá»«."
      },
      {
        questionId: 'w5t8_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "family bonding"):\n\n"Khi cĂ³ nhiá»u thá»i gian ráº£nh, ngÆ°á»i lao Ä‘á»™ng cĂ³ thá»ƒ dĂ nh thá»i gian cho gia Ä‘Ă¬nh."',
        correctAnswer: 'With more free time, workers can dedicate time to family bonding.',
        modelAnswer: 'With more free time, workers can dedicate time to family bonding.',
        fallbackKeywords: ['family bonding', 'free time', 'workers', 'dedicate'],
        explanationVi: "'Family bonding' = gáº¯n káº¿t gia Ä‘Ă¬nh. 'Dedicate time to + N/V-ing' = dĂ nh thá»i gian cho â€” formal hÆ¡n 'spend time with'."
      },
      {
        questionId: 'w5t8_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "burnout"):\n\n"Viá»‡c lĂ m viá»‡c quĂ¡ nhiá»u giá» cĂ³ thá»ƒ gĂ¢y ra cÄƒng tháº³ng vĂ  kiá»‡t sá»©c."',
        correctAnswer: 'Working excessive hours can cause both stress and burnout.',
        modelAnswer: 'Working excessive hours can cause both stress and burnout.',
        fallbackKeywords: ['burnout', 'excessive hours', 'stress', 'cause'],
        explanationVi: "'Burnout' = kiá»‡t sá»©c do lĂ m viá»‡c quĂ¡ Ä‘á»™. 'Excessive hours' = sá»‘ giá» quĂ¡ má»©c (excessive = formal hÆ¡n 'too many'). 'Both A and B' liá»‡t kĂª hai káº¿t quáº£."
      },
      {
        questionId: 'w5t8_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "flexible schedule"):\n\n"Lá»‹ch lĂ m viá»‡c linh hoáº¡t giĂºp nhĂ¢n viĂªn kiá»ƒm soĂ¡t tá»‘t hÆ¡n thá»i gian cá»§a mĂ¬nh."',
        correctAnswer: 'A flexible schedule gives employees greater control over their own time.',
        modelAnswer: 'A flexible schedule gives employees greater control over their own time.',
        fallbackKeywords: ['flexible schedule', 'employees', 'control', 'time'],
        explanationVi: "'Control over + N' = quyá»n kiá»ƒm soĂ¡t Ä‘á»‘i vá»›i â€” 'over' lĂ  giá»›i tá»« Ä‘i vá»›i 'control'. 'Greater control' = so sĂ¡nh hÆ¡n cá»§a danh tá»«."
      },
      {
        questionId: 'w5t8_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "employee performance"):\n\n"NhĂ¢n viĂªn cĂ³ thá»i gian nghá»‰ ngÆ¡i há»£p lĂ½ thÆ°á»ng lĂ m viá»‡c hiá»‡u quáº£ hÆ¡n."',
        correctAnswer: 'Employees who have adequate rest time generally show better employee performance.',
        modelAnswer: 'Employees who have adequate rest time generally show better employee performance.',
        fallbackKeywords: ['employee performance', 'rest time', 'adequate', 'better'],
        explanationVi: "'Adequate rest time' = thá»i gian nghá»‰ ngÆ¡i Ä‘áº§y Ä‘á»§. 'Show better performance' = thá»ƒ hiá»‡n/cĂ³ hiá»‡u suáº¥t tá»‘t hÆ¡n â€” 'show' há»c thuáº­t hÆ¡n 'have'."
      },
      {
        questionId: 'w5t8_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "job satisfaction" + "working environment"):\n\n"Má»™t mĂ´i trÆ°á»ng lĂ m viá»‡c tá»‘t giĂºp tÄƒng sá»± hĂ i lĂ²ng trong cĂ´ng viá»‡c."',
        correctAnswer: 'A positive working environment helps increase job satisfaction among employees.',
        modelAnswer: 'A positive working environment helps increase job satisfaction among employees.',
        fallbackKeywords: ['job satisfaction', 'working environment', 'positive', 'increase'],
        explanationVi: "'A positive working environment' = mĂ´i trÆ°á»ng lĂ m viá»‡c tĂ­ch cá»±c. 'Among employees' = trong sá»‘ nhĂ¢n viĂªn â€” 'among' thay 'for' khi nĂ³i vá» nhĂ³m ngÆ°á»i."
      },
      {
        questionId: 'w5t8_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "personal development"):\n\n"Viá»‡c cĂ³ thĂªm thá»i gian nghá»‰ giĂºp há» phĂ¡t triá»ƒn ká»¹ nÄƒng cĂ¡ nhĂ¢n."',
        correctAnswer: 'Having extra time off allows employees to invest in personal development.',
        modelAnswer: 'Having extra time off allows employees to invest in personal development.',
        fallbackKeywords: ['personal development', 'extra time off', 'invest', 'allows'],
        explanationVi: "'Time off' = thá»i gian nghá»‰ (tá»« ghĂ©p). 'Allow + O + to V' = cho phĂ©p ai lĂ m gĂ¬. 'Invest in personal development' = Ä‘áº§u tÆ° vĂ o phĂ¡t triá»ƒn cĂ¡ nhĂ¢n."
      },
      {
        questionId: 'w5t8_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "turnover rate"):\n\n"Giáº£m giá» lĂ m viá»‡c cĂ³ thá»ƒ giĂºp giáº£m tá»‰ lá»‡ nghá»‰ viá»‡c."',
        correctAnswer: 'Reducing working hours may help lower the employee turnover rate.',
        modelAnswer: 'Reducing working hours may help lower the employee turnover rate.',
        fallbackKeywords: ['turnover rate', 'reducing working hours', 'lower'],
        explanationVi: "'Turnover rate' = tá»‰ lá»‡ nhĂ¢n viĂªn nghá»‰ viá»‡c vĂ  thay tháº¿. 'May help lower' = cĂ³ thá»ƒ giĂºp giáº£m â€” 'may' nháº¹ hÆ¡n 'can' (má»©c Ä‘á»™ kháº£ nÄƒng)."
      }
    ]
  },
  {
    week: 5, block: 'agree_disagree', orderIndex: 9,
    topicName: 'Remote Work as the Future', topicEmoji: 'đŸ§‘â€đŸ’»',
    essayType: 'agree_disagree',
    prompt: 'Working from home will become the main way people work in the future. Do you agree or disagree?',
    hintAdvantages: ['flexibility', 'cost savings', 'no commute'],
    hintDisadvantages: ['isolation', 'difficulty monitoring', 'blurred boundaries'],
    vocabularyList: [
      { term: 'remote work', definitionVi: 'lĂ m viá»‡c tá»« xa', example: 'Remote work has become increasingly common since 2020.' },
      { term: 'commuting time', definitionVi: 'thá»i gian Ä‘i láº¡i', example: 'Employees can save commuting time by working from home.' },
      { term: 'hybrid work model', definitionVi: 'mĂ´ hĂ¬nh lĂ m viá»‡c káº¿t há»£p', example: 'Many companies have shifted to a hybrid work model.' },
      { term: 'company culture', definitionVi: 'vÄƒn hĂ³a doanh nghiá»‡p', example: 'Working from home may negatively affect company culture.' },
      { term: 'long-term sustainability', definitionVi: 'bá»n vá»¯ng dĂ i háº¡n', example: 'Some argue that remote work lacks long-term sustainability.' },
      { term: 'prevalent', definitionVi: 'phá»• biáº¿n', example: 'Remote work has become more prevalent since the pandemic.' },
      { term: 'pandemic', definitionVi: 'Ä‘áº¡i dá»‹ch', example: 'The pandemic accelerated the shift to remote work globally.' },
      { term: 'collaboration', definitionVi: 'sá»± há»£p tĂ¡c', example: 'In-person collaboration is difficult to replicate online.' },
      { term: 'dominant', definitionVi: 'chiáº¿m Æ°u tháº¿, chá»§ Ä‘áº¡o', example: 'Remote work is unlikely to become the dominant working style.' },
      { term: 'flexibility', definitionVi: 'tĂ­nh linh hoáº¡t', example: 'Remote work offers greater flexibility to employees.' },
      { term: 'isolation', definitionVi: 'sá»± cĂ´ láº­p', example: 'Prolonged remote work can lead to professional isolation.' },
      { term: 'in-person', definitionVi: 'trá»±c tiáº¿p (gáº·p máº·t)', example: 'In-person meetings remain essential for complex negotiations.' },
      { term: 'office-based work', definitionVi: 'lĂ m viá»‡c táº¡i vÄƒn phĂ²ng', example: 'Office-based work remains necessary for many industries.' },
      { term: 'productivity', definitionVi: 'nÄƒng suáº¥t lĂ m viá»‡c', example: 'The impact of remote work on productivity varies by industry.' },
      { term: 'blurred boundaries', definitionVi: 'ranh giá»›i má» nháº¡t', example: 'Remote work creates blurred boundaries between work and personal life.' }
    ],
    questions: [
      {
        questionId: 'w5t9_q01', level: 'beginner', orderIndex: 1,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"LĂ m viá»‡c tá»« xa Ä‘Ă£ trá»Ÿ nĂªn phá»• biáº¿n hÆ¡n ká»ƒ tá»« sau Ä‘áº¡i dá»‹ch."',
        correctAnswer: 'Remote work has become more prevalent since the pandemic.',
        modelAnswer: 'Remote work has become more prevalent since the pandemic.',
        fallbackKeywords: ['remote work', 'prevalent', 'pandemic'],
        explanationVi: "'Prevalent' = phá»• biáº¿n, lan rá»™ng (academic hÆ¡n 'popular' hoáº·c 'common'). 'Since + N' dĂ¹ng vá»›i Present Perfect Ä‘á»ƒ diá»…n Ä‘áº¡t thay Ä‘á»•i tá»« má»™t Ä‘iá»ƒm trong quĂ¡ khá»© Ä‘áº¿n nay."
      },
      {
        questionId: 'w5t9_q02', level: 'beginner', orderIndex: 2,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"NhĂ¢n viĂªn cĂ³ thá»ƒ tiáº¿t kiá»‡m thá»i gian Ä‘i láº¡i báº±ng cĂ¡ch lĂ m viá»‡c táº¡i nhĂ  má»—i ngĂ y."',
        correctAnswer: 'Employees can save commuting time by working from home every day.',
        modelAnswer: 'Employees can save commuting time by working from home every day.',
        fallbackKeywords: ['employees', 'commuting time', 'working from home'],
        explanationVi: "'Save + N + by + V-ing' = tiáº¿t kiá»‡m gĂ¬ báº±ng cĂ¡ch lĂ m gĂ¬. 'Commuting time' = thá»i gian Ä‘i láº¡i (danh tá»« ghĂ©p). ÄĂ¢y lĂ  má»™t lá»£i Ă­ch cá»¥ thá»ƒ cá»§a remote work."
      },
      {
        questionId: 'w5t9_q03', level: 'elementary', orderIndex: 3,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Nhiá»u cĂ´ng ty Ä‘Ă£ chuyá»ƒn sang mĂ´ hĂ¬nh lĂ m viá»‡c káº¿t há»£p, káº¿t há»£p cáº£ lĂ m á»Ÿ nhĂ  vĂ  táº¡i vÄƒn phĂ²ng."',
        correctAnswer: 'Many companies have shifted to a hybrid work model combining home-based and office work.',
        modelAnswer: 'Many companies have shifted to a hybrid work model combining home-based and office work.',
        fallbackKeywords: ['hybrid work model', 'companies', 'home-based', 'office'],
        explanationVi: "'Shift to + N' = chuyá»ƒn sang. 'Hybrid work model' = mĂ´ hĂ¬nh lĂ m viá»‡c káº¿t há»£p. 'Combining...' lĂ  participle phrase bá»• nghÄ©a. Present Perfect nháº¥n máº¡nh sá»± thay Ä‘á»•i Ä‘Ă£ xáº£y ra."
      },
      {
        questionId: 'w5t9_q04', level: 'elementary', orderIndex: 4,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"LĂ m viá»‡c táº¡i nhĂ  cĂ³ thá»ƒ áº£nh hÆ°á»Ÿng tiĂªu cá»±c Ä‘áº¿n vÄƒn hĂ³a doanh nghiá»‡p."',
        correctAnswer: 'Working from home may have a negative impact on company culture.',
        modelAnswer: 'Working from home may have a negative impact on company culture.',
        fallbackKeywords: ['company culture', 'negative impact', 'working from home'],
        explanationVi: "'Have a negative impact on + N' = áº£nh hÆ°á»Ÿng tiĂªu cá»±c Ä‘áº¿n. 'Company culture' = vÄƒn hĂ³a doanh nghiá»‡p. ÄĂ¢y lĂ  má»™t trong nhá»¯ng nhÆ°á»£c Ä‘iá»ƒm chĂ­nh cá»§a remote work."
      },
      {
        questionId: 'w5t9_q05', level: 'elementary', orderIndex: 5,
        type: 'rearrange',
        questionText: 'Sáº¯p xáº¿p cĂ¡c tá»«/cá»¥m tá»« sau thĂ nh cĂ¢u hoĂ n chá»‰nh:\n[remote work / I / will / believe / the dominant / become / working style of the future]',
        correctAnswer: 'I believe remote work will become the dominant working style of the future.',
        modelAnswer: 'I believe remote work will become the dominant working style of the future.',
        fallbackKeywords: ['remote work', 'dominant', 'working style', 'future'],
        explanationVi: "Cáº¥u trĂºc: 'I believe + (that) + S + will + V'. 'Dominant' = chiáº¿m Æ°u tháº¿. 'Working style of the future' = phong cĂ¡ch lĂ m viá»‡c cá»§a tÆ°Æ¡ng lai."
      },
      {
        questionId: 'w5t9_q06', level: 'intermediate', orderIndex: 6,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Má»™t sá»‘ ngÆ°á»i cho ráº±ng lĂ m viá»‡c tá»« xa thiáº¿u tĂ­nh bá»n vá»¯ng lĂ¢u dĂ i."',
        correctAnswer: 'Some people argue that remote work lacks long-term sustainability.',
        modelAnswer: 'Some people argue that remote work lacks long-term sustainability.',
        fallbackKeywords: ['remote work', 'long-term sustainability', 'argue'],
        explanationVi: "'Lack + N' = thiáº¿u, khĂ´ng cĂ³ (verb, khĂ´ng cáº§n 'lacks of'). 'Long-term sustainability' = tĂ­nh bá»n vá»¯ng lĂ¢u dĂ i. 'Some people argue that' = cĂ¡ch trĂ¬nh bĂ y quan Ä‘iá»ƒm pháº£n bĂ¡c."
      },
      {
        questionId: 'w5t9_q07', level: 'intermediate', orderIndex: 7,
        type: 'short_writing',
        questionText: 'Viáº¿t 1 Ä‘oáº¡n body paragraph (~80-100 tá»«) PHáº¢N Äá»I Ă½ kiáº¿n cho ráº±ng lĂ m viá»‡c tá»« xa sáº½ lĂ  cĂ¡ch lĂ m viá»‡c chĂ­nh trong tÆ°Æ¡ng lai.\n\nGá»£i Ă½: company culture / collaboration / isolation / office-based work',
        modelAnswer: 'Despite the growing popularity of remote work, I disagree that it will become the dominant working arrangement in the future. Many industries, including manufacturing, healthcare, and hospitality, require physical presence and therefore cannot transition fully to remote models. Furthermore, even in knowledge-based sectors, in-person collaboration remains crucial for innovation, team cohesion, and maintaining a strong company culture. Prolonged remote work has also been linked to professional isolation and blurred work-life boundaries, which ultimately diminish employee well-being and retention. A hybrid approach is far more sustainable than complete remote working.',
        fallbackKeywords: ['company culture', 'collaboration', 'isolation', 'office', 'hybrid', 'dominant'],
        explanationVi: "Äoáº¡n Disagree cáº§n nĂªu láº­p trÆ°á»ng rĂµ ngay Ä‘áº§u, sau Ä‘Ă³ Ä‘Æ°a ra 2-3 lĂ½ do pháº£n Ä‘á»‘i vá»›i giáº£i thĂ­ch cá»¥ thá»ƒ. Káº¿t báº±ng alternative solution (hybrid model) thuyáº¿t phá»¥c hÆ¡n."
      },
      {
        questionId: 'w5t9_q08', level: 'intermediate', orderIndex: 8,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "remote work"):\n\n"LĂ m viá»‡c tá»« xa Ä‘Ă£ trá»Ÿ nĂªn phá»• biáº¿n hÆ¡n sau Ä‘áº¡i dá»‹ch."',
        correctAnswer: 'Remote work has become far more widespread since the pandemic.',
        modelAnswer: 'Remote work has become far more widespread since the pandemic.',
        fallbackKeywords: ['remote work', 'widespread', 'pandemic'],
        explanationVi: "'Far more widespread' = phá»• biáº¿n hÆ¡n nhiá»u â€” 'far' tÄƒng cÆ°á»ng so sĂ¡nh hÆ¡n. 'Since the pandemic' = ká»ƒ tá»« Ä‘áº¡i dá»‹ch â€” Present Perfect Ä‘i vá»›i 'since'."
      },
      {
        questionId: 'w5t9_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "workâ€“life balance"):\n\n"Nhiá»u ngÆ°á»i thĂ­ch lĂ m viá»‡c táº¡i nhĂ  vĂ¬ há» cĂ³ thá»ƒ cĂ¢n báº±ng giá»¯a cĂ´ng viá»‡c vĂ  cuá»™c sá»‘ng tá»‘t hÆ¡n."',
        correctAnswer: 'Many people prefer working from home because it enables a better workâ€“life balance.',
        modelAnswer: 'Many people prefer working from home because it enables a better workâ€“life balance.',
        fallbackKeywords: ['work-life balance', 'working from home', 'better', 'enables'],
        explanationVi: "'Prefer + V-ing' = thĂ­ch lĂ m gĂ¬ hÆ¡n (khi khĂ´ng so sĂ¡nh trá»±c tiáº¿p). 'Enable' = cho phĂ©p, táº¡o Ä‘iá»u kiá»‡n cho â€” academic hÆ¡n 'allow' hay 'let'."
      },
      {
        questionId: 'w5t9_q10', level: 'intermediate', orderIndex: 10,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "digital communication tools"):\n\n"CĂ¡c cĂ´ng cá»¥ giao tiáº¿p ká»¹ thuáº­t sá»‘ giĂºp káº¿t ná»‘i nhĂ¢n viĂªn dĂ¹ há» á»Ÿ xa nhau."',
        correctAnswer: 'Digital communication tools help connect employees regardless of their physical location.',
        modelAnswer: 'Digital communication tools help connect employees regardless of their physical location.',
        fallbackKeywords: ['digital communication tools', 'connect', 'employees', 'location'],
        explanationVi: "'Regardless of' = báº¥t ká»ƒ, khĂ´ng phá»¥ thuá»™c vĂ o â€” formal phrase thay cho 'no matter'. 'Physical location' = vá»‹ trĂ­ Ä‘á»‹a lĂ½ thá»±c táº¿."
      },
      {
        questionId: 'w5t9_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "social isolation"):\n\n"Má»™t sá»‘ ngÆ°á»i cáº£m tháº¥y cĂ´ láº­p vĂ  Ă­t tÆ°Æ¡ng tĂ¡c xĂ£ há»™i khi lĂ m viá»‡c á»Ÿ nhĂ ."',
        correctAnswer: 'Some people feel a sense of social isolation and have fewer social interactions when working from home.',
        modelAnswer: 'Some people feel a sense of social isolation and have fewer social interactions when working from home.',
        fallbackKeywords: ['social isolation', 'working from home', 'interactions', 'fewer'],
        explanationVi: "'A sense of social isolation' = cáº£m giĂ¡c cĂ´ láº­p xĂ£ há»™i â€” 'a sense of' nháº¥n máº¡nh cáº£m nháº­n chá»§ quan. 'Fewer social interactions' = so sĂ¡nh hÆ¡n vá»›i danh tá»« Ä‘áº¿m Ä‘Æ°á»£c."
      },
      {
        questionId: 'w5t9_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "hybrid model"):\n\n"Nhiá»u cĂ´ng ty chuyá»ƒn sang mĂ´ hĂ¬nh lĂ m viá»‡c káº¿t há»£p giá»¯a á»Ÿ nhĂ  vĂ  táº¡i vÄƒn phĂ²ng."',
        correctAnswer: 'Many companies are shifting to a hybrid model that combines working from home and in the office.',
        modelAnswer: 'Many companies are shifting to a hybrid model that combines working from home and in the office.',
        fallbackKeywords: ['hybrid model', 'home', 'office', 'combining', 'shifting'],
        explanationVi: "'Shift to' = chuyá»ƒn sang (phrasal verb há»c thuáº­t). 'A hybrid model that combines A and B' = mĂ´ hĂ¬nh káº¿t há»£p â€” má»‡nh Ä‘á» quan há»‡ bá»• nghÄ©a."
      },
      {
        questionId: 'w5t9_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "technological advancement"):\n\n"CĂ´ng nghá»‡ hiá»‡n Ä‘áº¡i cho phĂ©p cĂ¡c nhĂ³m lĂ m viá»‡c hiá»‡u quáº£ dĂ¹ á»Ÿ xa nhau."',
        correctAnswer: 'Modern technological advancement allows teams to work efficiently even at a distance.',
        modelAnswer: 'Modern technological advancement allows teams to work efficiently even at a distance.',
        fallbackKeywords: ['technological advancement', 'teams', 'efficiently', 'distance'],
        explanationVi: "'At a distance' = tá»« xa, á»Ÿ khoáº£ng cĂ¡ch xa. 'Even at a distance' = ngay cáº£ khi á»Ÿ xa â€” 'even' nháº¥n máº¡nh tĂ­nh báº¥t thÆ°á»ng hoáº·c ngáº¡c nhiĂªn."
      },
      {
        questionId: 'w5t9_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "internet connectivity"):\n\n"Káº¿t ná»‘i Internet yáº¿u cĂ³ thá»ƒ áº£nh hÆ°á»Ÿng Ä‘áº¿n hiá»‡u suáº¥t lĂ m viá»‡c."',
        correctAnswer: 'Poor internet connectivity can negatively affect work performance and productivity.',
        modelAnswer: 'Poor internet connectivity can negatively affect work performance and productivity.',
        fallbackKeywords: ['internet connectivity', 'poor', 'work performance', 'productivity'],
        explanationVi: "'Poor internet connectivity' = káº¿t ná»‘i internet kĂ©m. 'Negatively affect' = áº£nh hÆ°á»Ÿng tiĂªu cá»±c. 'Work performance and productivity' = hai danh tá»« bá»• nghÄ©a láº«n nhau."
      },
      {
        questionId: 'w5t9_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "time management"):\n\n"Má»™t sá»‘ ngÆ°á»i gáº·p khĂ³ khÄƒn trong viá»‡c quáº£n lĂ½ thá»i gian khi lĂ m viá»‡c táº¡i nhĂ ."',
        correctAnswer: 'Some people struggle with time management when working from home.',
        modelAnswer: 'Some people struggle with time management when working from home.',
        fallbackKeywords: ['time management', 'struggle', 'working from home'],
        explanationVi: "'Struggle with + N/V-ing' = gáº·p khĂ³ khÄƒn vá»›i. 'When working from home' = rĂºt gá»n tá»« 'when they are working from home'."
      },
      {
        questionId: 'w5t9_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "communication barrier"):\n\n"Thiáº¿u giao tiáº¿p trá»±c tiáº¿p cĂ³ thá»ƒ gĂ¢y ra rĂ o cáº£n trong há»£p tĂ¡c nhĂ³m."',
        correctAnswer: 'A lack of direct interaction can create a communication barrier in team collaboration.',
        modelAnswer: 'A lack of direct interaction can create a communication barrier in team collaboration.',
        fallbackKeywords: ['communication barrier', 'direct interaction', 'team collaboration'],
        explanationVi: "'Communication barrier' = rĂ o cáº£n giao tiáº¿p. 'Create a barrier' = táº¡o ra rĂ o cáº£n â€” 'create' há»c thuáº­t hÆ¡n 'cause'. 'Team collaboration' = há»£p tĂ¡c nhĂ³m."
      },
      {
        questionId: 'w5t9_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "corporate culture"):\n\n"LĂ m viá»‡c táº¡i nhĂ  cĂ³ thá»ƒ áº£nh hÆ°á»Ÿng Ä‘áº¿n vÄƒn hĂ³a doanh nghiá»‡p."',
        correctAnswer: 'Working from home can have a significant impact on corporate culture.',
        modelAnswer: 'Working from home can have a significant impact on corporate culture.',
        fallbackKeywords: ['corporate culture', 'working from home', 'significant impact'],
        explanationVi: "'Corporate culture' = vÄƒn hĂ³a doanh nghiá»‡p/cĂ´ng ty. 'Have a significant impact on' = cĂ³ tĂ¡c Ä‘á»™ng Ä‘Ă¡ng ká»ƒ lĂªn â€” 'have an impact' lĂ  collocation cá»‘ Ä‘á»‹nh."
      }
    ]
  },
  {
    week: 6, block: 'agree_disagree', orderIndex: 10,
    topicName: 'Job Satisfaction vs. Salary', topicEmoji: 'đŸ“ˆ',
    essayType: 'agree_disagree',
    prompt: 'Job satisfaction is more important than a high salary. Do you agree or disagree?',
    hintAdvantages: ['long-term happiness', 'reduces stress', 'better performance'],
    hintDisadvantages: ['financial security needed', 'salary covers basic needs'],
    vocabularyList: [
      { term: 'job satisfaction', definitionVi: 'sá»± hĂ i lĂ²ng vá»›i cĂ´ng viá»‡c', example: 'Job satisfaction leads to higher employee retention rates.' },
      { term: 'financial security', definitionVi: 'an toĂ n tĂ i chĂ­nh', example: 'A good salary provides financial security for the family.' },
      { term: 'intrinsic motivation', definitionVi: 'Ä‘á»™ng lá»±c ná»™i táº¡i', example: 'Intrinsic motivation drives employees to perform at their best.' },
      { term: 'job burnout', definitionVi: 'kiá»‡t sá»©c vĂ¬ cĂ´ng viá»‡c', example: 'Many people experience job burnout when doing work they dislike.' },
      { term: 'sense of fulfillment', definitionVi: 'cáº£m giĂ¡c mĂ£n nguyá»‡n', example: 'A sense of fulfillment motivates people every single day.' },
      { term: 'long-term happiness', definitionVi: 'háº¡nh phĂºc lĂ¢u dĂ i', example: 'Pursuing job satisfaction ultimately leads to greater long-term happiness.' },
      { term: 'performance', definitionVi: 'hiá»‡u suáº¥t, káº¿t quáº£ lĂ m viá»‡c', example: 'People who love their jobs often achieve higher performance.' },
      { term: 'work motivation', definitionVi: 'Ä‘á»™ng lá»±c lĂ m viá»‡c', example: 'Work motivation is closely linked to job satisfaction.' },
      { term: 'employee retention', definitionVi: 'giá»¯ chĂ¢n nhĂ¢n viĂªn', example: 'High job satisfaction improves employee retention rates.' },
      { term: 'pursue', definitionVi: 'theo Ä‘uá»•i', example: 'Many young people pursue careers that offer personal meaning over high pay.' },
      { term: 'well-being', definitionVi: 'sá»©c khá»e vĂ  háº¡nh phĂºc', example: 'Job satisfaction is a key factor in overall personal well-being.' },
      { term: 'dislike', definitionVi: 'khĂ´ng thĂ­ch', example: 'Working in a role you dislike can lead to chronic stress.' },
      { term: 'ultimately', definitionVi: 'cuá»‘i cĂ¹ng, rá»‘t cuá»™c', example: 'Financial success without job satisfaction ultimately feels hollow.' },
      { term: 'survive', definitionVi: 'tá»“n táº¡i, sá»‘ng sĂ³t', example: 'Without adequate income, people cannot survive comfortably.' },
      { term: 'passion', definitionVi: 'Ä‘am mĂª', example: 'Following one\'s passion often leads to greater professional success.' }
    ],
    questions: [
      {
        questionId: 'w6t10_q01', level: 'beginner', orderIndex: 1,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Má»©c lÆ°Æ¡ng cao giĂºp mang láº¡i sá»± an toĂ n tĂ i chĂ­nh cho ngÆ°á»i lao Ä‘á»™ng."',
        correctAnswer: 'A high salary helps provide financial security for workers.',
        modelAnswer: 'A high salary helps provide financial security for workers.',
        fallbackKeywords: ['high salary', 'financial security', 'workers'],
        explanationVi: "'Help + V (bare)' = giĂºp lĂ m gĂ¬. 'Provide financial security' = mang láº¡i sá»± an toĂ n tĂ i chĂ­nh. ÄĂ¢y lĂ  láº­p luáº­n pháº£n Ä‘á»‘i (disagree) â€” lÆ°Æ¡ng cao Ä‘Ă¡p á»©ng nhu cáº§u cÆ¡ báº£n."
      },
      {
        questionId: 'w6t10_q02', level: 'beginner', orderIndex: 2,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Cáº£m giĂ¡c mĂ£n nguyá»‡n trong cĂ´ng viá»‡c táº¡o Ä‘á»™ng lá»±c cho con ngÆ°á»i má»—i ngĂ y."',
        correctAnswer: 'A sense of fulfillment in work motivates people every single day.',
        modelAnswer: 'A sense of fulfillment in work motivates people every single day.',
        fallbackKeywords: ['sense of fulfillment', 'motivates', 'people', 'work'],
        explanationVi: "'A sense of fulfillment' = cáº£m giĂ¡c mĂ£n nguyá»‡n (noun phrase). 'Every single day' = má»—i ngĂ y (nháº¥n máº¡nh hÆ¡n 'every day'). ÄĂ¢y lĂ  láº­p luáº­n á»§ng há»™ job satisfaction."
      },
      {
        questionId: 'w6t10_q03', level: 'elementary', orderIndex: 3,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Nhá»¯ng ngÆ°á»i yĂªu thĂ­ch cĂ´ng viá»‡c cá»§a mĂ¬nh thÆ°á»ng Ä‘áº¡t hiá»‡u suáº¥t cao hÆ¡n nhá» Ä‘á»™ng lá»±c ná»™i táº¡i máº¡nh máº½."',
        correctAnswer: 'People who love their jobs often achieve higher performance due to strong intrinsic motivation.',
        modelAnswer: 'People who love their jobs often achieve higher performance due to strong intrinsic motivation.',
        fallbackKeywords: ['intrinsic motivation', 'performance', 'love', 'jobs'],
        explanationVi: "'Due to + N' = do, vĂ¬ (chá»‰ nguyĂªn nhĂ¢n â€” formal). 'Achieve higher performance' = Ä‘áº¡t hiá»‡u suáº¥t cao hÆ¡n. Relative clause 'who love their jobs' xĂ¡c Ä‘á»‹nh nhĂ³m ngÆ°á»i cá»¥ thá»ƒ."
      },
      {
        questionId: 'w6t10_q04', level: 'elementary', orderIndex: 4,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Nhiá»u ngÆ°á»i cáº£m tháº¥y kiá»‡t sá»©c khi lĂ m cĂ´ng viá»‡c há» khĂ´ng thĂ­ch, dĂ¹ lÆ°Æ¡ng cĂ³ cao."',
        correctAnswer: 'Many people experience job burnout when doing work they dislike, even if the salary is high.',
        modelAnswer: 'Many people experience job burnout when doing work they dislike, even if the salary is high.',
        fallbackKeywords: ['job burnout', 'dislike', 'salary', 'high'],
        explanationVi: "'Experience job burnout' = tráº£i qua kiá»‡t sá»©c vĂ¬ cĂ´ng viá»‡c. 'Even if' = dĂ¹ cho, ngay cáº£ khi. 'Work they dislike' = relative clause khĂ´ng cáº§n 'which/that' (object relative clause)."
      },
      {
        questionId: 'w6t10_q05', level: 'elementary', orderIndex: 5,
        type: 'error_correction',
        questionText: 'CĂ¢u sau cĂ³ lá»—i. HĂ£y sá»­a láº¡i:\n\n"I disagree that job satisfaction is more important than salary, because without money, peoples cannot survive."',
        correctAnswer: 'I disagree that job satisfaction is more important than salary, because without money, people cannot survive.',
        modelAnswer: 'I disagree that job satisfaction is more important than salary, because without money, people cannot survive.',
        fallbackKeywords: ['job satisfaction', 'salary', 'people', 'survive'],
        explanationVi: "Lá»—i: 'peoples' khĂ´ng tá»“n táº¡i. 'People' Ä‘Ă£ lĂ  sá»‘ nhiá»u (uncountable collective noun). KhĂ´ng thĂªm 's' vĂ o 'people'."
      },
      {
        questionId: 'w6t10_q06', level: 'intermediate', orderIndex: 6,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"DĂ¹ Ä‘á»“ng Ă½ hay khĂ´ng, viá»‡c theo Ä‘uá»•i sá»± hĂ i lĂ²ng trong cĂ´ng viá»‡c cuá»‘i cĂ¹ng dáº«n Ä‘áº¿n háº¡nh phĂºc lĂ¢u dĂ i hÆ¡n."',
        correctAnswer: 'Regardless of one\'s view, pursuing job satisfaction ultimately leads to greater long-term happiness.',
        modelAnswer: 'Regardless of one\'s view, pursuing job satisfaction ultimately leads to greater long-term happiness.',
        fallbackKeywords: ['job satisfaction', 'long-term happiness', 'pursuing', 'ultimately'],
        explanationVi: "'Regardless of one\'s view' = báº¥t ká»ƒ quan Ä‘iá»ƒm cá»§a ai (formal phrase). 'Pursuing + N' (gerund lĂ m chá»§ ngá»¯). 'Ultimately' = cuá»‘i cĂ¹ng, rá»‘t cuá»™c â€” adverb há»c thuáº­t quan trá»ng."
      },
      {
        questionId: 'w6t10_q07', level: 'intermediate', orderIndex: 7,
        type: 'short_writing',
        questionText: 'Viáº¿t 1 Ä‘oáº¡n body paragraph (~80-100 tá»«) Äá»’NG Ă ráº±ng sá»± hĂ i lĂ²ng trong cĂ´ng viá»‡c quan trá»ng hÆ¡n má»©c lÆ°Æ¡ng cao.\n\nGá»£i Ă½: intrinsic motivation / job burnout / performance / long-term happiness',
        modelAnswer: 'I firmly agree that job satisfaction is more important than a high salary in the long run. When individuals are genuinely passionate about their work, they are driven by intrinsic motivation, which consistently produces higher levels of performance and creativity than financial incentives alone. In contrast, employees who pursue high salaries in roles they find unfulfilling are significantly more susceptible to job burnout, leading to disengagement, absenteeism, and ultimately career breakdown. Research indicates that long-term happiness is more strongly correlated with a sense of purpose at work than with financial compensation, making job satisfaction the more valuable priority.',
        fallbackKeywords: ['job satisfaction', 'intrinsic motivation', 'burnout', 'performance', 'long-term happiness', 'purpose'],
        explanationVi: "BĂ i Agree cáº§n: thesis rĂµ â†’ lĂ½ do á»§ng há»™ cĂ³ giáº£i thĂ­ch â†’ contrast vá»›i láº­p trÆ°á»ng Ä‘á»‘i láº­p â†’ káº¿t báº±ng dáº«n chá»©ng. TrĂ¡nh Ä‘á» cáº­p lÆ°Æ¡ng quan trá»ng hÆ¡n vĂ¬ sáº½ mĂ¢u thuáº«n láº­p trÆ°á»ng."
      },
      {
        questionId: 'w6t10_q08', level: 'intermediate', orderIndex: 8,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "job satisfaction"):\n\n"Nhiá»u ngÆ°á»i tin ráº±ng sá»± hĂ i lĂ²ng trong cĂ´ng viá»‡c quan trá»ng hÆ¡n má»©c lÆ°Æ¡ng cao."',
        correctAnswer: 'Many people believe that job satisfaction is more important than a high salary.',
        modelAnswer: 'Many people believe that job satisfaction is more important than a high salary.',
        fallbackKeywords: ['job satisfaction', 'important', 'high salary'],
        explanationVi: "'Job satisfaction' = sá»± hĂ i lĂ²ng trong cĂ´ng viá»‡c. So sĂ¡nh hÆ¡n 'more important than' â€” khĂ´ng nháº§m vá»›i 'more important as'. 'Believe that' = tin ráº±ng (formal)."
      },
      {
        questionId: 'w6t10_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "financial security"):\n\n"Má»©c lÆ°Æ¡ng cao giĂºp mang láº¡i sá»± an toĂ n tĂ i chĂ­nh cho ngÆ°á»i lao Ä‘á»™ng."',
        correctAnswer: 'A high salary helps provide financial security for workers.',
        modelAnswer: 'A high salary helps provide financial security for workers.',
        fallbackKeywords: ['financial security', 'high salary', 'workers', 'provide'],
        explanationVi: "'Financial security' = sá»± an toĂ n/báº£o Ä‘áº£m tĂ i chĂ­nh. 'Provide + N + for + N' = cung cáº¥p cĂ¡i gĂ¬ cho ai. 'Help + V (bare infinitive)' = giĂºp lĂ m gĂ¬."
      },
      {
        questionId: 'w6t10_q10', level: 'intermediate', orderIndex: 10,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "working environment"):\n\n"Má»™t mĂ´i trÆ°á»ng lĂ m viá»‡c tĂ­ch cá»±c giĂºp nhĂ¢n viĂªn cáº£m tháº¥y háº¡nh phĂºc hÆ¡n."',
        correctAnswer: 'A positive working environment makes employees feel happier and more motivated.',
        modelAnswer: 'A positive working environment makes employees feel happier and more motivated.',
        fallbackKeywords: ['working environment', 'positive', 'employees', 'happier', 'motivated'],
        explanationVi: "'Make + O + feel + adj' = khiáº¿n ai cáº£m tháº¥y tháº¿ nĂ o. 'Happier and more motivated' = hai so sĂ¡nh hÆ¡n song song cho hai loáº¡i tĂ­nh tá»« khĂ¡c nhau."
      },
      {
        questionId: 'w6t10_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "meaningful work"):\n\n"Nhiá»u ngÆ°á»i sáºµn sĂ ng nháº­n lÆ°Æ¡ng tháº¥p hÆ¡n náº¿u há» yĂªu thĂ­ch cĂ´ng viá»‡c cá»§a mĂ¬nh."',
        correctAnswer: 'Many people are willing to accept a lower salary if they find their work meaningful.',
        modelAnswer: 'Many people are willing to accept a lower salary if they find their work meaningful.',
        fallbackKeywords: ['meaningful work', 'lower salary', 'willing', 'find'],
        explanationVi: "'Be willing to + V' = sáºµn sĂ ng lĂ m gĂ¬. 'Find + O + adj' = tháº¥y cĂ¡i gĂ¬ nhÆ° tháº¿ nĂ o. 'Meaningful' = cĂ³ Ă½ nghÄ©a â€” 'find their work meaningful' tá»± nhiĂªn hÆ¡n 'find their work is meaningful'."
      },
      {
        questionId: 'w6t10_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "work fulfillment"):\n\n"Cáº£m giĂ¡c mĂ£n nguyá»‡n khi lĂ m viá»‡c khiáº¿n con ngÆ°á»i cĂ³ Ä‘á»™ng lá»±c hÆ¡n má»—i ngĂ y."',
        correctAnswer: 'A sense of work fulfillment motivates people to perform better every day.',
        modelAnswer: 'A sense of work fulfillment motivates people to perform better every day.',
        fallbackKeywords: ['work fulfillment', 'motivates', 'perform better', 'every day'],
        explanationVi: "'A sense of work fulfillment' = cáº£m giĂ¡c mĂ£n nguyá»‡n trong cĂ´ng viá»‡c. 'Motivate + O + to V' = thĂºc Ä‘áº©y ai lĂ m gĂ¬. 'Perform better' = lĂ m viá»‡c tá»‘t hÆ¡n."
      },
      {
        questionId: 'w6t10_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "career development"):\n\n"Sá»± phĂ¡t triá»ƒn nghá» nghiá»‡p giĂºp nhĂ¢n viĂªn cáº£m tháº¥y há» Ä‘ang tiáº¿n bá»™."',
        correctAnswer: 'Career development gives employees a sense that they are making progress.',
        modelAnswer: 'Career development gives employees a sense that they are making progress.',
        fallbackKeywords: ['career development', 'employees', 'progress', 'sense'],
        explanationVi: "'Career development' = sá»± phĂ¡t triá»ƒn nghá» nghiá»‡p. 'A sense that + clause' = cáº£m giĂ¡c ráº±ng. 'Make progress' = tiáº¿n bá»™ â€” 'make' lĂ  collocating verb cá»‘ Ä‘á»‹nh."
      },
      {
        questionId: 'w6t10_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "mental well-being"):\n\n"LĂ m viá»‡c quĂ¡ nhiá»u giá» cĂ³ thá»ƒ áº£nh hÆ°á»Ÿng tiĂªu cá»±c Ä‘áº¿n sá»©c khá»e tinh tháº§n."',
        correctAnswer: "Working excessively long hours can negatively affect one's mental well-being.",
        modelAnswer: "Working excessively long hours can negatively affect one's mental well-being.",
        fallbackKeywords: ['mental well-being', 'excessively', 'negatively affect'],
        explanationVi: "'Excessively long hours' = sá»‘ giá» quĂ¡ má»©c. \"One's mental well-being\" dĂ¹ng Ä‘áº¡i tá»« sá»Ÿ há»¯u trung láº­p. 'Negatively affect' = áº£nh hÆ°á»Ÿng tiĂªu cá»±c."
      },
      {
        questionId: 'w6t10_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "employee retention"):\n\n"NÆ¡i lĂ m viá»‡c thĂ¢n thiá»‡n giĂºp tÄƒng kháº£ nÄƒng giá»¯ chĂ¢n nhĂ¢n viĂªn."',
        correctAnswer: 'A friendly workplace helps improve employee retention.',
        modelAnswer: 'A friendly workplace helps improve employee retention.',
        fallbackKeywords: ['employee retention', 'friendly workplace', 'improve'],
        explanationVi: "'Employee retention' = viá»‡c giá»¯ chĂ¢n nhĂ¢n viĂªn (khĂ´ng pháº£i 'keeping employees'). 'A friendly workplace' = mĂ´i trÆ°á»ng lĂ m viá»‡c thĂ¢n thiá»‡n. 'Helps improve' = giĂºp cáº£i thiá»‡n."
      },
      {
        questionId: 'w6t10_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "corporate culture"):\n\n"VÄƒn hĂ³a doanh nghiá»‡p áº£nh hÆ°á»Ÿng lá»›n Ä‘áº¿n má»©c Ä‘á»™ hĂ i lĂ²ng cá»§a nhĂ¢n viĂªn."',
        correctAnswer: 'Corporate culture has a significant impact on employee satisfaction levels.',
        modelAnswer: 'Corporate culture has a significant impact on employee satisfaction levels.',
        fallbackKeywords: ['corporate culture', 'employee satisfaction', 'significant impact'],
        explanationVi: "'Have a significant impact on' = cĂ³ tĂ¡c Ä‘á»™ng Ä‘Ă¡ng ká»ƒ lĂªn â€” collocation cá»‘ Ä‘á»‹nh quan trá»ng. 'Satisfaction levels' = má»©c Ä‘á»™ hĂ i lĂ²ng."
      },
      {
        questionId: 'w6t10_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "sense of purpose"):\n\n"Cáº£m giĂ¡c cĂ³ má»¥c Ä‘Ă­ch trong cĂ´ng viá»‡c khiáº¿n cuá»™c sá»‘ng trá»Ÿ nĂªn Ă½ nghÄ©a hÆ¡n."',
        correctAnswer: "Having a sense of purpose in one's work makes life feel more meaningful.",
        modelAnswer: "Having a sense of purpose in one's work makes life feel more meaningful.",
        fallbackKeywords: ['sense of purpose', 'work', 'meaningful', 'makes life'],
        explanationVi: "'A sense of purpose' = cáº£m giĂ¡c cĂ³ má»¥c Ä‘Ă­ch. 'Make + O + feel + adj' = khiáº¿n thá»© gĂ¬ Ä‘Ă³ cáº£m tháº¥y nhÆ° tháº¿ nĂ o. 'More meaningful' = Ă½ nghÄ©a hÆ¡n."
      }
    ]
  },

  // â”€â”€â”€ BLOCK 4: Week 7-8 â€” Discuss Both Views / Environment â”€â”€â”€
  {
    week: 7, block: 'discuss_both_views', orderIndex: 11,
    topicName: 'Individual vs. Government Responsibility', topicEmoji: 'đŸŒ',
    essayType: 'discuss_both_views',
    prompt: 'Some people believe that individuals cannot do anything to improve the environment, while others think that individual actions can make a difference. Discuss both views and give your own opinion.',
    hintAdvantages: ['environmental problems are too large-scale for individual action', 'only governments can enforce regulations', 'systemic change requires collective policy'],
    hintDisadvantages: ['everyday choices reduce carbon footprint', 'collective individual effort creates meaningful change', 'eco-friendly behaviour raises public awareness'],
    vocabularyList: [
      { term: 'environmental protection', definitionVi: 'báº£o vá»‡ mĂ´i trÆ°á»ng', example: 'Environmental protection is a shared responsibility of individuals and governments.' },
      { term: 'individual responsibility', definitionVi: 'trĂ¡ch nhiá»‡m cĂ¡ nhĂ¢n', example: 'Individual responsibility plays a key role in protecting the environment.' },
      { term: 'collective effort', definitionVi: 'ná»— lá»±c chung', example: 'Collective effort from all sectors is needed to combat climate change.' },
      { term: 'climate change', definitionVi: 'biáº¿n Ä‘á»•i khĂ­ háº­u', example: 'Climate change is one of the greatest threats to our planet.' },
      { term: 'carbon footprint', definitionVi: 'dáº¥u chĂ¢n carbon', example: 'Individuals can reduce their carbon footprint by using public transport.' },
      { term: 'renewable energy', definitionVi: 'nÄƒng lÆ°á»£ng tĂ¡i táº¡o', example: 'Switching to renewable energy is essential to achieve net-zero emissions.' },
      { term: 'sustainable lifestyle', definitionVi: 'lá»‘i sá»‘ng bá»n vá»¯ng', example: 'Adopting a sustainable lifestyle can significantly reduce environmental impact.' },
      { term: 'recycling', definitionVi: 'tĂ¡i cháº¿', example: 'Recycling helps conserve natural resources and reduce landfill waste.' },
      { term: 'plastic pollution', definitionVi: 'Ă´ nhiá»…m nhá»±a', example: 'Plastic pollution is threatening marine ecosystems worldwide.' },
      { term: 'eco-friendly behavior', definitionVi: 'hĂ nh vi thĂ¢n thiá»‡n mĂ´i trÆ°á»ng', example: 'Eco-friendly behavior such as reducing plastic use benefits the planet.' },
      { term: 'government regulation', definitionVi: 'quy Ä‘á»‹nh cá»§a chĂ­nh phá»§', example: 'Strict government regulation is needed to limit industrial pollution.' },
      { term: 'greenhouse gas emissions', definitionVi: 'khĂ­ tháº£i nhĂ  kĂ­nh', example: 'Greenhouse gas emissions from factories contribute significantly to climate change.' },
      { term: 'deforestation', definitionVi: 'náº¡n phĂ¡ rá»«ng', example: 'Deforestation for agriculture is one of the leading causes of habitat loss.' },
      { term: 'environmental degradation', definitionVi: 'suy thoĂ¡i mĂ´i trÆ°á»ng', example: 'Rapid industrialisation has led to severe environmental degradation.' },
      { term: 'make a difference', definitionVi: 'táº¡o ra sá»± khĂ¡c biá»‡t', example: 'Every small action can make a difference in the fight against climate change.' }
    ],
    questions: [
      {
        questionId: 'w7t11_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Äá»c Ä‘á» bĂ i: "Some people believe that individuals cannot do anything to improve the environment, while others think that individual actions can make a difference. Discuss both views and give your own opinion." ÄĂ¢y lĂ  dáº¡ng essay nĂ o?',
        options: ['Advantages & Disadvantages', 'Agree or Disagree', 'Discuss Both Views', 'Cause & Solution'],
        correctAnswer: 'Discuss Both Views',
        explanationVi: 'Keyword "Discuss both views and give your own opinion" xĂ¡c Ä‘á»‹nh dáº¡ng bĂ i. Dáº¡ng nĂ y yĂªu cáº§u trĂ¬nh bĂ y Cáº¢ HAI quan Ä‘iá»ƒm má»™t cĂ¡ch cĂ´ng báº±ng, sau Ä‘Ă³ Ä‘Æ°a ra Ă½ kiáº¿n cĂ¡ nhĂ¢n rĂµ rĂ ng.'
      },
      {
        questionId: 'w7t11_q02', level: 'beginner', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Äiá»n tá»« cĂ²n thiáº¿u:\n\n"Environmental problems such as _____ change and pollution require urgent attention from governments and individuals alike."',
        correctAnswer: 'climate',
        explanationVi: '"Climate change" â€” biáº¿n Ä‘á»•i khĂ­ háº­u â€” lĂ  cá»¥m tá»« cá»‘ Ä‘á»‹nh phá»• biáº¿n nháº¥t trong IELTS chá»§ Ä‘á» mĂ´i trÆ°á»ng.'
      },
      {
        questionId: 'w7t11_q03', level: 'beginner', orderIndex: 3,
        type: 'topic_sentence',
        questionText: 'Chá»n cĂ¢u Thesis Statement phĂ¹ há»£p nháº¥t cho dáº¡ng Discuss Both Views vá» chá»§ Ä‘á» mĂ´i trÆ°á»ng:',
        options: [
          'I strongly believe that only governments can solve environmental problems.',
          'This essay will argue that individual actions are completely useless.',
          'While some argue that environmental issues are beyond individual control, others maintain that personal choices can drive meaningful change.',
          'The government should ban all fossil fuels immediately.'
        ],
        correctAnswer: 'While some argue that environmental issues are beyond individual control, others maintain that personal choices can drive meaningful change.',
        explanationVi: 'Thesis Statement cá»§a Discuss Both Views pháº£i pháº£n Ă¡nh Cáº¢ HAI quan Ä‘iá»ƒm. CĂ¢u C trung láº­p, cĂ¢n báº±ng, dáº«n dáº¯t vĂ o cáº£ hai luáº­n Ä‘iá»ƒm mĂ  chÆ°a thiĂªn vá» bĂªn nĂ o.'
      },
      {
        questionId: 'w7t11_q04', level: 'beginner', orderIndex: 4,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Báº£o vá»‡ mĂ´i trÆ°á»ng lĂ  trĂ¡ch nhiá»‡m cá»§a cáº£ cĂ¡ nhĂ¢n vĂ  chĂ­nh phá»§."',
        correctAnswer: 'Environmental protection is the responsibility of both individuals and the government.',
        modelAnswer: 'Environmental protection is the responsibility of both individuals and the government.',
        fallbackKeywords: ['environmental protection', 'responsibility', 'individuals', 'government'],
        explanationVi: "'The responsibility of both A and B' = trĂ¡ch nhiá»‡m cá»§a cáº£ A láº«n B. 'Environmental protection' lĂ  cá»¥m danh tá»« há»c thuáº­t quan trá»ng."
      },
      {
        questionId: 'w7t11_q05', level: 'beginner', orderIndex: 5,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Má»™t sá»‘ ngÆ°á»i cho ráº±ng hĂ nh Ä‘á»™ng cá»§a má»—i cĂ¡ nhĂ¢n khĂ´ng thá»ƒ táº¡o ra sá»± khĂ¡c biá»‡t lá»›n."',
        correctAnswer: 'Some people argue that the actions of each individual cannot make a significant difference.',
        modelAnswer: 'Some people argue that the actions of each individual cannot make a significant difference.',
        fallbackKeywords: ['argue', 'individual', 'significant difference', 'actions'],
        explanationVi: "'Make a significant difference' = táº¡o ra sá»± khĂ¡c biá»‡t Ä‘Ă¡ng ká»ƒ. 'Some people argue that' = cáº¥u trĂºc chuáº©n khi trĂ¬nh bĂ y quan Ä‘iá»ƒm cá»§a ngÆ°á»i khĂ¡c."
      },
      {
        questionId: 'w7t11_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Lá»‘i sá»‘ng bá»n vá»¯ng cĂ³ thá»ƒ giĂºp giáº£m lÆ°á»£ng khĂ­ tháº£i carbon."',
        correctAnswer: 'A sustainable lifestyle can help reduce one\'s carbon footprint.',
        modelAnswer: 'A sustainable lifestyle can help reduce one\'s carbon footprint.',
        fallbackKeywords: ['sustainable lifestyle', 'carbon footprint', 'reduce'],
        explanationVi: "'Carbon footprint' = dáº¥u chĂ¢n carbon / lÆ°á»£ng khĂ­ tháº£i cĂ¡ nhĂ¢n. 'Help + V' = giĂºp lĂ m gĂ¬. 'One\'s' = cá»§a má»—i ngÆ°á»i."
      },
      {
        questionId: 'w7t11_q07', level: 'elementary', orderIndex: 7,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Náº¿u má»—i ngÆ°á»i cĂ¹ng hĂ nh Ä‘á»™ng, ná»— lá»±c chung sáº½ táº¡o ra sá»± thay Ä‘á»•i lá»›n."',
        correctAnswer: 'If everyone acts together, the collective effort will bring about significant change.',
        modelAnswer: 'If everyone acts together, the collective effort will bring about significant change.',
        fallbackKeywords: ['collective effort', 'significant change', 'together'],
        explanationVi: "'Collective effort' = ná»— lá»±c chung. 'Bring about change' = táº¡o ra sá»± thay Ä‘á»•i. CĂ¢u Ä‘iá»u kiá»‡n loáº¡i 1: If + present simple, will + V."
      },
      {
        questionId: 'w7t11_q08', level: 'elementary', orderIndex: 8,
        type: 'rearrange',
        questionText: 'Sáº¯p xáº¿p cĂ¡c tá»«/cá»¥m tá»« sau thĂ nh cĂ¢u hoĂ n chá»‰nh:\n\n[individual actions / While / can / some / argue / that / make a difference, / others / believe / only / governments / have / the power to address / environmental issues]',
        correctAnswer: 'While some argue that individual actions can make a difference, others believe only governments have the power to address environmental issues.',
        explanationVi: "Cáº¥u trĂºc \"While + clause, + clause\" dĂ¹ng Ä‘á»ƒ Ä‘á»‘i láº­p hai quan Ä‘iá»ƒm â€” Ä‘áº·c trÆ°ng cá»§a Discuss Both Views."
      },
      {
        questionId: 'w7t11_q09', level: 'elementary', orderIndex: 9,
        type: 'error_correction',
        questionText: 'CĂ¢u sau cĂ³ lá»—i gĂ¬? HĂ£y sá»­a láº¡i:\n\n"People should to reduce their energy consumption in order to protect the environment."',
        correctAnswer: 'People should reduce their energy consumption in order to protect the environment.',
        modelAnswer: 'People should reduce their energy consumption in order to protect the environment.',
        fallbackKeywords: ['should reduce', 'energy consumption', 'environment', 'protect'],
        explanationVi: "Lá»—i: Sau \"should\" khĂ´ng dĂ¹ng \"to + V\" mĂ  dĂ¹ng bare infinitive. \"Should reduce\" â€” khĂ´ng pháº£i \"should to reduce\"."
      },
      {
        questionId: 'w7t11_q10', level: 'elementary', orderIndex: 10,
        type: 'topic_sentence',
        questionText: 'Chá»n topic sentence phĂ¹ há»£p nháº¥t cho Ä‘oáº¡n vÄƒn sau:\n\n"___. For instance, by recycling household waste, using public transportation, and reducing plastic consumption, ordinary citizens can collectively lower greenhouse gas emissions. These small habits, when adopted widely, accumulate into a substantial positive impact on the planet."',
        options: [
          'The government must take full responsibility for environmental damage.',
          'The environment is in a very poor state today.',
          'On the other hand, proponents of individual action contend that everyday choices can lead to meaningful environmental improvements.',
          'Many people are unaware of the damage caused by pollution.'
        ],
        correctAnswer: 'On the other hand, proponents of individual action contend that everyday choices can lead to meaningful environmental improvements.',
        explanationVi: 'Topic sentence cáº§n khá»›p vá»›i ná»™i dung Ä‘oáº¡n vÄƒn (tĂ¡i cháº¿, xe cĂ´ng cá»™ng â†’ hĂ nh Ä‘á»™ng cĂ¡ nhĂ¢n). CĂ¢u C giá»›i thiá»‡u quan Ä‘iá»ƒm vá» cĂ¡ nhĂ¢n Ä‘Ăºng ngá»¯ cáº£nh.'
      },
      {
        questionId: 'w7t11_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Sá»± há»£p tĂ¡c toĂ n cáº§u lĂ  yáº¿u tá»‘ then chá»‘t trong viá»‡c giáº£i quyáº¿t biáº¿n Ä‘á»•i khĂ­ háº­u."',
        correctAnswer: 'Global cooperation is a crucial factor in addressing climate change.',
        modelAnswer: 'Global cooperation is a crucial factor in addressing climate change.',
        fallbackKeywords: ['global cooperation', 'crucial', 'climate change', 'addressing'],
        explanationVi: "'Crucial factor in + V-ing' = yáº¿u tá»‘ then chá»‘t trong viá»‡c. 'Address' = giáº£i quyáº¿t (formal hÆ¡n 'solve'). 'Global cooperation' = sá»± há»£p tĂ¡c toĂ n cáº§u."
      },
      {
        questionId: 'w7t11_q12', level: 'intermediate', orderIndex: 12,
        type: 'paraphrase',
        questionText: 'Viáº¿t láº¡i cĂ¢u sau mĂ  khĂ´ng dĂ¹ng cĂ¡c tá»« gá»‘c: individuals, cannot, improve, environment, individual actions, make a difference:\n\n"Some people believe that individuals cannot do anything to improve the environment, while others think that individual actions can make a difference."',
        correctAnswer: 'There is ongoing debate as to whether ordinary citizens are powerless to bring about environmental change, or whether personal choices and daily habits hold the potential to contribute meaningfully to ecological preservation.',
        modelAnswer: 'There is ongoing debate as to whether ordinary citizens are powerless to bring about environmental change, or whether personal choices and daily habits hold the potential to contribute meaningfully to ecological preservation.',
        fallbackKeywords: ['ordinary citizens', 'environmental change', 'personal choices', 'ecological', 'powerless'],
        explanationVi: "Paraphrase tá»‘t thay 'individuals' â†’ 'ordinary citizens', 'make a difference' â†’ 'contribute meaningfully', 'environment' â†’ 'ecological preservation'. KhĂ´ng giá»¯ nguyĂªn quĂ¡ nhiá»u tá»« gá»‘c."
      },
      {
        questionId: 'w7t11_q13', level: 'intermediate', orderIndex: 13,
        type: 'short_writing',
        questionText: 'Viáº¿t 1 Ä‘oáº¡n body paragraph (~80â€“100 tá»«) trĂ¬nh bĂ y quan Ä‘iá»ƒm ráº±ng chĂ­nh phá»§ â€” khĂ´ng pháº£i cĂ¡ nhĂ¢n â€” pháº£i chá»‹u trĂ¡ch nhiá»‡m chĂ­nh vá» mĂ´i trÆ°á»ng.\n\nCáº¥u trĂºc: Topic Sentence â†’ Explanation â†’ Example\nGá»£i Ă½: government regulation / fossil fuels / greenhouse gas emissions / environmental degradation',
        modelAnswer: 'Those who argue that governments bear the primary responsibility for environmental protection point out that large-scale ecological problems such as greenhouse gas emissions and deforestation cannot be meaningfully addressed by individual action alone. Only governments possess the legislative authority to enforce environmental regulations, restrict the use of fossil fuels, and hold corporations accountable for pollution. For example, countries that have introduced strict carbon tax policies have seen measurable reductions in industrial emissions, demonstrating that systemic government intervention is far more impactful than the combined efforts of individual citizens.',
        fallbackKeywords: ['government', 'environmental', 'regulations', 'fossil fuels', 'emissions', 'corporations', 'policy'],
        explanationVi: "Cáº¥u trĂºc PEEL: Point (topic sentence View 1) â†’ Explain â†’ Evidence â†’ Link. DĂ¹ng 'On the one hand' Ä‘á»ƒ má»Ÿ Ä‘áº§u View 1 trong Discuss Both Views."
      },
      // â”€â”€ QT-4 Intermediate (W7T1) â”€â”€
      {
        questionId: 'w7t11_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "environmental protection"):\n\n"Báº£o vá»‡ mĂ´i trÆ°á»ng lĂ  trĂ¡ch nhiá»‡m cá»§a cáº£ cĂ¡ nhĂ¢n vĂ  chĂ­nh phá»§."',
        correctAnswer: 'Environmental protection is the responsibility of both individuals and the government.',
        modelAnswer: 'Environmental protection is the responsibility of both individuals and the government.',
        fallbackKeywords: ['environmental protection', 'responsibility', 'individuals', 'government'],
        explanationVi: "'The responsibility of both A and B' = trĂ¡ch nhiá»‡m cá»§a cáº£ A láº«n B. 'Environmental protection' dĂ¹ng lĂ m chá»§ ngá»¯ khĂ´ng cáº§n máº¡o tá»«."
      },
      {
        questionId: 'w7t11_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "make a difference"):\n\n"Má»™t sá»‘ ngÆ°á»i cho ráº±ng hĂ nh Ä‘á»™ng cá»§a má»—i cĂ¡ nhĂ¢n khĂ´ng thá»ƒ táº¡o ra sá»± khĂ¡c biá»‡t lá»›n."',
        correctAnswer: 'Some people argue that the actions of each individual cannot make a significant difference.',
        modelAnswer: 'Some people argue that the actions of each individual cannot make a significant difference.',
        fallbackKeywords: ['make a difference', 'individual', 'significant'],
        explanationVi: "'Make a significant difference' = táº¡o ra sá»± khĂ¡c biá»‡t Ä‘Ă¡ng ká»ƒ. 'Argue that + clause' lĂ  cĂ¡ch trĂ­ch dáº«n quan Ä‘iá»ƒm chuáº©n trong IELTS."
      },
      {
        questionId: 'w7t11_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "sustainable lifestyle"):\n\n"Lá»‘i sá»‘ng bá»n vá»¯ng cĂ³ thá»ƒ giĂºp giáº£m lÆ°á»£ng khĂ­ tháº£i carbon."',
        correctAnswer: 'A sustainable lifestyle can help reduce one\'s carbon footprint.',
        modelAnswer: 'A sustainable lifestyle can help reduce one\'s carbon footprint.',
        fallbackKeywords: ['sustainable lifestyle', 'carbon', 'reduce'],
        explanationVi: "'Carbon footprint' = lÆ°á»£ng khĂ­ tháº£i carbon cĂ¡ nhĂ¢n (tá»± nhiĂªn hÆ¡n 'carbon emissions' trong bá»‘i cáº£nh cĂ¡ nhĂ¢n). 'One\'s' = cá»§a má»™t ngÆ°á»i."
      },
      {
        questionId: 'w7t11_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "renewable energy"):\n\n"Viá»‡c sá»­ dá»¥ng nÄƒng lÆ°á»£ng tĂ¡i táº¡o lĂ  cĂ¡ch hiá»‡u quáº£ Ä‘á»ƒ chá»‘ng láº¡i biáº¿n Ä‘á»•i khĂ­ háº­u."',
        correctAnswer: 'Using renewable energy is an effective way to combat climate change.',
        modelAnswer: 'Using renewable energy is an effective way to combat climate change.',
        fallbackKeywords: ['renewable energy', 'effective', 'combat', 'climate change'],
        explanationVi: "'An effective way to + V' = cĂ¡ch hiá»‡u quáº£ Ä‘á»ƒ lĂ m gĂ¬. 'Combat' (= chá»‘ng láº¡i) máº¡nh vĂ  há»c thuáº­t hÆ¡n 'fight' hay 'reduce'."
      },
      {
        questionId: 'w7t11_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "public campaign"):\n\n"Nhiá»u chiáº¿n dá»‹ch cá»™ng Ä‘á»“ng Ä‘Æ°á»£c tá»• chá»©c Ä‘á»ƒ nĂ¢ng cao nháº­n thá»©c vá» mĂ´i trÆ°á»ng."',
        correctAnswer: 'Many public campaigns are organised to raise awareness about environmental issues.',
        modelAnswer: 'Many public campaigns are organised to raise awareness about environmental issues.',
        fallbackKeywords: ['public campaign', 'raise awareness', 'environmental'],
        explanationVi: "'Are organised to + V' = bá»‹ Ä‘á»™ng cĂ³ má»¥c Ä‘Ă­ch. 'Raise awareness about' = nĂ¢ng cao nháº­n thá»©c vá». DĂ¹ng 'environmental issues' tá»± nhiĂªn hÆ¡n 'environment' thuáº§n tĂºy."
      },
      {
        questionId: 'w7t11_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "government regulation"):\n\n"ChĂ­nh phá»§ nĂªn ban hĂ nh cĂ¡c quy Ä‘á»‹nh nghiĂªm ngáº·t vá» khĂ­ tháº£i nhĂ  kĂ­nh."',
        correctAnswer: 'The government should introduce strict regulations on greenhouse gas emissions.',
        modelAnswer: 'The government should introduce strict regulations on greenhouse gas emissions.',
        fallbackKeywords: ['government regulation', 'strict', 'greenhouse gas', 'emissions'],
        explanationVi: "'Introduce regulations on' = ban hĂ nh quy Ä‘á»‹nh vá». 'Greenhouse gas emissions' = khĂ­ tháº£i nhĂ  kĂ­nh â€” cá»¥m tá»« ká»¹ thuáº­t khĂ´ng thá»ƒ Ä‘á»•i."
      },
      {
        questionId: 'w7t11_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "collective effort"):\n\n"Náº¿u má»—i ngÆ°á»i cĂ¹ng hĂ nh Ä‘á»™ng, ná»— lá»±c chung sáº½ táº¡o ra sá»± thay Ä‘á»•i lá»›n."',
        correctAnswer: 'If everyone acts together, the collective effort will bring about significant change.',
        modelAnswer: 'If everyone acts together, the collective effort will bring about significant change.',
        fallbackKeywords: ['collective effort', 'together', 'significant change'],
        explanationVi: "'Bring about + change' = táº¡o ra sá»± thay Ä‘á»•i. 'Collective effort' = ná»— lá»±c táº­p thá»ƒ/chung. CĂ¢u Ä‘iá»u kiá»‡n loáº¡i 1: If + present, will + V."
      },
      {
        questionId: 'w7t11_q21', level: 'intermediate', orderIndex: 21,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "energy consumption"):\n\n"Ă” nhiá»…m mĂ´i trÆ°á»ng ngĂ y cĂ ng nghiĂªm trá»ng do sá»± tiĂªu thá»¥ nÄƒng lÆ°á»£ng quĂ¡ má»©c."',
        correctAnswer: 'Environmental pollution is becoming increasingly severe due to excessive energy consumption.',
        modelAnswer: 'Environmental pollution is becoming increasingly severe due to excessive energy consumption.',
        fallbackKeywords: ['energy consumption', 'excessive', 'pollution', 'increasingly severe'],
        explanationVi: "'Is becoming increasingly severe' = Ä‘ang ngĂ y cĂ ng nghiĂªm trá»ng (Present Continuous + adverb). 'Due to + N' = do/vĂ¬. 'Excessive' = quĂ¡ má»©c."
      },
      {
        questionId: 'w7t11_q22', level: 'intermediate', orderIndex: 22,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "environmental degradation"):\n\n"Má»i ngÆ°á»i cáº§n nĂ¢ng cao nháº­n thá»©c vá» háº­u quáº£ cá»§a sá»± suy thoĂ¡i mĂ´i trÆ°á»ng."',
        correctAnswer: 'People need to raise awareness about the consequences of environmental degradation.',
        modelAnswer: 'People need to raise awareness about the consequences of environmental degradation.',
        fallbackKeywords: ['environmental degradation', 'awareness', 'consequences'],
        explanationVi: "'Raise awareness about' = nĂ¢ng cao nháº­n thá»©c vá». 'Consequences of + N' = háº­u quáº£ cá»§a. 'Environmental degradation' = suy thoĂ¡i mĂ´i trÆ°á»ng."
      },
      {
        questionId: 'w7t11_q23', level: 'intermediate', orderIndex: 23,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "reduce, reuse, recycle"):\n\n"Viá»‡c giáº£m, tĂ¡i sá»­ dá»¥ng vĂ  tĂ¡i cháº¿ lĂ  thĂ³i quen mĂ  ai cÅ©ng nĂªn thá»±c hiá»‡n."',
        correctAnswer: 'The habit of reduce, reuse, and recycle is something everyone should practise.',
        modelAnswer: 'The habit of reduce, reuse, and recycle is something everyone should practise.',
        fallbackKeywords: ['reduce', 'reuse', 'recycle', 'habit', 'everyone'],
        explanationVi: "'The habit of + V/N' = thĂ³i quen vá». 'Something everyone should practise' = Ä‘iá»u mĂ  ai cÅ©ng nĂªn thá»±c hiá»‡n. 'Practise' (BrE) = luyá»‡n táº­p, thá»±c hiá»‡n."
      }
    ]
  },
  {
    week: 7, block: 'discuss_both_views', orderIndex: 12,
    topicName: 'Car-Free Days vs. Alternative Solutions', topicEmoji: 'đŸ—',
    essayType: 'discuss_both_views',
    prompt: 'Some people think international car-free days are an effective way to reduce air pollution. Others believe there are better ways to tackle this issue. Discuss both views and give your own opinion.',
    hintAdvantages: ['raises public awareness of pollution', 'reduces emissions temporarily', 'encourages use of public transport'],
    hintDisadvantages: ['short-term effect only', 'electric vehicles and urban planning are more effective', 'government policy must address root causes'],
    vocabularyList: [
      { term: 'air pollution', definitionVi: 'Ă´ nhiá»…m khĂ´ng khĂ­', example: 'Car-free days temporarily reduce air pollution in cities.' },
      { term: 'car-free day', definitionVi: 'ngĂ y khĂ´ng xe', example: 'Many cities have adopted car-free days to raise environmental awareness.' },
      { term: 'traffic congestion', definitionVi: 'táº¯c ngháº½n giao thĂ´ng', example: 'Traffic congestion is a major cause of urban air pollution.' },
      { term: 'exhaust fumes', definitionVi: 'khĂ³i tháº£i xe', example: 'Exhaust fumes from vehicles are the main cause of air pollution in cities.' },
      { term: 'greenhouse gas emissions', definitionVi: 'khĂ­ tháº£i nhĂ  kĂ­nh', example: 'Reducing greenhouse gas emissions requires a shift away from fossil fuels.' },
      { term: 'environmental awareness', definitionVi: 'nháº­n thá»©c mĂ´i trÆ°á»ng', example: 'Car-free days help raise environmental awareness among citizens.' },
      { term: 'public transportation', definitionVi: 'giao thĂ´ng cĂ´ng cá»™ng', example: 'Investing in public transportation reduces reliance on private cars.' },
      { term: 'electric vehicles', definitionVi: 'xe Ä‘iá»‡n', example: 'Electric vehicles are becoming a more environmentally friendly alternative.' },
      { term: 'alternative transport', definitionVi: 'phÆ°Æ¡ng tiá»‡n thay tháº¿', example: 'Cycling and walking are popular forms of alternative transport.' },
      { term: 'sustainable transportation', definitionVi: 'giao thĂ´ng bá»n vá»¯ng', example: 'Sustainable transportation is a long-term solution for densely populated cities.' },
      { term: 'energy-efficient technology', definitionVi: 'cĂ´ng nghá»‡ tiáº¿t kiá»‡m nÄƒng lÆ°á»£ng', example: 'Investment in energy-efficient technology benefits both the economy and environment.' },
      { term: 'government policy', definitionVi: 'chĂ­nh sĂ¡ch chĂ­nh phá»§', example: 'Effective government policy is needed to enforce emission standards.' },
      { term: 'urban planning', definitionVi: 'quy hoáº¡ch Ä‘Ă´ thá»‹', example: 'Better urban planning can reduce the need for private vehicles.' },
      { term: 'air quality', definitionVi: 'cháº¥t lÆ°á»£ng khĂ´ng khĂ­', example: 'Poor air quality in major cities poses serious health risks.' },
      { term: 'pollution control', definitionVi: 'kiá»ƒm soĂ¡t Ă´ nhiá»…m', example: 'Pollution control measures must be enforced by local authorities.' }
    ],
    questions: [
      {
        questionId: 'w7t12_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Äá» bĂ i cĂ³ cá»¥m "Discuss both views and give your own opinion." Äiá»u nĂ y yĂªu cáº§u báº¡n lĂ m gĂ¬?',
        options: [
          'Chá»‰ Ä‘á»“ng Ă½ hoáº·c khĂ´ng Ä‘á»“ng Ă½ vá»›i má»™t quan Ä‘iá»ƒm',
          'PhĂ¢n tĂ­ch Æ°u Ä‘iá»ƒm vĂ  nhÆ°á»£c Ä‘iá»ƒm cá»§a má»™t váº¥n Ä‘á»',
          'TrĂ¬nh bĂ y cáº£ hai quan Ä‘iá»ƒm, sau Ä‘Ă³ nĂªu Ă½ kiáº¿n cĂ¡ nhĂ¢n rĂµ rĂ ng',
          'TĂ¬m nguyĂªn nhĂ¢n vĂ  Ä‘á» xuáº¥t giáº£i phĂ¡p'
        ],
        correctAnswer: 'TrĂ¬nh bĂ y cáº£ hai quan Ä‘iá»ƒm, sau Ä‘Ă³ nĂªu Ă½ kiáº¿n cĂ¡ nhĂ¢n rĂµ rĂ ng',
        explanationVi: 'Dáº¡ng Discuss Both Views: (1) Ä‘oáº¡n View 1, (2) Ä‘oáº¡n View 2, (3) Ă½ kiáº¿n cĂ¡ nhĂ¢n rĂµ rĂ ng trong Thesis Statement vĂ  káº¿t luáº­n.'
      },
      {
        questionId: 'w7t12_q02', level: 'beginner', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Äiá»n tá»« cĂ²n thiáº¿u:\n\n"Car-free days help raise _____ about the harmful effects of vehicle emissions on urban air quality."',
        correctAnswer: 'awareness',
        explanationVi: '"Raise awareness" = nĂ¢ng cao nháº­n thá»©c â€” cá»¥m Ä‘á»™ng tá»« phá»• biáº¿n khi bĂ n vá» chiáº¿n dá»‹ch cá»™ng Ä‘á»“ng.'
      },
      {
        questionId: 'w7t12_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Ă” nhiá»…m khĂ´ng khĂ­ lĂ  má»™t trong nhá»¯ng váº¥n Ä‘á» nghiĂªm trá»ng nháº¥t á»Ÿ cĂ¡c thĂ nh phá»‘ lá»›n."',
        correctAnswer: 'Air pollution is one of the most serious problems in major cities.',
        modelAnswer: 'Air pollution is one of the most serious problems in major cities.',
        fallbackKeywords: ['air pollution', 'serious', 'major cities'],
        explanationVi: "'One of the most + adj + N' = má»™t trong nhá»¯ng... nháº¥t. 'Major cities' = cĂ¡c thĂ nh phá»‘ lá»›n. ÄĂ¢y lĂ  cĂ¢u má»Ÿ bĂ i phá»• biáº¿n cho chá»§ Ä‘á» Ă´ nhiá»…m."
      },
      {
        questionId: 'w7t12_q04', level: 'beginner', orderIndex: 4,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"KhĂ­ tháº£i tá»« xe cá»™ lĂ  nguyĂªn nhĂ¢n chĂ­nh gĂ¢y Ă´ nhiá»…m khĂ´ng khĂ­."',
        correctAnswer: 'Exhaust fumes from vehicles are the main cause of air pollution.',
        modelAnswer: 'Exhaust fumes from vehicles are the main cause of air pollution.',
        fallbackKeywords: ['exhaust fumes', 'vehicles', 'air pollution', 'cause'],
        explanationVi: "'Exhaust fumes' = khĂ³i tháº£i/khĂ­ tháº£i tá»« xe. 'The main cause of' = nguyĂªn nhĂ¢n chĂ­nh cá»§a. Sá»‘ nhiá»u 'fumes' Ä‘i vá»›i Ä‘á»™ng tá»« sá»‘ nhiá»u 'are'."
      },
      {
        questionId: 'w7t12_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Xe Ä‘iá»‡n Ä‘ang trá»Ÿ thĂ nh lá»±a chá»n thay tháº¿ thĂ¢n thiá»‡n vá»›i mĂ´i trÆ°á»ng hÆ¡n."',
        correctAnswer: 'Electric vehicles are becoming a more environmentally friendly alternative.',
        modelAnswer: 'Electric vehicles are becoming a more environmentally friendly alternative.',
        fallbackKeywords: ['electric vehicles', 'environmentally friendly', 'alternative'],
        explanationVi: "'Are becoming' = Ä‘ang trá»Ÿ thĂ nh (Present Continuous nháº¥n máº¡nh xu hÆ°á»›ng Ä‘ang thay Ä‘á»•i). 'Environmentally friendly alternative' = lá»±a chá»n thay tháº¿ thĂ¢n thiá»‡n mĂ´i trÆ°á»ng."
      },
      {
        questionId: 'w7t12_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Giao thĂ´ng bá»n vá»¯ng lĂ  giáº£i phĂ¡p lĂ¢u dĂ i cho cĂ¡c thĂ nh phá»‘ Ä‘Ă´ng dĂ¢n."',
        correctAnswer: 'Sustainable transportation is a long-term solution for densely populated cities.',
        modelAnswer: 'Sustainable transportation is a long-term solution for densely populated cities.',
        fallbackKeywords: ['sustainable transportation', 'long-term', 'cities'],
        explanationVi: "'Long-term solution' = giáº£i phĂ¡p lĂ¢u dĂ i. 'Densely populated cities' = cĂ¡c thĂ nh phá»‘ Ä‘Ă´ng dĂ¢n. ÄĂ¢y lĂ  láº­p luáº­n quan trá»ng á»§ng há»™ cĂ¡c giáº£i phĂ¡p thay tháº¿ car-free days."
      },
      {
        questionId: 'w7t12_q07', level: 'elementary', orderIndex: 7,
        type: 'error_correction',
        questionText: 'CĂ¢u sau cĂ³ lá»—i gĂ¬? HĂ£y sá»­a láº¡i:\n\n"Car-free days is only one of the many ways to reduce air pollution in cities."',
        correctAnswer: 'Car-free days are only one of the many ways to reduce air pollution in cities.',
        modelAnswer: 'Car-free days are only one of the many ways to reduce air pollution in cities.',
        fallbackKeywords: ['car-free days', 'are', 'reduce', 'air pollution'],
        explanationVi: "Lá»—i: \"Car-free days\" lĂ  danh tá»« sá»‘ nhiá»u â†’ dĂ¹ng \"are\" khĂ´ng pháº£i \"is\"."
      },
      {
        questionId: 'w7t12_q08', level: 'elementary', orderIndex: 8,
        type: 'rearrange',
        questionText: 'Sáº¯p xáº¿p thĂ nh cĂ¢u hoĂ n chá»‰nh:\n\n[an effective / Car-free days / raising / are / means / environmental awareness, / of / but / they / alone / long-term / cannot / solve / air pollution]',
        correctAnswer: 'Car-free days are an effective means of raising environmental awareness, but they alone cannot solve long-term air pollution.',
        explanationVi: '"means of + V-ing" = phÆ°Æ¡ng tiá»‡n Ä‘á»ƒ lĂ m gĂ¬. "Alone" Ä‘á»©ng sau chá»§ ngá»¯ Ä‘á»ƒ nháº¥n máº¡nh.'
      },
      {
        questionId: 'w7t12_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Nhiá»u ngÆ°á»i cho ráº±ng chĂ­nh phá»§ nĂªn táº­p trung vĂ o cĂ´ng nghá»‡ tiáº¿t kiá»‡m nÄƒng lÆ°á»£ng thay vĂ¬ cáº¥m Ă´ tĂ´."',
        correctAnswer: 'Many people argue that the government should focus on developing energy-efficient technology rather than banning cars.',
        modelAnswer: 'Many people argue that the government should focus on developing energy-efficient technology rather than banning cars.',
        fallbackKeywords: ['energy-efficient technology', 'government', 'rather than', 'banning cars'],
        explanationVi: "'Rather than + V-ing' = thay vĂ¬. 'Focus on + V-ing' = táº­p trung vĂ o. 'Energy-efficient technology' = cĂ´ng nghá»‡ tiáº¿t kiá»‡m nÄƒng lÆ°á»£ng â€” tá»« vá»±ng há»c thuáº­t quan trá»ng."
      },
      {
        questionId: 'w7t12_q10', level: 'intermediate', orderIndex: 10,
        type: 'paraphrase',
        questionText: 'Viáº¿t láº¡i cĂ¢u sau mĂ  khĂ´ng dĂ¹ng: car-free days, effective, reduce, air pollution, better ways, tackle:\n\n"Some people think international car-free days are an effective way to reduce air pollution. Others believe there are better ways to tackle this issue."',
        correctAnswer: 'While some argue that designating vehicle-free days on a global scale can meaningfully curb urban emissions, others maintain that more lasting structural measures are required to genuinely combat this environmental challenge.',
        modelAnswer: 'While some argue that designating vehicle-free days on a global scale can meaningfully curb urban emissions, others maintain that more lasting structural measures are required to genuinely combat this environmental challenge.',
        fallbackKeywords: ['vehicle-free days', 'urban emissions', 'structural measures', 'environmental challenge', 'combat'],
        explanationVi: "Paraphrase tá»‘t thay 'car-free days' â†’ 'vehicle-free days', 'reduce' â†’ 'curb', 'better ways' â†’ 'structural measures'. 'Lasting' = lĂ¢u dĂ i. 'Combat' = chá»‘ng láº¡i."
      },
      {
        questionId: 'w7t12_q11', level: 'intermediate', orderIndex: 11,
        type: 'short_writing',
        questionText: 'Viáº¿t 1 Ä‘oáº¡n body paragraph (~80â€“100 tá»«) láº­p luáº­n ráº±ng cĂ¡c giáº£i phĂ¡p thay tháº¿ (nhÆ° xe Ä‘iá»‡n, giao thĂ´ng cĂ´ng cá»™ng, quy hoáº¡ch Ä‘Ă´ thá»‹) hiá»‡u quáº£ hÆ¡n car-free days.\n\nGá»£i Ă½: electric vehicles / sustainable transportation / government policy / urban planning / pollution control',
        modelAnswer: 'While car-free days can raise environmental awareness, they are essentially a temporary measure that fails to address the underlying causes of air pollution. A more sustainable solution would involve long-term government policy changes, such as investing in electric vehicles and expanding public transportation networks. Urban planning that prioritises cycling lanes and pedestrian zones can permanently reduce reliance on private vehicles. Countries like Norway, which have heavily subsidised electric vehicles through tax incentives, have demonstrated that such strategies produce measurable, lasting improvements in air quality â€” far exceeding the impact of a single car-free day.',
        fallbackKeywords: ['electric vehicles', 'public transportation', 'government policy', 'urban planning', 'sustainable', 'air quality'],
        explanationVi: "Cáº¥u trĂºc PEEL: trĂ¬nh bĂ y View 2, giáº£i thĂ­ch táº¡i sao alternatives hiá»‡u quáº£ hÆ¡n, Ä‘Æ°a vĂ­ dá»¥ cá»¥ thá»ƒ (EV, urban planning), káº¿t luáº­n view."
      },
      // â”€â”€ QT-4 Intermediate (W7T2) â”€â”€
      {
        questionId: 'w7t12_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "car-free day"):\n\n"Nhiá»u ngÆ°á»i tin ráº±ng cĂ¡c ngĂ y khĂ´ng Ă´ tĂ´ giĂºp giáº£m lÆ°á»£ng khĂ­ tháº£i ra mĂ´i trÆ°á»ng."',
        correctAnswer: 'Many people believe that car-free days help reduce the amount of emissions released into the environment.',
        modelAnswer: 'Many people believe that car-free days help reduce the amount of emissions released into the environment.',
        fallbackKeywords: ['car-free day', 'reduce', 'emissions', 'environment'],
        explanationVi: "'Help + V (bare infinitive)' = giĂºp lĂ m gĂ¬. 'Emissions released into the environment' = khĂ­ tháº£i tháº£i ra mĂ´i trÆ°á»ng â€” cá»¥m danh tá»« má»Ÿ rá»™ng."
      },
      {
        questionId: 'w7t12_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "exhaust fumes"):\n\n"KhĂ­ tháº£i tá»« xe cá»™ lĂ  nguyĂªn nhĂ¢n chĂ­nh gĂ¢y Ă´ nhiá»…m khĂ´ng khĂ­."',
        correctAnswer: 'Exhaust fumes from vehicles are the primary cause of air pollution.',
        modelAnswer: 'Exhaust fumes from vehicles are the primary cause of air pollution.',
        fallbackKeywords: ['exhaust fumes', 'vehicles', 'primary cause', 'air pollution'],
        explanationVi: "'Exhaust fumes' lĂ  danh tá»« sá»‘ nhiá»u, dĂ¹ng 'are'. 'Primary cause' = nguyĂªn nhĂ¢n Ä‘áº§u tiĂªn/chĂ­nh (formal hÆ¡n 'main cause')."
      },
      {
        questionId: 'w7t12_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "traffic congestion"):\n\n"CĂ¡c thĂ nh phá»‘ lá»›n thÆ°á»ng Ä‘á»‘i máº·t vá»›i tĂ¬nh tráº¡ng táº¯c ngháº½n giao thĂ´ng nghiĂªm trá»ng."',
        correctAnswer: 'Major cities frequently face severe traffic congestion.',
        modelAnswer: 'Major cities frequently face severe traffic congestion.',
        fallbackKeywords: ['traffic congestion', 'major cities', 'severe'],
        explanationVi: "'Frequently face' = thÆ°á»ng xuyĂªn Ä‘á»‘i máº·t ('frequently' há»c thuáº­t hÆ¡n 'often'). 'Severe traffic congestion' = táº¯c ngháº½n giao thĂ´ng nghiĂªm trá»ng."
      },
      {
        questionId: 'w7t12_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "electric vehicles"):\n\n"Xe Ä‘iá»‡n Ä‘ang trá»Ÿ thĂ nh lá»±a chá»n thay tháº¿ thĂ¢n thiá»‡n vá»›i mĂ´i trÆ°á»ng hÆ¡n."',
        correctAnswer: 'Electric vehicles are becoming a more environmentally friendly alternative.',
        modelAnswer: 'Electric vehicles are becoming a more environmentally friendly alternative.',
        fallbackKeywords: ['electric vehicles', 'environmentally friendly', 'alternative'],
        explanationVi: "'Are becoming' = Ä‘ang trá»Ÿ thĂ nh (Present Continuous nháº¥n máº¡nh xu hÆ°á»›ng). 'Environmentally friendly alternative' = lá»±a chá»n thĂ¢n thiá»‡n vá»›i mĂ´i trÆ°á»ng."
      },
      {
        questionId: 'w7t12_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "environmental campaign"):\n\n"ChĂ­nh phá»§ nĂªn khuyáº¿n khĂ­ch ngÆ°á»i dĂ¢n tham gia cĂ¡c chiáº¿n dá»‹ch báº£o vá»‡ mĂ´i trÆ°á»ng."',
        correctAnswer: 'The government should encourage people to participate in environmental campaigns.',
        modelAnswer: 'The government should encourage people to participate in environmental campaigns.',
        fallbackKeywords: ['environmental campaign', 'encourage', 'participate'],
        explanationVi: "'Encourage + O + to V' = khuyáº¿n khĂ­ch ai lĂ m gĂ¬. 'Participate in' = tham gia (formal hÆ¡n 'join')."
      },
      {
        questionId: 'w7t12_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "vehicle restriction"):\n\n"Nhiá»u ngÆ°á»i cho ráº±ng viá»‡c háº¡n cháº¿ phÆ°Æ¡ng tiá»‡n lĂ  cĂ¡ch hiá»‡u quáº£ Ä‘á»ƒ giáº£m Ă´ nhiá»…m."',
        correctAnswer: 'Many people argue that vehicle restriction is an effective way to reduce pollution.',
        modelAnswer: 'Many people argue that vehicle restriction is an effective way to reduce pollution.',
        fallbackKeywords: ['vehicle restriction', 'effective', 'reduce pollution'],
        explanationVi: "'An effective way to + V' = cĂ¡ch hiá»‡u quáº£ Ä‘á»ƒ. 'Argue that' = cho ráº±ng/láº­p luáº­n ráº±ng (chuáº©n hÆ¡n 'think that' trong IELTS)."
      },
      {
        questionId: 'w7t12_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "fuel consumption"):\n\n"Viá»‡c giáº£m tiĂªu thá»¥ nhiĂªn liá»‡u gĂ³p pháº§n lĂ m giáº£m lÆ°á»£ng khĂ­ tháº£i nhĂ  kĂ­nh."',
        correctAnswer: 'Reducing fuel consumption contributes to lowering greenhouse gas emissions.',
        modelAnswer: 'Reducing fuel consumption contributes to lowering greenhouse gas emissions.',
        fallbackKeywords: ['fuel consumption', 'reducing', 'greenhouse gas emissions'],
        explanationVi: "'Contribute to + V-ing' = gĂ³p pháº§n vĂ o viá»‡c (to lĂ  giá»›i tá»« â†’ sau lĂ  V-ing). 'Greenhouse gas emissions' = khĂ­ tháº£i nhĂ  kĂ­nh."
      },
      {
        questionId: 'w7t12_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "awareness-raising activities"):\n\n"CĂ¡c hoáº¡t Ä‘á»™ng nĂ¢ng cao nháº­n thá»©c giĂºp ngÆ°á»i dĂ¢n hiá»ƒu rĂµ hÆ¡n vá» váº¥n Ä‘á» mĂ´i trÆ°á»ng."',
        correctAnswer: 'Awareness-raising activities help people better understand environmental issues.',
        modelAnswer: 'Awareness-raising activities help people better understand environmental issues.',
        fallbackKeywords: ['awareness-raising activities', 'understand', 'environmental issues'],
        explanationVi: "'Help + O + V (bare infinitive)' = giĂºp ai lĂ m gĂ¬. 'Better understand' = hiá»ƒu rĂµ hÆ¡n. 'Awareness-raising' lĂ  tĂ­nh tá»« ghĂ©p Ä‘á»©ng trÆ°á»›c danh tá»«."
      },
      {
        questionId: 'w7t12_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "energy-efficient technology"):\n\n"Nhiá»u ngÆ°á»i cho ráº±ng chĂ­nh phá»§ nĂªn táº­p trung vĂ o cĂ´ng nghá»‡ tiáº¿t kiá»‡m nÄƒng lÆ°á»£ng thay vĂ¬ cáº¥m Ă´ tĂ´."',
        correctAnswer: 'Many people argue that the government should focus on developing energy-efficient technology rather than banning cars.',
        modelAnswer: 'Many people argue that the government should focus on developing energy-efficient technology rather than banning cars.',
        fallbackKeywords: ['energy-efficient technology', 'government', 'rather than', 'banning'],
        explanationVi: "'Rather than + V-ing' = thay vĂ¬ lĂ m gĂ¬. 'Focus on + V-ing' = táº­p trung vĂ o. 'Energy-efficient technology' lĂ  cá»¥m tĂ­nh tá»« ghĂ©p, gáº¡ch ná»‘i giá»¯a 'energy' vĂ  'efficient'."
      },
      {
        questionId: 'w7t12_q21', level: 'intermediate', orderIndex: 21,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "government policy"):\n\n"ChĂ­nh sĂ¡ch cá»§a chĂ­nh phá»§ Ä‘Ă³ng vai trĂ² quan trá»ng trong viá»‡c kiá»ƒm soĂ¡t Ă´ nhiá»…m."',
        correctAnswer: 'Government policy plays a crucial role in controlling pollution.',
        modelAnswer: 'Government policy plays a crucial role in controlling pollution.',
        fallbackKeywords: ['government policy', 'crucial role', 'controlling pollution'],
        explanationVi: "'Play a crucial role in + V-ing' = Ä‘Ă³ng vai trĂ² quan trá»ng trong viá»‡c. 'Crucial' = then chá»‘t/quan trá»ng (stronger than 'important')."
      }
    ]
  },
  {
    week: 8, block: 'discuss_both_views', orderIndex: 13,
    topicName: 'Economic Growth vs. Environmental Protection', topicEmoji: 'â–ï¸',
    essayType: 'discuss_both_views',
    prompt: 'Some people believe that economic development is more important than environmental protection. Others argue that protecting the environment should be prioritized. Discuss both views and give your own opinion.',
    hintAdvantages: ['economic growth reduces poverty and creates jobs', 'developing nations need industrial growth', 'technology will solve environmental problems'],
    hintDisadvantages: ['environmental damage is irreversible', 'overexploitation depletes natural resources', 'sustainable development balances both goals'],
    vocabularyList: [
      { term: 'economic development', definitionVi: 'phĂ¡t triá»ƒn kinh táº¿', example: 'Economic development improves living standards and reduces poverty.' },
      { term: 'environmental protection', definitionVi: 'báº£o vá»‡ mĂ´i trÆ°á»ng', example: 'Environmental protection must be a global priority.' },
      { term: 'sustainable development', definitionVi: 'phĂ¡t triá»ƒn bá»n vá»¯ng', example: 'Sustainable development balances growth with ecological responsibility.' },
      { term: 'industrialization', definitionVi: 'cĂ´ng nghiá»‡p hĂ³a', example: 'Rapid industrialization has transformed many developing economies.' },
      { term: 'economic growth', definitionVi: 'tÄƒng trÆ°á»Ÿng kinh táº¿', example: 'Economic growth creates jobs and raises living standards.' },
      { term: 'poverty reduction', definitionVi: 'giáº£m nghĂ¨o', example: 'Poverty reduction is a key argument for prioritising economic growth.' },
      { term: 'job creation', definitionVi: 'táº¡o viá»‡c lĂ m', example: 'Industrial projects boost job creation in developing countries.' },
      { term: 'environmental degradation', definitionVi: 'suy thoĂ¡i mĂ´i trÆ°á»ng', example: 'Rapid industrial development may lead to environmental degradation.' },
      { term: 'deforestation', definitionVi: 'náº¡n phĂ¡ rá»«ng', example: 'Deforestation for agriculture is destroying critical ecosystems.' },
      { term: 'natural resources', definitionVi: 'tĂ i nguyĂªn thiĂªn nhiĂªn', example: 'Overexploitation of natural resources causes long-term consequences for the planet.' },
      { term: 'overexploitation', definitionVi: 'khai thĂ¡c quĂ¡ má»©c', example: 'Overexploitation of forests and minerals threatens future generations.' },
      { term: 'renewable energy', definitionVi: 'nÄƒng lÆ°á»£ng tĂ¡i táº¡o', example: 'Investing in renewable energy allows growth without ecological damage.' },
      { term: 'eco-friendly policies', definitionVi: 'chĂ­nh sĂ¡ch thĂ¢n thiá»‡n mĂ´i trÆ°á»ng', example: 'Eco-friendly policies can limit industrial pollution effectively.' },
      { term: 'long-term consequences', definitionVi: 'háº­u quáº£ lĂ¢u dĂ i', example: 'Ignoring climate change will have devastating long-term consequences.' },
      { term: 'sustainable economy', definitionVi: 'ná»n kinh táº¿ bá»n vá»¯ng', example: 'A sustainable economy grows without depleting environmental resources.' }
    ],
    questions: [
      {
        questionId: 'w8t13_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Keyword nĂ o trong Ä‘á» bĂ i xĂ¡c Ä‘á»‹nh Ä‘Ă¢y lĂ  dáº¡ng Discuss Both Views?',
        options: [
          'economic development',
          'environmental protection',
          'Discuss both views and give your own opinion',
          'more important than'
        ],
        correctAnswer: 'Discuss both views and give your own opinion',
        explanationVi: 'Cá»¥m "Discuss both views" lĂ  dáº¥u hiá»‡u nháº­n biáº¿t trá»±c tiáº¿p. CĂ¡c tá»« nhÆ° "economic development" hay "environmental protection" chá»‰ lĂ  chá»§ Ä‘á», khĂ´ng pháº£i dáº¥u hiá»‡u dáº¡ng bĂ i.'
      },
      {
        questionId: 'w8t13_q02', level: 'beginner', orderIndex: 2,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Nhiá»u quá»‘c gia Ä‘ang táº­p trung vĂ o phĂ¡t triá»ƒn kinh táº¿ Ä‘á»ƒ nĂ¢ng cao má»©c sá»‘ng cá»§a ngÆ°á»i dĂ¢n."',
        correctAnswer: 'Many countries are focusing on economic development to improve people\'s living standards.',
        modelAnswer: 'Many countries are focusing on economic development to improve people\'s living standards.',
        fallbackKeywords: ['economic development', 'countries', 'living standards', 'improve'],
        explanationVi: "'Focus on + V-ing/N' = táº­p trung vĂ o. 'Living standards' = má»©c sá»‘ng. 'To improve' = to-infinitive chá»‰ má»¥c Ä‘Ă­ch."
      },
      {
        questionId: 'w8t13_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Má»™t sá»‘ ngÆ°á»i tin ráº±ng giáº£m nghĂ¨o vĂ  táº¡o viá»‡c lĂ m nĂªn Ä‘Æ°á»£c Æ°u tiĂªn hÆ¡n."',
        correctAnswer: 'Some people believe that poverty reduction and job creation should be prioritized.',
        modelAnswer: 'Some people believe that poverty reduction and job creation should be prioritized.',
        fallbackKeywords: ['poverty reduction', 'job creation', 'prioritized', 'believe'],
        explanationVi: "'Poverty reduction' = giáº£m nghĂ¨o (noun phrase). 'Job creation' = táº¡o viá»‡c lĂ m. 'Should be prioritized' = nĂªn Ä‘Æ°á»£c Æ°u tiĂªn (passive voice)."
      },
      {
        questionId: 'w8t13_q04', level: 'elementary', orderIndex: 4,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Sá»± phĂ¡t triá»ƒn cĂ´ng nghiá»‡p quĂ¡ nhanh cĂ³ thá»ƒ dáº«n Ä‘áº¿n suy thoĂ¡i mĂ´i trÆ°á»ng."',
        correctAnswer: 'Rapid industrial development may lead to environmental degradation.',
        modelAnswer: 'Rapid industrial development may lead to environmental degradation.',
        fallbackKeywords: ['industrial development', 'environmental degradation', 'rapid', 'lead to'],
        explanationVi: "'Lead to + N' = dáº«n Ä‘áº¿n. 'Environmental degradation' = suy thoĂ¡i mĂ´i trÆ°á»ng. 'May' = cĂ³ thá»ƒ (modal nháº¥n máº¡nh kháº£ nÄƒng)."
      },
      {
        questionId: 'w8t13_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Viá»‡c khai thĂ¡c quĂ¡ má»©c tĂ i nguyĂªn thiĂªn nhiĂªn gĂ¢y ra nhá»¯ng háº­u quáº£ lĂ¢u dĂ i cho hĂ nh tinh."',
        correctAnswer: 'Overexploitation of natural resources causes long-term consequences for the planet.',
        modelAnswer: 'Overexploitation of natural resources causes long-term consequences for the planet.',
        fallbackKeywords: ['overexploitation', 'natural resources', 'long-term consequences', 'planet'],
        explanationVi: "'Overexploitation' = khai thĂ¡c quĂ¡ má»©c (danh tá»«). 'Long-term consequences' = háº­u quáº£ lĂ¢u dĂ i. 'For the planet' = cho hĂ nh tinh."
      },
      {
        questionId: 'w8t13_q06', level: 'elementary', orderIndex: 6,
        type: 'error_correction',
        questionText: 'CĂ¢u sau cĂ³ lá»—i gĂ¬? HĂ£y sá»­a láº¡i:\n\n"Economic growth often goes hand in hand with environment pollution."',
        correctAnswer: 'Economic growth often goes hand in hand with environmental pollution.',
        modelAnswer: 'Economic growth often goes hand in hand with environmental pollution.',
        fallbackKeywords: ['economic growth', 'environmental pollution', 'hand in hand'],
        explanationVi: "Lá»—i: \"environment pollution\" sai â€” pháº£i dĂ¹ng tĂ­nh tá»« \"environmental\" + danh tá»« \"pollution\"."
      },
      {
        questionId: 'w8t13_q07', level: 'elementary', orderIndex: 7,
        type: 'rearrange',
        questionText: 'Sáº¯p xáº¿p thĂ nh cĂ¢u hoĂ n chá»‰nh:\n\n[short-term benefits / prioritize / Many businesses / while ignoring / only / the long-term consequences / economic / of / overexploitation]',
        correctAnswer: 'Many businesses only prioritize short-term benefits while ignoring the long-term consequences of economic overexploitation.',
        explanationVi: '"Prioritize short-term benefits while ignoring..." â€” cáº¥u trĂºc Ä‘á»‘i láº­p dĂ¹ng "while + V-ing".'
      },
      {
        questionId: 'w8t13_q08', level: 'intermediate', orderIndex: 8,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"PhĂ¡t triá»ƒn bá»n vá»¯ng lĂ  cĂ¡ch duy nháº¥t Ä‘á»ƒ cĂ¢n báº±ng giá»¯a tÄƒng trÆ°á»Ÿng kinh táº¿ vĂ  báº£o vá»‡ mĂ´i trÆ°á»ng."',
        correctAnswer: 'Sustainable development is the only way to strike a balance between economic growth and environmental protection.',
        modelAnswer: 'Sustainable development is the only way to strike a balance between economic growth and environmental protection.',
        fallbackKeywords: ['sustainable development', 'balance', 'economic growth', 'environmental protection'],
        explanationVi: "'Strike a balance between A and B' = cĂ¢n báº±ng giá»¯a A vĂ  B (idiom há»c thuáº­t). 'The only way to' = cĂ¡ch duy nháº¥t Ä‘á»ƒ."
      },
      {
        questionId: 'w8t13_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"ChĂ­nh phá»§ nĂªn ban hĂ nh chĂ­nh sĂ¡ch thĂ¢n thiá»‡n mĂ´i trÆ°á»ng Ä‘á»ƒ háº¡n cháº¿ Ă´ nhiá»…m."',
        correctAnswer: 'The government should introduce eco-friendly policies to limit pollution.',
        modelAnswer: 'The government should introduce eco-friendly policies to limit pollution.',
        fallbackKeywords: ['eco-friendly policies', 'government', 'pollution', 'limit'],
        explanationVi: "'Introduce policies' = ban hĂ nh/Ä‘Æ°a ra chĂ­nh sĂ¡ch (chuáº©n hÆ¡n 'issue policies'). 'Eco-friendly' = thĂ¢n thiá»‡n mĂ´i trÆ°á»ng. 'Limit pollution' = háº¡n cháº¿ Ă´ nhiá»…m."
      },
      {
        questionId: 'w8t13_q10', level: 'intermediate', orderIndex: 10,
        type: 'paraphrase',
        questionText: 'Viáº¿t láº¡i cĂ¢u sau mĂ  khĂ´ng dĂ¹ng: economic development, more important, environmental protection, prioritized:\n\n"Some people believe that economic development is more important than environmental protection. Others argue that protecting the environment should be prioritized."',
        correctAnswer: 'Opinions are divided on whether financial growth and industrialization should take precedence over ecological conservation, or whether safeguarding the natural world ought to be society\'s primary concern.',
        modelAnswer: 'Opinions are divided on whether financial growth and industrialization should take precedence over ecological conservation, or whether safeguarding the natural world ought to be society\'s primary concern.',
        fallbackKeywords: ['financial growth', 'industrialization', 'ecological conservation', 'precedence', 'natural world'],
        explanationVi: "Paraphrase: 'economic development' â†’ 'financial growth and industrialization', 'environmental protection' â†’ 'ecological conservation', 'more important' â†’ 'take precedence over'."
      },
      {
        questionId: 'w8t13_q11', level: 'intermediate', orderIndex: 11,
        type: 'short_writing',
        questionText: 'Viáº¿t 1 Ä‘oáº¡n body paragraph (~80â€“100 tá»«) láº­p luáº­n ráº±ng báº£o vá»‡ mĂ´i trÆ°á»ng nĂªn Ä‘Æ°á»£c Æ°u tiĂªn hÆ¡n phĂ¡t triá»ƒn kinh táº¿.\n\nGá»£i Ă½: environmental degradation / long-term consequences / sustainable development / eco-friendly policies / climate change',
        modelAnswer: 'Those who advocate prioritising environmental protection over economic growth argue that the long-term consequences of environmental degradation far outweigh any short-term economic benefits. Unchecked industrialization leads to deforestation, carbon emissions, and irreversible climate change, which ultimately threaten the natural resources upon which all economic activity depends. For instance, the destruction of rainforests not only reduces biodiversity but also eliminates the carbon sinks that regulate global temperatures. Without eco-friendly policies and sustainable development strategies, short-term economic gains will come at the cost of a habitable planet for future generations.',
        fallbackKeywords: ['environmental degradation', 'long-term', 'climate change', 'sustainable development', 'eco-friendly', 'economic growth'],
        explanationVi: "Cáº¥u trĂºc PEEL cho View 2: topic sentence â†’ hai vĂ­ dá»¥ cá»¥ thá»ƒ (deforestation, emissions) â†’ há»‡ quáº£ â†’ káº¿t luáº­n. 'Imperative' = cáº¥p bĂ¡ch, báº¯t buá»™c."
      },
      // â”€â”€ QT-4 Intermediate (W7T3) â”€â”€
      {
        questionId: 'w8t13_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "economic development" vĂ  "living standards"):\n\n"Nhiá»u quá»‘c gia Ä‘ang táº­p trung vĂ o phĂ¡t triá»ƒn kinh táº¿ Ä‘á»ƒ nĂ¢ng cao má»©c sá»‘ng cá»§a ngÆ°á»i dĂ¢n."',
        correctAnswer: 'Many countries are focusing on economic development to improve people\'s living standards.',
        modelAnswer: 'Many countries are focusing on economic development to improve people\'s living standards.',
        fallbackKeywords: ['economic development', 'improve', 'living standards'],
        explanationVi: "'Are focusing on + N' = Ä‘ang táº­p trung vĂ o. 'To improve + N' = Ä‘á»ƒ nĂ¢ng cao (cá»¥m má»¥c Ä‘Ă­ch). 'Living standards' = má»©c sá»‘ng (thÆ°á»ng dĂ¹ng sá»‘ nhiá»u)."
      },
      {
        questionId: 'w8t13_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "industrialization" vĂ  "environmental degradation"):\n\n"Sá»± phĂ¡t triá»ƒn cĂ´ng nghiá»‡p quĂ¡ nhanh cĂ³ thá»ƒ dáº«n Ä‘áº¿n suy thoĂ¡i mĂ´i trÆ°á»ng."',
        correctAnswer: 'Rapid industrialization may lead to serious environmental degradation.',
        modelAnswer: 'Rapid industrialization may lead to serious environmental degradation.',
        fallbackKeywords: ['industrialization', 'rapid', 'environmental degradation'],
        explanationVi: "'Lead to + N/V-ing' = dáº«n Ä‘áº¿n. 'Rapid industrialization' = cĂ´ng nghiá»‡p hĂ³a nhanh chĂ³ng. 'Environmental degradation' = suy thoĂ¡i mĂ´i trÆ°á»ng."
      },
      {
        questionId: 'w8t13_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "climate change" vĂ  "deforestation"):\n\n"Biáº¿n Ä‘á»•i khĂ­ háº­u vĂ  phĂ¡ rá»«ng lĂ  hai háº­u quáº£ nghiĂªm trá»ng cá»§a sá»± phĂ¡t triá»ƒn thiáº¿u kiá»ƒm soĂ¡t."',
        correctAnswer: 'Climate change and deforestation are two serious consequences of uncontrolled development.',
        modelAnswer: 'Climate change and deforestation are two serious consequences of uncontrolled development.',
        fallbackKeywords: ['climate change', 'deforestation', 'uncontrolled development', 'consequences'],
        explanationVi: "'Consequences of + N' = háº­u quáº£ cá»§a. 'Uncontrolled development' = sá»± phĂ¡t triá»ƒn thiáº¿u kiá»ƒm soĂ¡t. Hai chá»§ ngá»¯ dĂ¹ng 'are' (sá»‘ nhiá»u)."
      },
      {
        questionId: 'w8t13_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "economic growth" vĂ  "environmental pollution"):\n\n"TÄƒng trÆ°á»Ÿng kinh táº¿ thÆ°á»ng Ä‘i kĂ¨m vá»›i Ă´ nhiá»…m mĂ´i trÆ°á»ng."',
        correctAnswer: 'Economic growth often goes hand in hand with environmental pollution.',
        modelAnswer: 'Economic growth often goes hand in hand with environmental pollution.',
        fallbackKeywords: ['economic growth', 'hand in hand', 'environmental pollution'],
        explanationVi: "'Go hand in hand with' = Ä‘i Ä‘Ă´i vá»›i/gáº¯n liá»n vá»›i â€” thĂ nh ngá»¯ há»c thuáº­t. Chá»§ ngá»¯ lĂ  'Economic growth' (khĂ´ng Ä‘áº¿m Ä‘Æ°á»£c) â†’ Ä‘á»™ng tá»« sá»‘ Ă­t 'goes'."
      },
      {
        questionId: 'w8t13_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "poverty reduction" vĂ  "job creation"):\n\n"Má»™t sá»‘ ngÆ°á»i tin ráº±ng giáº£m nghĂ¨o vĂ  táº¡o viá»‡c lĂ m nĂªn Ä‘Æ°á»£c Æ°u tiĂªn hÆ¡n."',
        correctAnswer: 'Some people believe that poverty reduction and job creation should be prioritized.',
        modelAnswer: 'Some people believe that poverty reduction and job creation should be prioritized.',
        fallbackKeywords: ['poverty reduction', 'job creation', 'prioritized'],
        explanationVi: "'Should be prioritized' = bá»‹ Ä‘á»™ng, nĂªn Ä‘Æ°á»£c Æ°u tiĂªn. 'Poverty reduction' = giáº£m nghĂ¨o, 'job creation' = táº¡o viá»‡c lĂ m â€” danh tá»« hĂ³a tá»« Ä‘á»™ng tá»«."
      },
      {
        questionId: 'w8t13_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "environmental protection"):\n\n"Trong khi Ä‘Ă³, nhá»¯ng ngÆ°á»i khĂ¡c cho ráº±ng báº£o vá»‡ mĂ´i trÆ°á»ng lĂ  Ä‘iá»u cáº§n Ä‘Æ°á»£c Ä‘áº·t lĂªn hĂ ng Ä‘áº§u."',
        correctAnswer: 'Meanwhile, others argue that environmental protection should come first.',
        modelAnswer: 'Meanwhile, others argue that environmental protection should come first.',
        fallbackKeywords: ['environmental protection', 'others argue', 'come first'],
        explanationVi: "'Come first' = Ä‘Æ°á»£c Æ°u tiĂªn/Ä‘áº·t lĂªn hĂ ng Ä‘áº§u. 'Meanwhile' = trong khi Ä‘Ă³ â€” transition word Ä‘á»ƒ Ä‘á»‘i láº­p quan Ä‘iá»ƒm. 'Others argue that' = nhá»¯ng ngÆ°á»i khĂ¡c cho ráº±ng."
      },
      {
        questionId: 'w8t13_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "overexploitation" vĂ  "long-term consequences"):\n\n"Viá»‡c khai thĂ¡c quĂ¡ má»©c tĂ i nguyĂªn thiĂªn nhiĂªn gĂ¢y ra nhá»¯ng háº­u quáº£ lĂ¢u dĂ i cho hĂ nh tinh."',
        correctAnswer: 'The overexploitation of natural resources causes long-term consequences for the planet.',
        modelAnswer: 'The overexploitation of natural resources causes long-term consequences for the planet.',
        fallbackKeywords: ['overexploitation', 'natural resources', 'long-term consequences'],
        explanationVi: "'The overexploitation of + N' = sá»± khai thĂ¡c quĂ¡ má»©c vá». 'Long-term consequences for' = háº­u quáº£ lĂ¢u dĂ i cho. 'Causes' (sá»‘ Ă­t) vĂ¬ chá»§ ngá»¯ lĂ  'overexploitation'."
      },
      {
        questionId: 'w8t13_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "short-term benefits" vĂ  "long-term consequences"):\n\n"Nhiá»u doanh nghiá»‡p chá»‰ quan tĂ¢m Ä‘áº¿n lá»£i Ă­ch ngáº¯n háº¡n mĂ  bá» qua háº­u quáº£ lĂ¢u dĂ i."',
        correctAnswer: 'Many businesses focus only on short-term benefits while ignoring long-term consequences.',
        modelAnswer: 'Many businesses focus only on short-term benefits while ignoring long-term consequences.',
        fallbackKeywords: ['short-term benefits', 'long-term consequences', 'ignoring'],
        explanationVi: "'While + V-ing' = trong khi (Ä‘á»“ng thá»i). 'Focus only on' = chá»‰ táº­p trung vĂ o. 'Short-term' vĂ  'long-term' lĂ  tĂ­nh tá»« ghĂ©p cĂ³ gáº¡ch ná»‘i."
      },
      {
        questionId: 'w8t13_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "balance between economy and environment"):\n\n"Viá»‡c cĂ¢n báº±ng giá»¯a kinh táº¿ vĂ  mĂ´i trÆ°á»ng lĂ  Ä‘iá»u cáº§n thiáº¿t Ä‘á»ƒ phĂ¡t triá»ƒn lĂ¢u dĂ i."',
        correctAnswer: 'Maintaining a balance between economy and environment is essential for long-term development.',
        modelAnswer: 'Maintaining a balance between economy and environment is essential for long-term development.',
        fallbackKeywords: ['balance', 'economy', 'environment', 'essential', 'long-term'],
        explanationVi: "'Maintaining + N + is essential for' = duy trĂ¬ Ä‘iá»u gĂ¬ lĂ  thiáº¿t yáº¿u cho. Chá»§ ngá»¯ lĂ  danh Ä‘á»™ng tá»« 'Maintaining' â†’ Ä‘á»™ng tá»« sá»‘ Ă­t 'is'."
      },
      {
        questionId: 'w8t13_q21', level: 'intermediate', orderIndex: 21,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "environmental awareness"):\n\n"Viá»‡c nĂ¢ng cao nháº­n thá»©c vá» mĂ´i trÆ°á»ng cĂ³ thá»ƒ giĂºp ngÆ°á»i dĂ¢n thay Ä‘á»•i hĂ nh vi tiĂªu dĂ¹ng."',
        correctAnswer: 'Raising environmental awareness can help people change their consumption behaviour.',
        modelAnswer: 'Raising environmental awareness can help people change their consumption behaviour.',
        fallbackKeywords: ['environmental awareness', 'raising', 'consumption behaviour'],
        explanationVi: "'Raising + N + can help + O + V' = nĂ¢ng cao Ä‘iá»u gĂ¬ cĂ³ thá»ƒ giĂºp ai thay Ä‘á»•i. 'Consumption behaviour' = hĂ nh vi tiĂªu dĂ¹ng (BrE: behaviour)."
      }
    ]
  },

  // â”€â”€â”€ BLOCK 5: Week 9-12 â€” Mixed Review â”€â”€â”€
  {
    week: 9, block: 'mixed', orderIndex: 14,
    topicName: 'Public vs. Private Healthcare', topicEmoji: 'đŸ¥',
    essayType: 'advantages_disadvantages',
    prompt: 'Some people think that good health is a basic human right, so medical services should not be run by profit-making companies. Do the disadvantages of private healthcare outweigh the advantages?',
    hintAdvantages: ['high quality care', 'shorter waiting times', 'drives medical innovation'],
    hintDisadvantages: ['unaffordable for low-income patients', 'profit over patient welfare', 'widens healthcare inequality'],
    vocabularyList: [
      { term: 'healthcare system', definitionVi: 'há»‡ thá»‘ng y táº¿', example: 'A well-funded healthcare system benefits the entire population.' },
      { term: 'public healthcare', definitionVi: 'y táº¿ cĂ´ng', example: 'Public healthcare ensures that all citizens receive medical treatment regardless of income.' },
      { term: 'private healthcare', definitionVi: 'y táº¿ tÆ° nhĂ¢n', example: 'Private healthcare often offers shorter waiting times and superior facilities.' },
      { term: 'profit-making companies', definitionVi: 'cĂ¡c cĂ´ng ty vĂ¬ lá»£i nhuáº­n', example: 'Profit-making companies may prioritise revenue over patient welfare.' },
      { term: 'basic human right', definitionVi: 'quyá»n cÆ¡ báº£n cá»§a con ngÆ°á»i', example: 'Access to healthcare is widely regarded as a basic human right.' },
      { term: 'universal healthcare', definitionVi: 'chÄƒm sĂ³c y táº¿ toĂ n dĂ¢n', example: 'Universal healthcare ensures no one is denied treatment due to financial constraints.' },
      { term: 'health insurance', definitionVi: 'báº£o hiá»ƒm y táº¿', example: 'Health insurance plays an important role in reducing the financial burden of illness.' },
      { term: 'medical expenses', definitionVi: 'chi phĂ­ y táº¿', example: 'High medical expenses prevent many people from seeking treatment.' },
      { term: 'healthcare inequality', definitionVi: 'báº¥t bĂ¬nh Ä‘áº³ng y táº¿', example: 'Privatization of healthcare may increase healthcare inequality between the rich and the poor.' },
      { term: 'access to healthcare', definitionVi: 'tiáº¿p cáº­n dá»‹ch vá»¥ y táº¿', example: 'Equal access to healthcare should be guaranteed by the government.' },
      { term: 'financial burden', definitionVi: 'gĂ¡nh náº·ng tĂ i chĂ­nh', example: 'Health insurance reduces the financial burden on individuals and families.' },
      { term: 'affordable healthcare', definitionVi: 'y táº¿ giĂ¡ cáº£ pháº£i chÄƒng', example: 'The government should ensure all citizens have access to affordable healthcare.' },
      { term: 'privatization of healthcare', definitionVi: 'tÆ° nhĂ¢n hĂ³a ngĂ nh y táº¿', example: 'The privatization of healthcare remains a controversial policy in many countries.' },
      { term: 'profit-driven motives', definitionVi: 'Ä‘á»™ng cÆ¡ vĂ¬ lá»£i nhuáº­n', example: 'Profit-driven motives in medicine can compromise ethical standards of care.' },
      { term: 'medical innovation', definitionVi: 'Ä‘á»•i má»›i y táº¿', example: 'Competition in the private sector can stimulate medical innovation.' }
    ],
    questions: [
      {
        questionId: 'w9t14_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Äá» bĂ i há»i "Do the disadvantages of private healthcare outweigh the advantages?" â€” Ä‘iá»u nĂ y cĂ³ nghÄ©a lĂ  gĂ¬?',
        options: [
          'Báº¡n chá»‰ nĂªu nhÆ°á»£c Ä‘iá»ƒm cá»§a y táº¿ tÆ° nhĂ¢n',
          'Báº¡n Ä‘Æ°a ra Ă½ kiáº¿n vá» viá»‡c nhÆ°á»£c Ä‘iá»ƒm cĂ³ lá»›n hÆ¡n Æ°u Ä‘iá»ƒm khĂ´ng',
          'Báº¡n tháº£o luáº­n nguyĂªn nhĂ¢n vĂ  giáº£i phĂ¡p cá»§a váº¥n Ä‘á» y táº¿',
          'Báº¡n chá»‰ nĂªu Æ°u Ä‘iá»ƒm cá»§a y táº¿ tÆ° nhĂ¢n'
        ],
        correctAnswer: 'Báº¡n Ä‘Æ°a ra Ă½ kiáº¿n vá» viá»‡c nhÆ°á»£c Ä‘iá»ƒm cĂ³ lá»›n hÆ¡n Æ°u Ä‘iá»ƒm khĂ´ng',
        explanationVi: '"Outweigh" = vÆ°á»£t trá»™i hÆ¡n. Dáº¡ng nĂ y lĂ  biáº¿n thá»ƒ cá»§a Adv/Disadv, yĂªu cáº§u láº­p luáº­n rĂµ rĂ ng máº·t nĂ o nhiá»u hÆ¡n vĂ  Ä‘Æ°a ra káº¿t luáº­n cĂ¡ nhĂ¢n.'
      },
      {
        questionId: 'w9t14_q02', level: 'beginner', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Äiá»n tá»« cĂ²n thiáº¿u:\n\n"Many people believe that good health is a _____ human right that should not depend on one\'s ability to pay."',
        correctAnswer: 'basic',
        explanationVi: '"Basic human right" = quyá»n cÆ¡ báº£n cá»§a con ngÆ°á»i â€” cá»¥m danh tá»« quan trá»ng trong IELTS chá»§ Ä‘á» y táº¿ vĂ  xĂ£ há»™i.'
      },
      {
        questionId: 'w9t14_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"ChĂ­nh phá»§ nĂªn cung cáº¥p dá»‹ch vá»¥ y táº¿ miá»…n phĂ­ cho táº¥t cáº£ cĂ´ng dĂ¢n."',
        correctAnswer: 'The government should provide free medical treatment for all citizens.',
        modelAnswer: 'The government should provide free medical treatment for all citizens.',
        fallbackKeywords: ['government', 'free medical treatment', 'citizens', 'provide'],
        explanationVi: "'Provide + N + for + N' = cung cáº¥p gĂ¬ cho ai. 'Free medical treatment' = dá»‹ch vá»¥ y táº¿ miá»…n phĂ­. 'All citizens' = táº¥t cáº£ cĂ´ng dĂ¢n."
      },
      {
        questionId: 'w9t14_q04', level: 'beginner', orderIndex: 4,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"CĂ¡c cĂ´ng ty vĂ¬ lá»£i nhuáº­n thÆ°á»ng Ä‘áº·t lá»£i Ă­ch tĂ i chĂ­nh lĂªn trĂªn bá»‡nh nhĂ¢n."',
        correctAnswer: 'Profit-making companies often put financial gain above patient welfare.',
        modelAnswer: 'Profit-making companies often put financial gain above patient welfare.',
        fallbackKeywords: ['profit-making companies', 'financial gain', 'patient welfare'],
        explanationVi: "'Put A above B' = Ä‘áº·t A lĂªn trĂªn B. 'Financial gain' = lá»£i Ă­ch tĂ i chĂ­nh. 'Patient welfare' = sá»©c khá»e/phĂºc lá»£i bá»‡nh nhĂ¢n â€” tá»« vá»±ng há»c thuáº­t quan trá»ng."
      },
      {
        questionId: 'w9t14_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"TÆ° nhĂ¢n hĂ³a ngĂ nh y táº¿ cĂ³ thá»ƒ lĂ m gia tÄƒng báº¥t bĂ¬nh Ä‘áº³ng giá»¯a ngÆ°á»i giĂ u vĂ  ngÆ°á»i nghĂ¨o."',
        correctAnswer: 'Privatization of healthcare may increase healthcare inequality between the rich and the poor.',
        modelAnswer: 'Privatization of healthcare may increase healthcare inequality between the rich and the poor.',
        fallbackKeywords: ['privatization', 'healthcare inequality', 'rich', 'poor'],
        explanationVi: "'Privatization of healthcare' = tÆ° nhĂ¢n hĂ³a ngĂ nh y táº¿. 'May increase' = cĂ³ thá»ƒ lĂ m gia tÄƒng. 'Between the rich and the poor' = giá»¯a ngÆ°á»i giĂ u vĂ  ngÆ°á»i nghĂ¨o."
      },
      {
        questionId: 'w9t14_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Báº£o hiá»ƒm y táº¿ Ä‘Ă³ng vai trĂ² quan trá»ng trong viá»‡c giáº£m gĂ¡nh náº·ng tĂ i chĂ­nh."',
        correctAnswer: 'Health insurance plays an important role in reducing the financial burden.',
        modelAnswer: 'Health insurance plays an important role in reducing the financial burden.',
        fallbackKeywords: ['health insurance', 'financial burden', 'reducing', 'important'],
        explanationVi: "'Play an important role in + V-ing' = Ä‘Ă³ng vai trĂ² quan trá»ng trong viá»‡c. 'Financial burden' = gĂ¡nh náº·ng tĂ i chĂ­nh. Cáº¥u trĂºc nĂ y ráº¥t phá»• biáº¿n trong IELTS."
      },
      {
        questionId: 'w9t14_q07', level: 'elementary', orderIndex: 7,
        type: 'rearrange',
        questionText: 'Sáº¯p xáº¿p thĂ nh cĂ¢u hoĂ n chá»‰nh:\n\n[profit-driven / While / can / private healthcare / motives / medical innovation, / encourage / they / may / also / compromise / patient care / and / medical ethics]',
        correctAnswer: 'While private healthcare can encourage medical innovation, profit-driven motives may also compromise patient care and medical ethics.',
        explanationVi: '"While + clause, + clause" â€” cáº¥u trĂºc Ä‘á»‘i láº­p. "Compromise" = lĂ m áº£nh hÆ°á»Ÿng tiĂªu cá»±c Ä‘áº¿n.'
      },
      {
        questionId: 'w9t14_q08', level: 'elementary', orderIndex: 8,
        type: 'error_correction',
        questionText: 'CĂ¢u sau cĂ³ lá»—i gĂ¬? HĂ£y sá»­a láº¡i:\n\n"The government should ensures that all citizens have access to affordable healthcare."',
        correctAnswer: 'The government should ensure that all citizens have access to affordable healthcare.',
        modelAnswer: 'The government should ensure that all citizens have access to affordable healthcare.',
        fallbackKeywords: ['government', 'ensure', 'affordable healthcare', 'citizens'],
        explanationVi: "Lá»—i: Sau \"should\" dĂ¹ng V nguyĂªn thá»ƒ (bare infinitive). \"Ensures\" â†’ \"ensure\"."
      },
      {
        questionId: 'w9t14_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Má»¥c tiĂªu cuá»‘i cĂ¹ng cá»§a ngĂ nh y táº¿ nĂªn lĂ  thu háº¹p khoáº£ng cĂ¡ch tiáº¿p cáº­n y táº¿, khĂ´ng pháº£i táº¡o ra lá»£i nhuáº­n."',
        correctAnswer: 'The ultimate goal of the healthcare sector should be to close the healthcare access gap, not to generate profit.',
        modelAnswer: 'The ultimate goal of the healthcare sector should be to close the healthcare access gap, not to generate profit.',
        fallbackKeywords: ['healthcare access gap', 'ultimate goal', 'profit', 'generate'],
        explanationVi: "'The ultimate goal' = má»¥c tiĂªu cuá»‘i cĂ¹ng. 'Close the gap' = thu háº¹p khoáº£ng cĂ¡ch. 'Generate profit' = táº¡o ra lá»£i nhuáº­n. Cáº¥u trĂºc 'not to + V' = khĂ´ng pháº£i Ä‘á»ƒ lĂ m gĂ¬."
      },
      {
        questionId: 'w9t14_q10', level: 'intermediate', orderIndex: 10,
        type: 'paraphrase',
        questionText: 'Viáº¿t láº¡i cĂ¢u sau mĂ  khĂ´ng dĂ¹ng: good health, basic human right, medical services, profit-making companies:\n\n"Some people think that good health is a basic human right, so medical services should not be run by profit-making companies."',
        correctAnswer: 'There is a widely held view that access to sound medical care is a fundamental entitlement, and as such, the delivery of such services should not be driven by commercial interests.',
        modelAnswer: 'There is a widely held view that access to sound medical care is a fundamental entitlement, and as such, the delivery of such services should not be driven by commercial interests.',
        fallbackKeywords: ['medical care', 'fundamental entitlement', 'commercial interests', 'delivery', 'services'],
        explanationVi: "Paraphrase: 'basic human right' â†’ 'fundamental entitlement', 'profit-making' â†’ 'commercial interests', 'run by' â†’ 'driven by'. 'As such' = do Ä‘Ă³, vĂ¬ váº­y."
      },
      {
        questionId: 'w9t14_q11', level: 'intermediate', orderIndex: 11,
        type: 'short_writing',
        questionText: 'Viáº¿t 1 Ä‘oáº¡n body paragraph (~80â€“100 tá»«) láº­p luáº­n ráº±ng nhÆ°á»£c Ä‘iá»ƒm cá»§a y táº¿ tÆ° nhĂ¢n VÆ¯á»¢T TRá»˜I hÆ¡n Æ°u Ä‘iá»ƒm.\n\nGá»£i Ă½: healthcare inequality / financial burden / access to healthcare / profit-driven motives / patient care',
        modelAnswer: 'Despite the advantages of private healthcare, such as shorter waiting times and higher-quality equipment, its disadvantages are far more significant. The most critical concern is healthcare inequality: when medical services are run by profit-making companies, access becomes dependent on financial ability rather than medical need. This leaves low-income individuals without essential medical services, widening the gap between the wealthy and the poor. Moreover, profit-driven motives can compromise medical ethics, as providers may recommend unnecessary procedures to maximise revenue. For these reasons, the financial burden placed on ordinary patients makes the disadvantages of private healthcare outweigh its benefits.',
        fallbackKeywords: ['healthcare inequality', 'financial burden', 'profit-driven', 'access', 'medical ethics', 'patient'],
        explanationVi: "Äoáº¡n 'outweigh' pháº£i: nĂªu láº­p trÆ°á»ng rĂµ rĂ ng â†’ lĂ½ do chĂ­nh (profit over patients) â†’ há»‡ quáº£ cá»¥ thá»ƒ (inequality, denied access) â†’ káº¿t luáº­n kháº³ng Ä‘á»‹nh."
      },
      // â”€â”€ QT-4 Intermediate (W9T4) â”€â”€
      {
        questionId: 'w9t14_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "basic human right"):\n\n"Nhiá»u ngÆ°á»i tin ráº±ng sá»©c khá»e tá»‘t lĂ  quyá»n cÆ¡ báº£n cá»§a con ngÆ°á»i."',
        correctAnswer: 'Many people believe that good health is a basic human right.',
        modelAnswer: 'Many people believe that good health is a basic human right.',
        fallbackKeywords: ['basic human right', 'good health', 'believe'],
        explanationVi: "'A basic human right' = quyá»n cÆ¡ báº£n cá»§a con ngÆ°á»i (cĂ³ máº¡o tá»« 'a'). 'Believe that + clause' = tin ráº±ng."
      },
      {
        questionId: 'w9t14_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "free medical treatment"):\n\n"ChĂ­nh phá»§ nĂªn cung cáº¥p dá»‹ch vá»¥ y táº¿ miá»…n phĂ­ cho táº¥t cáº£ cĂ´ng dĂ¢n."',
        correctAnswer: 'The government should provide free medical treatment for all citizens.',
        modelAnswer: 'The government should provide free medical treatment for all citizens.',
        fallbackKeywords: ['free medical treatment', 'government', 'all citizens'],
        explanationVi: "'Provide + N + for + N' = cung cáº¥p Ä‘iá»u gĂ¬ cho ai. 'All citizens' = táº¥t cáº£ cĂ´ng dĂ¢n (khĂ´ng cáº§n 'the')."
      },
      {
        questionId: 'w9t14_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "private healthcare"):\n\n"Má»™t sá»‘ ngÆ°á»i cho ráº±ng ngĂ nh y táº¿ tÆ° nhĂ¢n cĂ³ thá»ƒ mang láº¡i dá»‹ch vá»¥ cháº¥t lÆ°á»£ng cao hÆ¡n."',
        correctAnswer: 'Some people argue that private healthcare can provide higher-quality services.',
        modelAnswer: 'Some people argue that private healthcare can provide higher-quality services.',
        fallbackKeywords: ['private healthcare', 'higher-quality', 'services'],
        explanationVi: "'Higher-quality' lĂ  tĂ­nh tá»« so sĂ¡nh hÆ¡n ghĂ©p vá»›i gáº¡ch ná»‘i. 'Argue that' = láº­p luáº­n ráº±ng (academic hÆ¡n 'think that')."
      },
      {
        questionId: 'w9t14_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "profit-making companies"):\n\n"Tuy nhiĂªn, cĂ¡c cĂ´ng ty vĂ¬ lá»£i nhuáº­n thÆ°á»ng Ä‘áº·t lá»£i Ă­ch tĂ i chĂ­nh lĂªn trĂªn bá»‡nh nhĂ¢n."',
        correctAnswer: 'However, profit-making companies often put financial gain above patient welfare.',
        modelAnswer: 'However, profit-making companies often put financial gain above patient welfare.',
        fallbackKeywords: ['profit-making companies', 'financial gain', 'patient welfare'],
        explanationVi: "'Put A above B' = Ä‘áº·t A lĂªn trĂªn B. 'Financial gain' = lá»£i Ă­ch tĂ i chĂ­nh. 'Patient welfare' = phĂºc lá»£i bá»‡nh nhĂ¢n. 'However' dĂ¹ng dáº¥u pháº©y sau."
      },
      {
        questionId: 'w9t14_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "public healthcare system"):\n\n"Há»‡ thá»‘ng y táº¿ cĂ´ng giĂºp Ä‘áº£m báº£o má»i ngÆ°á»i Ä‘á»u cĂ³ thá»ƒ tiáº¿p cáº­n dá»‹ch vá»¥ y táº¿ cÆ¡ báº£n."',
        correctAnswer: 'The public healthcare system helps ensure that everyone can access basic medical services.',
        modelAnswer: 'The public healthcare system helps ensure that everyone can access basic medical services.',
        fallbackKeywords: ['public healthcare system', 'ensure', 'access', 'basic medical services'],
        explanationVi: "'Helps ensure that' = giĂºp Ä‘áº£m báº£o ráº±ng. 'Can access + N' = cĂ³ thá»ƒ tiáº¿p cáº­n. 'Basic medical services' = dá»‹ch vá»¥ y táº¿ cÆ¡ báº£n."
      },
      {
        questionId: 'w9t14_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "medical expenses"):\n\n"á» nhiá»u quá»‘c gia, chi phĂ­ y táº¿ quĂ¡ cao khiáº¿n ngÆ°á»i nghĂ¨o khĂ´ng thá»ƒ Ä‘iá»u trá»‹ bá»‡nh."',
        correctAnswer: 'In many countries, excessively high medical expenses prevent poor people from receiving treatment.',
        modelAnswer: 'In many countries, excessively high medical expenses prevent poor people from receiving treatment.',
        fallbackKeywords: ['medical expenses', 'high', 'prevent', 'treatment'],
        explanationVi: "'Prevent + O + from + V-ing' = ngÄƒn ai lĂ m gĂ¬. 'Excessively high' = quĂ¡ cao. 'Receiving treatment' = Ä‘Æ°á»£c Ä‘iá»u trá»‹/nháº­n Ä‘iá»u trá»‹."
      },
      {
        questionId: 'w9t14_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "privatization of healthcare"):\n\n"TÆ° nhĂ¢n hĂ³a ngĂ nh y táº¿ cĂ³ thá»ƒ lĂ m gia tÄƒng báº¥t bĂ¬nh Ä‘áº³ng giá»¯a ngÆ°á»i giĂ u vĂ  ngÆ°á»i nghĂ¨o."',
        correctAnswer: 'The privatization of healthcare may increase inequality between the rich and the poor.',
        modelAnswer: 'The privatization of healthcare may increase inequality between the rich and the poor.',
        fallbackKeywords: ['privatization of healthcare', 'inequality', 'rich', 'poor'],
        explanationVi: "'The privatization of + N' = sá»± tÆ° nhĂ¢n hĂ³a cá»§a. 'Between the rich and the poor' = giá»¯a ngÆ°á»i giĂ u vĂ  ngÆ°á»i nghĂ¨o. 'May increase' = cĂ³ thá»ƒ lĂ m tÄƒng."
      },
      {
        questionId: 'w9t14_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "government funding"):\n\n"Há»‡ thá»‘ng y táº¿ cĂ´ng cá»™ng cáº§n nhiá»u Ä‘áº§u tÆ° cá»§a chĂ­nh phá»§ Ä‘á»ƒ duy trĂ¬ hoáº¡t Ä‘á»™ng hiá»‡u quáº£."',
        correctAnswer: 'The public healthcare system requires significant government funding to function effectively.',
        modelAnswer: 'The public healthcare system requires significant government funding to function effectively.',
        fallbackKeywords: ['government funding', 'public healthcare', 'function effectively'],
        explanationVi: "'Require + N + to V' = cáº§n Ä‘iá»u gĂ¬ Ä‘á»ƒ lĂ m gĂ¬. 'Significant government funding' = Ä‘áº§u tÆ° Ä‘Ă¡ng ká»ƒ tá»« chĂ­nh phá»§. 'Function effectively' = hoáº¡t Ä‘á»™ng hiá»‡u quáº£."
      },
      {
        questionId: 'w9t14_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "healthcare infrastructure" vĂ  "life expectancy"):\n\n"Cáº£i thiá»‡n cÆ¡ sá»Ÿ háº¡ táº§ng y táº¿ lĂ  yáº¿u tá»‘ thiáº¿t yáº¿u Ä‘á»ƒ nĂ¢ng cao tuá»•i thá»."',
        correctAnswer: 'Improving healthcare infrastructure is essential to increase life expectancy.',
        modelAnswer: 'Improving healthcare infrastructure is essential to increase life expectancy.',
        fallbackKeywords: ['healthcare infrastructure', 'essential', 'life expectancy'],
        explanationVi: "'Improving + N + is essential to + V' = cáº£i thiá»‡n Ä‘iá»u gĂ¬ lĂ  thiáº¿t yáº¿u Ä‘á»ƒ. 'Life expectancy' = tuá»•i thá» trung bĂ¬nh â€” danh tá»« khĂ´ng Ä‘áº¿m Ä‘Æ°á»£c."
      },
      {
        questionId: 'w9t14_q21', level: 'intermediate', orderIndex: 21,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "affordable healthcare"):\n\n"Äáº£m báº£o dá»‹ch vá»¥ y táº¿ cĂ³ chi phĂ­ há»£p lĂ½ lĂ  cĂ¡ch Ä‘á»ƒ Ä‘áº¡t Ä‘Æ°á»£c cĂ´ng báº±ng xĂ£ há»™i."',
        correctAnswer: 'Ensuring affordable healthcare is a way to achieve social equality.',
        modelAnswer: 'Ensuring affordable healthcare is a way to achieve social equality.',
        fallbackKeywords: ['affordable healthcare', 'social equality', 'ensuring'],
        explanationVi: "'Ensuring + N + is a way to + V' = Ä‘áº£m báº£o Ä‘iá»u gĂ¬ lĂ  cĂ¡ch Ä‘á»ƒ. 'Affordable healthcare' = dá»‹ch vá»¥ y táº¿ cĂ³ giĂ¡ pháº£i chÄƒng. 'Social equality' = bĂ¬nh Ä‘áº³ng xĂ£ há»™i."
      }
    ]
  },
  {
    week: 9, block: 'mixed', orderIndex: 15,
    topicName: 'Consumerism and Society', topicEmoji: 'đŸ›ï¸',
    essayType: 'agree_disagree',
    prompt: 'People today are buying more consumer goods than ever before. Is this a positive or negative development?',
    hintAdvantages: ['stimulates economic growth', 'creates jobs', 'improves living standards and quality of life'],
    hintDisadvantages: ['generates excessive waste', 'depletes natural resources', 'encourages throwaway culture and overconsumption'],
    vocabularyList: [
      { term: 'consumer goods', definitionVi: 'hĂ ng hĂ³a tiĂªu dĂ¹ng', example: 'The demand for consumer goods has surged in recent decades.' },
      { term: 'consumerism', definitionVi: 'chá»§ nghÄ©a tiĂªu dĂ¹ng', example: 'Consumerism drives economic growth but also leads to environmental damage.' },
      { term: 'disposable income', definitionVi: 'thu nháº­p kháº£ dá»¥ng', example: 'Rising disposable income has fuelled consumer spending worldwide.' },
      { term: 'advertising campaigns', definitionVi: 'chiáº¿n dá»‹ch quáº£ng cĂ¡o', example: 'Powerful advertising campaigns persuade people to buy things they do not need.' },
      { term: 'online shopping', definitionVi: 'mua sáº¯m trá»±c tuyáº¿n', example: 'The rise of online shopping has made it easier to purchase goods from around the world.' },
      { term: 'throwaway culture', definitionVi: 'vÄƒn hĂ³a vá»©t bá»', example: 'Mass production has given rise to a throwaway culture of disposable products.' },
      { term: 'overconsumption', definitionVi: 'tiĂªu dĂ¹ng quĂ¡ má»©c', example: 'Overconsumption of resources is one of the main drivers of environmental degradation.' },
      { term: 'environmental impact', definitionVi: 'tĂ¡c Ä‘á»™ng mĂ´i trÆ°á»ng', example: 'The environmental impact of excessive shopping is considerable.' },
      { term: 'waste generation', definitionVi: 'phĂ¡t sinh rĂ¡c tháº£i', example: 'Waste generation has increased dramatically alongside rising consumerism.' },
      { term: 'status symbol', definitionVi: 'biá»ƒu tÆ°á»£ng Ä‘á»‹a vá»‹', example: 'Luxury goods are often purchased as a status symbol rather than for their utility.' },
      { term: 'impulsive buying', definitionVi: 'mua hĂ ng bá»‘c Ä‘á»“ng', example: 'Impulsive buying leads to personal financial debt and unnecessary waste.' },
      { term: 'sustainable consumption', definitionVi: 'tiĂªu dĂ¹ng bá»n vá»¯ng', example: 'Governments should promote sustainable consumption through awareness campaigns.' },
      { term: 'overproduction', definitionVi: 'sáº£n xuáº¥t thá»«a', example: 'Overproduction of cheap goods contributes to landfill and resource depletion.' },
      { term: 'financial debt', definitionVi: 'ná»£ tĂ i chĂ­nh', example: 'Excessive shopping can lead individuals into serious financial debt.' },
      { term: 'quality of life', definitionVi: 'cháº¥t lÆ°á»£ng cuá»™c sá»‘ng', example: 'Access to consumer goods can improve quality of life when used responsibly.' }
    ],
    questions: [
      {
        questionId: 'w9t15_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Äá» bĂ i há»i "Is this a positive or negative development?" â€” Ä‘iá»u nĂ y yĂªu cáº§u gĂ¬?',
        options: [
          'Tháº£o luáº­n cáº£ hai quan Ä‘iá»ƒm mĂ  khĂ´ng cáº§n Ä‘Æ°a ra Ă½ kiáº¿n cĂ¡ nhĂ¢n',
          'ÄÆ°a ra Ă½ kiáº¿n rĂµ rĂ ng ráº±ng Ä‘Ă¢y lĂ  phĂ¡t triá»ƒn tĂ­ch cá»±c, tiĂªu cá»±c, hoáº·c cáº£ hai â€” vĂ  báº£o vá»‡ quan Ä‘iá»ƒm Ä‘Ă³',
          'Chá»‰ nĂªu nguyĂªn nhĂ¢n cá»§a xu hÆ°á»›ng',
          'So sĂ¡nh hai xu hÆ°á»›ng khĂ¡c nhau'
        ],
        correctAnswer: 'ÄÆ°a ra Ă½ kiáº¿n rĂµ rĂ ng ráº±ng Ä‘Ă¢y lĂ  phĂ¡t triá»ƒn tĂ­ch cá»±c, tiĂªu cá»±c, hoáº·c cáº£ hai â€” vĂ  báº£o vá»‡ quan Ä‘iá»ƒm Ä‘Ă³',
        explanationVi: 'Dáº¡ng "positive or negative development" = dáº¡ng Opinion Essay. PHáº¢I Ä‘Æ°a ra láº­p trÆ°á»ng rĂµ rĂ ng ngay tá»« Introduction vĂ  duy trĂ¬ nháº¥t quĂ¡n toĂ n bĂ i.'
      },
      {
        questionId: 'w9t15_q02', level: 'beginner', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Äiá»n tá»« cĂ²n thiáº¿u:\n\n"The rise of _____ shopping has made it easier than ever for people to buy goods from around the world."',
        correctAnswer: 'online',
        explanationVi: '"Online shopping" = mua sáº¯m trá»±c tuyáº¿n â€” tá»« khĂ³a trá»ng tĂ¢m khi bĂ n vá» xu hÆ°á»›ng tiĂªu dĂ¹ng hiá»‡n Ä‘áº¡i.'
      },
      {
        questionId: 'w9t15_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"NgĂ y nay, con ngÆ°á»i mua nhiá»u hĂ ng hĂ³a tiĂªu dĂ¹ng hÆ¡n bao giá» háº¿t."',
        correctAnswer: 'People today are purchasing more consumer goods than ever before.',
        modelAnswer: 'People today are purchasing more consumer goods than ever before.',
        fallbackKeywords: ['consumer goods', 'purchasing', 'ever before'],
        explanationVi: "'More... than ever before' = nhiá»u hÆ¡n bao giá» háº¿t â€” cá»¥m so sĂ¡nh nháº¥n máº¡nh xu hÆ°á»›ng ngĂ y cĂ ng tÄƒng. 'Consumer goods' = hĂ ng hĂ³a tiĂªu dĂ¹ng."
      },
      {
        questionId: 'w9t15_q04', level: 'beginner', orderIndex: 4,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Chiáº¿n dá»‹ch quáº£ng cĂ¡o máº¡nh máº½ khiáº¿n má»i ngÆ°á»i mua nhá»¯ng thá»© há» khĂ´ng thá»±c sá»± cáº§n."',
        correctAnswer: 'Powerful advertising campaigns lead people to buy things they do not actually need.',
        modelAnswer: 'Powerful advertising campaigns lead people to buy things they do not actually need.',
        fallbackKeywords: ['advertising campaigns', 'people', 'need', 'buy'],
        explanationVi: "'Lead + O + to V' = khiáº¿n ai lĂ m gĂ¬ (causative). 'Do not actually need' = khĂ´ng thá»±c sá»± cáº§n. 'Advertising campaigns' = chiáº¿n dá»‹ch quáº£ng cĂ¡o."
      },
      {
        questionId: 'w9t15_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Nhiá»u sáº£n pháº©m Ä‘Æ°á»£c sáº£n xuáº¥t hĂ ng loáº¡t, táº¡o nĂªn vÄƒn hĂ³a vá»©t bá»."',
        correctAnswer: 'Many products are mass-produced, giving rise to a throwaway culture.',
        modelAnswer: 'Many products are mass-produced, giving rise to a throwaway culture.',
        fallbackKeywords: ['mass-produced', 'throwaway culture', 'products'],
        explanationVi: "'Mass-produced' = Ä‘Æ°á»£c sáº£n xuáº¥t hĂ ng loáº¡t (adjective). 'Give rise to' = táº¡o ra, dáº«n Ä‘áº¿n. 'Throwaway culture' = vÄƒn hĂ³a vá»©t bá» â€” tá»« vá»±ng há»c thuáº­t quan trá»ng."
      },
      {
        questionId: 'w9t15_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Viá»‡c mua hĂ ng bá»‘c Ä‘á»“ng dáº«n Ä‘áº¿n ná»£ tĂ i chĂ­nh cĂ¡ nhĂ¢n."',
        correctAnswer: 'Impulsive buying leads to personal financial debt.',
        modelAnswer: 'Impulsive buying leads to personal financial debt.',
        fallbackKeywords: ['impulsive buying', 'financial debt', 'personal'],
        explanationVi: "'Impulsive buying' = mua hĂ ng bá»‘c Ä‘á»“ng (khĂ´ng cĂ³ káº¿ hoáº¡ch). 'Lead to + N' = dáº«n Ä‘áº¿n. 'Financial debt' = ná»£ tĂ i chĂ­nh."
      },
      {
        questionId: 'w9t15_q07', level: 'elementary', orderIndex: 7,
        type: 'rearrange',
        questionText: 'Sáº¯p xáº¿p thĂ nh cĂ¢u hoĂ n chá»‰nh:\n\n[a throwaway culture / Mass production / and / has / consumerism / of / encouraged / overconsumption, / leading / and / environmental damage / to / significant]',
        correctAnswer: 'Mass production and consumerism has encouraged a throwaway culture of overconsumption, leading to significant environmental damage.',
        explanationVi: '"Leading to + noun" = dáº«n Ä‘áº¿n â€” cá»¥m phá»• biáº¿n trong IELTS. "Throwaway culture of overconsumption" = vÄƒn hĂ³a tiĂªu thá»¥ vá»©t bá».'
      },
      {
        questionId: 'w9t15_q08', level: 'elementary', orderIndex: 8,
        type: 'error_correction',
        questionText: 'CĂ¢u sau cĂ³ lá»—i gĂ¬? HĂ£y sá»­a láº¡i:\n\n"Although buying more goods can stimulate the economy, but it also creates enormous amounts of waste."',
        correctAnswer: 'Although buying more goods can stimulate the economy, it also creates enormous amounts of waste.',
        modelAnswer: 'Although buying more goods can stimulate the economy, it also creates enormous amounts of waste.',
        fallbackKeywords: ['although', 'stimulate', 'economy', 'waste', 'enormous'],
        explanationVi: "Lá»—i: KhĂ´ng dĂ¹ng \"Although\" vĂ  \"but\" cĂ¹ng lĂºc. DĂ¹ng má»™t trong hai: \"Although...\" hoáº·c \"..., but...\""
      },
      {
        questionId: 'w9t15_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"ChĂ­nh phá»§ nĂªn khuyáº¿n khĂ­ch tiĂªu dĂ¹ng bá»n vá»¯ng thĂ´ng qua cĂ¡c chiáº¿n dá»‹ch nĂ¢ng cao nháº­n thá»©c."',
        correctAnswer: 'The government should encourage sustainable consumption through awareness-raising campaigns.',
        modelAnswer: 'The government should encourage sustainable consumption through awareness-raising campaigns.',
        fallbackKeywords: ['sustainable consumption', 'government', 'awareness-raising', 'campaigns'],
        explanationVi: "'Sustainable consumption' = tiĂªu dĂ¹ng bá»n vá»¯ng. 'Awareness-raising campaigns' = chiáº¿n dá»‹ch nĂ¢ng cao nháº­n thá»©c (compound adjective). 'Through' = thĂ´ng qua."
      },
      {
        questionId: 'w9t15_q10', level: 'intermediate', orderIndex: 10,
        type: 'paraphrase',
        questionText: 'Viáº¿t láº¡i cĂ¢u sau mĂ  khĂ´ng dĂ¹ng: people, buying, consumer goods, positive or negative:\n\n"People today are buying more consumer goods than ever before. Is this a positive or negative development?"',
        correctAnswer: 'Contemporary society is witnessing an unprecedented surge in the consumption of manufactured products. Whether this trend represents a beneficial or detrimental shift in human behaviour is a matter of considerable debate.',
        modelAnswer: 'Contemporary society is witnessing an unprecedented surge in the consumption of manufactured products. Whether this trend represents a beneficial or detrimental shift in human behaviour is a matter of considerable debate.',
        fallbackKeywords: ['contemporary society', 'manufactured products', 'beneficial', 'detrimental', 'consumption'],
        explanationVi: "Paraphrase má»Ÿ bĂ i: 'people today' â†’ 'contemporary society', 'more than ever before' â†’ 'unprecedented surge', 'positive or negative' â†’ 'beneficial or detrimental'. TĂ¡ch thĂ nh 2 cĂ¢u."
      },
      {
        questionId: 'w9t15_q11', level: 'intermediate', orderIndex: 11,
        type: 'short_writing',
        questionText: 'Viáº¿t 1 Ä‘oáº¡n body paragraph (~80â€“100 tá»«) láº­p luáº­n ráº±ng viá»‡c mua sáº¯m quĂ¡ nhiá»u lĂ  má»™t xu hÆ°á»›ng TIĂU Cá»°C.\n\nGá»£i Ă½: throwaway culture / overconsumption / environmental impact / waste generation / sustainable consumption',
        modelAnswer: 'The rapid growth of consumerism is largely a negative development, primarily due to its devastating environmental impact. Mass production to meet ever-increasing demand contributes to overconsumption, generating enormous quantities of waste that overwhelm landfills and pollute natural ecosystems. The throwaway culture encouraged by affordable, disposable goods means that products are discarded long before the end of their useful life, further depleting natural resources. Moreover, impulsive buying fuelled by aggressive marketing strategies leads to personal financial debt. Unless governments actively promote sustainable consumption through stricter regulations and public awareness campaigns, this trend will continue to erode environmental sustainability.',
        fallbackKeywords: ['overconsumption', 'environmental impact', 'waste', 'throwaway culture', 'sustainable consumption', 'consumerism'],
        explanationVi: "Opinion essay cáº§n: láº­p trÆ°á»ng rĂµ rĂ ng â†’ lĂ½ do chĂ­nh (environmental impact) â†’ vĂ­ dá»¥ (mass production, advertising) â†’ káº¿t luáº­n kĂªu gá»i hĂ nh Ä‘á»™ng."
      },
      // â”€â”€ QT-4 Intermediate (W9T5) â”€â”€
      {
        questionId: 'w9t15_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "consumer goods"):\n\n"NgĂ y nay, con ngÆ°á»i mua nhiá»u hĂ ng hĂ³a tiĂªu dĂ¹ng hÆ¡n bao giá» háº¿t."',
        correctAnswer: 'People today are purchasing more consumer goods than ever before.',
        modelAnswer: 'People today are purchasing more consumer goods than ever before.',
        fallbackKeywords: ['consumer goods', 'purchasing', 'more than ever'],
        explanationVi: "'More than ever before' = hÆ¡n bao giá» háº¿t. 'Are purchasing' nháº¥n máº¡nh xu hÆ°á»›ng hiá»‡n táº¡i. 'Consumer goods' = hĂ ng hĂ³a tiĂªu dĂ¹ng."
      },
      {
        questionId: 'w9t15_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "disposable income"):\n\n"Má»©c sá»‘ng Ä‘Æ°á»£c cáº£i thiá»‡n dáº«n Ä‘áº¿n thu nháº­p kháº£ dá»¥ng cao hÆ¡n."',
        correctAnswer: 'An improved standard of living leads to higher disposable income.',
        modelAnswer: 'An improved standard of living leads to higher disposable income.',
        fallbackKeywords: ['disposable income', 'standard of living', 'improved'],
        explanationVi: "'Lead to + N' = dáº«n Ä‘áº¿n. 'An improved standard of living' = má»©c sá»‘ng Ä‘Æ°á»£c cáº£i thiá»‡n (dĂ¹ng 'An' vĂ¬ 'improved' báº¯t Ä‘áº§u báº±ng nguyĂªn Ă¢m). 'Disposable income' = thu nháº­p kháº£ dá»¥ng."
      },
      {
        questionId: 'w9t15_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "advertising campaigns"):\n\n"Chiáº¿n dá»‹ch quáº£ng cĂ¡o máº¡nh máº½ khiáº¿n má»i ngÆ°á»i mua nhá»¯ng thá»© há» khĂ´ng thá»±c sá»± cáº§n."',
        correctAnswer: 'Powerful advertising campaigns lead people to buy things they do not actually need.',
        modelAnswer: 'Powerful advertising campaigns lead people to buy things they do not actually need.',
        fallbackKeywords: ['advertising campaigns', 'powerful', 'do not need'],
        explanationVi: "'Lead + O + to V' = khiáº¿n ai lĂ m gĂ¬. 'Do not actually need' = khĂ´ng thá»±c sá»± cáº§n. 'Powerful advertising campaigns' = chiáº¿n dá»‹ch quáº£ng cĂ¡o máº¡nh máº½."
      },
      {
        questionId: 'w9t15_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "online shopping"):\n\n"Mua sáº¯m trá»±c tuyáº¿n giĂºp viá»‡c tiĂªu dĂ¹ng trá»Ÿ nĂªn dá»… dĂ ng vĂ  nhanh chĂ³ng hÆ¡n."',
        correctAnswer: 'Online shopping makes consumption easier and faster than ever.',
        modelAnswer: 'Online shopping makes consumption easier and faster than ever.',
        fallbackKeywords: ['online shopping', 'consumption', 'easier', 'faster'],
        explanationVi: "'Make + N + adjective' = khiáº¿n Ä‘iá»u gĂ¬ trá»Ÿ nĂªn... Hai tĂ­nh tá»« so sĂ¡nh 'easier and faster' song song. 'Than ever' = hÆ¡n bao giá» háº¿t."
      },
      {
        questionId: 'w9t15_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "overconsumption" vĂ  "environmental impact"):\n\n"Tuy nhiĂªn, tiĂªu thá»¥ quĂ¡ má»©c cĂ³ thá»ƒ gĂ¢y ra nhiá»u tĂ¡c Ä‘á»™ng tiĂªu cá»±c Ä‘áº¿n mĂ´i trÆ°á»ng."',
        correctAnswer: 'However, overconsumption can cause significant negative environmental impact.',
        modelAnswer: 'However, overconsumption can cause significant negative environmental impact.',
        fallbackKeywords: ['overconsumption', 'environmental impact', 'negative'],
        explanationVi: "'Cause + N' = gĂ¢y ra. 'Significant negative environmental impact' = tĂ¡c Ä‘á»™ng tiĂªu cá»±c Ä‘Ă¡ng ká»ƒ Ä‘áº¿n mĂ´i trÆ°á»ng. Thá»© tá»± tĂ­nh tá»«: opinion â†’ purpose noun."
      },
      {
        questionId: 'w9t15_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "mass production" vĂ  "throwaway culture"):\n\n"Nhiá»u sáº£n pháº©m Ä‘Æ°á»£c sáº£n xuáº¥t hĂ ng loáº¡t, táº¡o nĂªn vÄƒn hĂ³a vá»©t bá»."',
        correctAnswer: 'Many products are mass-produced, giving rise to a throwaway culture.',
        modelAnswer: 'Many products are mass-produced, giving rise to a throwaway culture.',
        fallbackKeywords: ['mass production', 'throwaway culture', 'giving rise to'],
        explanationVi: "'Are mass-produced' = bá»‹ Ä‘á»™ng. 'Giving rise to' = táº¡o ra/dáº«n Ä‘áº¿n (participial phrase). 'Throwaway culture' = vÄƒn hĂ³a tiĂªu dĂ¹ng má»™t láº§n rá»“i bá»."
      },
      {
        questionId: 'w9t15_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "impulsive buying" vĂ  "financial debt"):\n\n"Viá»‡c mua hĂ ng bá»‘c Ä‘á»“ng dáº«n Ä‘áº¿n ná»£ tĂ i chĂ­nh cĂ¡ nhĂ¢n."',
        correctAnswer: 'Impulsive buying leads to personal financial debt.',
        modelAnswer: 'Impulsive buying leads to personal financial debt.',
        fallbackKeywords: ['impulsive buying', 'financial debt', 'personal'],
        explanationVi: "'Lead to + N' = dáº«n Ä‘áº¿n. 'Impulsive buying' = hĂ nh vi mua hĂ ng bá»‘c Ä‘á»“ng. 'Personal financial debt' = ná»£ tĂ i chĂ­nh cĂ¡ nhĂ¢n."
      },
      {
        questionId: 'w9t15_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "economic inequality"):\n\n"Tuy nhiĂªn, viá»‡c tiĂªu dĂ¹ng quĂ¡ má»©c lĂ m gia tÄƒng báº¥t bĂ¬nh Ä‘áº³ng kinh táº¿ giá»¯a ngÆ°á»i giĂ u vĂ  ngÆ°á»i nghĂ¨o."',
        correctAnswer: 'However, overconsumption widens economic inequality between the rich and the poor.',
        modelAnswer: 'However, overconsumption widens economic inequality between the rich and the poor.',
        fallbackKeywords: ['economic inequality', 'overconsumption', 'widens'],
        explanationVi: "'Widens + N' = lĂ m rá»™ng thĂªm/gia tÄƒng (gap/inequality thÆ°á»ng Ä‘i vá»›i 'widen'). 'Between the rich and the poor' = giá»¯a ngÆ°á»i giĂ u vĂ  ngÆ°á»i nghĂ¨o."
      },
      {
        questionId: 'w9t15_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "recycling programs" vĂ  "second-hand goods"):\n\n"Äá»ƒ giáº£m lĂ£ng phĂ­, má»i ngÆ°á»i nĂªn tham gia chÆ°Æ¡ng trĂ¬nh tĂ¡i cháº¿ hoáº·c mua hĂ ng Ä‘Ă£ qua sá»­ dá»¥ng."',
        correctAnswer: 'To reduce waste, people should participate in recycling programs or purchase second-hand goods.',
        modelAnswer: 'To reduce waste, people should participate in recycling programs or purchase second-hand goods.',
        fallbackKeywords: ['recycling programs', 'second-hand goods', 'reduce waste'],
        explanationVi: "'To reduce waste' = infinitive of purpose Ä‘á»©ng Ä‘áº§u cĂ¢u. 'Participate in' = tham gia. 'Second-hand goods' = hĂ ng Ä‘Ă£ qua sá»­ dá»¥ng (cĂ³ gáº¡ch ná»‘i)."
      },
      {
        questionId: 'w9t15_q21', level: 'intermediate', orderIndex: 21,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "waste generation"):\n\n"Náº¿u xu hÆ°á»›ng tiĂªu dĂ¹ng tiáº¿p tá»¥c tÄƒng, lÆ°á»£ng rĂ¡c tháº£i toĂ n cáº§u sáº½ vÆ°á»£t kiá»ƒm soĂ¡t."',
        correctAnswer: 'If consumption trends continue to rise, global waste generation will spiral out of control.',
        modelAnswer: 'If consumption trends continue to rise, global waste generation will spiral out of control.',
        fallbackKeywords: ['waste generation', 'consumption trends', 'spiral out of control'],
        explanationVi: "'Spiral out of control' = máº¥t kiá»ƒm soĂ¡t/vÆ°á»£t táº§m kiá»ƒm soĂ¡t (idiom há»c thuáº­t). CĂ¢u Ä‘iá»u kiá»‡n loáº¡i 1: If + present, will + V."
      }
    ]
  },
  {
    week: 10, block: 'mixed', orderIndex: 16,
    topicName: 'Government Funding for the Arts', topicEmoji: 'đŸ¨',
    essayType: 'discuss_both_views',
    prompt: 'Some people believe that the government should spend money on supporting the arts, while others think it should be spent on more important things. Discuss both views and give your own opinion.',
    hintAdvantages: [],
    hintDisadvantages: [],
    vocabularyList: [
      { term: 'government funding', definitionVi: 'tĂ i trá»£ cá»§a chĂ­nh phá»§', example: 'Government funding for the arts supports cultural development.' },
      { term: 'allocate budget', definitionVi: 'phĂ¢n bá»• ngĂ¢n sĂ¡ch', example: 'The government must allocate its budget wisely to meet all social needs.' },
      { term: 'public money', definitionVi: 'tiá»n thuáº¿ cĂ´ng', example: 'Critics argue that public money should be spent on essential services.' },
      { term: 'essential services', definitionVi: 'dá»‹ch vá»¥ thiáº¿t yáº¿u', example: 'Healthcare and education are among the most essential services.' },
      { term: 'taxpayers', definitionVi: 'ngÆ°á»i Ä‘Ă³ng thuáº¿', example: 'Taxpayers expect their money to be invested in practical needs.' },
      { term: 'cultural identity', definitionVi: 'báº£n sáº¯c vÄƒn hĂ³a', example: 'The arts play a vital role in maintaining cultural identity.' },
      { term: 'preserve heritage', definitionVi: 'báº£o tá»“n di sáº£n', example: 'Governments have a duty to preserve heritage for future generations.' },
      { term: 'performing arts', definitionVi: 'nghá»‡ thuáº­t biá»ƒu diá»…n', example: 'Performing arts such as theatre and dance enrich community life.' },
      { term: 'national pride', definitionVi: 'niá»m tá»± hĂ o dĂ¢n tá»™c', example: 'Thriving arts industries can foster national pride.' },
      { term: 'social cohesion', definitionVi: 'sá»± gáº¯n káº¿t xĂ£ há»™i', example: 'Arts and culture strengthen social cohesion within communities.' },
      { term: 'stimulate creativity', definitionVi: 'kĂ­ch thĂ­ch sĂ¡ng táº¡o', example: 'Investment in the arts can stimulate creativity across other sectors.' },
      { term: 'boost tourism', definitionVi: 'thĂºc Ä‘áº©y du lá»‹ch', example: 'Art exhibitions and museums boost tourism and generate revenue.' },
      { term: 'economic benefits', definitionVi: 'lá»£i Ă­ch kinh táº¿', example: 'Cultural investment can bring significant economic benefits to a country.' },
      { term: 'investment in the arts', definitionVi: 'Ä‘áº§u tÆ° vĂ o nghá»‡ thuáº­t', example: 'Investment in the arts generates returns both culturally and economically.' },
      { term: 'enrich peoples lives', definitionVi: 'lĂ m phong phĂº Ä‘á»i sá»‘ng con ngÆ°á»i', example: 'The arts enrich peoples lives and promote well-being.' }
    ],
    questions: [
      {
        questionId: 'w10t16_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Äá» bĂ i cĂ³ "Discuss both views and give your own opinion." Ă kiáº¿n cĂ¡ nhĂ¢n nĂªn xuáº¥t hiá»‡n á»Ÿ Ä‘Ă¢u trong bĂ i essay?',
        options: [
          'Chá»‰ á»Ÿ káº¿t luáº­n',
          'á» Thesis Statement (cuá»‘i Introduction) VĂ€ nháº¯c láº¡i trong káº¿t luáº­n',
          'Chá»‰ á»Ÿ Ä‘áº§u bĂ i, trÆ°á»›c pháº§n trĂ¬nh bĂ y',
          'á» giá»¯a má»—i body paragraph'
        ],
        correctAnswer: 'á» Thesis Statement (cuá»‘i Introduction) VĂ€ nháº¯c láº¡i trong káº¿t luáº­n',
        explanationVi: 'Dáº¡ng Discuss Both Views: nĂªu Ă½ kiáº¿n cĂ¡ nhĂ¢n trong Thesis Statement vĂ  nháº¥t quĂ¡n Ä‘áº¿n káº¿t luáº­n. Má»™t sá»‘ bĂ i xuáº¥t sáº¯c cĂ²n dáº«n dáº¯t Ă½ kiáº¿n vĂ o cáº£ body paragraphs.'
      },
      {
        questionId: 'w10t16_q02', level: 'beginner', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Äiá»n tá»« cĂ²n thiáº¿u:\n\n"The government has a responsibility to _____ its budget wisely, ensuring that both cultural and essential services receive adequate support."',
        correctAnswer: 'allocate',
        explanationVi: '"Allocate budget" = phĂ¢n bá»• ngĂ¢n sĂ¡ch â€” Ä‘á»™ng tá»« quan trá»ng khi bĂ n vá» chi tiĂªu cá»§a chĂ­nh phá»§.'
      },
      {
        questionId: 'w10t16_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Má»™t sá»‘ ngÆ°á»i cho ráº±ng chĂ­nh phá»§ nĂªn chi tiá»n Ä‘á»ƒ há»— trá»£ nghá»‡ thuáº­t."',
        correctAnswer: 'Some people argue that the government should provide funding to support the arts.',
        modelAnswer: 'Some people argue that the government should provide funding to support the arts.',
        fallbackKeywords: ['government funding', 'arts', 'support', 'argue'],
        explanationVi: "'Provide funding to support' = cung cáº¥p tĂ i trá»£ Ä‘á»ƒ há»— trá»£. 'Some people argue that' = cáº¥u trĂºc chuáº©n khi trĂ¬nh bĂ y má»™t quan Ä‘iá»ƒm."
      },
      {
        questionId: 'w10t16_q04', level: 'beginner', orderIndex: 4,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"CĂ¡c dá»‹ch vá»¥ thiáº¿t yáº¿u nhÆ° bá»‡nh viá»‡n vĂ  trÆ°á»ng há»c cáº§n Ä‘Æ°á»£c Æ°u tiĂªn hÆ¡n."',
        correctAnswer: 'Essential services such as hospitals and schools need to be prioritized.',
        modelAnswer: 'Essential services such as hospitals and schools need to be prioritized.',
        fallbackKeywords: ['essential services', 'hospitals', 'schools', 'prioritized'],
        explanationVi: "'Such as + examples' = vĂ­ dá»¥ nhÆ°. 'Need to be prioritized' = cáº§n Ä‘Æ°á»£c Æ°u tiĂªn (passive). 'Essential services' = dá»‹ch vá»¥ thiáº¿t yáº¿u."
      },
      {
        questionId: 'w10t16_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Má»™t sá»‘ ngÆ°á»i cho ráº±ng nghá»‡ thuáº­t giĂºp duy trĂ¬ báº£n sáº¯c vÄƒn hĂ³a vĂ  truyá»n thá»‘ng dĂ¢n tá»™c."',
        correctAnswer: 'Some people argue that the arts help maintain cultural identity and national traditions.',
        modelAnswer: 'Some people argue that the arts help maintain cultural identity and national traditions.',
        fallbackKeywords: ['cultural identity', 'national traditions', 'arts', 'maintain'],
        explanationVi: "'Help + V' = giĂºp lĂ m gĂ¬. 'Cultural identity' = báº£n sáº¯c vÄƒn hĂ³a. 'National traditions' = truyá»n thá»‘ng dĂ¢n tá»™c."
      },
      {
        questionId: 'w10t16_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Viá»‡c Ä‘áº§u tÆ° vĂ o nghá»‡ thuáº­t cĂ³ thá»ƒ kĂ­ch thĂ­ch sá»± sĂ¡ng táº¡o trong xĂ£ há»™i."',
        correctAnswer: 'Investment in the arts can stimulate creativity across society.',
        modelAnswer: 'Investment in the arts can stimulate creativity across society.',
        fallbackKeywords: ['investment', 'arts', 'stimulate creativity', 'society'],
        explanationVi: "'Investment in + N' = Ä‘áº§u tÆ° vĂ o. 'Stimulate creativity' = kĂ­ch thĂ­ch sĂ¡ng táº¡o. 'Across society' = trong toĂ n xĂ£ há»™i."
      },
      {
        questionId: 'w10t16_q07', level: 'elementary', orderIndex: 7,
        type: 'rearrange',
        questionText: 'Sáº¯p xáº¿p thĂ nh cĂ¢u hoĂ n chá»‰nh:\n\n[government / Although / the arts / supports / the / funding / cultural development, / argue / critics / that / public money / on / better spent / is / essential services]',
        correctAnswer: 'Although the government supports cultural development through arts funding, critics argue that public money is better spent on essential services.',
        explanationVi: '"Although + clause, + clause" â€” Ä‘á»‘i láº­p hai quan Ä‘iá»ƒm. "Better spent on" = Ä‘Æ°á»£c chi tiĂªu tá»‘t hÆ¡n cho.'
      },
      {
        questionId: 'w10t16_q08', level: 'elementary', orderIndex: 8,
        type: 'error_correction',
        questionText: 'CĂ¢u sau cĂ³ lá»—i gĂ¬? HĂ£y sá»­a láº¡i:\n\n"Art exhibitions and performing arts can boost tourism and bring economic benefit to a country."',
        correctAnswer: 'Art exhibitions and performing arts can boost tourism and bring significant economic benefits to a country.',
        modelAnswer: 'Art exhibitions and performing arts can boost tourism and bring significant economic benefits to a country.',
        fallbackKeywords: ['art exhibitions', 'performing arts', 'tourism', 'economic benefits'],
        explanationVi: 'Lá»—i: "economic benefit" sau "bring" cáº§n sá»‘ nhiá»u: "economic benefits". ThĂªm "significant" Ä‘á»ƒ cĂ¢u há»c thuáº­t hÆ¡n.'
      },
      {
        questionId: 'w10t16_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Nghá»‡ thuáº­t cĂ³ thá»ƒ giĂºp tÄƒng cÆ°á»ng sá»± gáº¯n káº¿t xĂ£ há»™i vĂ  niá»m tá»± hĂ o dĂ¢n tá»™c."',
        correctAnswer: 'The arts can help strengthen social cohesion and foster national pride.',
        modelAnswer: 'The arts can help strengthen social cohesion and foster national pride.',
        fallbackKeywords: ['social cohesion', 'national pride', 'arts', 'strengthen'],
        explanationVi: "'Strengthen social cohesion' = tÄƒng cÆ°á»ng sá»± gáº¯n káº¿t xĂ£ há»™i. 'Foster national pride' = nuĂ´i dÆ°á»¡ng niá»m tá»± hĂ o dĂ¢n tá»™c. 'Foster' = formal synonym for 'develop/encourage'."
      },
      {
        questionId: 'w10t16_q10', level: 'intermediate', orderIndex: 10,
        type: 'paraphrase',
        questionText: 'Viáº¿t láº¡i cĂ¢u sau mĂ  khĂ´ng dĂ¹ng: government, spend money, supporting the arts, more important things:\n\n"Some people believe that the government should spend money on supporting the arts, while others think it should be spent on more important things."',
        correctAnswer: 'There is considerable disagreement over whether public funds should be directed towards cultural and artistic endeavours, or whether such resources would be of greater benefit if invested in higher-priority sectors of society.',
        modelAnswer: 'There is considerable disagreement over whether public funds should be directed towards cultural and artistic endeavours, or whether such resources would be of greater benefit if invested in higher-priority sectors of society.',
        fallbackKeywords: ['public funds', 'cultural', 'artistic endeavours', 'higher-priority', 'sectors'],
        explanationVi: "Paraphrase: 'government' â†’ 'public funds', 'spend money on arts' â†’ 'directed towards cultural endeavours', 'more important things' â†’ 'higher-priority sectors'."
      },
      {
        questionId: 'w10t16_q11', level: 'intermediate', orderIndex: 11,
        type: 'short_writing',
        questionText: 'Viáº¿t 1 Ä‘oáº¡n body paragraph (~80â€“100 tá»«) láº­p luáº­n ráº±ng chĂ­nh phá»§ NĂN tĂ i trá»£ cho nghá»‡ thuáº­t.\n\nGá»£i Ă½: cultural identity / social cohesion / boost tourism / economic benefits / preserve heritage / artistic expression',
        modelAnswer: 'Proponents of government funding for the arts argue that cultural investment yields both social and economic benefits that extend far beyond artistic expression. The arts play a vital role in preserving cultural heritage and strengthening national identity, fostering a sense of social cohesion that binds communities together. Furthermore, thriving arts industries attract tourists, boost local economies, and stimulate creativity across other sectors. Countries such as France and South Korea, which allocate significant portions of their national budgets to cultural development, demonstrate that investment in the arts generates considerable economic returns while enriching the lives of citizens at every level of society.',
        fallbackKeywords: ['cultural heritage', 'social cohesion', 'economic benefits', 'tourism', 'government funding', 'arts'],
        explanationVi: "Cáº¥u trĂºc PEEL: topic sentence (View 1) â†’ explanation (social + economic benefits) â†’ example (France, South Korea) â†’ conclusion."
      },
      // â”€â”€ QT-4 Intermediate (W9T6) â”€â”€
      {
        questionId: 'w10t16_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "government funding" vĂ  "support the arts"):\n\n"Má»™t sá»‘ ngÆ°á»i cho ráº±ng chĂ­nh phá»§ nĂªn chi tiá»n Ä‘á»ƒ há»— trá»£ nghá»‡ thuáº­t."',
        correctAnswer: 'Some people argue that the government should provide funding to support the arts.',
        modelAnswer: 'Some people argue that the government should provide funding to support the arts.',
        fallbackKeywords: ['government funding', 'support the arts', 'provide'],
        explanationVi: "'Provide funding to + V' = cung cáº¥p ngĂ¢n sĂ¡ch Ä‘á»ƒ. 'The arts' (cĂ³ máº¡o tá»« 'the') = nghá»‡ thuáº­t nĂ³i chung. 'Argue that' = cho ráº±ng/láº­p luáº­n ráº±ng."
      },
      {
        questionId: 'w10t16_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "healthcare" vĂ  "education"):\n\n"Nhá»¯ng ngÆ°á»i khĂ¡c tin ráº±ng ngĂ¢n sĂ¡ch nĂ y nĂªn Ä‘Æ°á»£c dĂ¹ng cho cĂ¡c lÄ©nh vá»±c quan trá»ng hÆ¡n nhÆ° y táº¿ hoáº·c giĂ¡o dá»¥c."',
        correctAnswer: 'Others believe that this budget should be spent on more important areas such as healthcare or education.',
        modelAnswer: 'Others believe that this budget should be spent on more important areas such as healthcare or education.',
        fallbackKeywords: ['healthcare', 'education', 'budget', 'more important'],
        explanationVi: "'Should be spent on' = bá»‹ Ä‘á»™ng, nĂªn Ä‘Æ°á»£c chi vĂ o. 'Such as' = cháº³ng háº¡n nhÆ°. 'More important areas' = cĂ¡c lÄ©nh vá»±c quan trá»ng hÆ¡n."
      },
      {
        questionId: 'w10t16_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "public money" vĂ  "taxpayers"):\n\n"Tiá»n cĂ´ng tá»« ngÆ°á»i ná»™p thuáº¿ nĂªn Ä‘Æ°á»£c sá»­ dá»¥ng má»™t cĂ¡ch khĂ´n ngoan."',
        correctAnswer: 'Public money from taxpayers should be used wisely.',
        modelAnswer: 'Public money from taxpayers should be used wisely.',
        fallbackKeywords: ['public money', 'taxpayers', 'wisely'],
        explanationVi: "'Should be used + adverb' = bá»‹ Ä‘á»™ng + tráº¡ng tá»«. 'Wisely' = má»™t cĂ¡ch khĂ´n ngoan. 'Public money from taxpayers' = tiá»n cĂ´ng tá»« ngÆ°á»i ná»™p thuáº¿."
      },
      {
        questionId: 'w10t16_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "cultural identity" vĂ  "preserve heritage"):\n\n"Má»™t sá»‘ ngÆ°á»i cho ráº±ng nghá»‡ thuáº­t giĂºp duy trĂ¬ báº£n sáº¯c vÄƒn hĂ³a vĂ  truyá»n thá»‘ng dĂ¢n tá»™c."',
        correctAnswer: 'Some people argue that the arts help maintain cultural identity and preserve national heritage.',
        modelAnswer: 'Some people argue that the arts help maintain cultural identity and preserve national heritage.',
        fallbackKeywords: ['cultural identity', 'preserve heritage', 'national traditions'],
        explanationVi: "'Help + V (bare infinitive)' = giĂºp lĂ m gĂ¬ (khĂ´ng cáº§n 'to'). 'Maintain' vĂ  'preserve' lĂ  hai Ä‘á»™ng tá»« song song. 'National heritage' = di sáº£n vÄƒn hĂ³a dĂ¢n tá»™c."
      },
      {
        questionId: 'w10t16_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "art exhibitions", "performing arts", vĂ  "economic benefits"):\n\n"CĂ¡c triá»ƒn lĂ£m nghá»‡ thuáº­t vĂ  biá»ƒu diá»…n cĂ³ thá»ƒ thu hĂºt khĂ¡ch du lá»‹ch vĂ  mang láº¡i lá»£i Ă­ch kinh táº¿."',
        correctAnswer: 'Art exhibitions and performing arts can attract tourists and bring significant economic benefits.',
        modelAnswer: 'Art exhibitions and performing arts can attract tourists and bring significant economic benefits.',
        fallbackKeywords: ['art exhibitions', 'performing arts', 'economic benefits', 'tourists'],
        explanationVi: "'Attract tourists' = thu hĂºt khĂ¡ch du lá»‹ch. 'Bring significant economic benefits' = mang láº¡i lá»£i Ă­ch kinh táº¿ Ä‘Ă¡ng ká»ƒ. Hai vá»‹ ngá»¯ song song: attract... and bring..."
      },
      {
        questionId: 'w10t16_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "investment in the arts" vĂ  "stimulate creativity"):\n\n"Viá»‡c Ä‘áº§u tÆ° vĂ o nghá»‡ thuáº­t cĂ³ thá»ƒ kĂ­ch thĂ­ch sá»± sĂ¡ng táº¡o trong xĂ£ há»™i."',
        correctAnswer: 'Investment in the arts can stimulate creativity across society.',
        modelAnswer: 'Investment in the arts can stimulate creativity across society.',
        fallbackKeywords: ['investment in the arts', 'stimulate creativity', 'society'],
        explanationVi: "'Stimulate creativity' = kĂ­ch thĂ­ch sá»± sĂ¡ng táº¡o. 'Across society' = trĂªn toĂ n xĂ£ há»™i/trong xĂ£ há»™i. 'Investment in the arts' = Ä‘áº§u tÆ° vĂ o nghá»‡ thuáº­t."
      },
      {
        questionId: 'w10t16_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "budget constraints" vĂ  "financial burden"):\n\n"Tuy nhiĂªn, trong thá»i ká»³ khá»§ng hoáº£ng kinh táº¿, chĂ­nh phá»§ pháº£i Ä‘á»‘i máº·t vá»›i háº¡n cháº¿ ngĂ¢n sĂ¡ch."',
        correctAnswer: 'However, during periods of economic crisis, governments face significant budget constraints and financial burdens.',
        modelAnswer: 'However, during periods of economic crisis, governments face significant budget constraints and financial burdens.',
        fallbackKeywords: ['budget constraints', 'financial burden', 'economic crisis'],
        explanationVi: "'During periods of + N' = trong thá»i ká»³. 'Face + N' = Ä‘á»‘i máº·t vá»›i. 'Budget constraints' = háº¡n cháº¿ ngĂ¢n sĂ¡ch, 'financial burdens' = gĂ¡nh náº·ng tĂ i chĂ­nh."
      },
      {
        questionId: 'w10t16_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "social cohesion" vĂ  "national pride"):\n\n"Nghá»‡ thuáº­t cĂ³ thá»ƒ giĂºp tÄƒng cÆ°á»ng sá»± gáº¯n káº¿t xĂ£ há»™i vĂ  niá»m tá»± hĂ o dĂ¢n tá»™c."',
        correctAnswer: 'The arts can help strengthen social cohesion and foster a sense of national pride.',
        modelAnswer: 'The arts can help strengthen social cohesion and foster a sense of national pride.',
        fallbackKeywords: ['social cohesion', 'national pride', 'strengthen'],
        explanationVi: "'Strengthen' = tÄƒng cÆ°á»ng. 'Foster a sense of' = nuĂ´i dÆ°á»¡ng/táº¡o ra cáº£m giĂ¡c. 'Social cohesion' = sá»± gáº¯n káº¿t xĂ£ há»™i; 'national pride' = niá»m tá»± hĂ o dĂ¢n tá»™c."
      },
      {
        questionId: 'w10t16_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "government responsibility" vĂ  "investment in the arts"):\n\n"Má»™t sá»‘ ngÆ°á»i tin ráº±ng Ä‘áº§u tÆ° vĂ o nghá»‡ thuáº­t lĂ  má»™t pháº§n trĂ¡ch nhiá»‡m cá»§a chĂ­nh phá»§."',
        correctAnswer: 'Some people believe that investment in the arts is part of the government\'s responsibility.',
        modelAnswer: 'Some people believe that investment in the arts is part of the government\'s responsibility.',
        fallbackKeywords: ['government responsibility', 'investment in the arts', 'part of'],
        explanationVi: "'Part of the government\'s responsibility' = má»™t pháº§n trĂ¡ch nhiá»‡m cá»§a chĂ­nh phá»§. DĂ¹ng sá»Ÿ há»¯u cĂ¡ch 'government\'s' thay vĂ¬ 'of the government'."
      },
      {
        questionId: 'w10t16_q21', level: 'intermediate', orderIndex: 21,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "long-term development" vĂ  "balance between economy and culture"):\n\n"Vá» lĂ¢u dĂ i, cáº£ phĂ¡t triá»ƒn kinh táº¿ vĂ  vÄƒn hĂ³a Ä‘á»u cáº§n Ä‘Æ°á»£c quan tĂ¢m song song."',
        correctAnswer: 'In the long term, both economic and cultural development need to be addressed simultaneously for balanced long-term development.',
        modelAnswer: 'In the long term, both economic and cultural development need to be addressed simultaneously for balanced long-term development.',
        fallbackKeywords: ['long-term development', 'economic', 'cultural', 'simultaneously'],
        explanationVi: "'In the long term' = vá» lĂ¢u dĂ i. 'Both A and B need to be addressed' = cáº£ A láº«n B cáº§n Ä‘Æ°á»£c giáº£i quyáº¿t. 'Simultaneously' = Ä‘á»“ng thá»i/song song."
      }
    ]
  },
  {
    week: 10, block: 'mixed', orderIndex: 17,
    topicName: 'Youth Crime and Solutions', topicEmoji: 'â–ï¸',
    essayType: 'cause_solution',
    prompt: 'The crime rate among young people is increasing rapidly. What are the causes of this problem? How can it be solved?',
    hintAdvantages: [],
    hintDisadvantages: [],
    vocabularyList: [
      { term: 'youth crime', definitionVi: 'tá»™i pháº¡m thanh thiáº¿u niĂªn', example: 'Youth crime is a growing concern in many urban areas.' },
      { term: 'juvenile delinquency', definitionVi: 'tĂ¬nh tráº¡ng pháº¡m tá»™i á»Ÿ thanh thiáº¿u niĂªn', example: 'Poverty and lack of education contribute to juvenile delinquency.' },
      { term: 'peer pressure', definitionVi: 'Ă¡p lá»±c tá»« báº¡n bĂ¨', example: 'Peer pressure is a key factor in youth crime.' },
      { term: 'lack of parental supervision', definitionVi: 'thiáº¿u sá»± giĂ¡m sĂ¡t cá»§a cha máº¹', example: 'A lack of parental supervision leaves young people more vulnerable to crime.' },
      { term: 'family breakdown', definitionVi: 'gia Ä‘Ă¬nh tan vá»¡', example: 'Family breakdown is a major social factor contributing to youth crime.' },
      { term: 'poverty', definitionVi: 'Ä‘Ă³i nghĂ¨o', example: 'Poverty deprives young people of legitimate opportunities.' },
      { term: 'unemployment', definitionVi: 'tháº¥t nghiá»‡p', example: 'High youth unemployment is linked to rising crime rates.' },
      { term: 'rehabilitation programs', definitionVi: 'chÆ°Æ¡ng trĂ¬nh cáº£i táº¡o', example: 'Rehabilitation programs help young offenders reform their behaviour.' },
      { term: 'counseling and guidance', definitionVi: 'tÆ° váº¥n vĂ  hÆ°á»›ng dáº«n', example: 'Counseling and guidance can help troubled youth make better choices.' },
      { term: 'create job opportunities', definitionVi: 'táº¡o cÆ¡ há»™i viá»‡c lĂ m', example: 'Creating job opportunities for youth reduces the appeal of criminal activity.' },
      { term: 'strengthen family bonds', definitionVi: 'cá»§ng cá»‘ má»‘i liĂªn káº¿t gia Ä‘Ă¬nh', example: 'Strengthening family bonds is an effective crime prevention strategy.' },
      { term: 'government intervention', definitionVi: 'sá»± can thiá»‡p cá»§a chĂ­nh phá»§', example: 'Government intervention is needed to address the root causes of youth crime.' },
      { term: 'public awareness campaigns', definitionVi: 'chiáº¿n dá»‹ch nĂ¢ng cao nháº­n thá»©c', example: 'Public awareness campaigns help communities understand and prevent crime.' },
      { term: 'positive role models', definitionVi: 'hĂ¬nh máº«u tĂ­ch cá»±c', example: 'Access to positive role models helps young people make responsible decisions.' },
      { term: 'crime prevention', definitionVi: 'phĂ²ng ngá»«a tá»™i pháº¡m', example: 'Education and employment are key pillars of crime prevention.' }
    ],
    questions: [
      {
        questionId: 'w10t17_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Äá» bĂ i há»i "What are the causes of this problem? How can it be solved?" â€” Ä‘Ă¢y lĂ  dáº¡ng essay nĂ o?',
        options: ['Discuss Both Views', 'Advantages & Disadvantages', 'Cause & Solution', 'Agree or Disagree'],
        correctAnswer: 'Cause & Solution',
        explanationVi: 'Hai cĂ¢u há»i rĂµ rĂ ng: "causes" = nguyĂªn nhĂ¢n, "solved" = giáº£i phĂ¡p. Dáº¡ng Cause & Solution: 1 Ä‘oáº¡n nguyĂªn nhĂ¢n + 1 Ä‘oáº¡n giáº£i phĂ¡p, khĂ´ng Ä‘Æ°á»£c trá»™n láº«n.'
      },
      {
        questionId: 'w10t17_q02', level: 'beginner', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Äiá»n tá»« cĂ²n thiáº¿u:\n\n"Young people who grow up in broken families or poverty are more _____ to criminal behavior."',
        correctAnswer: 'susceptible',
        explanationVi: '"Susceptible to" = dá»… bá»‹ áº£nh hÆ°á»Ÿng bá»Ÿi â€” cá»¥m tá»« há»c thuáº­t quan trá»ng. "Vulnerable to" cÅ©ng cháº¥p nháº­n Ä‘Æ°á»£c vá»›i nghÄ©a tÆ°Æ¡ng tá»±.'
      },
      {
        questionId: 'w10t17_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Tá»· lá»‡ tá»™i pháº¡m trong giá»›i tráº» Ä‘ang gia tÄƒng nhanh chĂ³ng."',
        correctAnswer: 'The crime rate among young people is increasing rapidly.',
        modelAnswer: 'The crime rate among young people is increasing rapidly.',
        fallbackKeywords: ['crime rate', 'young people', 'increasing rapidly'],
        explanationVi: "'Crime rate' = tá»· lá»‡ tá»™i pháº¡m. 'Among young people' = trong giá»›i tráº». 'Is increasing rapidly' = Ä‘ang tÄƒng nhanh (Present Continuous nháº¥n máº¡nh xu hÆ°á»›ng)."
      },
      {
        questionId: 'w10t17_q04', level: 'beginner', orderIndex: 4,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Ăp lá»±c tá»« báº¡n bĂ¨ vĂ  thiáº¿u sá»± giĂ¡m sĂ¡t cá»§a cha máº¹ lĂ  nhá»¯ng nguyĂªn nhĂ¢n chĂ­nh cá»§a váº¥n Ä‘á» nĂ y."',
        correctAnswer: 'Peer pressure and a lack of parental supervision are the main causes of this problem.',
        modelAnswer: 'Peer pressure and a lack of parental supervision are the main causes of this problem.',
        fallbackKeywords: ['peer pressure', 'parental supervision', 'causes', 'problem'],
        explanationVi: "'A lack of parental supervision' = sá»± thiáº¿u giĂ¡m sĂ¡t cá»§a cha máº¹. 'The main causes of' = nhá»¯ng nguyĂªn nhĂ¢n chĂ­nh cá»§a. Sá»‘ nhiá»u 'causes' + 'are'."
      },
      {
        questionId: 'w10t17_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Nhiá»u thanh thiáº¿u niĂªn pháº¡m tá»™i vĂ¬ Ä‘áº¿n tá»« nhá»¯ng gia Ä‘Ă¬nh tan vá»¡."',
        correctAnswer: 'Many young people commit crimes because they come from families affected by breakdown.',
        modelAnswer: 'Many young people commit crimes because they come from families affected by breakdown.',
        fallbackKeywords: ['young people', 'commit crimes', 'family breakdown'],
        explanationVi: "'Commit crimes' = pháº¡m tá»™i. 'Family breakdown' = gia Ä‘Ă¬nh tan vá»¡. 'Because + clause' = vĂ¬/do (nguyĂªn nhĂ¢n)."
      },
      {
        questionId: 'w10t17_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"CĂ¡c chÆ°Æ¡ng trĂ¬nh cáº£i táº¡o vĂ  tÆ° váº¥n cĂ³ thá»ƒ giĂºp thanh thiáº¿u niĂªn thay Ä‘á»•i hĂ nh vi."',
        correctAnswer: 'Rehabilitation programs and counseling can help young people change their behavior.',
        modelAnswer: 'Rehabilitation programs and counseling can help young people change their behavior.',
        fallbackKeywords: ['rehabilitation programs', 'counseling', 'young people', 'behavior'],
        explanationVi: "'Help + O + V' = giĂºp ai Ä‘Ă³ lĂ m gĂ¬. 'Rehabilitation programs' = chÆ°Æ¡ng trĂ¬nh cáº£i táº¡o. 'Counseling' = tÆ° váº¥n tĂ¢m lĂ½."
      },
      {
        questionId: 'w10t17_q07', level: 'elementary', orderIndex: 7,
        type: 'rearrange',
        questionText: 'Sáº¯p xáº¿p thĂ nh cĂ¢u hoĂ n chá»‰nh:\n\n[poverty, unemployment, / Such / as / social factors / and / can / a lack of discipline / drive / to / young people / commit crimes]',
        correctAnswer: 'Such social factors as poverty, unemployment, and a lack of discipline can drive young people to commit crimes.',
        explanationVi: '"Such + noun + as + examples" = vĂ­ dá»¥ nhÆ° â€” cáº¥u trĂºc liá»‡t kĂª há»c thuáº­t. "Drive someone to + V" = thĂºc Ä‘áº©y ai Ä‘Ă³ lĂ m gĂ¬.'
      },
      {
        questionId: 'w10t17_q08', level: 'elementary', orderIndex: 8,
        type: 'error_correction',
        questionText: 'CĂ¢u sau cĂ³ lá»—i gĂ¬? HĂ£y sá»­a láº¡i:\n\n"To solve this problem, the government should to create more job opportunities for young people."',
        correctAnswer: 'To solve this problem, the government should create more job opportunities for young people.',
        modelAnswer: 'To solve this problem, the government should create more job opportunities for young people.',
        fallbackKeywords: ['government', 'should create', 'job opportunities', 'young people'],
        explanationVi: "Lá»—i: Sau \"should\" khĂ´ng dĂ¹ng \"to + V\". Bá» \"to\" trÆ°á»›c \"create\"."
      },
      {
        questionId: 'w10t17_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"CĂ¡c chiáº¿n dá»‹ch nĂ¢ng cao nháº­n thá»©c cá»™ng Ä‘á»“ng cĂ³ thá»ƒ giĂºp giáº£m hĂ nh vi tá»™i pháº¡m trong giá»›i tráº»."',
        correctAnswer: 'Public awareness campaigns can help reduce criminal behavior among young people.',
        modelAnswer: 'Public awareness campaigns can help reduce criminal behavior among young people.',
        fallbackKeywords: ['public awareness campaigns', 'reduce', 'criminal behavior', 'young people'],
        explanationVi: "'Public awareness campaigns' = chiáº¿n dá»‹ch nĂ¢ng cao nháº­n thá»©c cá»™ng Ä‘á»“ng. 'Criminal behavior among' = hĂ nh vi tá»™i pháº¡m trong giá»›i. 'Help + V' = giĂºp lĂ m gĂ¬."
      },
      {
        questionId: 'w10t17_q10', level: 'intermediate', orderIndex: 10,
        type: 'paraphrase',
        questionText: 'Viáº¿t láº¡i cĂ¢u sau mĂ  khĂ´ng dĂ¹ng: crime rate, young people, increasing rapidly:\n\n"The crime rate among young people is increasing rapidly."',
        correctAnswer: 'There has been a sharp and troubling rise in the number of adolescents and young adults engaging in unlawful behaviour in recent years.',
        modelAnswer: 'There has been a sharp and troubling rise in the number of adolescents and young adults engaging in unlawful behaviour in recent years.',
        fallbackKeywords: ['adolescents', 'unlawful behaviour', 'sharp rise', 'recent years'],
        explanationVi: "Paraphrase: 'crime rate increasing' â†’ 'sharp rise in... unlawful behaviour', 'young people' â†’ 'adolescents and young adults'. 'Engaging in unlawful behaviour' = tham gia hĂ nh vi pháº¡m phĂ¡p."
      },
      {
        questionId: 'w10t17_q11', level: 'intermediate', orderIndex: 11,
        type: 'short_writing',
        questionText: 'Viáº¿t 1 Ä‘oáº¡n body paragraph (~80â€“100 tá»«) trĂ¬nh bĂ y HAI NGUYĂN NHĂ‚N chĂ­nh khiáº¿n tá»™i pháº¡m vá»‹ thĂ nh niĂªn gia tÄƒng.\n\nGá»£i Ă½: peer pressure / family breakdown / poverty / unemployment / social media influence / exposure to violence',
        modelAnswer: 'There are several key factors that contribute to the rise in youth crime. First, family breakdown and a lack of parental supervision leave many young people without moral guidance, making them more susceptible to peer pressure and negative influences. Children raised in single-parent households or unstable family environments are significantly more likely to engage in delinquent behaviour. Second, poverty and unemployment deprive young people of legitimate opportunities, pushing some towards criminal activity as a means of financial survival. Without stable employment prospects or adequate support systems, economically disadvantaged youth face heightened vulnerability to crime.',
        fallbackKeywords: ['peer pressure', 'family breakdown', 'poverty', 'unemployment', 'youth crime', 'susceptible'],
        explanationVi: "Dáº¡ng Cause & Solution: Ä‘oáº¡n nguyĂªn nhĂ¢n pháº£i nĂªu 2 nguyĂªn nhĂ¢n rĂµ rĂ ng, má»—i nguyĂªn nhĂ¢n cĂ³ giáº£i thĂ­ch. DĂ¹ng 'First,...Second,...' Ä‘á»ƒ phĂ¢n tĂ¡ch."
      },
      {
        questionId: 'w10t17_q12', level: 'intermediate', orderIndex: 12,
        type: 'short_writing',
        questionText: 'Viáº¿t 1 Ä‘oáº¡n body paragraph (~80â€“100 tá»«) Ä‘á» xuáº¥t HAI GIáº¢I PHĂP Ä‘á»ƒ giáº£i quyáº¿t váº¥n Ä‘á» tá»™i pháº¡m trong giá»›i tráº».\n\nGá»£i Ă½: rehabilitation programs / counseling and guidance / create job opportunities / government intervention / public awareness campaigns / strengthen family bonds',
        modelAnswer: 'Addressing youth crime requires a multi-faceted approach targeting both its immediate symptoms and root causes. One effective solution is the expansion of rehabilitation programs and counseling services, which provide young offenders with the psychological support and moral guidance needed to reform their behaviour and avoid reoffending. Additionally, governments should create job opportunities and vocational training schemes specifically tailored to at-risk youth, giving them legitimate pathways to financial stability. When young people have access to meaningful employment and community support, the appeal of criminal activity diminishes significantly, contributing to long-term crime prevention.',
        fallbackKeywords: ['rehabilitation programs', 'counseling', 'job opportunities', 'government', 'crime prevention', 'vocational training'],
        explanationVi: "Äoáº¡n giáº£i phĂ¡p pháº£i nĂªu 2 giáº£i phĂ¡p cá»¥ thá»ƒ, má»—i giáº£i phĂ¡p cĂ³ giáº£i thĂ­ch táº¡i sao hiá»‡u quáº£. DĂ¹ng 'One effective solution is...' vĂ  'Additionally,...' Ä‘á»ƒ phĂ¢n tĂ¡ch."
      },
      // â”€â”€ QT-4 Intermediate (W9T7) â”€â”€
      {
        questionId: 'w10t17_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "youth crime"):\n\n"Tá»· lá»‡ tá»™i pháº¡m trong giá»›i tráº» Ä‘ang gia tÄƒng nhanh chĂ³ng."',
        correctAnswer: 'The rate of youth crime is increasing rapidly.',
        modelAnswer: 'The rate of youth crime is increasing rapidly.',
        fallbackKeywords: ['youth crime', 'rate', 'increasing rapidly'],
        explanationVi: "'The rate of + N + is increasing rapidly' = tá»· lá»‡ Ä‘ang tÄƒng nhanh. Present Continuous nháº¥n máº¡nh xu hÆ°á»›ng Ä‘ang xáº£y ra. 'Rapidly' = má»™t cĂ¡ch nhanh chĂ³ng."
      },
      {
        questionId: 'w10t17_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "peer pressure" vĂ  "lack of parental supervision"):\n\n"NguyĂªn nhĂ¢n chĂ­nh cá»§a hiá»‡n tÆ°á»£ng nĂ y lĂ  Ă¡p lá»±c tá»« báº¡n bĂ¨ vĂ  thiáº¿u sá»± giĂ¡m sĂ¡t cá»§a cha máº¹."',
        correctAnswer: 'The main causes of this phenomenon are peer pressure and a lack of parental supervision.',
        modelAnswer: 'The main causes of this phenomenon are peer pressure and a lack of parental supervision.',
        fallbackKeywords: ['peer pressure', 'lack of parental supervision', 'main causes'],
        explanationVi: "'The main causes of this phenomenon are A and B' = liá»‡t kĂª nguyĂªn nhĂ¢n theo cáº¥u trĂºc song song. 'A lack of + N' = sá»± thiáº¿u há»¥t vá»."
      },
      {
        questionId: 'w10t17_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "juvenile delinquency" vĂ  "family breakdown"):\n\n"Nhiá»u thanh thiáº¿u niĂªn pháº¡m tá»™i vĂ¬ Ä‘áº¿n tá»« nhá»¯ng gia Ä‘Ă¬nh tan vá»¡."',
        correctAnswer: 'Many cases of juvenile delinquency stem from young people who come from families affected by breakdown.',
        modelAnswer: 'Many cases of juvenile delinquency stem from young people who come from families affected by breakdown.',
        fallbackKeywords: ['juvenile delinquency', 'family breakdown', 'stem from'],
        explanationVi: "'Stem from' = xuáº¥t phĂ¡t tá»«/cĂ³ nguá»“n gá»‘c tá»«. 'Juvenile delinquency' = tá»™i pháº¡m vá»‹ thĂ nh niĂªn. 'Families affected by breakdown' = gia Ä‘Ă¬nh tan vá»¡ (má»‡nh Ä‘á» quan há»‡ rĂºt gá»n)."
      },
      {
        questionId: 'w10t17_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "poverty", "unemployment", vĂ  "youth crime"):\n\n"NghĂ¨o Ä‘Ă³i vĂ  tháº¥t nghiá»‡p lĂ  hai yáº¿u tá»‘ quan trá»ng dáº«n Ä‘áº¿n tá»™i pháº¡m vá»‹ thĂ nh niĂªn."',
        correctAnswer: 'Poverty and unemployment are two significant factors contributing to youth crime.',
        modelAnswer: 'Poverty and unemployment are two significant factors contributing to youth crime.',
        fallbackKeywords: ['poverty', 'unemployment', 'youth crime', 'contributing'],
        explanationVi: "'Factors contributing to + N' = cĂ¡c yáº¿u tá»‘ gĂ³p pháº§n vĂ o (participial phrase rĂºt gá»n má»‡nh Ä‘á» quan há»‡). 'Significant' = Ä‘Ă¡ng ká»ƒ/quan trá»ng."
      },
      {
        questionId: 'w10t17_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "social media influence" vĂ  "exposure to violence"):\n\n"Má»™t sá»‘ ngÆ°á»i tráº» bá»‹ áº£nh hÆ°á»Ÿng tiĂªu cá»±c bá»Ÿi máº¡ng xĂ£ há»™i hoáº·c tiáº¿p xĂºc vá»›i báº¡o lá»±c."',
        correctAnswer: 'Some young people are negatively influenced by social media or exposure to violence.',
        modelAnswer: 'Some young people are negatively influenced by social media or exposure to violence.',
        fallbackKeywords: ['social media influence', 'exposure to violence', 'negatively influenced'],
        explanationVi: "'Are negatively influenced by' = bá»‹ áº£nh hÆ°á»Ÿng tiĂªu cá»±c bá»Ÿi (bá»‹ Ä‘á»™ng). 'Exposure to violence' = tiáº¿p xĂºc vá»›i báº¡o lá»±c â€” danh tá»« khĂ´ng Ä‘áº¿m Ä‘Æ°á»£c."
      },
      {
        questionId: 'w10t17_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "drug and alcohol abuse" vĂ  "aggressive behavior"):\n\n"Láº¡m dá»¥ng ma tĂºy vĂ  rÆ°á»£u cÅ©ng gĂ³p pháº§n lĂ m gia tÄƒng hĂ nh vi tá»™i pháº¡m."',
        correctAnswer: 'Drug and alcohol abuse also contribute to the rise in aggressive behavior and criminal activity.',
        modelAnswer: 'Drug and alcohol abuse also contribute to the rise in aggressive behavior and criminal activity.',
        fallbackKeywords: ['drug and alcohol abuse', 'aggressive behavior', 'contribute'],
        explanationVi: "'Contribute to the rise in + N' = gĂ³p pháº§n vĂ o sá»± gia tÄƒng cá»§a. 'Drug and alcohol abuse' lĂ  chá»§ ngá»¯ sá»‘ nhiá»u â†’ 'contribute' (khĂ´ng cĂ³ 's')."
      },
      {
        questionId: 'w10t17_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "crime prevention" vĂ  "improve education system"):\n\n"Äá»ƒ ngÄƒn ngá»«a tá»™i pháº¡m trong giá»›i tráº», chĂ­nh phá»§ cáº§n tÄƒng cÆ°á»ng giĂ¡o dá»¥c vĂ  hÆ°á»›ng nghiá»‡p."',
        correctAnswer: 'To ensure effective crime prevention among young people, the government needs to improve the education system and expand vocational guidance.',
        modelAnswer: 'To ensure effective crime prevention among young people, the government needs to improve the education system and expand vocational guidance.',
        fallbackKeywords: ['crime prevention', 'improve education system', 'vocational guidance'],
        explanationVi: "'To ensure + N' = Ä‘á»ƒ Ä‘áº£m báº£o. 'Needs to + V' = cáº§n pháº£i. 'Vocational guidance' = hÆ°á»›ng nghiá»‡p. Hai vá»‹ ngá»¯ song song: improve... and expand..."
      },
      {
        questionId: 'w10t17_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "family bonds" vĂ  "moral values"):\n\n"Gia Ä‘Ă¬nh cáº§n dĂ nh thá»i gian cho con cĂ¡i Ä‘á»ƒ cá»§ng cá»‘ má»‘i quan há»‡ vĂ  Ä‘á»‹nh hÆ°á»›ng Ä‘áº¡o Ä‘á»©c."',
        correctAnswer: 'Families need to spend time with their children to strengthen family bonds and instil moral values.',
        modelAnswer: 'Families need to spend time with their children to strengthen family bonds and instil moral values.',
        fallbackKeywords: ['family bonds', 'moral values', 'strengthen', 'instil'],
        explanationVi: "'Instil + N' = gieo trá»“ng/Ä‘á»‹nh hÆ°á»›ng (Ä‘áº·c biá»‡t dĂ¹ng cho giĂ¡ trá»‹ Ä‘áº¡o Ä‘á»©c). 'Strengthen family bonds' = cá»§ng cá»‘ má»‘i quan há»‡ gia Ä‘Ă¬nh. Hai V song song: strengthen... and instil..."
      },
      {
        questionId: 'w10t17_q21', level: 'intermediate', orderIndex: 21,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "stricter punishment" vĂ  "deter crime"):\n\n"Má»™t sá»‘ ngÆ°á»i tin ráº±ng cáº§n Ă¡p dá»¥ng hĂ¬nh pháº¡t nghiĂªm kháº¯c hÆ¡n Ä‘á»ƒ rÄƒn Ä‘e."',
        correctAnswer: 'Some people believe that stricter punishment is needed to deter crime.',
        modelAnswer: 'Some people believe that stricter punishment is needed to deter crime.',
        fallbackKeywords: ['stricter punishment', 'deter crime', 'needed'],
        explanationVi: "'Is needed to + V' = cáº§n pháº£i (bá»‹ Ä‘á»™ng). 'Deter crime' = ngÄƒn cháº·n/rÄƒn Ä‘e tá»™i pháº¡m. 'Stricter punishment' = hĂ¬nh pháº¡t nghiĂªm kháº¯c hÆ¡n (so sĂ¡nh hÆ¡n)."
      },
      {
        questionId: 'w10t17_q22', level: 'intermediate', orderIndex: 22,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "positive role models" vĂ  "peer pressure"):\n\n"Thanh thiáº¿u niĂªn cáº§n nhá»¯ng hĂ¬nh máº«u tĂ­ch cá»±c Ä‘á»ƒ noi theo thay vĂ¬ bá»‹ áº£nh hÆ°á»Ÿng bá»Ÿi báº¡n bĂ¨ xáº¥u."',
        correctAnswer: 'Young people need positive role models to look up to instead of being swayed by negative peer pressure.',
        modelAnswer: 'Young people need positive role models to look up to instead of being swayed by negative peer pressure.',
        fallbackKeywords: ['positive role models', 'peer pressure', 'instead of', 'negative'],
        explanationVi: "'Look up to' = noi gÆ°Æ¡ng/ngÆ°á»¡ng má»™. 'Instead of + V-ing' = thay vĂ¬. 'Swayed by' = bá»‹ áº£nh hÆ°á»Ÿng/bá»‹ lĂ´i kĂ©o bá»Ÿi. 'Negative peer pressure' = áº£nh hÆ°á»Ÿng xáº¥u tá»« báº¡n bĂ¨."
      }
    ]
  },
  // â”€â”€â”€ WEEK 12: Translation Practice â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    week: 12, block: 'translation', orderIndex: 19,
    topicName: 'Dá»‹ch CĂ¢u - MĂ´i TrÆ°á»ng & KhĂ­ Háº­u', topicEmoji: 'đŸŒ¿',
    essayType: 'cause_solution',
    prompt: 'The increasing levels of pollution and climate change are threatening the planet. What are the causes of these problems, and what solutions can be implemented?',
    vocabularyList: [
      { term: 'climate change', definitionVi: 'biáº¿n Ä‘á»•i khĂ­ háº­u', example: 'Climate change is causing more frequent extreme weather events.' },
      { term: 'fossil fuels', definitionVi: 'nhiĂªn liá»‡u hĂ³a tháº¡ch', example: 'Burning fossil fuels is a major cause of air pollution.' },
      { term: 'renewable energy', definitionVi: 'nÄƒng lÆ°á»£ng tĂ¡i táº¡o', example: 'Switching to renewable energy can significantly reduce carbon emissions.' },
      { term: 'carbon emissions', definitionVi: 'khĂ­ tháº£i carbon', example: 'Reducing carbon emissions is essential to combat climate change.' },
      { term: 'sustainability', definitionVi: 'tĂ­nh bá»n vá»¯ng', example: 'Economic development must prioritise sustainability.' }
    ],
    questions: [
      {
        questionId: 'w12_trans_env_q01', level: 'beginner', orderIndex: 1,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Biáº¿n Ä‘á»•i khĂ­ háº­u lĂ  má»™t trong nhá»¯ng thĂ¡ch thá»©c lá»›n nháº¥t mĂ  nhĂ¢n loáº¡i Ä‘ang pháº£i Ä‘á»‘i máº·t."',
        correctAnswer: 'Climate change is one of the greatest challenges that humanity is currently facing.',
        modelAnswer: 'Climate change is one of the greatest challenges that humanity is currently facing.',
        fallbackKeywords: ['climate change', 'challenges', 'humanity', 'facing'],
        explanationVi: "'One of the + superlative + N' dĂ¹ng khi nĂ³i vá» má»™t trong nhá»¯ng Ä‘iá»u quan trá»ng nháº¥t. 'Facing/confronting' = Ä‘á»‘i máº·t. 'Humanity' = nhĂ¢n loáº¡i â€” tá»« há»c thuáº­t thay cho 'people'."
      },
      {
        questionId: 'w12_trans_env_q02', level: 'elementary', orderIndex: 2,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh (dĂ¹ng "fossil fuels" vĂ  "global warming"):\n\n"Viá»‡c Ä‘á»‘t nhiĂªn liá»‡u hĂ³a tháº¡ch tháº£i ra lÆ°á»£ng lá»›n khĂ­ CO2, gĂ³p pháº§n vĂ o hiá»‡n tÆ°á»£ng áº¥m lĂªn toĂ n cáº§u."',
        correctAnswer: 'Burning fossil fuels releases large amounts of CO2, contributing to global warming.',
        modelAnswer: 'Burning fossil fuels releases large amounts of CO2, contributing to global warming.',
        fallbackKeywords: ['fossil fuels', 'releases', 'CO2', 'contributing', 'global warming'],
        explanationVi: "'Burning + N' (gerund) lĂ m chá»§ ngá»¯. '..., contributing to' (participial clause) diá»…n táº£ káº¿t quáº£ cá»§a hĂ nh Ä‘á»™ng trÆ°á»›c. KhĂ´ng dĂ¹ng 'and contribute' á»Ÿ Ä‘Ă¢y."
      },
      {
        questionId: 'w12_trans_env_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh (dĂ¹ng "renewable energy" vĂ  "fossil fuels"):\n\n"ChĂ­nh phá»§ nĂªn thá»±c hiá»‡n cĂ¡c chĂ­nh sĂ¡ch máº¡nh máº½ hÆ¡n Ä‘á»ƒ khuyáº¿n khĂ­ch sá»­ dá»¥ng nÄƒng lÆ°á»£ng tĂ¡i táº¡o vĂ  giáº£m sá»± phá»¥ thuá»™c vĂ o nhiĂªn liá»‡u hĂ³a tháº¡ch."',
        correctAnswer: 'Governments should implement stronger policies to encourage the use of renewable energy and reduce dependence on fossil fuels.',
        modelAnswer: 'Governments should implement stronger policies to encourage the use of renewable energy and reduce dependence on fossil fuels.',
        fallbackKeywords: ['governments', 'implement', 'policies', 'renewable energy', 'fossil fuels', 'reduce'],
        explanationVi: "'Implement policies' = thá»±c thi chĂ­nh sĂ¡ch. 'Reduce dependence on' = giáº£m sá»± phá»¥ thuá»™c vĂ o. 'Should' thá»ƒ hiá»‡n khuyáº¿n nghá»‹ â€” ráº¥t cáº§n trong Ä‘oáº¡n solution."
      },
      {
        questionId: 'w12_trans_env_q04', level: 'intermediate', orderIndex: 4,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "deforestation" vĂ  "global warming"):\n\n"Viá»‡c cháº·t phĂ¡ rá»«ng khĂ´ng kiá»ƒm soĂ¡t gĂ³p pháº§n Ä‘Ă¡ng ká»ƒ vĂ o hiá»‡n tÆ°á»£ng nĂ³ng lĂªn toĂ n cáº§u."',
        correctAnswer: 'Uncontrolled deforestation contributes significantly to global warming.',
        modelAnswer: 'Uncontrolled deforestation contributes significantly to global warming.',
        fallbackKeywords: ['deforestation', 'contributes significantly', 'global warming'],
        explanationVi: "'Uncontrolled deforestation' = cháº·t phĂ¡ rá»«ng khĂ´ng kiá»ƒm soĂ¡t. 'Contributes significantly to' = gĂ³p pháº§n Ä‘Ă¡ng ká»ƒ vĂ o. 'Global warming' = nĂ³ng lĂªn toĂ n cáº§u (khĂ¡c vá»›i climate change lĂ  thuáº­t ngá»¯ rá»™ng hÆ¡n)."
      },
      {
        questionId: 'w12_trans_env_q05', level: 'intermediate', orderIndex: 5,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "electric vehicles" vĂ  "carbon emissions"):\n\n"Nhiá»u quá»‘c gia Ä‘ang chuyá»ƒn sang sá»­ dá»¥ng xe Ä‘iá»‡n nháº±m giáº£m lÆ°á»£ng khĂ­ tháº£i carbon tá»« lÄ©nh vá»±c giao thĂ´ng."',
        correctAnswer: 'Many countries are transitioning to electric vehicles in order to reduce carbon emissions from the transport sector.',
        modelAnswer: 'Many countries are transitioning to electric vehicles in order to reduce carbon emissions from the transport sector.',
        fallbackKeywords: ['electric vehicles', 'carbon emissions', 'transport sector', 'transitioning'],
        explanationVi: "'Transition to' = chuyá»ƒn sang (quĂ¡ trĂ¬nh dáº§n dáº§n). 'In order to' = nháº±m má»¥c Ä‘Ă­ch (trang trá»ng hÆ¡n 'to'). 'The transport sector' = lÄ©nh vá»±c giao thĂ´ng váº­n táº£i."
      },
      {
        questionId: 'w12_trans_env_q06', level: 'intermediate', orderIndex: 6,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "rising sea levels" vĂ  "relocate"):\n\n"NÆ°á»›c biá»ƒn dĂ¢ng Ä‘ang Ä‘e dá»a nhiá»u vĂ¹ng ven biá»ƒn tháº¥p trĂªn tháº¿ giá»›i, buá»™c hĂ ng triá»‡u ngÆ°á»i pháº£i di dá»i."',
        correctAnswer: 'Rising sea levels are threatening many low-lying coastal areas around the world, forcing millions of people to relocate.',
        modelAnswer: 'Rising sea levels are threatening many low-lying coastal areas around the world, forcing millions of people to relocate.',
        fallbackKeywords: ['rising sea levels', 'low-lying coastal areas', 'forcing', 'relocate'],
        explanationVi: "'Rising sea levels' = nÆ°á»›c biá»ƒn dĂ¢ng (Present Participle lĂ m tĂ­nh tá»«). 'Low-lying coastal areas' = vĂ¹ng ven biá»ƒn tháº¥p. 'Forcing + O + to V' (participial clause) diá»…n táº£ há»‡ quáº£ trá»±c tiáº¿p."
      },
      {
        questionId: 'w12_trans_env_q07', level: 'intermediate', orderIndex: 7,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "urgent action" vĂ  "public health"):\n\n"Náº¿u khĂ´ng cĂ³ hĂ nh Ä‘á»™ng kháº©n cáº¥p, tĂ¬nh tráº¡ng Ă´ nhiá»…m khĂ´ng khĂ­ sáº½ tiáº¿p tá»¥c gĂ¢y háº¡i cho sá»©c khá»e cá»™ng Ä‘á»“ng."',
        correctAnswer: 'Without urgent action, air pollution will continue to harm public health.',
        modelAnswer: 'Without urgent action, air pollution will continue to harm public health.',
        fallbackKeywords: ['urgent action', 'air pollution', 'harm', 'public health'],
        explanationVi: "'Without + N/phrase' = náº¿u khĂ´ng cĂ³ (Ä‘iá»u kiá»‡n Ă¢m â€” khĂ´ng dĂ¹ng 'If not have'). 'Will continue to' = sáº½ tiáº¿p tá»¥c. 'Harm public health' = gĂ¢y háº¡i cho sá»©c khá»e cá»™ng Ä‘á»“ng."
      },
      {
        questionId: 'w12_trans_env_q08', level: 'intermediate', orderIndex: 8,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "effective solution" vĂ  "solar and wind power"):\n\n"Má»™t giáº£i phĂ¡p hiá»‡u quáº£ lĂ  Ä‘áº§u tÆ° vĂ o cĂ¡c nguá»“n nÄƒng lÆ°á»£ng tĂ¡i táº¡o nhÆ° Ä‘iá»‡n máº·t trá»i vĂ  Ä‘iá»‡n giĂ³."',
        correctAnswer: 'An effective solution is to invest in renewable energy sources such as solar and wind power.',
        modelAnswer: 'An effective solution is to invest in renewable energy sources such as solar and wind power.',
        fallbackKeywords: ['effective solution', 'invest', 'renewable energy', 'solar', 'wind power'],
        explanationVi: "'An effective solution is to + V' = má»™t giáº£i phĂ¡p hiá»‡u quáº£ lĂ . 'Such as' = cháº³ng háº¡n nhÆ° (liá»‡t kĂª vĂ­ dá»¥). 'Solar and wind power' = Ä‘iá»‡n máº·t trá»i vĂ  Ä‘iá»‡n giĂ³."
      },
      {
        questionId: 'w12_trans_env_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "dependence on fossil fuels" vĂ  "major cities"):\n\n"Sá»± phá»¥ thuá»™c vĂ o nhiĂªn liá»‡u hĂ³a tháº¡ch Ä‘Ă£ dáº«n Ä‘áº¿n má»©c Ä‘á»™ Ă´ nhiá»…m khĂ´ng khĂ­ nghiĂªm trá»ng á»Ÿ nhiá»u thĂ nh phá»‘ lá»›n."',
        correctAnswer: 'Dependence on fossil fuels has led to severe levels of air pollution in many major cities.',
        modelAnswer: 'Dependence on fossil fuels has led to severe levels of air pollution in many major cities.',
        fallbackKeywords: ['dependence on fossil fuels', 'led to', 'air pollution', 'major cities'],
        explanationVi: "'Dependence on' = sá»± phá»¥ thuá»™c vĂ o (danh tá»«). 'Has led to' = Ä‘Ă£ dáº«n Ä‘áº¿n (Present Perfect â€” káº¿t quáº£ cĂ²n hiá»‡n há»¯u). 'Severe levels of' = má»©c Ä‘á»™ nghiĂªm trá»ng cá»§a."
      },
      {
        questionId: 'w12_trans_env_q10', level: 'intermediate', orderIndex: 10,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "impose taxes" vĂ  "cleaner production"):\n\n"ChĂ­nh phá»§ nĂªn Ä‘Ă¡nh thuáº¿ cao vĂ o cĂ¡c doanh nghiá»‡p xáº£ tháº£i quĂ¡ má»©c Ä‘á»ƒ buá»™c há» Ă¡p dá»¥ng quy trĂ¬nh sáº£n xuáº¥t sáº¡ch hÆ¡n."',
        correctAnswer: 'Governments should impose heavy taxes on companies that emit excessive pollutants to compel them to adopt cleaner production processes.',
        modelAnswer: 'Governments should impose heavy taxes on companies that emit excessive pollutants to compel them to adopt cleaner production processes.',
        fallbackKeywords: ['impose taxes', 'excessive pollutants', 'compel', 'cleaner production'],
        explanationVi: "'Impose taxes on' = Ä‘Ă¡nh thuáº¿ vĂ o. 'Emit excessive pollutants' = xáº£ tháº£i quĂ¡ má»©c. 'Compel + O + to V' = buá»™c ai pháº£i lĂ m gĂ¬ (máº¡nh hÆ¡n 'encourage'). 'Adopt cleaner processes' = Ă¡p dá»¥ng quy trĂ¬nh sáº¡ch hÆ¡n."
      },
      {
        questionId: 'w12_trans_env_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "climate change" vĂ  "global food security"):\n\n"Biáº¿n Ä‘á»•i khĂ­ háº­u khĂ´ng chá»‰ áº£nh hÆ°á»Ÿng Ä‘áº¿n mĂ´i trÆ°á»ng tá»± nhiĂªn mĂ  cĂ²n Ä‘e dá»a an ninh lÆ°Æ¡ng thá»±c toĂ n cáº§u."',
        correctAnswer: 'Climate change not only affects the natural environment but also threatens global food security.',
        modelAnswer: 'Climate change not only affects the natural environment but also threatens global food security.',
        fallbackKeywords: ['climate change', 'natural environment', 'threatens', 'global food security'],
        explanationVi: "Cáº¥u trĂºc 'not only A but also B' = khĂ´ng chá»‰ A mĂ  cĂ²n B â€” liá»‡t kĂª hai há»‡ quáº£ song song. 'Global food security' = an ninh lÆ°Æ¡ng thá»±c toĂ n cáº§u. 'Threaten' = Ä‘e dá»a."
      },
      {
        questionId: 'w12_trans_env_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "environmental protection" vĂ  "behavioural change"):\n\n"GiĂ¡o dá»¥c cá»™ng Ä‘á»“ng vá» táº§m quan trá»ng cá»§a báº£o vá»‡ mĂ´i trÆ°á»ng cĂ³ thá»ƒ thĂºc Ä‘áº©y thay Ä‘á»•i hĂ nh vi á»Ÿ cáº¥p Ä‘á»™ cĂ¡ nhĂ¢n."',
        correctAnswer: 'Community education about the importance of environmental protection can promote behavioural change at the individual level.',
        modelAnswer: 'Community education about the importance of environmental protection can promote behavioural change at the individual level.',
        fallbackKeywords: ['community education', 'environmental protection', 'promote', 'behavioural change'],
        explanationVi: "'Community education' = giĂ¡o dá»¥c cá»™ng Ä‘á»“ng. 'Promote behavioural change' = thĂºc Ä‘áº©y thay Ä‘á»•i hĂ nh vi. 'At the individual level' = á»Ÿ cáº¥p Ä‘á»™ cĂ¡ nhĂ¢n (trang trá»ng hÆ¡n 'individually')."
      },
      {
        questionId: 'w12_trans_env_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "Paris Agreement" vĂ  "greenhouse gas emissions"):\n\n"CĂ¡c thá»a thuáº­n quá»‘c táº¿ nhÆ° Hiá»‡p Ä‘á»‹nh Paris Ä‘Ă³ng vai trĂ² quan trá»ng trong viá»‡c thĂºc Ä‘áº©y cĂ¡c quá»‘c gia giáº£m phĂ¡t tháº£i khĂ­ nhĂ  kĂ­nh."',
        correctAnswer: 'International agreements such as the Paris Agreement play a crucial role in encouraging nations to reduce their greenhouse gas emissions.',
        modelAnswer: 'International agreements such as the Paris Agreement play a crucial role in encouraging nations to reduce their greenhouse gas emissions.',
        fallbackKeywords: ['international agreements', 'Paris Agreement', 'crucial role', 'greenhouse gas emissions'],
        explanationVi: "'Play a crucial role in + V-ing' = Ä‘Ă³ng vai trĂ² quan trá»ng trong viá»‡c. 'Encourage + O + to V' = thĂºc Ä‘áº©y ai lĂ m gĂ¬. 'Greenhouse gas emissions' = phĂ¡t tháº£i khĂ­ nhĂ  kĂ­nh."
      }
    ]
  },
  {
    week: 12, block: 'translation', orderIndex: 20,
    topicName: 'Dá»‹ch CĂ¢u - CĂ´ng Nghá»‡ & Truyá»n ThĂ´ng', topicEmoji: 'đŸ’»',
    essayType: 'advantages_disadvantages',
    prompt: 'The rapid advancement of technology has transformed the way people communicate and work. What are the advantages and disadvantages of this development?',
    vocabularyList: [
      { term: 'artificial intelligence', definitionVi: 'trĂ­ tuá»‡ nhĂ¢n táº¡o', example: 'Artificial intelligence is revolutionising industries worldwide.' },
      { term: 'social media', definitionVi: 'máº¡ng xĂ£ há»™i', example: 'Social media platforms have changed the way news is consumed.' },
      { term: 'automation', definitionVi: 'tá»± Ä‘á»™ng hĂ³a', example: 'Automation is threatening millions of low-skilled jobs worldwide.' },
      { term: 'misinformation', definitionVi: 'thĂ´ng tin sai lá»‡ch', example: 'The spread of misinformation on social media is a growing concern.' },
      { term: 'digital literacy', definitionVi: 'ká»¹ nÄƒng sá»‘', example: 'Digital literacy is essential for success in the modern workplace.' }
    ],
    questions: [
      {
        questionId: 'w12_trans_tech_q01', level: 'beginner', orderIndex: 1,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Máº¡ng xĂ£ há»™i cho phĂ©p má»i ngÆ°á»i káº¿t ná»‘i vá»›i báº¡n bĂ¨ vĂ  gia Ä‘Ă¬nh á»Ÿ kháº¯p nÆ¡i trĂªn tháº¿ giá»›i."',
        correctAnswer: 'Social media allows people to connect with friends and family all over the world.',
        modelAnswer: 'Social media allows people to connect with friends and family all over the world.',
        fallbackKeywords: ['social media', 'allows', 'connect', 'friends', 'family', 'world'],
        explanationVi: "'Allow + O + to V' = cho phĂ©p ai lĂ m gĂ¬. 'All over the world' = kháº¯p nÆ¡i trĂªn tháº¿ giá»›i. ÄĂ¢y lĂ  cĂ¢u má»Ÿ bĂ i/láº­p luáº­n Ä‘iá»ƒn hĂ¬nh vá» lá»£i Ă­ch cá»§a máº¡ng xĂ£ há»™i."
      },
      {
        questionId: 'w12_trans_tech_q02', level: 'elementary', orderIndex: 2,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh (dĂ¹ng "artificial intelligence" vĂ  "employment opportunities"):\n\n"Máº·c dĂ¹ trĂ­ tuá»‡ nhĂ¢n táº¡o cĂ³ thá»ƒ thay tháº¿ má»™t sá»‘ cĂ´ng viá»‡c, nhÆ°ng nĂ³ cÅ©ng táº¡o ra nhiá»u cÆ¡ há»™i viá»‡c lĂ m má»›i trong lÄ©nh vá»±c cĂ´ng nghá»‡."',
        correctAnswer: 'Although artificial intelligence may replace some jobs, it also creates many new employment opportunities in the technology sector.',
        modelAnswer: 'Although artificial intelligence may replace some jobs, it also creates many new employment opportunities in the technology sector.',
        fallbackKeywords: ['artificial intelligence', 'replace', 'jobs', 'employment opportunities', 'technology sector'],
        explanationVi: "'Although A, B' = máº·c dĂ¹ A nhÆ°ng B (tÆ°Æ¡ng pháº£n). 'Employment opportunities' = cÆ¡ há»™i viá»‡c lĂ m. 'May replace' = cĂ³ thá»ƒ thay tháº¿ (chÆ°a cháº¯c cháº¯n â€” dĂ¹ng modal Ä‘á»ƒ tháº­n trá»ng)."
      },
      {
        questionId: 'w12_trans_tech_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh (dĂ¹ng "reliance on technology" vĂ  "social skills"):\n\n"Sá»± phá»¥ thuá»™c quĂ¡ má»©c vĂ o cĂ´ng nghá»‡ Ä‘Ă£ lĂ m suy giáº£m ká»¹ nÄƒng xĂ£ há»™i cá»§a giá»›i tráº», khiáº¿n há» kĂ©m kháº£ nÄƒng giao tiáº¿p trá»±c tiáº¿p hÆ¡n."',
        correctAnswer: 'Excessive reliance on technology has eroded the social skills of young people, making them less capable of face-to-face communication.',
        modelAnswer: 'Excessive reliance on technology has eroded the social skills of young people, making them less capable of face-to-face communication.',
        fallbackKeywords: ['reliance on technology', 'eroded', 'social skills', 'young people', 'face-to-face'],
        explanationVi: "'Excessive reliance on' = sá»± phá»¥ thuá»™c quĂ¡ má»©c vĂ o. 'Erode' = bĂ o mĂ²n, lĂ m suy giáº£m dáº§n. '...making them less capable of' = khiáº¿n há» kĂ©m kháº£ nÄƒng. Present Perfect nháº¥n máº¡nh káº¿t quáº£ hiá»‡n táº¡i."
      },
      {
        questionId: 'w12_trans_tech_q04', level: 'intermediate', orderIndex: 4,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "artificial intelligence" vĂ  "industries"):\n\n"TrĂ­ tuá»‡ nhĂ¢n táº¡o Ä‘ang cĂ¡ch máº¡ng hĂ³a nhiá»u ngĂ nh cĂ´ng nghiá»‡p, tá»« y táº¿ Ä‘áº¿n tĂ i chĂ­nh."',
        correctAnswer: 'Artificial intelligence is revolutionising many industries, from healthcare to finance.',
        modelAnswer: 'Artificial intelligence is revolutionising many industries, from healthcare to finance.',
        fallbackKeywords: ['artificial intelligence', 'revolutionising', 'industries', 'healthcare', 'finance'],
        explanationVi: "'Revolutionise' = cĂ¡ch máº¡ng hĂ³a (British spelling: -ise). 'From A to B' = tá»« A Ä‘áº¿n B â€” liá»‡t kĂª pháº¡m vi rá»™ng. Present Continuous nháº¥n máº¡nh xu hÆ°á»›ng Ä‘ang diá»…n ra."
      },
      {
        questionId: 'w12_trans_tech_q05', level: 'intermediate', orderIndex: 5,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "social media" vĂ  "isolation"):\n\n"Máº·c dĂ¹ máº¡ng xĂ£ há»™i táº¡o ra nhiá»u káº¿t ná»‘i xĂ£ há»™i, nĂ³ cÅ©ng cĂ³ thá»ƒ dáº«n Ä‘áº¿n sá»± cĂ´ láº­p vĂ  lo Ă¢u á»Ÿ ngÆ°á»i dĂ¹ng."',
        correctAnswer: 'Although social media creates many social connections, it can also lead to isolation and anxiety among users.',
        modelAnswer: 'Although social media creates many social connections, it can also lead to isolation and anxiety among users.',
        fallbackKeywords: ['social media', 'connections', 'isolation', 'anxiety', 'users'],
        explanationVi: "'Although A, B' = máº·c dĂ¹ A nhÆ°ng B â€” cáº¥u trĂºc tÆ°Æ¡ng pháº£n trong má»™t cĂ¢u. 'Lead to isolation' = dáº«n Ä‘áº¿n sá»± cĂ´ láº­p. 'Among users' = trong sá»‘ ngÆ°á»i dĂ¹ng (há»c thuáº­t hÆ¡n 'for users')."
      },
      {
        questionId: 'w12_trans_tech_q06', level: 'intermediate', orderIndex: 6,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "misinformation" vĂ  "democratic societies"):\n\n"Sá»± lan truyá»n cá»§a thĂ´ng tin sai lá»‡ch trĂªn máº¡ng xĂ£ há»™i lĂ  má»‘i lo ngáº¡i ngĂ y cĂ ng tÄƒng Ä‘á»‘i vá»›i cĂ¡c xĂ£ há»™i dĂ¢n chá»§."',
        correctAnswer: 'The spread of misinformation on social media is a growing concern for democratic societies.',
        modelAnswer: 'The spread of misinformation on social media is a growing concern for democratic societies.',
        fallbackKeywords: ['spread', 'misinformation', 'social media', 'growing concern', 'democratic societies'],
        explanationVi: "'The spread of' = sá»± lan truyá»n cá»§a (danh tá»« hĂ³a). 'A growing concern' = má»‘i lo ngáº¡i ngĂ y cĂ ng tÄƒng. 'Democratic societies' = cĂ¡c xĂ£ há»™i dĂ¢n chá»§."
      },
      {
        questionId: 'w12_trans_tech_q07', level: 'intermediate', orderIndex: 7,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "automation" vĂ  "repetitive jobs"):\n\n"Tá»± Ä‘á»™ng hĂ³a Ä‘Ă£ nĂ¢ng cao nÄƒng suáº¥t lao Ä‘á»™ng, nhÆ°ng Ä‘á»“ng thá»i cÅ©ng loáº¡i bá» hĂ ng triá»‡u cĂ´ng viá»‡c láº·p Ä‘i láº·p láº¡i."',
        correctAnswer: 'Automation has increased labour productivity, but it has also eliminated millions of repetitive jobs.',
        modelAnswer: 'Automation has increased labour productivity, but it has also eliminated millions of repetitive jobs.',
        fallbackKeywords: ['automation', 'labour productivity', 'eliminated', 'repetitive jobs'],
        explanationVi: "'Labour productivity' = nÄƒng suáº¥t lao Ä‘á»™ng. 'Eliminate repetitive jobs' = loáº¡i bá» cĂ´ng viá»‡c láº·p Ä‘i láº·p láº¡i. Present Perfect 'has eliminated' nháº¥n máº¡nh káº¿t quáº£ Ä‘áº¿n hiá»‡n táº¡i."
      },
      {
        questionId: 'w12_trans_tech_q08', level: 'intermediate', orderIndex: 8,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "digital literacy" vĂ  "critical thinking"):\n\n"Äá»ƒ táº­n dá»¥ng tá»‘i Ä‘a lá»£i Ă­ch cá»§a cĂ´ng nghá»‡, má»i ngÆ°á»i cáº§n phĂ¡t triá»ƒn ká»¹ nÄƒng sá»‘ vĂ  tÆ° duy pháº£n biá»‡n."',
        correctAnswer: 'To maximise the benefits of technology, people need to develop digital literacy and critical thinking skills.',
        modelAnswer: 'To maximise the benefits of technology, people need to develop digital literacy and critical thinking skills.',
        fallbackKeywords: ['maximise benefits', 'technology', 'digital literacy', 'critical thinking'],
        explanationVi: "'To maximise' = Ä‘á»ƒ tá»‘i Ä‘a hĂ³a (má»¥c Ä‘Ă­ch). 'Digital literacy' = ká»¹ nÄƒng sá»‘. 'Critical thinking skills' = ká»¹ nÄƒng tÆ° duy pháº£n biá»‡n. 'People need to + V' = má»i ngÆ°á»i cáº§n pháº£i."
      },
      {
        questionId: 'w12_trans_tech_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "growing reliance" vĂ  "face-to-face communication"):\n\n"Sá»± phá»¥ thuá»™c ngĂ y cĂ ng tÄƒng vĂ o thiáº¿t bá»‹ ká»¹ thuáº­t sá»‘ Ä‘Ă£ lĂ m giáº£m kháº£ nÄƒng táº­p trung vĂ  ká»¹ nÄƒng giao tiáº¿p trá»±c tiáº¿p cá»§a nhiá»u ngÆ°á»i."',
        correctAnswer: 'The growing reliance on digital devices has diminished many people\'s ability to concentrate and their face-to-face communication skills.',
        modelAnswer: 'The growing reliance on digital devices has diminished many people\'s ability to concentrate and their face-to-face communication skills.',
        fallbackKeywords: ['growing reliance', 'digital devices', 'diminished', 'face-to-face communication'],
        explanationVi: "'Growing reliance on' = sá»± phá»¥ thuá»™c ngĂ y cĂ ng tÄƒng vĂ o. 'Diminish' = lĂ m giáº£m, thu háº¹p (há»c thuáº­t hÆ¡n 'reduce'). 'Face-to-face communication' = giao tiáº¿p trá»±c tiáº¿p."
      },
      {
        questionId: 'w12_trans_tech_q10', level: 'intermediate', orderIndex: 10,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "technology companies" vĂ  "privacy"):\n\n"CĂ¡c cĂ´ng ty cĂ´ng nghá»‡ lá»›n Ä‘ang thu tháº­p lÆ°á»£ng lá»›n dá»¯ liá»‡u ngÆ°á»i dĂ¹ng, lĂ m dáº¥y lĂªn lo ngáº¡i vá» quyá»n riĂªng tÆ°."',
        correctAnswer: 'Major technology companies are collecting vast amounts of user data, raising concerns about privacy.',
        modelAnswer: 'Major technology companies are collecting vast amounts of user data, raising concerns about privacy.',
        fallbackKeywords: ['technology companies', 'vast amounts', 'user data', 'raising concerns', 'privacy'],
        explanationVi: "'Vast amounts of' = lÆ°á»£ng lá»›n (máº¡nh hÆ¡n 'large amounts'). 'Raising concerns about' (participial clause) = lĂ m dáº¥y lĂªn lo ngáº¡i vá» â€” diá»…n Ä‘áº¡t há»‡ quáº£ Ä‘á»“ng thá»i."
      },
      {
        questionId: 'w12_trans_tech_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "stricter regulations" vĂ  "personal data"):\n\n"ChĂ­nh phá»§ nĂªn Ä‘áº·t ra cĂ¡c quy Ä‘á»‹nh cháº·t cháº½ hÆ¡n Ä‘á»ƒ kiá»ƒm soĂ¡t cĂ¡ch cĂ¡c cĂ´ng ty cĂ´ng nghá»‡ sá»­ dá»¥ng dá»¯ liá»‡u cĂ¡ nhĂ¢n."',
        correctAnswer: 'Governments should establish stricter regulations to control how technology companies use personal data.',
        modelAnswer: 'Governments should establish stricter regulations to control how technology companies use personal data.',
        fallbackKeywords: ['establish', 'stricter regulations', 'technology companies', 'personal data'],
        explanationVi: "'Establish regulations' = Ä‘áº·t ra/ban hĂ nh quy Ä‘á»‹nh. 'Stricter' = cháº·t cháº½ hÆ¡n (so sĂ¡nh hÆ¡n). 'To control how...' = Ä‘á»ƒ kiá»ƒm soĂ¡t cĂ¡ch... (má»‡nh Ä‘á» danh ngá»¯ lĂ m tĂ¢n ngá»¯)."
      },
      {
        questionId: 'w12_trans_tech_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "digital divide" vĂ  "global inequality"):\n\n"Khoáº£ng cĂ¡ch ká»¹ thuáº­t sá»‘ giá»¯a cĂ¡c nÆ°á»›c phĂ¡t triá»ƒn vĂ  Ä‘ang phĂ¡t triá»ƒn cĂ³ thá»ƒ lĂ m tráº§m trá»ng thĂªm báº¥t bĂ¬nh Ä‘áº³ng toĂ n cáº§u náº¿u khĂ´ng Ä‘Æ°á»£c giáº£i quyáº¿t ká»‹p thá»i."',
        correctAnswer: 'The digital divide between developed and developing countries may exacerbate global inequality if it is not addressed promptly.',
        modelAnswer: 'The digital divide between developed and developing countries may exacerbate global inequality if it is not addressed promptly.',
        fallbackKeywords: ['digital divide', 'developed countries', 'developing countries', 'exacerbate', 'global inequality'],
        explanationVi: "'The digital divide' = khoáº£ng cĂ¡ch ká»¹ thuáº­t sá»‘. 'Exacerbate' = lĂ m tráº§m trá»ng thĂªm (Band 7+ vocabulary). 'If not addressed promptly' = náº¿u khĂ´ng Ä‘Æ°á»£c giáº£i quyáº¿t ká»‹p thá»i."
      },
      {
        questionId: 'w12_trans_tech_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "technology in education" vĂ  "access to resources"):\n\n"Viá»‡c sá»­ dá»¥ng cĂ´ng nghá»‡ trong giĂ¡o dá»¥c cĂ³ thá»ƒ cáº£i thiá»‡n tráº£i nghiá»‡m há»c táº­p vĂ  giĂºp há»c sinh tiáº¿p cáº­n nguá»“n tĂ i nguyĂªn phong phĂº hÆ¡n."',
        correctAnswer: 'The use of technology in education can improve the learning experience and give students access to a wider range of resources.',
        modelAnswer: 'The use of technology in education can improve the learning experience and give students access to a wider range of resources.',
        fallbackKeywords: ['technology in education', 'learning experience', 'access to', 'resources'],
        explanationVi: "'The use of technology in education' = viá»‡c sá»­ dá»¥ng cĂ´ng nghá»‡ trong giĂ¡o dá»¥c (danh hĂ³a há»c thuáº­t). 'Give access to' = táº¡o Ä‘iá»u kiá»‡n tiáº¿p cáº­n. 'A wider range of' = pháº¡m vi Ä‘a dáº¡ng hÆ¡n."
      }
    ]
  },
  {
    week: 12, block: 'translation', orderIndex: 21,
    topicName: 'Dá»‹ch CĂ¢u - GiĂ¡o Dá»¥c & Thanh NiĂªn', topicEmoji: 'đŸ“',
    essayType: 'cause_effect',
    prompt: 'The education system in many countries is under pressure to prepare students for the challenges of the modern world. What are the causes and effects of this pressure?',
    vocabularyList: [
      { term: 'curriculum', definitionVi: 'chÆ°Æ¡ng trĂ¬nh há»c', example: 'The curriculum needs to be updated to include digital skills.' },
      { term: 'extracurricular activities', definitionVi: 'hoáº¡t Ä‘á»™ng ngoáº¡i khĂ³a', example: 'Extracurricular activities develop social and leadership skills.' },
      { term: 'student engagement', definitionVi: 'sá»± tham gia cá»§a há»c sinh', example: 'Technology can enhance student engagement in lessons.' },
      { term: 'critical thinking', definitionVi: 'tÆ° duy pháº£n biá»‡n', example: 'Modern education should prioritise critical thinking over rote learning.' },
      { term: 'academic achievement', definitionVi: 'thĂ nh tĂ­ch há»c táº­p', example: 'Academic achievement is often used as the sole measure of success.' }
    ],
    questions: [
      {
        questionId: 'w12_trans_edu_q01', level: 'beginner', orderIndex: 1,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"GiĂ¡o dá»¥c cháº¥t lÆ°á»£ng cao lĂ  ná»n táº£ng cá»§a sá»± phĂ¡t triá»ƒn kinh táº¿ vĂ  xĂ£ há»™i."',
        correctAnswer: 'High-quality education is the foundation of economic and social development.',
        modelAnswer: 'High-quality education is the foundation of economic and social development.',
        fallbackKeywords: ['education', 'foundation', 'economic', 'social development'],
        explanationVi: "'High-quality' = cháº¥t lÆ°á»£ng cao (tĂ­nh tá»« ghĂ©p, cĂ³ gáº¡ch ná»‘i khi Ä‘á»©ng trÆ°á»›c danh tá»«). 'Foundation of' = ná»n táº£ng cá»§a. CĂ¢u nĂ y phĂ¹ há»£p lĂ m introduction hoáº·c thesis statement."
      },
      {
        questionId: 'w12_trans_edu_q02', level: 'elementary', orderIndex: 2,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh (dĂ¹ng "homework" vĂ  "extracurricular activities"):\n\n"Há»c sinh cĂ³ quĂ¡ nhiá»u bĂ i táº­p vá» nhĂ  thÆ°á»ng cáº£m tháº¥y cÄƒng tháº³ng vĂ  khĂ´ng cĂ³ thá»i gian cho cĂ¡c hoáº¡t Ä‘á»™ng ngoáº¡i khĂ³a."',
        correctAnswer: 'Students who have too much homework often feel stressed and have no time for extracurricular activities.',
        modelAnswer: 'Students who have too much homework often feel stressed and have no time for extracurricular activities.',
        fallbackKeywords: ['homework', 'stressed', 'extracurricular activities', 'time'],
        explanationVi: "Má»‡nh Ä‘á» quan há»‡ 'who have too much homework' bá»• nghÄ©a cho 'students'. 'Have no time for' = khĂ´ng cĂ³ thá»i gian cho. 'Extracurricular activities' lĂ  cá»¥m quan trá»ng khi viáº¿t vá» Ă¡p lá»±c há»c táº­p."
      },
      {
        questionId: 'w12_trans_edu_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh (dĂ¹ng "integrating technology" vĂ  "digital world"):\n\n"Viá»‡c tĂ­ch há»£p cĂ´ng nghá»‡ vĂ o lá»›p há»c khĂ´ng chá»‰ nĂ¢ng cao sá»± tÆ°Æ¡ng tĂ¡c cá»§a há»c sinh mĂ  cĂ²n chuáº©n bá»‹ cho há» nhá»¯ng ká»¹ nÄƒng cáº§n thiáº¿t trong tháº¿ giá»›i ká»¹ thuáº­t sá»‘."',
        correctAnswer: 'Integrating technology into the classroom not only enhances student engagement but also prepares them with the skills needed in the digital world.',
        modelAnswer: 'Integrating technology into the classroom not only enhances student engagement but also prepares them with the skills needed in the digital world.',
        fallbackKeywords: ['integrating technology', 'classroom', 'enhances', 'student engagement', 'digital world', 'skills'],
        explanationVi: "Cáº¥u trĂºc 'not only A but also B' = khĂ´ng chá»‰ A mĂ  cĂ²n B. 'Enhances engagement' = nĂ¢ng cao sá»± tÆ°Æ¡ng tĂ¡c. Gerund phrase 'Integrating technology...' lĂ m chá»§ ngá»¯ lĂ  cáº¥u trĂºc há»c thuáº­t cao cáº¥p."
      },
      {
        questionId: 'w12_trans_edu_q04', level: 'intermediate', orderIndex: 4,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "academic pressure" vĂ  "mental health"):\n\n"Ăp lá»±c há»c táº­p quĂ¡ lá»›n cĂ³ thá»ƒ áº£nh hÆ°á»Ÿng tiĂªu cá»±c Ä‘áº¿n sá»©c khá»e tĂ¢m tháº§n cá»§a há»c sinh."',
        correctAnswer: 'Excessive academic pressure can negatively affect the mental health of students.',
        modelAnswer: 'Excessive academic pressure can negatively affect the mental health of students.',
        fallbackKeywords: ['excessive academic pressure', 'negatively affect', 'mental health', 'students'],
        explanationVi: "'Excessive academic pressure' = Ă¡p lá»±c há»c táº­p quĂ¡ lá»›n. 'Negatively affect' = áº£nh hÆ°á»Ÿng tiĂªu cá»±c Ä‘áº¿n. 'Can' diá»…n Ä‘áº¡t kháº£ nÄƒng â€” cáº©n tháº­n vá»›i má»©c Ä‘á»™ cháº¯c cháº¯n."
      },
      {
        questionId: 'w12_trans_edu_q05', level: 'intermediate', orderIndex: 5,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "rote learning" vĂ  "critical thinking"):\n\n"Nhiá»u há»‡ thá»‘ng giĂ¡o dá»¥c trĂªn tháº¿ giá»›i váº«n Æ°u tiĂªn há»c thuá»™c lĂ²ng hÆ¡n lĂ  phĂ¡t triá»ƒn tÆ° duy pháº£n biá»‡n."',
        correctAnswer: 'Many education systems around the world still prioritise rote learning over the development of critical thinking.',
        modelAnswer: 'Many education systems around the world still prioritise rote learning over the development of critical thinking.',
        fallbackKeywords: ['education systems', 'prioritise', 'rote learning', 'critical thinking'],
        explanationVi: "'Prioritise A over B' = Æ°u tiĂªn A hÆ¡n B. 'Rote learning' = há»c thuá»™c lĂ²ng, há»c váº¹t (khĂ´ng hiá»ƒu báº£n cháº¥t). 'The development of critical thinking' = sá»± phĂ¡t triá»ƒn tÆ° duy pháº£n biá»‡n."
      },
      {
        questionId: 'w12_trans_edu_q06', level: 'intermediate', orderIndex: 6,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "qualified teachers" vĂ  "quality of education"):\n\n"GiĂ¡o viĂªn cĂ³ trĂ¬nh Ä‘á»™ cao vĂ  Ä‘Æ°á»£c Ä‘Ă o táº¡o tá»‘t lĂ  yáº¿u tá»‘ quan trá»ng nháº¥t trong viá»‡c nĂ¢ng cao cháº¥t lÆ°á»£ng giĂ¡o dá»¥c."',
        correctAnswer: 'Highly qualified and well-trained teachers are the most important factor in improving the quality of education.',
        modelAnswer: 'Highly qualified and well-trained teachers are the most important factor in improving the quality of education.',
        fallbackKeywords: ['highly qualified', 'well-trained teachers', 'most important factor', 'quality of education'],
        explanationVi: "'Highly qualified' = cĂ³ trĂ¬nh Ä‘á»™ cao. 'Well-trained' = Ä‘Æ°á»£c Ä‘Ă o táº¡o tá»‘t (tĂ­nh tá»« ghĂ©p). 'The most important factor in + V-ing' = yáº¿u tá»‘ quan trá»ng nháº¥t trong viá»‡c."
      },
      {
        questionId: 'w12_trans_edu_q07', level: 'intermediate', orderIndex: 7,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "educational resources" vĂ  "rural areas"):\n\n"Sá»± thiáº¿u há»¥t tĂ i nguyĂªn giĂ¡o dá»¥c á»Ÿ cĂ¡c vĂ¹ng nĂ´ng thĂ´n dáº«n Ä‘áº¿n báº¥t bĂ¬nh Ä‘áº³ng trong cÆ¡ há»™i há»c táº­p."',
        correctAnswer: 'The lack of educational resources in rural areas leads to inequality in learning opportunities.',
        modelAnswer: 'The lack of educational resources in rural areas leads to inequality in learning opportunities.',
        fallbackKeywords: ['lack of educational resources', 'rural areas', 'inequality', 'learning opportunities'],
        explanationVi: "'The lack of' = sá»± thiáº¿u há»¥t (danh ngá»¯ lĂ m chá»§ ngá»¯). 'Rural areas' = vĂ¹ng nĂ´ng thĂ´n. 'Leads to inequality in' = dáº«n Ä‘áº¿n báº¥t bĂ¬nh Ä‘áº³ng trong."
      },
      {
        questionId: 'w12_trans_edu_q08', level: 'intermediate', orderIndex: 8,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "extracurricular activities" vĂ  "leadership skills"):\n\n"CĂ¡c hoáº¡t Ä‘á»™ng ngoáº¡i khĂ³a Ä‘Ă³ng vai trĂ² quan trá»ng trong viá»‡c phĂ¡t triá»ƒn ká»¹ nÄƒng lĂ£nh Ä‘áº¡o vĂ  ká»¹ nÄƒng xĂ£ há»™i cá»§a há»c sinh."',
        correctAnswer: 'Extracurricular activities play an important role in developing students\' leadership and social skills.',
        modelAnswer: 'Extracurricular activities play an important role in developing students\' leadership and social skills.',
        fallbackKeywords: ['extracurricular activities', 'play an important role', 'leadership skills', 'social skills'],
        explanationVi: "'Play an important role in + V-ing' = Ä‘Ă³ng vai trĂ² quan trá»ng trong viá»‡c. 'Students\'' = cá»§a há»c sinh (sá»Ÿ há»¯u cĂ¡ch). 'Leadership skills' = ká»¹ nÄƒng lĂ£nh Ä‘áº¡o."
      },
      {
        questionId: 'w12_trans_edu_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "early childhood education" vĂ  "long-term benefits"):\n\n"Äáº§u tÆ° vĂ o giĂ¡o dá»¥c máº§m non cĂ³ thá»ƒ mang láº¡i lá»£i Ă­ch lĂ¢u dĂ i cho cáº£ cĂ¡ nhĂ¢n láº«n xĂ£ há»™i."',
        correctAnswer: 'Investing in early childhood education can bring long-term benefits for both individuals and society.',
        modelAnswer: 'Investing in early childhood education can bring long-term benefits for both individuals and society.',
        fallbackKeywords: ['early childhood education', 'long-term benefits', 'individuals', 'society'],
        explanationVi: "'Early childhood education' = giĂ¡o dá»¥c máº§m non. 'Long-term benefits' = lá»£i Ă­ch lĂ¢u dĂ i. 'Both A and B' = cáº£ A láº«n B. Gerund 'Investing...' lĂ m chá»§ ngá»¯."
      },
      {
        questionId: 'w12_trans_edu_q10', level: 'intermediate', orderIndex: 10,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "reform the curriculum" vĂ  "digital age"):\n\n"Cáº§n pháº£i cáº£i cĂ¡ch chÆ°Æ¡ng trĂ¬nh há»c Ä‘á»ƒ trang bá»‹ cho há»c sinh nhá»¯ng ká»¹ nÄƒng cáº§n thiáº¿t trong thá»i Ä‘áº¡i sá»‘."',
        correctAnswer: 'It is necessary to reform the curriculum to equip students with the skills required in the digital age.',
        modelAnswer: 'It is necessary to reform the curriculum to equip students with the skills required in the digital age.',
        fallbackKeywords: ['reform', 'curriculum', 'equip students', 'skills required', 'digital age'],
        explanationVi: "'It is necessary to + V' = cáº§n pháº£i lĂ m gĂ¬. 'Reform the curriculum' = cáº£i cĂ¡ch chÆ°Æ¡ng trĂ¬nh há»c. 'Equip + O + with + N' = trang bá»‹ cho ai Ä‘iá»u gĂ¬."
      },
      {
        questionId: 'w12_trans_edu_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "parental involvement" vĂ  "academic achievement"):\n\n"Sá»± tham gia cá»§a phá»¥ huynh vĂ o quĂ¡ trĂ¬nh giĂ¡o dá»¥c cĂ³ liĂªn quan máº­t thiáº¿t Ä‘áº¿n thĂ nh tĂ­ch há»c táº­p cá»§a con cĂ¡i."',
        correctAnswer: 'Parental involvement in the education process is closely linked to children\'s academic achievement.',
        modelAnswer: 'Parental involvement in the education process is closely linked to children\'s academic achievement.',
        fallbackKeywords: ['parental involvement', 'education process', 'closely linked to', 'academic achievement'],
        explanationVi: "'Parental involvement' = sá»± tham gia cá»§a phá»¥ huynh. 'Is closely linked to' = cĂ³ liĂªn quan máº­t thiáº¿t Ä‘áº¿n. 'Children's academic achievement' = thĂ nh tĂ­ch há»c táº­p cá»§a tráº»."
      },
      {
        questionId: 'w12_trans_edu_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "online education" vĂ  "social development"):\n\n"Máº·c dĂ¹ giĂ¡o dá»¥c trá»±c tuyáº¿n cung cáº¥p tĂ­nh linh hoáº¡t, nĂ³ thiáº¿u tÆ°Æ¡ng tĂ¡c trá»±c tiáº¿p vá»‘n ráº¥t quan trá»ng cho sá»± phĂ¡t triá»ƒn xĂ£ há»™i cá»§a há»c sinh."',
        correctAnswer: 'Although online education provides flexibility, it lacks the face-to-face interaction that is crucial for students\' social development.',
        modelAnswer: 'Although online education provides flexibility, it lacks the face-to-face interaction that is crucial for students\' social development.',
        fallbackKeywords: ['online education', 'flexibility', 'face-to-face interaction', 'social development'],
        explanationVi: "'Although A, B' diá»…n Ä‘áº¡t tÆ°Æ¡ng pháº£n. 'Lack + N' = thiáº¿u. 'Crucial for' = ráº¥t quan trá»ng cho. Má»‡nh Ä‘á» quan há»‡ 'that is crucial...' bá»• nghÄ©a cho 'interaction'."
      },
      {
        questionId: 'w12_trans_edu_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "exam-oriented" vĂ  "holistic development"):\n\n"GiĂ¡o dá»¥c theo Ä‘á»‹nh hÆ°á»›ng thi cá»­ Ä‘ang táº¡o ra cÄƒng tháº³ng khĂ´ng cáº§n thiáº¿t vĂ  cáº£n trá»Ÿ sá»± phĂ¡t triá»ƒn toĂ n diá»‡n cá»§a há»c sinh."',
        correctAnswer: 'Exam-oriented education is creating unnecessary stress and hindering the holistic development of students.',
        modelAnswer: 'Exam-oriented education is creating unnecessary stress and hindering the holistic development of students.',
        fallbackKeywords: ['exam-oriented education', 'unnecessary stress', 'hindering', 'holistic development'],
        explanationVi: "'Exam-oriented education' = giĂ¡o dá»¥c theo Ä‘á»‹nh hÆ°á»›ng thi cá»­ (tĂ­nh tá»« ghĂ©p cĂ³ gáº¡ch ná»‘i). 'Hinder the development of' = cáº£n trá»Ÿ sá»± phĂ¡t triá»ƒn. 'Holistic development' = phĂ¡t triá»ƒn toĂ n diá»‡n."
      }
    ]
  },
  {
    week: 12, block: 'translation', orderIndex: 22,
    topicName: 'Dá»‹ch CĂ¢u - Sá»©c Khá»e & ÄĂ´ Thá»‹ HĂ³a', topicEmoji: 'đŸ™ï¸',
    essayType: 'effect_solution',
    prompt: 'Rapid urbanisation is having a significant impact on people\'s health and wellbeing in cities. What effects does this have, and what solutions can governments implement?',
    vocabularyList: [
      { term: 'sedentary lifestyle', definitionVi: 'lá»‘i sá»‘ng Ă­t váº­n Ä‘á»™ng', example: 'A sedentary lifestyle increases the risk of chronic disease.' },
      { term: 'obesity', definitionVi: 'bĂ©o phĂ¬', example: 'Childhood obesity is becoming an epidemic in many countries.' },
      { term: 'workplace stress', definitionVi: 'cÄƒng tháº³ng táº¡i nÆ¡i lĂ m viá»‡c', example: 'Workplace stress is a leading cause of absenteeism.' },
      { term: 'mental health', definitionVi: 'sá»©c khá»e tĂ¢m tháº§n', example: 'Mental health should be given the same priority as physical health.' },
      { term: 'employee turnover', definitionVi: 'tá»· lá»‡ nhĂ¢n viĂªn nghá»‰ viá»‡c', example: 'High stress levels contribute to employee turnover.' }
    ],
    questions: [
      {
        questionId: 'w12_trans_health_q01', level: 'beginner', orderIndex: 1,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Lá»‘i sá»‘ng Ă­t váº­n Ä‘á»™ng lĂ  nguyĂªn nhĂ¢n hĂ ng Ä‘áº§u dáº«n Ä‘áº¿n bĂ©o phĂ¬ vĂ  cĂ¡c bá»‡nh tim máº¡ch."',
        correctAnswer: 'A sedentary lifestyle is the leading cause of obesity and cardiovascular diseases.',
        modelAnswer: 'A sedentary lifestyle is the leading cause of obesity and cardiovascular diseases.',
        fallbackKeywords: ['sedentary lifestyle', 'leading cause', 'obesity', 'cardiovascular'],
        explanationVi: "'Sedentary lifestyle' = lá»‘i sá»‘ng Ă­t váº­n Ä‘á»™ng (tĂ­nh tá»« 'sedentary' = ngá»“i nhiá»u, khĂ´ng váº­n Ä‘á»™ng). 'The leading cause of' = nguyĂªn nhĂ¢n hĂ ng Ä‘áº§u cá»§a. 'Cardiovascular diseases' = bá»‡nh tim máº¡ch."
      },
      {
        questionId: 'w12_trans_health_q02', level: 'elementary', orderIndex: 2,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh (dĂ¹ng "obesity" vĂ  "sports facilities"):\n\n"ChĂ­nh phá»§ cĂ³ thá»ƒ giáº£m tá»· lá»‡ bĂ©o phĂ¬ báº±ng cĂ¡ch Ä‘áº§u tÆ° vĂ o cĂ¡c cÆ¡ sá»Ÿ thá»ƒ thao cĂ´ng cá»™ng vĂ  khuyáº¿n khĂ­ch ngÆ°á»i dĂ¢n váº­n Ä‘á»™ng nhiá»u hÆ¡n."',
        correctAnswer: 'Governments can reduce obesity rates by investing in public sports facilities and encouraging people to exercise more.',
        modelAnswer: 'Governments can reduce obesity rates by investing in public sports facilities and encouraging people to exercise more.',
        fallbackKeywords: ['governments', 'reduce', 'obesity', 'investing', 'sports facilities', 'exercise'],
        explanationVi: "'By + V-ing' = báº±ng cĂ¡ch. 'Invest in' = Ä‘áº§u tÆ° vĂ o. 'Encourage + O + to V' = khuyáº¿n khĂ­ch ai lĂ m gĂ¬. Ba cáº¥u trĂºc nĂ y thÆ°á»ng xuáº¥t hiá»‡n cĂ¹ng nhau khi Ä‘á» xuáº¥t giáº£i phĂ¡p trong IELTS."
      },
      {
        questionId: 'w12_trans_health_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh (dĂ¹ng "workplace stress" vĂ  "productivity"):\n\n"Má»©c Ä‘á»™ cÄƒng tháº³ng cao táº¡i nÆ¡i lĂ m viá»‡c khĂ´ng chá»‰ áº£nh hÆ°á»Ÿng Ä‘áº¿n sá»©c khá»e tĂ¢m tháº§n cá»§a nhĂ¢n viĂªn mĂ  cĂ²n lĂ m giáº£m nÄƒng suáº¥t lao Ä‘á»™ng vĂ  tÄƒng tá»· lá»‡ nghá»‰ viá»‡c."',
        correctAnswer: 'High levels of workplace stress not only affect the mental health of employees but also reduce work productivity and increase employee turnover.',
        modelAnswer: 'High levels of workplace stress not only affect the mental health of employees but also reduce work productivity and increase employee turnover.',
        fallbackKeywords: ['workplace stress', 'mental health', 'employees', 'productivity', 'employee turnover'],
        explanationVi: "'Not only A but also B' liá»‡t kĂª hai há»‡ quáº£. 'Employee turnover' = tá»· lá»‡ nhĂ¢n viĂªn nghá»‰ viá»‡c. 'High levels of' = má»©c Ä‘á»™ cao cá»§a â€” cĂ¡ch diá»…n Ä‘áº¡t há»c thuáº­t thay cho 'a lot of'."
      },
      {
        questionId: 'w12_trans_health_q04', level: 'intermediate', orderIndex: 4,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "air pollution" vĂ  "respiratory diseases"):\n\n"Ă” nhiá»…m khĂ´ng khĂ­ á»Ÿ cĂ¡c thĂ nh phá»‘ lá»›n Ä‘ang gĂ¢y ra sá»± gia tÄƒng Ä‘Ă¡ng ká»ƒ cĂ¡c bá»‡nh vá» hĂ´ háº¥p."',
        correctAnswer: 'Air pollution in major cities is causing a significant increase in respiratory diseases.',
        modelAnswer: 'Air pollution in major cities is causing a significant increase in respiratory diseases.',
        fallbackKeywords: ['air pollution', 'major cities', 'significant increase', 'respiratory diseases'],
        explanationVi: "'Air pollution' = Ă´ nhiá»…m khĂ´ng khĂ­. 'Significant increase in' = sá»± gia tÄƒng Ä‘Ă¡ng ká»ƒ. 'Respiratory diseases' = bá»‡nh vá» hĂ´ háº¥p (há»‡ hĂ´ háº¥p). Present Continuous nháº¥n máº¡nh xu hÆ°á»›ng Ä‘ang xáº£y ra."
      },
      {
        questionId: 'w12_trans_health_q05', level: 'intermediate', orderIndex: 5,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "rapid urbanisation" vĂ  "green spaces"):\n\n"ÄĂ´ thá»‹ hĂ³a nhanh chĂ³ng dáº«n Ä‘áº¿n tĂ¬nh tráº¡ng nhĂ  á»Ÿ cháº­t chá»™i vĂ  thiáº¿u khĂ´ng gian xanh cho cÆ° dĂ¢n."',
        correctAnswer: 'Rapid urbanisation leads to overcrowded housing and a lack of green spaces for residents.',
        modelAnswer: 'Rapid urbanisation leads to overcrowded housing and a lack of green spaces for residents.',
        fallbackKeywords: ['rapid urbanisation', 'overcrowded housing', 'lack of', 'green spaces', 'residents'],
        explanationVi: "'Rapid urbanisation' = Ä‘Ă´ thá»‹ hĂ³a nhanh chĂ³ng. 'Overcrowded housing' = nhĂ  á»Ÿ cháº­t chá»™i, quĂ¡ táº£i. 'Green spaces' = khĂ´ng gian xanh (cĂ´ng viĂªn, cĂ¢y cá»‘i)."
      },
      {
        questionId: 'w12_trans_health_q06', level: 'intermediate', orderIndex: 6,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "urban residents" vĂ  "physically active"):\n\n"ChĂ­nh phá»§ nĂªn xĂ¢y dá»±ng nhiá»u cĂ´ng viĂªn vĂ  cÆ¡ sá»Ÿ thá»ƒ thao cĂ´ng cá»™ng Ä‘á»ƒ khuyáº¿n khĂ­ch cÆ° dĂ¢n Ä‘Ă´ thá»‹ váº­n Ä‘á»™ng nhiá»u hÆ¡n."',
        correctAnswer: 'Governments should build more parks and public sports facilities to encourage urban residents to be more physically active.',
        modelAnswer: 'Governments should build more parks and public sports facilities to encourage urban residents to be more physically active.',
        fallbackKeywords: ['parks', 'public sports facilities', 'encourage', 'urban residents', 'physically active'],
        explanationVi: "'Urban residents' = cÆ° dĂ¢n Ä‘Ă´ thá»‹. 'Encourage + O + to V' = khuyáº¿n khĂ­ch ai lĂ m gĂ¬. 'Be physically active' = váº­n Ä‘á»™ng thá»ƒ cháº¥t tĂ­ch cá»±c (khĂ´ng nĂ³i 'exercise more' cho cĂ¢u nĂ y)."
      },
      {
        questionId: 'w12_trans_health_q07', level: 'intermediate', orderIndex: 7,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "work-related stress" vĂ  "urban workers"):\n\n"CÄƒng tháº³ng liĂªn quan Ä‘áº¿n cĂ´ng viá»‡c lĂ  má»™t trong nhá»¯ng nguyĂªn nhĂ¢n chĂ­nh gĂ¢y ra sá»©c khá»e tĂ¢m tháº§n kĂ©m á»Ÿ ngÆ°á»i lao Ä‘á»™ng thĂ nh thá»‹."',
        correctAnswer: 'Work-related stress is one of the main causes of poor mental health among urban workers.',
        modelAnswer: 'Work-related stress is one of the main causes of poor mental health among urban workers.',
        fallbackKeywords: ['work-related stress', 'main causes', 'poor mental health', 'urban workers'],
        explanationVi: "'Work-related stress' = cÄƒng tháº³ng liĂªn quan Ä‘áº¿n cĂ´ng viá»‡c (tĂ­nh tá»« ghĂ©p cĂ³ gáº¡ch ná»‘i). 'One of the main causes of' = má»™t trong nhá»¯ng nguyĂªn nhĂ¢n chĂ­nh gĂ¢y ra. 'Among urban workers' = trong sá»‘ ngÆ°á»i lao Ä‘á»™ng thĂ nh thá»‹."
      },
      {
        questionId: 'w12_trans_health_q08', level: 'intermediate', orderIndex: 8,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "sustainable urban planning" vĂ  "quality of life"):\n\n"Quy hoáº¡ch Ä‘Ă´ thá»‹ bá»n vá»¯ng, bao gá»“m há»‡ thá»‘ng giao thĂ´ng cĂ´ng cá»™ng hiá»‡u quáº£, cĂ³ thá»ƒ cáº£i thiá»‡n Ä‘Ă¡ng ká»ƒ cháº¥t lÆ°á»£ng cuá»™c sá»‘ng."',
        correctAnswer: 'Sustainable urban planning, including an efficient public transport system, can significantly improve the quality of life.',
        modelAnswer: 'Sustainable urban planning, including an efficient public transport system, can significantly improve the quality of life.',
        fallbackKeywords: ['sustainable urban planning', 'public transport', 'significantly improve', 'quality of life'],
        explanationVi: "'Sustainable urban planning' = quy hoáº¡ch Ä‘Ă´ thá»‹ bá»n vá»¯ng. 'Including...' (participial) = bao gá»“m, thĂªm thĂ´ng tin phá»¥. 'Significantly improve the quality of life' = cáº£i thiá»‡n Ä‘Ă¡ng ká»ƒ cháº¥t lÆ°á»£ng cuá»™c sá»‘ng."
      },
      {
        questionId: 'w12_trans_health_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "unhealthy diet" vĂ  "type 2 diabetes"):\n\n"Cháº¿ Ä‘á»™ Äƒn uá»‘ng khĂ´ng lĂ nh máº¡nh vĂ  thiáº¿u váº­n Ä‘á»™ng lĂ  hai yáº¿u tá»‘ chĂ­nh gĂ³p pháº§n vĂ o sá»± gia tÄƒng bá»‡nh tiá»ƒu Ä‘Æ°á»ng loáº¡i 2."',
        correctAnswer: 'An unhealthy diet and a lack of physical activity are two key factors contributing to the rise in type 2 diabetes.',
        modelAnswer: 'An unhealthy diet and a lack of physical activity are two key factors contributing to the rise in type 2 diabetes.',
        fallbackKeywords: ['unhealthy diet', 'lack of physical activity', 'key factors', 'type 2 diabetes'],
        explanationVi: "'An unhealthy diet' = cháº¿ Ä‘á»™ Äƒn uá»‘ng khĂ´ng lĂ nh máº¡nh. 'A lack of physical activity' = sá»± thiáº¿u váº­n Ä‘á»™ng. '...contributing to the rise in' (participial clause) = gĂ³p pháº§n vĂ o sá»± gia tÄƒng."
      },
      {
        questionId: 'w12_trans_health_q10', level: 'intermediate', orderIndex: 10,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "mental health programs" vĂ  "employee turnover"):\n\n"CĂ¡c chÆ°Æ¡ng trĂ¬nh sá»©c khá»e tĂ¢m tháº§n nÆ¡i lĂ m viá»‡c cĂ³ thá»ƒ giĂºp giáº£m tá»· lá»‡ nghá»‰ viá»‡c vĂ  nĂ¢ng cao nÄƒng suáº¥t lao Ä‘á»™ng."',
        correctAnswer: 'Workplace mental health programs can help reduce employee turnover and improve labour productivity.',
        modelAnswer: 'Workplace mental health programs can help reduce employee turnover and improve labour productivity.',
        fallbackKeywords: ['workplace mental health programs', 'employee turnover', 'labour productivity'],
        explanationVi: "'Workplace mental health programs' = chÆ°Æ¡ng trĂ¬nh sá»©c khá»e tĂ¢m tháº§n nÆ¡i lĂ m viá»‡c. 'Employee turnover' = tá»· lá»‡ nhĂ¢n viĂªn nghá»‰ viá»‡c. 'Labour productivity' = nÄƒng suáº¥t lao Ä‘á»™ng."
      },
      {
        questionId: 'w12_trans_health_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "population density" vĂ  "infectious diseases"):\n\n"Máº­t Ä‘á»™ dĂ¢n sá»‘ cao á»Ÿ cĂ¡c thĂ nh phá»‘ khiáº¿n viá»‡c ngÄƒn cháº·n sá»± lĂ¢y lan cá»§a bá»‡nh truyá»n nhiá»…m trá»Ÿ nĂªn khĂ³ khÄƒn hÆ¡n."',
        correctAnswer: 'High population density in cities makes it more difficult to prevent the spread of infectious diseases.',
        modelAnswer: 'High population density in cities makes it more difficult to prevent the spread of infectious diseases.',
        fallbackKeywords: ['population density', 'cities', 'prevent the spread', 'infectious diseases'],
        explanationVi: "'Population density' = máº­t Ä‘á»™ dĂ¢n sá»‘. 'Make it + adj + to V' = khiáº¿n viá»‡c gĂ¬ trá»Ÿ nĂªn (cáº¥u trĂºc hĂ¬nh thá»©c). 'The spread of infectious diseases' = sá»± lĂ¢y lan cá»§a bá»‡nh truyá»n nhiá»…m."
      },
      {
        questionId: 'w12_trans_health_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "healthcare infrastructure" vĂ  "access to medical services"):\n\n"Äáº§u tÆ° vĂ o cÆ¡ sá»Ÿ háº¡ táº§ng y táº¿ á»Ÿ vĂ¹ng ngoáº¡i Ă´ giĂºp giáº£m Ă¡p lá»±c lĂªn cĂ¡c bá»‡nh viá»‡n trung tĂ¢m vĂ  cáº£i thiá»‡n kháº£ nÄƒng tiáº¿p cáº­n dá»‹ch vá»¥ y táº¿."',
        correctAnswer: 'Investing in healthcare infrastructure in suburban areas helps reduce pressure on central hospitals and improves access to medical services.',
        modelAnswer: 'Investing in healthcare infrastructure in suburban areas helps reduce pressure on central hospitals and improves access to medical services.',
        fallbackKeywords: ['healthcare infrastructure', 'suburban areas', 'central hospitals', 'access to medical services'],
        explanationVi: "'Healthcare infrastructure' = cÆ¡ sá»Ÿ háº¡ táº§ng y táº¿. 'Suburban areas' = vĂ¹ng ngoáº¡i Ă´. 'Reduce pressure on' = giáº£m Ă¡p lá»±c lĂªn. 'Access to medical services' = kháº£ nÄƒng tiáº¿p cáº­n dá»‹ch vá»¥ y táº¿."
      },
      {
        questionId: 'w12_trans_health_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "banning advertisements" vĂ  "childhood obesity"):\n\n"ChĂ­nh sĂ¡ch cáº¥m quáº£ng cĂ¡o thá»±c pháº©m khĂ´ng lĂ nh máº¡nh nháº¯m Ä‘áº¿n tráº» em lĂ  biá»‡n phĂ¡p quan trá»ng Ä‘á»ƒ giáº£i quyáº¿t váº¥n Ä‘á» bĂ©o phĂ¬ á»Ÿ tráº» em."',
        correctAnswer: 'Banning advertisements for unhealthy food targeting children is an important measure to address the issue of childhood obesity.',
        modelAnswer: 'Banning advertisements for unhealthy food targeting children is an important measure to address the issue of childhood obesity.',
        fallbackKeywords: ['banning advertisements', 'unhealthy food', 'targeting children', 'childhood obesity'],
        explanationVi: "'Banning advertisements' = cáº¥m quáº£ng cĂ¡o (Gerund lĂ m chá»§ ngá»¯). 'Targeting children' = nháº¯m Ä‘áº¿n tráº» em (participial). 'Childhood obesity' = bĂ©o phĂ¬ á»Ÿ tráº» em. 'Measure to address' = biá»‡n phĂ¡p Ä‘á»ƒ giáº£i quyáº¿t."
      }
    ]
  },
  {
    week: 12, block: 'translation', orderIndex: 23,
    topicName: 'Dá»‹ch CĂ¢u - Kinh Táº¿ & ToĂ n Cáº§u HĂ³a', topicEmoji: 'đŸŒ',
    essayType: 'agree_disagree',
    prompt: 'Globalisation has brought significant changes to economies around the world, but its effects are not always positive. To what extent do you agree or disagree?',
    vocabularyList: [
      { term: 'globalisation', definitionVi: 'toĂ n cáº§u hĂ³a', example: 'Globalisation has opened up new markets for businesses worldwide.' },
      { term: 'income inequality', definitionVi: 'báº¥t bĂ¬nh Ä‘áº³ng thu nháº­p', example: 'Globalisation has contributed to rising income inequality in some countries.' },
      { term: 'minimum wage', definitionVi: 'lÆ°Æ¡ng tá»‘i thiá»ƒu', example: 'Raising the minimum wage can help reduce poverty.' },
      { term: 'labour costs', definitionVi: 'chi phĂ­ lao Ä‘á»™ng', example: 'High labour costs drive companies to automate their operations.' },
      { term: 'automation', definitionVi: 'tá»± Ä‘á»™ng hĂ³a', example: 'Automation in manufacturing is displacing millions of low-skilled workers.' }
    ],
    questions: [
      {
        questionId: 'w12_trans_econ_q01', level: 'beginner', orderIndex: 1,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"ToĂ n cáº§u hĂ³a Ä‘Ă£ táº¡o ra nhiá»u cÆ¡ há»™i kinh táº¿ nhÆ°ng cÅ©ng lĂ m gia tÄƒng khoáº£ng cĂ¡ch giĂ u nghĂ¨o."',
        correctAnswer: 'Globalisation has created many economic opportunities but has also widened the gap between the rich and the poor.',
        modelAnswer: 'Globalisation has created many economic opportunities but has also widened the gap between the rich and the poor.',
        fallbackKeywords: ['globalisation', 'economic opportunities', 'widened', 'rich', 'poor'],
        explanationVi: "'Widen the gap' = lĂ m gia tÄƒng khoáº£ng cĂ¡ch. 'The gap between the rich and the poor' = khoáº£ng cĂ¡ch giĂ u nghĂ¨o. Present Perfect nháº¥n máº¡nh káº¿t quáº£ hiá»‡n táº¡i tá»« quĂ¡ khá»©."
      },
      {
        questionId: 'w12_trans_econ_q02', level: 'elementary', orderIndex: 2,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh (dĂ¹ng "automation" vĂ  "low-skilled workers"):\n\n"Tá»± Ä‘á»™ng hĂ³a trong sáº£n xuáº¥t cĂ´ng nghiá»‡p Ä‘ang Ä‘e dá»a viá»‡c lĂ m cá»§a hĂ ng triá»‡u cĂ´ng nhĂ¢n tay nghá» tháº¥p trĂªn toĂ n tháº¿ giá»›i."',
        correctAnswer: 'Automation in industrial production is threatening the jobs of millions of low-skilled workers worldwide.',
        modelAnswer: 'Automation in industrial production is threatening the jobs of millions of low-skilled workers worldwide.',
        fallbackKeywords: ['automation', 'industrial production', 'threatening', 'low-skilled workers', 'worldwide'],
        explanationVi: "Present Continuous 'is threatening' nháº¥n máº¡nh quĂ¡ trĂ¬nh Ä‘ang diá»…n ra liĂªn tá»¥c. 'Low-skilled workers' = cĂ´ng nhĂ¢n tay nghá» tháº¥p. 'Millions of' = hĂ ng triá»‡u (khĂ´ng nĂ³i 'million of')."
      },
      {
        questionId: 'w12_trans_econ_q03', level: 'intermediate', orderIndex: 3,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh (dĂ¹ng "minimum wage" vĂ  "labour costs"):\n\n"Máº·c dĂ¹ tÄƒng lÆ°Æ¡ng tá»‘i thiá»ƒu cĂ³ thá»ƒ cáº£i thiá»‡n Ä‘á»i sá»‘ng cá»§a ngÆ°á»i lao Ä‘á»™ng thu nháº­p tháº¥p, má»™t sá»‘ doanh nghiá»‡p nhá» cĂ³ thá»ƒ pháº£i thu háº¹p hoáº·c Ä‘Ă³ng cá»­a do chi phĂ­ lao Ä‘á»™ng tÄƒng cao."',
        correctAnswer: 'Although raising the minimum wage may improve the living standards of low-income workers, some small businesses may have to downsize or close due to increased labour costs.',
        modelAnswer: 'Although raising the minimum wage may improve the living standards of low-income workers, some small businesses may have to downsize or close due to increased labour costs.',
        fallbackKeywords: ['minimum wage', 'improve', 'low-income workers', 'small businesses', 'downsize', 'labour costs'],
        explanationVi: "'Although + clause, clause' diá»…n Ä‘áº¡t tÆ°Æ¡ng pháº£n. 'May have to + V' = cĂ³ thá»ƒ pháº£i. 'Downsize' = thu háº¹p quy mĂ´. 'Due to' = do, vĂ¬ (giá»›i tá»«, theo sau lĂ  danh tá»«/noun phrase)."
      },
      {
        questionId: 'w12_trans_econ_q04', level: 'intermediate', orderIndex: 4,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "international trade" vĂ  "developing countries"):\n\n"ToĂ n cáº§u hĂ³a Ä‘Ă£ thĂºc Ä‘áº©y thÆ°Æ¡ng máº¡i quá»‘c táº¿ vĂ  táº¡o ra nhiá»u cÆ¡ há»™i viá»‡c lĂ m má»›i á»Ÿ cĂ¡c nÆ°á»›c Ä‘ang phĂ¡t triá»ƒn."',
        correctAnswer: 'Globalisation has boosted international trade and created many new employment opportunities in developing countries.',
        modelAnswer: 'Globalisation has boosted international trade and created many new employment opportunities in developing countries.',
        fallbackKeywords: ['globalisation', 'international trade', 'employment opportunities', 'developing countries'],
        explanationVi: "'Boost international trade' = thĂºc Ä‘áº©y thÆ°Æ¡ng máº¡i quá»‘c táº¿ ('boost' máº¡nh hÆ¡n 'increase'). 'Employment opportunities' = cÆ¡ há»™i viá»‡c lĂ m. Present Perfect nháº¥n máº¡nh káº¿t quáº£ Ä‘áº¿n hiá»‡n táº¡i."
      },
      {
        questionId: 'w12_trans_econ_q05', level: 'intermediate', orderIndex: 5,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "economic growth" vĂ  "local cultural identity"):\n\n"Máº·c dĂ¹ toĂ n cáº§u hĂ³a mang láº¡i tÄƒng trÆ°á»Ÿng kinh táº¿, nĂ³ cÅ©ng cĂ³ thá»ƒ gĂ¢y ra sá»± xĂ³i mĂ²n báº£n sáº¯c vÄƒn hĂ³a Ä‘á»‹a phÆ°Æ¡ng."',
        correctAnswer: 'Although globalisation brings economic growth, it can also cause the erosion of local cultural identity.',
        modelAnswer: 'Although globalisation brings economic growth, it can also cause the erosion of local cultural identity.',
        fallbackKeywords: ['globalisation', 'economic growth', 'erosion', 'local cultural identity'],
        explanationVi: "'Erosion' = sá»± xĂ³i mĂ²n, mai má»™t dáº§n (hĂ¬nh áº£nh há»c thuáº­t). 'Local cultural identity' = báº£n sáº¯c vÄƒn hĂ³a Ä‘á»‹a phÆ°Æ¡ng. 'Although A, B' diá»…n Ä‘áº¡t tÆ°Æ¡ng pháº£n."
      },
      {
        questionId: 'w12_trans_econ_q06', level: 'intermediate', orderIndex: 6,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "income inequality" vĂ  "distributed equally"):\n\n"Báº¥t bĂ¬nh Ä‘áº³ng thu nháº­p Ä‘Ă£ trá»Ÿ thĂ nh váº¥n Ä‘á» nghiĂªm trá»ng hÆ¡n trong bá»‘i cáº£nh toĂ n cáº§u hĂ³a, khi lá»£i Ă­ch kinh táº¿ khĂ´ng Ä‘Æ°á»£c phĂ¢n phá»‘i Ä‘á»“ng Ä‘á»u."',
        correctAnswer: 'Income inequality has become a more serious issue in the context of globalisation, as economic benefits are not distributed equally.',
        modelAnswer: 'Income inequality has become a more serious issue in the context of globalisation, as economic benefits are not distributed equally.',
        fallbackKeywords: ['income inequality', 'globalisation', 'economic benefits', 'distributed equally'],
        explanationVi: "'In the context of' = trong bá»‘i cáº£nh. 'Distributed equally' = Ä‘Æ°á»£c phĂ¢n phá»‘i Ä‘á»“ng Ä‘á»u (passive). 'As' = vĂ¬, bá»Ÿi vĂ¬ (liĂªn tá»« nguyĂªn nhĂ¢n)."
      },
      {
        questionId: 'w12_trans_econ_q07', level: 'intermediate', orderIndex: 7,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "multinational corporations" vĂ  "job losses"):\n\n"Nhiá»u táº­p Ä‘oĂ n Ä‘a quá»‘c gia chuyá»ƒn sáº£n xuáº¥t sang cĂ¡c nÆ°á»›c cĂ³ chi phĂ­ lao Ä‘á»™ng tháº¥p, gĂ¢y ra máº¥t viá»‡c lĂ m á»Ÿ cĂ¡c nÆ°á»›c phĂ¡t triá»ƒn."',
        correctAnswer: 'Many multinational corporations relocate their production to countries with lower labour costs, causing job losses in developed nations.',
        modelAnswer: 'Many multinational corporations relocate their production to countries with lower labour costs, causing job losses in developed nations.',
        fallbackKeywords: ['multinational corporations', 'relocate', 'lower labour costs', 'job losses', 'developed nations'],
        explanationVi: "'Multinational corporations' = táº­p Ä‘oĂ n Ä‘a quá»‘c gia. 'Relocate production to' = chuyá»ƒn sáº£n xuáº¥t sang. '...causing job losses' (participial clause) = gĂ¢y ra máº¥t viá»‡c lĂ m â€” diá»…n Ä‘áº¡t há»‡ quáº£ trá»±c tiáº¿p."
      },
      {
        questionId: 'w12_trans_econ_q08', level: 'intermediate', orderIndex: 8,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "income redistribution" vĂ  "implement policies"):\n\n"Äá»ƒ Ä‘áº£m báº£o toĂ n cáº§u hĂ³a mang láº¡i lá»£i Ă­ch cho táº¥t cáº£ má»i ngÆ°á»i, chĂ­nh phá»§ cáº§n thá»±c hiá»‡n cĂ¡c chĂ­nh sĂ¡ch phĂ¢n phá»‘i láº¡i thu nháº­p hiá»‡u quáº£."',
        correctAnswer: 'To ensure that globalisation benefits everyone, governments need to implement effective income redistribution policies.',
        modelAnswer: 'To ensure that globalisation benefits everyone, governments need to implement effective income redistribution policies.',
        fallbackKeywords: ['ensure', 'globalisation benefits', 'implement', 'income redistribution policies'],
        explanationVi: "'To ensure that' = Ä‘á»ƒ Ä‘áº£m báº£o ráº±ng. 'Implement policies' = thá»±c thi/thá»±c hiá»‡n chĂ­nh sĂ¡ch. 'Income redistribution' = phĂ¢n phá»‘i láº¡i thu nháº­p."
      },
      {
        questionId: 'w12_trans_econ_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "labour costs" vĂ  "production facilities abroad"):\n\n"Chi phĂ­ lao Ä‘á»™ng cao á»Ÿ cĂ¡c nÆ°á»›c phĂ¡t triá»ƒn lĂ  má»™t trong nhá»¯ng lĂ½ do chĂ­nh khiáº¿n cĂ¡c cĂ´ng ty chuyá»ƒn cÆ¡ sá»Ÿ sáº£n xuáº¥t ra nÆ°á»›c ngoĂ i."',
        correctAnswer: 'High labour costs in developed countries are one of the main reasons why companies move their production facilities abroad.',
        modelAnswer: 'High labour costs in developed countries are one of the main reasons why companies move their production facilities abroad.',
        fallbackKeywords: ['labour costs', 'developed countries', 'main reasons', 'production facilities', 'abroad'],
        explanationVi: "'Labour costs' = chi phĂ­ lao Ä‘á»™ng. 'Production facilities' = cÆ¡ sá»Ÿ sáº£n xuáº¥t. 'Move abroad' = chuyá»ƒn ra nÆ°á»›c ngoĂ i. 'One of the main reasons why' = má»™t trong nhá»¯ng lĂ½ do chĂ­nh khiáº¿n."
      },
      {
        questionId: 'w12_trans_econ_q10', level: 'intermediate', orderIndex: 10,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "information technology" vĂ  "cross-border trade"):\n\n"Nhá»¯ng tiáº¿n bá»™ trong cĂ´ng nghá»‡ thĂ´ng tin Ä‘Ă£ thĂºc Ä‘áº©y toĂ n cáº§u hĂ³a báº±ng cĂ¡ch lĂ m cho giao tiáº¿p vĂ  thÆ°Æ¡ng máº¡i xuyĂªn biĂªn giá»›i trá»Ÿ nĂªn dá»… dĂ ng hÆ¡n."',
        correctAnswer: 'Advances in information technology have facilitated globalisation by making cross-border communication and trade easier.',
        modelAnswer: 'Advances in information technology have facilitated globalisation by making cross-border communication and trade easier.',
        fallbackKeywords: ['advances in technology', 'facilitated globalisation', 'cross-border', 'communication', 'trade'],
        explanationVi: "'Advances in' = nhá»¯ng tiáº¿n bá»™ trong. 'Facilitate' = táº¡o Ä‘iá»u kiá»‡n thuáº­n lá»£i cho, thĂºc Ä‘áº©y (Band 7+ thay cho 'help'). 'Cross-border' = xuyĂªn biĂªn giá»›i. 'By + V-ing' = báº±ng cĂ¡ch."
      },
      {
        questionId: 'w12_trans_econ_q11', level: 'intermediate', orderIndex: 11,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "tend to benefit" vĂ  "resource exploitation"):\n\n"Trong khi cĂ¡c nÆ°á»›c phĂ¡t triá»ƒn thÆ°á»ng Ä‘Æ°á»£c hÆ°á»Ÿng lá»£i nhiá»u hÆ¡n tá»« toĂ n cáº§u hĂ³a, cĂ¡c nÆ°á»›c nghĂ¨o hÆ¡n cĂ³ thá»ƒ pháº£i chá»‹u háº­u quáº£ nhÆ° khai thĂ¡c tĂ i nguyĂªn quĂ¡ má»©c."',
        correctAnswer: 'While developed countries tend to benefit more from globalisation, poorer nations may suffer negative consequences such as excessive resource exploitation.',
        modelAnswer: 'While developed countries tend to benefit more from globalisation, poorer nations may suffer negative consequences such as excessive resource exploitation.',
        fallbackKeywords: ['tend to benefit', 'globalisation', 'poorer nations', 'resource exploitation'],
        explanationVi: "'Tend to + V' = cĂ³ xu hÆ°á»›ng. 'Suffer negative consequences' = chá»‹u háº­u quáº£ tiĂªu cá»±c. 'Excessive resource exploitation' = khai thĂ¡c tĂ i nguyĂªn quĂ¡ má»©c. 'While A, B' diá»…n Ä‘áº¡t tÆ°Æ¡ng pháº£n."
      },
      {
        questionId: 'w12_trans_econ_q12', level: 'intermediate', orderIndex: 12,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "small and medium-sized enterprises" vĂ  "competitive challenges"):\n\n"ToĂ n cáº§u hĂ³a Ä‘Ă£ má»Ÿ ra thá»‹ trÆ°á»ng má»›i cho doanh nghiá»‡p vá»«a vĂ  nhá», nhÆ°ng cÅ©ng Ä‘áº·t ra thĂ¡ch thá»©c cáº¡nh tranh lá»›n tá»« cĂ¡c táº­p Ä‘oĂ n quá»‘c táº¿."',
        correctAnswer: 'Globalisation has opened up new markets for small and medium-sized enterprises, but it has also posed significant competitive challenges from international corporations.',
        modelAnswer: 'Globalisation has opened up new markets for small and medium-sized enterprises, but it has also posed significant competitive challenges from international corporations.',
        fallbackKeywords: ['small and medium-sized enterprises', 'new markets', 'competitive challenges', 'international corporations'],
        explanationVi: "'Small and medium-sized enterprises (SMEs)' = doanh nghiá»‡p vá»«a vĂ  nhá». 'Pose challenges' = Ä‘áº·t ra thĂ¡ch thá»©c. 'International corporations' = táº­p Ä‘oĂ n quá»‘c táº¿."
      },
      {
        questionId: 'w12_trans_econ_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "minimum wages" vĂ  "substandard working conditions"):\n\n"LÆ°Æ¡ng tá»‘i thiá»ƒu tháº¥p á»Ÿ cĂ¡c nÆ°á»›c Ä‘ang phĂ¡t triá»ƒn thu hĂºt Ä‘áº§u tÆ° nÆ°á»›c ngoĂ i nhÆ°ng Ä‘á»“ng thá»i duy trĂ¬ Ä‘iá»u kiá»‡n lĂ m viá»‡c khĂ´ng Ä‘áº¡t chuáº©n."',
        correctAnswer: 'Low minimum wages in developing countries attract foreign investment but simultaneously maintain substandard working conditions.',
        modelAnswer: 'Low minimum wages in developing countries attract foreign investment but simultaneously maintain substandard working conditions.',
        fallbackKeywords: ['minimum wages', 'developing countries', 'foreign investment', 'substandard working conditions'],
        explanationVi: "'Low minimum wages' = lÆ°Æ¡ng tá»‘i thiá»ƒu tháº¥p. 'Attract foreign investment' = thu hĂºt Ä‘áº§u tÆ° nÆ°á»›c ngoĂ i. 'Substandard working conditions' = Ä‘iá»u kiá»‡n lĂ m viá»‡c khĂ´ng Ä‘áº¡t chuáº©n. 'Simultaneously' = Ä‘á»“ng thá»i."
      }
    ]
  },

  // â”€â”€â”€ WEEK 11 (continued): Prison vs. Rehabilitation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    week: 11, block: 'mixed', orderIndex: 18,
    topicName: 'Prison vs. Rehabilitation', topicEmoji: 'đŸ”’',
    essayType: 'discuss_both_views',
    prompt: 'Some people believe that the best way to reduce crime is to give longer prison sentences. Others think there are better ways to reduce crime. Discuss both views and give your own opinion.',
    hintAdvantages: [],
    hintDisadvantages: [],
    vocabularyList: [
      { term: 'prison sentence', definitionVi: 'Ă¡n tĂ¹', example: 'Longer prison sentences are sometimes seen as a deterrent to crime.' },
      { term: 'deterrent', definitionVi: 'biá»‡n phĂ¡p rÄƒn Ä‘e', example: 'Long prison sentences may act as a deterrent, discouraging potential offenders.' },
      { term: 'rehabilitation', definitionVi: 'cáº£i táº¡o', example: 'Rehabilitation programs help prisoners become productive members of society.' },
      { term: 're-offend', definitionVi: 'tĂ¡i pháº¡m', example: 'Without rehabilitation, many offenders are likely to re-offend after release.' },
      { term: 'law enforcement', definitionVi: 'thá»±c thi phĂ¡p luáº­t', example: 'Strong law enforcement is needed to maintain public order.' },
      { term: 'alternative punishment', definitionVi: 'hĂ¬nh pháº¡t thay tháº¿', example: 'Community service is an alternative punishment to imprisonment.' },
      { term: 'moral education', definitionVi: 'giĂ¡o dá»¥c Ä‘áº¡o Ä‘á»©c', example: 'Moral education in schools can help prevent youth crime.' },
      { term: 'community service', definitionVi: 'lao Ä‘á»™ng cĂ´ng Ă­ch', example: 'Community service allows offenders to repay their debt to society.' },
      { term: 'counseling', definitionVi: 'tÆ° váº¥n tĂ¢m lĂ½', example: 'Counseling helps offenders address the root causes of their behaviour.' },
      { term: 'reduce crime', definitionVi: 'giáº£m tá»™i pháº¡m', example: 'Both stricter sentences and rehabilitation aim to reduce crime in the long term.' },
      { term: 'root causes', definitionVi: 'nguyĂªn nhĂ¢n gá»‘c rá»…', example: 'Prison alone does not tackle the root causes of criminal behaviour.' },
      { term: 'vocational training', definitionVi: 'Ä‘Ă o táº¡o nghá»', example: 'Vocational training gives prisoners marketable skills for life after release.' },
      { term: 'reintegrate into society', definitionVi: 'tĂ¡i hĂ²a nháº­p xĂ£ há»™i', example: 'Rehabilitation helps offenders reintegrate into society as law-abiding citizens.' },
      { term: 'capital punishment', definitionVi: 'Ă¡n tá»­ hĂ¬nh', example: 'Capital punishment remains a controversial topic in criminal justice debates.' },
      { term: 'social support', definitionVi: 'há»— trá»£ xĂ£ há»™i', example: 'Social support networks are essential for offenders returning to the community.' }
    ],
    questions: [
      {
        questionId: 'w11t18_q01', level: 'beginner', orderIndex: 1,
        type: 'essay_type_recognition',
        questionText: 'Äá» bĂ i: "Some people believe that the best way to reduce crime is to give longer prison sentences. Others think there are better ways to reduce crime. Discuss both views and give your own opinion." ÄĂ¢y lĂ  dáº¡ng essay gĂ¬?',
        options: ['Advantages & Disadvantages', 'Cause & Effect', 'Discuss Both Views', 'Opinion Essay'],
        correctAnswer: 'Discuss Both Views',
        explanationVi: 'Cá»¥m "Discuss both views and give your own opinion" xuáº¥t hiá»‡n trá»±c tiáº¿p. View 1 = Ă¡n tĂ¹ dĂ i; View 2 = cĂ¡c phÆ°Æ¡ng phĂ¡p thay tháº¿ nhÆ° cáº£i táº¡o vĂ  giĂ¡o dá»¥c.'
      },
      {
        questionId: 'w11t18_q02', level: 'beginner', orderIndex: 2,
        type: 'fill_blank',
        questionText: 'Äiá»n tá»« cĂ²n thiáº¿u:\n\n"Longer prison sentences may act as a strong _____, discouraging potential offenders from committing crimes."',
        correctAnswer: 'deterrent',
        explanationVi: '"Deterrent" = biá»‡n phĂ¡p rÄƒn Ä‘e â€” tá»« khĂ³a quan trá»ng khi láº­p luáº­n vá» tĂ¡c dá»¥ng cá»§a hĂ¬nh pháº¡t tĂ¹.'
      },
      {
        questionId: 'w11t18_q03', level: 'beginner', orderIndex: 3,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Má»™t sá»‘ ngÆ°á»i cho ráº±ng cĂ¡ch tá»‘t nháº¥t Ä‘á»ƒ giáº£m tá»™i pháº¡m lĂ  Ă¡p dá»¥ng má»©c Ă¡n tĂ¹ dĂ i hÆ¡n."',
        correctAnswer: 'Some people argue that the best way to reduce crime is to impose longer prison sentences.',
        modelAnswer: 'Some people argue that the best way to reduce crime is to impose longer prison sentences.',
        fallbackKeywords: ['reduce crime', 'longer prison sentences', 'argue', 'impose'],
        explanationVi: "'Impose prison sentences' = Ă¡p Ä‘áº·t/tuyĂªn bá»‘ má»©c Ă¡n tĂ¹. 'The best way to' = cĂ¡ch tá»‘t nháº¥t Ä‘á»ƒ. 'Some people argue that' = cáº¥u trĂºc trĂ¬nh bĂ y quan Ä‘iá»ƒm."
      },
      {
        questionId: 'w11t18_q04', level: 'beginner', orderIndex: 4,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Tuy nhiĂªn, nhiá»u ngÆ°á»i tin ráº±ng tÄƒng Ă¡n tĂ¹ khĂ´ng giáº£i quyáº¿t nguyĂªn nhĂ¢n gá»‘c rá»… cá»§a tá»™i pháº¡m."',
        correctAnswer: 'However, many people believe that increasing prison sentences does not address the root causes of crime.',
        modelAnswer: 'However, many people believe that increasing prison sentences does not address the root causes of crime.',
        fallbackKeywords: ['root causes', 'crime', 'prison sentences', 'address'],
        explanationVi: "'Root causes' = nguyĂªn nhĂ¢n gá»‘c rá»…. 'Address the root causes' = giáº£i quyáº¿t nguyĂªn nhĂ¢n gá»‘c rá»…. 'Does not address' = khĂ´ng giáº£i quyáº¿t."
      },
      {
        questionId: 'w11t18_q05', level: 'elementary', orderIndex: 5,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"CĂ¡c chÆ°Æ¡ng trĂ¬nh cáº£i táº¡o giĂºp tĂ¹ nhĂ¢n hĂ²a nháº­p láº¡i xĂ£ há»™i vĂ  giáº£m tĂ¡i pháº¡m."',
        correctAnswer: 'Rehabilitation programs help prisoners reintegrate into society and reduce the likelihood of re-offending.',
        modelAnswer: 'Rehabilitation programs help prisoners reintegrate into society and reduce the likelihood of re-offending.',
        fallbackKeywords: ['rehabilitation programs', 'reintegrate', 'society', 're-offending', 'prisoners'],
        explanationVi: "'Reintegrate into society' = tĂ¡i hĂ²a nháº­p xĂ£ há»™i. 'Reduce the likelihood of re-offending' = giáº£m kháº£ nÄƒng tĂ¡i pháº¡m. 'Help + O + V' = giĂºp ai lĂ m gĂ¬."
      },
      {
        questionId: 'w11t18_q06', level: 'elementary', orderIndex: 6,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"GiĂ¡o dá»¥c Ä‘áº¡o Ä‘á»©c vĂ  hÆ°á»›ng nghiá»‡p cĂ³ thá»ƒ giĂºp thanh thiáº¿u niĂªn trĂ¡nh xa tá»™i pháº¡m."',
        correctAnswer: 'Moral education and vocational training can help young people stay away from crime.',
        modelAnswer: 'Moral education and vocational training can help young people stay away from crime.',
        fallbackKeywords: ['moral education', 'vocational training', 'young people', 'crime'],
        explanationVi: "'Moral education' = giĂ¡o dá»¥c Ä‘áº¡o Ä‘á»©c. 'Vocational training' = Ä‘Ă o táº¡o nghá». 'Stay away from crime' = trĂ¡nh xa tá»™i pháº¡m."
      },
      {
        questionId: 'w11t18_q07', level: 'elementary', orderIndex: 7,
        type: 'rearrange',
        questionText: 'Sáº¯p xáº¿p thĂ nh cĂ¢u hoĂ n chá»‰nh:\n\n[longer prison sentences / Whilst / potential criminals, / may / deter / they / do not / tackle / poverty, / unemployment, / such / as / root causes / the / and / family breakdown]',
        correctAnswer: 'Whilst longer prison sentences may deter potential criminals, they do not tackle the root causes such as poverty, unemployment, and family breakdown.',
        explanationVi: '"Whilst" = trong khi Ä‘Ă³ (British English). "Deter" = rÄƒn Ä‘e. "Tackle root causes" = giáº£i quyáº¿t nguyĂªn nhĂ¢n gá»‘c rá»….'
      },
      {
        questionId: 'w11t18_q08', level: 'elementary', orderIndex: 8,
        type: 'error_correction',
        questionText: 'CĂ¢u sau cĂ³ lá»—i gĂ¬? HĂ£y sá»­a láº¡i:\n\n"Community service is often seen as a more effectively alternative to imprisonment for minor offences."',
        correctAnswer: 'Community service is often seen as a more effective alternative to imprisonment for minor offences.',
        modelAnswer: 'Community service is often seen as a more effective alternative to imprisonment for minor offences.',
        fallbackKeywords: ['community service', 'effective alternative', 'imprisonment', 'offences'],
        explanationVi: "Lá»—i: \"more effectively\" sai â€” pháº£i dĂ¹ng tĂ­nh tá»« \"effective\" Ä‘á»ƒ bá»• nghÄ©a cho danh tá»« \"alternative\"."
      },
      {
        questionId: 'w11t18_q09', level: 'intermediate', orderIndex: 9,
        type: 'translation',
        questionText: 'Dá»‹ch cĂ¢u sau sang tiáº¿ng Anh:\n\n"Giáº£i quyáº¿t cáº£ nguyĂªn nhĂ¢n gá»‘c rá»… vĂ  háº­u quáº£ cá»§a tá»™i pháº¡m, Ä‘á»“ng thá»i há»— trá»£ tĂ¹ nhĂ¢n hĂ²a nháº­p trá»Ÿ láº¡i xĂ£ há»™i, sáº½ giĂºp xĂ£ há»™i an toĂ n hÆ¡n."',
        correctAnswer: 'Addressing both the root causes of crime and supporting offenders to reintegrate into society will ultimately contribute to a safer community.',
        modelAnswer: 'Addressing both the root causes of crime and supporting offenders to reintegrate into society will ultimately contribute to a safer community.',
        fallbackKeywords: ['root causes', 'reintegrate', 'society', 'safer community', 'addressing'],
        explanationVi: "'Addressing both A and B' = giáº£i quyáº¿t cáº£ A láº«n B. 'Contribute to a safer community' = gĂ³p pháº§n táº¡o ra xĂ£ há»™i an toĂ n hÆ¡n. 'Ultimately' = cuá»‘i cĂ¹ng."
      },
      {
        questionId: 'w11t18_q10', level: 'intermediate', orderIndex: 10,
        type: 'paraphrase',
        questionText: 'Viáº¿t láº¡i cĂ¢u sau mĂ  khĂ´ng dĂ¹ng: best way, reduce crime, longer prison sentences, better ways:\n\n"Some people believe that the best way to reduce crime is to give longer prison sentences. Others think there are better ways to reduce crime."',
        correctAnswer: 'While a segment of the population maintains that extending custodial sentences is the most effective means of curbing criminal activity, others contend that alternative, more rehabilitative approaches hold greater promise in addressing this social challenge.',
        modelAnswer: 'While a segment of the population maintains that extending custodial sentences is the most effective means of curbing criminal activity, others contend that alternative, more rehabilitative approaches hold greater promise in addressing this social challenge.',
        fallbackKeywords: ['custodial sentences', 'curbing', 'criminal activity', 'rehabilitative', 'alternative approaches'],
        explanationVi: "Paraphrase: 'prison sentences' â†’ 'custodial sentences', 'reduce crime' â†’ 'curbing criminal activity', 'better ways' â†’ 'alternative, more rehabilitative approaches'."
      },
      {
        questionId: 'w11t18_q11', level: 'elementary', orderIndex: 11,
        type: 'topic_sentence',
        questionText: 'Body paragraph dÆ°á»›i Ä‘Ă¢y thiáº¿u topic sentence. Chá»n cĂ¢u phĂ¹ há»£p nháº¥t:\n\n"___. Offenders who serve extended sentences are removed from society and deterred from future crimes by the prospect of harsh punishment. Moreover, this sends a clear message to others that criminal behaviour will not be tolerated."',
        options: [
          'Crime rates are very high in many countries today.',
          'There are many ways to address the problem of crime.',
          'Supporters of lengthy imprisonment argue that it effectively protects society and discourages potential offenders.',
          'Prison rehabilitation is not always successful in reducing re-offending.'
        ],
        correctAnswer: 'Supporters of lengthy imprisonment argue that it effectively protects society and discourages potential offenders.',
        explanationVi: 'Topic sentence cáº§n pháº£n Ă¡nh ná»™i dung Ä‘oáº¡n vÄƒn (Ă¡n tĂ¹ dĂ i â†’ báº£o vá»‡ xĂ£ há»™i, rÄƒn Ä‘e). CĂ¢u C giá»›i thiá»‡u chĂ­nh xĂ¡c luáº­n Ä‘iá»ƒm Ä‘Æ°á»£c triá»ƒn khai.'
      },
      {
        questionId: 'w11t18_q12', level: 'intermediate', orderIndex: 12,
        type: 'short_writing',
        questionText: 'Viáº¿t 1 Ä‘oáº¡n body paragraph (~80â€“100 tá»«) láº­p luáº­n ráº±ng cáº£i táº¡o vĂ  tĂ¡i hĂ²a nháº­p xĂ£ há»™i hiá»‡u quáº£ hÆ¡n Ă¡n tĂ¹ dĂ i Ä‘á»ƒ giáº£m tá»™i pháº¡m.\n\nGá»£i Ă½: rehabilitation / vocational training / root causes / reintegrate into society / community service / social support',
        modelAnswer: 'Critics of lengthy imprisonment argue that extended incarceration fails to address the root causes of criminal behaviour, such as poverty, unemployment, and family breakdown. Without tackling these underlying social factors, offenders are likely to re-offend upon release, perpetuating a cycle of crime. A more effective approach involves rehabilitation programs that equip prisoners with vocational training and counseling, enabling them to reintegrate into society as productive members. Countries that have invested in rehabilitative justice, such as Norway, report significantly lower re-offending rates compared to those relying primarily on strict punishment, demonstrating that social support is a more sustainable crime-reduction strategy.',
        fallbackKeywords: ['rehabilitation', 'root causes', 'reintegrate', 'vocational training', 'crime', 'social support'],
        explanationVi: "Cáº¥u trĂºc PEEL: topic sentence (View 2) â†’ explanation (root causes not addressed by prison) â†’ example (Norway) â†’ conclusion. 'Perpetuating a cycle' = duy trĂ¬ vĂ²ng láº·p."
      },
      // â”€â”€ QT-4 Intermediate (W9T8) â”€â”€
      {
        questionId: 'w11t18_q13', level: 'intermediate', orderIndex: 13,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "crime rate"):\n\n"Tá»· lá»‡ tá»™i pháº¡m Ä‘ang tÄƒng nhanh á»Ÿ nhiá»u quá»‘c gia."',
        correctAnswer: 'The crime rate is rising rapidly in many countries.',
        modelAnswer: 'The crime rate is rising rapidly in many countries.',
        fallbackKeywords: ['crime rate', 'rising rapidly', 'countries'],
        explanationVi: "'The crime rate is rising rapidly' = Present Continuous diá»…n táº£ xu hÆ°á»›ng Ä‘ang xáº£y ra. 'Rising' hoáº·c 'increasing' Ä‘á»u Ä‘Æ°á»£c cháº¥p nháº­n."
      },
      {
        questionId: 'w11t18_q14', level: 'intermediate', orderIndex: 14,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "prison sentence" vĂ  "reduce crime"):\n\n"Má»™t sá»‘ ngÆ°á»i cho ráº±ng cĂ¡ch tá»‘t nháº¥t Ä‘á»ƒ giáº£m tá»™i pháº¡m lĂ  Ă¡p dá»¥ng má»©c Ă¡n tĂ¹ dĂ i hÆ¡n."',
        correctAnswer: 'Some people argue that the best way to reduce crime is to impose longer prison sentences.',
        modelAnswer: 'Some people argue that the best way to reduce crime is to impose longer prison sentences.',
        fallbackKeywords: ['prison sentence', 'reduce crime', 'longer', 'impose'],
        explanationVi: "'The best way to + V + is to + V' = cĂ¡ch tá»‘t nháº¥t Ä‘á»ƒ... lĂ ... 'Impose prison sentences' = Ă¡p dá»¥ng/tuyĂªn Ă¡n tĂ¹. 'Longer' = dĂ i hÆ¡n (so sĂ¡nh hÆ¡n)."
      },
      {
        questionId: 'w11t18_q15', level: 'intermediate', orderIndex: 15,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "strict punishment" vĂ  "deterrent"):\n\n"HĂ¬nh pháº¡t nghiĂªm kháº¯c cĂ³ thá»ƒ lĂ  má»™t biá»‡n phĂ¡p rÄƒn Ä‘e máº¡nh máº½."',
        correctAnswer: 'Strict punishment can serve as a powerful deterrent against criminal behaviour.',
        modelAnswer: 'Strict punishment can serve as a powerful deterrent against criminal behaviour.',
        fallbackKeywords: ['strict punishment', 'deterrent', 'powerful'],
        explanationVi: "'Serve as + N' = Ä‘Ă³ng vai trĂ² lĂ /cĂ³ tĂ¡c dá»¥ng nhÆ°. 'A powerful deterrent against' = biá»‡n phĂ¡p rÄƒn Ä‘e máº¡nh máº½ chá»‘ng láº¡i. 'Criminal behaviour' = hĂ nh vi tá»™i pháº¡m."
      },
      {
        questionId: 'w11t18_q16', level: 'intermediate', orderIndex: 16,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "repeat offender" vĂ  "public safety"):\n\n"Nhá»¯ng ngÆ°á»i tĂ¡i pháº¡m cĂ³ thá»ƒ bá»‹ ngÄƒn cáº£n khá»i gĂ¢y háº¡i cho xĂ£ há»™i náº¿u bá»‹ giam lĂ¢u hÆ¡n."',
        correctAnswer: 'Repeat offenders can be prevented from harming society and endangering public safety if imprisoned for longer periods.',
        modelAnswer: 'Repeat offenders can be prevented from harming society and endangering public safety if imprisoned for longer periods.',
        fallbackKeywords: ['repeat offender', 'public safety', 'imprisoned', 'longer'],
        explanationVi: "'Be prevented from + V-ing' = bá»‹ ngÄƒn cáº£n lĂ m gĂ¬. 'Repeat offenders' = nhá»¯ng ngÆ°á»i tĂ¡i pháº¡m. 'Endangering public safety' = gĂ¢y nguy hiá»ƒm cho an toĂ n cá»™ng Ä‘á»“ng."
      },
      {
        questionId: 'w11t18_q17', level: 'intermediate', orderIndex: 17,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "root causes" vĂ  "prison sentence"):\n\n"Máº·t khĂ¡c, nhiá»u ngÆ°á»i tin ráº±ng tÄƒng Ă¡n tĂ¹ khĂ´ng giáº£i quyáº¿t nguyĂªn nhĂ¢n gá»‘c rá»… cá»§a tá»™i pháº¡m."',
        correctAnswer: 'On the other hand, many people believe that longer prison sentences do not address the root causes of crime.',
        modelAnswer: 'On the other hand, many people believe that longer prison sentences do not address the root causes of crime.',
        fallbackKeywords: ['root causes', 'prison sentence', 'do not address'],
        explanationVi: "'On the other hand' = máº·t khĂ¡c (connective Ä‘á»ƒ Ä‘á»‘i láº­p View 2). 'Do not address the root causes of' = khĂ´ng giáº£i quyáº¿t nguyĂªn nhĂ¢n gá»‘c rá»… cá»§a."
      },
      {
        questionId: 'w11t18_q18', level: 'intermediate', orderIndex: 18,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "poverty", "unemployment", vĂ  "commit a crime"):\n\n"NghĂ¨o Ä‘Ă³i vĂ  tháº¥t nghiá»‡p lĂ  nhá»¯ng nguyĂªn nhĂ¢n quan trá»ng dáº«n Ä‘áº¿n tá»™i pháº¡m."',
        correctAnswer: 'Poverty and unemployment are significant underlying causes that drive people to commit a crime.',
        modelAnswer: 'Poverty and unemployment are significant underlying causes that drive people to commit a crime.',
        fallbackKeywords: ['poverty', 'unemployment', 'commit a crime', 'underlying causes'],
        explanationVi: "'Underlying causes' = nguyĂªn nhĂ¢n sĂ¢u xa. 'Drive + O + to + V' = thĂºc Ä‘áº©y ai lĂ m gĂ¬. 'Commit a crime' = pháº¡m tá»™i."
      },
      {
        questionId: 'w11t18_q19', level: 'intermediate', orderIndex: 19,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "rehabilitation" vĂ  "reintegrate into society"):\n\n"CĂ¡c chÆ°Æ¡ng trĂ¬nh cáº£i táº¡o giĂºp tĂ¹ nhĂ¢n hĂ²a nháº­p láº¡i xĂ£ há»™i vĂ  giáº£m tĂ¡i pháº¡m."',
        correctAnswer: 'Rehabilitation programs help prisoners reintegrate into society and reduce the likelihood of re-offending.',
        modelAnswer: 'Rehabilitation programs help prisoners reintegrate into society and reduce the likelihood of re-offending.',
        fallbackKeywords: ['rehabilitation', 'reintegrate into society', 're-offending'],
        explanationVi: "'Help + O + V (bare infinitive)' = giĂºp ai lĂ m gĂ¬. 'Reintegrate into society' = tĂ¡i hĂ²a nháº­p xĂ£ há»™i. 'The likelihood of re-offending' = kháº£ nÄƒng tĂ¡i pháº¡m."
      },
      {
        questionId: 'w11t18_q20', level: 'intermediate', orderIndex: 20,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "community service" vĂ  "alternative punishment"):\n\n"Má»™t sá»‘ ngÆ°á»i tin ráº±ng lao Ä‘á»™ng cĂ´ng Ă­ch lĂ  má»™t hĂ¬nh pháº¡t thay tháº¿ hiá»‡u quáº£."',
        correctAnswer: 'Some people believe that community service is an effective alternative punishment.',
        modelAnswer: 'Some people believe that community service is an effective alternative punishment.',
        fallbackKeywords: ['community service', 'alternative punishment', 'effective'],
        explanationVi: "'An effective alternative punishment' = má»™t hĂ¬nh pháº¡t thay tháº¿ hiá»‡u quáº£. 'Community service' = lao Ä‘á»™ng cĂ´ng Ă­ch/phá»¥c vá»¥ cá»™ng Ä‘á»“ng."
      },
      {
        questionId: 'w11t18_q21', level: 'intermediate', orderIndex: 21,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "law enforcement" vĂ  "prevent crime"):\n\n"Thá»±c thi phĂ¡p luáº­t hiá»‡u quáº£ lĂ  cáº§n thiáº¿t Ä‘á»ƒ ngÄƒn cháº·n tá»™i pháº¡m."',
        correctAnswer: 'Effective law enforcement is essential to prevent crime.',
        modelAnswer: 'Effective law enforcement is essential to prevent crime.',
        fallbackKeywords: ['law enforcement', 'prevent crime', 'essential'],
        explanationVi: "'Is essential to + V' = lĂ  thiáº¿t yáº¿u Ä‘á»ƒ. 'Law enforcement' = thá»±c thi phĂ¡p luáº­t (danh tá»« khĂ´ng Ä‘áº¿m Ä‘Æ°á»£c). 'Effective' Ä‘á»©ng trÆ°á»›c danh tá»«."
      },
      {
        questionId: 'w11t18_q22', level: 'intermediate', orderIndex: 22,
        type: 'translation',
        questionText: 'Dá»‹ch sang tiáº¿ng Anh (dĂ¹ng tá»« "root causes" vĂ  "safer society"):\n\n"Giáº£i quyáº¿t cáº£ nguyĂªn nhĂ¢n gá»‘c rá»… vĂ  háº­u quáº£ cá»§a tá»™i pháº¡m sáº½ giĂºp xĂ£ há»™i an toĂ n hÆ¡n."',
        correctAnswer: 'Addressing both the root causes and consequences of crime will ultimately contribute to a safer society.',
        modelAnswer: 'Addressing both the root causes and consequences of crime will ultimately contribute to a safer society.',
        fallbackKeywords: ['root causes', 'safer society', 'addressing', 'consequences'],
        explanationVi: "'Addressing both A and B' = giáº£i quyáº¿t cáº£ A láº«n B. 'Contribute to a safer society' = gĂ³p pháº§n táº¡o ra xĂ£ há»™i an toĂ n hÆ¡n. 'Ultimately' = cuá»‘i cĂ¹ng."
      }
    ]
  }
];

async function runSeed() {
  const Task2Topic = require('../models/Task2Topic');

  const ops = topics.map(t => ({
    replaceOne: { filter: { topicName: t.topicName }, replacement: t, upsert: true }
  }));

  const result = await Task2Topic.bulkWrite(ops);
  console.log(`[Task2Seed] upserted ${result.upsertedCount}, modified ${result.modifiedCount} Task 2 topics`);
}

// Allow direct execution: node backend/scripts/seedTask2Exercises.js
if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      await runSeed();
      await mongoose.disconnect();
      console.log('[Task2Seed] Done');
    })
    .catch(err => { console.error(err); process.exit(1); });
}

module.exports = { runSeed, topics };
