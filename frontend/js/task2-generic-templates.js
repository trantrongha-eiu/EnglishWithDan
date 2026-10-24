// Generic Task 2 templates for the "Full template" pop-up on task2-template.html.
// Fill-in frames with (placeholders) that work for any topic, copied verbatim
// from the book "IELTS Writing Task 2 Template Bank" (task 2 writing/
// IELTS_Writing_Task2_TemplateBank.docx), Part B, Band 6+ and Band 7+ boxes.
// The practice modes keep using the topic-based sentences from the API;
// only the pop-up reads this file.
// Shape: { band6|band7: { typeId: { name, sections: [{ title, lines: [{ label?, en, vi }] }] } } }
window.TASK2_GENERIC_TEMPLATES = {
 "band6": {
  "type01": {
   "name": "Advantages & Disadvantages",
   "sections": [
    {
     "title": "① Introduction · Mở bài",
     "lines": [
      {
       "en": "In recent years, (general topic) has become increasingly common in many parts of the world.",
       "vi": "Trong những năm gần đây, (chủ đề) ngày càng trở nên phổ biến ở nhiều nơi trên thế giới.",
       "label": "Mở đề"
      },
      {
       "en": "While (topic) offers several benefits, it also has some potential drawbacks.",
       "vi": "Mặc dù (chủ đề) mang lại một số lợi ích, nó cũng có một số hạn chế nhất định.",
       "label": "Paraphrase đề"
      },
      {
       "en": "This essay will discuss the main advantages and disadvantages of (topic).",
       "vi": "Bài viết này sẽ phân tích những ưu điểm và nhược điểm chính của (chủ đề).",
       "label": "Nêu luận điểm"
      }
     ]
    },
    {
     "title": "② Body 1 – Advantages · Ưu điểm",
     "lines": [
      {
       "en": "One of the main advantages of (topic) is that (advantage).",
       "vi": "Một trong những ưu điểm chính của (chủ đề) là..."
      },
      {
       "en": "This is mainly because (explanation).",
       "vi": "Điều này chủ yếu là bởi vì..."
      },
      {
       "en": "As a result, (positive result).",
       "vi": "Kết quả là..."
      },
      {
       "en": "For example, (specific example).",
       "vi": "Ví dụ,..."
      }
     ]
    },
    {
     "title": "③ Body 2 – Disadvantages · Nhược điểm",
     "lines": [
      {
       "en": "However, (topic) also has some disadvantages. One of the main drawbacks is that (disadvantage).",
       "vi": "Tuy nhiên, (chủ đề) cũng có một số hạn chế. Một trong những hạn chế chính là..."
      },
      {
       "en": "This is because (explanation).",
       "vi": "Điều này là bởi vì..."
      },
      {
       "en": "As a result, (negative result).",
       "vi": "Kết quả là..."
      },
      {
       "en": "For instance, (specific example).",
       "vi": "Chẳng hạn,..."
      }
     ]
    },
    {
     "title": "④ Conclusion · Kết bài",
     "lines": [
      {
       "en": "In conclusion, (topic) has both advantages and disadvantages. While it can (main advantage), it may also (main disadvantage). Overall, I believe that the advantages outweigh the disadvantages.",
       "vi": "Tóm lại, (chủ đề) có cả ưu điểm và nhược điểm. Mặc dù nó có thể..., nó cũng có thể... Nhìn chung, tôi cho rằng ưu điểm vượt trội hơn nhược điểm."
      }
     ]
    }
   ]
  },
  "type02": {
   "name": "Discuss Both Views",
   "sections": [
    {
     "title": "① Introduction · Mở bài",
     "lines": [
      {
       "en": "In recent years, (topic) has become a widely discussed issue.",
       "vi": "Trong những năm gần đây, (chủ đề) đã trở thành một vấn đề được thảo luận rộng rãi."
      },
      {
       "en": "While some people believe that (View 1), others argue that (View 2).",
       "vi": "Trong khi một số người cho rằng (quan điểm 1), những người khác lại cho rằng (quan điểm 2)."
      },
      {
       "en": "This essay will discuss both views before explaining why I agree with (View 1 / View 2).",
       "vi": "Bài viết này sẽ thảo luận cả hai quan điểm trước khi giải thích tại sao tôi đồng ý với (quan điểm 1/2)."
      }
     ]
    },
    {
     "title": "② Body 1 – View 1 · Quan điểm 1",
     "lines": [
      {
       "en": "Some people believe that (View 1). One reason for this view is that (main reason).",
       "vi": "Một số người cho rằng... Một lý do cho quan điểm này là..."
      },
      {
       "en": "This is because (explanation). As a result, (result).",
       "vi": "Điều này là bởi vì... Kết quả là..."
      },
      {
       "en": "For example, (specific example).",
       "vi": "Ví dụ,..."
      }
     ]
    },
    {
     "title": "③ Body 2 – View 2 · Quan điểm 2",
     "lines": [
      {
       "en": "On the other hand, others argue that (View 2).",
       "vi": "Mặt khác, những người khác cho rằng..."
      },
      {
       "en": "This is mainly because (explanation). As a result, (result).",
       "vi": "Điều này chủ yếu là bởi vì... Kết quả là..."
      },
      {
       "en": "For instance, (specific example).",
       "vi": "Chẳng hạn,..."
      }
     ]
    },
    {
     "title": "④ Conclusion · Kết bài",
     "lines": [
      {
       "en": "In conclusion, there are valid arguments on both sides of this issue. However, I believe that (your opinion) because (main reason).",
       "vi": "Tóm lại, có những lập luận hợp lý ở cả hai phía. Tuy nhiên, tôi cho rằng... bởi vì..."
      }
     ]
    }
   ]
  },
  "type03": {
   "name": "Cause – Solution",
   "sections": [
    {
     "title": "① Introduction · Mở bài",
     "lines": [
      {
       "en": "In recent years, (problem) has become an increasingly common issue in many parts of the world.",
       "vi": "Trong những năm gần đây, (vấn đề) ngày càng trở thành một vấn đề phổ biến ở nhiều nơi trên thế giới."
      },
      {
       "en": "There are several reasons why this problem has become more widespread.",
       "vi": "Có một số lý do khiến vấn đề này ngày càng trở nên phổ biến."
      },
      {
       "en": "This essay will discuss the main causes of this problem and suggest some possible solutions.",
       "vi": "Bài viết này sẽ phân tích những nguyên nhân chính và đưa ra một số giải pháp khả thi."
      }
     ]
    },
    {
     "title": "② Body 1 – Causes · Nguyên nhân",
     "lines": [
      {
       "en": "There are several reasons why (problem) has become increasingly common.",
       "vi": "Có một số lý do khiến (vấn đề) ngày càng phổ biến."
      },
      {
       "en": "One of the main causes is (cause 1). This is because (explanation). As a result, (negative result).",
       "vi": "Một trong những nguyên nhân chính là... Điều này là bởi vì... Kết quả là..."
      },
      {
       "en": "For example, (specific example).",
       "vi": "Ví dụ,..."
      },
      {
       "en": "Another important cause is (cause 2), which can lead to (negative result).",
       "vi": "Một nguyên nhân quan trọng khác là..., điều này có thể dẫn đến..."
      }
     ]
    },
    {
     "title": "③ Body 2 – Solutions · Giải pháp",
     "lines": [
      {
       "en": "However, there are several ways to address this problem.",
       "vi": "Tuy nhiên, có một số cách để giải quyết vấn đề này."
      },
      {
       "en": "One effective solution is to (solution 1). This would (effect). As a result, (positive result).",
       "vi": "Một giải pháp hiệu quả là... Điều này sẽ... Kết quả là..."
      },
      {
       "en": "Another possible solution is to (solution 2). This could help (positive effect).",
       "vi": "Một giải pháp khả thi khác là... Điều này có thể giúp..."
      }
     ]
    },
    {
     "title": "④ Conclusion · Kết bài",
     "lines": [
      {
       "en": "In conclusion, (problem) is mainly caused by (cause 1) and (cause 2). However, it can be addressed by (solution 1) and (solution 2).",
       "vi": "Tóm lại, (vấn đề) chủ yếu bắt nguồn từ... và... Tuy nhiên, nó có thể được giải quyết bằng... và..."
      }
     ]
    }
   ]
  },
  "type04": {
   "name": "Effect – Solution",
   "sections": [
    {
     "title": "① Introduction · Mở bài",
     "lines": [
      {
       "en": "In recent years, (problem) has become an increasingly common issue in many parts of the world.",
       "vi": "Trong những năm gần đây, (vấn đề) ngày càng phổ biến ở nhiều nơi trên thế giới."
      },
      {
       "en": "This problem can have serious effects on (people / society / the environment).",
       "vi": "Vấn đề này có thể gây ra những ảnh hưởng nghiêm trọng đến..."
      },
      {
       "en": "This essay will discuss the main effects of this problem and suggest some possible solutions.",
       "vi": "Bài viết này sẽ phân tích những hậu quả chính và đưa ra một số giải pháp khả thi."
      }
     ]
    },
    {
     "title": "② Body 1 – Effects · Hậu quả",
     "lines": [
      {
       "en": "There are several negative effects of (problem).",
       "vi": "Có một số hậu quả tiêu cực của (vấn đề)."
      },
      {
       "en": "One of the main effects is (effect 1). This is because (explanation). As a result, (consequence).",
       "vi": "Một trong những hậu quả chính là... Điều này là bởi vì... Kết quả là..."
      },
      {
       "en": "For example, (specific example).",
       "vi": "Ví dụ,..."
      },
      {
       "en": "Another significant effect is (effect 2), which can lead to (consequence).",
       "vi": "Một hậu quả đáng kể khác là..., điều này có thể dẫn đến..."
      }
     ]
    },
    {
     "title": "③ Body 2 – Solutions · Giải pháp",
     "lines": [
      {
       "en": "However, there are several ways to reduce the negative effects of this problem.",
       "vi": "Tuy nhiên, có một số cách để giảm những ảnh hưởng tiêu cực của vấn đề này."
      },
      {
       "en": "One effective solution is to (solution 1). This could help (positive effect). As a result, (positive result).",
       "vi": "Một giải pháp hiệu quả là... Điều này có thể giúp... Kết quả là..."
      },
      {
       "en": "Another possible solution is to (solution 2). This would help (positive effect).",
       "vi": "Một giải pháp khả thi khác là... Điều này sẽ giúp..."
      }
     ]
    },
    {
     "title": "④ Conclusion · Kết bài",
     "lines": [
      {
       "en": "In conclusion, (problem) can have serious effects on (people / society / the environment). However, these effects can be reduced by (solution 1) and (solution 2).",
       "vi": "Tóm lại, (vấn đề) có thể gây ra những hậu quả nghiêm trọng đối với... Tuy nhiên, những hậu quả này có thể được giảm thiểu bằng cách..."
      }
     ]
    }
   ]
  },
  "type05": {
   "name": "Cause – Effect",
   "sections": [
    {
     "title": "① Introduction · Mở bài",
     "lines": [
      {
       "en": "In recent years, (problem) has become an increasingly common issue in many parts of the world.",
       "vi": "Trong những năm gần đây, (vấn đề) ngày càng phổ biến ở nhiều nơi trên thế giới."
      },
      {
       "en": "This issue can be caused by several factors and can have a range of effects on (people / society / the environment).",
       "vi": "Vấn đề này có thể xuất phát từ nhiều yếu tố và gây ra nhiều ảnh hưởng đối với..."
      },
      {
       "en": "This essay will discuss the main causes of this problem and examine its effects.",
       "vi": "Bài viết này sẽ phân tích những nguyên nhân chính và xem xét những hậu quả của nó."
      }
     ]
    },
    {
     "title": "② Body 1 – Causes · Nguyên nhân",
     "lines": [
      {
       "en": "There are several reasons why (problem) has become increasingly common.",
       "vi": "Có một số lý do khiến (vấn đề) ngày càng phổ biến."
      },
      {
       "en": "One of the main causes is (cause 1). This is because (explanation). As a result, (effect).",
       "vi": "Một trong những nguyên nhân chính là... Điều này là bởi vì... Kết quả là..."
      },
      {
       "en": "For example, (specific example).",
       "vi": "Ví dụ,..."
      },
      {
       "en": "Another important cause is (cause 2), which can also contribute to (effect).",
       "vi": "Một nguyên nhân quan trọng khác là..., điều này cũng có thể góp phần dẫn đến..."
      }
     ]
    },
    {
     "title": "③ Body 2 – Effects · Hậu quả",
     "lines": [
      {
       "en": "This problem can have several negative effects on (people / society / the environment).",
       "vi": "Vấn đề này có thể gây ra một số ảnh hưởng tiêu cực đối với..."
      },
      {
       "en": "One of the main effects is (effect 1). This is because (explanation). As a result, (further consequence).",
       "vi": "Một trong những hậu quả chính là... Điều này là bởi vì... Kết quả là..."
      },
      {
       "en": "For instance, (specific example).",
       "vi": "Chẳng hạn,..."
      },
      {
       "en": "Another significant effect is (effect 2), which can lead to (further consequence).",
       "vi": "Một hậu quả đáng kể khác là..., điều này có thể dẫn đến..."
      }
     ]
    },
    {
     "title": "④ Conclusion · Kết bài",
     "lines": [
      {
       "en": "In conclusion, (problem) is mainly caused by (cause 1) and (cause 2). It can also lead to (effect 1) and (effect 2).",
       "vi": "Tóm lại, (vấn đề) chủ yếu bắt nguồn từ... và... Nó cũng có thể dẫn đến... và..."
      },
      {
       "en": "Overall, this is a serious issue that can have long-term effects on (people / society).",
       "vi": "Nhìn chung, đây là một vấn đề nghiêm trọng có thể gây ảnh hưởng lâu dài đối với..."
      }
     ]
    }
   ]
  },
  "type06": {
   "name": "Agree / Disagree & Partially Agree",
   "sections": [
    {
     "title": "① Introduction · Mở bài",
     "lines": [
      {
       "en": "In recent years, (topic) has become a widely discussed issue. There are different views on whether (paraphrased question). I completely agree / disagree with this view because (reason 1) and (reason 2).",
       "vi": "Trong những năm gần đây, (chủ đề) đã trở thành vấn đề được thảo luận rộng rãi. Có nhiều quan điểm khác nhau về việc liệu... Tôi hoàn toàn đồng ý / không đồng ý với quan điểm này vì... và...",
       "label": "Đồng ý / Không đồng ý hoàn toàn"
      },
      {
       "en": "In recent years, (topic) has become a widely discussed issue. While I agree that (one side), I believe that (your main position).",
       "vi": "Trong những năm gần đây, (chủ đề) đã trở thành vấn đề được thảo luận rộng rãi. Mặc dù tôi đồng ý rằng..., tôi cho rằng...",
       "label": "Đồng ý một phần"
      }
     ]
    },
    {
     "title": "② Body 1 – Reason 1 · Lý do 1",
     "lines": [
      {
       "en": "One of the main reasons why I agree / disagree with this view is that (reason 1).",
       "vi": "Một trong những lý do chính khiến tôi đồng ý / không đồng ý là..."
      },
      {
       "en": "This is because (explanation). As a result, (result).",
       "vi": "Điều này là bởi vì... Kết quả là..."
      },
      {
       "en": "For example, (specific example).",
       "vi": "Ví dụ,..."
      }
     ]
    },
    {
     "title": "③ Body 2 – Reason 2 · Lý do 2",
     "lines": [
      {
       "en": "Another important reason is that (reason 2).",
       "vi": "Một lý do quan trọng khác là..."
      },
      {
       "en": "This is mainly because (explanation). As a result, (result).",
       "vi": "Điều này chủ yếu là bởi vì... Kết quả là..."
      },
      {
       "en": "For instance, (specific example).",
       "vi": "Chẳng hạn,..."
      }
     ]
    },
    {
     "title": "④ Conclusion · Kết bài",
     "lines": [
      {
       "en": "In conclusion, I agree / disagree that (your position) because (reason 1) and (reason 2).",
       "vi": "Tóm lại, tôi đồng ý / không đồng ý rằng... bởi vì... và..."
      },
      {
       "en": "Partially agree: In conclusion, while (one side) has some benefits, I believe that (your main position).",
       "vi": "Đồng ý một phần: Tóm lại, mặc dù... có một số lợi ích, tôi cho rằng..."
      }
     ]
    }
   ]
  },
  "type07": {
   "name": "Positive or Negative Development",
   "sections": [
    {
     "title": "① Introduction · Mở bài",
     "lines": [
      {
       "en": "In recent years, (trend) has become increasingly common in many parts of the world.",
       "vi": "Trong những năm gần đây, (xu hướng) ngày càng trở nên phổ biến ở nhiều nơi trên thế giới."
      },
      {
       "en": "This development has had a noticeable impact on (people / society / the environment).",
       "vi": "Sự phát triển này đã có ảnh hưởng đáng kể đến..."
      },
      {
       "en": "In my view, this is a positive / negative development because (reason 1) and (reason 2).",
       "vi": "Theo quan điểm của tôi, đây là một sự phát triển tích cực / tiêu cực bởi vì... và..."
      }
     ]
    },
    {
     "title": "② Body 1 – Two reasons · Hai lý do",
     "lines": [
      {
       "en": "There are several reasons why I believe this is a positive / negative development.",
       "vi": "Có một số lý do khiến tôi cho rằng đây là một sự phát triển tích cực / tiêu cực."
      },
      {
       "en": "One of the main reasons is that (reason 1). This is because (explanation). As a result, (result).",
       "vi": "Một trong những lý do chính là... Điều này là bởi vì... Kết quả là..."
      },
      {
       "en": "For example, (specific example).",
       "vi": "Ví dụ,..."
      },
      {
       "en": "Another important reason is that (reason 2). This can lead to (positive / negative result).",
       "vi": "Một lý do quan trọng khác là... Điều này có thể dẫn đến..."
      }
     ]
    },
    {
     "title": "③ Body 2 – Acknowledge & reinforce · Thừa nhận & củng cố",
     "lines": [
      {
       "en": "Admittedly, (trend) can also have some disadvantages.",
       "vi": "Phải thừa nhận rằng (xu hướng) cũng có một số hạn chế."
      },
      {
       "en": "This is mainly because (explanation). As a result, (negative result).",
       "vi": "Điều này chủ yếu là bởi vì... Kết quả là..."
      },
      {
       "en": "However, I believe that these disadvantages are outweighed by the benefits of (trend).",
       "vi": "Tuy nhiên, tôi cho rằng những hạn chế này vẫn bị vượt qua bởi những lợi ích của..."
      },
      {
       "en": "However, I believe that these benefits do not outweigh the negative effects of (trend).",
       "vi": "Tuy nhiên, tôi cho rằng những lợi ích này không thể vượt qua những tác động tiêu cực của...",
       "label": "Nếu bài của bạn là NEGATIVE"
      }
     ]
    },
    {
     "title": "④ Conclusion · Kết bài",
     "lines": [
      {
       "en": "In conclusion, I believe that (trend) is a positive / negative development because of its effects on (aspect 1) and (aspect 2).",
       "vi": "Tóm lại, tôi cho rằng (xu hướng) là một sự phát triển tích cực / tiêu cực bởi những ảnh hưởng của nó đến... và..."
      },
      {
       "en": "Overall, the benefits / negative effects of this trend are likely to remain significant in the future.",
       "vi": "Nhìn chung, những lợi ích / tác động tiêu cực của xu hướng này có khả năng vẫn đáng kể trong tương lai."
      }
     ]
    }
   ]
  }
 },
 "band7": {
  "type01": {
   "name": "Advantages & Disadvantages",
   "sections": [
    {
     "title": "① Introduction · Mở bài",
     "lines": [
      {
       "en": "In recent years, (topic) has become an increasingly prominent feature of modern life, attracting considerable public attention.",
       "vi": "Trong những năm gần đây, (chủ đề) đã trở thành một phần ngày càng nổi bật của đời sống hiện đại và thu hút nhiều sự chú ý."
      },
      {
       "en": "With its growing prevalence, questions have arisen regarding its overall impact.",
       "vi": "Khi nó ngày càng phổ biến, nhiều câu hỏi đã được đặt ra về tác động tổng thể của nó."
      },
      {
       "en": "This essay will examine both the advantages and disadvantages of (topic).",
       "vi": "Bài luận này sẽ phân tích cả ưu điểm và nhược điểm của (chủ đề)."
      }
     ]
    },
    {
     "title": "② Body 1 – Advantages · Ưu điểm",
     "lines": [
      {
       "en": "One of the most significant advantages of (topic) is that (advantage).",
       "vi": "Một trong những lợi ích quan trọng nhất của (chủ đề) là..."
      },
      {
       "en": "To begin with, it enables individuals to (verb), thereby improving (noun phrase).",
       "vi": "Trước hết, nó cho phép con người..., từ đó cải thiện..."
      },
      {
       "en": "In addition, the adoption of (topic) can contribute to (noun phrase), which plays a crucial role in (verb-ing).",
       "vi": "Thêm vào đó, việc áp dụng (chủ đề) có thể góp phần vào..., điều này đóng vai trò quan trọng trong việc..."
      },
      {
       "en": "A clear illustration of this can be seen in (example), where (positive outcome) occurred.",
       "vi": "Một minh chứng rõ ràng có thể thấy ở..., nơi... đã xảy ra."
      }
     ]
    },
    {
     "title": "③ Body 2 – Disadvantages · Nhược điểm",
     "lines": [
      {
       "en": "Despite its advantages, (topic) is not without its limitations.",
       "vi": "Mặc dù có nhiều lợi ích, (chủ đề) không phải là không có hạn chế."
      },
      {
       "en": "One major concern is that (clause), which may lead to (negative consequence).",
       "vi": "Một mối lo ngại lớn là..., điều này có thể dẫn đến..."
      },
      {
       "en": "Additionally, an over-reliance on (topic) could result in (noun phrase), thereby undermining (noun phrase).",
       "vi": "Thêm vào đó, sự phụ thuộc quá mức vào (chủ đề) có thể dẫn đến..., từ đó làm suy yếu..."
      },
      {
       "en": "For instance, (specific example).",
       "vi": "Chẳng hạn,..."
      }
     ]
    },
    {
     "title": "④ Conclusion · Kết bài",
     "lines": [
      {
       "en": "In conclusion, although (topic) offers clear benefits such as (advantage 1) and (advantage 2), it also entails notable disadvantages, including (disadvantage 1) and (disadvantage 2).",
       "vi": "Tóm lại, mặc dù (chủ đề) mang lại những lợi ích rõ ràng như... và..., nó cũng tồn tại những hạn chế đáng kể như... và..."
      },
      {
       "en": "On balance, it can be argued that the advantages outweigh the drawbacks, provided that (condition).",
       "vi": "Xét tổng thể, có thể lập luận rằng lợi ích vượt trội hơn hạn chế, với điều kiện là..."
      }
     ]
    }
   ]
  },
  "type02": {
   "name": "Discuss Both Views",
   "sections": [
    {
     "title": "① Introduction · Mở bài",
     "lines": [
      {
       "en": "In recent decades, the issue of (topic) has attracted increasing public attention.",
       "vi": "Trong vài thập kỷ gần đây, vấn đề (chủ đề) đã thu hút sự quan tâm ngày càng lớn của công chúng."
      },
      {
       "en": "While some people argue that (View 1), others believe that (View 2).",
       "vi": "Trong khi một số người cho rằng..., những người khác lại tin rằng..."
      },
      {
       "en": "This essay will discuss both perspectives before explaining why I side with (View 1 / View 2).",
       "vi": "Bài viết này sẽ thảo luận cả hai quan điểm trước khi giải thích vì sao tôi nghiêng về..."
      }
     ]
    },
    {
     "title": "② Body 1 – View 1 · Quan điểm 1",
     "lines": [
      {
       "en": "There are several convincing reasons why some people support (noun / gerund).",
       "vi": "Có nhiều lý do thuyết phục khiến một số người ủng hộ..."
      },
      {
       "en": "One major reason for this view is that (clause). This is largely because (reason). As a result, (consequence).",
       "vi": "Một lý do chính cho quan điểm này là... Điều này chủ yếu là do... Kết quả là..."
      },
      {
       "en": "Unlike in the past, when (past situation), nowadays (current trend).",
       "vi": "Không giống như trước đây, khi..., ngày nay..."
      },
      {
       "en": "For instance, (example). This suggests that (implication).",
       "vi": "Ví dụ,... Điều này cho thấy rằng..."
      }
     ]
    },
    {
     "title": "③ Body 2 – View 2 · Quan điểm 2",
     "lines": [
      {
       "en": "On the other hand, critics argue that (clause).",
       "vi": "Mặt khác, những người phản đối cho rằng..."
      },
      {
       "en": "One key concern is that (clause). This may lead to (negative consequence).",
       "vi": "Một mối lo ngại chính là... Điều này có thể dẫn đến..."
      },
      {
       "en": "For example, in many cases (real example). This highlights the potential risks associated with (noun / gerund).",
       "vi": "Ví dụ, trong nhiều trường hợp... Điều này làm nổi bật những rủi ro tiềm ẩn liên quan đến..."
      }
     ]
    },
    {
     "title": "④ Conclusion · Kết bài",
     "lines": [
      {
       "en": "In conclusion, both perspectives offer valid arguments regarding (noun / gerund).",
       "vi": "Tóm lại, cả hai quan điểm đều đưa ra những lập luận hợp lý về..."
      },
      {
       "en": "Personally, I believe that (stance) because (main reason). Moving forward, policymakers should consider (action) to address these concerns.",
       "vi": "Cá nhân tôi tin rằng... vì... Trong tương lai, các nhà hoạch định chính sách nên xem xét... để giải quyết những vấn đề này."
      }
     ]
    }
   ]
  },
  "type03": {
   "name": "Cause – Solution",
   "sections": [
    {
     "title": "① Introduction · Mở bài",
     "lines": [
      {
       "en": "In recent years, (problem) has become an increasingly serious concern in many parts of the world.",
       "vi": "Trong những năm gần đây, (vấn đề) đã trở thành một mối lo ngại ngày càng nghiêm trọng ở nhiều nơi."
      },
      {
       "en": "This essay will explore the main causes of (problem) and propose practical solutions to address it.",
       "vi": "Bài viết này sẽ phân tích các nguyên nhân chính và đề xuất những giải pháp thiết thực."
      }
     ]
    },
    {
     "title": "② Body 1 – Causes · Nguyên nhân",
     "lines": [
      {
       "en": "There are several underlying factors contributing to (problem).",
       "vi": "Có nhiều yếu tố cơ bản góp phần gây ra (vấn đề)."
      },
      {
       "en": "One of the primary reasons behind this problem is (cause 1). This can largely be attributed to (noun phrase). For instance, (example). This suggests that (implication).",
       "vi": "Một trong những nguyên nhân chính là... Điều này phần lớn bắt nguồn từ... Ví dụ,... Điều này cho thấy rằng..."
      },
      {
       "en": "Another significant contributor is (cause 2). Unlike in the past, when (past situation), today (current trend). If this trend continues, it could lead to (negative consequence).",
       "vi": "Một yếu tố quan trọng khác là... Không giống như trước đây, khi..., ngày nay... Nếu xu hướng này tiếp diễn, nó có thể dẫn đến..."
      }
     ]
    },
    {
     "title": "③ Body 2 – Solutions · Giải pháp",
     "lines": [
      {
       "en": "Nevertheless, several practical measures can be taken to address this issue effectively.",
       "vi": "Tuy nhiên, có thể thực hiện một số biện pháp thiết thực để giải quyết vấn đề này hiệu quả."
      },
      {
       "en": "One effective way to tackle this problem is to (verb). This would ensure that (mechanism), ultimately leading to (positive outcome). Not only would this help (effect 1), but it would also (effect 2).",
       "vi": "Một cách hiệu quả là... Điều này sẽ đảm bảo rằng..., cuối cùng dẫn đến... Giải pháp này không chỉ giúp... mà còn..."
      },
      {
       "en": "Another viable approach involves (verb-ing). If widely implemented, this measure could serve as a long-term solution to (issue).",
       "vi": "Một cách tiếp cận khả thi khác là... Nếu được triển khai rộng rãi, biện pháp này có thể trở thành giải pháp lâu dài cho..."
      }
     ]
    },
    {
     "title": "④ Conclusion · Kết bài",
     "lines": [
      {
       "en": "In conclusion, (problem) remains a complex issue that requires immediate and coordinated action.",
       "vi": "Kết luận lại, (vấn đề) vẫn là một vấn đề phức tạp cần hành động khẩn cấp và đồng bộ."
      },
      {
       "en": "Among the various measures discussed, I believe that (solution) would prove the most effective in the long term.",
       "vi": "Trong các giải pháp đã nêu, tôi tin rằng... sẽ hiệu quả nhất trong dài hạn."
      }
     ]
    }
   ]
  },
  "type04": {
   "name": "Effect – Solution",
   "sections": [
    {
     "title": "① Introduction · Mở bài",
     "lines": [
      {
       "en": "One of the most serious challenges facing modern society today is (problem).",
       "vi": "Một trong những thách thức nghiêm trọng nhất mà xã hội hiện đại đang đối mặt là..."
      },
      {
       "en": "This issue has given rise to a range of significant consequences, and if left unaddressed, it may lead to even more serious long-term implications.",
       "vi": "Vấn đề này đã gây ra nhiều hậu quả đáng kể, và nếu không được giải quyết, nó có thể dẫn đến những hệ quả nghiêm trọng hơn trong dài hạn."
      },
      {
       "en": "This essay will examine the major effects of (problem) and suggest practical solutions to mitigate its impact.",
       "vi": "Bài viết này sẽ phân tích những tác động chính và đề xuất các giải pháp thực tế để giảm thiểu ảnh hưởng của nó."
      }
     ]
    },
    {
     "title": "② Body 1 – Effects · Hậu quả",
     "lines": [
      {
       "en": "Two particularly alarming effects of this issue are (effect 1) and (effect 2).",
       "vi": "Hai hậu quả đáng lo ngại nhất của vấn đề này là... và..."
      },
      {
       "en": "To begin with, (effect 1) is a major concern. This is largely because (explanation). If this situation continues, it may lead to (long-term consequence).",
       "vi": "Trước hết,... là một mối lo ngại lớn. Điều này chủ yếu là do... Nếu tình trạng này tiếp diễn, nó có thể dẫn đến..."
      },
      {
       "en": "Another significant impact is (effect 2). As a result, (consequence). Over time, this can place considerable pressure on (group / system / society).",
       "vi": "Một tác động đáng kể khác là... Do đó,... Theo thời gian, điều này có thể tạo áp lực lớn lên..."
      }
     ]
    },
    {
     "title": "③ Body 2 – Solutions · Giải pháp",
     "lines": [
      {
       "en": "Despite these challenges, several effective measures can be taken to address the issue.",
       "vi": "Mặc dù có những thách thức này, vẫn có thể thực hiện một số biện pháp hiệu quả."
      },
      {
       "en": "The most practical solution is to (verb). This approach would not only (benefit 1) but also (benefit 2).",
       "vi": "Giải pháp thiết thực nhất là... Cách tiếp cận này không chỉ giúp... mà còn..."
      },
      {
       "en": "Another viable strategy is to (verb). If implemented on a large scale, this measure could bring about long-term improvements.",
       "vi": "Một chiến lược khả thi khác là... Nếu được triển khai trên diện rộng, biện pháp này có thể mang lại cải thiện lâu dài."
      }
     ]
    },
    {
     "title": "④ Conclusion · Kết bài",
     "lines": [
      {
       "en": "In conclusion, (problem) continues to pose serious challenges. While its effects are undeniable, they can be addressed through coordinated efforts.",
       "vi": "Tóm lại, (vấn đề) vẫn gây ra những thách thức nghiêm trọng. Mặc dù tác động là không thể phủ nhận, chúng có thể được giải quyết thông qua sự phối hợp đồng bộ."
      },
      {
       "en": "In my opinion, tackling this problem requires both (solution 1) and (solution 2) in order to achieve sustainable results.",
       "vi": "Theo tôi, việc giải quyết vấn đề này đòi hỏi cả... và... để đạt được kết quả bền vững."
      }
     ]
    }
   ]
  },
  "type05": {
   "name": "Cause – Effect",
   "sections": [
    {
     "title": "① Introduction · Mở bài",
     "lines": [
      {
       "en": "In today’s fast-changing world, (problem) has become an increasingly significant concern.",
       "vi": "Trong thế giới thay đổi nhanh chóng ngày nay, (vấn đề) đang trở thành mối quan tâm ngày càng lớn."
      },
      {
       "en": "This essay will examine the underlying causes of (problem) and analyse its significant effects on society.",
       "vi": "Bài luận này sẽ xem xét các nguyên nhân sâu xa và phân tích những tác động đáng kể của nó đối với xã hội."
      }
     ]
    },
    {
     "title": "② Body 1 – Causes · Nguyên nhân",
     "lines": [
      {
       "en": "The causes of (problem) are both complex and multifaceted.",
       "vi": "Nguyên nhân của (vấn đề) vừa phức tạp vừa đa chiều."
      },
      {
       "en": "One primary factor is (cause 1), which contributes significantly to this issue. It is widely acknowledged that (clause), making it a central driver of this trend.",
       "vi": "Một yếu tố chính là..., điều này góp phần đáng kể vào vấn đề. Nhiều người thừa nhận rằng..., khiến nó trở thành động lực chính của xu hướng này."
      },
      {
       "en": "For example, (specific example) clearly demonstrates how this cause leads to wider consequences.",
       "vi": "Ví dụ,... cho thấy rõ cách nguyên nhân này dẫn đến hậu quả rộng hơn."
      },
      {
       "en": "Not only does (cause) trigger (effect), but it also creates a ripple effect across society.",
       "vi": "(Nguyên nhân) không chỉ gây ra... mà còn tạo hiệu ứng lan tỏa trong xã hội."
      }
     ]
    },
    {
     "title": "③ Body 2 – Effects · Hậu quả",
     "lines": [
      {
       "en": "The effects of (problem) are both immediate and long-term.",
       "vi": "Tác động của (vấn đề) vừa mang tính tức thời vừa lâu dài."
      },
      {
       "en": "One significant consequence is (effect 1). Research has consistently shown that (clause).",
       "vi": "Một hậu quả đáng kể là... Nghiên cứu đã liên tục chỉ ra rằng..."
      },
      {
       "en": "Furthermore, this phenomenon inevitably leads to (noun phrase). More alarmingly, the long-term implications may include (serious effect).",
       "vi": "Hơn nữa, hiện tượng này tất yếu dẫn đến... Đáng lo ngại hơn, tác động lâu dài có thể bao gồm..."
      },
      {
       "en": "Over time, these effects may accumulate, placing substantial pressure on (group / society).",
       "vi": "Theo thời gian, những tác động này có thể tích tụ và gây áp lực lớn lên..."
      }
     ]
    },
    {
     "title": "④ Conclusion · Kết bài",
     "lines": [
      {
       "en": "In conclusion, (problem) stems from a range of interconnected factors and results in significant consequences.",
       "vi": "Tóm lại, (vấn đề) bắt nguồn từ nhiều yếu tố liên quan lẫn nhau và gây ra hậu quả đáng kể."
      },
      {
       "en": "Overall, this remains a serious concern that warrants careful consideration from both individuals and policymakers.",
       "vi": "Nhìn chung, đây vẫn là một vấn đề nghiêm trọng cần được cả cá nhân lẫn nhà hoạch định chính sách xem xét kỹ lưỡng."
      }
     ]
    }
   ]
  },
  "type06": {
   "name": "Agree / Disagree & Partially Agree",
   "sections": [
    {
     "title": "① Introduction · Mở bài",
     "lines": [
      {
       "en": "The issue of (topic) has become a subject of considerable debate in recent years.",
       "vi": "Vấn đề về (chủ đề) đã trở thành một chủ đề gây tranh luận đáng kể trong những năm gần đây."
      },
      {
       "en": "This essay will argue that (your position), owing to its significant influence on (aspect 1) and (aspect 2).",
       "vi": "Bài luận này sẽ lập luận rằng... do ảnh hưởng đáng kể của nó đến... và...",
       "label": "Lập trường — hoàn toàn đồng ý / không đồng ý"
      },
      {
       "en": "Although there are valid arguments supporting (opposing view), I contend that (your main stance) outweighs these considerations.",
       "vi": "Mặc dù có những lập luận hợp lý ủng hộ..., tôi cho rằng... vượt trội hơn những cân nhắc đó.",
       "label": "Lập trường — đồng ý một phần"
      }
     ]
    },
    {
     "title": "② Body 1 & 2 – Reasons · Lý do",
     "lines": [
      {
       "en": "One compelling reason why (your position) is that (reason).",
       "vi": "Một lý do thuyết phục khiến... là..."
      },
      {
       "en": "It is undeniable that (key point) plays a crucial role in (related aspect).",
       "vi": "Không thể phủ nhận rằng... đóng vai trò quan trọng trong..."
      },
      {
       "en": "This can be attributed to the fact that (explanation). For instance, (specific example), which clearly illustrates that (analysis).",
       "vi": "Điều này có thể là do... Ví dụ,..., điều này minh chứng rõ ràng rằng..."
      },
      {
       "en": "Research has consistently shown that (finding), thereby reinforcing the view that (argument).",
       "vi": "Nghiên cứu đã liên tục chỉ ra rằng..., từ đó củng cố quan điểm rằng..."
      },
      {
       "en": "While some may argue that (opposing view), this perspective fails to take into account that (counterargument).",
       "vi": "Mặc dù một số người có thể cho rằng..., quan điểm này bỏ qua việc...",
       "label": "Câu phản biện — dùng khi nhắm Band 7.5+"
      },
      {
       "en": "Admittedly, (concession); nevertheless, the overall impact remains predominantly positive / negative.",
       "vi": "Thừa nhận rằng...; tuy nhiên, tác động tổng thể vẫn chủ yếu là tích cực / tiêu cực."
      }
     ]
    },
    {
     "title": "③ Conclusion · Kết bài",
     "lines": [
      {
       "en": "In conclusion, having examined the arguments presented, I maintain that (restate position).",
       "vi": "Tóm lại, sau khi xem xét các lập luận đã trình bày, tôi giữ quan điểm rằng..."
      },
      {
       "en": "Ultimately, striking a balance between (aspect 1) and (aspect 2) may represent the most pragmatic approach.",
       "vi": "Cuối cùng, tìm được sự cân bằng giữa... và... có thể là cách tiếp cận thực tế nhất."
      }
     ]
    }
   ]
  },
  "type07": {
   "name": "Positive or Negative Development",
   "sections": [
    {
     "title": "① Introduction · Mở bài",
     "lines": [
      {
       "en": "Over the past two decades, (trend) has gained considerable momentum across much of the world.",
       "vi": "Trong hai thập kỷ qua, (xu hướng) đã phát triển mạnh mẽ ở phần lớn thế giới."
      },
      {
       "en": "This shift has had a profound influence on the way people (verb).",
       "vi": "Sự thay đổi này đã ảnh hưởng sâu sắc đến cách con người..."
      },
      {
       "en": "In my view, this constitutes a largely positive / negative development, primarily because of its impact on (aspect 1) and (aspect 2).",
       "vi": "Theo quan điểm của tôi, đây là một sự phát triển chủ yếu mang tính tích cực / tiêu cực, chủ yếu vì tác động của nó đến... và..."
      }
     ]
    },
    {
     "title": "② Body 1 – Two reasons · Hai lý do",
     "lines": [
      {
       "en": "The most compelling reason for regarding this trend as positive / negative lies in (reason 1).",
       "vi": "Lý do thuyết phục nhất để coi xu hướng này là tích cực / tiêu cực nằm ở..."
      },
      {
       "en": "This is largely because (explanation). Consequently, (result), thereby (verb-ing) (further outcome).",
       "vi": "Điều này chủ yếu là do... Do đó,..., từ đó..."
      },
      {
       "en": "A clear illustration of this can be seen in (specific example).",
       "vi": "Một minh chứng rõ ràng có thể thấy ở..."
      },
      {
       "en": "A further consideration is (reason 2), which has the potential to (result) in the long term.",
       "vi": "Một yếu tố nữa cần cân nhắc là..., điều này có khả năng... trong dài hạn."
      }
     ]
    },
    {
     "title": "③ Body 2 – Acknowledge & reinforce · Thừa nhận & củng cố",
     "lines": [
      {
       "en": "Admittedly, this trend is not without its drawbacks. It is often argued that (opposing point).",
       "vi": "Phải thừa nhận rằng xu hướng này không phải không có hạn chế. Nhiều người cho rằng..."
      },
      {
       "en": "This concern stems from the fact that (explanation). As a result, (negative outcome).",
       "vi": "Mối lo ngại này bắt nguồn từ việc... Kết quả là..."
      },
      {
       "en": "Nevertheless, such drawbacks are largely outweighed by the benefits outlined above, particularly when (condition).",
       "vi": "Tuy nhiên, những hạn chế đó phần lớn bị vượt qua bởi những lợi ích đã nêu, đặc biệt khi..."
      },
      {
       "en": "Nevertheless, these benefits do little to offset the more fundamental harm caused by (trend).",
       "vi": "Tuy nhiên, những lợi ích này không bù đắp được tác hại căn bản hơn do (xu hướng) gây ra.",
       "label": "Nếu bài của bạn là NEGATIVE"
      }
     ]
    },
    {
     "title": "④ Conclusion · Kết bài",
     "lines": [
      {
       "en": "In conclusion, having weighed both sides, I maintain that (trend) represents a largely positive / negative development, chiefly because of its influence on (aspect 1) and (aspect 2).",
       "vi": "Tóm lại, sau khi cân nhắc cả hai mặt, tôi giữ quan điểm rằng (xu hướng) là một sự phát triển chủ yếu tích cực / tiêu cực, chủ yếu vì ảnh hưởng của nó đến..."
      },
      {
       "en": "Provided that (condition), its benefits are likely to become even more pronounced in the years ahead.",
       "vi": "Với điều kiện là..., những lợi ích của nó có khả năng còn rõ rệt hơn trong những năm tới."
      }
     ]
    }
   ]
  }
 }
};
